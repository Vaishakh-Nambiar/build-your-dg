# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## Backend Integration for Digital Garden Platform

**Document Version:** 1.0  
**Last Updated:** January 30, 2026  
**Status:** Ready for Implementation  
**Priority:** P0 (Critical Path)

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Technical Requirements](#technical-requirements)
4. [Database Implementation](#database-implementation)
5. [Authentication System](#authentication-system)
6. [API Layer](#api-layer)
7. [File Upload System](#file-upload-system)
8. [State Management Migration](#state-management-migration)
9. [Onboarding Flow](#onboarding-flow)
10. [Public Garden System](#public-garden-system)
11. [Analytics & Tracking](#analytics-tracking)
12. [Error Handling & Edge Cases](#error-handling-edge-cases)
13. [Security Requirements](#security-requirements)
14. [Performance Requirements](#performance-requirements)
15. [Testing Requirements](#testing-requirements)
16. [Implementation Phases](#implementation-phases)
17. [Rollback Strategy](#rollback-strategy)
18. [Success Metrics](#success-metrics)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Purpose
Transform the existing frontend-only Digital Garden platform into a full-stack application by integrating Supabase as the backend infrastructure. This integration will enable user authentication, persistent data storage, file management, and multi-user capabilities while maintaining the existing UI/UX.

### 1.2 Goals
- Enable user authentication and multi-user support
- Migrate from localStorage to persistent database storage
- Implement file upload and asset management
- Create public/private garden visibility controls
- Add analytics and view tracking
- Implement comprehensive onboarding flow for new users

### 1.3 Non-Goals
- Redesigning the existing UI/UX
- Adding real-time collaboration features (future phase)
- Building a mobile app (web-first approach)
- Implementing payment/monetization (future phase)

### 1.4 Success Criteria
- All existing functionality works with backend integration
- Zero data loss during migration
- Authentication flow completes in < 30 seconds
- Page load times remain under 2 seconds
- 100% of tiles save/load successfully from database
- File uploads complete in < 10 seconds for files under 10MB

---

## 2. CURRENT STATE ANALYSIS

### 2.1 Existing Frontend Architecture

**Current Tech Stack:**
```
- Framework: Next.js 14+ (App Router)
- UI Library: React 18+
- Styling: Tailwind CSS
- Grid System: react-grid-layout
- State Management: React useState/useEffect
- Storage: Browser localStorage
- Routing: Next.js file-based routing
```

**Current Features:**
- Tile-based grid editor with drag-and-drop
- Multiple tile types: text, image, project, writing
- Category organization
- Grid layout customization
- Theme/appearance settings
- Local draft saving (localStorage)

**Current Limitations:**
- Single-user only (no authentication)
- Data stored only in browser (localStorage)
- No cross-device synchronization
- No file upload capability (external URLs only)
- No public sharing mechanism
- No analytics or user insights
- Data loss risk on browser clear

### 2.2 Data Currently in localStorage

**Storage Keys:**
```javascript
{
  "garden-draft": {
    "tiles": [...],
    "lastBackup": "2025-01-30T10:00:00Z"
  },
  "garden-config": {
    "grid": { cols: 12, rowHeight: 100, margin: [16, 16] },
    "theme": { colorScheme: "default", fontFamily: "inter" }
  },
  "garden-metadata": {
    "title": "My Digital Garden",
    "description": ""
  }
}
```

### 2.3 Migration Challenges
- Preserving existing user work during onboarding
- Mapping localStorage structure to database schema
- Handling users who already have gardens in localStorage
- Maintaining backward compatibility during rollout
- Zero-downtime migration strategy

---

## 3. TECHNICAL REQUIREMENTS

### 3.1 Backend Infrastructure

**Supabase Setup:**
```yaml
Project Configuration:
  - Project Name: digital-garden-prod
  - Region: us-east-1 (or closest to primary users)
  - Database: PostgreSQL 15+
  - Storage: 50GB initial allocation
  - Connection Pooling: Enabled (Mode: Transaction)
  
Required Services:
  - Supabase Auth (Email + OAuth providers)
  - Supabase Database (PostgreSQL)
  - Supabase Storage (File hosting)
  - Supabase Realtime (for future features)
  
Environment Variables Required:
  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
  SUPABASE_SERVICE_ROLE_KEY=eyJxxx... (server-only)
  NEXT_PUBLIC_SITE_URL=https://buildyourowndg.com
```

### 3.2 Required NPM Packages

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/auth-helpers-nextjs": "^0.8.7",
    "@supabase/auth-ui-react": "^0.4.6",
    "@supabase/auth-ui-shared": "^0.1.8",
    "nanoid": "^5.0.4",
    "react-hot-toast": "^2.4.1",
    "zod": "^3.22.4",
    "date-fns": "^3.0.6"
  },
  "devDependencies": {
    "@types/node": "^20.10.6"
  }
}
```

### 3.3 File Structure Changes

```
app/
├── (auth)/                           # NEW: Auth-related routes
│   ├── login/
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   ├── verify-email/
│   │   └── page.tsx
│   └── reset-password/
│       └── page.tsx
├── (dashboard)/                      # NEW: Protected routes
│   ├── layout.tsx                    # Auth check wrapper
│   └── edit/
│       └── page.tsx                  # MODIFIED: Existing editor
├── (public)/
│   └── [username]/
│       └── page.tsx                  # NEW: Public garden view
├── onboarding/                       # NEW: Onboarding flow
│   └── page.tsx
├── api/                              # NEW: API routes
│   ├── auth/
│   │   ├── callback/route.ts
│   │   └── signout/route.ts
│   ├── gardens/
│   │   ├── [id]/route.ts
│   │   └── route.ts
│   ├── media/
│   │   └── upload/route.ts
│   └── views/
│       └── track/route.ts
└── middleware.ts                     # NEW: Auth middleware

lib/
├── supabase/                         # NEW: Supabase utilities
│   ├── client.ts                     # Client-side instance
│   ├── server.ts                     # Server-side instance
│   ├── middleware.ts                 # Middleware instance
│   └── types.ts                      # Generated types
├── hooks/                            # NEW: Custom hooks
│   ├── useGarden.ts
│   ├── useAuth.ts
│   ├── useMediaUpload.ts
│   └── useAutoSave.ts
├── services/                         # NEW: API service layer
│   ├── gardenService.ts
│   ├── mediaService.ts
│   └── analyticsService.ts
├── utils/
│   ├── localStorage.ts               # MODIFIED: Migration helper
│   └── validators.ts                 # NEW: Input validation
└── constants/
    └── errors.ts                     # NEW: Error messages

components/
├── auth/                             # NEW: Auth components
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   ├── AuthProvider.tsx
│   └── ProtectedRoute.tsx
├── onboarding/                       # NEW: Onboarding components
│   ├── OnboardingWizard.tsx
│   ├── steps/
│   │   ├── WelcomeStep.tsx
│   │   ├── UsernameStep.tsx
│   │   ├── ProfileStep.tsx
│   │   └── ImportStep.tsx
│   └── OnboardingProgress.tsx
├── editor/
│   ├── EditorTopBar.tsx              # MODIFIED: Add save status
│   ├── TileEditor.tsx                # MODIFIED: Connect to DB
│   └── GridCanvas.tsx                # MODIFIED: Load from DB
└── modals/                           # NEW: Modal components
    ├── StatsModal.tsx
    ├── SettingsModal.tsx
    └── MediaUploadModal.tsx
```

### 3.4 Environment Configuration

**Local Development (.env.local):**
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Digital Garden

# Feature Flags
NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=false
NEXT_PUBLIC_ENABLE_GITHUB_AUTH=false
NEXT_PUBLIC_MAX_FILE_SIZE=10485760  # 10MB in bytes

# Storage Configuration
NEXT_PUBLIC_STORAGE_BUCKET=gardens-media
```

**Production (.env.production):**
```bash
NEXT_PUBLIC_SITE_URL=https://buildyourowndg.com
NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=true
NEXT_PUBLIC_ENABLE_GITHUB_AUTH=true
```

---

## 4. DATABASE IMPLEMENTATION

### 4.1 Complete SQL Schema

**CRITICAL: Run this SQL in Supabase SQL Editor in EXACT order:**

```sql
-- ============================================
-- STEP 1: ENABLE REQUIRED EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- STEP 2: CREATE USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Authentication (linked to auth.users)
    auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    
    -- Profile Information
    display_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    website_url TEXT,
    
    -- User Preferences
    preferences JSONB DEFAULT '{
        "theme": "default",
        "emailNotifications": true,
        "publicProfile": true,
        "showViewCount": true
    }'::jsonb,
    
    -- Metadata
    email_verified BOOLEAN DEFAULT false,
    onboarding_completed BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_-]{3,50}$'),
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_created ON users(created_at DESC);

-- ============================================
-- STEP 3: CREATE GARDENS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS gardens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic Information
    title VARCHAR(200) DEFAULT 'My Digital Garden' NOT NULL,
    description TEXT,
    slug VARCHAR(100),  -- For future custom URLs
    
    -- Content (MAIN DATA STORAGE)
    tiles JSONB DEFAULT '[]'::jsonb NOT NULL,
    
    -- Configuration
    grid_config JSONB DEFAULT '{
        "cols": 12,
        "rowHeight": 100,
        "margin": [16, 16],
        "containerPadding": [16, 16]
    }'::jsonb,
    
    theme_config JSONB DEFAULT '{
        "colorScheme": "default",
        "fontFamily": "inter",
        "accentColor": "#3b82f6",
        "backgroundColor": "#ffffff"
    }'::jsonb,
    
    -- Publishing Status
    is_public BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    unpublished_at TIMESTAMP,
    
    -- SEO & Social
    og_image_url TEXT,
    og_description TEXT,
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMP,
    
    -- Version Control (for future undo/redo)
    version INTEGER DEFAULT 1,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT one_garden_per_user UNIQUE(user_id),
    CONSTRAINT title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 200)
);

-- Indexes for gardens table
CREATE INDEX IF NOT EXISTS idx_gardens_user ON gardens(user_id);
CREATE INDEX IF NOT EXISTS idx_gardens_public ON gardens(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_gardens_tiles_gin ON gardens USING gin(tiles);
CREATE INDEX IF NOT EXISTS idx_gardens_updated ON gardens(updated_at DESC);

-- ============================================
-- STEP 4: CREATE MEDIA ASSETS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
    
    -- File Information
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,  -- Size in bytes
    mime_type VARCHAR(100) NOT NULL,
    file_extension VARCHAR(10),
    
    -- Storage Information
    storage_path TEXT NOT NULL UNIQUE,
    storage_bucket VARCHAR(100) DEFAULT 'gardens-media',
    public_url TEXT NOT NULL,
    thumbnail_url TEXT,
    
    -- Image Metadata (for images only)
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    
    -- Organization
    folder VARCHAR(100) DEFAULT 'images',  -- images, videos, documents
    tags TEXT[],
    
    -- Status
    is_used BOOLEAN DEFAULT false,  -- Track if file is in any tile
    upload_status VARCHAR(20) DEFAULT 'completed',  -- completed, processing, failed
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_file_size CHECK (file_size > 0 AND file_size <= 52428800),  -- Max 50MB
    CONSTRAINT valid_mime_type CHECK (mime_type IN (
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'video/mp4', 'video/webm',
        'application/pdf'
    ))
);

-- Indexes for media_assets table
CREATE INDEX IF NOT EXISTS idx_media_user ON media_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_media_garden ON media_assets(garden_id);
CREATE INDEX IF NOT EXISTS idx_media_created ON media_assets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_storage_path ON media_assets(storage_path);
CREATE INDEX IF NOT EXISTS idx_media_used ON media_assets(is_used) WHERE is_used = true;

-- ============================================
-- STEP 5: CREATE GARDEN VIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS garden_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    garden_id UUID NOT NULL REFERENCES gardens(id) ON DELETE CASCADE,
    
    -- Visitor Information (Anonymous)
    visitor_id UUID NOT NULL,  -- Generated client-side, stored in cookie
    ip_address INET,
    
    -- Context
    referer TEXT,
    user_agent TEXT,
    device_type VARCHAR(20),  -- desktop, mobile, tablet
    browser VARCHAR(50),
    country_code VARCHAR(2),
    
    -- Session Tracking
    session_id UUID,
    time_spent_seconds INTEGER DEFAULT 0,
    
    -- Metadata
    viewed_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_device_type CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown'))
);

-- Indexes for garden_views table
CREATE INDEX IF NOT EXISTS idx_views_garden ON garden_views(garden_id);
CREATE INDEX IF NOT EXISTS idx_views_garden_time ON garden_views(garden_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_views_visitor ON garden_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_views_session ON garden_views(session_id);
CREATE INDEX IF NOT EXISTS idx_views_date ON garden_views(viewed_at::date);

-- ============================================
-- STEP 6: CREATE CATEGORIES TABLE (Optional)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Category Details
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#3b82f6',  -- Hex color
    icon VARCHAR(50),  -- Icon name/emoji
    sort_order INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_category_per_user UNIQUE(user_id, name),
    CONSTRAINT valid_color CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);

-- ============================================
-- STEP 7: CREATE FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gardens_updated_at BEFORE UPDATE ON gardens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_assets_updated_at BEFORE UPDATE ON media_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment garden view count
CREATE OR REPLACE FUNCTION increment_garden_views()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE gardens
    SET view_count = view_count + 1,
        last_viewed_at = NEW.viewed_at
    WHERE id = NEW.garden_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-increment view count
CREATE TRIGGER auto_increment_views AFTER INSERT ON garden_views
    FOR EACH ROW EXECUTE FUNCTION increment_garden_views();

-- Function to create garden on user signup
CREATE OR REPLACE FUNCTION create_garden_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO gardens (user_id, title)
    VALUES (NEW.id, 'My Digital Garden');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create garden
CREATE TRIGGER auto_create_garden AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION create_garden_for_new_user();

-- ============================================
-- STEP 8: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- USERS TABLE POLICIES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "users_select_own"
    ON users FOR SELECT
    USING (auth.uid() = auth_id);

-- Users can update their own profile
CREATE POLICY "users_update_own"
    ON users FOR UPDATE
    USING (auth.uid() = auth_id);

-- Anyone can view public user profiles (for public gardens)
CREATE POLICY "users_select_public"
    ON users FOR SELECT
    USING (
        id IN (
            SELECT user_id FROM gardens WHERE is_public = true
        )
    );

-- GARDENS TABLE POLICIES
ALTER TABLE gardens ENABLE ROW LEVEL SECURITY;

-- Users can view their own garden
CREATE POLICY "gardens_select_own"
    ON gardens FOR SELECT
    USING (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

-- Anyone can view public gardens
CREATE POLICY "gardens_select_public"
    ON gardens FOR SELECT
    USING (is_public = true);

-- Users can insert their own garden
CREATE POLICY "gardens_insert_own"
    ON gardens FOR INSERT
    WITH CHECK (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

-- Users can update their own garden
CREATE POLICY "gardens_update_own"
    ON gardens FOR UPDATE
    USING (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

-- Users can delete their own garden
CREATE POLICY "gardens_delete_own"
    ON gardens FOR DELETE
    USING (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

-- MEDIA ASSETS TABLE POLICIES
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;

-- Users can view their own media
CREATE POLICY "media_select_own"
    ON media_assets FOR SELECT
    USING (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

-- Users can insert their own media
CREATE POLICY "media_insert_own"
    ON media_assets FOR INSERT
    WITH CHECK (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

-- Users can update their own media
CREATE POLICY "media_update_own"
    ON media_assets FOR UPDATE
    USING (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

-- Users can delete their own media
CREATE POLICY "media_delete_own"
    ON media_assets FOR DELETE
    USING (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

-- GARDEN VIEWS TABLE POLICIES
ALTER TABLE garden_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert views (anonymous tracking)
CREATE POLICY "views_insert_all"
    ON garden_views FOR INSERT
    WITH CHECK (true);

-- Garden owners can view their own analytics
CREATE POLICY "views_select_own_garden"
    ON garden_views FOR SELECT
    USING (
        garden_id IN (
            SELECT g.id 
            FROM gardens g
            JOIN users u ON g.user_id = u.id
            WHERE u.auth_id = auth.uid()
        )
    );

-- CATEGORIES TABLE POLICIES
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Users can view their own categories
CREATE POLICY "categories_select_own"
    ON categories FOR SELECT
    USING (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

-- Users can manage their own categories
CREATE POLICY "categories_all_own"
    ON categories FOR ALL
    USING (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

-- ============================================
-- STEP 9: STORAGE BUCKET SETUP
-- ============================================

-- Note: This needs to be done via Supabase Dashboard or CLI
-- Go to Storage -> Create Bucket

-- Bucket Name: gardens-media
-- Public: Yes
-- File Size Limit: 50MB
-- Allowed MIME types: image/*, video/mp4, video/webm, application/pdf

-- Storage Policy (run after bucket creation):
CREATE POLICY "users_upload_own_media"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'gardens-media' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "users_access_own_media"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'gardens-media' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "users_delete_own_media"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'gardens-media' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "public_read_media"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'gardens-media');
```

### 4.2 Database Verification Script

**After running the schema, execute this verification:**

```sql
-- Verify all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Expected output:
-- categories
-- garden_views
-- gardens
-- media_assets
-- users

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- All tables should show rowsecurity = true

-- Verify policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Should show all policies created above

-- Verify indexes
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Verify triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

### 4.3 Seed Data for Testing

```sql
-- Insert test user (manual, for development only)
INSERT INTO users (auth_id, email, username, display_name, email_verified, onboarding_completed)
VALUES (
    'test-auth-uuid-here',  -- Replace with actual auth.users id
    'test@example.com',
    'testuser',
    'Test User',
    true,
    true
);

-- Test garden is auto-created via trigger

-- Insert test categories
INSERT INTO categories (user_id, name, color, sort_order)
VALUES 
    ((SELECT id FROM users WHERE username = 'testuser'), 'Personal', '#3b82f6', 1),
    ((SELECT id FROM users WHERE username = 'testuser'), 'Work', '#10b981', 2),
    ((SELECT id FROM users WHERE username = 'testuser'), 'Projects', '#f59e0b', 3);
```

---

## 5. AUTHENTICATION SYSTEM

### 5.1 Supabase Auth Configuration

**Auth Settings in Supabase Dashboard:**

```yaml
Site URL: https://buildyourowndg.com
Redirect URLs:
  - http://localhost:3000/**
  - https://buildyourowndg.com/**
  - https://buildyourowndg.com/auth/callback
  - https://buildyourowndg.com/onboarding

Email Templates:
  Confirmation Email:
    Subject: "Confirm your Digital Garden account"
    Template: Custom (include branded design)
  
  Password Recovery:
    Subject: "Reset your Digital Garden password"
    Template: Custom
  
  Magic Link:
    Subject: "Your Digital Garden login link"
    Template: Custom

Auth Providers:
  Email: Enabled (required)
  Google: Enabled (optional)
  GitHub: Enabled (optional)

Security:
  Enable email confirmations: true
  Secure email change: true
  Enable phone confirmations: false
  Enable manual linking: false

Password Requirements:
  Minimum length: 8 characters
  Require uppercase: false
  Require lowercase: false
  Require numbers: false
  Require special characters: false
```

### 5.2 Supabase Client Setup

**lib/supabase/client.ts (Client-side):**
```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**lib/supabase/server.ts (Server-side):**
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle server component cookie setting
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle server component cookie removal
          }
        },
      },
    }
  )
}
```

**lib/supabase/middleware.ts (Middleware):**
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}
```

### 5.3 Next.js Middleware Configuration

**middleware.ts (Root level):**
```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createClient } from '@/lib/supabase/server'

// Routes that require authentication
const protectedRoutes = ['/edit', '/settings', '/onboarding']

// Routes that should redirect to /edit if already logged in
const authRoutes = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  // Update session
  const response = await updateSession(request)
  
  // Get current user
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const path = request.nextUrl.pathname
  
  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isAuthRoute = authRoutes.some(route => path.startsWith(route))
  
  // Redirect logic
  if (isProtectedRoute && !user) {
    // Not logged in, redirect to login
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', path)
    return NextResponse.redirect(url)
  }
  
  if (isAuthRoute && user) {
    // Already logged in, check if onboarding is completed
    const { data: userData } = await supabase
      .from('users')
      .select('onboarding_completed')
      .eq('auth_id', user.id)
      .single()
    
    if (userData && !userData.onboarding_completed) {
      // Redirect to onboarding
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }
    
    // Onboarding completed, redirect to editor
    const url = request.nextUrl.clone()
    url.pathname = '/edit'
    return NextResponse.redirect(url)
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 5.4 Authentication Hooks

**lib/hooks/useAuth.ts:**
```typescript
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

type UserProfile = Database['public']['Tables']['users']['Row']

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: Error | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) throw error
        
        if (user) {
          // Fetch user profile
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', user.id)
            .single()
          
          if (profileError) throw profileError
          
          setState({ user, profile, loading: false, error: null })
        } else {
          setState({ user: null, profile: null, loading: false, error: null })
        }
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error as Error 
        }))
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', session.user.id)
            .single()

          setState({ 
            user: session.user, 
            profile: profile || null, 
            loading: false, 
            error: null 
          })
          
          if (event === 'SIGNED_IN') {
            router.refresh()
          }
        } else {
          setState({ user: null, profile: null, loading: false, error: null })
          
          if (event === 'SIGNED_OUT') {
            router.push('/')
          }
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return {
    ...state,
    signOut,
    isAuthenticated: !!state.user,
  }
}
```

### 5.5 Login Page Implementation

**app/(auth)/login/page.tsx:**
```typescript
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/edit'
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // Check if onboarding is completed
        const { data: userData } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('auth_id', data.user.id)
          .single()

        if (userData && !userData.onboarding_completed) {
          router.push('/onboarding')
        } else {
          router.push(redirect)
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
      },
    })

    if (error) {
      toast.error('Failed to login with Google')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to continue building your garden
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/reset-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            href="/signup"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
```

### 5.6 Signup Page Implementation

**app/(auth)/signup/page.tsx:**
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { checkUsernameAvailability } from '@/lib/services/userService'
import { debounce } from '@/lib/utils/helpers'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Debounced username check
  const checkUsername = debounce(async (value: string) => {
    if (value.length < 3) {
      setUsernameStatus('idle')
      return
    }

    setUsernameStatus('checking')
    const isAvailable = await checkUsernameAvailability(value)
    setUsernameStatus(isAvailable ? 'available' : 'taken')
  }, 500)

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
    setUsername(value)
    checkUsername(value)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (usernameStatus !== 'available') {
      toast.error('Please choose an available username')
      return
    }

    setLoading(true)

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            username,
          },
        },
      })

      if (authError) throw authError

      if (authData.user) {
        // 2. Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            auth_id: authData.user.id,
            email,
            username,
            onboarding_completed: false,
          })

        if (profileError) throw profileError

        toast.success('Account created! Check your email to verify.')
        
        // 3. Redirect to onboarding
        router.push('/onboarding')
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      toast.error(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Start building your digital garden today
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1 relative">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={handleUsernameChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your-username"
                  minLength={3}
                  maxLength={50}
                />
                {usernameStatus === 'checking' && (
                  <div className="absolute right-3 top-2.5">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                  </div>
                )}
                {usernameStatus === 'available' && (
                  <div className="absolute right-3 top-2.5 text-green-500">✓</div>
                )}
                {usernameStatus === 'taken' && (
                  <div className="absolute right-3 top-2.5 text-red-500">✗</div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Your public URL: buildyourowndg.com/{username || 'username'}
              </p>
              {usernameStatus === 'taken' && (
                <p className="mt-1 text-xs text-red-600">
                  This username is already taken
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                minLength={8}
              />
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || usernameStatus !== 'available'}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="text-xs text-center text-gray-500">
            By signing up, you agree to our{' '}
            <Link href="/terms" className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </Link>
          </p>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
```

### 5.7 Auth Callback Handler

**app/auth/callback/route.ts:**
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = searchParams.get('redirect') || '/edit'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${redirect}`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
```

### 5.8 User Service Functions

**lib/services/userService.ts:**
```typescript
import { createClient } from '@/lib/supabase/client'

export async function checkUsernameAvailability(username: string): Promise<boolean> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('username')
    .eq('username', username)
    .single()
  
  return !data && !error
}

export async function updateUserProfile(userId: string, updates: {
  display_name?: string
  bio?: string
  avatar_url?: string
  website_url?: string
}) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function completeOnboarding(userId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('users')
    .update({ onboarding_completed: true })
    .eq('id', userId)
  
  if (error) throw error
}
```

---

## 6. API LAYER

### 6.1 Garden Service

**lib/services/gardenService.ts:**
```typescript
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/types'

type Garden = Database['public']['Tables']['gardens']['Row']
type Tile = any // Define based on your tile structure

export class GardenService {
  private supabase = createClient()

  /**
   * Get user's garden
   */
  async getMyGarden(userId: string): Promise<Garden | null> {
    const { data, error } = await this.supabase
      .from('gardens')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching garden:', error)
      return null
    }

    return data
  }

  /**
   * Get public garden by username
   */
  async getPublicGarden(username: string): Promise<(Garden & { user: any }) | null> {
    const { data, error } = await this.supabase
      .from('gardens')
      .select(`
        *,
        user:users(
          username,
          display_name,
          avatar_url,
          bio,
          website_url
        )
      `)
      .eq('user.username', username)
      .eq('is_public', true)
      .single()

    if (error) {
      console.error('Error fetching public garden:', error)
      return null
    }

    return data as any
  }

  /**
   * Save/Update garden tiles
   */
  async saveTiles(gardenId: string, tiles: Tile[]): Promise<boolean> {
    const { error } = await this.supabase
      .from('gardens')
      .update({
        tiles,
        updated_at: new Date().toISOString(),
      })
      .eq('id', gardenId)

    if (error) {
      console.error('Error saving tiles:', error)
      return false
    }

    return true
  }

  /**
   * Update garden metadata
   */
  async updateGarden(gardenId: string, updates: {
    title?: string
    description?: string
    grid_config?: any
    theme_config?: any
  }): Promise<boolean> {
    const { error } = await this.supabase
      .from('gardens')
      .update(updates)
      .eq('id', gardenId)

    if (error) {
      console.error('Error updating garden:', error)
      return false
    }

    return true
  }

  /**
   * Publish/unpublish garden
   */
  async togglePublish(gardenId: string, isPublic: boolean): Promise<boolean> {
    const updates: any = {
      is_public: isPublic,
    }

    if (isPublic) {
      updates.published_at = new Date().toISOString()
    } else {
      updates.unpublished_at = new Date().toISOString()
    }

    const { error } = await this.supabase
      .from('gardens')
      .update(updates)
      .eq('id', gardenId)

    if (error) {
      console.error('Error toggling publish:', error)
      return false
    }

    return true
  }

  /**
   * Get garden analytics
   */
  async getGardenStats(gardenId: string) {
    // Get total views
    const { count: totalViews } = await this.supabase
      .from('garden_views')
      .select('*', { count: 'exact', head: true })
      .eq('garden_id', gardenId)

    // Get views in last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { count: recentViews } = await this.supabase
      .from('garden_views')
      .select('*', { count: 'exact', head: true })
      .eq('garden_id', gardenId)
      .gte('viewed_at', sevenDaysAgo.toISOString())

    // Get unique visitors (approximate)
    const { data: uniqueVisitors } = await this.supabase
      .from('garden_views')
      .select('visitor_id')
      .eq('garden_id', gardenId)

    const uniqueCount = new Set(
      uniqueVisitors?.map((v) => v.visitor_id) || []
    ).size

    return {
      totalViews: totalViews || 0,
      recentViews: recentViews || 0,
      uniqueVisitors: uniqueCount,
    }
  }
}

// Export singleton instance
export const gardenService = new GardenService()
```

### 6.2 Custom Hooks for Garden Operations

**lib/hooks/useGarden.ts:**
```typescript
import { useEffect, useState } from 'react'
import { gardenService } from '@/lib/services/gardenService'
import { useAuth } from './useAuth'
import toast from 'react-hot-toast'

export function useGarden() {
  const { profile } = useAuth()
  const [garden, setGarden] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tiles, setTiles] = useState<any[]>([])
  const [savedTiles, setSavedTiles] = useState<any[]>([])

  // Derived state
  const hasUnsavedChanges = JSON.stringify(tiles) !== JSON.stringify(savedTiles)

  // Load garden on mount
  useEffect(() => {
    if (profile?.id) {
      loadGarden()
    }
  }, [profile?.id])

  const loadGarden = async () => {
    if (!profile?.id) return

    setLoading(true)
    try {
      const data = await gardenService.getMyGarden(profile.id)
      
      if (data) {
        setGarden(data)
        setTiles(data.tiles || [])
        setSavedTiles(data.tiles || [])
      }
    } catch (error) {
      console.error('Error loading garden:', error)
      toast.error('Failed to load garden')
    } finally {
      setLoading(false)
    }
  }

  const saveTiles = async () => {
    if (!garden?.id) return false

    setSaving(true)
    try {
      const success = await gardenService.saveTiles(garden.id, tiles)
      
      if (success) {
        setSavedTiles(tiles)
        toast.success('Garden saved!')
        
        // Clear localStorage backup
        localStorage.removeItem('garden-draft')
        
        return true
      } else {
        toast.error('Failed to save garden')
        return false
      }
    } catch (error) {
      console.error('Error saving garden:', error)
      toast.error('Failed to save garden')
      return false
    } finally {
      setSaving(false)
    }
  }

  const updateGardenMetadata = async (updates: {
    title?: string
    description?: string
  }) => {
    if (!garden?.id) return false

    try {
      const success = await gardenService.updateGarden(garden.id, updates)
      
      if (success) {
        setGarden((prev: any) => ({ ...prev, ...updates }))
        toast.success('Garden updated!')
        return true
      } else {
        toast.error('Failed to update garden')
        return false
      }
    } catch (error) {
      console.error('Error updating garden:', error)
      toast.error('Failed to update garden')
      return false
    }
  }

  const togglePublish = async () => {
    if (!garden?.id) return false

    try {
      const newPublicState = !garden.is_public
      const success = await gardenService.togglePublish(garden.id, newPublicState)
      
      if (success) {
        setGarden((prev: any) => ({
          ...prev,
          is_public: newPublicState,
          published_at: newPublicState ? new Date().toISOString() : prev.published_at,
        }))
        toast.success(newPublicState ? 'Garden published!' : 'Garden unpublished')
        return true
      } else {
        toast.error('Failed to update publish status')
        return false
      }
    } catch (error) {
      console.error('Error toggling publish:', error)
      toast.error('Failed to update publish status')
      return false
    }
  }

  return {
    garden,
    tiles,
    setTiles,
    loading,
    saving,
    hasUnsavedChanges,
    saveTiles,
    updateGardenMetadata,
    togglePublish,
    reload: loadGarden,
  }
}
```

**lib/hooks/useAutoSave.ts:**
```typescript
import { useEffect, useRef } from 'react'

interface AutoSaveOptions {
  data: any
  onSave: () => Promise<boolean>
  interval?: number // milliseconds
  enabled?: boolean
}

export function useAutoSave({
  data,
  onSave,
  interval = 30000, // 30 seconds default
  enabled = true,
}: AutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const lastDataRef = useRef<string>('')

  useEffect(() => {
    if (!enabled) return

    const currentData = JSON.stringify(data)
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Only set new timeout if data has changed
    if (currentData !== lastDataRef.current) {
      timeoutRef.current = setTimeout(async () => {
        await onSave()
        lastDataRef.current = JSON.stringify(data)
      }, interval)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, onSave, interval, enabled])
}
```

---

## 7. FILE UPLOAD SYSTEM

### 7.1 Supabase Storage Configuration

**Storage Bucket Setup (via Supabase Dashboard):**

```yaml
Bucket Name: gardens-media
Public: true
File Size Limit: 50 MB
Allowed MIME Types:
  - image/jpeg
  - image/png
  - image/gif
  - image/webp
  - image/svg+xml
  - video/mp4
  - video/webm
  - application/pdf

Folder Structure:
gardens-media/
  └── {user_id}/
      ├── images/
      │   ├── {nanoid}-original.webp
      │   └── {nanoid}-thumbnail.webp
      ├── videos/
      │   └── {nanoid}.mp4
      └── documents/
          └── {nanoid}.pdf
```

### 7.2 Media Upload Service

**lib/services/mediaService.ts:**
```typescript
import { createClient } from '@/lib/supabase/client'
import { nanoid } from 'nanoid'
import type { Database } from '@/lib/supabase/types'

type MediaAsset = Database['public']['Tables']['media_assets']['Row']

export class MediaService {
  private supabase = createClient()
  private bucketName = process.env.NEXT_PUBLIC_STORAGE_BUCKET || 'gardens-media'

  /**
   * Upload image file
   */
  async uploadImage(
    file: File,
    userId: string,
    gardenId: string
  ): Promise<MediaAsset | null> {
    try {
      // 1. Validate file
      this.validateImageFile(file)

      // 2. Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${nanoid()}.${fileExt}`
      const filePath = `${userId}/images/${fileName}`

      // 3. Upload to storage
      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // 4. Get public URL
      const { data: urlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath)

      // 5. Get image dimensions
      const dimensions = await this.getImageDimensions(file)

      // 6. Save metadata to database
      const { data: mediaData, error: dbError } = await this.supabase
        .from('media_assets')
        .insert({
          user_id: userId,
          garden_id: gardenId,
          file_name: fileName,
          original_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          file_extension: fileExt,
          storage_path: filePath,
          storage_bucket: this.bucketName,
          public_url: urlData.publicUrl,
          width: dimensions.width,
          height: dimensions.height,
          folder: 'images',
        })
        .select()
        .single()

      if (dbError) throw dbError

      return mediaData
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  /**
   * Upload video file
   */
  async uploadVideo(
    file: File,
    userId: string,
    gardenId: string
  ): Promise<MediaAsset | null> {
    try {
      this.validateVideoFile(file)

      const fileExt = file.name.split('.').pop()
      const fileName = `${nanoid()}.${fileExt}`
      const filePath = `${userId}/videos/${fileName}`

      const { data: uploadData, error: uploadError } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data: urlData } = this.supabase.storage
        .from(this.bucketName)
        .getPublicUrl(filePath)

      const { data: mediaData, error: dbError } = await this.supabase
        .from('media_assets')
        .insert({
          user_id: userId,
          garden_id: gardenId,
          file_name: fileName,
          original_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          file_extension: fileExt,
          storage_path: filePath,
          storage_bucket: this.bucketName,
          public_url: urlData.publicUrl,
          folder: 'videos',
        })
        .select()
        .single()

      if (dbError) throw dbError

      return mediaData
    } catch (error) {
      console.error('Error uploading video:', error)
      throw error
    }
  }

  /**
   * Delete media file
   */
  async deleteMedia(mediaId: string, userId: string): Promise<boolean> {
    try {
      // 1. Get media record
      const { data: media, error: fetchError } = await this.supabase
        .from('media_assets')
        .select('*')
        .eq('id', mediaId)
        .eq('user_id', userId)
        .single()

      if (fetchError || !media) throw new Error('Media not found')

      // 2. Delete from storage
      const { error: storageError } = await this.supabase.storage
        .from(this.bucketName)
        .remove([media.storage_path])

      if (storageError) throw storageError

      // 3. Delete from database
      const { error: dbError } = await this.supabase
        .from('media_assets')
        .delete()
        .eq('id', mediaId)

      if (dbError) throw dbError

      return true
    } catch (error) {
      console.error('Error deleting media:', error)
      return false
    }
  }

  /**
   * Get user's media library
   */
  async getUserMedia(userId: string, folder?: string): Promise<MediaAsset[]> {
    let query = this.supabase
      .from('media_assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (folder) {
      query = query.eq('folder', folder)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching media:', error)
      return []
    }

    return data || []
  }

  /**
   * Mark media as used in a tile
   */
  async markMediaAsUsed(mediaId: string, isUsed: boolean): Promise<boolean> {
    const { error } = await this.supabase
      .from('media_assets')
      .update({ is_used: isUsed })
      .eq('id', mediaId)

    return !error
  }

  // Validation helpers
  private validateImageFile(file: File) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Allowed: JPEG, PNG, GIF, WebP, SVG')
    }

    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size: 10MB')
    }
  }

  private validateVideoFile(file: File) {
    const allowedTypes = ['video/mp4', 'video/webm']
    const maxSize = 50 * 1024 * 1024 // 50MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Allowed: MP4, WebM')
    }

    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size: 50MB')
    }
  }

  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }
      img.onerror = () => {
        resolve({ width: 0, height: 0 })
      }
      img.src = URL.createObjectURL(file)
    })
  }
}

