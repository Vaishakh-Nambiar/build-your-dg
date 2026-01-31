import { createBrowserSupabaseClient, createServerSupabaseClient } from './supabase';
import type { Database } from './supabase';

type UserProfile = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export interface CreateUserProfileData {
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface UpdateUserProfileData {
  displayName?: string;
  avatarUrl?: string;
  onboardingCompleted?: boolean;
  preferences?: any;
}

export class UserService {
  private supabase;

  constructor(isServer = false) {
    if (isServer) {
      // For server-side operations, we'll need to create the client async
      this.supabase = null;
    } else {
      this.supabase = createBrowserSupabaseClient();
    }
  }

  private async getSupabaseClient() {
    if (!this.supabase) {
      this.supabase = await createServerSupabaseClient();
    }
    return this.supabase;
  }

  async createUserProfile(userId: string, userData: CreateUserProfileData): Promise<UserProfile> {
    const supabase = await this.getSupabaseClient();
    
    const userInsert: UserInsert = {
      id: userId,
      email: userData.email,
      display_name: userData.displayName,
      avatar_url: userData.avatarUrl,
      onboarding_completed: false,
      preferences: {},
    };

    const { data, error } = await supabase
      .from('users')
      .insert(userInsert)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user profile: ${error.message}`);
    }

    return data;
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const supabase = await this.getSupabaseClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Failed to get user profile: ${error.message}`);
    }

    return data;
  }

  async updateUserProfile(userId: string, updates: UpdateUserProfileData): Promise<UserProfile> {
    const supabase = await this.getSupabaseClient();
    
    const userUpdate: UserUpdate = {
      display_name: updates.displayName,
      avatar_url: updates.avatarUrl,
      onboarding_completed: updates.onboardingCompleted,
      preferences: updates.preferences,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('users')
      .update(userUpdate)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }

    return data;
  }

  async deleteUserProfile(userId: string): Promise<void> {
    const supabase = await this.getSupabaseClient();
    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to delete user profile: ${error.message}`);
    }
  }

  async ensureUserProfile(userId: string, email: string, displayName?: string, avatarUrl?: string): Promise<UserProfile> {
    // Try to get existing profile
    const existingProfile = await this.getUserProfile(userId);
    
    if (existingProfile) {
      return existingProfile;
    }

    // Create new profile if it doesn't exist
    return await this.createUserProfile(userId, {
      email,
      displayName,
      avatarUrl,
    });
  }
}

// Export singleton instances
export const userService = new UserService(false); // Client-side
export const serverUserService = new UserService(true); // Server-side