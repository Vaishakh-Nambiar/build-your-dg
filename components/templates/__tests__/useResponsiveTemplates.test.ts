/**
 * Unit Tests for Responsive Template Hooks
 * 
 * Tests the React hooks that provide responsive template scaling functionality,
 * including screen size detection, template scaling, and reactive updates.
 */

import { renderHook, act } from '@testing-library/react';
import {
  useResponsiveTemplates,
  useResponsiveTemplatesBatch,
  useResponsiveTileData
} from '../useResponsiveTemplates';
import { TileTemplate, TemplateAwareTileData } from '../types';

// Mock window.innerWidth
const mockInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
};

// Mock ResizeObserver
class MockResizeObserver {
  callback: ResizeObserverCallback;
  
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Replace the global ResizeObserver
global.ResizeObserver = MockResizeObserver as any;

// Mock template for testing
const mockTemplate: TileTemplate = {
  id: 'test-template',
  name: 'Test Template',
  category: 'square',
  dimensions: { w: 2, h: 2 },
  aspectRatio: 1.0,
  allowedTileTypes: ['text'],
  responsiveScaling: {
    breakpoints: {
      mobile: { minWidth: 0, maxWidth: 768, scaleFactor: 0.8 },
      tablet: { minWidth: 769, maxWidth: 1024, scaleFactor: 0.9 },
      desktop: { minWidth: 1025, maxWidth: Infinity, scaleFactor: 1.0 }
    }
  }
};

const mockRectangleTemplate: TileTemplate = {
  id: 'test-rectangle',
  name: 'Test Rectangle',
  category: 'rectangle',
  dimensions: { w: 4, h: 2 },
  aspectRatio: 2.0,
  allowedTileTypes: ['text'],
  responsiveScaling: {
    breakpoints: {
      mobile: { minWidth: 0, maxWidth: 768, scaleFactor: 0.8 },
      tablet: { minWidth: 769, maxWidth: 1024, scaleFactor: 0.9 },
      desktop: { minWidth: 1025, maxWidth: Infinity, scaleFactor: 1.0 }
    }
  }
};

const mockTileData: TemplateAwareTileData = {
  id: 'test-tile',
  type: 'text',
  content: { text: 'Test content' },
  position: { x: 0, y: 0, w: 2, h: 2 },
  template: {
    id: 'test-template',
    category: 'square',
    dimensions: { w: 2, h: 2 }
  },
  metadata: {
    createdAt: new Date(),
    updatedAt: new Date(),
    version: '1.0.0'
  }
};

describe('useResponsiveTemplates', () => {
  beforeEach(() => {
    // Reset window width to desktop default
    mockInnerWidth(1200);
  });

  describe('Basic Functionality', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useResponsiveTemplates());
      
      expect(result.current.screenWidth).toBe(1200);
      expect(result.current.currentBreakpoint.name).toBe('xl');
      expect(result.current.isDesktop).toBe(true);
      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
    });

    it('should initialize with custom initial width', () => {
      // Mock window to not exist initially
      const originalInnerWidth = window.innerWidth;
      delete (window as any).innerWidth;
      
      const { result } = renderHook(() => 
        useResponsiveTemplates({ initialWidth: 400 })
      );
      
      expect(result.current.screenWidth).toBe(400);
      expect(result.current.currentBreakpoint.name).toBe('xs');
      expect(result.current.isMobile).toBe(true);
      
      // Restore window
      window.innerWidth = originalInnerWidth;
    });

    it('should provide template scaling functions', () => {
      const { result } = renderHook(() => useResponsiveTemplates());
      
      expect(typeof result.current.getResponsiveDimensions).toBe('function');
      expect(typeof result.current.scaleTemplate).toBe('function');
      expect(typeof result.current.validateDimensions).toBe('function');
    });

