/**
 * Responsive Integration System
 * 
 * Connects template scaling with grid responsive behavior and ensures
 * sidebar responsiveness works with grid layout.
 * 
 * Requirements: 2.6, 3.5, 3.6, 8.3
 */

import React from 'react';
import { TileTemplate } from '../templates/types';
import { BlockData } from '../Block';
import { GridLayoutItem } from './TemplateGridIntegration';
import { calculateResponsiveScale } from '../templates/responsive';

export interface ResponsiveBreakpoint {
  name: string;
  minWidth: number;
  maxWidth?: number;
  cols: number;
  rowHeight: number;
  margin: [number, number];
  containerPadding: [number, number];
}

export interface ResponsiveConfig {
  breakpoints: ResponsiveBreakpoint[];
  sidebarBreakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  gridBreakpoints: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
}

export interface ResponsiveState {
  currentBreakpoint: string;
  screenWidth: number;
  screenHeight: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  sidebarWidth: number;
  gridCols: number;
  rowHeight: number;
  gridMargin: [number, number];
}

const DEFAULT_RESPONSIVE_CONFIG: ResponsiveConfig = {
  breakpoints: [
    { name: 'xs', minWidth: 0, maxWidth: 575, cols: 4, rowHeight: 60, margin: [8, 8], containerPadding: [8, 8] },
    { name: 'sm', minWidth: 576, maxWidth: 767, cols: 6, rowHeight: 70, margin: [10, 10], containerPadding: [12, 12] },
    { name: 'md', minWidth: 768, maxWidth: 991, cols: 8, rowHeight: 80, margin: [12, 12], containerPadding: [16, 16] },
    { name: 'lg', minWidth: 992, maxWidth: 1199, cols: 10, rowHeight: 90, margin: [14, 14], containerPadding: [20, 20] },
    { name: 'xl', minWidth: 1200, maxWidth: 1399, cols: 12, rowHeight: 100, margin: [16, 16], containerPadding: [24, 24] },
    { name: 'xxl', minWidth: 1400, cols: 12, rowHeight: 100, margin: [16, 16], containerPadding: [24, 24] }
  ],
  sidebarBreakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  },
  gridBreakpoints: {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1400
  }
};

/**
 * Manages responsive behavior across grid and sidebar components
 */
export class ResponsiveIntegration {
  private config: ResponsiveConfig;
  private state: ResponsiveState;
  private listeners: Set<(state: ResponsiveState) => void> = new Set();
  private resizeObserver: ResizeObserver | null = null;

  constructor(config: Partial<ResponsiveConfig> = {}) {
    this.config = { ...DEFAULT_RESPONSIVE_CONFIG, ...config };
    this.state = this.calculateInitialState();
    this.setupResizeObserver();
  }

  /**
   * Subscribe to responsive state changes
   */
  subscribe(listener: (state: ResponsiveState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get current responsive state
   */
  getState(): ResponsiveState {
    return { ...this.state };
  }

  /**
   * Calculate initial responsive state
   */
  private calculateInitialState(): ResponsiveState {
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
    
    return this.calculateResponsiveState(screenWidth, screenHeight);
  }

  /**
   * Calculate responsive state based on screen dimensions
   */
  private calculateResponsiveState(width: number, height: number): ResponsiveState {
    const breakpoint = this.getCurrentBreakpoint(width);
    const isMobile = width < this.config.sidebarBreakpoints.mobile;
    const isTablet = width >= this.config.sidebarBreakpoints.mobile && width < this.config.sidebarBreakpoints.desktop;
    const isDesktop = width >= this.config.sidebarBreakpoints.desktop;

    // Calculate sidebar width based on device type
    let sidebarWidth: number;
    if (isMobile) {
      sidebarWidth = width; // Full width on mobile
    } else if (isTablet) {
      sidebarWidth = Math.min(width * 0.85, 600); // 85% on tablet, max 600px
    } else {
      sidebarWidth = Math.min(width * 0.75, 900); // 75% on desktop, max 900px
    }

    return {
      currentBreakpoint: breakpoint.name,
      screenWidth: width,
      screenHeight: height,
      isMobile,
      isTablet,
      isDesktop,
      sidebarWidth,
      gridCols: breakpoint.cols,
      rowHeight: breakpoint.rowHeight,
      gridMargin: breakpoint.margin
    };
  }

  /**
   * Get current breakpoint based on width
   */
  private getCurrentBreakpoint(width: number): ResponsiveBreakpoint {
    for (const breakpoint of this.config.breakpoints) {
      if (width >= breakpoint.minWidth && (!breakpoint.maxWidth || width <= breakpoint.maxWidth)) {
        return breakpoint;
      }
    }
    return this.config.breakpoints[this.config.breakpoints.length - 1];
  }

  /**
   * Setup resize observer for responsive updates
   */
  private setupResizeObserver(): void {
    if (typeof window === 'undefined') return;

    const updateState = () => {
      const newState = this.calculateResponsiveState(window.innerWidth, window.innerHeight);
      
      // Only update if state actually changed
      if (this.hasStateChanged(this.state, newState)) {
        this.state = newState;
        this.notifyListeners();
      }
    };

    // Use ResizeObserver for better performance
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => updateState());
      this.resizeObserver.observe(document.body);
    } else {
      // Fallback to window resize event
      window.addEventListener('resize', updateState);
    }
  }

