import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/edit';

  if (code) {
    const supabase = await createServerSupabaseClient();
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.session && data.user) {
      // Wait a moment for session to be established
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Ensure user record exists in public.users table
      try {
        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .single();
        
        if (userError && userError.code === 'PGRST116') {
          // User doesn't exist, create it
          console.log('Creating user record for:', data.user.email);
          
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              display_name: data.user.user_metadata?.display_name || 
                           data.user.user_metadata?.name || 
                           data.user.email!.split('@')[0],
              avatar_url: data.user.user_metadata?.avatar_url
            });
          
          if (insertError) {
            console.error('Failed to create user record:', insertError);
          }
        }
      } catch (userCreationError) {
        console.error('Error checking/creating user:', userCreationError);
        // Continue anyway - the trigger should handle this
      }
      
      // Successful authentication, redirect to the intended page
      const redirectUrl = new URL(next, origin);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // If there's an error or no code, redirect to login with error
  const loginUrl = new URL('/login', origin);
  loginUrl.searchParams.set('error', 'Authentication failed');
  return NextResponse.redirect(loginUrl);
}