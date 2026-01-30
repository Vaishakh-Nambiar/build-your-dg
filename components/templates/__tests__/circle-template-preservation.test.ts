/**
 * Circle Template Shape Preservation Tests
 * 
 * Tests to verify that circle templates maintain their circular appearance
 * across all screen sizes and responsive breakpoints.
 * 
 * Requirements 5.5: Circle templates maintain their circular appearance at all sizes
 * Requirements 5.2: Implement responsive circle scaling
 */

import { 
  getCircleTemplateProperties, 
  getCircleContainerStyles,
  createResponsiveCircleCSS
} from '../utils';
import {
  injectCircleTemplateCSS,
  removeCircleTemplateCSS,
  isCircleTemplateCSSInjected,
  updateCircleTemplateProperties,
  getCircleTemplateProperties as getCSSProperties
} from '../circleTemplateCSS';
import { useTemplateStyles } from '../useTemplateStyles';
import { TileTemplate } from '../types';
import { CIRCLE_TEMPLATES } from '../definitions';
import { renderHook } from '@testing-library/react';

// Mock template for testing
const mockCircleTemplate: TileTemplate = {
  id: 'test-circle',
  name: 'Test Circle',
  category: 'circle',
  dimensions: { w: 2, h: 2 },
  aspectRatio: 1.0,
  allowedTileTypes: ['image', 'video'],
  responsiveScaling: {
    breakpoints: {
      mobile: { minWidth: 0, maxWidth: 768, scaleFactor: 0.8 },
      tablet: { minWidth: 769, maxWidth: 1024, scaleFactor: 0.9 },
      desktop: { minWidth: 1025, maxWidth: Infinity, scaleFactor: 1.0 }
    }
  }
};

const mockSquareTemplate: TileTemplate = {
  id: 'test-square',
  name: 'Test Square',
  category: 'square',
  dimensions: { w: 2, h: 2 },
  aspectRatio: 1.0,
  allowedTileTypes: ['text', 'image'],
  responsiveScaling: {
    breakpoints: {
      mobile: { minWidth: 0, maxWidth: 768, scaleFactor: 0.8 },
      tablet: { minWidth: 769, maxWidth: 1024, scaleFactor: 0.9 },
      desktop: { minWidth: 1025, maxWidth: Infinity, scaleFactor: 1.0 }
    }
  }
};

