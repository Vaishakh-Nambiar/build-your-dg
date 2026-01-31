import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl.includes('your_supabase') || 
    supabaseAnonKey.includes('your_supabase')) {
  console.error('Invalid Supabase environment variables:', {
    url: supabaseUrl || 'MISSING',
    key: supabaseAnonKey ? 'SET' : 'MISSING',
    hasPlaceholders: supabaseUrl?.includes('your_supabase') || supabaseAnonKey?.includes('your_supabase')
  })
  
  const errorMessage = !supabaseUrl || !supabaseAnonKey 
    ? 'Missing required Supabase environment variables. Please check your .env.local file.'
    : 'Supabase environment variables contain placeholder values. Please update .env.local with actual values or start local Supabase with "npx supabase start".'
  
  throw new Error(errorMessage)
}

// Browser client for client-side operations
export const createBrowserSupabaseClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Server client for server-side operations (App Router)
export const createServerSupabaseClient = async () => {
  // Import cookies dynamically to avoid client-side import issues
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

// Middleware client for authentication in middleware
export const createMiddlewareSupabaseClient = (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  return { supabase, supabaseResponse }
}

// Service role client for admin operations (server-side only)
export const createServiceRoleClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Database types (will be generated later)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          avatar_url: string | null
          onboarding_completed: boolean
          preferences: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          onboarding_completed?: boolean
          preferences?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          onboarding_completed?: boolean
          preferences?: any
          created_at?: string
          updated_at?: string
        }
      }
      gardens: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          tiles: any
          layout: any
          is_public: boolean
          slug: string | null
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          description?: string | null
          tiles?: any
          layout?: any
          is_public?: boolean
          slug?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          tiles?: any
          layout?: any
          is_public?: boolean
          slug?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      media_assets: {
        Row: {
          id: string
          user_id: string
          garden_id: string
          file_name: string
          file_type: string
          file_size: number
          storage_path: string
          thumbnail_path: string | null
          alt_text: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          garden_id: string
          file_name: string
          file_type: string
          file_size: number
          storage_path: string
          thumbnail_path?: string | null
          alt_text?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          garden_id?: string
          file_name?: string
          file_type?: string
          file_size?: number
          storage_path?: string
          thumbnail_path?: string | null
          alt_text?: string | null
          created_at?: string
        }
      }
      garden_views: {
        Row: {
          id: string
          garden_id: string
          viewer_ip: string | null
          viewer_country: string | null
          referrer: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          garden_id: string
          viewer_ip?: string | null
          viewer_country?: string | null
          referrer?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          garden_id?: string
          viewer_ip?: string | null
          viewer_country?: string | null
          referrer?: string | null
          viewed_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}