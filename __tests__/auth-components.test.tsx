import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from '../components/auth/LoginPage';
import { SignupPage } from '../components/auth/SignupPage';
import { AuthProvider } from '../hooks/useAuth';

// Mock Next.js router
const mockPush = jest.fn();
const mockSearchParams = {
  get: jest.fn(() => null),
};

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

// Mock the auth service
jest.mock('../lib/auth', () => ({
  authService: {
    getCurrentUser: jest.fn(),
    onAuthStateChange: jest.fn(() => jest.fn()),
    signIn: jest.fn(),
    signUp: jest.fn(),
    signInWithOAuth: jest.fn(),
  },
}));

// Mock the user service
jest.mock('../lib/userService', () => ({
  userService: {
    ensureUserProfile: jest.fn(),
  },
}));

describe('Authentication Components', () => {
  const mockAuthService = require('../lib/auth').authService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthService.getCurrentUser.mockResolvedValue(null);
  });

  describe('LoginPage', () => {
    it('should render login form', () => {
      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });

    it('should validate email format', async () => {
      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      const emailInput = screen.getByPlaceholderText('your@email.com');
      const submitButton = screen.getByText('Sign In');

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
      });
    });

    it('should validate required fields', async () => {
      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      const submitButton = screen.getByText('Sign In');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('should show/hide password', () => {
      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const toggleButton = passwordInput.parentElement?.querySelector('button');

      expect(passwordInput).toHaveAttribute('type', 'password');

      if (toggleButton) {
        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');

        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'password');
      }
    });

    it('should have OAuth buttons', () => {
      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      expect(screen.getByText('Continue with Google')).toBeInTheDocument();
      expect(screen.getByText('Continue with GitHub')).toBeInTheDocument();
    });
  });

  describe('SignupPage', () => {
    it('should render signup form', () => {
      render(
        <AuthProvider>
          <SignupPage />
        </AuthProvider>
      );

      expect(screen.getByText('Create Your Garden')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('your_username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Create a strong password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
      expect(screen.getByText('Create My Garden')).toBeInTheDocument();
    });

    it('should validate username format', async () => {
      render(
        <AuthProvider>
          <SignupPage />
        </AuthProvider>
      );

      const usernameInput = screen.getByPlaceholderText('your_username');
      const submitButton = screen.getByText('Create My Garden');

      fireEvent.change(usernameInput, { target: { value: 'ab' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument();
      });

      fireEvent.change(usernameInput, { target: { value: 'invalid-username!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Username can only contain letters, numbers, and underscores')).toBeInTheDocument();
      });
    });

    it('should validate password confirmation', async () => {
      render(
        <AuthProvider>
          <SignupPage />
        </AuthProvider>
      );

      const passwordInput = screen.getByPlaceholderText('Create a strong password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');
      const submitButton = screen.getByText('Create My Garden');

      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });

    it('should show username URL preview', () => {
      render(
        <AuthProvider>
          <SignupPage />
        </AuthProvider>
      );

      const usernameInput = screen.getByPlaceholderText('your_username');
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });

      expect(screen.getByText(/yoursite\.com\/testuser/)).toBeInTheDocument();
    });

    it('should have terms and privacy links', () => {
      render(
        <AuthProvider>
          <SignupPage />
        </AuthProvider>
      );

      expect(screen.getByText('Terms of Service')).toBeInTheDocument();
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    });
  });
});