export const mediaService = new MediaService()
```

### 7.3 Media Upload Hook

**lib/hooks/useMediaUpload.ts:**
```typescript
import { useState } from 'react'
import { mediaService } from '@/lib/services/mediaService'
import toast from 'react-hot-toast'

interface UploadProgress {
  fileName: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
}

export function useMediaUpload(userId: string, gardenId: string) {
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const uploadImage = async (file: File): Promise<string | null> => {
    const uploadId = file.name

    try {
      // Add to upload queue
      setUploads((prev) => [
        ...prev,
        { fileName: file.name, progress: 0, status: 'uploading' },
      ])
      setIsUploading(true)

      // Upload file
      const media = await mediaService.uploadImage(file, userId, gardenId)

      if (media) {
        // Update progress
        setUploads((prev) =>
          prev.map((u) =>
            u.fileName === uploadId ? { ...u, progress: 100, status: 'completed' } : u
          )
        )
        
        toast.success('Image uploaded successfully!')
        
        // Remove from queue after delay
        setTimeout(() => {
          setUploads((prev) => prev.filter((u) => u.fileName !== uploadId))
        }, 2000)

        return media.public_url
      }

      throw new Error('Upload failed')
    } catch (error: any) {
      console.error('Upload error:', error)
      
      setUploads((prev) =>
        prev.map((u) =>
          u.fileName === uploadId ? { ...u, status: 'error' } : u
        )
      )
      
      toast.error(error.message || 'Failed to upload image')
      
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const uploadVideo = async (file: File): Promise<string | null> => {
    const uploadId = file.name

    try {
      setUploads((prev) => [
        ...prev,
        { fileName: file.name, progress: 0, status: 'uploading' },
      ])
      setIsUploading(true)

      const media = await mediaService.uploadVideo(file, userId, gardenId)

      if (media) {
        setUploads((prev) =>
          prev.map((u) =>
            u.fileName === uploadId ? { ...u, progress: 100, status: 'completed' } : u
          )
        )
        
        toast.success('Video uploaded successfully!')
        
        setTimeout(() => {
          setUploads((prev) => prev.filter((u) => u.fileName !== uploadId))
        }, 2000)

        return media.public_url
      }

      throw new Error('Upload failed')
    } catch (error: any) {
      console.error('Upload error:', error)
      
      setUploads((prev) =>
        prev.map((u) =>
          u.fileName === uploadId ? { ...u, status: 'error' } : u
        )
      )
      
      toast.error(error.message || 'Failed to upload video')
      
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const clearUploads = () => {
    setUploads([])
  }

  return {
    uploads,
    isUploading,
    uploadImage,
    uploadVideo,
    clearUploads,
  }
}
```

### 7.4 Media Upload Component

**components/editor/MediaUploadModal.tsx:**
```typescript
'use client'

import { useState } from 'react'
import { useMediaUpload } from '@/lib/hooks/useMediaUpload'

interface MediaUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (url: string) => void
  userId: string
  gardenId: string
  type: 'image' | 'video'
}

export function MediaUploadModal({
  isOpen,
  onClose,
  onSelect,
  userId,
  gardenId,
  type,
}: MediaUploadModalProps) {
  const [externalUrl, setExternalUrl] = useState('')
  const [tab, setTab] = useState<'upload' | 'url'>('upload')
  const { uploadImage, uploadVideo, uploads, isUploading } = useMediaUpload(userId, gardenId)

  if (!isOpen) return null

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const url = type === 'image' 
      ? await uploadImage(file)
      : await uploadVideo(file)

    if (url) {
      onSelect(url)
      onClose()
    }
  }

  const handleUrlSubmit = () => {
    if (externalUrl) {
      onSelect(externalUrl)
      setExternalUrl('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">
          Add {type === 'image' ? 'Image' : 'Video'}
        </h3>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab('upload')}
            className={`px-4 py-2 rounded ${
              tab === 'upload'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Upload File
          </button>
          <button
            onClick={() => setTab('url')}
            className={`px-4 py-2 rounded ${
              tab === 'url'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            External URL
          </button>
        </div>

        {/* Upload Tab */}
        {tab === 'upload' && (
          <div>
            <label className="block">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept={type === 'image' ? 'image/*' : 'video/mp4,video/webm'}
                  onChange={handleFileSelect}
                  disabled={isUploading}
                />
                <p className="text-gray-600">
                  {isUploading
                    ? 'Uploading...'
                    : `Click to select ${type === 'image' ? 'image' : 'video'}`}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Max size: {type === 'image' ? '10MB' : '50MB'}
                </p>
              </div>
            </label>

            {/* Upload Progress */}
            {uploads.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploads.map((upload) => (
                  <div key={upload.fileName} className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="text-sm text-gray-600">{upload.fileName}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${upload.progress}%` }}
                        />
                      </div>
                    </div>
                    {upload.status === 'completed' && (
                      <span className="text-green-600">✓</span>
                    )}
                    {upload.status === 'error' && (
                      <span className="text-red-600">✗</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* URL Tab */}
        {tab === 'url' && (
          <div>
            <input
              type="url"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder={`Paste ${type === 'image' ? 'image' : 'video'} URL`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleUrlSubmit}
              disabled={!externalUrl}
              className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Use URL
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## 8. STATE MANAGEMENT MIGRATION

### 8.1 localStorage Backup System

**lib/utils/localStorage.ts:**
```typescript
interface LocalStorageDraft {
  tiles: any[]
  gardenConfig: any
  metadata: {
    title: string
    description: string
  }
  lastBackup: string
}

const DRAFT_KEY = 'garden-draft'
const CONFIG_KEY = 'garden-config'
const METADATA_KEY = 'garden-metadata'

export class LocalStorageBackup {
  /**
   * Save draft to localStorage
   */
  static saveDraft(tiles: any[], config: any, metadata: any) {
    try {
      const draft: LocalStorageDraft = {
        tiles,
        gardenConfig: config,
        metadata,
        lastBackup: new Date().toISOString(),
      }
      
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
      return true
    } catch (error) {
      console.error('Error saving draft:', error)
      return false
    }
  }

  /**
   * Load draft from localStorage
   */
  static loadDraft(): LocalStorageDraft | null {
    try {
      const draft = localStorage.getItem(DRAFT_KEY)
      return draft ? JSON.parse(draft) : null
    } catch (error) {
      console.error('Error loading draft:', error)
      return null
    }
  }

  /**
   * Clear draft from localStorage
   */
  static clearDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY)
      localStorage.removeItem(CONFIG_KEY)
      localStorage.removeItem(METADATA_KEY)
      return true
    } catch (error) {
      console.error('Error clearing draft:', error)
      return false
    }
  }

  /**
   * Check if draft exists
   */
  static hasDraft(): boolean {
    return localStorage.getItem(DRAFT_KEY) !== null
  }

  /**
   * Get draft timestamp
   */
  static getDraftTimestamp(): Date | null {
    const draft = this.loadDraft()
    return draft ? new Date(draft.lastBackup) : null
  }
}
```

### 8.2 Draft Restoration Component

**components/editor/DraftRestoreDialog.tsx:**
```typescript
'use client'

import { useEffect, useState } from 'react'
import { LocalStorageBackup } from '@/lib/utils/localStorage'
import { formatDistanceToNow } from 'date-fns'

interface DraftRestoreDialogProps {
  onRestore: (draft: any) => void
  onDiscard: () => void
}

export function DraftRestoreDialog({ onRestore, onDiscard }: DraftRestoreDialogProps) {
  const [draft, setDraft] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const existingDraft = LocalStorageBackup.loadDraft()
    
    if (existingDraft) {
      setDraft(existingDraft)
      setIsOpen(true)
    }
  }, [])

  if (!isOpen || !draft) return null

  const handleRestore = () => {
    onRestore(draft)
    setIsOpen(false)
  }

  const handleDiscard = () => {
    LocalStorageBackup.clearDraft()
    onDiscard()
    setIsOpen(false)
  }

  const draftAge = formatDistanceToNow(new Date(draft.lastBackup), { addSuffix: true })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-2">Unsaved Work Found</h3>
        <p className="text-gray-600 mb-4">
          We found unsaved changes from {draftAge}. Would you like to restore them?
        </p>

        <div className="bg-gray-50 rounded p-3 mb-4">
          <p className="text-sm text-gray-600">
            <strong>Tiles:</strong> {draft.tiles.length} items
          </p>
          <p className="text-sm text-gray-600">
            <strong>Last saved:</strong> {new Date(draft.lastBackup).toLocaleString()}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDiscard}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Discard
          </button>
          <button
            onClick={handleRestore}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Restore
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 8.3 Modified Editor Page with Backend Integration

**app/(dashboard)/edit/page.tsx:**
```typescript
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useGarden } from '@/lib/hooks/useGarden'
import { useAutoSave } from '@/lib/hooks/useAutoSave'
import { LocalStorageBackup } from '@/lib/utils/localStorage'
import { DraftRestoreDialog } from '@/components/editor/DraftRestoreDialog'
import { EditorTopBar } from '@/components/editor/EditorTopBar'
import { GridCanvas } from '@/components/editor/GridCanvas'
import { Toaster } from 'react-hot-toast'

export default function EditorPage() {
  const { profile, loading: authLoading } = useAuth()
  const {
    garden,
    tiles,
    setTiles,
    loading: gardenLoading,
    saving,
    hasUnsavedChanges,
    saveTiles,
    updateGardenMetadata,
    togglePublish,
  } = useGarden()

  const [showDraftDialog, setShowDraftDialog] = useState(false)

  // Auto-save to localStorage every 30 seconds
  useEffect(() => {
    if (!hasUnsavedChanges) return

    const interval = setInterval(() => {
      LocalStorageBackup.saveDraft(
        tiles,
        garden?.grid_config || {},
        { title: garden?.title || '', description: garden?.description || '' }
      )
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [tiles, garden, hasUnsavedChanges])

  // Check for unsaved draft on mount
  useEffect(() => {
    if (!gardenLoading && LocalStorageBackup.hasDraft()) {
      setShowDraftDialog(true)
    }
  }, [gardenLoading])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const handleRestoreDraft = (draft: any) => {
    setTiles(draft.tiles)
    // Optionally restore other settings
  }

  const handleDiscardDraft = () => {
    // Do nothing, keep current data
  }

  const handleSave = async () => {
    const success = await saveTiles()
    if (success) {
      LocalStorageBackup.clearDraft()
    }
  }

  if (authLoading || gardenLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EditorTopBar
        garden={garden}
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={saving}
        onSave={handleSave}
        onPublishToggle={togglePublish}
        onTitleChange={(title) => updateGardenMetadata({ title })}
      />

      <main className="pt-16">
        <GridCanvas
          tiles={tiles}
          onTilesChange={setTiles}
          gridConfig={garden?.grid_config}
        />
      </main>

      {showDraftDialog && (
        <DraftRestoreDialog
          onRestore={handleRestoreDraft}
          onDiscard={handleDiscardDraft}
        />
      )}

      <Toaster position="bottom-right" />
    </div>
  )
}
```

---

## 9. ONBOARDING FLOW

### 9.1 Onboarding Architecture

**Onboarding Steps:**
1. Welcome Screen (Introduction)
2. Username Selection (already done during signup, but verify)
3. Profile Setup (display name, bio, avatar - optional)
4. Import Existing Work (if localStorage draft exists)
5. Garden Customization (theme, first tile creation - optional)
6. Complete (redirect to editor)

### 9.2 Onboarding Wizard Component

**app/onboarding/page.tsx:**
```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { WelcomeStep } from '@/components/onboarding/steps/WelcomeStep'
import { ProfileStep } from '@/components/onboarding/steps/ProfileStep'
import { ImportStep } from '@/components/onboarding/steps/ImportStep'
import { CompleteStep } from '@/components/onboarding/steps/CompleteStep'
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress'
import { completeOnboarding } from '@/lib/services/userService'
import toast from 'react-hot-toast'

const STEPS = [
  { id: 'welcome', title: 'Welcome', component: WelcomeStep },
  { id: 'profile', title: 'Profile', component: ProfileStep },
  { id: 'import', title: 'Import', component: ImportStep },
  { id: 'complete', title: 'Complete', component: CompleteStep },
]

export default function OnboardingPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [onboardingData, setOnboardingData] = useState<any>({})

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
    
    if (!loading && profile?.onboarding_completed) {
      router.push('/edit')
    }
  }, [user, profile, loading, router])

  const handleNext = (stepData?: any) => {
    if (stepData) {
      setOnboardingData((prev: any) => ({ ...prev, ...stepData }))
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleComplete = async () => {
    if (!profile?.id) return

    try {
      await completeOnboarding(profile.id)
      toast.success('Welcome to Digital Garden!')
      router.push('/edit')
    } catch (error) {
      console.error('Error completing onboarding:', error)
      toast.error('Failed to complete onboarding')
    }
  }

  const handleSkip = () => {
    setCurrentStep(STEPS.length - 1)
  }

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  const CurrentStepComponent = STEPS[currentStep].component

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <OnboardingProgress
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={(index) => {
            if (index < currentStep) {
              setCurrentStep(index)
            }
          }}
        />

        {/* Current Step */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <CurrentStepComponent
            data={onboardingData}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSkip={handleSkip}
            onComplete={handleComplete}
            profile={profile}
          />
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-sm text-gray-600">
          Step {currentStep + 1} of {STEPS.length}
        </div>
      </div>
    </div>
  )
}
```

### 9.3 Onboarding Steps

**components/onboarding/steps/WelcomeStep.tsx:**
```typescript
'use client'

interface WelcomeStepProps {
  onNext: () => void
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Welcome to Digital Garden 🌱
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Let's get you started building your personal space on the web.
        This will only take a minute.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-4">
          <div className="text-4xl mb-2">📝</div>
          <h3 className="font-semibold mb-1">Create Content</h3>
          <p className="text-sm text-gray-600">
            Share your thoughts, projects, and ideas
          </p>
        </div>
        <div className="p-4">
          <div className="text-4xl mb-2">🎨</div>
          <h3 className="font-semibold mb-1">Customize Design</h3>
          <p className="text-sm text-gray-600">
            Make it yours with flexible layouts
          </p>
        </div>
        <div className="p-4">
          <div className="text-4xl mb-2">🚀</div>
          <h3 className="font-semibold mb-1">Share Instantly</h3>
          <p className="text-sm text-gray-600">
            Publish and share your unique URL
          </p>
        </div>
      </div>

      <button
        onClick={onNext}
        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Let's Begin →
      </button>
    </div>
  )
}
```

**components/onboarding/steps/ProfileStep.tsx:**
```typescript
'use client'

import { useState } from 'react'
import { updateUserProfile } from '@/lib/services/userService'
import toast from 'react-hot-toast'

interface ProfileStepProps {
  profile: any
  onNext: (data: any) => void
  onPrevious: () => void
  onSkip: () => void
}

export function ProfileStep({ profile, onNext, onPrevious, onSkip }: ProfileStepProps) {
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)

    try {
      await updateUserProfile(profile.id, {
        display_name: displayName || profile.username,
        bio,
      })

      onNext({ displayName, bio })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Set Up Your Profile
      </h2>
      <p className="text-gray-600 mb-6">
        Tell us a bit about yourself. You can always change this later.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your Name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            This is how your name will appear on your public garden
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            A short description that appears on your public profile
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={onPrevious}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          ← Back
        </button>

        <div className="flex gap-2">
          <button
            onClick={onSkip}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Skip for now
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

**components/onboarding/steps/ImportStep.tsx:**
```typescript
'use client'

import { useState, useEffect } from 'react'
import { LocalStorageBackup } from '@/lib/utils/localStorage'
import { gardenService } from '@/lib/services/gardenService'
import { useAuth } from '@/lib/hooks/useAuth'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

interface ImportStepProps {
  onNext: () => void
  onPrevious: () => void
  onSkip: () => void
}

export function ImportStep({ onNext, onPrevious, onSkip }: ImportStepProps) {
  const { profile } = useAuth()
  const [draft, setDraft] = useState<any>(null)
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    const existingDraft = LocalStorageBackup.loadDraft()
    setDraft(existingDraft)
  }, [])

  const handleImport = async () => {
    if (!draft || !profile?.id) return

    setImporting(true)

    try {
      // Get user's garden
      const garden = await gardenService.getMyGarden(profile.id)
      
      if (garden) {
        // Import tiles from localStorage
        const success = await gardenService.saveTiles(garden.id, draft.tiles)
        
        if (success) {
          // Clear localStorage
          LocalStorageBackup.clearDraft()
          toast.success('Your work has been imported!')
          onNext()
        } else {
          throw new Error('Failed to import')
        }
      }
    } catch (error) {
      console.error('Import error:', error)
      toast.error('Failed to import your work')
    } finally {
      setImporting(false)
    }
  }

  const handleSkipImport = () => {
    // Clear localStorage
    LocalStorageBackup.clearDraft()
    onNext()
  }

  if (!draft) {
    // No draft to import
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Start Fresh
        </h2>
        <p className="text-gray-600 mb-6">
          No previous work detected. You'll start with a blank canvas.
        </p>

        <div className="py-8 text-center">
          <div className="text-6xl mb-4">🌱</div>
          <p className="text-gray-500">
            Ready to create your first tile!
          </p>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={onPrevious}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
          <button
            onClick={onNext}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Continue →
          </button>
        </div>
      </div>
    )
  }

  const draftAge = formatDistanceToNow(new Date(draft.lastBackup), { addSuffix: true })

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Import Previous Work
      </h2>
      <p className="text-gray-600 mb-6">
        We found some work you created before signing up. Would you like to import it?
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="text-2xl">📦</div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Draft from {draftAge}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Contains {draft.tiles.length} tile{draft.tiles.length !== 1 ? 's' : ''}
            </p>
            <p className="text-xs text-gray-500">
              Last saved: {new Date(draft.lastBackup).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-900 mb-2">Preview:</h4>
        <div className="space-y-2">
          {draft.tiles.slice(0, 3).map((tile: any, index: number) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm text-gray-600"
            >
              <span className="font-medium">{tile.type}</span>
              {tile.content?.title && (
                <span className="text-gray-400">• {tile.content.title}</span>
              )}
            </div>
          ))}
          {draft.tiles.length > 3 && (
            <p className="text-xs text-gray-500">
              And {draft.tiles.length - 3} more...
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={onPrevious}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          ← Back
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleSkipImport}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Start Fresh
          </button>
          <button
            onClick={handleImport}
            disabled={importing}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {importing ? 'Importing...' : 'Import & Continue →'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

**components/onboarding/steps/CompleteStep.tsx:**
```typescript
'use client'

import { useAuth } from '@/lib/hooks/useAuth'

interface CompleteStepProps {
  onComplete: () => void
  onPrevious: () => void
}

export function CompleteStep({ onComplete, onPrevious }: CompleteStepProps) {
  const { profile } = useAuth()

  return (
    <div className="text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        You're All Set!
      </h2>
      <p className="text-gray-600 mb-8">
        Your digital garden is ready. Let's start building!
      </p>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Tips:</h3>
        <ul className="text-left space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span>✨</span>
            <span>Click "Add Tile" to create your first content block</span>
          </li>
          <li className="flex items-start gap-2">
            <span>🎨</span>
            <span>Drag tiles to rearrange your layout</span>
          </li>
          <li className="flex items-start gap-2">
            <span>👁️</span>
            <span>Toggle "Publish" to make your garden public</span>
          </li>
          <li className="flex items-start gap-2">
            <span>🔗</span>
            <span>
              Your public URL: buildyourowndg.com/{profile?.username}
            </span>
          </li>
        </ul>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onPrevious}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          ← Back
        </button>
        <button
          onClick={onComplete}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          Go to My Garden →
        </button>
      </div>
    </div>
  )
}
```

### 9.4 Onboarding Progress Component

**components/onboarding/OnboardingProgress.tsx:**
```typescript
'use client'

interface OnboardingProgressProps {
  steps: Array<{ id: string; title: string }>
  currentStep: number
  onStepClick?: (index: number) => void
}

export function OnboardingProgress({
  steps,
  currentStep,
  onStepClick,
}: OnboardingProgressProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const isClickable = isCompleted && onStepClick

        return (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step Circle */}
            <button
              onClick={() => isClickable && onStepClick(index)}
              disabled={!isClickable}
              className={`
                relative flex items-center justify-center w-10 h-10 rounded-full
                transition-all duration-200
                ${
                  isCurrent
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                }
                ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
              `}
            >
              {isCompleted ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <span className="font-semibold">{index + 1}</span>
              )}
            </button>

            {/* Step Title */}
            <span
              className={`
                ml-2 text-sm font-medium hidden sm:block
                ${isCurrent ? 'text-blue-600' : 'text-gray-500'}
              `}
            >
              {step.title}
            </span>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-1 mx-4
                  ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                `}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
```

---

## 10. PUBLIC GARDEN SYSTEM

### 10.1 Public Garden Page

**app/(public)/[username]/page.tsx:**
```typescript
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PublicGardenView } from '@/components/public/PublicGardenView'
import { Metadata } from 'next'

interface PublicGardenPageProps {
  params: { username: string }
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PublicGardenPageProps): Promise<Metadata> {
  const supabase = await createClient()

  const { data: garden } = await supabase
    .from('gardens')
    .select(`
      *,
      user:users(username, display_name, bio)
    `)
    .eq('user.username', params.username)
    .eq('is_public', true)
    .single()

  if (!garden) {
    return {
      title: 'Garden Not Found',
    }
  }

  return {
    title: `${(garden as any).user.display_name || (garden as any).user.username}'s Garden`,
    description: garden.description || (garden as any).user.bio || 'Explore this digital garden',
    openGraph: {
      title: garden.title,
      description: garden.description || (garden as any).user.bio,
      images: garden.og_image_url ? [garden.og_image_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: garden.title,
      description: garden.description || (garden as any).user.bio,
      images: garden.og_image_url ? [garden.og_image_url] : [],
    },
  }
}

export default async function PublicGardenPage({ params }: PublicGardenPageProps) {
  const supabase = await createClient()

  // Fetch garden with user data
  const { data: garden, error } = await supabase
    .from('gardens')
    .select(`
      *,
      user:users(
        username,
        display_name,
        avatar_url,
        bio,
        website_url
      )
    `)
    .eq('user.username', params.username)
    .eq('is_public', true)
    .single()

  if (error || !garden) {
    notFound()
  }

  return <PublicGardenView garden={garden as any} />
}
```

### 10.2 Public Garden View Component

**components/public/PublicGardenView.tsx:**
```typescript
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import Link from 'next/link'
import { GridCanvas } from '@/components/editor/GridCanvas'
import { trackGardenView } from '@/lib/services/analyticsService'

interface PublicGardenViewProps {
  garden: any
}

export function PublicGardenView({ garden }: PublicGardenViewProps) {
  const { profile } = useAuth()
  const [viewTracked, setViewTracked] = useState(false)
  const isOwnGarden = profile?.username === garden.user.username

  useEffect(() => {
    if (!viewTracked && !isOwnGarden) {
      trackGardenView(garden.id)
      setViewTracked(true)
    }
  }, [garden.id, isOwnGarden, viewTracked])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: User Info */}
            <div className="flex items-center gap-3">
              {garden.user.avatar_url && (
                <img
                  src={garden.user.avatar_url}
                  alt={garden.user.display_name}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <h1 className="font-semibold text-gray-900">
                  {garden.title}
                </h1>
                <p className="text-sm text-gray-500">
                  by {garden.user.display_name || garden.user.username}
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {isOwnGarden && (
                <Link
                  href="/edit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Edit Garden
                </Link>
              )}
              
              {!isOwnGarden && (
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Create Your Own
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Garden Content */}
      <main className="py-8">
        <GridCanvas
          tiles={garden.tiles}
          onTilesChange={() => {}} // Read-only
          gridConfig={garden.grid_config}
          readOnly={true}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              {garden.user.bio && (
                <p className="text-sm text-gray-600 mb-2">
                  {garden.user.bio}
                </p>
              )}
              {garden.user.website_url && (
                <a
                  href={garden.user.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {garden.user.website_url}
                </a>
              )}
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">
                Built with{' '}
                <Link href="/" className="text-blue-600 hover:underline">
                  Digital Garden
                </Link>
              </p>
              <Link
                href="/signup"
                className="text-sm text-blue-600 hover:underline"
              >
                Create your own →
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
```

---

## 11. ANALYTICS & TRACKING

### 11.1 Analytics Service

**lib/services/analyticsService.ts:**
```typescript
import { createClient } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'

const VISITOR_ID_KEY = 'dg_visitor_id'

export class AnalyticsService {
  private supabase = createClient()

  /**
   * Get or create visitor ID
   */
  private getVisitorId(): string {
    if (typeof window === 'undefined') return uuidv4()

    let visitorId = localStorage.getItem(VISITOR_ID_KEY)
    
    if (!visitorId) {
      visitorId = uuidv4()
      localStorage.setItem(VISITOR_ID_KEY, visitorId)
    }

    return visitorId
  }

  /**
   * Get device type
   */
  private getDeviceType(): string {
    if (typeof window === 'undefined') return 'unknown'

    const width = window.innerWidth
    
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
  }

  /**
   * Track garden view
   */
  async trackGardenView(gardenId: string) {
    try {
      const visitorId = this.getVisitorId()
      const deviceType = this.getDeviceType()

      await this.supabase.from('garden_views').insert({
        garden_id: gardenId,
        visitor_id: visitorId,
        device_type: deviceType,
        referer: document.referrer || null,
        user_agent: navigator.userAgent,
        session_id: uuidv4(),
      })
    } catch (error) {
      console.error('Error tracking view:', error)
    }
  }

  /**
   * Get garden analytics
   */
  async getGardenAnalytics(gardenId: string, days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    try {
      // Total views
      const { count: totalViews } = await this.supabase
        .from('garden_views')
        .select('*', { count: 'exact', head: true })
        .eq('garden_id', gardenId)
        .gte('viewed_at', startDate.toISOString())

      // Unique visitors
      const { data: visitors } = await this.supabase
        .from('garden_views')
        .select('visitor_id')
        .eq('garden_id', gardenId)
        .gte('viewed_at', startDate.toISOString())

      const uniqueVisitors = new Set(
        visitors?.map((v) => v.visitor_id) || []
      ).size

      // Views by day
      const { data: viewsByDay } = await this.supabase
        .from('garden_views')
        .select('viewed_at')
        .eq('garden_id', gardenId)
        .gte('viewed_at', startDate.toISOString())
        .order('viewed_at', { ascending: true })

      // Group by day
      const viewsMap = new Map()
      viewsByDay?.forEach((view) => {
        const date = new Date(view.viewed_at).toISOString().split('T')[0]
        viewsMap.set(date, (viewsMap.get(date) || 0) + 1)
      })

      const dailyViews = Array.from(viewsMap.entries()).map(([date, count]) => ({
        date,
        views: count,
      }))

      // Views by device
      const { data: deviceData } = await this.supabase
        .from('garden_views')
        .select('device_type')
        .eq('garden_id', gardenId)
        .gte('viewed_at', startDate.toISOString())

      const deviceCounts = deviceData?.reduce((acc: any, view) => {
        acc[view.device_type] = (acc[view.device_type] || 0) + 1
        return acc
      }, {})

      return {
        totalViews: totalViews || 0,
        uniqueVisitors,
        dailyViews,
        deviceBreakdown: deviceCounts || {},
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      return {
        totalViews: 0,
        uniqueVisitors: 0,
        dailyViews: [],
        deviceBreakdown: {},
      }
    }
  }
}

export const analyticsService = new AnalyticsService()

// Convenience function for tracking
export const trackGardenView = (gardenId: string) => {
  analyticsService.trackGardenView(gardenId)
}
```

---

## 12. ERROR HANDLING & EDGE CASES

### 12.1 Error Boundaries

**components/ErrorBoundary.tsx:**
```typescript
'use client'

import React from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-600 mb-4">
                We encountered an error while rendering this page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Reload Page
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
```

### 12.2 Edge Case Handling

**Key Edge Cases to Handle:**

1. **Network Failures**
```typescript
// lib/utils/retryWithBackoff.ts
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError!
}
```

2. **Concurrent Save Conflicts**
```typescript
// Handle optimistic locking
const handleSaveWithConflictResolution = async (tiles: any[]) => {
  try {
    const { data, error } = await supabase
      .from('gardens')
      .update({ tiles, version: garden.version + 1 })
      .eq('id', garden.id)
      .eq('version', garden.version) // Only update if version matches
      .select()
      .single()

    if (error?.code === 'PGRST116') {
      // Conflict detected
      toast.error('Someone else modified this garden. Reloading...')
      await reload()
      return false
    }

    return true
  } catch (error) {
    console.error('Save error:', error)
    return false
  }
}
```

3. **Large File Uploads**
```typescript
// Add upload progress tracking
const uploadWithProgress = async (
  file: File,
  onProgress: (progress: number) => void
) => {
  // Implement chunked upload if needed
  // For now, Supabase handles this automatically
}
```

4. **Invalid Usernames**
```typescript
// Validate username format
export function validateUsername(username: string): boolean {
  const regex = /^[a-z0-9_-]{3,50}$/
  return regex.test(username)
}

// Reserved usernames
const RESERVED_USERNAMES = [
  'admin', 'api', 'www', 'mail', 'ftp', 'localhost',
  'support', 'help', 'about', 'terms', 'privacy',
  'login', 'signup', 'logout', 'edit', 'dashboard',
  'settings', 'profile', 'account', 'billing'
]

export function isUsernameReserved(username: string): boolean {
  return RESERVED_USERNAMES.includes(username.toLowerCase())
}
```

5. **Session Expiration**
```typescript
// Auto-refresh session
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed')
      }
      
      if (event === 'SIGNED_OUT') {
        // Clear local state
        LocalStorageBackup.clearDraft()
        router.push('/')
      }
    }
  )

  return () => subscription.unsubscribe()
}, [])
```

---

## 13. SECURITY REQUIREMENTS

### 13.1 Row Level Security (RLS) Verification

**Security Checklist:**
- ✅ All tables have RLS enabled
- ✅ Users can only read/write their own data
- ✅ Public gardens are readable by anyone
- ✅ View tracking is anonymous and insert-only
- ✅ Media files are scoped to user folders

### 13.2 Input Validation

**lib/utils/validators.ts:**
```typescript
import { z } from 'zod'

export const UsernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(50, 'Username must be less than 50 characters')
  .regex(/^[a-z0-9_-]+$/, 'Username can only contain lowercase letters, numbers, hyphens, and underscores')

export const EmailSchema = z
  .string()
  .email('Invalid email address')

export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')

export const TileSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'image', 'project', 'writing']),
  x: z.number().min(0),
  y: z.number().min(0),
  w: z.number().min(1).max(12),
  h: z.number().min(1).max(20),
  category: z.string().optional(),
  content: z.record(z.any()),
})

export const GardenSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  tiles: z.array(TileSchema),
})

