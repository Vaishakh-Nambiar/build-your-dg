'use client';

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { User, AuthState, authService } from '@/lib/auth';

// Create auth context
const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  clearError: () => void;
} | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Initialize auth state and set up auth state listener
  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        setAuthState(prev => ({ ...prev, user, loading: false }));
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Failed to initialize authentication' 
        }));
      }
    };

    // Set up auth state change listener
    const unsubscribe = authService.onAuthStateChange((user) => {
      setAuthState(prev => ({ ...prev, user, loading: false }));
    });

    initAuth();

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const user = await authService.signIn(email, password);
      setAuthState(prev => ({ ...prev, user, loading: false }));
    } catch (error) {
      console.error('Sign in error:', error);
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Sign in failed' 
      }));
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const user = await authService.signUp(email, password, displayName);
      setAuthState(prev => ({ ...prev, user, loading: false }));
    } catch (error) {
      console.error('Sign up error:', error);
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Sign up failed' 
      }));
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await authService.signOut();
      setAuthState(prev => ({ ...prev, user: null, loading: false }));
    } catch (error) {
      console.error('Sign out error:', error);
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Sign out failed' 
      }));
    }
  }, []);

  const signInWithOAuth = useCallback(async (provider: 'google' | 'github') => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      await authService.signInWithOAuth(provider);
      // OAuth redirects to callback, so we don't set user state here
      // The auth state change listener will handle the user state update
    } catch (error) {
      console.error('OAuth sign in error:', error);
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'OAuth sign in failed' 
      }));
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        loading: authState.loading,
        error: authState.error,
        signIn,
        signUp,
        signOut,
        signInWithOAuth,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}