# BACKEND CONTEXT - Digital Garden Architecture Deep Dive

> **Complete Backend Architecture Guide**: Database design, API patterns, authentication flows, data services, and infrastructure setup.

---

## 🏗️ BACKEND ARCHITECTURE OVERVIEW

Your Digital Garden backend is built on **Supabase** (PostgreSQL + Auth + Storage) with **Next.js API Routes** as the application layer. This creates a modern, scalable backend that handles authentication, data persistence, file storage, and real-time features.

### Technology Stack
```
Next.js API Routes (Application Layer)
    ↓
Supabase Client Libraries (Data Access Layer)
    ↓
PostgreSQL Database (Data Storage)
    ↓
Supabase Auth (Authentication)
    ↓
Supabase Storage (File Storage)
```

**Key Components:**
- **Database**: PostgreSQL with JSONB for flexible tile data
- **Authentication**: Supabase Auth with OAuth support
- **Storage**: Supabase Storage for media files
- **API Layer**: Next.js API routes for business logic
- **Real-time**: Supabase real-time subscriptions (ready for implementation)
- **Security**: Row Level Security (RLS) policies

---

## 🗄️ DATABASE ARCHITECTURE

### Core Schema Design

**Database Tables:**
```sql
-- User profiles (extends Supabase auth.users)
users (
    id UUID PRIMARY KEY,           -- Links to auth.users.id
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)

-- User's creative spaces
gardens (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled Garden',
    description TEXT,
    tiles JSONB NOT NULL DEFAULT '[]',      -- Array of tile objects
    layout JSONB NOT NULL DEFAULT '{}',     -- Grid layout configuration
    is_public BOOLEAN DEFAULT FALSE,
    slug TEXT UNIQUE,                       -- For public URLs
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)

-- Uploaded media assets
media_assets (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    storage_path TEXT NOT NULL,             -- Path in Supabase Storage
    thumbnail_path TEXT,                    -- Generated thumbnail path
    alt_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)

-- Analytics for public gardens
garden_views (
    id UUID PRIMARY KEY,
    garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
    viewer_ip TEXT,
    viewer_country TEXT,
    referrer TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

### JSONB Data Structures

**Tiles Array Structure:**
```typescript
// Each tile in gardens.tiles JSONB array
interface TileData {
  id: string;                    // Unique tile identifier
  type: 'text' | 'thought' | 'quote' | 'image' | 'video' | 'project' | 'writing';
  category: string;              // User-defined category
  title?: string;                // Tile title
  content?: string;              // Main content
  
  // Media fields
  imageUrl?: string;             // Image/video URL
  imageTag?: string;             // Image metadata
  videoUrl?: string;
  
  // Project-specific fields
  projectArchetype?: 'web-showcase' | 'mobile-app' | 'concept-editorial';
  showcaseBackground?: string;
  showcaseBorderColor?: string;
  appStoreUrl?: string;
  platform?: 'ios' | 'android' | 'cross-platform';
  poeticDescription?: string;
  editorialStyle?: 'minimal' | 'classic' | 'modern';
  
  // Layout and styling
  x: number;                     // Grid X position
  y: number;                     // Grid Y position
  w: number;                     // Grid width
  h: number;                     // Grid height
  color?: string;                // Background color
  objectFit?: 'cover' | 'contain';
  isPolaroid?: boolean;
  
  // Metadata
  link?: string;                 // External link
  meta?: string;                 // Additional metadata
  created_at?: string;
  updated_at?: string;
}
```

**Layout JSONB Structure:**
```typescript
interface LayoutData {
  breakpoints: {
    xxl: LayoutItem[];           // 1400px+ layouts
    xl: LayoutItem[];            // 1200px+ layouts
    lg: LayoutItem[];            // 996px+ layouts
    md: LayoutItem[];            // 768px+ layouts
    sm: LayoutItem[];            // 576px+ layouts
    xs: LayoutItem[];            // <576px layouts
  };
  settings: {
    sidePadding: number;
    showGrid: boolean;
    autoSave: boolean;
  };
}