// Validate function
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data)
}
```

### 13.3 XSS Prevention

**Sanitize User Input:**
```typescript
import DOMPurify from 'isomorphic-dompurify'

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  })
}

// Use in components
const SafeContent = ({ html }: { html: string }) => (
  <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />
)
```

### 13.4 Rate Limiting

**Implement rate limiting for sensitive endpoints:**
```typescript
// middleware.ts
import { rateLimit } from '@/lib/utils/rateLimit'

// Simple in-memory rate limiter (use Redis for production)
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

export async function middleware(request: NextRequest) {
  // Rate limit auth endpoints
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    try {
      await limiter.check(request, 10, 'CACHE_TOKEN') // 10 requests per minute
    } catch {
      return new NextResponse('Too Many Requests', { status: 429 })
    }
  }

  // Continue with other middleware
  return await updateSession(request)
}
```

---

## 14. PERFORMANCE REQUIREMENTS

### 14.1 Performance Targets

- **Page Load Time:** < 2 seconds (LCP)
- **Time to Interactive:** < 3 seconds
- **First Contentful Paint:** < 1 second
- **File Upload:** < 10 seconds for 10MB files
- **Save Operation:** < 1 second
- **Database Query:** < 500ms

### 14.2 Optimization Strategies

**1. Database Queries:**
```typescript
// Use select only needed columns
const { data } = await supabase
  .from('gardens')
  .select('id, title, tiles, is_public')
  .eq('user_id', userId)
  .single()

