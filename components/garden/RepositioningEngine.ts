/**
 * Intelligent Repositioning Engine
 * 
 * This module implements intelligent repositioning logic for the garden builder
 * as specified in task 2.2 of the garden-builder-refactor spec.
 * 
 * Features:
 * - Drop zone calculation algorithm
 * - Tile shifting logic for accommodating moves
 * - Collision detection and prevention
 * 
 * Requirements: 2.3 - Intelligent tile shifting to accommodate moves
 */

export interface GridItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  static?: boolean;
  isDraggable?: boolean;
}

export interface DropZone {
  x: number;
  y: number;
  isValid: boolean;
  conflictingTiles: string[];
  shiftRequired: boolean;
  shiftPreview: GridItem[];
}

export interface RepositioningResult {
  newLayout: GridItem[];
  shiftedTiles: string[];
  success: boolean;
  reason?: string;
}

export class RepositioningEngine {
  private gridCols: number;
  private compactType: 'vertical' | 'horizontal' | null;

  constructor(gridCols: number = 12, compactType: 'vertical' | 'horizontal' | null = null) {
    this.gridCols = gridCols;
    this.compactType = compactType;
  }

  /**
   * Calculates valid drop zones for a dragged item
   * Requirements: 2.3 - Intelligent repositioning logic
   */
  calculateValidDropZones(
    draggedItem: GridItem,
    layout: GridItem[],
    targetX: number,
    targetY: number
  ): DropZone[] {
    const dropZones: DropZone[] = [];
    const otherItems = layout.filter(item => item.i !== draggedItem.i);

    // Calculate primary drop zone at target position
    const primaryZone = this.calculateDropZone(
      draggedItem,
      otherItems,
      targetX,
      targetY
    );
    dropZones.push(primaryZone);

    // If primary zone requires shifting, calculate alternative zones
    if (primaryZone.shiftRequired) {
      const alternatives = this.calculateAlternativeDropZones(
        draggedItem,
        otherItems,
        targetX,
        targetY
      );
      dropZones.push(...alternatives);
    }

    return dropZones;
  }

  /**
   * Calculates a single drop zone at specific coordinates
   */
  private calculateDropZone(
    draggedItem: GridItem,
    otherItems: GridItem[],
    x: number,
    y: number
  ): DropZone {
    // Check if position is within grid bounds
    if (x < 0 || y < 0 || x + draggedItem.w > this.gridCols) {
      return {
        x,
        y,
        isValid: false,
        conflictingTiles: [],
        shiftRequired: false,
        shiftPreview: [],
      };
    }

    // Find conflicting tiles
    const conflictingTiles = this.findConflictingTiles(
      { ...draggedItem, x, y },
      otherItems
    );

    // If no conflicts, it's a valid drop zone
    if (conflictingTiles.length === 0) {
      return {
        x,
        y,
        isValid: true,
        conflictingTiles: [],
        shiftRequired: false,
        shiftPreview: otherItems,
      };
    }

    // Calculate if shifting can resolve conflicts
    const shiftResult = this.calculateTileShifting(
      { ...draggedItem, x, y },
      otherItems,
      conflictingTiles
    );

    return {
      x,
      y,
      isValid: shiftResult.success,
      conflictingTiles: conflictingTiles.map(t => t.i),
      shiftRequired: true,
      shiftPreview: shiftResult.success ? shiftResult.newLayout : [],
    };
  }