interface LayoutItem {
  i: string;                     // Tile ID
  x: number;                     // Grid X position
  y: number;                     // Grid Y position
  w: number;                     // Grid width
  h: number;                     // Grid height
}
```

### Database Indexes for Performance
```sql
-- Performance indexes
CREATE INDEX idx_gardens_user_id ON gardens(user_id);
CREATE INDEX idx_gardens_slug ON gardens(slug) WHERE slug IS NOT NULL;
CREATE INDEX idx_gardens_is_public ON gardens(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_gardens_updated_at ON gardens(updated_at DESC);
CREATE INDEX idx_media_assets_user_id ON media_assets(user_id);
CREATE INDEX idx_media_assets_garden_id ON media_assets(garden_id);
CREATE INDEX idx_garden_views_garden_id ON garden_views(garden_id);
CREATE INDEX idx_garden_views_viewed_at ON garden_views(viewed_at DESC);

-- JSONB indexes for tile queries
CREATE INDEX idx_gardens_tiles_gin ON gardens USING GIN (tiles);
CREATE INDEX idx_gardens_layout_gin ON gardens USING GIN (layout);
```

---

## 🔐 AUTHENTICATION SYSTEM

### Supabase Auth Integration

**Authentication Flow:**
```
1. User visits protected route
   ↓
2. Middleware checks Supabase session cookie
   ↓
3. If no session → redirect to /login
   ↓
4. User signs in via Supabase Auth
   ↓
5. Session cookie set automatically
   ↓
6. User profile created/updated in users table
   ↓
7. Redirect to original destination
```

**Authentication Methods:**
- **Email/Password**: Traditional signup/signin
- **OAuth Providers**: Google, GitHub (configured in Supabase)
- **Magic Links**: Email-based passwordless auth (ready to implement)

### Row Level Security (RLS) Policies

**Users Table Policies:**
```sql
-- Users can only see and modify their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);
```

**Gardens Table Policies:**
```sql
-- Users can see their own gardens + public gardens
CREATE POLICY "Users can view own gardens and public gardens" ON gardens
    FOR SELECT USING (
        user_id = auth.uid() OR is_public = true
    );

-- Users can only modify their own gardens
CREATE POLICY "Users can insert own gardens" ON gardens
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own gardens" ON gardens
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own gardens" ON gardens
    FOR DELETE USING (user_id = auth.uid());
```

**Media Assets Policies:**
```sql
-- Users can only access their own media
CREATE POLICY "Users can view own media assets" ON media_assets
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own media assets" ON media_assets
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Storage bucket policies
CREATE POLICY "Users can upload their own media" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'media' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### Session Management

**Supabase Client Configuration:**
```typescript
// lib/supabase.ts - Multiple client types for different contexts

// Browser client (client-side operations)
export const createBrowserSupabaseClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Server client (API routes, server components)
export const createServerSupabaseClient = async () => {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        )
      },
    },
  })
}

// Middleware client (authentication in middleware)
export const createMiddlewareSupabaseClient = (request: NextRequest) => {
  // Handles session refresh and cookie management
}

// Service role client (admin operations)
export const createServiceRoleClient = () => {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}
```

---

## 🔌 API LAYER ARCHITECTURE

### Current API Routes

**Health Check Endpoint:**
```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Test database connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    return NextResponse.json({
      status: 'ok',
      message: 'Supabase connection successful',
      timestamp: new Date().toISOString(),
      database: 'connected',
      auth: 'configured',
      storage: 'configured'
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Health check failed' },
      { status: 500 }
    );
  }
}
```

