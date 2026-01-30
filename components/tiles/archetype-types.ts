/**
 * Project Tile Archetype Types
 * 
 * This file defines the TypeScript interfaces and types for the modular
 * Project Tile archetype system that provides specialized visual presentations
 * for different project types while maintaining the calm, garden-like aesthetic.
 */

import * as React from 'react';
import { BlockData } from '../Block';

// Core Archetype Types
export type ProjectArchetype = 'web-showcase' | 'mobile-app' | 'concept-editorial';

// Grid Size Configuration
export interface GridSize {
  w: number; // Width in grid units
  h: number; // Height in grid units
  label: string; // Display label (e.g., "3×2")
}

export interface GridDimensions {
  w: number;
  h: number;
  aspectRatio: number;
}

// Archetype-Specific Configuration
export interface ArchetypeConfig {
  // Web Showcase specific
  uiPreviewMode?: 'embedded' | 'floating';
  showWebMetadata?: boolean;
  
  // Mobile App specific
  phoneOrientation?: 'portrait' | 'landscape';
  showPhoneMockup?: boolean;
  phoneTiltAngle?: number;
  
  // Concept/Editorial specific
  poeticDescription?: string;
  symbolicImageUrl?: string;
  editorialSpacing?: 'compact' | 'generous';
  
  // Common configuration
  customBackground?: string;
  customAccentColor?: string;
}

// Layout Adapter Configuration
export interface SpacingConfig {
  padding: string;
  titleMargin: string;
  contentGap: string;
  imageMargin: string;
}

export interface TypographyConfig {
  titleSize: string;
  titleWeight: string;
  titleLineHeight: string;
  contentSize: string;
  contentLineHeight: string;
  metaSize: string;
  metaWeight: string;
}

export interface ImageConfig {
  maxWidth: string;
  maxHeight: string;
  objectFit: 'cover' | 'contain';
  borderRadius: string;
  aspectRatio?: string;
}

export interface LayoutConstraints {
  minWidth: number;
  minHeight: number;
  maxWidth?: number;
  maxHeight?: number;
  preferredAspectRatio: number;
  allowedOrientations: ('portrait' | 'landscape' | 'square')[];
}

// Archetype Renderer Interface
export interface ArchetypeRenderer {
  /**
   * Renders the archetype-specific layout
   */
  render(data: BlockData, dimensions: GridDimensions, isEditMode: boolean): React.JSX.Element;
  
  /**
   * Returns the optimal grid sizes for this archetype
   */
  getOptimalSizes(): GridSize[];
  
  /**
   * Returns layout constraints for a given grid size
   */
  getLayoutConstraints(size: GridSize): LayoutConstraints;
  
  /**
   * Returns the archetype identifier
   */
  getArchetypeId(): ProjectArchetype;
}

// Layout Adapter Interface
export interface LayoutAdapter {
  /**
   * Calculates spacing configuration for archetype and grid size
   */
  calculateSpacing(archetype: ProjectArchetype, gridSize: GridSize): SpacingConfig;
  
  /**
   * Gets typography scale for archetype and grid size
   */
  getTypographyScale(archetype: ProjectArchetype, gridSize: GridSize): TypographyConfig;
  
  /**
   * Adapts image sizing for archetype and grid size
   */
  adaptImageSizing(archetype: ProjectArchetype, gridSize: GridSize): ImageConfig;
  
  /**
   * Determines if a grid size is optimal for the archetype
   */
  isOptimalSize(archetype: ProjectArchetype, gridSize: GridSize): boolean;
  
  /**
   * Gets the closest optimal size for an archetype
   */
  getClosestOptimalSize(archetype: ProjectArchetype, currentSize: GridSize): GridSize;
}

// Archetype Detection and Assignment
export interface ArchetypeDetectionResult {
  suggestedArchetype: ProjectArchetype;
  confidence: number; // 0-1 scale
  reasoning: string;
  alternativeArchetypes: ProjectArchetype[];
}

export interface ArchetypeAssignmentOptions {
  autoDetect: boolean;
  defaultArchetype: ProjectArchetype;
  preserveExisting: boolean;
  requireUserConfirmation: boolean;
}

// Form Integration Types
export interface ArchetypeFormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'url' | 'color';
  placeholder?: string;
  required?: boolean;
  archetype: ProjectArchetype;
  section: 'basic' | 'visual' | 'advanced';
  helpText?: string;
}

export interface ArchetypeFormSection {
  id: string;
  title: string;
  description?: string;
  fields: ArchetypeFormField[];
  archetype: ProjectArchetype;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
}

// Validation Types
export interface ArchetypeValidationRule {
  field: keyof ArchetypeConfig;
  validator: (value: any, data: BlockData) => boolean;
  errorMessage: string;
  archetype?: ProjectArchetype; // If undefined, applies to all archetypes
}

export interface ArchetypeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Preview and Recommendation Types
export interface ArchetypePreview {
  archetype: ProjectArchetype;
  gridSize: GridSize;
  thumbnailUrl?: string;
  isOptimal: boolean;
  adaptationNotes?: string[];
}

export interface ArchetypeRecommendation {
  archetype: ProjectArchetype;
  recommendedSizes: GridSize[];
  reasoning: string;
  visualCharacteristics: string[];
  bestFor: string[];
}

// Migration and Backward Compatibility
export interface LegacyProjectTileData {
  id: string;
  type: 'project';
  showcaseBackground?: string;
  showcaseBorderColor?: string;
  // ... other legacy properties
}

export interface ArchetypeMigrationResult {
  success: boolean;
  migratedData: BlockData;
  appliedDefaults: string[];
  warnings: string[];
  requiresUserInput: boolean;
}

// Error Handling Types
export interface ArchetypeError {
  code: string;
  message: string;
  archetype?: ProjectArchetype;
  field?: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ArchetypeErrorHandler {
  handleInvalidArchetype(value: any): ProjectArchetype;
  handleMissingConfig(archetype: ProjectArchetype): ArchetypeConfig;
  handleLayoutError(error: Error, archetype: ProjectArchetype, gridSize: GridSize): React.JSX.Element;
  handleFormValidationError(errors: ArchetypeValidationResult): void;
}

// Performance and Optimization Types
export interface ArchetypeRenderingOptions {
  enableHoverEffects: boolean;
  enableTransitions: boolean;
  optimizeForMobile: boolean;
  lazyLoadImages: boolean;
  enableDebugMode: boolean;
}

export interface ArchetypePerformanceMetrics {
  renderTime: number;
  layoutCalculationTime: number;
  imageLoadTime?: number;
  totalMemoryUsage: number;
  archetype: ProjectArchetype;
  gridSize: GridSize;
}