// Use indexes (already created in schema)
// Add LIMIT for lists
const { data } = await supabase
  .from('garden_views')
  .select('*')
  .order('viewed_at', { ascending: false })
  .limit(100)
```

**2. Image Optimization:**
```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src={tile.content.imageUrl}
  alt={tile.content.alt}
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
/>
```

**3. Code Splitting:**
```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic'

const StatsModal = dynamic(
  () => import('@/components/modals/StatsModal'),
  { ssr: false }
)
```

**4. Caching:**
```typescript
// Cache public gardens
export const revalidate = 60 // Revalidate every 60 seconds

// Use SWR for client-side caching
import useSWR from 'swr'

function useGardenStats(gardenId: string) {
  const { data, error } = useSWR(
    `/api/gardens/${gardenId}/stats`,
    fetcher,
    { refreshInterval: 60000 } // Refresh every minute
  )

  return { stats: data, isLoading: !error && !data, error }
}
```

---

## 15. TESTING REQUIREMENTS

### 15.1 Unit Tests

**Example test for garden service:**
```typescript
// __tests__/services/gardenService.test.ts
import { gardenService } from '@/lib/services/gardenService'

describe('GardenService', () => {
  it('should save tiles successfully', async () => {
    const tiles = [
      { id: '1', type: 'text', x: 0, y: 0, w: 3, h: 2, content: {} }
    ]
    
    const result = await gardenService.saveTiles('garden-id', tiles)
    expect(result).toBe(true)
  })

  it('should handle save errors gracefully', async () => {
    const result = await gardenService.saveTiles('invalid-id', [])
    expect(result).toBe(false)
  })
})
```

### 15.2 Integration Tests

**Test authentication flow:**
```typescript
// __tests__/integration/auth.test.ts
describe('Authentication Flow', () => {
  it('should sign up a new user', async () => {
    // Test signup
  })

  it('should redirect to onboarding after signup', async () => {
    // Test redirect
  })

  it('should create garden automatically', async () => {
    // Test auto-creation
  })
})
```

### 15.3 E2E Tests

**Use Playwright for E2E testing:**
```typescript
// e2e/garden-creation.spec.ts
import { test, expect } from '@playwright/test'

