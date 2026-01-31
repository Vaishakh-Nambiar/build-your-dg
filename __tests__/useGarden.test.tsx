import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useGarden } from '@/hooks/useGarden';
import { useAuth } from '@/hooks/useAuth';
import { gardenService } from '@/lib/gardenService';

// Mock dependencies
jest.mock('@/hooks/useAuth');
jest.mock('@/lib/gardenService');

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockGardenService = gardenService as jest.Mocked<typeof gardenService>;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('useGarden', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    displayName: 'Test User',
  };

  const mockGarden = {
    id: 'garden-123',
    user_id: 'user-123',
    title: 'Test Garden',
    description: 'A test garden',
    tiles: [{ id: '1', type: 'text', content: 'Hello' }],
    layout: { showGrid: true },
    is_public: false,
    slug: null,
    view_count: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      signInWithOAuth: jest.fn(),
      clearError: jest.fn(),
    });

    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useGarden());

      expect(result.current.garden).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.saveStatus).toEqual({
        status: 'idle',
        hasUnsavedChanges: false,
      });
    });

    it('should load garden when gardenId is provided', async () => {
      mockGardenService.getGarden.mockResolvedValue(mockGarden);

      const { result } = renderHook(() => useGarden({ gardenId: 'garden-123' }));

      await waitFor(() => {
        expect(mockGardenService.getGarden).toHaveBeenCalledWith('garden-123', 'user-123');
        expect(result.current.garden).toEqual(mockGarden);
      });
    });

    it('should check for local backup on mount', () => {
      const mockBackup = {
        gardenId: 'garden-123',
        tiles: [{ id: '1', type: 'text', content: 'Backup' }],
        timestamp: '2024-01-01T00:00:00Z',
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockBackup));

      const { result } = renderHook(() => useGarden());

      expect(result.current.checkForLocalBackup()).toEqual(mockBackup);
    });
  });

  describe('createGarden', () => {
    it('should create a new garden', async () => {
      mockGardenService.createGarden.mockResolvedValue(mockGarden);

      const { result } = renderHook(() => useGarden());

      const gardenData = {
        title: 'New Garden',
        tiles: [],
        layout: {},
      };

      let createdGarden: any;
      await act(async () => {
        createdGarden = await result.current.createGarden(gardenData);
      });

      expect(mockGardenService.createGarden).toHaveBeenCalledWith('user-123', gardenData);
      expect(createdGarden).toEqual(mockGarden);
      expect(result.current.garden).toEqual(mockGarden);
      expect(result.current.saveStatus.status).toBe('saved');
    });

    it('should handle creation errors', async () => {
      const error = new Error('Creation failed');
      mockGardenService.createGarden.mockRejectedValue(error);

      const { result } = renderHook(() => useGarden());

      let createdGarden: any;
      await act(async () => {
        createdGarden = await result.current.createGarden({
          title: 'New Garden',
          tiles: [],
          layout: {},
        });
      });

      expect(createdGarden).toBeNull();
      expect(result.current.saveStatus.status).toBe('error');
      expect(result.current.saveStatus.error).toBe('Creation failed');
    });
  });

  describe('updateGarden', () => {
    it('should update garden successfully', async () => {
      const updatedGarden = { ...mockGarden, title: 'Updated Garden' };
      mockGardenService.updateGarden.mockResolvedValue(updatedGarden);

      const { result } = renderHook(() => useGarden());

      // Set initial garden
      act(() => {
        result.current.garden = mockGarden;
      });

      await act(async () => {
        await result.current.updateGarden({ title: 'Updated Garden' });
      });

      expect(mockGardenService.updateGarden).toHaveBeenCalledWith(
        'garden-123',
        'user-123',
        { title: 'Updated Garden' }
      );
      expect(result.current.garden).toEqual(updatedGarden);
      expect(result.current.saveStatus.status).toBe('saved');
    });
  });

  describe('autoSave', () => {
    it('should debounce auto-save calls', async () => {
      mockGardenService.autoSaveGarden.mockResolvedValue();

      const { result } = renderHook(() => useGarden({ autoSaveDelay: 1000 }));

      // Set initial garden
      act(() => {
        result.current.garden = mockGarden;
      });

      const newTiles = [{ id: '2', type: 'text', content: 'New content' }];

      // Call autoSave multiple times
      act(() => {
        result.current.autoSave(newTiles);
        result.current.autoSave(newTiles);
        result.current.autoSave(newTiles);
      });

      // Should mark as having unsaved changes immediately
      expect(result.current.saveStatus.hasUnsavedChanges).toBe(true);

      // Fast-forward time to trigger auto-save
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockGardenService.autoSaveGarden).toHaveBeenCalledTimes(1);
        expect(mockGardenService.autoSaveGarden).toHaveBeenCalledWith(
          'garden-123',
          'user-123',
          newTiles,
          mockGarden.layout
        );
      });
    });

    it('should handle auto-save errors', async () => {
      const error = new Error('Auto-save failed');
      mockGardenService.autoSaveGarden.mockRejectedValue(error);

      const { result } = renderHook(() => useGarden({ autoSaveDelay: 100 }));

      // Set initial garden
      act(() => {
        result.current.garden = mockGarden;
      });

      act(() => {
        result.current.autoSave([]);
      });

      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.saveStatus.status).toBe('error');
        expect(result.current.saveStatus.error).toBe('Auto-save failed');
      });
    });
  });

  describe('manualSave', () => {
    it('should perform manual save', async () => {
      const updatedGarden = { ...mockGarden, updated_at: '2024-01-01T01:00:00Z' };
      mockGardenService.updateGarden.mockResolvedValue(updatedGarden);

      const { result } = renderHook(() => useGarden());

      // Set initial garden and pending changes
      act(() => {
        result.current.garden = mockGarden;
        result.current.autoSave([{ id: '2', type: 'text', content: 'Manual save' }]);
      });

      await act(async () => {
        await result.current.manualSave();
      });

      expect(mockGardenService.updateGarden).toHaveBeenCalled();
    });

    it('should handle case with no pending changes', async () => {
      const { result } = renderHook(() => useGarden());

      // Set initial garden without pending changes
      act(() => {
        result.current.garden = mockGarden;
      });

      await act(async () => {
        await result.current.manualSave();
      });

      // Should just update status without calling service
      expect(result.current.saveStatus.status).toBe('saved');
      expect(result.current.saveStatus.hasUnsavedChanges).toBe(false);
    });
  });

  describe('publishGarden', () => {
    it('should publish garden with slug', async () => {
      const publishedGarden = { ...mockGarden, is_public: true, slug: 'test-garden' };
      mockGardenService.publishGarden.mockResolvedValue(publishedGarden);

      const { result } = renderHook(() => useGarden());

      // Set initial garden
      act(() => {
        result.current.garden = mockGarden;
      });

      await act(async () => {
        await result.current.publishGarden('test-garden');
      });

      expect(mockGardenService.publishGarden).toHaveBeenCalledWith(
        'garden-123',
        'user-123',
        'test-garden'
      );
      expect(result.current.garden).toEqual(publishedGarden);
    });
  });

  describe('unpublishGarden', () => {
    it('should unpublish garden', async () => {
      const unpublishedGarden = { ...mockGarden, is_public: false };
      mockGardenService.unpublishGarden.mockResolvedValue(unpublishedGarden);

      const { result } = renderHook(() => useGarden());

      // Set initial garden
      act(() => {
        result.current.garden = mockGarden;
      });

      await act(async () => {
        await result.current.unpublishGarden();
      });

      expect(mockGardenService.unpublishGarden).toHaveBeenCalledWith(
        'garden-123',
        'user-123'
      );
      expect(result.current.garden).toEqual(unpublishedGarden);
    });
  });

  describe('togglePublic', () => {
    it('should publish private garden', async () => {
      const publishedGarden = { ...mockGarden, is_public: true, slug: 'test-garden' };
      mockGardenService.generateUniqueSlug.mockResolvedValue('test-garden');
      mockGardenService.publishGarden.mockResolvedValue(publishedGarden);

      const { result } = renderHook(() => useGarden());

      // Set initial private garden
      act(() => {
        result.current.garden = { ...mockGarden, is_public: false };
      });

      await act(async () => {
        await result.current.togglePublic();
      });

      expect(mockGardenService.generateUniqueSlug).toHaveBeenCalled();
      expect(mockGardenService.publishGarden).toHaveBeenCalledWith(
        'garden-123',
        'user-123',
        'test-garden'
      );
    });

    it('should unpublish public garden', async () => {
      const unpublishedGarden = { ...mockGarden, is_public: false };
      mockGardenService.unpublishGarden.mockResolvedValue(unpublishedGarden);

      const { result } = renderHook(() => useGarden());

      // Set initial public garden
      act(() => {
        result.current.garden = { ...mockGarden, is_public: true };
      });

      await act(async () => {
        await result.current.togglePublic();
      });

      expect(mockGardenService.unpublishGarden).toHaveBeenCalledWith(
        'garden-123',
        'user-123'
      );
    });
  });

  describe('local backup', () => {
    it('should backup to localStorage', () => {
      const { result } = renderHook(() => useGarden());

      // Set initial garden
      act(() => {
        result.current.garden = mockGarden;
      });

      act(() => {
        result.current.backupToLocalStorage();
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'garden-backup',
        expect.stringContaining('"gardenId":"garden-123"')
      );
    });

    it('should restore from localStorage backup', () => {
      const mockBackup = {
        gardenId: 'garden-123',
        tiles: [{ id: '1', type: 'text', content: 'Backup' }],
        layout: { showGrid: false },
        title: 'Backup Garden',
        timestamp: '2024-01-01T00:00:00Z',
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockBackup));

      const { result } = renderHook(() => useGarden());

      // Set initial garden
      act(() => {
        result.current.garden = mockGarden;
      });

      let restored: boolean;
      act(() => {
        restored = result.current.restoreFromLocalBackup();
      });

      expect(restored).toBe(true);
      expect(result.current.saveStatus.hasUnsavedChanges).toBe(true);
    });

    it('should clear local backup', () => {
      const { result } = renderHook(() => useGarden());

      act(() => {
        result.current.clearLocalBackup();
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('garden-backup');
    });
  });

  describe('getPublicUrl', () => {
    it('should return public URL for published garden', () => {
      const { result } = renderHook(() => useGarden());

      // Set initial public garden with slug
      act(() => {
        result.current.garden = { ...mockGarden, is_public: true, slug: 'my-garden' };
      });

      const url = result.current.getPublicUrl();
      expect(url).toBe('http://localhost/my-garden');
    });

    it('should return null for private garden', () => {
      const { result } = renderHook(() => useGarden());

      // Set initial private garden
      act(() => {
        result.current.garden = { ...mockGarden, is_public: false };
      });

      const url = result.current.getPublicUrl();
      expect(url).toBeNull();
    });
  });
});