describe('Circle Template Shape Preservation', () => {
  beforeEach(() => {
    // Clean up any existing CSS injection
    if (isCircleTemplateCSSInjected()) {
      removeCircleTemplateCSS();
    }
  });

  afterEach(() => {
    // Clean up after each test
    if (isCircleTemplateCSSInjected()) {
      removeCircleTemplateCSS();
    }
  });

  describe('Circle Template Properties', () => {
    it('should return circular CSS properties for circle templates', () => {
      const result = getCircleTemplateProperties(mockCircleTemplate);
      
      expect(result.className).toContain('rounded-full');
      expect(result.className).toContain('aspect-square');
      expect(result.className).toContain('overflow-hidden');
      expect(result.style.borderRadius).toBe('50%');
      expect(result.style.aspectRatio).toBe('1 / 1');
      expect(result.style.overflow).toBe('hidden');
    });

    it('should return empty properties for non-circle templates', () => {
      const result = getCircleTemplateProperties(mockSquareTemplate);
      
      expect(result.className).toBe('');
      expect(Object.keys(result.style)).toHaveLength(0);
    });

    it('should include responsive properties when screen width is provided', () => {
      const mobileResult = getCircleTemplateProperties(mockCircleTemplate, 600);
      const desktopResult = getCircleTemplateProperties(mockCircleTemplate, 1200);
      
      expect(mobileResult.style.minWidth).toBe('60px');
      expect(mobileResult.style.minHeight).toBe('60px');
      
      expect(desktopResult.style.minWidth).toBe('100px');
      expect(desktopResult.style.minHeight).toBe('100px');
    });
  });

  describe('Circle Container Styles', () => {
    it('should return container styles for circle templates', () => {
      const result = getCircleContainerStyles(mockCircleTemplate, { w: 2, h: 2 });
      
      expect(result.className).toContain('flex');
      expect(result.className).toContain('items-center');
      expect(result.className).toContain('justify-center');
      expect(result.style.aspectRatio).toBe('1 / 1');
      expect(result.style.display).toBe('flex');
      expect(result.style.alignItems).toBe('center');
      expect(result.style.justifyContent).toBe('center');
    });

    it('should return empty styles for non-circle templates', () => {
      const result = getCircleContainerStyles(mockSquareTemplate, { w: 2, h: 2 });
      
      expect(result.className).toBe('');
      expect(Object.keys(result.style)).toHaveLength(0);
    });
  });

  describe('Responsive Circle CSS', () => {
    it('should generate responsive CSS variables for circle templates', () => {
      const css = createResponsiveCircleCSS(mockCircleTemplate);
      
      expect(css).toContain('--circle-size-xs');
      expect(css).toContain('--circle-size-sm');
      expect(css).toContain('--circle-size-md');
      expect(css).toContain('--circle-size-lg');
      expect(css).toContain('--circle-size-xl');
      expect(css).toContain('clamp(');
    });

    it('should return empty string for non-circle templates', () => {
      const css = createResponsiveCircleCSS(mockSquareTemplate);
      expect(css).toBe('');
    });
  });

  describe('CSS Injection', () => {
    it('should inject circle template CSS into document', () => {
      expect(isCircleTemplateCSSInjected()).toBe(false);
      
      injectCircleTemplateCSS();
      
      expect(isCircleTemplateCSSInjected()).toBe(true);
      
      // Check if style element exists
      const styleElement = document.getElementById('circle-template-styles');
      expect(styleElement).toBeTruthy();
      expect(styleElement?.tagName).toBe('STYLE');
    });

    it('should not inject CSS multiple times', () => {
      injectCircleTemplateCSS();
      const firstElement = document.getElementById('circle-template-styles');
      
      injectCircleTemplateCSS(); // Second injection
      const secondElement = document.getElementById('circle-template-styles');
      
      expect(firstElement).toBe(secondElement);
    });

    it('should remove injected CSS', () => {
      injectCircleTemplateCSS();
      expect(isCircleTemplateCSSInjected()).toBe(true);
      
      removeCircleTemplateCSS();
      expect(isCircleTemplateCSSInjected()).toBe(false);
      
      const styleElement = document.getElementById('circle-template-styles');
      expect(styleElement).toBeNull();
    });

    it('should update CSS custom properties', () => {
      injectCircleTemplateCSS();
      
      const testProperties = {
        '--circle-size-xs': '50px',
        '--circle-scale-mobile': '0.7'
      };
      
      updateCircleTemplateProperties(testProperties);
      
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--circle-size-xs')).toBe('50px');
      expect(root.style.getPropertyValue('--circle-scale-mobile')).toBe('0.7');
    });
  });

  describe('Template Styles Hook', () => {
    it('should return circle-specific styles for circle templates', () => {
      const { result } = renderHook(() => 
        useTemplateStyles({
          template: mockCircleTemplate,
          enableResponsive: true
        })
      );

      expect(result.current.isCircle).toBe(true);
      expect(result.current.contentClassName).toContain('rounded-full');
      expect(result.current.contentStyle.borderRadius).toBe('50%');
      expect(result.current.responsiveCSS).toBeTruthy();
    });

    it('should return standard styles for non-circle templates', () => {
      const { result } = renderHook(() => 
        useTemplateStyles({
          template: mockSquareTemplate,
          enableResponsive: true
        })
      );

      expect(result.current.isCircle).toBe(false);
      expect(result.current.contentClassName).toBe('');
      expect(result.current.responsiveCSS).toBe('');
    });
  });

  describe('Predefined Circle Templates', () => {
    it('should have all circle templates maintain square dimensions', () => {
      CIRCLE_TEMPLATES.forEach(template => {
        expect(template.dimensions.w).toBe(template.dimensions.h);
        expect(template.aspectRatio).toBe(1.0);
        expect(template.category).toBe('circle');
      });
    });

    it('should only allow video and image tile types for circle templates', () => {
      CIRCLE_TEMPLATES.forEach(template => {
        expect(template.allowedTileTypes).toEqual(['video', 'image']);
      });
    });

    it('should generate proper styles for all predefined circle templates', () => {
      CIRCLE_TEMPLATES.forEach(template => {
        const properties = getCircleTemplateProperties(template);
        const containerStyles = getCircleContainerStyles(template, template.dimensions);
        const responsiveCSS = createResponsiveCircleCSS(template);

        // Verify circular properties
        expect(properties.className).toContain('rounded-full');
        expect(properties.style.borderRadius).toBe('50%');
        expect(properties.style.aspectRatio).toBe('1 / 1');

        // Verify container properties
        expect(containerStyles.style.aspectRatio).toBe('1 / 1');
        expect(containerStyles.style.display).toBe('flex');

        // Verify responsive CSS
        expect(responsiveCSS).toContain('--circle-size-');
      });
    });
  });

  describe('Aspect Ratio Preservation', () => {
    it('should maintain 1:1 aspect ratio for all circle template styles', () => {
      const properties = getCircleTemplateProperties(mockCircleTemplate, 1200);
      const containerStyles = getCircleContainerStyles(mockCircleTemplate, { w: 3, h: 3 });

      expect(properties.style.aspectRatio).toBe('1 / 1');
      expect(containerStyles.style.aspectRatio).toBe('1 / 1');
    });

    it('should ensure minimum viable sizes are maintained', () => {
      const mobileProperties = getCircleTemplateProperties(mockCircleTemplate, 400);
      
      expect(mobileProperties.style.minWidth).toBe('60px');
      expect(mobileProperties.style.minHeight).toBe('60px');
    });

    it('should scale appropriately for different screen sizes', () => {
      const mobileProperties = getCircleTemplateProperties(mockCircleTemplate, 400);
      const tabletProperties = getCircleTemplateProperties(mockCircleTemplate, 800);
      const desktopProperties = getCircleTemplateProperties(mockCircleTemplate, 1400);

      // Mobile should have smaller minimum size
      expect(parseInt(mobileProperties.style.minWidth as string)).toBeLessThan(
        parseInt(tabletProperties.style.minWidth as string)
      );

      // Tablet should have smaller minimum size than desktop
      expect(parseInt(tabletProperties.style.minWidth as string)).toBeLessThan(
        parseInt(desktopProperties.style.minWidth as string)
      );
    });
  });

  describe('CSS Class Generation', () => {
    it('should generate appropriate CSS classes for circular appearance', () => {
      const properties = getCircleTemplateProperties(mockCircleTemplate);
      
      expect(properties.className).toMatch(/rounded-full/);
      expect(properties.className).toMatch(/overflow-hidden/);
      expect(properties.className).toMatch(/aspect-square/);
      expect(properties.className).toMatch(/flex-shrink-0/);
      expect(properties.className).toMatch(/relative/);
    });

    it('should include responsive classes when appropriate', () => {
      const properties = getCircleTemplateProperties(mockCircleTemplate, 600);
      
      expect(properties.className).toContain('flex-shrink-0');
      expect(properties.className).toContain('relative');
    });
  });
});