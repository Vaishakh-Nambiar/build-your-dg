import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TopBar, type SaveStatus } from '../garden/TopBar';
import { useAuth } from '@/hooks/useAuth';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Save: () => <div data-testid="save-icon" />,
  Check: () => <div data-testid="check-icon" />,
  AlertTriangle: () => <div data-testid="alert-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  EyeOff: () => <div data-testid="eye-off-icon" />,
  User: () => <div data-testid="user-icon" />,
  BarChart3: () => <div data-testid="chart-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  Palette: () => <div data-testid="palette-icon" />,
  HelpCircle: () => <div data-testid="help-icon" />,
  LogOut: () => <div data-testid="logout-icon" />,
  ExternalLink: () => <div data-testid="external-link-icon" />,
  Edit3: () => <div data-testid="edit-icon" />
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, onClick, disabled, className, ...props }: any) => (
      <button onClick={onClick} disabled={disabled} className={className} {...props}>
        {children}
      </button>
    ),
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    )
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('TopBar', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg'
  };

  const mockSignOut = jest.fn();

  const defaultProps = {
    gardenName: 'My Test Garden',
    onGardenNameChange: jest.fn(),
    saveStatus: {
      status: 'idle' as const,
      hasUnsavedChanges: false
    } as SaveStatus,
    onManualSave: jest.fn(),
    isPublic: false,
    onTogglePublic: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: mockSignOut,
      signInWithOAuth: jest.fn(),
      clearError: jest.fn(),
    });
  });

  describe('Garden Title', () => {
    it('should display the garden name', () => {
      render(<TopBar {...defaultProps} />);
      expect(screen.getByText('My Test Garden')).toBeInTheDocument();
    });

    it('should allow editing the garden name', async () => {
      const user = userEvent.setup();
      const onGardenNameChange = jest.fn();
      
      render(<TopBar {...defaultProps} onGardenNameChange={onGardenNameChange} />);
      
      // Click on the garden name to edit
      await user.click(screen.getByText('My Test Garden'));
      
      // Should show input field
      const input = screen.getByDisplayValue('My Test Garden');
      expect(input).toBeInTheDocument();
      
      // Change the name
      await user.clear(input);
      await user.type(input, 'New Garden Name');
      await user.keyboard('{Enter}');
      
      expect(onGardenNameChange).toHaveBeenCalledWith('New Garden Name');
    });

    it('should cancel editing on Escape key', async () => {
      const user = userEvent.setup();
      const onGardenNameChange = jest.fn();
      
      render(<TopBar {...defaultProps} onGardenNameChange={onGardenNameChange} />);
      
      // Click on the garden name to edit
      await user.click(screen.getByText('My Test Garden'));
      
      const input = screen.getByDisplayValue('My Test Garden');
      await user.clear(input);
      await user.type(input, 'Changed Name');
      await user.keyboard('{Escape}');
      
      // Should not call onGardenNameChange
      expect(onGardenNameChange).not.toHaveBeenCalled();
      
      // Should show original name
      expect(screen.getByText('My Test Garden')).toBeInTheDocument();
    });
  });

  describe('Save Status', () => {
    it('should show "All Saved" when no unsaved changes', () => {
      render(<TopBar {...defaultProps} />);
      expect(screen.getByText('All Saved ✓')).toBeInTheDocument();
      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('should show "Unsaved Changes" when there are unsaved changes', () => {
      const saveStatus: SaveStatus = {
        status: 'idle',
        hasUnsavedChanges: true
      };
      
      render(<TopBar {...defaultProps} saveStatus={saveStatus} />);
      expect(screen.getByText('Unsaved Changes ⚠️')).toBeInTheDocument();
      expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
    });

    it('should show "Saving..." when saving', () => {
      const saveStatus: SaveStatus = {
        status: 'saving',
        hasUnsavedChanges: true
      };
      
      render(<TopBar {...defaultProps} saveStatus={saveStatus} />);
      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    });

    it('should show "Save Failed" when there is an error', () => {
      const saveStatus: SaveStatus = {
        status: 'error',
        hasUnsavedChanges: true,
        error: 'Network error'
      };
      
      render(<TopBar {...defaultProps} saveStatus={saveStatus} />);
      expect(screen.getByText('Save Failed')).toBeInTheDocument();
      expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
    });

    it('should show last saved time when available', () => {
      const lastSaved = new Date('2024-01-01T12:00:00Z');
      const saveStatus: SaveStatus = {
        status: 'saved',
        hasUnsavedChanges: false,
        lastSaved
      };
      
      render(<TopBar {...defaultProps} saveStatus={saveStatus} />);
      // Should show some time indication (exact format may vary)
      expect(screen.getByText(/ago|now/i)).toBeInTheDocument();
    });
  });

  describe('Manual Save Button', () => {
    it('should call onManualSave when clicked', async () => {
      const user = userEvent.setup();
      const onManualSave = jest.fn().mockResolvedValue(undefined);
      
      render(<TopBar {...defaultProps} onManualSave={onManualSave} />);
      
      await user.click(screen.getByRole('button', { name: /save garden/i }));
      expect(onManualSave).toHaveBeenCalled();
    });

    it('should be disabled when saving', () => {
      const saveStatus: SaveStatus = {
        status: 'saving',
        hasUnsavedChanges: true
      };
      
      render(<TopBar {...defaultProps} saveStatus={saveStatus} />);
      
      const saveButton = screen.getByRole('button', { name: /save garden/i });
      expect(saveButton).toBeDisabled();
    });

    it('should show loading state when manually saving', async () => {
      const user = userEvent.setup();
      let resolvePromise: () => void;
      const savePromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      const onManualSave = jest.fn().mockReturnValue(savePromise);
      
      render(<TopBar {...defaultProps} onManualSave={onManualSave} />);
      
      const saveButton = screen.getByRole('button', { name: /save garden/i });
      await user.click(saveButton);
      
      // Should show loader icon while saving
      expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
      expect(saveButton).toBeDisabled();
      
      // Resolve the promise
      resolvePromise!();
      await waitFor(() => {
        expect(saveButton).not.toBeDisabled();
      });
    });
  });

  describe('Publish/Unpublish Toggle', () => {
    it('should show "Private" when garden is not public', () => {
      render(<TopBar {...defaultProps} isPublic={false} />);
      expect(screen.getByText('Private')).toBeInTheDocument();
      expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument();
    });

    it('should show "Published" when garden is public', () => {
      render(<TopBar {...defaultProps} isPublic={true} />);
      expect(screen.getByText('Published')).toBeInTheDocument();
      expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
    });

    it('should call onTogglePublic when clicked', async () => {
      const user = userEvent.setup();
      const onTogglePublic = jest.fn().mockResolvedValue(undefined);
      
      render(<TopBar {...defaultProps} onTogglePublic={onTogglePublic} />);
      
      await user.click(screen.getByRole('button', { name: /private/i }));
      expect(onTogglePublic).toHaveBeenCalled();
    });
  });

  describe('Profile Menu', () => {
    it('should display user avatar and name', () => {
      render(<TopBar {...defaultProps} />);
      
      const avatar = screen.getByAltText('Test User');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
      
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('should show default user icon when no avatar', () => {
      mockUseAuth.mockReturnValue({
        user: { ...mockUser, avatarUrl: undefined },
        loading: false,
        error: null,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: mockSignOut,
        signInWithOAuth: jest.fn(),
        clearError: jest.fn(),
      });
      
      render(<TopBar {...defaultProps} />);
      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    });

    it('should open profile menu when clicked', async () => {
      const user = userEvent.setup();
      render(<TopBar {...defaultProps} />);
      
      // Click on profile button
      await user.click(screen.getByRole('button', { name: /test user/i }));
      
      // Should show menu items
      expect(screen.getByText('Stats')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Appearance')).toBeInTheDocument();
      expect(screen.getByText('Help')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should show "View Public Garden" link when garden is public', async () => {
      const user = userEvent.setup();
      const publicUrl = 'https://example.com/my-garden';
      
      render(<TopBar {...defaultProps} isPublic={true} publicUrl={publicUrl} />);
      
      await user.click(screen.getByRole('button', { name: /test user/i }));
      
      const publicLink = screen.getByText('View Public Garden');
      expect(publicLink).toBeInTheDocument();
      expect(publicLink.closest('a')).toHaveAttribute('href', publicUrl);
    });

    it('should call signOut when logout is clicked', async () => {
      const user = userEvent.setup();
      render(<TopBar {...defaultProps} />);
      
      await user.click(screen.getByRole('button', { name: /test user/i }));
      await user.click(screen.getByText('Logout'));
      
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('Logo and Branding', () => {
    it('should display the logo and brand name', () => {
      render(<TopBar {...defaultProps} />);
      
      expect(screen.getByText('🌱')).toBeInTheDocument();
      expect(screen.getByText('Digital Garden')).toBeInTheDocument();
    });
  });
});