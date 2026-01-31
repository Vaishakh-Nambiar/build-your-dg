// Authentication utilities and types using Supabase
import { createBrowserSupabaseClient } from './supabase';
import { userService } from './userService';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Convert Supabase user to our User interface
const mapSupabaseUser = (supabaseUser: SupabaseUser): User => ({
  id: supabaseUser.id,
  email: supabaseUser.email!,
  displayName: supabaseUser.user_metadata?.display_name || 
               supabaseUser.user_metadata?.name || 
               supabaseUser.email?.split('@')[0],
  avatarUrl: supabaseUser.user_metadata?.avatar_url,
});

// Authentication service using Supabase
export const authService = {
  async signIn(email: string, password: string): Promise<User> {
    const supabase = createBrowserSupabaseClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('No user returned from sign in');
    }

    // Ensure user profile exists in database
    await userService.ensureUserProfile(
      data.user.id,
      data.user.email!,
      data.user.user_metadata?.display_name || data.user.user_metadata?.name,
      data.user.user_metadata?.avatar_url
    );

    return mapSupabaseUser(data.user);
  },

  async signUp(email: string, password: string, displayName?: string): Promise<User> {
    const supabase = createBrowserSupabaseClient();
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('No user returned from sign up');
    }

    // Create user profile in database
    await userService.ensureUserProfile(
      data.user.id,
      data.user.email!,
      displayName,
      data.user.user_metadata?.avatar_url
    );

    return mapSupabaseUser(data.user);
  },

  async signOut(): Promise<void> {
    const supabase = createBrowserSupabaseClient();
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new Error(error.message);
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const supabase = createBrowserSupabaseClient();
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    // Ensure user profile exists in database
    try {
      await userService.ensureUserProfile(
        user.id,
        user.email!,
        user.user_metadata?.display_name || user.user_metadata?.name,
        user.user_metadata?.avatar_url
      );
    } catch (error) {
      console.error('Failed to ensure user profile:', error);
      // Continue anyway - auth user exists even if profile creation fails
    }

    return mapSupabaseUser(user);
  },

  async signInWithOAuth(provider: 'google' | 'github'): Promise<void> {
    const supabase = createBrowserSupabaseClient();
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    // OAuth sign-in redirects to the provider, so we don't return a user here
    // The user will be available after the redirect callback
  },

  // Subscribe to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    const supabase = createBrowserSupabaseClient();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Ensure user profile exists in database
          try {
            await userService.ensureUserProfile(
              session.user.id,
              session.user.email!,
              session.user.user_metadata?.display_name || session.user.user_metadata?.name,
              session.user.user_metadata?.avatar_url
            );
          } catch (error) {
            console.error('Failed to ensure user profile:', error);
          }
          
          const user = mapSupabaseUser(session.user);
          callback(user);
        } else {
          callback(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  },
};