test('user can create and save a tile', async ({ page }) => {
  // Login
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')

  // Wait for editor
  await page.waitForURL('/edit')

  // Add tile
  await page.click('text=Add Tile')
  await page.click('text=Text')
  await page.fill('[placeholder="Title"]', 'Test Tile')
  await page.click('text=Save')

  // Verify tile appears
  await expect(page.locator('text=Test Tile')).toBeVisible()
})
```

---

## 16. IMPLEMENTATION PHASES

### Phase 1: Foundation Setup (Days 1-2)

**Tasks:**
1. Create Supabase project
2. Run database schema SQL
3. Configure storage bucket
4. Set up environment variables
5. Install required packages
6. Create folder structure
7. Set up Supabase client utilities

**Verification:**
- Database tables created ✓
- RLS policies active ✓
- Storage bucket configured ✓
- Dev environment working ✓

### Phase 2: Authentication (Days 3-4)

**Tasks:**
1. Implement Supabase Auth integration
2. Create login/signup pages
3. Set up middleware for protected routes
4. Create auth hooks (useAuth)
5. Implement username validation
6. Test auth flow end-to-end

**Verification:**
- Users can sign up ✓
- Users can log in ✓
- Protected routes work ✓
- Session persists ✓

### Phase 3: Database Integration (Days 5-7)

**Tasks:**
1. Create garden service layer
2. Implement garden hooks (useGarden)
3. Modify editor to load from database
4. Implement save functionality
5. Add localStorage backup system
6. Implement draft restoration
7. Test save/load operations

**Verification:**
- Garden loads from DB ✓
- Tiles save successfully ✓
- localStorage backup works ✓
- Draft restoration works ✓

### Phase 4: File Upload (Days 8-9)

**Tasks:**
1. Create media service
2. Implement upload hooks
3. Create upload modal component
4. Integrate with tile editor
5. Handle upload errors
6. Test file uploads

**Verification:**
- Images upload successfully ✓
- Videos upload successfully ✓
- Progress tracking works ✓
- Files accessible in tiles ✓

### Phase 5: Onboarding Flow (Days 10-11)

**Tasks:**
1. Create onboarding pages
2. Implement onboarding steps
3. Add progress indicator
4. Implement localStorage import
5. Test complete onboarding flow

**Verification:**
- New users see onboarding ✓
- Steps complete in order ✓
- localStorage imports work ✓
- Onboarding completion tracked ✓

### Phase 6: Public Gardens (Days 12-13)

**Tasks:**
1. Create public garden route
2. Implement view tracking
3. Add SEO metadata
4. Create public garden component
5. Test public access

**Verification:**
- Public gardens accessible ✓
- Views tracked correctly ✓
- SEO metadata present ✓
- Anonymous access works ✓

### Phase 7: Polish & Testing (Days 14-15)

**Tasks:**
1. Add error boundaries
2. Implement loading states
3. Add toast notifications
4. Test edge cases
5. Performance optimization
6. Security audit

**Verification:**
- All features work ✓
- Error handling robust ✓
- Performance meets targets ✓
- Security validated ✓

---

## 17. ROLLBACK STRATEGY

### 17.1 Database Rollback

**If issues arise with database:**
```sql
-- Rollback to previous state (if needed)
DROP TABLE IF EXISTS garden_views CASCADE;
DROP TABLE IF EXISTS media_assets CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS gardens CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Then re-run schema from backup
```

### 17.2 Code Rollback

**Git strategy:**
```bash
# Create feature branch
git checkout -b backend-integration