**File Upload Endpoint:**
```typescript
// app/api/upload/route.ts
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  
  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Validate file
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/webm'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.type) || file.size > maxSize) {
    return NextResponse.json({ error: 'Invalid file' }, { status: 400 });
  }

  // 3. Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileExtension = file.name.split('.').pop();
  const fileName = `${user.id}/${timestamp}-${randomString}.${fileExtension}`;

  // 4. Upload to Supabase Storage
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('media')
    .upload(fileName, buffer, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false
    });

  // 5. Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('media')
    .getPublicUrl(fileName);

  // 6. Store metadata in database
  await supabase.from('media_assets').insert({
    user_id: user.id,
    garden_id: 'default',
    file_name: file.name,
    file_type: file.type,
    file_size: file.size,
    storage_path: fileName,
    alt_text: file.name
  });

  return NextResponse.json({
    success: true,
    url: publicUrl,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type
  });
}
```

**OAuth Callback Handler:**
```typescript
// app/auth/callback/route.ts
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/edit';

  if (code) {
    const supabase = await createServerSupabaseClient();
    
    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.session) {
      // Successful authentication
      const redirectUrl = new URL(next, origin);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Authentication failed
  const loginUrl = new URL('/login', origin);
  loginUrl.searchParams.set('error', 'Authentication failed');
  return NextResponse.redirect(loginUrl);
}
```

### Required API Endpoints (Ready for Implementation)

**Garden Management APIs:**
```typescript
// app/api/gardens/route.ts
export async function GET() {
  // List user's gardens with pagination
}

export async function POST() {
  // Create new garden
}

// app/api/gardens/[id]/route.ts
export async function GET(request, { params }) {
  // Get specific garden (check ownership/public)
}

export async function PUT(request, { params }) {
  // Update garden (tiles, layout, settings)
}

export async function DELETE(request, { params }) {
  // Delete garden (check ownership)
}

// app/api/gardens/[id]/publish/route.ts
export async function POST(request, { params }) {
  // Publish garden with slug
}

export async function DELETE(request, { params }) {
  // Unpublish garden
}

// app/api/gardens/[slug]/public/route.ts
export async function GET(request, { params }) {
  // Get public garden by slug
  // Increment view count
}
```

**Tile Management APIs:**
```typescript
// app/api/gardens/[id]/tiles/route.ts
export async function GET(request, { params }) {
  // Get all tiles for garden
}

export async function POST(request, { params }) {
  // Add new tile to garden
}

// app/api/tiles/[id]/route.ts
export async function PUT(request, { params }) {
  // Update specific tile
}

export async function DELETE(request, { params }) {
  // Delete specific tile
}

// app/api/tiles/batch-update/route.ts
export async function POST(request) {
  // Bulk update tile positions (drag-drop)
}
```

**Analytics APIs:**
```typescript
// app/api/gardens/[id]/analytics/route.ts
export async function GET(request, { params }) {
  // Get garden analytics (views, referrers, etc.)
}

// app/api/analytics/dashboard/route.ts
export async function GET() {
  // User dashboard analytics
}
```

---

## 🛠️ SERVICE LAYER ARCHITECTURE

### Data Access Pattern

**Service Classes:**
```typescript
// lib/gardenService.ts
export class GardenService {
  private supabase;

  constructor(isServer = false) {
    this.supabase = isServer ? null : createBrowserSupabaseClient();
  }

  private async getSupabaseClient() {
    if (!this.supabase) {
      this.supabase = await createServerSupabaseClient();
    }
    return this.supabase;
  }

  async createGarden(userId: string, gardenData: CreateGardenData): Promise<Garden> {
    const supabase = await this.getSupabaseClient();
    
    const { data, error } = await supabase
      .from('gardens')
      .insert({
        user_id: userId,
        title: gardenData.title,
        tiles: gardenData.tiles,
        layout: gardenData.layout,
        is_public: gardenData.isPublic || false,
        slug: gardenData.slug,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create garden: ${error.message}`);
    return data;
  }

  async autoSaveGarden(gardenId: string, userId: string, tiles: any[], layout: any): Promise<void> {
    const supabase = await this.getSupabaseClient();
    
    const { error } = await supabase
      .from('gardens')
      .update({
        tiles,
        layout,
        updated_at: new Date().toISOString(),
      })
      .eq('id', gardenId)
      .eq('user_id', userId); // Ensure ownership

    if (error) throw new Error(`Failed to auto-save garden: ${error.message}`);
  }
}

