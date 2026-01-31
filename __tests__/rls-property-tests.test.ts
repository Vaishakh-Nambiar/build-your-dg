/**
 * Property-Based Tests for Row Level Security (RLS) Policies
 * 
 * These tests use property-based testing to verify universal correctness properties
 * for data access control across all valid executions of the system.
 * 
 * Requirements: 2.5, 9.1
 */

import * as fc from 'fast-check'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase'

// Test configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

// Custom generators for domain objects
const userGenerator = () => fc.record({
  email: fc.emailAddress(),
  password: fc.string({ minLength: 8, maxLength: 20 }),
  displayName: fc.option(fc.string({ minLength: 1, maxLength: 50 }))
})

const gardenGenerator = () => fc.record({
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.option(fc.string({ maxLength: 500 })),
  tiles: fc.array(fc.record({
    id: fc.uuid(),
    type: fc.constantFrom('text', 'image', 'project', 'writing'),
    content: fc.string({ maxLength: 1000 })
  })),
  layout: fc.record({
    grid: fc.constantFrom('1x1', '2x2', '3x3', '4x4')
  }),
  isPublic: fc.boolean(),
  slug: fc.option(fc.string({ minLength: 3, maxLength: 50 }))
})

const mediaAssetGenerator = () => fc.record({
  fileName: fc.string({ minLength: 1, maxLength: 100 }),
  fileType: fc.constantFrom('image/jpeg', 'image/png', 'image/gif', 'video/mp4'),
  fileSize: fc.integer({ min: 1, max: 50 * 1024 * 1024 }), // Up to 50MB
  altText: fc.option(fc.string({ maxLength: 200 }))
})

interface TestUser {
  id: string
  email: string
  password: string
  client: SupabaseClient<Database>
}

