/**
 * Repositioning Engine Tests
 * 
 * Tests for the intelligent repositioning logic implemented in task 2.2
 * of the garden-builder-refactor spec.
 */

import { RepositioningEngine, GridItem, DropZone } from '../RepositioningEngine';

describe('RepositioningEngine', () => {
  let engine: RepositioningEngine;

  beforeEach(() => {
    engine = new RepositioningEngine(12, null);
  });

  describe('Drop Zone Calculation', () => {
    test('should identify valid drop zone with no conflicts', () => {
      const draggedItem: GridItem = { i: 'item1', x: 0, y: 0, w: 2, h: 2 };
      const layout: GridItem[] = [
        { i: 'item2', x: 4, y: 0, w: 2, h: 2 }
      ];

      const dropZones = engine.calculateValidDropZones(draggedItem, layout, 0, 0);

      expect(dropZones).toHaveLength(1);
      expect(dropZones[0].isValid).toBe(true);
      expect(dropZones[0].conflictingTiles).toHaveLength(0);
      expect(dropZones[0].shiftRequired).toBe(false);
    });

    test('should identify conflicts and calculate shift requirements', () => {
      const draggedItem: GridItem = { i: 'item1', x: 0, y: 0, w: 2, h: 2 };
      const layout: GridItem[] = [
        { i: 'item2', x: 1, y: 0, w: 2, h: 2 } // Overlaps with target position
      ];

      const dropZones = engine.calculateValidDropZones(draggedItem, layout, 0, 0);

      expect(dropZones[0].conflictingTiles).toContain('item2');
      expect(dropZones[0].shiftRequired).toBe(true);
    });

    test('should calculate alternative drop zones when primary requires shifting', () => {
      const draggedItem: GridItem = { i: 'item1', x: 0, y: 0, w: 2, h: 2 };
      const layout: GridItem[] = [
        { i: 'item2', x: 0, y: 0, w: 2, h: 2 }, // Blocks primary position
        { i: 'item3', x: 1, y: 0, w: 2, h: 2 }  // Blocks adjacent position
      ];

      const dropZones = engine.calculateValidDropZones(draggedItem, layout, 0, 0);

      expect(dropZones.length).toBeGreaterThan(1);
      // Should find alternative positions
      const validAlternatives = dropZones.filter(zone => zone.isValid);
      expect(validAlternatives.length).toBeGreaterThan(0);
    });

    test('should respect grid boundaries', () => {
      const draggedItem: GridItem = { i: 'item1', x: 0, y: 0, w: 3, h: 2 };
      const layout: GridItem[] = [];

      // Try to place at position that would exceed grid width (12 cols)
      const dropZones = engine.calculateValidDropZones(draggedItem, layout, 10, 0);

      expect(dropZones[0].isValid).toBe(false);
    });
  });

  describe('Tile Shifting Logic', () => {
    test('should successfully shift tiles to accommodate new placement', () => {
      const draggedItem: GridItem = { i: 'item1', x: 4, y: 4, w: 2, h: 2 };
      const layout: GridItem[] = [
        draggedItem,
        { i: 'item2', x: 0, y: 0, w: 2, h: 2 } // Will conflict when item1 moves to 0,0
      ];

      const result = engine.shiftTilesOnDrop(draggedItem, 0, 0, layout);

      expect(result.success).toBe(true);
      expect(result.shiftedTiles).toContain('item2');
      
      // Check that item2 was moved to a non-conflicting position
      const shiftedItem2 = result.newLayout.find(item => item.i === 'item2');
      expect(shiftedItem2).toBeDefined();
      expect(shiftedItem2!.x !== 0 || shiftedItem2!.y !== 0).toBe(true);
    });

    test('should handle multiple conflicting tiles', () => {
      const draggedItem: GridItem = { i: 'item1', x: 6, y: 6, w: 3, h: 3 };
      const layout: GridItem[] = [
        draggedItem,
        { i: 'item2', x: 0, y: 0, w: 2, h: 2 },
        { i: 'item3', x: 1, y: 1, w: 2, h: 2 }
      ];

      const result = engine.shiftTilesOnDrop(draggedItem, 0, 0, layout);

      expect(result.success).toBe(true);
      expect(result.shiftedTiles.length).toBeGreaterThan(0);
      
      // Verify no overlaps in final layout (including the dragged item at new position)
      const draggedAtNewPos = { ...draggedItem, x: 0, y: 0 };
      const finalLayout = [...result.newLayout, draggedAtNewPos];
      
      for (let i = 0; i < finalLayout.length; i++) {
        for (let j = i + 1; j < finalLayout.length; j++) {
          const overlap = engine['tilesOverlap'](finalLayout[i], finalLayout[j]);
          expect(overlap).toBe(false);
        }
      }
    });

    test('should find alternative position when shifting fails', () => {
      const draggedItem: GridItem = { i: 'item1', x: 0, y: 0, w: 2, h: 2 };
      
      // Create a layout where shifting would be very difficult
      const layout: GridItem[] = [
        draggedItem,
        { i: 'item2', x: 0, y: 0, w: 12, h: 1 }, // Full width barrier
        { i: 'item3', x: 0, y: 1, w: 12, h: 1 }  // Another full width barrier
      ];

      const result = engine.shiftTilesOnDrop(draggedItem, 0, 0, layout);

      // Should either succeed with shifting or find alternative position
      expect(result.success).toBe(true);
    });
  });

  describe('Collision Detection', () => {
    test('should detect overlapping tiles', () => {
      const tile1: GridItem = { i: 'item1', x: 0, y: 0, w: 2, h: 2 };
      const tile2: GridItem = { i: 'item2', x: 1, y: 1, w: 2, h: 2 };

      const overlap = engine['tilesOverlap'](tile1, tile2);
      expect(overlap).toBe(true);
    });

    test('should not detect overlap for adjacent tiles', () => {
      const tile1: GridItem = { i: 'item1', x: 0, y: 0, w: 2, h: 2 };
      const tile2: GridItem = { i: 'item2', x: 2, y: 0, w: 2, h: 2 };

      const overlap = engine['tilesOverlap'](tile1, tile2);
      expect(overlap).toBe(false);
    });

    test('should validate placement within grid bounds', () => {
      const item: GridItem = { i: 'item1', x: 0, y: 0, w: 2, h: 2 };
      const layout: GridItem[] = [];

      // Valid position
      expect(engine.validatePlacement(item, { x: 0, y: 0 }, layout)).toBe(true);
      
      // Invalid position (exceeds grid width)
      expect(engine.validatePlacement(item, { x: 11, y: 0 }, layout)).toBe(false);
      
      // Invalid position (negative coordinates)
      expect(engine.validatePlacement(item, { x: -1, y: 0 }, layout)).toBe(false);
    });

    test('should prevent collision with existing tiles', () => {
      const item: GridItem = { i: 'item1', x: 0, y: 0, w: 2, h: 2 };
      const layout: GridItem[] = [
        { i: 'item2', x: 1, y: 1, w: 2, h: 2 }
      ];

      // Position that would overlap with existing tile
      expect(engine.validatePlacement(item, { x: 0, y: 0 }, layout)).toBe(false);
      
      // Position that doesn't overlap
      expect(engine.validatePlacement(item, { x: 4, y: 0 }, layout)).toBe(true);
    });
  });

  describe('Visual Feedback', () => {
    test('should provide drop zone visual feedback data', () => {
      const draggedItem: GridItem = { i: 'item1', x: 0, y: 0, w: 2, h: 2 };
      const layout: GridItem[] = [
        { i: 'item2', x: 4, y: 0, w: 2, h: 2 }
      ];

      const feedback = engine.getDropZoneVisualFeedback(draggedItem, layout, 0, 0);

      expect(feedback.validZones).toBeDefined();
      expect(feedback.invalidZones).toBeDefined();
      expect(feedback.shiftPreview).toBeDefined();
      
      // Should have at least one valid zone for this simple case
      expect(feedback.validZones.length).toBeGreaterThan(0);
    });

    test('should include shift preview when tiles need to move', () => {
      const draggedItem: GridItem = { i: 'item1', x: 4, y: 0, w: 2, h: 2 };
      const layout: GridItem[] = [
        draggedItem,
        { i: 'item2', x: 0, y: 0, w: 2, h: 2 } // Will need to shift
      ];

      const feedback = engine.getDropZoneVisualFeedback(draggedItem, layout, 0, 0);

      expect(feedback.shiftPreview.length).toBeGreaterThan(0);
    });
  });

  describe('Grid Configuration', () => {
    test('should update grid configuration', () => {
      engine.updateGridConfig(8, 'vertical');
      
      // Test with new grid width
      const draggedItem: GridItem = { i: 'item1', x: 0, y: 0, w: 2, h: 2 };
      const layout: GridItem[] = [];

      // Should now reject positions that exceed 8 columns
      expect(engine.validatePlacement(draggedItem, { x: 7, y: 0 }, layout)).toBe(false);
      expect(engine.validatePlacement(draggedItem, { x: 6, y: 0 }, layout)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty layout', () => {
      const draggedItem: GridItem = { i: 'item1', x: 0, y: 0, w: 2, h: 2 };
      const layout: GridItem[] = [];

      const result = engine.shiftTilesOnDrop(draggedItem, 0, 0, layout);

      expect(result.success).toBe(true);
      expect(result.shiftedTiles).toHaveLength(0);
      expect(result.newLayout).toHaveLength(0); // Empty layout remains empty
    });

    test('should handle single tile layout', () => {
      const draggedItem: GridItem = { i: 'item1', x: 0, y: 0, w: 2, h: 2 };
      const layout: GridItem[] = [draggedItem];

      const result = engine.shiftTilesOnDrop(draggedItem, 2, 0, layout);

      expect(result.success).toBe(true);
      expect(result.newLayout).toHaveLength(0); // Only the dragged item, which is excluded from newLayout
    });

    test('should handle large tiles', () => {
      const draggedItem: GridItem = { i: 'item1', x: 0, y: 0, w: 6, h: 4 };
      const layout: GridItem[] = [draggedItem];

      const result = engine.shiftTilesOnDrop(draggedItem, 0, 0, layout);

      expect(result.success).toBe(true);
    });

    test('should handle tiles at grid boundaries', () => {
      const draggedItem: GridItem = { i: 'item1', x: 10, y: 0, w: 2, h: 2 };
      const layout: GridItem[] = [draggedItem];

      // Try to move to a position that would exceed boundaries
      const result = engine.shiftTilesOnDrop(draggedItem, 11, 0, layout);

      // Should either find alternative position or fail gracefully
      expect(result).toBeDefined();
    });
  });
});