  /**
   * Check if responsive state has changed
   */
  private hasStateChanged(oldState: ResponsiveState, newState: ResponsiveState): boolean {
    return (
      oldState.currentBreakpoint !== newState.currentBreakpoint ||
      oldState.isMobile !== newState.isMobile ||
      oldState.isTablet !== newState.isTablet ||
      oldState.isDesktop !== newState.isDesktop ||
      Math.abs(oldState.sidebarWidth - newState.sidebarWidth) > 10 // Threshold to avoid micro-updates
    );
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Get responsive grid layout for blocks
   */
  getResponsiveLayout(blocks: BlockData[], currentLayout: GridLayoutItem[]): GridLayoutItem[] {
    const { currentBreakpoint, gridCols } = this.state;
    
    return currentLayout.map(item => {
      const block = blocks.find(b => b.id === item.i);
      if (!block?.template) return item;

      // Calculate responsive scaling for template
      const scale = calculateResponsiveScale(block.template, currentBreakpoint);
      
      // Apply scaling to dimensions
      const scaledW = Math.max(1, Math.round(block.template.dimensions.w * scale.width));
      const scaledH = Math.max(1, Math.round(block.template.dimensions.h * scale.height));
      
      // Ensure item fits within grid
      const finalW = Math.min(scaledW, gridCols);
      const finalX = Math.min(item.x, Math.max(0, gridCols - finalW));

      return {
        ...item,
        x: finalX,
        w: finalW,
        h: scaledH
      };
    });
  }

  /**
   * Get sidebar configuration for current responsive state
   */
  getSidebarConfig(): {
    width: number;
    isFullScreen: boolean;
    showBackdrop: boolean;
    allowDrag: boolean;
    position: 'fixed' | 'absolute';
  } {
    const { isMobile, isTablet, sidebarWidth } = this.state;

    return {
      width: sidebarWidth,
      isFullScreen: isMobile,
      showBackdrop: isMobile || isTablet,
      allowDrag: isMobile,
      position: 'fixed'
    };
  }

  /**
   * Get grid configuration for current responsive state
   */
  getGridConfig(): {
    cols: number;
    rowHeight: number;
    margin: [number, number];
    containerPadding: [number, number];
    compactType: 'vertical' | 'horizontal' | null;
  } {
    const breakpoint = this.getCurrentBreakpoint(this.state.screenWidth);
    
    return {
      cols: breakpoint.cols,
      rowHeight: breakpoint.rowHeight,
      margin: breakpoint.margin,
      containerPadding: breakpoint.containerPadding,
      compactType: this.state.isMobile ? 'vertical' : null
    };
  }

  /**
   * Calculate available grid width when sidebar is open
   */
  getAvailableGridWidth(sidebarOpen: boolean): number {
    if (!sidebarOpen || this.state.isMobile) {
      return this.state.screenWidth;
    }

    // On desktop/tablet, reduce available width when sidebar is open
    return Math.max(300, this.state.screenWidth - this.state.sidebarWidth);
  }

  /**
   * Get responsive font sizes for templates
   */
  getResponsiveFontSizes(template: TileTemplate): {
    title: string;
    content: string;
    caption: string;
  } {
    const { currentBreakpoint } = this.state;
    const baseScale = calculateResponsiveScale(template, currentBreakpoint);
    
    // Calculate font sizes based on template size and responsive scale
    const titleSize = Math.max(12, Math.round(16 * baseScale.fontSize));
    const contentSize = Math.max(10, Math.round(14 * baseScale.fontSize));
    const captionSize = Math.max(8, Math.round(12 * baseScale.fontSize));

    return {
      title: `${titleSize}px`,
      content: `${contentSize}px`,
      caption: `${captionSize}px`
    };
  }

  /**
   * Check if template should be hidden on current breakpoint
   */
  shouldHideTemplate(template: TileTemplate): boolean {
    const { currentBreakpoint } = this.state;
    
    // Hide very small templates on mobile
    if (currentBreakpoint === 'xs' && template.dimensions.w === 1 && template.dimensions.h === 1) {
      return true;
    }
    
    return false;
  }

  /**
   * Get responsive animation duration
   */
  getAnimationDuration(): number {
    // Reduce animation duration on mobile for better performance
    return this.state.isMobile ? 200 : 300;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.listeners.clear();
  }
}

/**
 * React hook for responsive integration
 */
export const useResponsiveIntegration = (config?: Partial<ResponsiveConfig>) => {
  const [integration] = React.useState(() => new ResponsiveIntegration(config));
  const [state, setState] = React.useState(() => integration.getState());

  React.useEffect(() => {
    const unsubscribe = integration.subscribe(setState);
    return unsubscribe;
  }, [integration]);

  React.useEffect(() => {
    return () => integration.destroy();
  }, [integration]);

  return {
    state,
    getResponsiveLayout: integration.getResponsiveLayout.bind(integration),
    getSidebarConfig: integration.getSidebarConfig.bind(integration),
    getGridConfig: integration.getGridConfig.bind(integration),
    getAvailableGridWidth: integration.getAvailableGridWidth.bind(integration),
    getResponsiveFontSizes: integration.getResponsiveFontSizes.bind(integration),
    shouldHideTemplate: integration.shouldHideTemplate.bind(integration),
    getAnimationDuration: integration.getAnimationDuration.bind(integration)
  };
};