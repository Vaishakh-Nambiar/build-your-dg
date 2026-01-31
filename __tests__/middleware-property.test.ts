/**
 * @jest-environment node
 */

import * as fc from 'fast-check';
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

// Custom generators for property-based testing
const protectedRouteGenerator = fc.oneof(
  fc.constant('/edit'),
  fc.string({ minLength: 1, maxLength: 20 }).map(s => `/edit/${s}`),
  fc.constant('/api/gardens'),
  fc.string({ minLength: 1, maxLength: 20 }).map(s => `/api/gardens/${s}`),
  fc.constant('/api/media'),
  fc.constant('/api/user')
);

const publicRouteGenerator = fc.oneof(
  fc.constant('/'),
  fc.constant('/api/health'),
  fc.constant('/auth/callback'),
  fc.string({ minLength: 1, maxLength: 20 }).map(s => `/${s}`) // username routes
);

const authRouteGenerator = fc.oneof(
  fc.constant('/login'),
  fc.constant('/signup')
);

const userGenerator = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }),
  email: fc.emailAddress(),
  created_at: fc.date({ min: new Date('2020-01-01'), max: new Date() })
    .filter(d => !isNaN(d.getTime())) // Filter out invalid dates
    .map(d => d.toISOString()),
});

const baseUrlGenerator = fc.oneof(
  fc.constant('http://localhost:3000'),
  fc.constant('https://example.com'),
  fc.constant('http://127.0.0.1:3000')
);