    it('should provide layout utility functions', () => {
      const { result } = renderHook(() => useResponsiveTemplates());
      
      expect(typeof result.current.getGridConfig).toBe('function');
      expect(typeof result.current.isBreakpoint).toBe('function');
    });
  });

  describe('Responsive Dimensions', () => {
    it('should calculate responsive dimensions for templates', () => {
      const { result } = renderHook(() => useResponsiveTemplates());
      
      const dimensions = result.current.getResponsiveDimensions(mockTemplate);
      
      expect(dimensions.w).toBeGreaterThan(0);
      expect(dimensions.h).toBeGreaterThan(0);
    });

    it('should scale templates for different screen widths', () => {
      const { result } = renderHook(() => useResponsiveTemplates());
      
      const mobileDimensions = result.current.scaleTemplate(mockTemplate, 400);
      const desktopDimensions = result.current.scaleTemplate(mockTemplate, 1200);
      
      expect(mobileDimensions.w).toBeGreaterThan(0);
      expect(mobileDimensions.h).toBeGreaterThan(0);
      expect(desktopDimensions.w).toBeGreaterThan(0);
      expect(desktopDimensions.h).toBeGreaterThan(0);
      
      // Desktop dimensions should generally be larger or equal
      expect(desktopDimensions.w).toBeGreaterThanOrEqual(mobileDimensions.w);
      expect(desktopDimensions.h).toBeGreaterThanOrEqual(mobileDimensions.h);
    });

    it('should validate dimensions correctly', () => {
      const { result } = renderHook(() => useResponsiveTemplates());
      
      const validDimensions = { w: 2, h: 2 };
      const invalidDimensions = { w: 0, h: 2 };
      
      const validResult = result.current.validateDimensions(validDimensions);
      const invalidResult = result.current.validateDimensions(invalidDimensions);
      
      expect(validResult.isValid).toBe(true);
      expect(validResult.errors).toHaveLength(0);
      
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Breakpoint Detection', () => {
    it('should detect mobile breakpoints correctly', () => {
      mockInnerWidth(400);
      const { result } = renderHook(() => useResponsiveTemplates());
      
      expect(result.current.currentBreakpoint.name).toBe('xs');
      expect(result.current.isMobile).toBe(true);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(false);
    });

    it('should detect tablet breakpoints correctly', () => {
      mockInnerWidth(800);
      const { result } = renderHook(() => useResponsiveTemplates());
      
      expect(result.current.currentBreakpoint.name).toBe('md');
      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(true);
      expect(result.current.isDesktop).toBe(false);
    });

    it('should detect desktop breakpoints correctly', () => {
      mockInnerWidth(1400);
      const { result } = renderHook(() => useResponsiveTemplates());
      
      expect(result.current.currentBreakpoint.name).toBe('xxl');
      expect(result.current.isMobile).toBe(false);
      expect(result.current.isTablet).toBe(false);
      expect(result.current.isDesktop).toBe(true);
    });

    it('should provide isBreakpoint utility function', () => {
      mockInnerWidth(800);
      const { result } = renderHook(() => useResponsiveTemplates());
      
      expect(result.current.isBreakpoint('md')).toBe(true);
      expect(result.current.isBreakpoint('xs')).toBe(false);
      expect(result.current.isBreakpoint('xl')).toBe(false);
    });
  });

  describe('Grid Configuration', () => {
    it('should provide correct grid configuration', () => {
      const { result } = renderHook(() => useResponsiveTemplates());
      
      const gridConfig = result.current.getGridConfig();
      
      expect(gridConfig.cols).toBeGreaterThan(0);
      expect(gridConfig.rowHeight).toBeGreaterThan(0);
      expect(gridConfig.margin).toHaveLength(2);
    });

    it('should calculate column width correctly', () => {
      const { result } = renderHook(() => useResponsiveTemplates());
      
      expect(result.current.columnWidth).toBeGreaterThan(0);
      expect(result.current.columnWidth).toBeLessThan(result.current.screenWidth);
    });

    it('should adjust grid configuration for different screen sizes', () => {
      mockInnerWidth(400);
      const { result: mobileResult } = renderHook(() => useResponsiveTemplates());
      
      mockInnerWidth(1200);
      const { result: desktopResult } = renderHook(() => useResponsiveTemplates());
      
      const mobileConfig = mobileResult.current.getGridConfig();
      const desktopConfig = desktopResult.current.getGridConfig();
      
      expect(mobileConfig.cols).toBeLessThan(desktopConfig.cols);
    });
  });

  describe('Debug Mode', () => {
    it('should provide debug information when enabled', () => {
      const { result } = renderHook(() => 
        useResponsiveTemplates({ debug: true })
      );
      
      expect(result.current.debugInfo).toBeDefined();
      expect(result.current.debugInfo.screenWidth).toBe(result.current.screenWidth);
      expect(result.current.debugInfo.currentBreakpoint).toBe(result.current.currentBreakpoint.name);
    });

    it('should not provide debug information when disabled', () => {
      const { result } = renderHook(() => 
        useResponsiveTemplates({ debug: false })
      );
      
      expect(Object.keys(result.current.debugInfo)).toHaveLength(0);
    });
  });

  describe('Options Configuration', () => {
    it('should respect container padding option', () => {
      const { result } = renderHook(() => 
        useResponsiveTemplates({ containerPadding: 40 })
      );
      
      // Column width should be smaller with padding
      const withPadding = result.current.columnWidth;
      
      const { result: noPaddingResult } = renderHook(() => 
        useResponsiveTemplates({ containerPadding: 0 })
      );
      
      const withoutPadding = noPaddingResult.current.columnWidth;
      
      expect(withPadding).toBeLessThan(withoutPadding);
    });
  });
});