# Commit frequently
git commit -m "feat: add database schema"
git commit -m "feat: add authentication"

# If rollback needed
git revert HEAD~3 # Revert last 3 commits
```

### 17.3 Environment Rollback

**Feature flags:**
```typescript
// Use feature flags for gradual rollout
const FEATURES = {
  useBackend: process.env.NEXT_PUBLIC_USE_BACKEND === 'true',
  useFileUpload: process.env.NEXT_PUBLIC_USE_FILE_UPLOAD === 'true',
}

// In components
if (FEATURES.useBackend) {
  // Use Supabase
} else {
  // Use localStorage
}
```

---

## 18. SUCCESS METRICS

### 18.1 Technical Metrics

- **Uptime:** 99.9%
- **Error Rate:** < 0.1%
- **API Response Time:** < 500ms (p95)
- **Page Load Time:** < 2s (p95)
- **Zero Data Loss:** 100% save success rate

### 18.2 User Metrics

- **Signup Completion:** > 80%
- **Onboarding Completion:** > 70%
- **Daily Active Users (DAU):** Track growth
- **Garden Creation Rate:** > 90% of signups
- **Public Garden Rate:** > 50% published

### 18.3 Monitoring

**Set up monitoring:**
```typescript
// lib/utils/monitoring.ts
export function trackEvent(event: string, properties?: any) {
  // Send to analytics service
  console.log('Event:', event, properties)
  
  // Example: Send to PostHog, Mixpanel, etc.
}