describe('Property-Based Tests: RLS Data Access Control', () => {
  let testUsers: TestUser[] = []
  let anonymousClient: SupabaseClient<Database>

  beforeAll(async () => {
    anonymousClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
  })

  afterAll(async () => {
    // Clean up all test users
    for (const user of testUsers) {
      await user.client.auth.signOut()
    }
  })

  async function createTestUser(userData: any): Promise<TestUser> {
    const client = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    const { data: authData, error } = await client.auth.signUp({
      email: userData.email,
      password: userData.password
    })

    if (error || !authData.user) {
      throw new Error(`Failed to create test user: ${error?.message}`)
    }

    const testUser: TestUser = {
      id: authData.user.id,
      email: userData.email,
      password: userData.password,
      client
    }

    testUsers.push(testUser)
    
    // Wait for user profile to be created by trigger
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return testUser
  }

  async function cleanupTestData() {
    // Clean up test data for all users
    for (const user of testUsers) {
      await user.client.from('media_assets').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await user.client.from('garden_views').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await user.client.from('gardens').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    }
  }

  describe('Property 1: Data Access Control', () => {
    /**
     * **Feature: digital-garden-backend-integration, Property 1: Data Access Control**
     * 
     * For any user and any database query, users should only be able to access 
     * their own private data or publicly available data, never other users' private data
     * 
     * **Validates: Requirements 2.5, 9.1**
     */
    it('should enforce data access control for all user operations', async () => {
      await fc.assert(fc.asyncProperty(
        fc.tuple(userGenerator(), userGenerator(), gardenGenerator(), gardenGenerator()),
        async ([user1Data, user2Data, garden1Data, garden2Data]) => {
          // Skip if users have the same email (would cause conflict)
          if (user1Data.email === user2Data.email) {
            return true
          }

          try {
            // Create two test users
            const user1 = await createTestUser(user1Data)
            const user2 = await createTestUser(user2Data)

            // User1 creates a private garden
            const { data: privateGarden } = await user1.client
              .from('gardens')
              .insert({
                user_id: user1.id,
                title: garden1Data.title,
                description: garden1Data.description,
                tiles: garden1Data.tiles,
                layout: garden1Data.layout,
                is_public: false,
                slug: garden1Data.slug
              })
              .select()
              .single()

            // User1 creates a public garden
            const { data: publicGarden } = await user1.client
              .from('gardens')
              .insert({
                user_id: user1.id,
                title: garden2Data.title,
                description: garden2Data.description,
                tiles: garden2Data.tiles,
                layout: garden2Data.layout,
                is_public: true,
                slug: garden2Data.slug ? `public-${garden2Data.slug}` : null
              })
              .select()
              .single()

            if (!privateGarden || !publicGarden) {
              throw new Error('Failed to create test gardens')
            }

            // Property: User2 should NOT be able to access User1's private garden
            const { data: privateAccess } = await user2.client
              .from('gardens')
              .select('*')
              .eq('id', privateGarden.id)
              .single()

            expect(privateAccess).toBeNull()

            // Property: User2 SHOULD be able to access User1's public garden
            const { data: publicAccess, error: publicError } = await user2.client
              .from('gardens')
              .select('*')
              .eq('id', publicGarden.id)
              .single()

            expect(publicError).toBeNull()
            expect(publicAccess).toBeTruthy()
            expect(publicAccess.id).toBe(publicGarden.id)

            // Property: Anonymous users should NOT access private gardens
            const { data: anonPrivateAccess } = await anonymousClient
              .from('gardens')
              .select('*')
              .eq('id', privateGarden.id)
              .single()

            expect(anonPrivateAccess).toBeNull()

            // Property: Anonymous users SHOULD access public gardens
            const { data: anonPublicAccess, error: anonPublicError } = await anonymousClient
              .from('gardens')
              .select('*')
              .eq('id', publicGarden.id)
              .single()

            expect(anonPublicError).toBeNull()
            expect(anonPublicAccess).toBeTruthy()
            expect(anonPublicAccess.id).toBe(publicGarden.id)

            // Property: Users should only see their own gardens in bulk queries
            const { data: user1Gardens } = await user1.client
              .from('gardens')
              .select('*')

            const user1OwnGardens = user1Gardens?.filter(g => g.user_id === user1.id) || []
            const user1PublicGardens = user1Gardens?.filter(g => g.is_public === true) || []
            const user1OtherPrivateGardens = user1Gardens?.filter(g => g.user_id !== user1.id && g.is_public === false) || []

            expect(user1OwnGardens.length).toBeGreaterThanOrEqual(2) // At least the 2 we created
            expect(user1OtherPrivateGardens.length).toBe(0) // Should never see other users' private gardens

            return true
          } catch (error) {
            console.error('Property test failed:', error)
            return false
          } finally {
            await cleanupTestData()
          }
        }
      ), { numRuns: 10 }) // Reduced runs for integration test performance
    }, 30000) // 30 second timeout for property test

    it('should enforce media asset access control for all users', async () => {
      await fc.assert(fc.asyncProperty(
        fc.tuple(userGenerator(), userGenerator(), mediaAssetGenerator()),
        async ([user1Data, user2Data, mediaData]) => {
          // Skip if users have the same email
          if (user1Data.email === user2Data.email) {
            return true
          }

          try {
            const user1 = await createTestUser(user1Data)
            const user2 = await createTestUser(user2Data)

            // Create a garden for user1
            const { data: garden } = await user1.client
              .from('gardens')
              .insert({
                user_id: user1.id,
                title: 'Test Garden',
                tiles: [],
                layout: {}
              })
              .select()
              .single()

            if (!garden) {
              throw new Error('Failed to create test garden')
            }

            // User1 creates a media asset
            const { data: mediaAsset } = await user1.client
              .from('media_assets')
              .insert({
                user_id: user1.id,
                garden_id: garden.id,
                file_name: mediaData.fileName,
                file_type: mediaData.fileType,
                file_size: mediaData.fileSize,
                storage_path: `${user1.id}/${mediaData.fileName}`,
                alt_text: mediaData.altText
              })
              .select()
              .single()

            if (!mediaAsset) {
              throw new Error('Failed to create media asset')
            }

            // Property: User2 should NOT be able to access User1's media asset
            const { data: mediaAccess } = await user2.client
              .from('media_assets')
              .select('*')
              .eq('id', mediaAsset.id)
              .single()

            expect(mediaAccess).toBeNull()

            // Property: Anonymous users should NOT access any media assets
            const { data: anonMediaAccess } = await anonymousClient
              .from('media_assets')
              .select('*')
              .eq('id', mediaAsset.id)
              .single()

            expect(anonMediaAccess).toBeNull()

            // Property: Users should only see their own media assets in bulk queries
            const { data: user1Assets } = await user1.client
              .from('media_assets')
              .select('*')

            const user1OwnAssets = user1Assets?.filter(a => a.user_id === user1.id) || []
            const user1OtherAssets = user1Assets?.filter(a => a.user_id !== user1.id) || []

            expect(user1OwnAssets.length).toBeGreaterThanOrEqual(1)
            expect(user1OtherAssets.length).toBe(0)

            return true
          } catch (error) {
            console.error('Media asset property test failed:', error)
            return false
          } finally {
            await cleanupTestData()
          }
        }
      ), { numRuns: 5 }) // Reduced runs for performance
    }, 30000)

    it('should enforce user profile access control', async () => {
      await fc.assert(fc.asyncProperty(
        fc.tuple(userGenerator(), userGenerator()),
        async ([user1Data, user2Data]) => {
          // Skip if users have the same email
          if (user1Data.email === user2Data.email) {
            return true
          }

          try {
            const user1 = await createTestUser(user1Data)
            const user2 = await createTestUser(user2Data)

            // Property: Users should be able to access their own profile
            const { data: ownProfile, error: ownError } = await user1.client
              .from('users')
              .select('*')
              .eq('id', user1.id)
              .single()

            expect(ownError).toBeNull()
            expect(ownProfile).toBeTruthy()
            expect(ownProfile.id).toBe(user1.id)

            // Property: Users should NOT be able to access other users' profiles
            const { data: otherProfile } = await user2.client
              .from('users')
              .select('*')
              .eq('id', user1.id)
              .single()

            expect(otherProfile).toBeNull()

            // Property: Anonymous users should NOT access any user profiles
            const { data: anonProfile } = await anonymousClient
              .from('users')
              .select('*')
              .eq('id', user1.id)
              .single()

            expect(anonProfile).toBeNull()

            // Property: Bulk user queries should only return own profile
            const { data: allUsers } = await user1.client
              .from('users')
              .select('*')

            expect(allUsers?.length).toBe(1)
            expect(allUsers?.[0]?.id).toBe(user1.id)

            return true
          } catch (error) {
            console.error('User profile property test failed:', error)
            return false
          } finally {
            await cleanupTestData()
          }
        }
      ), { numRuns: 5 })
    }, 30000)
  })

  describe('Property 2: Garden Analytics Access Control', () => {
    /**
     * **Feature: digital-garden-backend-integration, Property 2: Garden Analytics Access Control**
     * 
     * For any garden view analytics, only the garden owner should be able to access
     * the analytics data, while anyone should be able to create view records
     * 
     * **Validates: Requirements 2.5, 9.1**
     */
    it('should enforce analytics access control', async () => {
      await fc.assert(fc.asyncProperty(
        fc.tuple(userGenerator(), userGenerator()),
        async ([user1Data, user2Data]) => {
          if (user1Data.email === user2Data.email) {
            return true
          }

          try {
            const user1 = await createTestUser(user1Data)
            const user2 = await createTestUser(user2Data)

            // Create a public garden for user1
            const { data: garden } = await user1.client
              .from('gardens')
              .insert({
                user_id: user1.id,
                title: 'Analytics Test Garden',
                tiles: [],
                layout: {},
                is_public: true
              })
              .select()
              .single()

            if (!garden) {
              throw new Error('Failed to create test garden')
            }

            // Property: Anyone should be able to create view records
            const { data: viewRecord, error: viewError } = await anonymousClient
              .from('garden_views')
              .insert({
                garden_id: garden.id,
                viewer_ip: '192.168.1.1',
                viewer_country: 'US'
              })
              .select()
              .single()

            expect(viewError).toBeNull()
            expect(viewRecord).toBeTruthy()

            // Property: Garden owner should be able to view analytics
            const { data: ownerAnalytics, error: ownerError } = await user1.client
              .from('garden_views')
              .select('*')
              .eq('garden_id', garden.id)

            expect(ownerError).toBeNull()
            expect(ownerAnalytics).toBeTruthy()
            expect(ownerAnalytics.length).toBeGreaterThan(0)

            // Property: Non-owners should NOT be able to view analytics
            const { data: nonOwnerAnalytics } = await user2.client
              .from('garden_views')
              .select('*')
              .eq('garden_id', garden.id)

            expect(nonOwnerAnalytics).toEqual([])

            // Property: Anonymous users should NOT be able to view analytics
            const { data: anonAnalytics } = await anonymousClient
              .from('garden_views')
              .select('*')
              .eq('garden_id', garden.id)

            expect(anonAnalytics).toEqual([])

            return true
          } catch (error) {
            console.error('Analytics property test failed:', error)
            return false
          } finally {
            await cleanupTestData()
          }
        }
      ), { numRuns: 5 })
    }, 30000)
  })
})