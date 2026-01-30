/**
 * Template System Integration Tests
 * 
 * Tests to verify the template system integrates correctly with existing components.
 */

import {
  migrateLegacyTile,
  getDefaultTemplateForTileType,
  calculateResponsiveDimensions,
  findFirstAvailablePosition,
  canPlaceTemplateAt,
  getTemplateById,
} from '../index';
import { BlockType } from '../../Block';

describe('Template System Integration', () => {
  describe('Legacy Migration', () => {
    test('should migrate common legacy tile sizes', () => {
      const legacyTiles = [
        { id: '1', type: 'thought' as BlockType, x: 0, y: 0, w: 2, h: 2 },
        { id: '2', type: 'project' as BlockType, x: 2, y: 0, w: 6, h: 4 },
        { id: '3', type: 'image' as BlockType, x: 0, y: 2, w: 3, h: 3 },
      ];

      legacyTiles.forEach(legacyTile => {
        const migrated = migrateLegacyTile(legacyTile);
        expect(migrated).not.toBeNull();
        expect(migrated?.id).toBe(legacyTile.id);
        expect(migrated?.type).toBe(legacyTile.type);
        expect(migrated?.position.x).toBe(legacyTile.x);
        expect(migrated?.position.y).toBe(legacyTile.y);
        expect(migrated?.metadata.migrationSource).toBe('legacy');
      });
    });

    test('should handle unknown legacy sizes gracefully', () => {
      const unknownSizeTile = {
        id: '1',
        type: 'text' as BlockType,
        x: 0,
        y: 0,
        w: 5, // Unusual size
        h: 7, // Unusual size
      };

      const migrated = migrateLegacyTile(unknownSizeTile);
      expect(migrated).not.toBeNull(); // Should find closest match
      expect(migrated?.type).toBe('text');
    });
  });

  describe('Responsive Behavior', () => {
    test('should scale templates for different screen sizes', () => {
      const template = getTemplateById('medium-square');
      expect(template).not.toBeNull();

      if (template) {
        const mobileDimensions = calculateResponsiveDimensions(template, 600);
        const desktopDimensions = calculateResponsiveDimensions(template, 1200);

        // Mobile should be smaller or equal
        expect(mobileDimensions.w).toBeLessThanOrEqual(desktopDimensions.w);
        expect(mobileDimensions.h).toBeLessThanOrEqual(desktopDimensions.h);

        // Aspect ratio should be maintained
        const mobileRatio = mobileDimensions.w / mobileDimensions.h;
        const desktopRatio = desktopDimensions.w / desktopDimensions.h;
        expect(Math.abs(mobileRatio - desktopRatio)).toBeLessThan(0.1);
      }
    });
  });

  describe('Grid Placement', () => {
    test('should find available positions for templates', () => {
      const template = getTemplateById('small-square');
      expect(template).not.toBeNull();

      if (template) {
        const existingTiles = [
          {
            id: '1',
            type: 'text' as BlockType,
            content: {},
            position: { x: 0, y: 0, w: 2, h: 2 },
            template: { id: 'medium-square', category: 'square' as const, dimensions: { w: 2, h: 2 } },
            metadata: { createdAt: new Date(), updatedAt: new Date(), version: '1.0.0' },
          },
        ];

        const position = findFirstAvailablePosition(template, existingTiles);
        expect(position).not.toBeNull();
        
        if (position) {
          expect(canPlaceTemplateAt(template, position.x, position.y, existingTiles)).toBe(true);
        }
      }
    });

    test('should detect collisions correctly', () => {
      const template = getTemplateById('large-square');
      expect(template).not.toBeNull();

      if (template) {
        const existingTiles = [
          {
            id: '1',
            type: 'text' as BlockType,
            content: {},
            position: { x: 1, y: 1, w: 2, h: 2 },
            template: { id: 'medium-square', category: 'square' as const, dimensions: { w: 2, h: 2 } },
            metadata: { createdAt: new Date(), updatedAt: new Date(), version: '1.0.0' },
          },
        ];

        // Should not be able to place at overlapping position
        expect(canPlaceTemplateAt(template, 0, 0, existingTiles)).toBe(false);
        
        // Should be able to place at non-overlapping position
        expect(canPlaceTemplateAt(template, 4, 0, existingTiles)).toBe(true);
      }
    });
  });

  describe('Default Template Assignment', () => {
    test('should assign appropriate default templates for each tile type', () => {
      const tileTypes: BlockType[] = ['text', 'thought', 'quote', 'image', 'video', 'project', 'status'];
      
      tileTypes.forEach(tileType => {
        const defaultTemplate = getDefaultTemplateForTileType(tileType);
        expect(defaultTemplate).not.toBeNull();
        expect(defaultTemplate?.allowedTileTypes).toContain(tileType);

        // Verify sensible defaults
        if (tileType === 'thought') {
          expect(defaultTemplate?.dimensions.w).toBeLessThanOrEqual(2);
          expect(defaultTemplate?.dimensions.h).toBeLessThanOrEqual(2);
        }
        
        if (tileType === 'project') {
          expect(defaultTemplate?.dimensions.w).toBeGreaterThanOrEqual(4);
          expect(defaultTemplate?.dimensions.h).toBeGreaterThanOrEqual(3);
        }
      });
    });
  });

  describe('Template System State', () => {
    test('should maintain consistent template counts', () => {
      // Should have exactly the templates specified in requirements
      const squares = getTemplateById('small-square') && getTemplateById('medium-square') && getTemplateById('large-square');
      expect(squares).toBeTruthy();

      const rectangles = getTemplateById('small-rectangle') && 
                        getTemplateById('medium-rectangle') && 
                        getTemplateById('wide-rectangle') && 
                        getTemplateById('large-rectangle');
      expect(rectangles).toBeTruthy();

      const circles = getTemplateById('small-circle') && getTemplateById('medium-circle') && getTemplateById('large-circle');
      expect(circles).toBeTruthy();
    });
  });
});