import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/edit';

  if (code) {
    const supabase = await createServerSupabaseClient();
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Successful authentication, redirect to the intended page
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If there's an error or no code, redirect to login with error
  const loginUrl = new URL('/login', origin);
  loginUrl.searchParams.set('error', 'Authentication failed');
  return NextResponse.redirect(loginUrl);
}