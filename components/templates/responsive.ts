/**
 * Responsive Template Scaling Logic
 * 
 * This file implements enhanced responsive template scaling that ensures templates
 * scale proportionally across different screen sizes while maintaining aspect ratios.
 * 
 * Requirements 5.1, 5.2: Proportional scaling calculations and breakpoint-specific scaling rules
 */

import { 
  TileTemplate, 
  TemplateDimensions, 
  ResponsiveConfig, 
  ScalingRule,
  ResponsiveBreakpoints 
} from './types';
import { RESPONSIVE_BREAKPOINTS } from './definitions';

// Enhanced breakpoint detection with more granular control
export interface EnhancedBreakpoint {
  name: string;
  minWidth: number;
  maxWidth: number;
  cols: number;
  rowHeight: number;
  margin: [number, number];
  scaleFactor: number;
  priority: number; // Higher priority takes precedence
}

// Enhanced responsive breakpoints with more granular scaling
export const ENHANCED_BREAKPOINTS: EnhancedBreakpoint[] = [
  {
    name: 'xs',
    minWidth: 0,
    maxWidth: 575,
    cols: 4,
    rowHeight: 60,
    margin: [8, 8],
    scaleFactor: 0.7,
    priority: 1
  },
  {
    name: 'sm',
    minWidth: 576,
    maxWidth: 767,
    cols: 6,
    rowHeight: 70,
    margin: [10, 10],
    scaleFactor: 0.75,
    priority: 2
  },
  {
    name: 'md',
    minWidth: 768,
    maxWidth: 991,
    cols: 8,
    rowHeight: 80,
    margin: [12, 12],
    scaleFactor: 0.85,
    priority: 3
  },
  {
    name: 'lg',
    minWidth: 992,
    maxWidth: 1199,
    cols: 10,
    rowHeight: 90,
    margin: [14, 14],
    scaleFactor: 0.9,
    priority: 4
  },
  {
    name: 'xl',
    minWidth: 1200,
    maxWidth: 1399,
    cols: 12,
    rowHeight: 100,
    margin: [16, 16],
    scaleFactor: 1.0,
    priority: 5
  },
  {
    name: 'xxl',
    minWidth: 1400,
    maxWidth: Infinity,
    cols: 12,
    rowHeight: 100,
    margin: [16, 16],
    scaleFactor: 1.0,
    priority: 6
  }
];

/**
 * Detects the current breakpoint based on screen width
 */
export function detectBreakpoint(screenWidth: number): EnhancedBreakpoint {
  // Find the breakpoint that matches the screen width
  const matchingBreakpoint = ENHANCED_BREAKPOINTS.find(bp => 
    screenWidth >= bp.minWidth && screenWidth <= bp.maxWidth
  );
  
  // Fallback to desktop if no match found
  return matchingBreakpoint || ENHANCED_BREAKPOINTS.find(bp => bp.name === 'xl')!;
}

/**
 * Calculates proportional scaling for a template based on screen width
 * Requirements 5.1: Implement proportional scaling calculations
 */
export function calculateProportionalScaling(
  template: TileTemplate,
  screenWidth: number,
  targetBreakpoint?: EnhancedBreakpoint
): TemplateDimensions {
  const breakpoint = targetBreakpoint || detectBreakpoint(screenWidth);
  const { scaleFactor } = breakpoint;
  
  // Apply proportional scaling while maintaining aspect ratio
  const scaledWidth = Math.round(template.dimensions.w * scaleFactor);
  const scaledHeight = Math.round(template.dimensions.h * scaleFactor);
  
  // Ensure minimum viable dimensions
  const minWidth = Math.max(1, Math.ceil(template.dimensions.w * 0.5)); // Never smaller than 50% of original
  const minHeight = Math.max(1, Math.ceil(template.dimensions.h * 0.5));
  
  // Ensure maximum dimensions don't exceed grid columns
  const maxWidth = Math.min(breakpoint.cols, template.dimensions.w);
  const maxHeight = template.dimensions.h; // Height can grow as needed
  
  // Apply all constraints
  const constrainedWidth = Math.max(minWidth, Math.min(maxWidth, scaledWidth));
  const constrainedHeight = Math.max(minHeight, Math.min(maxHeight, scaledHeight));
  
  // Final column constraint check
  return {
    w: Math.min(breakpoint.cols, constrainedWidth),
    h: constrainedHeight
  };
}