  /**
   * Calculates alternative drop zones when primary zone requires complex shifting
   */
  private calculateAlternativeDropZones(
    draggedItem: GridItem,
    otherItems: GridItem[],
    targetX: number,
    targetY: number
  ): DropZone[] {
    const alternatives: DropZone[] = [];
    const searchRadius = 3;

    // Search in expanding radius around target position
    for (let radius = 1; radius <= searchRadius; radius++) {
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          // Skip positions already checked or outside search radius
          if (Math.abs(dx) + Math.abs(dy) !== radius) continue;

          const altX = targetX + dx;
          const altY = targetY + dy;

          // Skip if outside grid bounds
          if (altX < 0 || altY < 0 || altX + draggedItem.w > this.gridCols) {
            continue;
          }

          const altZone = this.calculateDropZone(draggedItem, otherItems, altX, altY);
          
          // Only add valid alternatives or those requiring minimal shifting
          if (altZone.isValid || altZone.conflictingTiles.length <= 2) {
            alternatives.push(altZone);
          }
        }
      }
    }

    // Sort alternatives by preference (valid first, then by distance from target)
    return alternatives.sort((a, b) => {
      if (a.isValid && !b.isValid) return -1;
      if (!a.isValid && b.isValid) return 1;
      
      const distA = Math.abs(a.x - targetX) + Math.abs(a.y - targetY);
      const distB = Math.abs(b.x - targetX) + Math.abs(b.y - targetY);
      return distA - distB;
    });
  }

  /**
   * Implements intelligent tile shifting to accommodate moves
   * Requirements: 2.3 - Tile shifting logic for accommodating moves
   */
  shiftTilesOnDrop(
    draggedItem: GridItem,
    targetX: number,
    targetY: number,
    layout: GridItem[]
  ): RepositioningResult {
    const otherItems = layout.filter(item => item.i !== draggedItem.i);
    const newDraggedItem = { ...draggedItem, x: targetX, y: targetY };

    // Find conflicting tiles
    const conflictingTiles = this.findConflictingTiles(newDraggedItem, otherItems);

    if (conflictingTiles.length === 0) {
      // No conflicts, simple placement - return other items unchanged
      return {
        newLayout: otherItems,
        shiftedTiles: [],
        success: true,
      };
    }

    // Attempt to resolve conflicts through shifting
    const shiftResult = this.calculateTileShifting(
      newDraggedItem,
      otherItems,
      conflictingTiles
    );

    if (shiftResult.success) {
      return {
        newLayout: shiftResult.newLayout,
        shiftedTiles: shiftResult.shiftedTiles,
        success: true,
      };
    }

    // If shifting fails, try to find the best alternative position
    const alternatives = this.calculateAlternativeDropZones(
      draggedItem,
      otherItems,
      targetX,
      targetY
    );

    const bestAlternative = alternatives.find(alt => alt.isValid);
    if (bestAlternative) {
      return {
        newLayout: bestAlternative.shiftPreview,
        shiftedTiles: [],
        success: true,
      };
    }

    // No valid position found - return original layout
    return {
      newLayout: layout,
      shiftedTiles: [],
      success: false,
      reason: 'No valid position found for tile placement',
    };
  }

  /**
   * Calculates how to shift conflicting tiles to make room
   */
  private calculateTileShifting(
    newItem: GridItem,
    otherItems: GridItem[],
    conflictingTiles: GridItem[]
  ): RepositioningResult {
    const shiftedTiles: string[] = [];
    const workingLayout = [...otherItems];

    // Sort conflicting tiles by priority (smaller tiles first, then by position)
    const sortedConflicts = conflictingTiles.sort((a, b) => {
      const areaA = a.w * a.h;
      const areaB = b.w * b.h;
      if (areaA !== areaB) return areaA - areaB;
      return (a.y * this.gridCols + a.x) - (b.y * this.gridCols + b.x);
    });

    // Try to shift each conflicting tile
    for (const conflictTile of sortedConflicts) {
      const shiftedPosition = this.findShiftPosition(
        conflictTile,
        workingLayout.filter(item => item.i !== conflictTile.i),
        newItem
      );

      if (!shiftedPosition) {
        // Cannot shift this tile, shifting fails
        return {
          newLayout: [],
          shiftedTiles: [],
          success: false,
          reason: `Cannot find position for tile ${conflictTile.i}`,
        };
      }

      // Update the tile position in working layout
      const tileIndex = workingLayout.findIndex(item => item.i === conflictTile.i);
      if (tileIndex >= 0) {
        workingLayout[tileIndex] = {
          ...conflictTile,
          x: shiftedPosition.x,
          y: shiftedPosition.y,
        };
        shiftedTiles.push(conflictTile.i);
      }
    }

    // Apply compaction if enabled
    const finalLayout = this.compactType 
      ? this.compactLayout(workingLayout, this.compactType)
      : workingLayout;

    return {
      newLayout: finalLayout,
      shiftedTiles,
      success: true,
    };
  }

  /**
   * Finds a new position for a tile that needs to be shifted
   */
  private findShiftPosition(
    tileToShift: GridItem,
    otherTiles: GridItem[],
    avoidTile: GridItem
  ): { x: number; y: number } | null {
    // Try positions in expanding search pattern
    const maxY = Math.max(...otherTiles.map(t => t.y + t.h), avoidTile.y + avoidTile.h) + 5;

    for (let y = 0; y <= maxY; y++) {
      for (let x = 0; x <= this.gridCols - tileToShift.w; x++) {
        const testPosition = { ...tileToShift, x, y };

        // Check if position conflicts with other tiles or the new item
        const hasConflict = 
          this.tilesOverlap(testPosition, avoidTile) ||
          otherTiles.some(other => 
            other.i !== tileToShift.i && this.tilesOverlap(testPosition, other)
          );

        if (!hasConflict) {
          return { x, y };
        }
      }
    }

    return null;
  }

  /**
   * Collision detection and prevention
   * Requirements: 2.3 - Add collision detection and prevention
   */
  validatePlacement(
    item: GridItem,
    position: { x: number; y: number },
    layout: GridItem[]
  ): boolean {
    const testItem = { ...item, x: position.x, y: position.y };

    // Check grid bounds
    if (position.x < 0 || position.y < 0 || position.x + item.w > this.gridCols) {
      return false;
    }

    // Check for collisions with other items
    const otherItems = layout.filter(other => other.i !== item.i);
    return !otherItems.some(other => this.tilesOverlap(testItem, other));
  }

  /**
   * Finds all tiles that conflict with a given tile position
   */
  private findConflictingTiles(
    testItem: GridItem,
    otherItems: GridItem[]
  ): GridItem[] {
    return otherItems.filter(other => this.tilesOverlap(testItem, other));
  }

  /**
   * Checks if two tiles overlap
   */
  private tilesOverlap(tile1: GridItem, tile2: GridItem): boolean {
    return !(
      tile1.x + tile1.w <= tile2.x ||
      tile2.x + tile2.w <= tile1.x ||
      tile1.y + tile1.h <= tile2.y ||
      tile2.y + tile2.h <= tile1.y
    );
  }

  /**
   * Compacts the layout by moving tiles up/left to fill gaps
   */
  private compactLayout(
    layout: GridItem[],
    compactType: 'vertical' | 'horizontal'
  ): GridItem[] {
    if (compactType === 'vertical') {
      return this.compactVertical(layout);
    } else {
      return this.compactHorizontal(layout);
    }
  }

  /**
   * Compacts layout vertically (moves tiles up)
   */
  private compactVertical(layout: GridItem[]): GridItem[] {
    const sorted = [...layout].sort((a, b) => a.y - b.y || a.x - b.x);
    const compacted: GridItem[] = [];

    for (const item of sorted) {
      let newY = 0;
      
      // Find the lowest possible Y position
      while (newY <= item.y) {
        const testItem = { ...item, y: newY };
        const hasCollision = compacted.some(other => this.tilesOverlap(testItem, other));
        
        if (!hasCollision) {
          break;
        }
        newY++;
      }

      compacted.push({ ...item, y: newY });
    }

    return compacted;
  }

  /**
   * Compacts layout horizontally (moves tiles left)
   */
  private compactHorizontal(layout: GridItem[]): GridItem[] {
    const sorted = [...layout].sort((a, b) => a.x - b.x || a.y - b.y);
    const compacted: GridItem[] = [];

    for (const item of sorted) {
      let newX = 0;
      
      // Find the leftmost possible X position
      while (newX <= item.x && newX + item.w <= this.gridCols) {
        const testItem = { ...item, x: newX };
        const hasCollision = compacted.some(other => this.tilesOverlap(testItem, other));
        
        if (!hasCollision) {
          break;
        }
        newX++;
      }

      compacted.push({ ...item, x: newX });
    }

    return compacted;
  }

  /**
   * Gets visual feedback data for drop zones during drag operations
   */
  getDropZoneVisualFeedback(
    draggedItem: GridItem,
    layout: GridItem[],
    currentX: number,
    currentY: number
  ): {
    validZones: { x: number; y: number; w: number; h: number }[];
    invalidZones: { x: number; y: number; w: number; h: number }[];
    shiftPreview: GridItem[];
  } {
    const dropZones = this.calculateValidDropZones(draggedItem, layout, currentX, currentY);
    
    const validZones = dropZones
      .filter(zone => zone.isValid)
      .map(zone => ({
        x: zone.x,
        y: zone.y,
        w: draggedItem.w,
        h: draggedItem.h,
      }));

    const invalidZones = dropZones
      .filter(zone => !zone.isValid)
      .map(zone => ({
        x: zone.x,
        y: zone.y,
        w: draggedItem.w,
        h: draggedItem.h,
      }));

    const primaryZone = dropZones[0];
    const shiftPreview = primaryZone?.shiftPreview || [];

    return {
      validZones,
      invalidZones,
      shiftPreview,
    };
  }

  /**
   * Updates grid configuration
   */
  updateGridConfig(gridCols: number, compactType: 'vertical' | 'horizontal' | null): void {
    this.gridCols = gridCols;
    this.compactType = compactType;
  }
}

/**
 * Default repositioning engine instance
 */
export const defaultRepositioningEngine = new RepositioningEngine(12, null);

/**
 * Utility function to create a repositioning engine with custom configuration
 */
export function createRepositioningEngine(
  gridCols: number = 12,
  compactType: 'vertical' | 'horizontal' | null = null
): RepositioningEngine {
  return new RepositioningEngine(gridCols, compactType);
}