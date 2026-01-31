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
function createMockRequest(url: string) {
  return new NextRequest(url);
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

describe('Middleware Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Real Application Routes', () => {
    it('should protect /edit route', async () => {
      createMockSupabaseClient(null); // No user
      
      const request = createMockRequest('http://localhost:3000/edit');
      const response = await middleware(request);
      
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://localhost:3000/login?returnTo=%2Fedit');
    });

    it('should allow access to landing page', async () => {
      const { mockSupabaseResponse } = createMockSupabaseClient(null);
      
      const request = createMockRequest('http://localhost:3000/');
      const response = await middleware(request);
      
      expect(response).toBe(mockSupabaseResponse);
    });

    it('should allow access to public garden pages', async () => {
      const { mockSupabaseResponse } = createMockSupabaseClient(null);
      
      const request = createMockRequest('http://localhost:3000/johndoe');
      const response = await middleware(request);
      
      expect(response).toBe(mockSupabaseResponse);
    });

    it('should redirect authenticated users from login', async () => {
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

    it('should redirect authenticated users from signup', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      };
      createMockSupabaseClient(mockUser);
      
      const request = createMockRequest('http://localhost:3000/signup');
      const response = await middleware(request);
      
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe('http://localhost:3000/edit');
    });

    it('should allow access to auth callback', async () => {
      const { mockSupabaseResponse } = createMockSupabaseClient(null);
      
      const request = createMockRequest('http://localhost:3000/auth/callback');
      const response = await middleware(request);
      
      expect(response).toBe(mockSupabaseResponse);
    });

    it('should handle complex return URL flow', async () => {
      // First, unauthenticated user tries to access protected route
      createMockSupabaseClient(null);
      
      const protectedRequest = createMockRequest('http://localhost:3000/edit?tab=settings');
      const protectedResponse = await middleware(protectedRequest);
      
      expect(protectedResponse.status).toBe(307);
      const loginUrl = protectedResponse.headers.get('location');
      expect(loginUrl).toContain('/login');
      expect(loginUrl).toContain('returnTo=%2Fedit');
      expect(loginUrl).toContain('originalQuery=%3Ftab%3Dsettings');

      // Then, authenticated user accesses login with return URL
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        created_at: new Date().toISOString(),
      };
      createMockSupabaseClient(mockUser);
      
      const loginRequest = createMockRequest('http://localhost:3000/login?returnTo=%2Fedit&originalQuery=%3Ftab%3Dsettings');
      const loginResponse = await middleware(loginRequest);
      
      expect(loginResponse.status).toBe(307);
      expect(loginResponse.headers.get('location')).toBe('http://localhost:3000/edit');
    });
  });

  describe('API Route Protection', () => {
    it('should protect garden API routes', async () => {
      createMockSupabaseClient(null);
      
      const routes = [
        '/api/gardens',
        '/api/gardens/123',
        '/api/media',
        '/api/user'
      ];

      for (const route of routes) {
        const request = createMockRequest(`http://localhost:3000${route}`);
        const response = await middleware(request);
        
        expect(response.status).toBe(307);
        expect(response.headers.get('location')).toContain('/login');
      }
    });

    it('should allow access to health check API', async () => {
      const { mockSupabaseResponse } = createMockSupabaseClient(null);
      
      const request = createMockRequest('http://localhost:3000/api/health');
      const response = await middleware(request);
      
      expect(response).toBe(mockSupabaseResponse);
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed URLs gracefully', async () => {
      createMockSupabaseClient(null);
      
      const request = createMockRequest('http://localhost:3000/edit%20malformed');
      const response = await middleware(request);
      
      // Should still redirect to login for protected route
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
    });

    it('should handle very long URLs', async () => {
      createMockSupabaseClient(null);
      
      const longPath = '/edit/' + 'a'.repeat(1000);
      const request = createMockRequest(`http://localhost:3000${longPath}`);
      const response = await middleware(request);
      
      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/login');
    });

    it('should handle URLs with special characters', async () => {
      const { mockSupabaseResponse } = createMockSupabaseClient(null);
      
      const request = createMockRequest('http://localhost:3000/user-name_123');
      const response = await middleware(request);
      
      // Should allow access to username route
      expect(response).toBe(mockSupabaseResponse);
    });
  });
});