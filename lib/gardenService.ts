import { createBrowserSupabaseClient, createServerSupabaseClient } from './supabase';
import type { Database } from './supabase';

type Garden = Database['public']['Tables']['gardens']['Row'];
type GardenInsert = Database['public']['Tables']['gardens']['Insert'];
type GardenUpdate = Database['public']['Tables']['gardens']['Update'];

export interface CreateGardenData {
  title: string;
  description?: string;
  tiles: any[];
  layout: any;
  isPublic?: boolean;
  slug?: string;
}

export interface UpdateGardenData {
  title?: string;
  description?: string;
  tiles?: any[];
  layout?: any;
  isPublic?: boolean;
  slug?: string;
}

export interface GardenWithUser extends Garden {
  user?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

export class GardenService {
  private supabase;

  constructor(isServer = false) {
    if (isServer) {
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

  async createGarden(userId: string, gardenData: CreateGardenData): Promise<Garden> {
    const supabase = await this.getSupabaseClient();
    
    const gardenInsert: GardenInsert = {
      user_id: userId,
      title: gardenData.title,
      description: gardenData.description,
      tiles: gardenData.tiles,
      layout: gardenData.layout,
      is_public: gardenData.isPublic || false,
      slug: gardenData.slug,
    };

    const { data, error } = await supabase
      .from('gardens')
      .insert(gardenInsert)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create garden: ${error.message}`);
    }

    return data;
  }

  async getGarden(gardenId: string, userId?: string): Promise<Garden | null> {
    const supabase = await this.getSupabaseClient();
    
    let query = supabase
      .from('gardens')
      .select('*')
      .eq('id', gardenId);

    // If userId is provided, ensure user can access this garden
    if (userId) {
      query = query.or(`user_id.eq.${userId},is_public.eq.true`);
    } else {
      // If no userId, only return public gardens
      query = query.eq('is_public', true);
    }

    const { data, error } = await supabase
      .from('gardens')
      .select('*')
      .eq('id', gardenId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get garden: ${error.message}`);
    }

    return data;
  }

  async updateGarden(gardenId: string, userId: string, updates: UpdateGardenData): Promise<Garden> {
    const supabase = await this.getSupabaseClient();
    
    const gardenUpdate: GardenUpdate = {
      title: updates.title,
      description: updates.description,
      tiles: updates.tiles,
      layout: updates.layout,
      is_public: updates.isPublic,
      slug: updates.slug,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('gardens')
      .update(gardenUpdate)
      .eq('id', gardenId)
      .eq('user_id', userId) // Ensure user owns the garden
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update garden: ${error.message}`);
    }

    return data;
  }

  async deleteGarden(gardenId: string, userId: string): Promise<void> {
    const supabase = await this.getSupabaseClient();
    
    const { error } = await supabase
      .from('gardens')
      .delete()
      .eq('id', gardenId)
      .eq('user_id', userId); // Ensure user owns the garden

    if (error) {
      throw new Error(`Failed to delete garden: ${error.message}`);
    }
  }

  async getUserGardens(userId: string): Promise<Garden[]> {
    const supabase = await this.getSupabaseClient();
    
    const { data, error } = await supabase
      .from('gardens')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get user gardens: ${error.message}`);
    }

    return data || [];
  }

  async getPublicGarden(slug: string): Promise<GardenWithUser | null> {
    const supabase = await this.getSupabaseClient();
    
    const { data, error } = await supabase
      .from('gardens')
      .select(`
        *,
        user:users(display_name, avatar_url)
      `)
      .eq('slug', slug)
      .eq('is_public', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get public garden: ${error.message}`);
    }

    return data as GardenWithUser;
  }

  async getPublicGardens(limit = 20, offset = 0): Promise<GardenWithUser[]> {
    const supabase = await this.getSupabaseClient();
    
    const { data, error } = await supabase
      .from('gardens')
      .select(`
        *,
        user:users(display_name, avatar_url)
      `)
      .eq('is_public', true)
      .order('view_count', { ascending: false })
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to get public gardens: ${error.message}`);
    }

    return (data || []) as GardenWithUser[];
  }

  async publishGarden(gardenId: string, userId: string, slug: string): Promise<Garden> {
    const supabase = await this.getSupabaseClient();
    
    // Check if slug is already taken
    const { data: existingGarden } = await supabase
      .from('gardens')
      .select('id')
      .eq('slug', slug)
      .neq('id', gardenId)
      .single();

    if (existingGarden) {
      throw new Error('This URL is already taken. Please choose a different one.');
    }

    const { data, error } = await supabase
      .from('gardens')
      .update({
        is_public: true,
        slug: slug,
        updated_at: new Date().toISOString(),
      })
      .eq('id', gardenId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to publish garden: ${error.message}`);
    }

    return data;
  }

  async unpublishGarden(gardenId: string, userId: string): Promise<Garden> {
    const supabase = await this.getSupabaseClient();
    
    const { data, error } = await supabase
      .from('gardens')
      .update({
        is_public: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', gardenId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to unpublish garden: ${error.message}`);
    }

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
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to auto-save garden: ${error.message}`);
    }
  }

  async incrementViewCount(gardenId: string): Promise<void> {
    const supabase = await this.getSupabaseClient();
    
    const { error } = await supabase.rpc('increment_garden_views', {
      garden_id: gardenId
    });

    if (error) {
      console.error('Failed to increment view count:', error);
      // Don't throw error for view count failures
    }
  }

  async generateUniqueSlug(baseSlug: string, userId: string): Promise<string> {
    const supabase = await this.getSupabaseClient();
    
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const { data } = await supabase
        .from('gardens')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!data) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }
}

// Export singleton instances
export const gardenService = new GardenService(false); // Client-side
export const serverGardenService = new GardenService(true); // Server-side