/**
 * Template Styling Hook
 * 
 * This hook provides template-aware styling for tiles, with special handling
 * for circle templates to maintain their circular appearance across all screen sizes.
 * 
 * Requirements 5.5: Circle templates maintain their circular appearance at all sizes
 * Requirements 5.2: Implement responsive circle scaling
 */

import { useMemo, useEffect, useState } from 'react';
import { TileTemplate, TemplateDimensions } from './types';
import { 
  getCircleTemplateProperties, 
  getCircleContainerStyles,
  createResponsiveCircleCSS 
} from './utils';
import { detectBreakpoint, calculateResponsiveTemplateDimensions } from './responsive';

interface UseTemplateStylesOptions {
  template: TileTemplate;
  gridDimensions?: TemplateDimensions;
  enableResponsive?: boolean;
}

interface TemplateStylesResult {
  containerClassName: string;
  containerStyle: React.CSSProperties;
  contentClassName: string;
  contentStyle: React.CSSProperties;
  responsiveCSS: string;
  isCircle: boolean;
  responsiveDimensions: TemplateDimensions;
}

/**
 * Hook for applying template-aware styling with responsive circle preservation
 */
export function useTemplateStyles({
  template,
  gridDimensions,
  enableResponsive = true
}: UseTemplateStylesOptions): TemplateStylesResult {
  const [screenWidth, setScreenWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  // Update screen width on resize
  useEffect(() => {
    if (!enableResponsive || typeof window === 'undefined') return;

    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [enableResponsive]);

  // Calculate responsive dimensions
  const responsiveDimensions = useMemo(() => {
    if (!enableResponsive) return template.dimensions;
    return calculateResponsiveTemplateDimensions(template, screenWidth);
  }, [template, screenWidth, enableResponsive]);

  // Generate template-specific styles
  const templateStyles = useMemo(() => {
    const isCircle = template.category === 'circle';
    
    if (isCircle) {
      // Circle-specific styling
      const circleProps = getCircleTemplateProperties(template, screenWidth);
      const containerProps = getCircleContainerStyles(template, responsiveDimensions);
      const responsiveCSS = createResponsiveCircleCSS(template);

      return {
        containerClassName: containerProps.className,
        containerStyle: containerProps.style,
        contentClassName: circleProps.className,
        contentStyle: circleProps.style,
        responsiveCSS,
        isCircle: true,
        responsiveDimensions
      };
    } else {
      // Standard template styling
      return {
        containerClassName: '',
        containerStyle: {},
        contentClassName: '',
        contentStyle: {},
        responsiveCSS: '',
        isCircle: false,
        responsiveDimensions
      };
    }
  }, [template, screenWidth, responsiveDimensions]);

  return templateStyles;
}

/**
 * Hook for getting circle-specific CSS custom properties
 */
export function useCircleTemplateCSS(template: TileTemplate): string {
  return useMemo(() => {
    if (template.category !== 'circle') return '';
    return createResponsiveCircleCSS(template);
  }, [template]);
}

/**
 * Hook for responsive template dimensions with circle preservation
 */
export function useResponsiveTemplateDimensions(template: TileTemplate): {
  dimensions: TemplateDimensions;
  breakpoint: string;
  scaleFactor: number;
} {
  const [screenWidth, setScreenWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return useMemo(() => {
    const dimensions = calculateResponsiveTemplateDimensions(template, screenWidth);
    const breakpoint = detectBreakpoint(screenWidth);
    
    return {
      dimensions,
      breakpoint: breakpoint.name,
      scaleFactor: breakpoint.scaleFactor
    };
  }, [template, screenWidth]);
}

/**
 * Utility function to merge template styles with existing styles
 */
export function mergeTemplateStyles(
  existingClassName: string,
  existingStyle: React.CSSProperties,
  templateStyles: TemplateStylesResult
): {
  className: string;
  style: React.CSSProperties;
} {
  return {
    className: `${existingClassName} ${templateStyles.containerClassName}`.trim(),
    style: {
      ...existingStyle,
      ...templateStyles.containerStyle
    }
  };
}

/**
 * Hook for template-aware responsive breakpoints
 */
export function useTemplateBreakpoint(): {
  breakpoint: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
} {
  const [screenWidth, setScreenWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return useMemo(() => {
    const breakpoint = detectBreakpoint(screenWidth);
    
    return {
      breakpoint: breakpoint.name,
      isMobile: breakpoint.name === 'xs' || breakpoint.name === 'sm',
      isTablet: breakpoint.name === 'md' || breakpoint.name === 'lg',
      isDesktop: breakpoint.name === 'xl' || breakpoint.name === 'xxl',
      screenWidth
    };
  }, [screenWidth]);
}