/**
 * Applies breakpoint-specific scaling rules with intelligent fallbacks
 * Requirements 5.2: Add breakpoint-specific scaling rules
 */
export function applyBreakpointScaling(
  template: TileTemplate,
  breakpoint: EnhancedBreakpoint
): TemplateDimensions {
  // Get the template's responsive configuration
  const { responsiveScaling } = template;
  
  // Map enhanced breakpoint to template breakpoint
  let templateScalingRule: ScalingRule;
  
  switch (breakpoint.name) {
    case 'xs':
    case 'sm':
      templateScalingRule = responsiveScaling.breakpoints.mobile;
      break;
    case 'md':
    case 'lg':
      templateScalingRule = responsiveScaling.breakpoints.tablet;
      break;
    case 'xl':
    case 'xxl':
    default:
      templateScalingRule = responsiveScaling.breakpoints.desktop;
      break;
  }
  
  // Combine template scaling rule with breakpoint scaling
  const combinedScaleFactor = templateScalingRule.scaleFactor * breakpoint.scaleFactor;
  
  // Apply intelligent scaling based on template category
  return applyIntelligentScaling(template, combinedScaleFactor, breakpoint);
}

/**
 * Applies intelligent scaling based on template category and content type
 */
function applyIntelligentScaling(
  template: TileTemplate,
  scaleFactor: number,
  breakpoint: EnhancedBreakpoint
): TemplateDimensions {
  const { category, dimensions } = template;
  
  let scaledW: number;
  let scaledH: number;
  
  switch (category) {
    case 'square':
      // Squares maintain aspect ratio strictly
      const squareScale = Math.round(Math.min(dimensions.w, dimensions.h) * scaleFactor);
      scaledW = Math.max(1, Math.min(breakpoint.cols, squareScale));
      scaledH = scaledW; // Perfect square
      break;
      
    case 'rectangle':
      // Rectangles scale proportionally but may adjust for readability
      scaledW = Math.round(dimensions.w * scaleFactor);
      scaledH = Math.round(dimensions.h * scaleFactor);
      
      // Apply column constraints first
      scaledW = Math.max(1, Math.min(breakpoint.cols, scaledW));
      scaledH = Math.max(1, scaledH);
      
      // Ensure rectangles remain readable on small screens
      if (breakpoint.name === 'xs' || breakpoint.name === 'sm') {
        // On mobile, prefer taller rectangles for better content visibility
        scaledH = Math.max(scaledH, 2);
      }
      break;
      
    case 'circle':
      // Circles need square containers to maintain circular appearance
      const circleScale = Math.round(Math.min(dimensions.w, dimensions.h) * scaleFactor);
      scaledW = Math.max(1, Math.min(breakpoint.cols, circleScale));
      scaledH = scaledW; // Perfect square container for circle
      break;
      
    default:
      // Fallback to basic proportional scaling
      scaledW = Math.round(dimensions.w * scaleFactor);
      scaledH = Math.round(dimensions.h * scaleFactor);
      break;
  }
  
  // Apply final constraints
  return {
    w: Math.max(1, Math.min(breakpoint.cols, scaledW)),
    h: Math.max(1, scaledH)
  };
}

/**
 * Ensures aspect ratio preservation across screen sizes
 * Requirements 5.1: Ensure aspect ratio preservation across screen sizes
 */
export function preserveAspectRatio(
  template: TileTemplate,
  targetDimensions: TemplateDimensions,
  breakpoint: EnhancedBreakpoint
): TemplateDimensions {
  const originalAspectRatio = template.aspectRatio;
  const targetAspectRatio = targetDimensions.w / targetDimensions.h;
  
  // If aspect ratios are close enough, return as-is (but still apply constraints)
  const aspectRatioTolerance = 0.1;
  if (Math.abs(originalAspectRatio - targetAspectRatio) <= aspectRatioTolerance) {
    return {
      w: Math.max(1, Math.min(breakpoint.cols, targetDimensions.w)),
      h: Math.max(1, targetDimensions.h)
    };
  }
  
  // Adjust dimensions to preserve aspect ratio
  let adjustedW = targetDimensions.w;
  let adjustedH = targetDimensions.h;
  
  if (targetAspectRatio > originalAspectRatio) {
    // Target is too wide, reduce width
    adjustedW = Math.round(targetDimensions.h * originalAspectRatio);
  } else {
    // Target is too tall, reduce height
    adjustedH = Math.round(targetDimensions.w / originalAspectRatio);
  }
  
  // Ensure we don't go below minimum dimensions and respect column constraints
  adjustedW = Math.max(1, Math.min(breakpoint.cols, adjustedW));
  adjustedH = Math.max(1, adjustedH);
  
  // If we hit column constraints, we may need to adjust height to maintain aspect ratio
  if (adjustedW === breakpoint.cols && adjustedW < targetDimensions.w) {
    // Width was constrained, adjust height accordingly
    adjustedH = Math.max(1, Math.round(adjustedW / originalAspectRatio));
  }
  
  return { w: adjustedW, h: adjustedH };
}

