import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../hooks/useAuth';

// Mock the entire auth service
jest.mock('../lib/auth', () => ({
  authService: {
    getCurrentUser: jest.fn(),
    onAuthStateChange: jest.fn(() => jest.fn()), // Return unsubscribe function
  },
}));

// Mock the user service
jest.mock('../lib/userService', () => ({
  userService: {
    ensureUserProfile: jest.fn(),
  },
}));

// Test component that uses auth
function TestComponent() {
  const { user, loading, error } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (user) return <div>Welcome {user.displayName || user.email}</div>;

  return <div>Not authenticated</div>;
}

describe('Authentication Integration', () => {
  const mockAuthService = require('../lib/auth').authService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', async () => {
    mockAuthService.getCurrentUser.mockImplementation(() => new Promise(() => {})); // Never resolves

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should handle no authenticated user', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue(null);

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Not authenticated')).toBeInTheDocument();
    });
  });

  it('should handle authenticated user', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      displayName: 'Test User'
    };

    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Welcome Test User')).toBeInTheDocument();
    });
  });

  it('should handle auth initialization error', async () => {
    mockAuthService.getCurrentUser.mockRejectedValue(new Error('Auth failed'));

    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to initialize authentication')).toBeInTheDocument();
    });
  });

  it('should set up auth state change listener', async () => {
    mockAuthService.getCurrentUser.mockResolvedValue(null);
    const mockUnsubscribe = jest.fn();
    mockAuthService.onAuthStateChange.mockReturnValue(mockUnsubscribe);

    const { unmount } = await act(async () => {
      return render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    // Verify auth state change listener was set up
    expect(mockAuthService.onAuthStateChange).toHaveBeenCalled();

    // Unmount and verify cleanup
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});