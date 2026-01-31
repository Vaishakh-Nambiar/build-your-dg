-- Initial database schema for Digital Garden application
-- This migration creates all the core tables and sets up Row Level Security

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gardens table
CREATE TABLE gardens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled Garden',
    description TEXT,
    tiles JSONB NOT NULL DEFAULT '[]',
    layout JSONB NOT NULL DEFAULT '{}',
    is_public BOOLEAN DEFAULT FALSE,
    slug TEXT UNIQUE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media assets table
CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    thumbnail_path TEXT,
    alt_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Garden views table for analytics
CREATE TABLE garden_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
    viewer_ip TEXT,
    viewer_country TEXT,
    referrer TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_gardens_user_id ON gardens(user_id);
CREATE INDEX idx_gardens_slug ON gardens(slug) WHERE slug IS NOT NULL;
CREATE INDEX idx_gardens_is_public ON gardens(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_media_assets_user_id ON media_assets(user_id);
CREATE INDEX idx_media_assets_garden_id ON media_assets(garden_id);
CREATE INDEX idx_garden_views_garden_id ON garden_views(garden_id);
CREATE INDEX idx_garden_views_viewed_at ON garden_views(viewed_at);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gardens ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE garden_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for gardens table
CREATE POLICY "Users can view own gardens and public gardens" ON gardens
    FOR SELECT USING (
        user_id = auth.uid() OR is_public = true
    );

CREATE POLICY "Users can insert own gardens" ON gardens
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own gardens" ON gardens
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own gardens" ON gardens
    FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for media_assets table
CREATE POLICY "Users can view own media assets" ON media_assets
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own media assets" ON media_assets
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own media assets" ON media_assets
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own media assets" ON media_assets
    FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for garden_views table
-- Allow anyone to insert view records (for public gardens)
CREATE POLICY "Anyone can insert garden views" ON garden_views
    FOR INSERT WITH CHECK (true);

-- Only garden owners can view their analytics
CREATE POLICY "Garden owners can view analytics" ON garden_views
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM gardens 
            WHERE gardens.id = garden_views.garden_id 
            AND gardens.user_id = auth.uid()
        )
    );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gardens_updated_at 
    BEFORE UPDATE ON gardens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle user creation from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, display_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Note: Storage bucket and policies will be created separately via Supabase CLI