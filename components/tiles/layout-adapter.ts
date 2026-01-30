/**
 * Layout Adapter for Project Tile Archetypes
 * 
 * This utility class provides adaptive layout calculations for different
 * archetype and grid size combinations, ensuring optimal visual presentation
 * while maintaining the calm, garden-like aesthetic.
 */

import { 
  ProjectArchetype, 
  GridSize, 
  SpacingConfig, 
  TypographyConfig, 
  ImageConfig, 
  LayoutConstraints,
  LayoutAdapter as ILayoutAdapter
} from './archetype-types';

export class LayoutAdapter implements ILayoutAdapter {
  
  /**
   * Calculates spacing configuration for archetype and grid size
   */
  calculateSpacing(archetype: ProjectArchetype, gridSize: GridSize): SpacingConfig {
    const area = gridSize.w * gridSize.h;
    const aspectRatio = gridSize.w / gridSize.h;
    
    // Base spacing that scales with tile area
    const baseSpacing = Math.max(12, Math.min(32, area * 2));
    
    switch (archetype) {
      case 'web-showcase':
        return {
          padding: `${baseSpacing}px`,
          titleMargin: `0 0 ${baseSpacing * 0.75}px 0`,
          contentGap: `${baseSpacing * 0.5}px`,
          imageMargin: `${baseSpacing * 0.5}px 0 0 0`,
        };
        
      case 'mobile-app':
        // Tighter spacing for mobile-focused layout
        return {
          padding: `${baseSpacing * 0.75}px`,
          titleMargin: `0 0 ${baseSpacing * 0.5}px 0`,
          contentGap: `${baseSpacing * 0.25}px`,
          imageMargin: `${baseSpacing * 0.25}px 0 0 0`,
        };
        
      case 'concept-editorial':
        // Editorial spacing with more generous margins
        return {
          padding: `${baseSpacing * 1.25}px`,
          titleMargin: `0 0 ${baseSpacing}px 0`,
          contentGap: `${baseSpacing * 0.75}px`,
          imageMargin: `${baseSpacing * 0.75}px 0 0 0`,
        };
        
      default:
        return this.calculateSpacing('web-showcase', gridSize);
    }
  }
  
  /**
   * Gets typography scale for archetype and grid size
   */
  getTypographyScale(archetype: ProjectArchetype, gridSize: GridSize): TypographyConfig {
    const area = gridSize.w * gridSize.h;
    
    // Scale typography based on tile area
    const scaleFactor = Math.max(0.75, Math.min(1.5, Math.sqrt(area) / 3));
    
    switch (archetype) {
      case 'web-showcase':
        return {
          titleSize: `${Math.round(18 * scaleFactor)}px`,
          titleWeight: '600',
          titleLineHeight: '1.3',
          contentSize: `${Math.round(14 * scaleFactor)}px`,
          contentLineHeight: '1.5',
          metaSize: `${Math.round(12 * scaleFactor)}px`,
          metaWeight: '400',
        };
        
      case 'mobile-app':
        // Slightly smaller text for mobile-focused design
        return {
          titleSize: `${Math.round(16 * scaleFactor)}px`,
          titleWeight: '500',
          titleLineHeight: '1.2',
          contentSize: `${Math.round(12 * scaleFactor)}px`,
          contentLineHeight: '1.4',
          metaSize: `${Math.round(10 * scaleFactor)}px`,
          metaWeight: '400',
        };
        
      case 'concept-editorial':
        // Editorial typography with emphasis on readability
        return {
          titleSize: `${Math.round(20 * scaleFactor)}px`,
          titleWeight: '700',
          titleLineHeight: '1.2',
          contentSize: `${Math.round(15 * scaleFactor)}px`,
          contentLineHeight: '1.6',
          metaSize: `${Math.round(11 * scaleFactor)}px`,
          metaWeight: '300',
        };
        
      default:
        return this.getTypographyScale('web-showcase', gridSize);
    }
  }
  
  /**
   * Adapts image sizing for archetype and grid size
   */
  adaptImageSizing(archetype: ProjectArchetype, gridSize: GridSize): ImageConfig {
    const aspectRatio = gridSize.w / gridSize.h;
    
    switch (archetype) {
      case 'web-showcase':
        return {
          maxWidth: '100%',
          maxHeight: aspectRatio > 1.5 ? '60%' : '70%',
          objectFit: 'cover',
          borderRadius: '4px',
          aspectRatio: aspectRatio > 1.5 ? '16/9' : '4/3',
        };
        
      case 'mobile-app':
        return {
          maxWidth: aspectRatio < 1 ? '60%' : '40%',
          maxHeight: '80%',
          objectFit: 'contain',
          borderRadius: '12px', // Phone-like rounded corners
          aspectRatio: '9/16', // Phone aspect ratio
        };
        
      case 'concept-editorial':
        return {
          maxWidth: '80%',
          maxHeight: '50%',
          objectFit: 'cover',
          borderRadius: '2px',
          aspectRatio: '1/1', // Square for symbolic imagery
        };
        
      default:
        return this.adaptImageSizing('web-showcase', gridSize);
    }
  }
  
  /**
   * Determines if a grid size is optimal for the archetype
   */
  isOptimalSize(archetype: ProjectArchetype, gridSize: GridSize): boolean {
    const optimalSizes = this.getOptimalSizes(archetype);
    return optimalSizes.some(size => size.w === gridSize.w && size.h === gridSize.h);
  }
  
