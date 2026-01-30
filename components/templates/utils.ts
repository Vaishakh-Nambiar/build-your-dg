/**
 * Template System Utilities
 * 
 * This file provides utility functions for working with templates,
 * including responsive scaling, legacy migration, and template selection.
 */

import { 
  TileTemplate, 
  TemplateDimensions, 
  ResponsiveConfig, 
  LegacyTileData,
  TemplateAwareTileData,
  MigrationMapping,
  ScalingRule
} from './types';
import { BlockType } from '../Block';
import { 
  ALL_TEMPLATES, 
  TEMPLATES_BY_ID, 
  DEFAULT_TEMPLATES_BY_TILE_TYPE, 
  LEGACY_SIZE_MAPPING,
  RESPONSIVE_BREAKPOINTS
} from './definitions';
import { getTemplatesForTileType, validateTemplateForTileType } from './validation';
import { 
  calculateResponsiveTemplateDimensions,
  preserveAspectRatio,
  detectBreakpoint
} from './responsive';
import React from 'react';

/**
 * Gets the default template for a given tile type
 */
export function getDefaultTemplateForTileType(tileType: BlockType): TileTemplate | null {
  const defaultTemplateId = DEFAULT_TEMPLATES_BY_TILE_TYPE[tileType];
  return TEMPLATES_BY_ID[defaultTemplateId] || null;
}

/**
 * Calculates responsive dimensions based on screen width and template
 * Requirements 1.6: Templates maintain aspect ratios across breakpoints
 * 
 * @deprecated Use calculateResponsiveTemplateDimensions from responsive.ts for enhanced scaling
 */
export function calculateResponsiveDimensions(
  template: TileTemplate,
  screenWidth: number
): TemplateDimensions {
  const { responsiveScaling } = template;
  let scalingRule: ScalingRule;

  // Determine which breakpoint applies
  if (screenWidth <= RESPONSIVE_BREAKPOINTS.mobile.maxWidth) {
    scalingRule = responsiveScaling.breakpoints.mobile;
  } else if (screenWidth <= RESPONSIVE_BREAKPOINTS.tablet.maxWidth) {
    scalingRule = responsiveScaling.breakpoints.tablet;
  } else {
    scalingRule = responsiveScaling.breakpoints.desktop;
  }

  // Apply scaling while maintaining aspect ratio
  const scaledWidth = Math.round(template.dimensions.w * scalingRule.scaleFactor);
  const scaledHeight = Math.round(template.dimensions.h * scalingRule.scaleFactor);

  // Ensure minimum dimensions
  return {
    w: Math.max(1, scaledWidth),
    h: Math.max(1, scaledHeight),
  };
}

/**
 * Gets the appropriate grid configuration for current screen width
 */
export function getResponsiveGridConfig(screenWidth: number) {
  if (screenWidth <= RESPONSIVE_BREAKPOINTS.mobile.maxWidth) {
    return RESPONSIVE_BREAKPOINTS.mobile;
  } else if (screenWidth <= RESPONSIVE_BREAKPOINTS.tablet.maxWidth) {
    return RESPONSIVE_BREAKPOINTS.tablet;
  } else {
    return RESPONSIVE_BREAKPOINTS.desktop;
  }
}

/**
 * Enhanced responsive dimensions calculation with aspect ratio preservation
 * Requirements 5.1, 5.2: Proportional scaling and breakpoint-specific rules
 */
export function calculateEnhancedResponsiveDimensions(
  template: TileTemplate,
  screenWidth: number
): TemplateDimensions {
  return calculateResponsiveTemplateDimensions(template, screenWidth);
}

/**
 * Ensures template dimensions maintain aspect ratio across screen sizes
 * Requirements 5.1: Ensure aspect ratio preservation across screen sizes
 */
