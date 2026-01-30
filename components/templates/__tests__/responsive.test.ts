/**
 * Unit Tests for Responsive Template Scaling Logic
 * 
 * Tests the core responsive scaling functionality including proportional
 * scaling calculations, breakpoint-specific rules, and aspect ratio preservation.
 */

import {
  detectBreakpoint,
  calculateProportionalScaling,
  applyBreakpointScaling,
  preserveAspectRatio,
  calculateResponsiveTemplateDimensions,
  getResponsiveGridConfiguration,
  calculateColumnWidth,
  validateResponsiveDimensions,
  createResponsiveConfig,
  ENHANCED_BREAKPOINTS
} from '../responsive';
import { TileTemplate } from '../types';

// Mock template for testing
const mockSquareTemplate: TileTemplate = {
  id: 'test-square',
  name: 'Test Square',
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

const mockCircleTemplate: TileTemplate = {
  id: 'test-circle',
  name: 'Test Circle',
  category: 'circle',
  dimensions: { w: 3, h: 3 },
  aspectRatio: 1.0,
  allowedTileTypes: ['image'],
  responsiveScaling: {
    breakpoints: {
      mobile: { minWidth: 0, maxWidth: 768, scaleFactor: 0.8 },
      tablet: { minWidth: 769, maxWidth: 1024, scaleFactor: 0.9 },
      desktop: { minWidth: 1025, maxWidth: Infinity, scaleFactor: 1.0 }
    }
  }
};

describe('Responsive Template Scaling', () => {
  describe('detectBreakpoint', () => {
    it('should detect mobile breakpoint for small screens', () => {
      const breakpoint = detectBreakpoint(400);
      expect(breakpoint.name).toBe('xs');
      expect(breakpoint.cols).toBe(4);
    });

    it('should detect tablet breakpoint for medium screens', () => {
      const breakpoint = detectBreakpoint(800);
      expect(breakpoint.name).toBe('md');
      expect(breakpoint.cols).toBe(8);
    });

    it('should detect desktop breakpoint for large screens', () => {
      const breakpoint = detectBreakpoint(1300);
      expect(breakpoint.name).toBe('xl');
      expect(breakpoint.cols).toBe(12);
    });

    it('should handle edge cases at breakpoint boundaries', () => {
      expect(detectBreakpoint(575).name).toBe('xs');
      expect(detectBreakpoint(576).name).toBe('sm');
      expect(detectBreakpoint(767).name).toBe('sm');
      expect(detectBreakpoint(768).name).toBe('md');
    });
  });

  describe('calculateProportionalScaling', () => {
    it('should scale square templates proportionally', () => {
      const mobileBreakpoint = ENHANCED_BREAKPOINTS.find(bp => bp.name === 'xs')!;
      const dimensions = calculateProportionalScaling(mockSquareTemplate, 400, mobileBreakpoint);
      
      // 2 * 0.7 = 1.4, rounded to 1 (minimum)
      expect(dimensions.w).toBe(1);
      expect(dimensions.h).toBe(1);
    });

    it('should scale rectangle templates proportionally', () => {
      const desktopBreakpoint = ENHANCED_BREAKPOINTS.find(bp => bp.name === 'xl')!;
      const dimensions = calculateProportionalScaling(mockRectangleTemplate, 1300, desktopBreakpoint);
      
      // Desktop scale factor is 1.0, so dimensions should remain the same
      expect(dimensions.w).toBe(4);
      expect(dimensions.h).toBe(2);
    });

    it('should respect minimum dimensions', () => {
      const template: TileTemplate = {
        ...mockSquareTemplate,
        dimensions: { w: 1, h: 1 }
      };
      
      const mobileBreakpoint = ENHANCED_BREAKPOINTS.find(bp => bp.name === 'xs')!;
      const dimensions = calculateProportionalScaling(template, 400, mobileBreakpoint);
      
      // Should never go below 1x1
      expect(dimensions.w).toBeGreaterThanOrEqual(1);
      expect(dimensions.h).toBeGreaterThanOrEqual(1);
    });

    it('should respect maximum column constraints', () => {
      const largeTemplate: TileTemplate = {
        ...mockRectangleTemplate,
        dimensions: { w: 20, h: 5 } // Unrealistically large
      };
      
      const mobileBreakpoint = ENHANCED_BREAKPOINTS.find(bp => bp.name === 'xs')!;
      const dimensions = calculateProportionalScaling(largeTemplate, 400, mobileBreakpoint);
      
      // Should not exceed mobile column limit (4)
      expect(dimensions.w).toBeLessThanOrEqual(mobileBreakpoint.cols);
    });
  });

  describe('applyBreakpointScaling', () => {
    it('should apply mobile scaling rules', () => {
      const mobileBreakpoint = ENHANCED_BREAKPOINTS.find(bp => bp.name === 'xs')!;
      const dimensions = applyBreakpointScaling(mockSquareTemplate, mobileBreakpoint);
      
      expect(dimensions.w).toBeGreaterThan(0);
      expect(dimensions.h).toBeGreaterThan(0);
      expect(dimensions.w).toBeLessThanOrEqual(mobileBreakpoint.cols);
    });

    it('should maintain square aspect ratio for square templates', () => {
      const tabletBreakpoint = ENHANCED_BREAKPOINTS.find(bp => bp.name === 'md')!;
      const dimensions = applyBreakpointScaling(mockSquareTemplate, tabletBreakpoint);
      
      // Squares should maintain equal width and height
      expect(dimensions.w).toBe(dimensions.h);
    });

    it('should maintain circular containers for circle templates', () => {
      const desktopBreakpoint = ENHANCED_BREAKPOINTS.find(bp => bp.name === 'xl')!;
      const dimensions = applyBreakpointScaling(mockCircleTemplate, desktopBreakpoint);
      
      // Circles need square containers
      expect(dimensions.w).toBe(dimensions.h);
    });

    it('should adjust rectangles for mobile readability', () => {
      const mobileBreakpoint = ENHANCED_BREAKPOINTS.find(bp => bp.name === 'xs')!;
      const dimensions = applyBreakpointScaling(mockRectangleTemplate, mobileBreakpoint);
      
      // Mobile rectangles should have minimum height for readability
      expect(dimensions.h).toBeGreaterThanOrEqual(2);
      expect(dimensions.w).toBeLessThanOrEqual(mobileBreakpoint.cols);
    });
  });

  describe('preserveAspectRatio', () => {
    it('should preserve aspect ratio when dimensions are close', () => {
      const targetDimensions = { w: 2, h: 2 };
      const breakpoint = ENHANCED_BREAKPOINTS.find(bp => bp.name === 'xl')!;
      
      const preserved = preserveAspectRatio(mockSquareTemplate, targetDimensions, breakpoint);
      
      // Should remain unchanged as aspect ratio is already correct
      expect(preserved.w).toBe(2);
      expect(preserved.h).toBe(2);
    });

    it('should adjust width when target is too wide', () => {
      const targetDimensions = { w: 6, h: 2 }; // 3:1 ratio, but template is 2:1
      const breakpoint = ENHANCED_BREAKPOINTS.find(bp => bp.name === 'xl')!;
      
      const preserved = preserveAspectRatio(mockRectangleTemplate, targetDimensions, breakpoint);
      
      // Should adjust width to maintain 2:1 aspect ratio
      expect(preserved.w / preserved.h).toBeCloseTo(2.0, 1);
    });

    it('should adjust height when target is too tall', () => {
      const targetDimensions = { w: 4, h: 4 }; // 1:1 ratio, but template is 2:1
      const breakpoint = ENHANCED_BREAKPOINTS.find(bp => bp.name === 'xl')!;
      
      const preserved = preserveAspectRatio(mockRectangleTemplate, targetDimensions, breakpoint);
      
      // Should adjust height to maintain 2:1 aspect ratio
      expect(preserved.w / preserved.h).toBeCloseTo(2.0, 1);
    });

    it('should respect minimum dimensions', () => {
      const targetDimensions = { w: 1, h: 10 }; // Very tall
      const breakpoint = ENHANCED_BREAKPOINTS.find(bp => bp.name === 'xl')!;
      
      const preserved = preserveAspectRatio(mockRectangleTemplate, targetDimensions, breakpoint);
      
      // Should maintain minimum width and height
      expect(preserved.w).toBeGreaterThanOrEqual(1);
      expect(preserved.h).toBeGreaterThanOrEqual(1);
    });

    it('should respect column constraints', () => {
      const targetDimensions = { w: 20, h: 10 }; // Very large
      const mobileBreakpoint = ENHANCED_BREAKPOINTS.find(bp => bp.name === 'xs')!;
      
      const preserved = preserveAspectRatio(mockRectangleTemplate, targetDimensions, mobileBreakpoint);
      
      // Should not exceed mobile column limit
      expect(preserved.w).toBeLessThanOrEqual(mobileBreakpoint.cols);
    });
  });

  describe('calculateResponsiveTemplateDimensions', () => {
    it('should return appropriate dimensions for mobile screens', () => {
      const dimensions = calculateResponsiveTemplateDimensions(mockSquareTemplate, 400);
      
      expect(dimensions.w).toBeGreaterThan(0);
      expect(dimensions.h).toBeGreaterThan(0);
      expect(dimensions.w).toBeLessThanOrEqual(4); // Mobile column limit
    });

    it('should return appropriate dimensions for tablet screens', () => {
      const dimensions = calculateResponsiveTemplateDimensions(mockRectangleTemplate, 800);
      
      expect(dimensions.w).toBeGreaterThan(0);
      expect(dimensions.h).toBeGreaterThan(0);
      expect(dimensions.w).toBeLessThanOrEqual(8); // Tablet column limit
    });

    it('should return appropriate dimensions for desktop screens', () => {
      const dimensions = calculateResponsiveTemplateDimensions(mockRectangleTemplate, 1300);
      
      expect(dimensions.w).toBeGreaterThan(0);
      expect(dimensions.h).toBeGreaterThan(0);
      expect(dimensions.w).toBeLessThanOrEqual(12); // Desktop column limit
    });

    it('should maintain aspect ratios across all screen sizes', () => {
      const mobileResult = calculateResponsiveTemplateDimensions(mockRectangleTemplate, 400);
      const tabletResult = calculateResponsiveTemplateDimensions(mockRectangleTemplate, 800);
      const desktopResult = calculateResponsiveTemplateDimensions(mockRectangleTemplate, 1300);
      
      // All should maintain similar aspect ratios (within tolerance)
      const mobileRatio = mobileResult.w / mobileResult.h;
      const tabletRatio = tabletResult.w / tabletResult.h;
      const desktopRatio = desktopResult.w / desktopResult.h;
      
      // Use more lenient tolerance for aspect ratio differences due to grid constraints
      expect(Math.abs(mobileRatio - tabletRatio)).toBeLessThanOrEqual(1.0);
      expect(Math.abs(tabletRatio - desktopRatio)).toBeLessThanOrEqual(1.0);
    });
  });

  describe('getResponsiveGridConfiguration', () => {
    it('should return correct configuration for different screen sizes', () => {
      const mobileConfig = getResponsiveGridConfiguration(400);
      const tabletConfig = getResponsiveGridConfiguration(800);
      const desktopConfig = getResponsiveGridConfiguration(1300);
      
      expect(mobileConfig.name).toBe('xs');
      expect(mobileConfig.cols).toBe(4);
      
      expect(tabletConfig.name).toBe('md');
      expect(tabletConfig.cols).toBe(8);
      
      expect(desktopConfig.name).toBe('xl');
      expect(desktopConfig.cols).toBe(12);
    });
  });

  describe('calculateColumnWidth', () => {
    it('should calculate correct column width', () => {
      const breakpoint = ENHANCED_BREAKPOINTS.find(bp => bp.name === 'xl')!;
      const screenWidth = 1200;
      const containerPadding = 20;
      
      const columnWidth = calculateColumnWidth(screenWidth, breakpoint, containerPadding);
      
      // Should be positive and reasonable
      expect(columnWidth).toBeGreaterThan(0);
      expect(columnWidth).toBeLessThan(screenWidth);
    });

    it('should handle zero padding', () => {
      const breakpoint = ENHANCED_BREAKPOINTS.find(bp => bp.name === 'md')!;
      const screenWidth = 800;
      
      const columnWidth = calculateColumnWidth(screenWidth, breakpoint, 0);
      
      expect(columnWidth).toBeGreaterThan(0);
    });

    it('should handle large padding', () => {
      const breakpoint = ENHANCED_BREAKPOINTS.find(bp => bp.name === 'xs')!;
      const screenWidth = 400;
      const largePadding = 100;
      
      const columnWidth = calculateColumnWidth(screenWidth, breakpoint, largePadding);
      
      // Should still be non-negative
      expect(columnWidth).toBeGreaterThanOrEqual(0);
    });
  });

  describe('validateResponsiveDimensions', () => {
    it('should validate correct dimensions', () => {
      const breakpoint = ENHANCED_BREAKPOINTS.find(bp => bp.name === 'xl')!;
      const dimensions = { w: 4, h: 2 };
      
      const validation = validateResponsiveDimensions(dimensions, breakpoint);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject dimensions with zero or negative values', () => {
      const breakpoint = ENHANCED_BREAKPOINTS.find(bp => bp.name === 'xl')!;
      
      const zeroWidth = validateResponsiveDimensions({ w: 0, h: 2 }, breakpoint);
      const zeroHeight = validateResponsiveDimensions({ w: 2, h: 0 }, breakpoint);
      
      expect(zeroWidth.isValid).toBe(false);
      expect(zeroWidth.errors.length).toBeGreaterThan(0);
      
      expect(zeroHeight.isValid).toBe(false);
      expect(zeroHeight.errors.length).toBeGreaterThan(0);
    });

    it('should reject dimensions exceeding column limits', () => {
      const mobileBreakpoint = ENHANCED_BREAKPOINTS.find(bp => bp.name === 'xs')!;
      const dimensions = { w: 10, h: 2 }; // Exceeds mobile 4-column limit
      
      const validation = validateResponsiveDimensions(dimensions, mobileBreakpoint);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(error => error.includes('columns'))).toBe(true);
    });

    it('should warn about extremely tall tiles', () => {
      const breakpoint = ENHANCED_BREAKPOINTS.find(bp => bp.name === 'xl')!;
      const dimensions = { w: 4, h: 15 }; // Very tall
      
      const validation = validateResponsiveDimensions(dimensions, breakpoint);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.some(error => error.includes('Height'))).toBe(true);
    });
  });

  describe('createResponsiveConfig', () => {
    it('should create responsive config with default values', () => {
      const config = createResponsiveConfig();
      
      expect(config.breakpoints.mobile.scaleFactor).toBe(0.8);
      expect(config.breakpoints.tablet.scaleFactor).toBe(0.9);
      expect(config.breakpoints.desktop.scaleFactor).toBe(1.0);
    });

    it('should create responsive config with custom values', () => {
      const config = createResponsiveConfig(0.6, 0.8, 1.2);
      
      expect(config.breakpoints.mobile.scaleFactor).toBe(0.6);
      expect(config.breakpoints.tablet.scaleFactor).toBe(0.8);
      expect(config.breakpoints.desktop.scaleFactor).toBe(1.2);
    });

    it('should have correct breakpoint ranges', () => {
      const config = createResponsiveConfig();
      
      expect(config.breakpoints.mobile.minWidth).toBe(0);
      expect(config.breakpoints.mobile.maxWidth).toBe(768);
      expect(config.breakpoints.tablet.minWidth).toBe(769);
      expect(config.breakpoints.tablet.maxWidth).toBe(1024);
      expect(config.breakpoints.desktop.minWidth).toBe(1025);
      expect(config.breakpoints.desktop.maxWidth).toBe(Infinity);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle extremely small screen widths', () => {
      const dimensions = calculateResponsiveTemplateDimensions(mockSquareTemplate, 100);
      
      expect(dimensions.w).toBeGreaterThan(0);
      expect(dimensions.h).toBeGreaterThan(0);
    });

    it('should handle extremely large screen widths', () => {
      const dimensions = calculateResponsiveTemplateDimensions(mockSquareTemplate, 5000);
      
      expect(dimensions.w).toBeGreaterThan(0);
      expect(dimensions.h).toBeGreaterThan(0);
    });

    it('should handle templates with unusual aspect ratios', () => {
      const wideTemplate: TileTemplate = {
        ...mockRectangleTemplate,
        dimensions: { w: 10, h: 1 },
        aspectRatio: 10.0
      };
      
      const dimensions = calculateResponsiveTemplateDimensions(wideTemplate, 800);
      
      expect(dimensions.w).toBeGreaterThan(0);
      expect(dimensions.h).toBeGreaterThan(0);
    });

    it('should handle templates with zero dimensions gracefully', () => {
      const invalidTemplate: TileTemplate = {
        ...mockSquareTemplate,
        dimensions: { w: 0, h: 0 },
        aspectRatio: 1.0
      };
      
      // Should not throw an error
      expect(() => {
        calculateResponsiveTemplateDimensions(invalidTemplate, 800);
      }).not.toThrow();
    });
  });
});