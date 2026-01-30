/**
 * Template System Exports
 * 
 * This file exports all template system components, types, and utilities
 * for easy importing throughout the application.
 */

// Types
export type {
  TileTemplate,
  TemplateCategory,
  TemplateDimensions,
  ResponsiveConfig,
  ScalingRule,
  TemplatePickerConfig,
  TemplateValidationResult,
  TemplateFilterOptions,
  TemplateAwareTileData,
  LegacyTileData,
  MigrationMapping,
  ResponsiveBreakpoints,
  TemplateSystemConfig
} from './types';

// Responsive Types
export type {
  EnhancedBreakpoint
} from './responsive';

// Template Definitions
export {
  SQUARE_TEMPLATES,
  RECTANGLE_TEMPLATES,
  CIRCLE_TEMPLATES,
  ALL_TEMPLATES,
  TEMPLATES_BY_CATEGORY,
  TEMPLATES_BY_ID,
  DEFAULT_TEMPLATES_BY_TILE_TYPE,
  LEGACY_SIZE_MAPPING,
  RESPONSIVE_BREAKPOINTS
} from './definitions';

// Validation Functions
export {
  validateTemplateForTileType,
  validateTemplateDimensions,
  validateTemplate,
  filterTemplates,
  getTemplatesForTileType,
  getTemplatesByCategory,
  getTemplateById,
  isValidTemplateId,
  getTemplateCategories,
  validateAllTemplates
} from './validation';

// Utility Functions
export {
  getDefaultTemplateForTileType,
  calculateResponsiveDimensions,
  calculateEnhancedResponsiveDimensions,
  ensureAspectRatioPreservation,
  getResponsiveGridConfig,
  migrateLegacyTile,
  generateMigrationMappings,
  canPlaceTemplateAt,
  findFirstAvailablePosition,
  getCircleTemplateStyles,
  getCircleTemplateProperties,
  createResponsiveCircleCSS,
  getCircleContainerStyles,
  calculateOptimalFontSize,
  exportTemplateSystemState
} from './utils';

// Responsive Scaling
export {
  EnhancedBreakpoint,
  ENHANCED_BREAKPOINTS,
  detectBreakpoint,
  calculateProportionalScaling,
  applyBreakpointScaling,
  preserveAspectRatio,
  calculateResponsiveTemplateDimensions,
  getResponsiveGridConfiguration,
  calculateColumnWidth,
  validateResponsiveDimensions,
  createResponsiveConfig,
  exportResponsiveScalingState
} from './responsive';

// Responsive Hooks
export {
  useResponsiveTemplates,
  useResponsiveTemplatesBatch,
  useResponsiveTileData,
  UseResponsiveTemplatesReturn,
  UseResponsiveTemplatesOptions
} from './useResponsiveTemplates';

// Components
export { TemplatePicker } from './TemplatePicker';
export { TemplateDemo } from './TemplateDemo';
export { TemplatePickerDemo } from './TemplatePickerDemo';
export { ResponsiveTemplateDemo } from './ResponsiveTemplateDemo';
export { CircleTemplateDemo } from './CircleTemplateDemo';
export { 
  TemplateAwareBlock, 
  CircleTemplateWrapper, 
  withTemplateAwareness,
  useTemplateAwareBlockData 
} from './TemplateAwareBlock';
export {
  TemplateChangeAnimator,
  useTemplateChangeAnimation,
  withTemplateChangeAnimation
} from './TemplateChangeAnimator';

// Hooks
export { useTemplatePicker } from './useTemplatePicker';
export { 
  useTemplateStyles, 
  useCircleTemplateCSS, 
  useResponsiveTemplateDimensions,
  useTemplateBreakpoint,
  mergeTemplateStyles 
} from './useTemplateStyles';

// CSS Utilities
export {
  injectCircleTemplateCSS,
  removeCircleTemplateCSS,
  isCircleTemplateCSSInjected,
  updateCircleTemplateProperties,
  getCircleTemplateProperties,
  useCircleTemplateCSS as useCircleTemplateCSSInjection
} from './circleTemplateCSS';