describe('Middleware Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * **Feature: digital-garden-backend-integration, Property 3: Protected Route Security**
   * For any protected route request without valid authentication, 
   * the system should reject access and redirect to login
   * **Validates: Requirements 3.3, 3.4**
   */
  it('Property 3: Protected Route Security - should always redirect unauthenticated users from protected routes', async () => {
    await fc.assert(
      fc.asyncProperty(
        baseUrlGenerator,
        protectedRouteGenerator,
        fc.option(fc.string(), { nil: null }), // query parameters
        async (baseUrl, protectedRoute, queryParams) => {
          // Setup: No authenticated user
          createMockSupabaseClient(null);
          
          // Create request URL with optional query parameters
          const url = queryParams 
            ? `${baseUrl}${protectedRoute}?${queryParams}`
            : `${baseUrl}${protectedRoute}`;
          
          const request = createMockRequest(url);
          const response = await middleware(request);
          
          // Assert: Should always redirect to login
          expect(response.status).toBe(307);
          const location = response.headers.get('location');
          expect(location).toContain('/login');
          expect(location).toContain('returnTo=');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: digital-garden-backend-integration, Property 2: Authentication Round Trip**
   * For any valid user credentials, successful authentication should create a session 
   * that can be used to access protected resources
   * **Validates: Requirements 3.1, 3.2, 3.5**
   */
  it('Property 2: Authentication Round Trip - authenticated users should access protected routes', async () => {
    await fc.assert(
      fc.asyncProperty(
        baseUrlGenerator,
        protectedRouteGenerator,
        userGenerator,
        async (baseUrl, protectedRoute, user) => {
          // Setup: Authenticated user with recent session
          const recentUser = {
            ...user,
            created_at: new Date().toISOString(), // Recent session
          };
          const { mockSupabaseResponse } = createMockSupabaseClient(recentUser);
          
          const request = createMockRequest(`${baseUrl}${protectedRoute}`);
          const response = await middleware(request);
          
          // Assert: Should allow access (return supabase response, not redirect)
          expect(response).toBe(mockSupabaseResponse);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Public Route Access - public routes should be accessible without authentication
   */
  it('Property: Public Route Access - should allow access to public routes without authentication', async () => {
    await fc.assert(
      fc.asyncProperty(
        baseUrlGenerator,
        publicRouteGenerator,
        async (baseUrl, publicRoute) => {
          // Setup: No authenticated user
          const { mockSupabaseResponse } = createMockSupabaseClient(null);
          
          const request = createMockRequest(`${baseUrl}${publicRoute}`);
          const response = await middleware(request);
          
          // Assert: Should allow access without redirect
          expect(response).toBe(mockSupabaseResponse);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Auth Route Redirect - authenticated users should be redirected from auth routes
   */
  it('Property: Auth Route Redirect - should redirect authenticated users from auth routes', async () => {
    await fc.assert(
      fc.asyncProperty(
        baseUrlGenerator,
        authRouteGenerator,
        userGenerator,
        fc.option(fc.oneof(
          fc.constant('/dashboard'),
          fc.constant('/profile'),
          fc.constant('/settings'),
          fc.constant('/edit/advanced')
        ), { nil: null }),
        async (baseUrl, authRoute, user, returnTo) => {
          // Setup: Authenticated user
          const recentUser = {
            ...user,
            created_at: new Date().toISOString(),
          };
          createMockSupabaseClient(recentUser);
          
          // Create request URL with optional returnTo parameter
          const url = returnTo 
            ? `${baseUrl}${authRoute}?returnTo=${encodeURIComponent(returnTo)}`
            : `${baseUrl}${authRoute}`;
          
          const request = createMockRequest(url);
          const response = await middleware(request);
          
          // Assert: Should redirect away from auth route
          expect(response.status).toBe(307);
          const location = response.headers.get('location');
          
          if (returnTo) {
            // Should redirect to valid returnTo URL
            expect(location).toContain(returnTo);
          } else {
            // Should redirect to default /edit
            expect(location).toContain('/edit');
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Session Expiry Handling - expired sessions should be rejected
   */
  it('Property: Session Expiry Handling - should reject expired sessions', async () => {
    await fc.assert(
      fc.asyncProperty(
        baseUrlGenerator,
        protectedRouteGenerator,
        userGenerator,
        async (baseUrl, protectedRoute, user) => {
          // Setup: User with expired session (older than 24 hours)
          const expiredUser = {
            ...user,
            created_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago
          };
          createMockSupabaseClient(expiredUser);
          
          const request = createMockRequest(`${baseUrl}${protectedRoute}`);
          const response = await middleware(request);
          
          // Assert: Should redirect to login due to expired session
          expect(response.status).toBe(307);
          const location = response.headers.get('location');
          expect(location).toContain('/login');
          expect(location).toContain('sessionExpired=true');
        }
      ),
      { numRuns: 50 } // Fewer runs for this more complex test
    );
  });

  /**
   * Property: URL Validation Security - should prevent open redirects
   */
  it('Property: URL Validation Security - should prevent open redirects', async () => {
    const maliciousUrlGenerator = fc.oneof(
      fc.constant('https://evil.com'),
      fc.constant('http://malicious.site'),
      fc.constant('//evil.com'),
      fc.constant('javascript:alert(1)'),
      fc.webUrl()
    );

    await fc.assert(
      fc.asyncProperty(
        baseUrlGenerator,
        authRouteGenerator,
        userGenerator,
        maliciousUrlGenerator,
        async (baseUrl, authRoute, user, maliciousUrl) => {
          // Setup: Authenticated user trying to redirect to malicious URL
          const recentUser = {
            ...user,
            created_at: new Date().toISOString(),
          };
          createMockSupabaseClient(recentUser);
          
          const request = createMockRequest(`${baseUrl}${authRoute}?returnTo=${encodeURIComponent(maliciousUrl)}`);
          const response = await middleware(request);
          
          // Assert: Should redirect to safe default, not malicious URL
          expect(response.status).toBe(307);
          const location = response.headers.get('location');
          expect(location).toContain('/edit');
          expect(location).not.toContain('evil.com');
          expect(location).not.toContain('malicious.site');
          expect(location).not.toContain('javascript:');
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Error Resilience - should handle authentication errors gracefully
   */
  it('Property: Error Resilience - should handle authentication errors gracefully', async () => {
    await fc.assert(
      fc.asyncProperty(
        baseUrlGenerator,
        protectedRouteGenerator,
        async (baseUrl, protectedRoute) => {
          // Setup: Mock authentication error
          const mockSupabase = {
            auth: {
              getUser: jest.fn().mockRejectedValue(new Error('Auth service unavailable')),
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
          
          const request = createMockRequest(`${baseUrl}${protectedRoute}`);
          const response = await middleware(request);
          
          // Assert: Should redirect to login with error parameter
          expect(response.status).toBe(307);
          const location = response.headers.get('location');
          expect(location).toContain('/login');
          expect(location).toContain('error=authentication_error');
        }
      ),
      { numRuns: 50 }
    );
  });
});