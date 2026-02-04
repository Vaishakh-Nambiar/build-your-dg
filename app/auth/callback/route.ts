import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/edit';

  if (code) {
    const supabase = await createServerSupabaseClient();
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.session) {
      // Wait a moment for session to be established
      await new Promise(resolve => setTimeout(resolve, 100));
      
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