  /**
   * Gets the closest optimal size for an archetype
   */
  getClosestOptimalSize(archetype: ProjectArchetype, currentSize: GridSize): GridSize {
    const optimalSizes = this.getOptimalSizes(archetype);
    const currentArea = currentSize.w * currentSize.h;
    
    let closestSize = optimalSizes[0];
    let closestAreaDiff = Math.abs((closestSize.w * closestSize.h) - currentArea);
    
    for (const size of optimalSizes.slice(1)) {
      const areaDiff = Math.abs((size.w * size.h) - currentArea);
      if (areaDiff < closestAreaDiff) {
        closestSize = size;
        closestAreaDiff = areaDiff;
      }
    }
    
    return closestSize;
  }
  
  /**
   * Gets layout constraints for a specific archetype and grid size
   */
  getLayoutConstraints(archetype: ProjectArchetype, size: GridSize): LayoutConstraints {
    const aspectRatio = size.w / size.h;
    
    switch (archetype) {
      case 'web-showcase':
        return {
          minWidth: 200,
          minHeight: 150,
          maxWidth: 800,
          maxHeight: 600,
          preferredAspectRatio: 1.5, // Landscape preference
          allowedOrientations: ['landscape', 'square'],
        };
        
      case 'mobile-app':
        return {
          minWidth: 150,
          minHeight: 200,
          maxWidth: 400,
          maxHeight: 600,
          preferredAspectRatio: 0.6, // Portrait preference
          allowedOrientations: ['portrait', 'square'],
        };
        
      case 'concept-editorial':
        return {
          minWidth: 150,
          minHeight: 150,
          maxWidth: 500,
          maxHeight: 400,
          preferredAspectRatio: 1.2, // Slightly landscape
          allowedOrientations: ['square', 'landscape'],
        };
        
      default:
        return this.getLayoutConstraints('web-showcase', size);
    }
  }
  
  /**
   * Gets optimal sizes for an archetype
   */
  private getOptimalSizes(archetype: ProjectArchetype): GridSize[] {
    switch (archetype) {
      case 'web-showcase':
        return [
          { w: 3, h: 2, label: '3×2' },
          { w: 3, h: 3, label: '3×3' },
          { w: 4, h: 3, label: '4×3' },
          { w: 6, h: 3, label: '6×3' },
          { w: 6, h: 4, label: '6×4' },
        ];
        
      case 'mobile-app':
        return [
          { w: 2, h: 3, label: '2×3' },
          { w: 3, h: 4, label: '3×4' },
          { w: 4, h: 3, label: '4×3' },
        ];
        
      case 'concept-editorial':
        return [
          { w: 2, h: 2, label: '2×2' },
          { w: 3, h: 2, label: '3×2' },
          { w: 4, h: 2, label: '4×2' },
        ];
        
      default:
        return this.getOptimalSizes('web-showcase');
    }
  }
  
  /**
   * Calculates responsive scaling factors for different screen sizes
   */
  getResponsiveScaling(screenWidth: number): number {
    if (screenWidth < 768) {
      return 0.8; // Mobile scaling
    } else if (screenWidth < 1024) {
      return 0.9; // Tablet scaling
    } else {
      return 1.0; // Desktop scaling
    }
  }
  
  /**
   * Adapts layout for responsive breakpoints
   */
  adaptForBreakpoint(
    archetype: ProjectArchetype, 
    gridSize: GridSize, 
    screenWidth: number
  ): {
    spacing: SpacingConfig;
    typography: TypographyConfig;
    image: ImageConfig;
  } {
    const scaleFactor = this.getResponsiveScaling(screenWidth);
    
    const baseSpacing = this.calculateSpacing(archetype, gridSize);
    const baseTypography = this.getTypographyScale(archetype, gridSize);
    const baseImage = this.adaptImageSizing(archetype, gridSize);
    
    // Scale spacing
    const scaledSpacing: SpacingConfig = {
      padding: this.scaleSpacingValue(baseSpacing.padding, scaleFactor),
      titleMargin: this.scaleSpacingValue(baseSpacing.titleMargin, scaleFactor),
      contentGap: this.scaleSpacingValue(baseSpacing.contentGap, scaleFactor),
      imageMargin: this.scaleSpacingValue(baseSpacing.imageMargin, scaleFactor),
    };
    
    // Scale typography
    const scaledTypography: TypographyConfig = {
      ...baseTypography,
      titleSize: this.scaleFontSize(baseTypography.titleSize, scaleFactor),
      contentSize: this.scaleFontSize(baseTypography.contentSize, scaleFactor),
      metaSize: this.scaleFontSize(baseTypography.metaSize, scaleFactor),
    };
    
    return {
      spacing: scaledSpacing,
      typography: scaledTypography,
      image: baseImage, // Image sizing remains the same for consistency
    };
  }
  
  /**
   * Helper method to scale spacing values
   */
  private scaleSpacingValue(value: string, scaleFactor: number): string {
    return value.replace(/(\d+)px/g, (match, pixels) => {
      const scaled = Math.round(parseInt(pixels) * scaleFactor);
      return `${scaled}px`;
    });
  }
  
  /**
   * Helper method to scale font sizes
   */
  private scaleFontSize(value: string, scaleFactor: number): string {
    const pixels = parseInt(value.replace('px', ''));
    return `${Math.round(pixels * scaleFactor)}px`;
  }
}

// Export a singleton instance for use throughout the application
export const layoutAdapter = new LayoutAdapter();