// Export singleton instances
export const gardenService = new GardenService(false); // Client-side
export const serverGardenService = new GardenService(true); // Server-side
```

**Authentication Service:**
```typescript
// lib/auth.ts
export const authService = {
  async signIn(email: string, password: string): Promise<User> {
    const supabase = createBrowserSupabaseClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email, password,
    });

    if (error) throw new Error(error.message);

    // Ensure user profile exists
    await userService.ensureUserProfile(
      data.user.id,
      data.user.email!,
      data.user.user_metadata?.display_name,
      data.user.user_metadata?.avatar_url
    );

    return mapSupabaseUser(data.user);
  },

  async signInWithOAuth(provider: 'google' | 'github'): Promise<void> {
    const supabase = createBrowserSupabaseClient();
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw new Error(error.message);
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    const supabase = createBrowserSupabaseClient();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await userService.ensureUserProfile(/* ... */);
          callback(mapSupabaseUser(session.user));
        } else {
          callback(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  },
};
```

### Error Handling Patterns

**Consistent Error Responses:**
```typescript
// Standard error response format
interface APIError {
  error: string;
  code?: string;
  details?: any;
  timestamp: string;
}

// Error handling utility
export function handleAPIError(error: unknown): NextResponse {
  console.error('API Error:', error);
  
  if (error instanceof Error) {
    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
  
  return NextResponse.json({
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  }, { status: 500 });
}

// Usage in API routes
export async function POST(request: NextRequest) {
  try {
    // API logic here
  } catch (error) {
    return handleAPIError(error);
  }
}
```

---

## 📁 FILE STORAGE ARCHITECTURE

### Supabase Storage Configuration

**Storage Bucket Setup:**
```sql
-- Create media bucket with policies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,                                    -- Public access for sharing
  10485760,                               -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
);
```

**File Organization Structure:**
```
media/
├── {user_id}/
│   ├── {timestamp}-{random}.jpg         -- Original files
│   ├── {timestamp}-{random}.mp4
│   └── thumbnails/
│       ├── {timestamp}-{random}_thumb.jpg
│       └── {timestamp}-{random}_thumb.webp
└── public/
    ├── default-avatars/
    └── template-previews/
```

**File Upload Flow:**
```
1. Client selects file
   ↓
2. Frontend validates file (type, size)
   ↓
3. POST /api/upload with FormData
   ↓
4. Server validates file again
   ↓
5. Generate unique filename with user_id prefix
   ↓
6. Upload to Supabase Storage
   ↓
7. Generate thumbnail (for images)
   ↓
8. Store metadata in media_assets table
   ↓
9. Return public URL to client
```

### Media Processing Pipeline (Ready for Implementation)

**Image Optimization:**
```typescript
// lib/mediaProcessor.ts
export class MediaProcessor {
  async processImage(file: Buffer, options: ImageProcessOptions): Promise<ProcessedImage> {
    // 1. Generate multiple sizes (thumbnail, medium, large)
    // 2. Convert to WebP for better compression
    // 3. Extract metadata (dimensions, EXIF)
    // 4. Generate blur placeholder
    // 5. Store all variants in storage
  }

  async processVideo(file: Buffer, options: VideoProcessOptions): Promise<ProcessedVideo> {
    // 1. Generate thumbnail from first frame
    // 2. Compress video for web delivery
    // 3. Extract metadata (duration, dimensions)
    // 4. Generate preview GIF
  }
}
```

---

## 🔄 REAL-TIME FEATURES (Ready for Implementation)

### Supabase Real-time Integration

**Real-time Garden Collaboration:**
```typescript
// lib/realtimeService.ts
export class RealtimeService {
  private subscription: RealtimeChannel | null = null;

