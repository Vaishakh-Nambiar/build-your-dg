# Google OAuth Setup for Your Supabase Project

## Your Supabase Project Details:
- **Project URL**: https://edlnihzcvjndkcdomjei.supabase.co
- **Project Reference**: `edlnihzcvjndkcdomjei`

## Step 1: Google Cloud Console Setup (3 minutes)

### 1.1 Create Google Project
1. Go to: https://console.cloud.google.com
2. Click "Select a project" → "New Project"
3. Name: "Digital Garden"
4. Click "Create"

### 1.2 Enable Google+ API
1. Go to "APIs & Services" → "Library"
2. Search "Google+ API"
3. Click it → "Enable"

### 1.3 Configure OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. User Type: "External"
3. Fill in:
   - App name: "Digital Garden"
   - User support email: your email
   - Developer contact information: your email
4. Click "Save and Continue" through all steps

### 1.4 Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Application type: "Web application"
4. Name: "Digital Garden"
5. **Authorized redirect URIs** - Add this EXACT URL:
   ```
   https://edlnihzcvjndkcdomjei.supabase.co/auth/v1/callback
   ```
6. Click "Create"
7. **COPY AND SAVE**:
   - Client ID (long number)
   - Client Secret (random string)

## Step 2: Configure Supabase (1 minute)

1. **Go to your Supabase dashboard**: https://supabase.com/dashboard/project/edlnihzcvjndkcdomjei
2. **Navigate to**: Authentication → Providers
3. **Find Google** and toggle it ON
4. **Paste your credentials**:
   - Client ID: (from Google Cloud Console)
   - Client Secret: (from Google Cloud Console)
5. **Click "Save"**

## Step 3: Update Environment Variables (30 seconds)

In your `.env.local` file, replace these lines:
```env
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=your_actual_google_client_id
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your_actual_google_client_secret
```

## Step 4: Test Google OAuth (1 minute)

1. **Restart your app**: Stop and run `npm run dev`
2. **Go to**: http://localhost:3000/login
3. **Click "Continue with Google"**
4. **You should see**:
   - Google login popup
   - After login, redirect to your app
   - User appears in your Supabase dashboard

## Verification Checklist:

- ✅ Google Cloud project created
- ✅ Google+ API enabled
- ✅ OAuth credentials created with correct redirect URI
- ✅ Supabase Google provider enabled
- ✅ Environment variables updated
- ✅ App restarted

## Troubleshooting:

**"invalid_client" error**:
- Check Client ID and Secret are correct
- Verify redirect URI is exactly: `https://edlnihzcvjndkcdomjei.supabase.co/auth/v1/callback`

**"redirect_uri_mismatch" error**:
- Make sure redirect URI in Google Cloud Console matches exactly

**OAuth button not working**:
- Check browser console for errors
- Verify environment variables are loaded
- Restart your development server

## What You'll See After Setup:

1. **Google login button works** without errors
2. **Users appear** in Supabase Authentication → Users
3. **User profiles created** in your users table
4. **Real-time updates** in your Supabase dashboard

Your Supabase project is ready for Google OAuth!