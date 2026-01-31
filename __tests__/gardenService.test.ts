import { GardenService } from '@/lib/gardenService';
import { createBrowserSupabaseClient } from '@/lib/supabase';

// Mock the Supabase client
jest.mock('@/lib/supabase');
const mockCreateBrowserSupabaseClient = createBrowserSupabaseClient as jest.MockedFunction<typeof createBrowserSupabaseClient>;

describe('GardenService', () => {
  let gardenService: GardenService;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn(),
      rpc: jest.fn(),
    };

    mockCreateBrowserSupabaseClient.mockReturnValue(mockSupabase);
    gardenService = new GardenService(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createGarden', () => {
    it('should create a new garden successfully', async () => {
      const userId = 'user-123';
      const gardenData = {
        title: 'Test Garden',
        description: 'A test garden',
        tiles: [{ id: '1', type: 'text', content: 'Hello' }],
        layout: { showGrid: true },
        isPublic: false,
      };

      const mockGarden = {
        id: 'garden-123',
        user_id: userId,
        title: 'Test Garden',
        description: 'A test garden',
        tiles: gardenData.tiles,
        layout: gardenData.layout,
        is_public: false,
        slug: null,
        view_count: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockSupabase.single.mockResolvedValue({ data: mockGarden, error: null });

      const result = await gardenService.createGarden(userId, gardenData);

      expect(mockSupabase.from).toHaveBeenCalledWith('gardens');
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        user_id: userId,
        title: gardenData.title,
        description: gardenData.description,
        tiles: gardenData.tiles,
        layout: gardenData.layout,
        is_public: false,
        slug: undefined,
      });
      expect(result).toEqual(mockGarden);
    });

    it('should throw error when creation fails', async () => {
      const userId = 'user-123';
      const gardenData = {
        title: 'Test Garden',
        tiles: [],
        layout: {},
      };

      mockSupabase.single.mockResolvedValue({ 
        data: null, 
        error: { message: 'Database error' } 
      });

      await expect(gardenService.createGarden(userId, gardenData))
        .rejects.toThrow('Failed to create garden: Database error');
    });
  });

  describe('getGarden', () => {
    it('should get a garden by ID for authenticated user', async () => {
      const gardenId = 'garden-123';
      const userId = 'user-123';
      const mockGarden = {
        id: gardenId,
        user_id: userId,
        title: 'Test Garden',
        is_public: false,
      };

      mockSupabase.single.mockResolvedValue({ data: mockGarden, error: null });

      const result = await gardenService.getGarden(gardenId, userId);

      expect(mockSupabase.from).toHaveBeenCalledWith('gardens');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', gardenId);
      expect(result).toEqual(mockGarden);
    });

    it('should return null when garden not found', async () => {
      const gardenId = 'garden-123';
      const userId = 'user-123';

      mockSupabase.single.mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST116' } 
      });

      const result = await gardenService.getGarden(gardenId, userId);
      expect(result).toBeNull();
    });

    it('should throw error for other database errors', async () => {
      const gardenId = 'garden-123';
      const userId = 'user-123';

      mockSupabase.single.mockResolvedValue({ 
        data: null, 
        error: { message: 'Database error', code: 'OTHER' } 
      });

      await expect(gardenService.getGarden(gardenId, userId))
        .rejects.toThrow('Failed to get garden: Database error');
    });
  });

  describe('updateGarden', () => {
    it('should update a garden successfully', async () => {
      const gardenId = 'garden-123';
      const userId = 'user-123';
      const updates = {
        title: 'Updated Garden',
        tiles: [{ id: '1', type: 'text', content: 'Updated' }],
      };

      const mockUpdatedGarden = {
        id: gardenId,
        user_id: userId,
        title: 'Updated Garden',
        tiles: updates.tiles,
        updated_at: '2024-01-01T01:00:00Z',
      };

      mockSupabase.single.mockResolvedValue({ data: mockUpdatedGarden, error: null });

      const result = await gardenService.updateGarden(gardenId, userId, updates);

      expect(mockSupabase.from).toHaveBeenCalledWith('gardens');
      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          title: updates.title,
          tiles: updates.tiles,
        })
      );
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', gardenId);
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', userId);
      expect(result).toEqual(mockUpdatedGarden);
    });
  });

  describe('deleteGarden', () => {
    it('should delete a garden successfully', async () => {
      const gardenId = 'garden-123';
      const userId = 'user-123';

      mockSupabase.delete.mockResolvedValue({ error: null });

      await gardenService.deleteGarden(gardenId, userId);

      expect(mockSupabase.from).toHaveBeenCalledWith('gardens');
      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', gardenId);
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', userId);
    });

    it('should throw error when deletion fails', async () => {
      const gardenId = 'garden-123';
      const userId = 'user-123';

      mockSupabase.delete.mockResolvedValue({ error: { message: 'Delete failed' } });

      await expect(gardenService.deleteGarden(gardenId, userId))
        .rejects.toThrow('Failed to delete garden: Delete failed');
    });
  });

  describe('getUserGardens', () => {
    it('should get all gardens for a user', async () => {
      const userId = 'user-123';
      const mockGardens = [
        { id: 'garden-1', user_id: userId, title: 'Garden 1' },
        { id: 'garden-2', user_id: userId, title: 'Garden 2' },
      ];

      mockSupabase.order.mockResolvedValue({ data: mockGardens, error: null });

      const result = await gardenService.getUserGardens(userId);

      expect(mockSupabase.from).toHaveBeenCalledWith('gardens');
      expect(mockSupabase.select).toHaveBeenCalledWith('*');
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', userId);
      expect(mockSupabase.order).toHaveBeenCalledWith('updated_at', { ascending: false });
      expect(result).toEqual(mockGardens);
    });

    it('should return empty array when no gardens found', async () => {
      const userId = 'user-123';

      mockSupabase.order.mockResolvedValue({ data: null, error: null });

      const result = await gardenService.getUserGardens(userId);
      expect(result).toEqual([]);
    });
  });

  describe('publishGarden', () => {
    it('should publish a garden with unique slug', async () => {
      const gardenId = 'garden-123';
      const userId = 'user-123';
      const slug = 'my-garden';

      // Mock slug availability check
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: null });

      const mockPublishedGarden = {
        id: gardenId,
        user_id: userId,
        is_public: true,
        slug: slug,
      };

      mockSupabase.single.mockResolvedValueOnce({ data: mockPublishedGarden, error: null });

      const result = await gardenService.publishGarden(gardenId, userId, slug);

      expect(mockSupabase.update).toHaveBeenCalledWith({
        is_public: true,
        slug: slug,
        updated_at: expect.any(String),
      });
      expect(result).toEqual(mockPublishedGarden);
    });

    it('should throw error when slug is already taken', async () => {
      const gardenId = 'garden-123';
      const userId = 'user-123';
      const slug = 'taken-slug';

      // Mock slug already exists
      mockSupabase.single.mockResolvedValueOnce({ 
        data: { id: 'other-garden' }, 
        error: null 
      });

      await expect(gardenService.publishGarden(gardenId, userId, slug))
        .rejects.toThrow('This URL is already taken. Please choose a different one.');
    });
  });

  describe('unpublishGarden', () => {
    it('should unpublish a garden', async () => {
      const gardenId = 'garden-123';
      const userId = 'user-123';

      const mockUnpublishedGarden = {
        id: gardenId,
        user_id: userId,
        is_public: false,
      };

      mockSupabase.single.mockResolvedValue({ data: mockUnpublishedGarden, error: null });

      const result = await gardenService.unpublishGarden(gardenId, userId);

      expect(mockSupabase.update).toHaveBeenCalledWith({
        is_public: false,
        updated_at: expect.any(String),
      });
      expect(result).toEqual(mockUnpublishedGarden);
    });
  });

  describe('autoSaveGarden', () => {
    it('should auto-save garden tiles and layout', async () => {
      const gardenId = 'garden-123';
      const userId = 'user-123';
      const tiles = [{ id: '1', type: 'text', content: 'Auto-saved' }];
      const layout = { showGrid: false };

      mockSupabase.update.mockResolvedValue({ error: null });

      await gardenService.autoSaveGarden(gardenId, userId, tiles, layout);

      expect(mockSupabase.from).toHaveBeenCalledWith('gardens');
      expect(mockSupabase.update).toHaveBeenCalledWith({
        tiles,
        layout,
        updated_at: expect.any(String),
      });
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', gardenId);
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', userId);
    });

    it('should throw error when auto-save fails', async () => {
      const gardenId = 'garden-123';
      const userId = 'user-123';
      const tiles = [];
      const layout = {};

      mockSupabase.update.mockResolvedValue({ error: { message: 'Auto-save failed' } });

      await expect(gardenService.autoSaveGarden(gardenId, userId, tiles, layout))
        .rejects.toThrow('Failed to auto-save garden: Auto-save failed');
    });
  });

  describe('incrementViewCount', () => {
    it('should increment view count using RPC', async () => {
      const gardenId = 'garden-123';

      mockSupabase.rpc.mockResolvedValue({ error: null });

      await gardenService.incrementViewCount(gardenId);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('increment_garden_views', {
        garden_id: gardenId
      });
    });

    it('should not throw error when view count increment fails', async () => {
      const gardenId = 'garden-123';

      mockSupabase.rpc.mockResolvedValue({ error: { message: 'RPC failed' } });

      // Should not throw error
      await expect(gardenService.incrementViewCount(gardenId))
        .resolves.not.toThrow();
    });
  });

  describe('generateUniqueSlug', () => {
    it('should return original slug when available', async () => {
      const baseSlug = 'my-garden';
      const userId = 'user-123';

      mockSupabase.single.mockResolvedValue({ data: null, error: null });

      const result = await gardenService.generateUniqueSlug(baseSlug, userId);

      expect(result).toBe(baseSlug);
    });

    it('should generate numbered slug when original is taken', async () => {
      const baseSlug = 'my-garden';
      const userId = 'user-123';

      // First call - slug exists
      mockSupabase.single.mockResolvedValueOnce({ data: { id: 'existing' }, error: null });
      // Second call - numbered slug is available
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: null });

      const result = await gardenService.generateUniqueSlug(baseSlug, userId);

      expect(result).toBe('my-garden-1');
    });
  });
});