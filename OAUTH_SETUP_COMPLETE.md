# Complete OAuth Setup Guide

Follow these steps to set up Google and GitHub OAuth for local testing.

## Step 1: Set Up Google OAuth

### 1.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a project" → "New Project"
3. Name: "Digital Garden Local" 
4. Click "Create"

### 1.2 Enable Google+ API
1. Go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### 1.3 Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. If prompted, configure OAuth consent screen:
   - User Type: External
   - App name: "Digital Garden Local"
   - User support email: your email
   - Developer contact: your email
   - Save and continue through all steps
4. Back to Credentials, click "Create Credentials" → "OAuth 2.0 Client IDs"
5. Application type: "Web application"
6. Name: "Digital Garden Local"
7. Authorized redirect URIs - Add these EXACT URLs:
   ```
   http://127.0.0.1:54321/auth/v1/callback
   http://localhost:3000/auth/callback
   ```
8. Click "Create"
9. **Copy the Client ID and Client Secret** - you'll need these!

## Step 2: Set Up GitHub OAuth

### 2.1 Create GitHub OAuth App
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Application name: `Digital Garden Local`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://127.0.0.1:54321/auth/v1/callback`
4. Click "Register application"
5. **Copy the Client ID**
6. Click "Generate a new client secret"
7. **Copy the Client Secret** - you'll need this!

## Step 3: Update Environment Variables

1. Open your `.env.local` file
2. Replace the placeholder values with your actual credentials:

```env
# OAuth Provider Configuration
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=your_actual_google_client_id
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your_actual_google_client_secret
SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID=your_actual_github_client_id
SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET=your_actual_github_client_secret
```

## Step 4: Restart Supabase

After updating the environment variables:

```bash
npx supabase stop
npx supabase start
```

## Step 5: Test OAuth

1. Go to http://localhost:3000/login
2. Click "Continue with Google" or "Continue with GitHub"
3. You should be redirected to the OAuth provider
4. After authorization, you'll be redirected back to your app

## Troubleshooting

### Common Issues:

1. **"invalid_client" error**:
   - Check that your Client ID and Secret are correct
   - Make sure redirect URIs match exactly
   - Restart Supabase after changing environment variables

2. **"redirect_uri_mismatch" error**:
   - Verify redirect URIs in Google/GitHub settings
   - Must be exactly: `http://127.0.0.1:54321/auth/v1/callback`

3. **OAuth buttons not working**:
   - Check browser console for errors
   - Verify environment variables are loaded
   - Make sure Supabase is running

### Verification Steps:

1. Check Supabase is running: `npx supabase status`
2. Check environment variables are loaded:
   ```bash
   node -e "require('dotenv').config({path:'.env.local'}); console.log('Google:', !!process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)"
   ```
3. Visit Supabase Studio: http://127.0.0.1:54323
   - Go to Authentication → Settings
   - Check if OAuth providers are configured

## What You Can Test:

- ✅ Google OAuth login/signup
- ✅ GitHub OAuth login/signup  
- ✅ Email/password authentication
- ✅ User profile creation
- ✅ Protected route access
- ✅ Session management

Once OAuth is working, you'll have a complete authentication system for testing!