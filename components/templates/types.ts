/**
 * Template System Types
 * 
 * This file defines the core TypeScript interfaces for the template system
 * that replaces the free-form grid system with predefined tile templates.
 */

import { BlockType } from '../Block';

// Template Categories
export type TemplateCategory = 'square' | 'rectangle' | 'circle';

// Template Dimensions
export interface TemplateDimensions {
  w: number; // Grid units width
  h: number; // Grid units height
}

// Responsive Scaling Configuration
export interface ScalingRule {
  minWidth: number;
  maxWidth: number;
  scaleFactor: number;
}

export interface ResponsiveConfig {
  breakpoints: {
    mobile: ScalingRule;
    tablet: ScalingRule;
    desktop: ScalingRule;
  };
}

// Core Template Interface
export interface TileTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  dimensions: TemplateDimensions;
  aspectRatio: number;
  allowedTileTypes: BlockType[];
  responsiveScaling: ResponsiveConfig;
  description?: string;
}

// Template Picker Configuration
export interface TemplatePickerConfig {
  showThumbnails: boolean;
  groupByCategory: boolean;
  filterByTileType: boolean;
  showDescriptions: boolean;
}

// Template Validation Result
export interface TemplateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Template Filter Options
export interface TemplateFilterOptions {
  category?: TemplateCategory;
  tileType?: BlockType;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}

// Enhanced Tile Data with Template Information
export interface TemplateAwareTileData {
  id: string;
  type: BlockType;
  content: any; // Tile-specific content
  position: {
    x: number;
    y: number;
    w: number; // Determined by template
    h: number; // Determined by template
  };
  template: {
    id: string;
    category: TemplateCategory;
    dimensions: TemplateDimensions;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: string;
    migrationSource?: 'legacy' | 'new';
  };
}

// Legacy Migration Types
export interface LegacyTileData {
  id: string;
  type: BlockType;
  x: number;
  y: number;
  w: number;
  h: number;
  [key: string]: any; // Other legacy properties
}

export interface MigrationMapping {
  legacySize: string; // e.g., "2x2"
  templateId: string;
  confidence: number; // 0-1, how confident we are in this mapping
}

// Responsive Breakpoint Configuration
export interface ResponsiveBreakpoints {
  mobile: {
    maxWidth: number;
    cols: number;
    rowHeight: number;
    margin: [number, number];
  };
  tablet: {
    maxWidth: number;
    cols: number;
    rowHeight: number;
    margin: [number, number];
  };
  desktop: {
    minWidth: number;
    cols: number;
    rowHeight: number;
    margin: [number, number];
  };
}

// Template System Configuration
export interface TemplateSystemConfig {
  enableTemplateValidation: boolean;
  enableResponsiveScaling: boolean;
  enableLegacyMigration: boolean;
  defaultTemplate: string;
  responsiveBreakpoints: ResponsiveBreakpoints;
}