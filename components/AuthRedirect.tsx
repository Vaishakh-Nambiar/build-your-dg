'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface AuthRedirectProps {
  children: React.ReactNode;
}

export function AuthRedirect({ children }: AuthRedirectProps) {
  const { user, loading, error } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only redirect if we have a valid user and no errors
    if (!loading && user && !error) {
      // Redirect authenticated users to return URL or edit page
      const returnTo = searchParams.get('returnTo') || '/edit';
      router.push(returnTo);
    }
  }, [user, loading, error, router, searchParams]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if authenticated and no errors (will redirect)
  if (user && !error) {
    return null;
  }

  return <>{children}</>;
}