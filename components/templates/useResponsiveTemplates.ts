/**
 * React Hook for Responsive Template Scaling
 * 
 * This hook provides reactive responsive template scaling that automatically
 * updates when screen size changes, ensuring templates maintain proper
 * proportions and aspect ratios across all breakpoints.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  TileTemplate, 
  TemplateDimensions, 
  TemplateAwareTileData 
} from './types';
import {
  EnhancedBreakpoint,
  detectBreakpoint,
  calculateResponsiveTemplateDimensions,
  getResponsiveGridConfiguration,
  calculateColumnWidth,
  validateResponsiveDimensions,
  exportResponsiveScalingState
} from './responsive';

// Hook return type
export interface UseResponsiveTemplatesReturn {
  // Current responsive state
  screenWidth: number;
  currentBreakpoint: EnhancedBreakpoint;
  columnWidth: number;
  
  // Template scaling functions
  getResponsiveDimensions: (template: TileTemplate) => TemplateDimensions;
  scaleTemplate: (template: TileTemplate, targetWidth?: number) => TemplateDimensions;
  validateDimensions: (dimensions: TemplateDimensions) => { isValid: boolean; errors: string[] };
  
  // Layout utilities
  getGridConfig: () => EnhancedBreakpoint;
  isBreakpoint: (breakpointName: string) => boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  
  // Debug utilities
  debugInfo: ReturnType<typeof exportResponsiveScalingState>;
}

// Hook options
export interface UseResponsiveTemplatesOptions {
  // Custom breakpoint detection
  customBreakpoints?: EnhancedBreakpoint[];
  
  // Debounce resize events (ms)
  debounceMs?: number;
  
  // Container padding for column width calculations
  containerPadding?: number;
  
  // Enable debug mode
  debug?: boolean;
  
  // Initial screen width (for SSR)
  initialWidth?: number;
}

/**
 * Custom hook for responsive template scaling
 * 
 * Provides reactive responsive behavior for templates, automatically updating
 * dimensions and configurations when screen size changes.
 */
export function useResponsiveTemplates(
  options: UseResponsiveTemplatesOptions = {}
): UseResponsiveTemplatesReturn {
  const {
    debounceMs = 150,
    containerPadding = 0,
    debug = false,
    initialWidth = 1200
  } = options;
  
  // State for current screen dimensions
  const [screenWidth, setScreenWidth] = useState(() => {
    // Use initial width for SSR or when window is not available
    if (typeof window === 'undefined') {
      return initialWidth;
    }
    // In browser, use window width or fall back to initial width
    return window.innerWidth || initialWidth;
  });
  const [isClient, setIsClient] = useState(false);
  
  // Detect current breakpoint
  const currentBreakpoint = useMemo(() => {
    return detectBreakpoint(screenWidth);
  }, [screenWidth]);
  
  // Calculate column width
  const columnWidth = useMemo(() => {
    return calculateColumnWidth(screenWidth, currentBreakpoint, containerPadding);
  }, [screenWidth, currentBreakpoint, containerPadding]);
  
  // Debounced resize handler
  const handleResize = useCallback(() => {
    if (typeof window !== 'undefined') {
      setScreenWidth(window.innerWidth);
    }
  }, []);
  
  // Set up resize listener with debouncing
  useEffect(() => {
    setIsClient(true);
    
    if (typeof window === 'undefined') {
      // SSR environment - use initial width
      setScreenWidth(initialWidth);
      return;
    }
    
    // Set initial width from window or use provided initial width
    const currentWidth = window.innerWidth || initialWidth;
    setScreenWidth(currentWidth);
    
    // Debounced resize handler
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, debounceMs);
    };
    
    window.addEventListener('resize', debouncedResize);
    
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [handleResize, debounceMs, initialWidth]);
  
  // Template scaling functions
  const getResponsiveDimensions = useCallback((template: TileTemplate): TemplateDimensions => {
    return calculateResponsiveTemplateDimensions(template, screenWidth);
  }, [screenWidth]);
  
  const scaleTemplate = useCallback((
    template: TileTemplate, 
    targetWidth?: number
  ): TemplateDimensions => {
    const width = targetWidth || screenWidth;
    return calculateResponsiveTemplateDimensions(template, width);
  }, [screenWidth]);
  
  const validateDimensions = useCallback((dimensions: TemplateDimensions) => {
    return validateResponsiveDimensions(dimensions, currentBreakpoint);
  }, [currentBreakpoint]);
  
  // Layout utilities
  const getGridConfig = useCallback(() => {
    return getResponsiveGridConfiguration(screenWidth);
  }, [screenWidth]);
  
  const isBreakpoint = useCallback((breakpointName: string) => {
    return currentBreakpoint.name === breakpointName;
  }, [currentBreakpoint]);
  
  // Convenience breakpoint checks
  const isMobile = useMemo(() => {
    return currentBreakpoint.name === 'xs' || currentBreakpoint.name === 'sm';
  }, [currentBreakpoint]);
  
  const isTablet = useMemo(() => {
    return currentBreakpoint.name === 'md' || currentBreakpoint.name === 'lg';
  }, [currentBreakpoint]);
  
  const isDesktop = useMemo(() => {
    return currentBreakpoint.name === 'xl' || currentBreakpoint.name === 'xxl';
  }, [currentBreakpoint]);
  
  // Debug information
  const debugInfo = useMemo(() => {
    if (!debug) return {} as ReturnType<typeof exportResponsiveScalingState>;
    return exportResponsiveScalingState(screenWidth);
  }, [screenWidth, debug]);
  
  // Log debug information when enabled
  useEffect(() => {
    if (debug && isClient) {
      console.log('🎯 Responsive Templates Debug:', {
        screenWidth,
        breakpoint: currentBreakpoint.name,
        columnWidth: Math.round(columnWidth),
        gridCols: currentBreakpoint.cols,
        scaleFactor: currentBreakpoint.scaleFactor
      });
    }
  }, [debug, isClient, screenWidth, currentBreakpoint, columnWidth]);
  
  return {
    // Current responsive state
    screenWidth,
    currentBreakpoint,
    columnWidth,
    
    // Template scaling functions
    getResponsiveDimensions,
    scaleTemplate,
    validateDimensions,
    
    // Layout utilities
    getGridConfig,
    isBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    
    // Debug utilities
    debugInfo
  };
}