export function ensureAspectRatioPreservation(
  template: TileTemplate,
  targetDimensions: TemplateDimensions,
  screenWidth: number
): TemplateDimensions {
  const breakpoint = detectBreakpoint(screenWidth);
  return preserveAspectRatio(template, targetDimensions, breakpoint);
}

/**
 * Migrates legacy tile data to template-aware format
 * Requirements 7.2, 7.3: Map legacy sizes to templates while preserving content
 */
export function migrateLegacyTile(legacyTile: LegacyTileData): TemplateAwareTileData | null {
  const sizeKey = `${legacyTile.w}x${legacyTile.h}`;
  const templateId = LEGACY_SIZE_MAPPING[sizeKey];

  if (!templateId) {
    // Try to find the closest matching template
    const closestTemplate = findClosestTemplate(legacyTile.w, legacyTile.h, legacyTile.type);
    if (!closestTemplate) {
      console.warn(`No template found for legacy tile size ${sizeKey}`);
      return null;
    }

    return createTemplateAwareTile(legacyTile, closestTemplate);
  }

  const template = TEMPLATES_BY_ID[templateId];
  if (!template) {
    console.warn(`Template ${templateId} not found for legacy migration`);
    return null;
  }

  // Validate template compatibility with tile type
  const validation = validateTemplateForTileType(template, legacyTile.type);
  if (!validation.isValid) {
    // Find an alternative template
    const alternativeTemplate = findAlternativeTemplate(legacyTile.type, template.dimensions);
    if (!alternativeTemplate) {
      console.warn(`No compatible template found for legacy tile type ${legacyTile.type}`);
      return null;
    }
    return createTemplateAwareTile(legacyTile, alternativeTemplate);
  }

  return createTemplateAwareTile(legacyTile, template);
}

/**
 * Creates a template-aware tile from legacy data and template
 */
function createTemplateAwareTile(
  legacyTile: LegacyTileData, 
  template: TileTemplate
): TemplateAwareTileData {
  const { id, type, x, y, ...content } = legacyTile;

  return {
    id,
    type,
    content,
    position: {
      x,
      y,
      w: template.dimensions.w,
      h: template.dimensions.h,
    },
    template: {
      id: template.id,
      category: template.category,
      dimensions: template.dimensions,
    },
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0',
      migrationSource: 'legacy',
    },
  };
}

/**
 * Finds the closest matching template for given dimensions and tile type
 */
function findClosestTemplate(
  width: number, 
  height: number, 
  tileType: BlockType
): TileTemplate | null {
  const availableTemplates = getTemplatesForTileType(tileType);
  
  if (availableTemplates.length === 0) {
    return null;
  }

  let closestTemplate = availableTemplates[0];
  let closestDistance = calculateDimensionDistance(
    { w: width, h: height }, 
    closestTemplate.dimensions
  );

  for (const template of availableTemplates.slice(1)) {
    const distance = calculateDimensionDistance(
      { w: width, h: height }, 
      template.dimensions
    );
    
    if (distance < closestDistance) {
      closestDistance = distance;
      closestTemplate = template;
    }
  }

  return closestTemplate;
}

/**
 * Finds an alternative template when the preferred one is incompatible
 */
function findAlternativeTemplate(
  tileType: BlockType, 
  preferredDimensions: TemplateDimensions
): TileTemplate | null {
  const availableTemplates = getTemplatesForTileType(tileType);
  
  // Try to find a template with similar dimensions
  return findClosestTemplate(
    preferredDimensions.w, 
    preferredDimensions.h, 
    tileType
  );
}

/**
 * Calculates the distance between two dimension sets
 */
function calculateDimensionDistance(
  dim1: TemplateDimensions, 
  dim2: TemplateDimensions
): number {
  const widthDiff = Math.abs(dim1.w - dim2.w);
  const heightDiff = Math.abs(dim1.h - dim2.h);
  return Math.sqrt(widthDiff * widthDiff + heightDiff * heightDiff);
}

/**
 * Generates migration mappings for all legacy sizes
 */
