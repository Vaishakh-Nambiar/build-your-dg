/**
 * Row Level Security (RLS) Policy Tests
 * 
 * This test suite verifies that RLS policies correctly enforce data access control
 * across all database tables, ensuring users can only access their own private data
 * or publicly available data.
 * 
 * Requirements: 1.3, 2.5, 9.1
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase'

// Test configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

// Test users for different scenarios
interface TestUser {
  id: string
  email: string
  password: string
  client: SupabaseClient<Database>
}

describe('Row Level Security (RLS) Policies', () => {
  let user1: TestUser
  let user2: TestUser
  let anonymousClient: SupabaseClient<Database>
  
  // Test data
  let user1Garden: any
  let user2Garden: any
  let publicGarden: any
  let user1MediaAsset: any
  let user2MediaAsset: any

  beforeAll(async () => {
    // Create anonymous client for unauthenticated requests
    anonymousClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)

    // Create test users
    user1 = {
      id: '',
      email: 'user1@test.com',
      password: 'testpassword123',
      client: createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
    }

    user2 = {
      id: '',
      email: 'user2@test.com', 
      password: 'testpassword123',
      client: createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
    }

    // Sign up test users
    const { data: user1Auth, error: user1Error } = await user1.client.auth.signUp({
      email: user1.email,
      password: user1.password
    })
    
    const { data: user2Auth, error: user2Error } = await user2.client.auth.signUp({
      email: user2.email,
      password: user2.password
    })

    if (user1Error || user2Error) {
      throw new Error(`Failed to create test users: ${user1Error?.message || user2Error?.message}`)
    }

    user1.id = user1Auth.user!.id
    user2.id = user2Auth.user!.id

    // Wait for user profiles to be created by trigger
    await new Promise(resolve => setTimeout(resolve, 1000))
  })

  beforeEach(async () => {
    // Create test data for each test
    await setupTestData()
  })

  afterEach(async () => {
    // Clean up test data after each test
    await cleanupTestData()
  })

  afterAll(async () => {
    // Clean up test users
    await user1.client.auth.signOut()
    await user2.client.auth.signOut()
  })

  async function setupTestData() {
    // Create gardens for both users
    const { data: garden1, error: garden1Error } = await user1.client
      .from('gardens')
      .insert({
        user_id: user1.id,
        title: 'User 1 Private Garden',
        description: 'Private garden for user 1',
        tiles: [{ id: '1', type: 'text', content: 'Private content' }],
        layout: { grid: '2x2' },
        is_public: false
      })
      .select()
      .single()

    const { data: garden2, error: garden2Error } = await user2.client
      .from('gardens')
      .insert({
        user_id: user2.id,
        title: 'User 2 Private Garden',
        description: 'Private garden for user 2',
        tiles: [{ id: '2', type: 'text', content: 'Private content' }],
        layout: { grid: '2x2' },
        is_public: false
      })
      .select()
      .single()

    // Create a public garden
    const { data: publicGardenData, error: publicGardenError } = await user1.client
      .from('gardens')
      .insert({
        user_id: user1.id,
        title: 'Public Garden',
        description: 'Public garden visible to all',
        tiles: [{ id: '3', type: 'text', content: 'Public content' }],
        layout: { grid: '2x2' },
        is_public: true,
        slug: 'test-public-garden'
      })
      .select()
      .single()

    if (garden1Error || garden2Error || publicGardenError) {
      throw new Error('Failed to create test gardens')
    }

    user1Garden = garden1
    user2Garden = garden2
    publicGarden = publicGardenData

    // Create media assets for both users
    const { data: media1, error: media1Error } = await user1.client
      .from('media_assets')
      .insert({
        user_id: user1.id,
        garden_id: user1Garden.id,
        file_name: 'user1-image.jpg',
        file_type: 'image/jpeg',
        file_size: 1024,
        storage_path: `${user1.id}/user1-image.jpg`
      })
      .select()
      .single()

    const { data: media2, error: media2Error } = await user2.client
      .from('media_assets')
      .insert({
        user_id: user2.id,
        garden_id: user2Garden.id,
        file_name: 'user2-image.jpg',
        file_type: 'image/jpeg',
        file_size: 2048,
        storage_path: `${user2.id}/user2-image.jpg`
      })
      .select()
      .single()

    if (media1Error || media2Error) {
      throw new Error('Failed to create test media assets')
    }

    user1MediaAsset = media1
    user2MediaAsset = media2
  }

  async function cleanupTestData() {
    // Clean up in reverse order due to foreign key constraints
    await user1.client.from('media_assets').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await user2.client.from('media_assets').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await user1.client.from('garden_views').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await user2.client.from('garden_views').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await user1.client.from('gardens').delete().neq('id', '00000000-0000-0000-0000-000000000000')
    await user2.client.from('gardens').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  }

  describe('Users Table RLS Policies', () => {
    it('should allow users to view their own profile', async () => {
      const { data, error } = await user1.client
        .from('users')
        .select('*')
        .eq('id', user1.id)
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.id).toBe(user1.id)
      expect(data.email).toBe(user1.email)
    })

    it('should prevent users from viewing other users profiles', async () => {
      const { data, error } = await user1.client
        .from('users')
        .select('*')
        .eq('id', user2.id)
        .single()

      // Should return no data due to RLS policy
      expect(data).toBeNull()
      expect(error).toBeTruthy()
    })

    it('should allow users to update their own profile', async () => {
      const { data, error } = await user1.client
        .from('users')
        .update({ display_name: 'Updated Name' })
        .eq('id', user1.id)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.display_name).toBe('Updated Name')
    })

    it('should prevent users from updating other users profiles', async () => {
      const { data, error } = await user1.client
        .from('users')
        .update({ display_name: 'Hacked Name' })
        .eq('id', user2.id)

      expect(error).toBeTruthy()
      expect(data).toBeNull()
    })
  })

  describe('Gardens Table RLS Policies', () => {
    it('should allow users to view their own private gardens', async () => {
      const { data, error } = await user1.client
        .from('gardens')
        .select('*')
        .eq('id', user1Garden.id)
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.id).toBe(user1Garden.id)
      expect(data.user_id).toBe(user1.id)
    })

    it('should prevent users from viewing other users private gardens', async () => {
      const { data, error } = await user1.client
        .from('gardens')
        .select('*')
        .eq('id', user2Garden.id)
        .single()

      // Should return no data due to RLS policy
      expect(data).toBeNull()
      expect(error).toBeTruthy()
    })

    it('should allow users to view public gardens from other users', async () => {
      const { data, error } = await user2.client
        .from('gardens')
        .select('*')
        .eq('id', publicGarden.id)
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.id).toBe(publicGarden.id)
      expect(data.is_public).toBe(true)
    })

    it('should allow anonymous users to view public gardens', async () => {
      const { data, error } = await anonymousClient
        .from('gardens')
        .select('*')
        .eq('id', publicGarden.id)
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.id).toBe(publicGarden.id)
      expect(data.is_public).toBe(true)
    })

    it('should prevent anonymous users from viewing private gardens', async () => {
      const { data, error } = await anonymousClient
        .from('gardens')
        .select('*')
        .eq('id', user1Garden.id)
        .single()

      expect(data).toBeNull()
      expect(error).toBeTruthy()
    })

    it('should allow users to create their own gardens', async () => {
      const { data, error } = await user1.client
        .from('gardens')
        .insert({
          user_id: user1.id,
          title: 'New Garden',
          tiles: [],
          layout: {}
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.user_id).toBe(user1.id)
    })

    it('should prevent users from creating gardens for other users', async () => {
      const { data, error } = await user1.client
        .from('gardens')
        .insert({
          user_id: user2.id, // Trying to create garden for user2
          title: 'Malicious Garden',
          tiles: [],
          layout: {}
        })

      expect(error).toBeTruthy()
      expect(data).toBeNull()
    })

    it('should allow users to update their own gardens', async () => {
      const { data, error } = await user1.client
        .from('gardens')
        .update({ title: 'Updated Garden Title' })
        .eq('id', user1Garden.id)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.title).toBe('Updated Garden Title')
    })

    it('should prevent users from updating other users gardens', async () => {
      const { data, error } = await user1.client
        .from('gardens')
        .update({ title: 'Hacked Garden' })
        .eq('id', user2Garden.id)

      expect(error).toBeTruthy()
      expect(data).toBeNull()
    })

    it('should allow users to delete their own gardens', async () => {
      // Create a garden to delete
      const { data: gardenToDelete } = await user1.client
        .from('gardens')
        .insert({
          user_id: user1.id,
          title: 'Garden to Delete',
          tiles: [],
          layout: {}
        })
        .select()
        .single()

      const { error } = await user1.client
        .from('gardens')
        .delete()
        .eq('id', gardenToDelete!.id)

      expect(error).toBeNull()
    })

    it('should prevent users from deleting other users gardens', async () => {
      const { error } = await user1.client
        .from('gardens')
        .delete()
        .eq('id', user2Garden.id)

      expect(error).toBeTruthy()
    })
  })

  describe('Media Assets Table RLS Policies', () => {
    it('should allow users to view their own media assets', async () => {
      const { data, error } = await user1.client
        .from('media_assets')
        .select('*')
        .eq('id', user1MediaAsset.id)
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.id).toBe(user1MediaAsset.id)
      expect(data.user_id).toBe(user1.id)
    })

    it('should prevent users from viewing other users media assets', async () => {
      const { data, error } = await user1.client
        .from('media_assets')
        .select('*')
        .eq('id', user2MediaAsset.id)
        .single()

      expect(data).toBeNull()
      expect(error).toBeTruthy()
    })

    it('should allow users to create their own media assets', async () => {
      const { data, error } = await user1.client
        .from('media_assets')
        .insert({
          user_id: user1.id,
          garden_id: user1Garden.id,
          file_name: 'new-image.jpg',
          file_type: 'image/jpeg',
          file_size: 1024,
          storage_path: `${user1.id}/new-image.jpg`
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.user_id).toBe(user1.id)
    })

    it('should prevent users from creating media assets for other users', async () => {
      const { data, error } = await user1.client
        .from('media_assets')
        .insert({
          user_id: user2.id, // Trying to create asset for user2
          garden_id: user2Garden.id,
          file_name: 'malicious-image.jpg',
          file_type: 'image/jpeg',
          file_size: 1024,
          storage_path: `${user2.id}/malicious-image.jpg`
        })

      expect(error).toBeTruthy()
      expect(data).toBeNull()
    })

    it('should allow users to update their own media assets', async () => {
      const { data, error } = await user1.client
        .from('media_assets')
        .update({ alt_text: 'Updated alt text' })
        .eq('id', user1MediaAsset.id)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.alt_text).toBe('Updated alt text')
    })

    it('should prevent users from updating other users media assets', async () => {
      const { data, error } = await user1.client
        .from('media_assets')
        .update({ alt_text: 'Hacked alt text' })
        .eq('id', user2MediaAsset.id)

      expect(error).toBeTruthy()
      expect(data).toBeNull()
    })

    it('should allow users to delete their own media assets', async () => {
      // Create a media asset to delete
      const { data: assetToDelete } = await user1.client
        .from('media_assets')
        .insert({
          user_id: user1.id,
          garden_id: user1Garden.id,
          file_name: 'asset-to-delete.jpg',
          file_type: 'image/jpeg',
          file_size: 1024,
          storage_path: `${user1.id}/asset-to-delete.jpg`
        })
        .select()
        .single()

      const { error } = await user1.client
        .from('media_assets')
        .delete()
        .eq('id', assetToDelete!.id)

      expect(error).toBeNull()
    })

    it('should prevent users from deleting other users media assets', async () => {
      const { error } = await user1.client
        .from('media_assets')
        .delete()
        .eq('id', user2MediaAsset.id)

      expect(error).toBeTruthy()
    })
  })

  describe('Garden Views Table RLS Policies', () => {
    it('should allow anyone to insert garden view records', async () => {
      const { data, error } = await anonymousClient
        .from('garden_views')
        .insert({
          garden_id: publicGarden.id,
          viewer_ip: '192.168.1.1',
          viewer_country: 'US',
          referrer: 'https://example.com'
        })
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.garden_id).toBe(publicGarden.id)
    })

    it('should allow garden owners to view their analytics', async () => {
      // First, create a view record
      await anonymousClient
        .from('garden_views')
        .insert({
          garden_id: publicGarden.id,
          viewer_ip: '192.168.1.1',
          viewer_country: 'US'
        })

      // Garden owner should be able to view analytics
      const { data, error } = await user1.client
        .from('garden_views')
        .select('*')
        .eq('garden_id', publicGarden.id)

      expect(error).toBeNull()
      expect(data).toBeTruthy()
      expect(data.length).toBeGreaterThan(0)
    })

    it('should prevent non-owners from viewing garden analytics', async () => {
      // First, create a view record for user1's garden
      await anonymousClient
        .from('garden_views')
        .insert({
          garden_id: user1Garden.id,
          viewer_ip: '192.168.1.1',
          viewer_country: 'US'
        })

      // User2 should not be able to view user1's analytics
      const { data, error } = await user2.client
        .from('garden_views')
        .select('*')
        .eq('garden_id', user1Garden.id)

      expect(data).toEqual([]) // Should return empty array due to RLS
    })
  })

  describe('Cross-User Data Access Prevention', () => {
    it('should prevent bulk access to other users data', async () => {
      // Try to access all gardens (should only return own gardens and public ones)
      const { data: gardens } = await user1.client
        .from('gardens')
        .select('*')

      // Should only include user1's gardens and public gardens
      const user1Gardens = gardens?.filter(g => g.user_id === user1.id) || []
      const publicGardens = gardens?.filter(g => g.is_public === true) || []
      const otherUsersPrivateGardens = gardens?.filter(g => g.user_id !== user1.id && g.is_public === false) || []

      expect(user1Gardens.length).toBeGreaterThan(0)
      expect(publicGardens.length).toBeGreaterThan(0)
      expect(otherUsersPrivateGardens.length).toBe(0) // Should be empty
    })

    it('should prevent bulk access to other users media assets', async () => {
      // Try to access all media assets (should only return own assets)
      const { data: assets } = await user1.client
        .from('media_assets')
        .select('*')

      // Should only include user1's assets
      const user1Assets = assets?.filter(a => a.user_id === user1.id) || []
      const otherUsersAssets = assets?.filter(a => a.user_id !== user1.id) || []

      expect(user1Assets.length).toBeGreaterThan(0)
      expect(otherUsersAssets.length).toBe(0) // Should be empty
    })
  })

  describe('Anonymous User Access', () => {
    it('should allow anonymous users to view public gardens only', async () => {
      const { data: publicGardens } = await anonymousClient
        .from('gardens')
        .select('*')
        .eq('is_public', true)

      expect(publicGardens).toBeTruthy()
      expect(publicGardens!.length).toBeGreaterThan(0)
      expect(publicGardens!.every(g => g.is_public === true)).toBe(true)
    })

    it('should prevent anonymous users from accessing private gardens', async () => {
      const { data: privateGardens } = await anonymousClient
        .from('gardens')
        .select('*')
        .eq('is_public', false)

      expect(privateGardens).toEqual([]) // Should return empty array
    })

    it('should prevent anonymous users from accessing user profiles', async () => {
      const { data: users } = await anonymousClient
        .from('users')
        .select('*')

      expect(users).toEqual([]) // Should return empty array
    })

    it('should prevent anonymous users from accessing media assets', async () => {
      const { data: assets } = await anonymousClient
        .from('media_assets')
        .select('*')

      expect(assets).toEqual([]) // Should return empty array
    })
  })
})