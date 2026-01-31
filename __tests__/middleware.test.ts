/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { middleware } from '../middleware';

// Mock the Supabase client
jest.mock('../lib/supabase', () => ({
  createMiddlewareSupabaseClient: jest.fn(),
}));

const mockCreateMiddlewareSupabaseClient = require('../lib/supabase').createMiddlewareSupabaseClient;

// Helper function to create a mock NextRequest
function createMockRequest(url: string, options: { cookies?: Record<string, string> } = {}) {
  const request = new NextRequest(url);
  
  // Add cookies if provided
  if (options.cookies) {
    Object.entries(options.cookies).forEach(([name, value]) => {
      request.cookies.set(name, value);
    });
  }
  
  return request;
}

// Helper function to create mock Supabase response
function createMockSupabaseClient(user: any = null, error: any = null) {
  const mockSupabaseResponse = {
    cookies: {
      set: jest.fn(),
    },
  };

  const mockSupabase = {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user },
        error,
      }),
    },
  };

  mockCreateMiddlewareSupabaseClient.mockReturnValue({
    supabase: mockSupabase,
    supabaseResponse: mockSupabaseResponse,
  });

  return { mockSupabase, mockSupabaseResponse };
}

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users from /edit to login', async () => {
      createMockSupabaseClient(null); // No user
      
      const request = createMockRequest('http://localhost:3000/edit');
      const response = await middleware(request);
      
      expect(response.status).toBe(307); // Redirect status
      expect(response.headers.get('location')).toBe('http://localhost:3000/login?returnTo=%2Fedit');
    });

    it('should allow authenticated users to access /edit', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      };
      const { mockSupabaseResponse } = createMockSupabaseClient(mockUser);
      
      const request = createMockRequest('http://localhost:3000/edit');
      const response = await middleware(request);
      
      expect(response).toBe(mockSupabaseResponse);
    });

    it('should redirect unauthenticated users from API routes', async () => {
      createMockSupabaseClient(null); // No user
      
      const request = createMockRequest('http://localhost:3000/api/gardens');
      const response = await middleware(request);
      
      expect(response.status).toBe(307); // Redirect status
      expect(response.headers.get('location')).toBe('http://localhost:3000/login?returnTo=%2Fapi%2Fgardens');
    });

    it('should preserve query parameters when redirecting to login', async () => {
      createMockSupabaseClient(null); // No user
      
      const request = createMockRequest('http://localhost:3000/edit?tab=settings&view=grid');
      const response = await middleware(request);
      
      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('returnTo=%2Fedit');
      expect(location).toContain('originalQuery=%3Ftab%3Dsettings%26view%3Dgrid');
    });

    it('should redirect users with expired sessions', async () => {
      const expiredUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
      };
      createMockSupabaseClient(expiredUser);
      
      const request = createMockRequest('http://localhost:3000/edit');
      const response = await middleware(request);
      
      expect(response.status).toBe(307);
      const location = response.headers.get('location');
      expect(location).toContain('/login');
      expect(location).toContain('sessionExpired=true');
    });
  });

  describe('Auth Routes', () => {
    it('should redirect authenticated users from /login to /edit', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      };
      createMockSupabaseClient(mockUser);
      
      const request = createMockRequest('http://localhost:3000/login');
      const response = await middleware(request);
      
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://localhost:3000/edit');
    });

    it('should redirect authenticated users to returnTo URL', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      };
      createMockSupabaseClient(mockUser);
      
      const request = createMockRequest('http://localhost:3000/login?returnTo=%2Fedit%2Fsettings');
      const response = await middleware(request);
      
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://localhost:3000/edit/settings');
    });

    it('should allow unauthenticated users to access /login', async () => {
      const { mockSupabaseResponse } = createMockSupabaseClient(null);
      
      const request = createMockRequest('http://localhost:3000/login');
      const response = await middleware(request);
      
      expect(response).toBe(mockSupabaseResponse);
    });

    it('should prevent open redirects with invalid returnTo URLs', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      };
      createMockSupabaseClient(mockUser);
      
      const request = createMockRequest('http://localhost:3000/login?returnTo=https://evil.com');
      const response = await middleware(request);
      
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://localhost:3000/edit');
    });
  });

  describe('Public Routes', () => {
    it('should allow access to landing page without authentication', async () => {
      const { mockSupabaseResponse } = createMockSupabaseClient(null);
      
      const request = createMockRequest('http://localhost:3000/');
      const response = await middleware(request);
      
      expect(response).toBe(mockSupabaseResponse);
    });

    it('should allow access to public garden pages without authentication', async () => {
      const { mockSupabaseResponse } = createMockSupabaseClient(null);
      
      const request = createMockRequest('http://localhost:3000/johndoe');
      const response = await middleware(request);
      
      expect(response).toBe(mockSupabaseResponse);
    });

    it('should allow access to auth callback without authentication', async () => {
      const { mockSupabaseResponse } = createMockSupabaseClient(null);
      
      const request = createMockRequest('http://localhost:3000/auth/callback');
      const response = await middleware(request);
      
      expect(response).toBe(mockSupabaseResponse);
    });

    it('should allow access to health check without authentication', async () => {
      const { mockSupabaseResponse } = createMockSupabaseClient(null);
      
      const request = createMockRequest('http://localhost:3000/api/health');
      const response = await middleware(request);
      
      expect(response).toBe(mockSupabaseResponse);
    });
  });

  describe('Error Handling', () => {
    it('should redirect to login on authentication error for protected routes', async () => {
      // Mock the auth.getUser to throw an error
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockRejectedValue(new Error('Auth error')),
        },
      };
      
      const mockSupabaseResponse = {
        cookies: {
          set: jest.fn(),
        },
      };

      mockCreateMiddlewareSupabaseClient.mockReturnValue({
        supabase: mockSupabase,
        supabaseResponse: mockSupabaseResponse,
      });
      
      const request = createMockRequest('http://localhost:3000/edit');
      const response = await middleware(request);
      
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
      expect(response.headers.get('location')).toContain('error=authentication_error');
    });

    it('should continue with request on error for public routes', async () => {
      // Mock the middleware to throw an error
      mockCreateMiddlewareSupabaseClient.mockImplementation(() => {
        throw new Error('Supabase error');
      });
      
      const request = createMockRequest('http://localhost:3000/');
      const response = await middleware(request);
      
      expect(response.status).toBe(200); // NextResponse.next() returns 200
    });

    it('should handle malformed auth data gracefully', async () => {
      createMockSupabaseClient(undefined, null); // Undefined user, no error
      
      const request = createMockRequest('http://localhost:3000/edit');
      const response = await middleware(request);
      
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
    });
  });

  describe('Route Classification', () => {
    it('should correctly identify protected routes', async () => {
      const protectedRoutes = [
        '/edit',
        '/edit/settings',
        '/api/gardens',
        '/api/gardens/123',
        '/api/media',
        '/api/user',
      ];

      for (const route of protectedRoutes) {
        createMockSupabaseClient(null); // No user
        
        const request = createMockRequest(`http://localhost:3000${route}`);
        const response = await middleware(request);
        
        expect(response.status).toBe(307);
        expect(response.headers.get('location')).toContain('/login');
      }
    });

    it('should correctly identify public routes', async () => {
      const publicRoutes = [
        '/',
        '/api/health',
        '/auth/callback',
        '/johndoe', // username route
        '/jane-smith', // username route with dash
      ];

      for (const route of publicRoutes) {
        const { mockSupabaseResponse } = createMockSupabaseClient(null);
        
        const request = createMockRequest(`http://localhost:3000${route}`);
        const response = await middleware(request);
        
        expect(response).toBe(mockSupabaseResponse);
      }
    });

    it('should correctly identify auth routes', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      };

      const authRoutes = ['/login', '/signup'];

      for (const route of authRoutes) {
        createMockSupabaseClient(mockUser);
        
        const request = createMockRequest(`http://localhost:3000${route}`);
        const response = await middleware(request);
        
        expect(response.status).toBe(307);
        expect(response.headers.get('location')).toBe('http://localhost:3000/edit');
      }
    });
  });
});