export function generateMigrationMappings(): MigrationMapping[] {
  const mappings: MigrationMapping[] = [];

  for (const [legacySize, templateId] of Object.entries(LEGACY_SIZE_MAPPING)) {
    const template = TEMPLATES_BY_ID[templateId];
    if (template) {
      mappings.push({
        legacySize,
        templateId,
        confidence: 1.0, // Direct mappings have full confidence
      });
    }
  }

  return mappings;
}

/**
 * Validates that a template can be placed at a specific position in the grid
 */
export function canPlaceTemplateAt(
  template: TileTemplate,
  x: number,
  y: number,
  existingTiles: TemplateAwareTileData[],
  gridCols: number = 12
): boolean {
  // Check if template fits within grid bounds
  if (x + template.dimensions.w > gridCols) {
    return false;
  }

  if (x < 0 || y < 0) {
    return false;
  }

  // Check for collisions with existing tiles
  for (const tile of existingTiles) {
    if (tilesOverlap(
      { x, y, w: template.dimensions.w, h: template.dimensions.h },
      tile.position
    )) {
      return false;
    }
  }

  return true;
}

/**
 * Checks if two tile positions overlap
 */
function tilesOverlap(
  tile1: { x: number; y: number; w: number; h: number },
  tile2: { x: number; y: number; w: number; h: number }
): boolean {
  return !(
    tile1.x + tile1.w <= tile2.x ||
    tile2.x + tile2.w <= tile1.x ||
    tile1.y + tile1.h <= tile2.y ||
    tile2.y + tile2.h <= tile1.y
  );
}

/**
 * Finds the first available position for a template in the grid
 */
export function findFirstAvailablePosition(
  template: TileTemplate,
  existingTiles: TemplateAwareTileData[],
  gridCols: number = 12
): { x: number; y: number } | null {
  // Try positions row by row
  for (let y = 0; y < 1000; y++) { // Reasonable upper limit
    for (let x = 0; x <= gridCols - template.dimensions.w; x++) {
      if (canPlaceTemplateAt(template, x, y, existingTiles, gridCols)) {
        return { x, y };
      }
    }
  }

  return null; // No available position found
}

/**
 * Gets CSS classes for circle template styling
 * Requirements 5.5: Circle templates maintain circular appearance
 */
export function getCircleTemplateStyles(template: TileTemplate): string {
  if (template.category !== 'circle') {
    return '';
  }

  // Return CSS classes that ensure circular appearance across all screen sizes
  return 'rounded-full overflow-hidden aspect-square';
}

/**
 * Gets comprehensive CSS properties for circle template shape preservation
 * Requirements 5.5: Add CSS properties for maintaining circular appearance
 * Requirements 5.2: Implement responsive circle scaling
 */
export function getCircleTemplateProperties(template: TileTemplate, screenWidth?: number): {
  className: string;
  style: React.CSSProperties;
} {
  if (template.category !== 'circle') {
    return {
      className: '',
      style: {}
    };
  }

  // Base CSS classes for circular appearance
  const baseClasses = 'rounded-full overflow-hidden aspect-square';
  
  // Additional responsive classes for better circle preservation
  const responsiveClasses = 'flex-shrink-0 relative';
  
  // Combine all classes
  const className = `${baseClasses} ${responsiveClasses}`;

  // CSS properties for enhanced circle preservation
  const style: React.CSSProperties = {
    // Ensure perfect square aspect ratio
    aspectRatio: '1 / 1',
    
    // Force circular shape with border-radius
    borderRadius: '50%',
    
    // Prevent content from breaking the circular shape
    overflow: 'hidden',
    
    // Ensure consistent sizing behavior
    boxSizing: 'border-box',
    
    // Prevent flex shrinking that could distort the circle
    flexShrink: 0,
    
    // Ensure proper positioning context for child elements
    position: 'relative',
    
    // Smooth transitions for responsive changes
    transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
  };

  // Add responsive-specific properties if screen width is provided
  if (screenWidth) {
    const breakpoint = detectBreakpoint(screenWidth);
    
    // Adjust minimum size based on breakpoint to maintain visibility
    if (breakpoint.name === 'xs' || breakpoint.name === 'sm') {
      style.minWidth = '60px';
      style.minHeight = '60px';
    } else if (breakpoint.name === 'md') {
      style.minWidth = '80px';
      style.minHeight = '80px';
    } else {
      style.minWidth = '100px';
      style.minHeight = '100px';
    }
    
    // Ensure maximum size doesn't break layout
    const maxSize = Math.min(breakpoint.cols * 100, 400); // Reasonable maximum
    style.maxWidth = `${maxSize}px`;
    style.maxHeight = `${maxSize}px`;
  }

  return { className, style };
}

