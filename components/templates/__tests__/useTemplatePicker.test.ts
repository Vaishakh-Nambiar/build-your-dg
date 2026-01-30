/**
 * useTemplatePicker Hook Tests
 * 
 * Unit tests for the useTemplatePicker hook functionality.
 */

import { renderHook, act } from '@testing-library/react';
import { useTemplatePicker } from '../useTemplatePicker';
import { TileTemplate } from '../types';
import { BlockType } from '../../Block';

// Mock the template utilities
jest.mock('../utils', () => ({
  getDefaultTemplateForTileType: jest.fn((tileType: BlockType) => ({
    id: `default-${tileType}`,
    name: `Default ${tileType}`,
    category: 'square',
    dimensions: { w: 2, h: 2 },
    aspectRatio: 1,
    allowedTileTypes: [tileType],
    responsiveScaling: {
      breakpoints: {
        mobile: { minWidth: 0, maxWidth: 768, scaleFactor: 0.8 },
        tablet: { minWidth: 769, maxWidth: 1024, scaleFactor: 0.9 },
        desktop: { minWidth: 1025, maxWidth: Infinity, scaleFactor: 1.0 }
      }
    }
  })),
  findFirstAvailablePosition: jest.fn(() => ({ x: 0, y: 0 }))
}));

describe('useTemplatePicker', () => {
  const mockOnCreateTile = jest.fn();
  
  const defaultOptions = {
    onCreateTile: mockOnCreateTile,
    existingTiles: [],
    gridCols: 12
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useTemplatePicker(defaultOptions));
    
    expect(result.current.isPickerOpen).toBe(false);
    expect(result.current.selectedTileType).toBeUndefined();
  });

  it('opens picker with specified tile type', () => {
    const { result } = renderHook(() => useTemplatePicker(defaultOptions));
    
    act(() => {
      result.current.openPicker('project');
    });
    
    expect(result.current.isPickerOpen).toBe(true);
    expect(result.current.selectedTileType).toBe('project');
  });

  it('opens picker without tile type', () => {
    const { result } = renderHook(() => useTemplatePicker(defaultOptions));
    
    act(() => {
      result.current.openPicker();
    });
    
    expect(result.current.isPickerOpen).toBe(true);
    expect(result.current.selectedTileType).toBeUndefined();
  });

  it('closes picker and resets state', () => {
    const { result } = renderHook(() => useTemplatePicker(defaultOptions));
    
    // Open picker first
    act(() => {
      result.current.openPicker('text');
    });
    
    expect(result.current.isPickerOpen).toBe(true);
    expect(result.current.selectedTileType).toBe('text');
    
    // Close picker
    act(() => {
      result.current.closePicker();
    });
    
    expect(result.current.isPickerOpen).toBe(false);
    expect(result.current.selectedTileType).toBeUndefined();
  });

  it('handles template selection and calls onCreateTile', () => {
    const { result } = renderHook(() => useTemplatePicker(defaultOptions));
    
    const mockTemplate: TileTemplate = {
      id: 'test-template',
      name: 'Test Template',
      category: 'square',
      dimensions: { w: 2, h: 2 },
      aspectRatio: 1,
      allowedTileTypes: ['text'],
      responsiveScaling: {
        breakpoints: {
          mobile: { minWidth: 0, maxWidth: 768, scaleFactor: 0.8 },
          tablet: { minWidth: 769, maxWidth: 1024, scaleFactor: 0.9 },
          desktop: { minWidth: 1025, maxWidth: Infinity, scaleFactor: 1.0 }
        }
      }
    };
    
    act(() => {
      result.current.handleTemplateSelect(mockTemplate, 'text');
    });
    
    expect(mockOnCreateTile).toHaveBeenCalledWith(
      mockTemplate,
      'text',
      { x: 0, y: 0 }
    );
    expect(result.current.isPickerOpen).toBe(false);
  });

  it('creates tile with default template', () => {
    const { result } = renderHook(() => useTemplatePicker(defaultOptions));
    
    act(() => {
      result.current.createTileWithDefaultTemplate('project');
    });
    
    expect(mockOnCreateTile).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'default-project',
        name: 'Default project'
      }),
      'project',
      { x: 0, y: 0 }
    );
  });

  it('opens picker when no default template available', () => {
    // Mock getDefaultTemplateForTileType to return null
    const mockUtils = require('../utils');
    mockUtils.getDefaultTemplateForTileType.mockReturnValueOnce(null);
    
    const { result } = renderHook(() => useTemplatePicker(defaultOptions));
    
    act(() => {
      result.current.createTileWithDefaultTemplate('unknown' as BlockType);
    });
    
    expect(result.current.isPickerOpen).toBe(true);
    expect(result.current.selectedTileType).toBe('unknown');
    expect(mockOnCreateTile).not.toHaveBeenCalled();
  });

  it('works without onCreateTile callback', () => {
    const { result } = renderHook(() => useTemplatePicker({}));
    
    const mockTemplate: TileTemplate = {
      id: 'test-template',
      name: 'Test Template',
      category: 'square',
      dimensions: { w: 2, h: 2 },
      aspectRatio: 1,
      allowedTileTypes: ['text'],
      responsiveScaling: {
        breakpoints: {
          mobile: { minWidth: 0, maxWidth: 768, scaleFactor: 0.8 },
          tablet: { minWidth: 769, maxWidth: 1024, scaleFactor: 0.9 },
          desktop: { minWidth: 1025, maxWidth: Infinity, scaleFactor: 1.0 }
        }
      }
    };
    
    // Should not throw error
    act(() => {
      result.current.handleTemplateSelect(mockTemplate, 'text');
    });
    
    expect(result.current.isPickerOpen).toBe(false);
  });

  it('uses existing tiles for position calculation', () => {
    const existingTiles = [
      { position: { x: 0, y: 0, w: 2, h: 2 } },
      { position: { x: 2, y: 0, w: 2, h: 2 } }
    ];
    
    const { result } = renderHook(() => 
      useTemplatePicker({ 
        ...defaultOptions, 
        existingTiles 
      })
    );
    
    const mockTemplate: TileTemplate = {
      id: 'test-template',
      name: 'Test Template',
      category: 'square',
      dimensions: { w: 2, h: 2 },
      aspectRatio: 1,
      allowedTileTypes: ['text'],
      responsiveScaling: {
        breakpoints: {
          mobile: { minWidth: 0, maxWidth: 768, scaleFactor: 0.8 },
          tablet: { minWidth: 769, maxWidth: 1024, scaleFactor: 0.9 },
          desktop: { minWidth: 1025, maxWidth: Infinity, scaleFactor: 1.0 }
        }
      }
    };
    
    act(() => {
      result.current.handleTemplateSelect(mockTemplate, 'text');
    });
    
    const mockUtils = require('../utils');
    expect(mockUtils.findFirstAvailablePosition).toHaveBeenCalledWith(
      mockTemplate,
      existingTiles,
      12
    );
  });

  it('falls back to origin when no position found', () => {
    // Mock findFirstAvailablePosition to return null
    const mockUtils = require('../utils');
    mockUtils.findFirstAvailablePosition.mockReturnValueOnce(null);
    
    const { result } = renderHook(() => useTemplatePicker(defaultOptions));
    
    const mockTemplate: TileTemplate = {
      id: 'test-template',
      name: 'Test Template',
      category: 'square',
      dimensions: { w: 2, h: 2 },
      aspectRatio: 1,
      allowedTileTypes: ['text'],
      responsiveScaling: {
        breakpoints: {
          mobile: { minWidth: 0, maxWidth: 768, scaleFactor: 0.8 },
          tablet: { minWidth: 769, maxWidth: 1024, scaleFactor: 0.9 },
          desktop: { minWidth: 1025, maxWidth: Infinity, scaleFactor: 1.0 }
        }
      }
    };
    
    act(() => {
      result.current.handleTemplateSelect(mockTemplate, 'text');
    });
    
    expect(mockOnCreateTile).toHaveBeenCalledWith(
      mockTemplate,
      'text',
      { x: 0, y: 0 }
    );
  });
});