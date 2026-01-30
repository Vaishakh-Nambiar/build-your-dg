/**
 * Template Grid Integration System
 * 
 * Connects template selection to grid item creation and integrates
 * template constraints with repositioning logic.
 * 
 * Requirements: 1.2, 8.1
 */

import { BlockData, BlockType } from '../Block';
import { TileTemplate } from '../templates/types';
import { validateTemplateForTileType } from '../templates/validation';
import { GridItem } from './RepositioningEngine';

export interface TemplateGridItem extends GridItem {
  template: TileTemplate;
  blockType: BlockType;
  content?: any;
}

export interface GridLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TemplateConstraints {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  aspectRatio?: number;
  allowResize: boolean;
}

/**
 * Creates a new grid item from template selection
 */
export const createGridItemFromTemplate = (
  template: TileTemplate,
  blockType: BlockType,
  position: { x: number; y: number },
  content?: any
): {
  gridItem: GridLayoutItem;
  blockData: BlockData;
} => {
  // Validate template compatibility
  const validation = validateTemplateForTileType(template, blockType);
  if (!validation.isValid) {
    throw new Error(`Template ${template.id} is not compatible with block type ${blockType}: ${validation.reason}`);
  }

  const id = `tile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Create grid layout item with template dimensions
  const gridItem: GridLayoutItem = {
    i: id,
    x: position.x,
    y: position.y,
    w: template.dimensions.w,
    h: template.dimensions.h
  };

  // Create block data with template information
  const blockData: BlockData = {
    id,
    type: blockType,
    template,
    content: content || getDefaultContentForType(blockType),
    position,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return { gridItem, blockData };
};

/**
 * Gets default content structure for a block type
 */
const getDefaultContentForType = (blockType: BlockType): any => {
  switch (blockType) {
    case 'text':
      return { text: '', title: '', category: '' };
    case 'thought':
      return { thought: '', category: '', color: '#fef3c7' };
    case 'quote':
      return { quote: '', author: '', source: '', category: '' };
    case 'image':
      return { src: '', alt: '', title: '', caption: '', category: '' };
    case 'video':
      return { src: '', title: '', description: '', thumbnail: '', autoplay: false, muted: true, category: '' };
    case 'project':
      return { title: '', description: '', image: '', link: '', tags: [], status: 'completed', category: '' };
    case 'status':
      return { status: 'active', message: '', color: '#10b981', category: '' };
    default:
      return {};
  }
};

/**
 * Extracts template constraints for repositioning logic
 */
export const getTemplateConstraints = (template: TileTemplate): TemplateConstraints => {
  const { dimensions, constraints } = template;
  
  return {
    minWidth: constraints?.minWidth || dimensions.w,
    maxWidth: constraints?.maxWidth || dimensions.w,
    minHeight: constraints?.minHeight || dimensions.h,
    maxHeight: constraints?.maxHeight || dimensions.h,
    aspectRatio: constraints?.aspectRatio,
    allowResize: constraints?.allowResize || false // Templates disable resizing by default
  };
};

/**
 * Validates if a grid position is valid for a template
 */
export const validateTemplatePosition = (
  template: TileTemplate,
  position: { x: number; y: number },
  gridCols: number,
  existingItems: GridLayoutItem[]
): {
  isValid: boolean;
  reason?: string;
  suggestedPosition?: { x: number; y: number };
} => {
  const { w, h } = template.dimensions;
  
  // Check if template fits within grid bounds
  if (position.x + w > gridCols) {
    const suggestedX = Math.max(0, gridCols - w);
    return {
      isValid: false,
      reason: `Template width ${w} exceeds grid bounds at position x=${position.x}`,
      suggestedPosition: { x: suggestedX, y: position.y }
    };
  }
  
  // Check for collisions with existing items
  const hasCollision = existingItems.some(item => {
    return !(
      position.x >= item.x + item.w ||
      position.x + w <= item.x ||
      position.y >= item.y + item.h ||
      position.y + h <= item.y
    );
  });
  
  if (hasCollision) {
    // Find next available position
    const suggestedPosition = findNextAvailablePosition(
      template,
      position,
      gridCols,
      existingItems
    );
    
    return {
      isValid: false,
      reason: 'Position conflicts with existing items',
      suggestedPosition
    };
  }
  
  return { isValid: true };
};

/**
 * Finds the next available position for a template
 */
export const findNextAvailablePosition = (
  template: TileTemplate,
  preferredPosition: { x: number; y: number },
  gridCols: number,
  existingItems: GridLayoutItem[]
): { x: number; y: number } => {
  const { w, h } = template.dimensions;
  
  // Start from preferred position and search in expanding spiral
  let searchRadius = 0;
  const maxSearchRadius = Math.max(gridCols, 20);
  
  while (searchRadius <= maxSearchRadius) {
    // Search in current radius
    for (let dy = -searchRadius; dy <= searchRadius; dy++) {
      for (let dx = -searchRadius; dx <= searchRadius; dx++) {
        // Only check positions on the edge of current radius
        if (Math.abs(dx) !== searchRadius && Math.abs(dy) !== searchRadius) {
          continue;
        }
        
        const testX = Math.max(0, Math.min(preferredPosition.x + dx, gridCols - w));
        const testY = Math.max(0, preferredPosition.y + dy);
        
        const validation = validateTemplatePosition(
          template,
          { x: testX, y: testY },
          gridCols,
          existingItems
        );
        
        if (validation.isValid) {
          return { x: testX, y: testY };
        }
      }
    }
    searchRadius++;
  }
  
  // Fallback: find first available position from top-left
  for (let y = 0; y < 100; y++) {
    for (let x = 0; x <= gridCols - w; x++) {
      const validation = validateTemplatePosition(
        template,
        { x, y },
        gridCols,
        existingItems
      );
      
      if (validation.isValid) {
        return { x, y };
      }
    }
  }
  
  // Ultimate fallback
  return { x: 0, y: 0 };
};

/**
 * Updates grid layout when template changes
 */
export const updateGridItemTemplate = (
  blockData: BlockData,
  newTemplate: TileTemplate,
  currentLayout: GridLayoutItem[]
): {
  updatedGridItem: GridLayoutItem;
  updatedBlockData: BlockData;
  layoutChanged: boolean;
} => {
  const currentItem = currentLayout.find(item => item.i === blockData.id);
  if (!currentItem) {
    throw new Error(`Grid item not found for block ${blockData.id}`);
  }
  
  const dimensionsChanged = 
    currentItem.w !== newTemplate.dimensions.w ||
    currentItem.h !== newTemplate.dimensions.h;
  
  const updatedGridItem: GridLayoutItem = {
    ...currentItem,
    w: newTemplate.dimensions.w,
    h: newTemplate.dimensions.h
  };
  
  const updatedBlockData: BlockData = {
    ...blockData,
    template: newTemplate,
    updatedAt: new Date().toISOString()
  };
  
  return {
    updatedGridItem,
    updatedBlockData,
    layoutChanged: dimensionsChanged
  };
};

/**
 * Converts BlockData array to grid layout format
 */
export const convertBlocksToGridLayout = (blocks: BlockData[]): GridLayoutItem[] => {
  return blocks.map(block => ({
    i: block.id,
    x: block.position?.x || 0,
    y: block.position?.y || 0,
    w: block.template?.dimensions.w || 2,
    h: block.template?.dimensions.h || 2
  }));
};

/**
 * Converts grid layout to BlockData positions
 */
export const updateBlockPositions = (
  blocks: BlockData[],
  layout: GridLayoutItem[]
): BlockData[] => {
  const layoutMap = new Map(layout.map(item => [item.i, item]));
  
  return blocks.map(block => {
    const layoutItem = layoutMap.get(block.id);
    if (!layoutItem) return block;
    
    return {
      ...block,
      position: {
        x: layoutItem.x,
        y: layoutItem.y
      },
      updatedAt: new Date().toISOString()
    };
  });
};

/**
 * Validates entire grid layout for template constraints
 */
export const validateGridLayout = (
  blocks: BlockData[],
  layout: GridLayoutItem[],
  gridCols: number
): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  for (const block of blocks) {
    const layoutItem = layout.find(item => item.i === block.id);
    if (!layoutItem) {
      errors.push(`No layout item found for block ${block.id}`);
      continue;
    }
    
    if (!block.template) {
      errors.push(`Block ${block.id} has no template`);
      continue;
    }
    
    // Check template dimensions match layout
    if (layoutItem.w !== block.template.dimensions.w || 
        layoutItem.h !== block.template.dimensions.h) {
      warnings.push(
        `Block ${block.id} layout dimensions (${layoutItem.w}x${layoutItem.h}) ` +
        `don't match template dimensions (${block.template.dimensions.w}x${block.template.dimensions.h})`
      );
    }
    
    // Check grid bounds
    if (layoutItem.x + layoutItem.w > gridCols) {
      errors.push(`Block ${block.id} exceeds grid width`);
    }
    
    if (layoutItem.x < 0 || layoutItem.y < 0) {
      errors.push(`Block ${block.id} has negative position`);
    }
  }
  
  // Check for overlaps
  for (let i = 0; i < layout.length; i++) {
    for (let j = i + 1; j < layout.length; j++) {
      const item1 = layout[i];
      const item2 = layout[j];
      
      const overlap = !(
        item1.x >= item2.x + item2.w ||
        item1.x + item1.w <= item2.x ||
        item1.y >= item2.y + item2.h ||
        item1.y + item1.h <= item2.y
      );
      
      if (overlap) {
        errors.push(`Blocks ${item1.i} and ${item2.i} overlap`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};