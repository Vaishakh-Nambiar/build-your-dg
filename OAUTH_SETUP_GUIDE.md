# OAuth Setup Guide (Optional)

The Digital Garden app supports Google and GitHub OAuth authentication. For local development, OAuth is disabled and you can use email/password authentication.

## Current Status
- ✅ **Email/Password Auth**: Working in local development
- ⚠️ **OAuth (Google/GitHub)**: Disabled for local development
- 🔧 **OAuth Setup**: Optional - only needed for production

## For Local Development
OAuth buttons are automatically hidden in development mode. Use email/password authentication:

1. Go to http://localhost:3000/signup
2. Create account with any email/password
3. Login at http://localhost:3000/login

## To Enable OAuth (Production Only)

### 1. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (for local testing)
6. Copy Client ID and Client Secret

### 2. GitHub OAuth Setup
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret

### 3. Configure Supabase
1. Go to your Supabase project dashboard
2. Navigate to Authentication > Settings
3. Add your OAuth provider credentials
4. Enable the providers

### 4. Update Environment Variables
Add to your `.env.local` (production only):
```env
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=your_google_client_id
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your_google_client_secret
SUPABASE_AUTH_EXTERNAL_GITHUB_CLIENT_ID=your_github_client_id
SUPABASE_AUTH_EXTERNAL_GITHUB_SECRET=your_github_client_secret
```

### 5. Enable OAuth in Code
Change `process.env.NODE_ENV === 'production'` to `true` in:
- `components/auth/LoginPage.tsx`
- `components/auth/SignupPage.tsx`

## Why OAuth is Disabled for Local Development

1. **Complexity**: OAuth requires external provider setup
2. **Dependencies**: Needs internet connection and external services
3. **Development Speed**: Email/password is faster for testing
4. **Security**: Avoids exposing OAuth credentials in local development

## Testing Authentication

For local development, test these flows:
- ✅ User registration with email/password
- ✅ User login with email/password
- ✅ Protected route access (middleware)
- ✅ User profile creation
- ✅ Session management
- ✅ Logout functionality

OAuth can be added later when deploying to production.