/**
 * Calculates responsive dimensions with full scaling logic
 * This is the main function that combines all scaling strategies
 */
export function calculateResponsiveTemplateDimensions(
  template: TileTemplate,
  screenWidth: number
): TemplateDimensions {
  // 1. Detect current breakpoint
  const breakpoint = detectBreakpoint(screenWidth);
  
  // 2. Apply breakpoint-specific scaling
  const scaledDimensions = applyBreakpointScaling(template, breakpoint);
  
  // 3. Preserve aspect ratio
  const finalDimensions = preserveAspectRatio(template, scaledDimensions, breakpoint);
  
  return finalDimensions;
}

/**
 * Gets responsive grid configuration for a given screen width
 */
export function getResponsiveGridConfiguration(screenWidth: number): EnhancedBreakpoint {
  return detectBreakpoint(screenWidth);
}

/**
 * Calculates the optimal column width for a given screen width and breakpoint
 */
export function calculateColumnWidth(
  screenWidth: number,
  breakpoint: EnhancedBreakpoint,
  containerPadding: number = 0
): number {
  const availableWidth = screenWidth - (containerPadding * 2);
  const totalMarginWidth = (breakpoint.cols - 1) * breakpoint.margin[0];
  const columnWidth = (availableWidth - totalMarginWidth) / breakpoint.cols;
  
  return Math.max(0, columnWidth);
}

/**
 * Validates that responsive dimensions are valid for the target breakpoint
 */
export function validateResponsiveDimensions(
  dimensions: TemplateDimensions,
  breakpoint: EnhancedBreakpoint
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check width constraints
  if (dimensions.w < 1) {
    errors.push('Width must be at least 1 grid unit');
  }
  
  if (dimensions.w > breakpoint.cols) {
    errors.push(`Width cannot exceed ${breakpoint.cols} columns for ${breakpoint.name} breakpoint`);
  }
  
  // Check height constraints
  if (dimensions.h < 1) {
    errors.push('Height must be at least 1 grid unit');
  }
  
  // Check for reasonable maximum height (prevent extremely tall tiles)
  if (dimensions.h > 10) {
    errors.push('Height should not exceed 10 grid units for optimal user experience');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Creates a responsive scaling configuration for a template
 */
export function createResponsiveConfig(
  mobileScale: number = 0.8,
  tabletScale: number = 0.9,
  desktopScale: number = 1.0
): ResponsiveConfig {
  return {
    breakpoints: {
      mobile: {
        minWidth: 0,
        maxWidth: 768,
        scaleFactor: mobileScale
      },
      tablet: {
        minWidth: 769,
        maxWidth: 1024,
        scaleFactor: tabletScale
      },
      desktop: {
        minWidth: 1025,
        maxWidth: Infinity,
        scaleFactor: desktopScale
      }
    }
  };
}

/**
 * Exports responsive scaling state for debugging
 */
export function exportResponsiveScalingState(screenWidth: number) {
  const breakpoint = detectBreakpoint(screenWidth);
  
  return {
    screenWidth,
    currentBreakpoint: breakpoint.name,
    breakpointConfig: breakpoint,
    availableBreakpoints: ENHANCED_BREAKPOINTS.map(bp => ({
      name: bp.name,
      range: `${bp.minWidth}-${bp.maxWidth === Infinity ? '∞' : bp.maxWidth}px`,
      cols: bp.cols,
      scaleFactor: bp.scaleFactor
    }))
  };
}