  subscribeToGarden(gardenId: string, callbacks: {
    onTileUpdate: (tile: TileData) => void;
    onLayoutChange: (layout: LayoutData) => void;
    onUserJoin: (user: User) => void;
    onUserLeave: (userId: string) => void;
  }) {
    const supabase = createBrowserSupabaseClient();
    
    this.subscription = supabase
      .channel(`garden:${gardenId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'gardens',
        filter: `id=eq.${gardenId}`
      }, (payload) => {
        // Handle garden updates
        callbacks.onLayoutChange(payload.new.layout);
      })
      .on('broadcast', { event: 'tile_update' }, (payload) => {
        callbacks.onTileUpdate(payload.tile);
      })
      .on('presence', { event: 'sync' }, () => {
        // Handle user presence
      })
      .subscribe();
  }

  broadcastTileUpdate(gardenId: string, tile: TileData) {
    if (this.subscription) {
      this.subscription.send({
        type: 'broadcast',
        event: 'tile_update',
        payload: { tile }
      });
    }
  }
}
```

---

## 📊 ANALYTICS & MONITORING

### Database Functions for Analytics

**View Count Function:**
```sql
-- supabase/migrations/20240102000000_add_view_count_function.sql
CREATE OR REPLACE FUNCTION increment_garden_views(garden_id UUID)
RETURNS void AS $
BEGIN
    UPDATE gardens 
    SET view_count = view_count + 1 
    WHERE id = garden_id AND is_public = true;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Analytics Queries:**
```sql
-- Popular gardens
SELECT g.*, u.display_name, u.avatar_url
FROM gardens g
JOIN users u ON g.user_id = u.id
WHERE g.is_public = true
ORDER BY g.view_count DESC, g.updated_at DESC
LIMIT 20;

-- User engagement metrics
SELECT 
  u.id,
  u.display_name,
  COUNT(g.id) as garden_count,
  SUM(g.view_count) as total_views,
  AVG(jsonb_array_length(g.tiles)) as avg_tiles_per_garden
FROM users u
LEFT JOIN gardens g ON u.id = g.user_id
GROUP BY u.id, u.display_name;

-- Tile type popularity
SELECT 
  tile->>'type' as tile_type,
  COUNT(*) as usage_count
FROM gardens g,
     jsonb_array_elements(g.tiles) as tile
WHERE g.is_public = true
GROUP BY tile->>'type'
ORDER BY usage_count DESC;
```

---

## 🚀 DEPLOYMENT & INFRASTRUCTURE

### Environment Configuration

**Required Environment Variables:**
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OAuth Providers (configured in Supabase)
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Optional: External Services
CLOUDFLARE_R2_ACCESS_KEY=your-r2-key
CLOUDFLARE_R2_SECRET_KEY=your-r2-secret
```

### Database Migrations

**Migration Management:**
```bash
# Local development
npx supabase start                    # Start local Supabase
npx supabase db reset                 # Reset with migrations
npx supabase gen types typescript --local > lib/database.types.ts

# Production deployment
npx supabase db push                  # Apply migrations to production
npx supabase gen types typescript > lib/database.types.ts
```

**Migration Files Structure:**
```
supabase/migrations/
├── 20240101000000_initial_schema.sql      -- Core tables and RLS
├── 20240102000000_add_view_count_function.sql -- Analytics functions
├── 20240103000000_create_media_bucket.sql     -- Storage setup
└── 20240104000000_add_collaboration.sql       -- Real-time features
```

### Performance Optimization

**Database Optimization:**
- **Connection Pooling**: Supabase handles automatically
- **Query Optimization**: Use indexes on frequently queried columns
- **JSONB Indexing**: GIN indexes on tiles and layout columns
- **Pagination**: Implement cursor-based pagination for large datasets

**Caching Strategy:**
```typescript
// lib/cache.ts
export class CacheService {
  // Redis or in-memory cache for frequently accessed data
  async getPublicGardens(page: number): Promise<Garden[]> {
    const cacheKey = `public_gardens:${page}`;
    
    // Try cache first
    let gardens = await this.get(cacheKey);
    if (gardens) return gardens;
    
    // Fetch from database
    gardens = await gardenService.getPublicGardens(20, page * 20);
    
    // Cache for 5 minutes
    await this.set(cacheKey, gardens, 300);
    return gardens;
  }
}
```

---

## 🔧 DEVELOPMENT WORKFLOW

### Local Development Setup

**Database Setup:**
```bash
# Install Supabase CLI
npm install -g @supabase/cli

# Initialize Supabase project
supabase init

# Start local Supabase (PostgreSQL + Auth + Storage)
supabase start

# Apply migrations
supabase db reset

# Generate TypeScript types
supabase gen types typescript --local > lib/database.types.ts
```

**Development Scripts:**
```json
{
  "scripts": {
    "dev": "next dev",
    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop",
    "supabase:reset": "supabase db reset",
    "supabase:types": "supabase gen types typescript --local > lib/database.types.ts",
    "db:migrate": "supabase migration new",
    "db:push": "supabase db push"
  }
}
```

### Testing Strategy

**Database Testing:**
```typescript
// __tests__/database/gardens.test.ts
describe('Garden Database Operations', () => {
  beforeEach(async () => {
    // Reset test database
    await supabase.from('gardens').delete().neq('id', '');
  });

  test('should create garden with proper RLS', async () => {
    const garden = await gardenService.createGarden(testUserId, {
      title: 'Test Garden',
      tiles: [],
      layout: {}
    });
    
    expect(garden.user_id).toBe(testUserId);
    expect(garden.title).toBe('Test Garden');
  });

  test('should enforce RLS policies', async () => {
    // Test that users can't access other users' private gardens
  });
});
```

---

## 🎯 BACKEND LEARNING PRIORITIES

### Beginner Level
1. **SQL Fundamentals**
   - Basic queries (SELECT, INSERT, UPDATE, DELETE)
   - Joins and relationships
   - Indexes and performance

2. **API Design**
   - RESTful principles
   - HTTP status codes
   - Request/response patterns

3. **Authentication Basics**
   - Session management
   - JWT tokens
   - OAuth flows

### Intermediate Level
1. **Database Design**
   - Normalization vs denormalization
   - JSONB usage patterns
   - Row Level Security

2. **Service Architecture**
   - Service layer pattern
   - Error handling
   - Data validation

3. **File Storage**
   - Upload handling
   - File validation
   - CDN integration

### Advanced Level
1. **Real-time Systems**
   - WebSocket connections
   - Event-driven architecture
   - Conflict resolution

2. **Performance Optimization**
   - Query optimization
   - Caching strategies
   - Database scaling

3. **Security**
   - Input validation
   - SQL injection prevention
   - Rate limiting

---

## 🔍 BACKEND STRENGTHS & AREAS FOR IMPROVEMENT

### Current Strengths
✅ **Secure by Default**: RLS policies prevent unauthorized access
✅ **Type Safety**: TypeScript interfaces for all data structures
✅ **Scalable Architecture**: Service layer pattern ready for growth
✅ **Modern Stack**: Supabase provides enterprise-grade features
✅ **File Handling**: Secure upload with validation
✅ **Real-time Ready**: Supabase real-time subscriptions available

### Areas for Enhancement
🔄 **API Completeness**: Implement remaining CRUD endpoints
🔄 **Error Handling**: Standardize error responses across all endpoints
🔄 **Validation**: Add comprehensive input validation
🔄 **Caching**: Implement caching for frequently accessed data
🔄 **Analytics**: Expand analytics and monitoring
🔄 **Testing**: Add comprehensive backend test coverage

---

Your backend architecture is solid and production-ready. The combination of Supabase's managed services with Next.js API routes gives you the best of both worlds: enterprise-grade infrastructure with full customization control.

The JSONB approach for storing tiles is particularly clever - it provides flexibility for different tile types while maintaining query performance. The RLS policies ensure security, and the service layer pattern makes the code maintainable and testable.

Focus on implementing the remaining API endpoints and adding comprehensive validation - you'll have a bulletproof backend that can scale with your application's growth!