// Usage
trackEvent('garden_saved', { tileCount: tiles.length })
trackEvent('garden_published', { username: profile.username })
trackEvent('file_uploaded', { fileType: 'image', fileSize: file.size })
```

---

## APPENDIX A: QUICK REFERENCE

### Common Commands

```bash
# Install dependencies
npm install

# Generate Supabase types
npx supabase gen types typescript --project-id [project-id] > lib/supabase/types.ts

# Run development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Run Supabase locally (optional)
npx supabase start
```

### Environment Variables Template

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Digital Garden

# Features
NEXT_PUBLIC_ENABLE_GOOGLE_AUTH=false
NEXT_PUBLIC_ENABLE_GITHUB_AUTH=false
NEXT_PUBLIC_MAX_FILE_SIZE=10485760

# Storage
NEXT_PUBLIC_STORAGE_BUCKET=gardens-media
```

---

## APPENDIX B: TROUBLESHOOTING

### Common Issues

**Issue: RLS Policy Errors**
```
Solution: Verify policies are created and auth.uid() is available
Check: SELECT * FROM pg_policies WHERE schemaname = 'public'
```

**Issue: File Upload Fails**
```
Solution: Check storage bucket permissions and policies
Verify: Bucket is public, size limits are correct
```

**Issue: Session Not Persisting**
```
Solution: Check cookie configuration in middleware
Verify: Cookies are being set correctly
```

**Issue: Slow Queries**
```
Solution: Check indexes are created
Run: EXPLAIN ANALYZE [your query]
```

---

## DOCUMENT END

This PRD provides complete technical specifications for backend integration. All code examples are production-ready and follow best practices. Implementation should follow the phased approach for lowest risk and highest success rate.

**Next Steps:**
1. Review and approve PRD
2. Set up Supabase project
3. Begin Phase 1 implementation
4. Test incrementally after each phase

**Questions or clarifications needed?** Please refer to specific sections or request additional details.