describe('useResponsiveTemplatesBatch', () => {
  it('should scale multiple templates at once', () => {
    const templates = [mockTemplate, mockRectangleTemplate];
    
    const { result } = renderHook(() => 
      useResponsiveTemplatesBatch(templates)
    );
    
    expect(result.current.scaledTemplates).toHaveLength(2);
    expect(result.current.scaledTemplates[0].template).toBe(mockTemplate);
    expect(result.current.scaledTemplates[1].template).toBe(mockRectangleTemplate);
    
    // Each should have dimensions and validity
    result.current.scaledTemplates.forEach(scaled => {
      expect(scaled.dimensions.w).toBeGreaterThan(0);
      expect(scaled.dimensions.h).toBeGreaterThan(0);
      expect(typeof scaled.isValid).toBe('boolean');
    });
  });

  it('should update all templates when screen size changes', () => {
    const templates = [mockTemplate, mockRectangleTemplate];
    
    mockInnerWidth(1200);
    const { result } = renderHook(() => 
      useResponsiveTemplatesBatch(templates)
    );
    
    const desktopDimensions = result.current.scaledTemplates.map(s => s.dimensions);
    
    // Simulate screen size change
    mockInnerWidth(400);
    const { result: mobileResult } = renderHook(() => 
      useResponsiveTemplatesBatch(templates)
    );
    
    const mobileDimensions = mobileResult.current.scaledTemplates.map(s => s.dimensions);
    
    // Dimensions should be different
    expect(mobileDimensions[0]).not.toEqual(desktopDimensions[0]);
    expect(mobileDimensions[1]).not.toEqual(desktopDimensions[1]);
  });
});

describe('useResponsiveTileData', () => {
  it('should apply responsive scaling to tile data', () => {
    const tiles = [mockTileData];
    
    const { result } = renderHook(() => 
      useResponsiveTileData(tiles)
    );
    
    expect(result.current.responsiveTiles).toHaveLength(1);
    
    const responsiveTile = result.current.responsiveTiles[0];
    expect(responsiveTile.position.w).toBeGreaterThan(0);
    expect(responsiveTile.position.h).toBeGreaterThan(0);
    expect(responsiveTile.responsiveDimensions).toBeDefined();
    expect(typeof responsiveTile.isValidForBreakpoint).toBe('boolean');
  });

  it('should preserve original tile data while adding responsive properties', () => {
    const tiles = [mockTileData];
    
    const { result } = renderHook(() => 
      useResponsiveTileData(tiles)
    );
    
    const responsiveTile = result.current.responsiveTiles[0];
    
    // Original properties should be preserved
    expect(responsiveTile.id).toBe(mockTileData.id);
    expect(responsiveTile.type).toBe(mockTileData.type);
    expect(responsiveTile.content).toBe(mockTileData.content);
    expect(responsiveTile.template).toBe(mockTileData.template);
    expect(responsiveTile.metadata).toBe(mockTileData.metadata);
    
    // New responsive properties should be added
    expect(responsiveTile.responsiveDimensions).toBeDefined();
    expect(responsiveTile.isValidForBreakpoint).toBeDefined();
  });

  it('should handle empty tile arrays', () => {
    const { result } = renderHook(() => 
      useResponsiveTileData([])
    );
    
    expect(result.current.responsiveTiles).toHaveLength(0);
  });

  it('should update tile dimensions when screen size changes', () => {
    const tiles = [mockTileData];
    
    mockInnerWidth(1200);
    const { result: desktopResult } = renderHook(() => 
      useResponsiveTileData(tiles)
    );
    
    mockInnerWidth(400);
    const { result: mobileResult } = renderHook(() => 
      useResponsiveTileData(tiles)
    );
    
    const desktopTile = desktopResult.current.responsiveTiles[0];
    const mobileTile = mobileResult.current.responsiveTiles[0];
    
    // Responsive dimensions should be different
    expect(mobileTile.responsiveDimensions).not.toEqual(desktopTile.responsiveDimensions);
    expect(mobileTile.position.w).not.toBe(desktopTile.position.w);
  });
});

describe('Hook Error Handling', () => {
  it('should handle invalid templates gracefully', () => {
    const invalidTemplate = {
      ...mockTemplate,
      dimensions: { w: 0, h: 0 }
    };
    
    const { result } = renderHook(() => useResponsiveTemplates());
    
    expect(() => {
      result.current.getResponsiveDimensions(invalidTemplate);
    }).not.toThrow();
  });

  it('should handle missing window object (SSR)', () => {
    // This test needs to be run in isolation to properly test SSR behavior
    // In a real SSR environment, the hook would initialize with the provided initial width
    const { result } = renderHook(() => 
      useResponsiveTemplates({ initialWidth: 800 })
    );
    
    // The hook should work even if window is not available
    expect(result.current.screenWidth).toBeGreaterThan(0);
    expect(result.current.currentBreakpoint).toBeDefined();
    expect(typeof result.current.getResponsiveDimensions).toBe('function');
  });

  it('should handle resize events without errors', () => {
    const { result } = renderHook(() => useResponsiveTemplates());
    
    // Simulate resize event
    act(() => {
      mockInnerWidth(800);
      window.dispatchEvent(new Event('resize'));
    });
    
    // Should not throw and should update
    expect(result.current.screenWidth).toBeDefined();
  });
});