/**
 * Creates responsive circle template CSS for different breakpoints
 * Requirements 5.2: Implement responsive circle scaling
 */
export function createResponsiveCircleCSS(template: TileTemplate): string {
  if (template.category !== 'circle') {
    return '';
  }

  // Generate CSS custom properties for responsive scaling
  const cssVariables = [
    '--circle-size-xs: clamp(60px, 15vw, 120px)',
    '--circle-size-sm: clamp(80px, 12vw, 150px)', 
    '--circle-size-md: clamp(100px, 10vw, 200px)',
    '--circle-size-lg: clamp(120px, 8vw, 250px)',
    '--circle-size-xl: clamp(150px, 6vw, 300px)',
  ].join('; ');

  return cssVariables;
}

/**
 * Gets circle template container styles for grid layout integration
 * Requirements 5.5: Circle templates maintain their circular appearance at all sizes
 */
export function getCircleContainerStyles(template: TileTemplate, gridDimensions: TemplateDimensions): {
  className: string;
  style: React.CSSProperties;
} {
  if (template.category !== 'circle') {
    return {
      className: '',
      style: {}
    };
  }

  // Container should maintain square aspect ratio for the circle
  const className = 'flex items-center justify-center';
  
  const style: React.CSSProperties = {
    // Ensure the container is square
    aspectRatio: '1 / 1',
    
    // Center the circular content
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    
    // Ensure proper sizing based on grid dimensions
    width: '100%',
    height: '100%',
    
    // Maintain minimum viable size
    minWidth: '60px',
    minHeight: '60px',
  };

  return { className, style };
}

/**
 * Calculates the optimal font size for a template based on its dimensions
 */
export function calculateOptimalFontSize(template: TileTemplate): {
  title: string;
  content: string;
  category: string;
} {
  const area = template.dimensions.w * template.dimensions.h;
  
  // Base font sizes that scale with template area
  if (area <= 1) { // 1x1
    return {
      title: 'text-xs',
      content: 'text-xs',
      category: 'text-[8px]',
    };
  } else if (area <= 4) { // 2x2 or smaller rectangles
    return {
      title: 'text-sm',
      content: 'text-sm',
      category: 'text-[9px]',
    };
  } else if (area <= 9) { // 3x3 or medium rectangles
    return {
      title: 'text-base',
      content: 'text-sm',
      category: 'text-[10px]',
    };
  } else { // Large templates
    return {
      title: 'text-lg',
      content: 'text-base',
      category: 'text-xs',
    };
  }
}

/**
 * Exports template system state for debugging
 */
export function exportTemplateSystemState() {
  return {
    totalTemplates: ALL_TEMPLATES.length,
    templatesByCategory: {
      square: ALL_TEMPLATES.filter(t => t.category === 'square').length,
      rectangle: ALL_TEMPLATES.filter(t => t.category === 'rectangle').length,
      circle: ALL_TEMPLATES.filter(t => t.category === 'circle').length,
    },
    legacyMappings: Object.keys(LEGACY_SIZE_MAPPING).length,
    responsiveBreakpoints: RESPONSIVE_BREAKPOINTS,
  };
}