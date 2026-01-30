export { TextTile } from './TextTile';
export { ThoughtTile } from './ThoughtTile';
export { QuoteTile } from './QuoteTile';
export { ImageTile } from './ImageTile';
export { ImageTileBlock } from './ImageTileBlock';
export { VideoTile } from './VideoTile';
export { StatusTile } from './StatusTile';
export { WritingTileBlock } from './WritingTileBlock';
export { ProjectTile } from './ProjectTile';

// Template-aware tile components
export { 
  TemplateAwareImageTile, 
  EnhancedImageTile 
} from './TemplateAwareImageTile';
export { 
  TemplateAwareVideoTile, 
  EnhancedVideoTile 
} from './TemplateAwareVideoTile';

// Project Tile Archetype System
export type {
  ProjectArchetype,
  ArchetypeConfig,
  GridSize,
  GridDimensions,
  SpacingConfig,
  TypographyConfig,
  ImageConfig,
  LayoutConstraints,
  ArchetypeRenderer,
  LayoutAdapter as ILayoutAdapter,
  ArchetypeDetectionResult,
  ArchetypeAssignmentOptions,
  ArchetypeMigrationResult,
  ArchetypeFormField,
  ArchetypeFormSection,
  ArchetypeValidationResult,
  ArchetypePreview,
  ArchetypeRecommendation,
  ArchetypeError,
  ArchetypeRenderingOptions,
  ArchetypePerformanceMetrics,
} from './archetype-types';

export {
  detectArchetype,
  assignArchetype,
  migrateToArchetypeFormat,
  getDefaultArchetype,
  isValidArchetype,
  ensureValidArchetype,
  getOptimalSizesForArchetype,
  isOptimalSizeForArchetype,
  getClosestOptimalSize,
  createArchetypeProjectTile,
  DEFAULT_ARCHETYPE_CONFIGS,
  ARCHETYPE_OPTIMAL_SIZES,
} from './archetype-utils';

export { LayoutAdapter, layoutAdapter } from './layout-adapter';