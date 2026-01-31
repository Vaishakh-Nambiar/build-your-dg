import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareSupabaseClient } from './lib/supabase';

// Routes that require authentication
const protectedRoutes = [
  '/edit',
  '/api/gardens',
  '/api/media',
  '/api/user'
];

// Routes that should redirect authenticated users
const authRoutes = ['/login', '/signup'];

// Routes that are always public (no authentication required)
const publicRoutes = [
  '/',
  '/api/health',
  '/auth/callback'
];

// Helper function to check if a route is protected
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route));
}

// Helper function to check if a route is an auth route
function isAuthRoute(pathname: string): boolean {
  return authRoutes.some(route => pathname.startsWith(route));
}

// Helper function to check if a route is public
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => pathname.startsWith(route)) ||
         pathname.match(/^\/[^\/]+$/) && pathname !== '/edit'; // Dynamic username routes
}

// Helper function to validate return URL
function isValidReturnUrl(returnTo: string | null): boolean {
  if (!returnTo) return false;
  
  // Prevent open redirects by ensuring the URL is relative and safe
  try {
    // Check if it's a relative URL starting with /
    if (!returnTo.startsWith('/')) return false;
    
    // Prevent protocol-relative URLs
    if (returnTo.startsWith('//')) return false;
    
    // Parse as URL to validate structure
    const url = new URL(returnTo, 'http://localhost');
    
    // Ensure it's a local path and not an auth route
    return url.pathname.startsWith('/') && 
           !isAuthRoute(url.pathname);
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  try {
    // Create Supabase client for middleware
    const { supabase, supabaseResponse } = createMiddlewareSupabaseClient(request);
    
    // Get the current user session with error handling
    const { data: { user }, error } = await supabase.auth.getUser();
    const isAuthenticated = !!user && !error;

    // Log authentication status for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Middleware] ${pathname} - Authenticated: ${isAuthenticated}${user ? ` (${user.email})` : ''}`);
    }

    // Handle protected routes
    if (isProtectedRoute(pathname)) {
      if (!isAuthenticated) {
        console.log(`[Middleware] Redirecting unauthenticated user from ${pathname} to login`);
        
        // Redirect to login with return URL
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('returnTo', pathname);
        
        // Preserve query parameters from the original request
        if (request.nextUrl.search) {
          loginUrl.searchParams.set('originalQuery', request.nextUrl.search);
        }
        
        return NextResponse.redirect(loginUrl);
      }
      
      // For authenticated users accessing protected routes, ensure session is fresh
      if (user) {
        const sessionAge = Date.now() - new Date(user.created_at || 0).getTime();
        const maxSessionAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (sessionAge > maxSessionAge) {
          console.log(`[Middleware] Session expired for user ${user.email}, redirecting to login`);
          
          const loginUrl = new URL('/login', request.url);
          loginUrl.searchParams.set('returnTo', pathname);
          loginUrl.searchParams.set('sessionExpired', 'true');
          
          return NextResponse.redirect(loginUrl);
        }
      }
    }

    // Handle auth routes (login/signup)
    if (isAuthRoute(pathname)) {
      if (isAuthenticated) {
        console.log(`[Middleware] Redirecting authenticated user from ${pathname} to dashboard`);
        
        // Get return URL from query parameters
        const returnTo = request.nextUrl.searchParams.get('returnTo');
        
        // Validate and use return URL, fallback to /edit
        const redirectPath = isValidReturnUrl(returnTo) ? returnTo! : '/edit';
        const redirectUrl = new URL(redirectPath, request.url);
        
        // Restore original query parameters if they exist
        const originalQuery = request.nextUrl.searchParams.get('originalQuery');
        if (originalQuery && redirectPath !== '/edit') {
          redirectUrl.search = originalQuery;
        }
        
        return NextResponse.redirect(redirectUrl);
      }
    }

    // Handle public routes - no authentication required
    if (isPublicRoute(pathname)) {
      return supabaseResponse;
    }

    // Handle dynamic username routes (public garden viewing)
    const usernameMatch = pathname.match(/^\/([^\/]+)$/);
    if (usernameMatch && usernameMatch[1] !== 'edit') {
      // This is a public garden route, no authentication required
      return supabaseResponse;
    }

    // For all other routes, return the response with updated cookies
    return supabaseResponse;
    
  } catch (error) {
    // Log the error for debugging
    console.error('[Middleware] Error during authentication check:', error);
    
    // For protected routes, redirect to login on error
    if (isProtectedRoute(pathname)) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      loginUrl.searchParams.set('error', 'authentication_error');
      return NextResponse.redirect(loginUrl);
    }
    
    // For non-protected routes, continue with the request
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/health (health check endpoint)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     * - manifest files
     */
    '/((?!api/health|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|manifest)$).*)',
  ],
};