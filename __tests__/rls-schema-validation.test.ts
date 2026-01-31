/**
 * RLS Schema Validation Tests
 * 
 * These tests validate that the RLS policies defined in the database schema
 * match the expected security requirements.
 * 
 * Requirements: 1.3, 2.5, 9.1
 */

import { readFile } from 'fs/promises'
import { join } from 'path'

describe('RLS Schema Validation', () => {
  let schemaContent: string

  beforeAll(async () => {
    // Read the database schema file
    const schemaPath = join(process.cwd(), 'supabase', 'migrations', '20240101000000_initial_schema.sql')
    schemaContent = await readFile(schemaPath, 'utf-8')
  })

  describe('RLS Policy Existence', () => {
    it('should enable RLS on all required tables', () => {
      const requiredTables = ['users', 'gardens', 'media_assets', 'garden_views']
      
      for (const table of requiredTables) {
        const rlsEnabledPattern = new RegExp(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`, 'i')
        expect(schemaContent).toMatch(rlsEnabledPattern)
      }
    })

    it('should have RLS policies for users table', () => {
      // Check for users table policies - match the actual policy structure
      expect(schemaContent).toMatch(/CREATE POLICY.*users.*FOR SELECT.*USING.*auth\.uid\(\) = id/is)
      expect(schemaContent).toMatch(/CREATE POLICY.*users.*FOR UPDATE.*USING.*auth\.uid\(\) = id/is)
      expect(schemaContent).toMatch(/CREATE POLICY.*users.*FOR INSERT.*WITH CHECK.*auth\.uid\(\) = id/is)
    })

    it('should have RLS policies for gardens table', () => {
      // Check for gardens table policies - match the actual policy names and structure
      expect(schemaContent).toMatch(/CREATE POLICY.*gardens.*FOR SELECT.*USING.*user_id = auth\.uid\(\) OR is_public = true/is)
      expect(schemaContent).toMatch(/CREATE POLICY.*gardens.*FOR INSERT.*WITH CHECK.*user_id = auth\.uid\(\)/is)
      expect(schemaContent).toMatch(/CREATE POLICY.*gardens.*FOR UPDATE.*USING.*user_id = auth\.uid\(\)/is)
      expect(schemaContent).toMatch(/CREATE POLICY.*gardens.*FOR DELETE.*USING.*user_id = auth\.uid\(\)/is)
    })

    it('should have RLS policies for media_assets table', () => {
      // Check for media_assets table policies
      expect(schemaContent).toMatch(/CREATE POLICY.*media_assets.*FOR SELECT.*USING.*user_id = auth\.uid\(\)/is)
      expect(schemaContent).toMatch(/CREATE POLICY.*media_assets.*FOR INSERT.*WITH CHECK.*user_id = auth\.uid\(\)/is)
      expect(schemaContent).toMatch(/CREATE POLICY.*media_assets.*FOR UPDATE.*USING.*user_id = auth\.uid\(\)/is)
      expect(schemaContent).toMatch(/CREATE POLICY.*media_assets.*FOR DELETE.*USING.*user_id = auth\.uid\(\)/is)
    })

    it('should have RLS policies for garden_views table', () => {
      // Check for garden_views table policies
      expect(schemaContent).toMatch(/CREATE POLICY.*garden_views.*FOR INSERT.*WITH CHECK.*true/is)
      expect(schemaContent).toMatch(/CREATE POLICY.*garden_views.*FOR SELECT.*USING.*EXISTS.*gardens.*user_id = auth\.uid\(\)/is)
    })
  })

  describe('Storage Bucket Policies', () => {
    it('should have storage policies for media bucket', () => {
      // Check for storage bucket policies - match the actual policy structure
      expect(schemaContent).toMatch(/CREATE POLICY.*storage\.objects.*FOR INSERT.*WITH CHECK.*bucket_id = 'media'/is)
      expect(schemaContent).toMatch(/CREATE POLICY.*storage\.objects.*FOR SELECT.*USING.*bucket_id = 'media'/is)
      expect(schemaContent).toMatch(/CREATE POLICY.*storage\.objects.*FOR UPDATE.*USING.*bucket_id = 'media'/is)
      expect(schemaContent).toMatch(/CREATE POLICY.*storage\.objects.*FOR DELETE.*USING.*bucket_id = 'media'/is)
    })

    it('should enable RLS on storage.objects', () => {
      expect(schemaContent).toMatch(/ALTER TABLE storage\.objects ENABLE ROW LEVEL SECURITY/i)
    })
  })

  describe('Security Functions and Triggers', () => {
    it('should have user creation trigger function', () => {
      expect(schemaContent).toMatch(/CREATE OR REPLACE FUNCTION public\.handle_new_user\(\)/i)
      expect(schemaContent).toMatch(/CREATE TRIGGER on_auth_user_created/i)
    })

    it('should have updated_at trigger function', () => {
      expect(schemaContent).toMatch(/CREATE OR REPLACE FUNCTION update_updated_at_column\(\)/i)
      expect(schemaContent).toMatch(/CREATE TRIGGER update_users_updated_at/i)
      expect(schemaContent).toMatch(/CREATE TRIGGER update_gardens_updated_at/i)
    })
  })

  describe('Database Indexes for Performance', () => {
    it('should have performance indexes for RLS queries', () => {
      // Check for indexes that support RLS policy performance
      expect(schemaContent).toMatch(/CREATE INDEX idx_gardens_user_id ON gardens\(user_id\)/i)
      expect(schemaContent).toMatch(/CREATE INDEX idx_gardens_is_public ON gardens\(is_public\)/i)
      expect(schemaContent).toMatch(/CREATE INDEX idx_media_assets_user_id ON media_assets\(user_id\)/i)
      expect(schemaContent).toMatch(/CREATE INDEX idx_garden_views_garden_id ON garden_views\(garden_id\)/i)
    })
  })

  describe('Policy Security Validation', () => {
    it('should not have overly permissive policies', () => {
      // Ensure no policies allow unrestricted access
      const dangerousPatterns = [
        /CREATE POLICY.*FOR ALL.*true/i, // Overly permissive policy
        /CREATE POLICY.*FOR SELECT.*true/i, // Allow all reads (except garden_views)
        /CREATE POLICY.*FOR UPDATE.*true/i, // Allow all updates
        /CREATE POLICY.*FOR DELETE.*true/i  // Allow all deletes
      ]

      for (const pattern of dangerousPatterns) {
        const matches = schemaContent.match(pattern)
        if (matches) {
          // Allow only the garden_views insert policy to be permissive
          const isGardenViewsInsert = matches[0].includes('garden_views') && matches[0].includes('INSERT')
          expect(isGardenViewsInsert).toBe(true)
        }
      }
    })

    it('should use auth.uid() for user identification', () => {
      // Ensure all user-based policies use auth.uid()
      const userPolicyPattern = /auth\.uid\(\)/gi
      const matches = schemaContent.match(userPolicyPattern)
      
      // Should have multiple policies using auth.uid()
      expect(matches).toBeTruthy()
      expect(matches!.length).toBeGreaterThan(5)
    })

    it('should properly handle public garden access', () => {
      // Ensure public garden access is properly configured
      expect(schemaContent).toMatch(/user_id = auth\.uid\(\) OR is_public = true/i)
    })
  })

  describe('Data Integrity Constraints', () => {
    it('should have proper foreign key constraints', () => {
      expect(schemaContent).toMatch(/user_id UUID REFERENCES users\(id\) ON DELETE CASCADE/i)
      expect(schemaContent).toMatch(/garden_id UUID REFERENCES gardens\(id\) ON DELETE CASCADE/i)
    })

    it('should have proper default values for security fields', () => {
      expect(schemaContent).toMatch(/is_public BOOLEAN DEFAULT FALSE/i)
      expect(schemaContent).toMatch(/onboarding_completed BOOLEAN DEFAULT FALSE/i)
    })

    it('should have proper UUID generation', () => {
      expect(schemaContent).toMatch(/id UUID PRIMARY KEY DEFAULT gen_random_uuid\(\)/i)
      expect(schemaContent).toMatch(/CREATE EXTENSION IF NOT EXISTS "uuid-ossp"/i)
    })
  })

  describe('Storage Configuration Security', () => {
    it('should have proper file size limits', () => {
      expect(schemaContent).toMatch(/52428800/) // 50MB limit
    })

    it('should have allowed MIME types restriction', () => {
      expect(schemaContent).toMatch(/ARRAY\[.*image.*video/is)
    })

    it('should have user-specific folder structure in storage policies', () => {
      expect(schemaContent).toMatch(/auth\.uid\(\)::text = \(storage\.foldername\(name\)\)\[1\]/is)
    })
  })
})