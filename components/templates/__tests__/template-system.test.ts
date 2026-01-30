/**
 * Template System Tests
 * 
 * Basic unit tests to verify the template system foundation is working correctly.
 */

import {
  getTemplateCategories,
  getTemplatesByCategory,
  getTemplatesForTileType,
  validateTemplateForTileType,
  validateAllTemplates,
  getDefaultTemplateForTileType,
  ALL_TEMPLATES,
  SQUARE_TEMPLATES,
  RECTANGLE_TEMPLATES,
  CIRCLE_TEMPLATES,
} from '../index';

describe('Template System Foundation', () => {
  describe('Template Categories', () => {
    test('should return exactly three categories', () => {
      const categories = getTemplateCategories();
      expect(categories).toEqual(['square', 'rectangle', 'circle']);
    });

    test('should have templates for each category', () => {
      expect(getTemplatesByCategory('square')).toEqual(SQUARE_TEMPLATES);
      expect(getTemplatesByCategory('rectangle')).toEqual(RECTANGLE_TEMPLATES);
      expect(getTemplatesByCategory('circle')).toEqual(CIRCLE_TEMPLATES);
    });
  });

  describe('Template Dimensions', () => {
    test('square templates should have correct dimensions', () => {
      const squares = getTemplatesByCategory('square');
      expect(squares).toHaveLength(3);
      
      const dimensions = squares.map(t => `${t.dimensions.w}x${t.dimensions.h}`);
      expect(dimensions).toContain('1x1');
      expect(dimensions).toContain('2x2');
      expect(dimensions).toContain('3x3');
    });

    test('rectangle templates should have correct dimensions', () => {
      const rectangles = getTemplatesByCategory('rectangle');
      expect(rectangles).toHaveLength(4);
      
      const dimensions = rectangles.map(t => `${t.dimensions.w}x${t.dimensions.h}`);
      expect(dimensions).toContain('2x1');
      expect(dimensions).toContain('3x2');
      expect(dimensions).toContain('4x2');
      expect(dimensions).toContain('6x3');
    });

    test('circle templates should have square dimensions', () => {
      const circles = getTemplatesByCategory('circle');
      circles.forEach(template => {
        expect(template.dimensions.w).toBe(template.dimensions.h);
      });
    });
  });

  describe('Tile Type Restrictions', () => {
    test('video and image tiles should have access to circle templates', () => {
      const videoTemplates = getTemplatesForTileType('video');
      const imageTemplates = getTemplatesForTileType('image');
      
      const videoCircles = videoTemplates.filter(t => t.category === 'circle');
      const imageCircles = imageTemplates.filter(t => t.category === 'circle');
      
      expect(videoCircles.length).toBeGreaterThan(0);
      expect(imageCircles.length).toBeGreaterThan(0);
    });

    test('non-video/image tiles should not have access to circle templates', () => {
      const textTemplates = getTemplatesForTileType('text');
      const thoughtTemplates = getTemplatesForTileType('thought');
      const quoteTemplates = getTemplatesForTileType('quote');
      
      const textCircles = textTemplates.filter(t => t.category === 'circle');
      const thoughtCircles = thoughtTemplates.filter(t => t.category === 'circle');
      const quoteCircles = quoteTemplates.filter(t => t.category === 'circle');
      
      expect(textCircles).toHaveLength(0);
      expect(thoughtCircles).toHaveLength(0);
      expect(quoteCircles).toHaveLength(0);
    });

    test('circle templates should only allow video and image tiles', () => {
      const circles = getTemplatesByCategory('circle');
      
      circles.forEach(template => {
        expect(template.allowedTileTypes).toEqual(expect.arrayContaining(['video', 'image']));
        expect(template.allowedTileTypes.every(type => ['video', 'image'].includes(type))).toBe(true);
      });
    });
  });

  describe('Template Validation', () => {
    test('all predefined templates should be valid', () => {
      const validation = validateAllTemplates();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should validate template compatibility with tile types', () => {
      const circleTemplate = getTemplatesByCategory('circle')[0];
      
      // Should be valid for video and image
      expect(validateTemplateForTileType(circleTemplate, 'video').isValid).toBe(true);
      expect(validateTemplateForTileType(circleTemplate, 'image').isValid).toBe(true);
      
      // Should be invalid for other types
      expect(validateTemplateForTileType(circleTemplate, 'text').isValid).toBe(false);
      expect(validateTemplateForTileType(circleTemplate, 'thought').isValid).toBe(false);
    });
  });

  describe('Default Templates', () => {
    test('should have default templates for all tile types', () => {
      const tileTypes = ['text', 'thought', 'quote', 'image', 'video', 'project', 'status'];
      
      tileTypes.forEach(type => {
        const defaultTemplate = getDefaultTemplateForTileType(type as any);
        expect(defaultTemplate).not.toBeNull();
        expect(defaultTemplate?.allowedTileTypes).toContain(type);
      });
    });
  });

  describe('Template System Integrity', () => {
    test('should have unique template IDs', () => {
      const ids = ALL_TEMPLATES.map(t => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    test('should have consistent aspect ratios', () => {
      ALL_TEMPLATES.forEach(template => {
        const calculatedRatio = template.dimensions.w / template.dimensions.h;
        expect(Math.abs(template.aspectRatio - calculatedRatio)).toBeLessThan(0.01);
      });
    });

    test('should have proper category classification', () => {
      const squares = ALL_TEMPLATES.filter(t => t.category === 'square');
      const rectangles = ALL_TEMPLATES.filter(t => t.category === 'rectangle');
      const circles = ALL_TEMPLATES.filter(t => t.category === 'circle');
      
      // Squares and circles should have equal dimensions
      squares.forEach(template => {
        expect(template.dimensions.w).toBe(template.dimensions.h);
      });
      
      circles.forEach(template => {
        expect(template.dimensions.w).toBe(template.dimensions.h);
      });
      
      // Rectangles should have different dimensions
      rectangles.forEach(template => {
        expect(template.dimensions.w).not.toBe(template.dimensions.h);
      });
    });
  });
});