# Supabase Backend Setup Guide

This guide walks you through setting up the Supabase backend for the Digital Garden application.

## Prerequisites

1. **Docker Desktop** - Required for local development
   - Download and install from: https://docs.docker.com/desktop
   - Make sure Docker Desktop is running before proceeding

2. **Supabase Account** (for production deployment)
   - Sign up at: https://supabase.com
   - Create a new project

## Local Development Setup

### 1. Install Dependencies

The required Supabase packages are already included in package.json:
- `@supabase/supabase-js` - Supabase JavaScript client
- `@supabase/ssr` - Server-side rendering support for Next.js
- `supabase` - Supabase CLI (dev dependency)

### 2. Start Local Supabase

Run the setup script for your platform:

**Windows:**
```bash
./scripts/setup-supabase.bat
```

**macOS/Linux:**
```bash
chmod +x ./scripts/setup-supabase.sh
./scripts/setup-supabase.sh
```

**Manual setup:**
```bash
npx supabase start
```

This will start all Supabase services locally:
- **API**: http://127.0.0.1:54321
- **Studio**: http://127.0.0.1:54323 (Database management UI)
- **Inbucket**: http://127.0.0.1:54324 (Email testing)

### 3. Configure Environment Variables

After starting Supabase locally, you'll see output with the local credentials. Update your `.env.local` file:

```env
# Local Development
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key_from_supabase_start_output

# OAuth Providers (optional for local development)
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=your_google_client_id
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your_google_client_secret
SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID=your_github_client_id
SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET=your_github_client_secret
```

### 4. Database Schema

The database schema is automatically applied when you start Supabase locally. It includes:

- **users** - User profiles and preferences
- **gardens** - Garden data with JSONB tiles and layout
- **media_assets** - File metadata and storage paths
- **garden_views** - Analytics tracking for public gardens

### 5. Storage Configuration

A media storage bucket is automatically created with:
- **File size limit**: 50MB
- **Allowed types**: Images (PNG, JPEG, GIF, WebP, SVG) and Videos (MP4, WebM)
- **User-specific folders**: Files are organized by user ID

## Production Setup

### 1. Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose your organization and region
4. Set a strong database password
5. Wait for the project to be created

### 2. Configure Authentication

1. Go to Authentication > Settings in your Supabase dashboard
2. Configure your site URL: `https://yourdomain.com`
3. Add redirect URLs:
   - `https://yourdomain.com/auth/callback`
   - `http://localhost:3000/auth/callback` (for local development)

### 3. Set up OAuth Providers

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
6. Copy Client ID and Client Secret to Supabase Auth settings

#### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret to Supabase Auth settings

### 4. Deploy Database Schema

```bash
# Link to your production project
npx supabase link --project-ref your-project-ref

# Push the database schema
npx supabase db push
```

### 5. Configure Production Environment

Update your production environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OAuth Provider Configuration
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=your_google_client_id
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your_google_client_secret
SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID=your_github_client_id
SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET=your_github_client_secret
```

## Features Configured

### ✅ Authentication
- Email/password authentication
- Google OAuth integration
- GitHub OAuth integration
- Session management with Next.js middleware
- Automatic user profile creation

### ✅ Database
- PostgreSQL with Row Level Security (RLS)
- User-specific data access policies
- Optimized indexes for performance
- JSONB storage for flexible garden data

### ✅ Storage
- Media file upload with validation
- User-specific folder organization
- Support for images and videos
- Automatic file size and type validation

### ✅ Security
- Row Level Security policies
- User data isolation
- Secure file upload policies
- Input validation and sanitization

## Development Commands

```bash
# Start local Supabase
npx supabase start

# Stop local Supabase
npx supabase stop

# View Supabase status
npx supabase status

# Reset local database
npx supabase db reset

# Generate TypeScript types
npx supabase gen types typescript --local > lib/database.types.ts

# View logs
npx supabase logs
```

## Troubleshooting

### Docker Issues
- Make sure Docker Desktop is running
- Try restarting Docker Desktop
- Check Docker has enough resources allocated

### Authentication Issues
- Verify environment variables are set correctly
- Check OAuth provider configuration
- Ensure redirect URLs match exactly

### Database Issues
- Check migration files for syntax errors
- Verify RLS policies are correctly configured
- Use Supabase Studio to inspect data and policies

### Storage Issues
- Verify storage policies allow user access
- Check file size and type restrictions
- Ensure bucket exists and is properly configured

## Next Steps

After completing the Supabase setup:

1. **Test Authentication**: Try signing up and logging in
2. **Test Database**: Create and save garden data
3. **Test Storage**: Upload media files
4. **Configure OAuth**: Set up Google and GitHub authentication
5. **Deploy**: Push to production when ready

For more detailed information, refer to the [Supabase Documentation](https://supabase.com/docs).