/**
 * Hook for scaling multiple templates at once
 * Useful for batch operations or layout calculations
 */
export function useResponsiveTemplatesBatch(
  templates: TileTemplate[],
  options: UseResponsiveTemplatesOptions = {}
) {
  const responsive = useResponsiveTemplates(options);
  
  const scaledTemplates = useMemo(() => {
    return templates.map(template => ({
      template,
      dimensions: responsive.getResponsiveDimensions(template),
      isValid: responsive.validateDimensions(
        responsive.getResponsiveDimensions(template)
      ).isValid
    }));
  }, [templates, responsive]);
  
  return {
    ...responsive,
    scaledTemplates
  };
}

/**
 * Hook for responsive tile data with template scaling
 * Automatically applies responsive scaling to tile data
 */
export function useResponsiveTileData(
  tiles: TemplateAwareTileData[],
  options: UseResponsiveTemplatesOptions = {}
) {
  const responsive = useResponsiveTemplates(options);
  
  const responsiveTiles = useMemo(() => {
    return tiles.map(tile => {
      // Create a template object from tile template data
      const template: TileTemplate = {
        id: tile.template.id,
        name: tile.template.id, // Fallback name
        category: tile.template.category,
        dimensions: tile.template.dimensions,
        aspectRatio: tile.template.dimensions.w / tile.template.dimensions.h,
        allowedTileTypes: [tile.type],
        responsiveScaling: {
          breakpoints: {
            mobile: { minWidth: 0, maxWidth: 768, scaleFactor: 0.8 },
            tablet: { minWidth: 769, maxWidth: 1024, scaleFactor: 0.9 },
            desktop: { minWidth: 1025, maxWidth: Infinity, scaleFactor: 1.0 }
          }
        }
      };
      
      const responsiveDimensions = responsive.getResponsiveDimensions(template);
      
      return {
        ...tile,
        position: {
          ...tile.position,
          w: responsiveDimensions.w,
          h: responsiveDimensions.h
        },
        responsiveDimensions,
        isValidForBreakpoint: responsive.validateDimensions(responsiveDimensions).isValid
      };
    });
  }, [tiles, responsive]);
  
  return {
    ...responsive,
    responsiveTiles
  };
}