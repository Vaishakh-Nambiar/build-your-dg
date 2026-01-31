# Connect to REAL Supabase (Simple Guide)

## Step 1: Create Supabase Project (2 minutes)
1. Go to https://supabase.com
2. Sign up/Login
3. Click "New Project"
4. Name: `Digital Garden`
5. Set database password
6. Click "Create new project"
7. Wait for setup to complete

## Step 2: Get Your Keys (1 minute)
1. In your Supabase dashboard: **Settings** → **API**
2. Copy these 3 values:
   - **Project URL** (starts with https://...)
   - **anon public key** (long string starting with eyJ...)
   - **service_role secret key** (long string starting with eyJ...)

## Step 3: Update .env.local (1 minute)
Replace the placeholder values in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key
```

## Step 4: Set Up Database (1 minute)
1. In your Supabase dashboard: **SQL Editor**
2. Click "New query"
3. Copy and paste the entire content from `setup-real-supabase.sql`
4. Click "Run"

## Step 5: Test Your Connection
1. Start your app: `npm run dev`
2. Go to http://localhost:3000/signup
3. Create an account with email/password
4. **Check your Supabase dashboard**:
   - **Authentication** → Users (see your new user)
   - **Table Editor** → users (see user profile)

## What You'll See:
- ✅ **Real Supabase dashboard** with your data
- ✅ **Users appearing** in Authentication section
- ✅ **User profiles** in the users table
- ✅ **Gardens data** when you create gardens
- ✅ **Real-time updates** in your dashboard

## Benefits of Real Supabase:
- 🌐 **Real cloud database** (not local Docker)
- 📊 **Supabase dashboard** to see everything
- 🔄 **Real-time sync** across devices
- 📈 **Analytics and monitoring**
- 🚀 **Ready for production**

No more Docker, no more local complications - just real Supabase!