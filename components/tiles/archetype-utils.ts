/**
 * Project Tile Archetype Utilities
 * 
 * This file provides utility functions for archetype detection, default assignment,
 * and data migration to support the modular Project Tile archetype system.
 */

import { BlockData } from '../Block';
import { 
  ProjectArchetype, 
  ArchetypeConfig, 
  ArchetypeDetectionResult, 
  ArchetypeAssignmentOptions,
  ArchetypeMigrationResult,
  GridSize
} from './archetype-types';

// Default archetype configurations
export const DEFAULT_ARCHETYPE_CONFIGS: Record<ProjectArchetype, ArchetypeConfig> = {
  'web-showcase': {
    uiPreviewMode: 'embedded',
    showWebMetadata: true,
  },
  'mobile-app': {
    phoneOrientation: 'portrait',
    showPhoneMockup: true,
    phoneTiltAngle: 3,
  },
  'concept-editorial': {
    editorialSpacing: 'generous',
  },
};

// Optimal grid sizes for each archetype
export const ARCHETYPE_OPTIMAL_SIZES: Record<ProjectArchetype, GridSize[]> = {
  'web-showcase': [
    { w: 3, h: 2, label: '3×2' },
    { w: 3, h: 3, label: '3×3' },
    { w: 4, h: 3, label: '4×3' },
    { w: 6, h: 3, label: '6×3' },
    { w: 6, h: 4, label: '6×4' },
  ],
  'mobile-app': [
    { w: 2, h: 3, label: '2×3' },
    { w: 3, h: 4, label: '3×4' },
    { w: 4, h: 3, label: '4×3' }, // Landscape fallback
  ],
  'concept-editorial': [
    { w: 2, h: 2, label: '2×2' },
    { w: 3, h: 2, label: '3×2' },
    { w: 4, h: 2, label: '4×2' },
  ],
};

/**
 * Detects the most appropriate archetype for a project tile based on its content
 */
export function detectArchetype(data: BlockData): ArchetypeDetectionResult {
  const scores: Record<ProjectArchetype, number> = {
    'web-showcase': 0,
    'mobile-app': 0,
    'concept-editorial': 0,
  };

  // Analyze title and content for keywords
  const text = `${data.title || ''} ${data.content || ''} ${data.category || ''}`.toLowerCase();
  
  // Web Showcase indicators
  if (text.includes('web') || text.includes('website') || text.includes('app') || text.includes('ui') || text.includes('interface')) {
    scores['web-showcase'] += 2;
  }
  if (text.includes('dashboard') || text.includes('platform') || text.includes('tool')) {
    scores['web-showcase'] += 1;
  }
  
  // Mobile App indicators
  if (text.includes('mobile') || text.includes('ios') || text.includes('android') || text.includes('phone')) {
    scores['mobile-app'] += 3;
  }
  if (text.includes('app') && (text.includes('mobile') || text.includes('phone'))) {
    scores['mobile-app'] += 2;
  }
  
  // Concept/Editorial indicators
  if (text.includes('concept') || text.includes('idea') || text.includes('research') || text.includes('study')) {
    scores['concept-editorial'] += 2;
  }
  if (text.includes('editorial') || text.includes('article') || text.includes('writing') || text.includes('blog')) {
    scores['concept-editorial'] += 2;
  }
  if (text.includes('design') && !text.includes('web') && !text.includes('app')) {
    scores['concept-editorial'] += 1;
  }

  // Analyze grid dimensions for archetype preferences
  const aspectRatio = data.w / data.h;
  
  if (aspectRatio > 1.2) { // Landscape
    scores['web-showcase'] += 1;
  } else if (aspectRatio < 0.8) { // Portrait
    scores['mobile-app'] += 2;
  } else { // Square-ish
    scores['concept-editorial'] += 1;
  }

  // Find the highest scoring archetype
  const sortedArchetypes = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([archetype]) => archetype as ProjectArchetype);

  const suggestedArchetype = sortedArchetypes[0];
  const maxScore = scores[suggestedArchetype];
  const confidence = Math.min(maxScore / 5, 1); // Normalize to 0-1

  let reasoning = 'Based on ';
  if (maxScore === 0) {
    reasoning = 'No specific indicators found, defaulting to Web Showcase';
  } else {
    const factors = [];
    if (text.includes('web') || text.includes('website')) factors.push('web-related keywords');
    if (text.includes('mobile') || text.includes('phone')) factors.push('mobile-related keywords');
    if (text.includes('concept') || text.includes('idea')) factors.push('conceptual keywords');
    if (aspectRatio > 1.2) factors.push('landscape orientation');
    if (aspectRatio < 0.8) factors.push('portrait orientation');
    reasoning += factors.join(', ');
  }

  return {
    suggestedArchetype: suggestedArchetype || 'web-showcase',
    confidence,
    reasoning,
    alternativeArchetypes: sortedArchetypes.slice(1),
  };
}

/**
 * Assigns an archetype to a project tile with optional auto-detection
 */
export function assignArchetype(
  data: BlockData, 
  options: ArchetypeAssignmentOptions = {
    autoDetect: true,
    defaultArchetype: 'web-showcase',
    preserveExisting: true,
    requireUserConfirmation: false,
  }
): BlockData {
  // If archetype already exists and we should preserve it
  if (options.preserveExisting && data.projectArchetype) {
    return data;
  }

  let archetype: ProjectArchetype;

  if (options.autoDetect) {
    const detection = detectArchetype(data);
    archetype = detection.suggestedArchetype;
  } else {
    archetype = options.defaultArchetype;
  }

  // Apply default configuration for the archetype
  const defaultConfig = DEFAULT_ARCHETYPE_CONFIGS[archetype];

  return {
    ...data,
    projectArchetype: archetype,
    archetypeConfig: {
      ...defaultConfig,
      ...data.archetypeConfig, // Preserve any existing config
    },
  };
}

/**
 * Migrates legacy project tile data to archetype-aware format
 */
export function migrateToArchetypeFormat(data: BlockData): ArchetypeMigrationResult {
  const warnings: string[] = [];
  const appliedDefaults: string[] = [];

  // If already has archetype, no migration needed
  if (data.projectArchetype) {
    return {
      success: true,
      migratedData: data,
      appliedDefaults: [],
      warnings: [],
      requiresUserInput: false,
    };
  }

  // Detect appropriate archetype
  const detection = detectArchetype(data);
  const archetype = detection.suggestedArchetype;

  if (detection.confidence < 0.5) {
    warnings.push(`Low confidence (${Math.round(detection.confidence * 100)}%) in archetype detection. Consider manual review.`);
  }

  // Apply default configuration
  const defaultConfig = DEFAULT_ARCHETYPE_CONFIGS[archetype];
  appliedDefaults.push(`Applied default ${archetype} configuration`);

  // Migrate legacy showcase properties if they exist
  const migratedConfig: ArchetypeConfig = { ...defaultConfig };
  
  if (data.showcaseBackground) {
    migratedConfig.customBackground = data.showcaseBackground;
    appliedDefaults.push('Migrated showcaseBackground to customBackground');
  }
  
  if (data.showcaseBorderColor) {
    migratedConfig.customAccentColor = data.showcaseBorderColor;
    appliedDefaults.push('Migrated showcaseBorderColor to customAccentColor');
  }

  const migratedData: BlockData = {
    ...data,
    projectArchetype: archetype,
    archetypeConfig: migratedConfig,
  };

  return {
    success: true,
    migratedData,
    appliedDefaults,
    warnings,
    requiresUserInput: detection.confidence < 0.3, // Very low confidence requires user input
  };
}

/**
 * Gets the default archetype for new project tiles
 */
export function getDefaultArchetype(): ProjectArchetype {
  return 'web-showcase';
}

/**
 * Validates that an archetype value is valid
 */
export function isValidArchetype(value: any): value is ProjectArchetype {
  return typeof value === 'string' && 
         ['web-showcase', 'mobile-app', 'concept-editorial'].includes(value);
}

/**
 * Ensures a project tile has a valid archetype, applying defaults if necessary
 */
export function ensureValidArchetype(data: BlockData): BlockData {
  if (!data.projectArchetype || !isValidArchetype(data.projectArchetype)) {
    return assignArchetype(data, {
      autoDetect: true,
      defaultArchetype: 'web-showcase',
      preserveExisting: false,
      requireUserConfirmation: false,
    });
  }
  
  // Ensure archetype config exists
  if (!data.archetypeConfig) {
    return {
      ...data,
      archetypeConfig: DEFAULT_ARCHETYPE_CONFIGS[data.projectArchetype],
    };
  }
  
  return data;
}

/**
 * Gets optimal grid sizes for an archetype
 */
export function getOptimalSizesForArchetype(archetype: ProjectArchetype): GridSize[] {
  return ARCHETYPE_OPTIMAL_SIZES[archetype] || ARCHETYPE_OPTIMAL_SIZES['web-showcase'];
}

/**
 * Checks if a grid size is optimal for an archetype
 */
export function isOptimalSizeForArchetype(archetype: ProjectArchetype, size: GridSize): boolean {
  const optimalSizes = getOptimalSizesForArchetype(archetype);
  return optimalSizes.some(optimal => optimal.w === size.w && optimal.h === size.h);
}

/**
 * Gets the closest optimal size for an archetype given a current size
 */
export function getClosestOptimalSize(archetype: ProjectArchetype, currentSize: GridSize): GridSize {
  const optimalSizes = getOptimalSizesForArchetype(archetype);
  const currentArea = currentSize.w * currentSize.h;
  
  // Find the optimal size with the closest area
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
 * Creates a new project tile with archetype support
 */
export function createArchetypeProjectTile(
  baseData: Partial<BlockData>,
  archetype?: ProjectArchetype
): BlockData {
  const defaultData: BlockData = {
    id: baseData.id || `project-${Date.now()}`,
    type: 'project',
    category: baseData.category || 'Project',
    x: baseData.x || 0,
    y: baseData.y || 0,
    w: baseData.w || 3,
    h: baseData.h || 2,
    ...baseData,
  };

  if (archetype) {
    return {
      ...defaultData,
      projectArchetype: archetype,
      archetypeConfig: DEFAULT_ARCHETYPE_CONFIGS[archetype],
    };
  }

  return assignArchetype(defaultData);
}

// Layout Adapter Implementation
export class LayoutAdapterImpl {
  calculateSpacing(size: { w: number; h: number }): { padding: number; margin: number } {
    const baseSpacing = Math.min(size.w, size.h) * 8;
    return {
      padding: Math.max(12, baseSpacing * 0.15),
      margin: Math.max(8, baseSpacing * 0.1)
    };
  }

  calculateTypography(size: { w: number; h: number }): { titleSize: number; bodySize: number } {
    const baseSize = Math.min(size.w, size.h) * 8;
    return {
      titleSize: Math.max(16, baseSize * 0.08),
      bodySize: Math.max(12, baseSize * 0.06)
    };
  }

  calculateImageSize(size: { w: number; h: number }, aspectRatio: number = 1): { width: number; height: number } {
    const containerWidth = size.w * 8 * 0.8;
    const containerHeight = size.h * 8 * 0.6;
    
    if (aspectRatio > 1) {
      const width = Math.min(containerWidth, containerHeight * aspectRatio);
      return { width, height: width / aspectRatio };
    } else {
      const height = Math.min(containerHeight, containerWidth / aspectRatio);
      return { width: height * aspectRatio, height };
    }
  }
}

// Archetype Renderers
export class WebShowcaseRenderer {
  render(data: BlockData, size: { w: number; h: number }) {
    const adapter = new LayoutAdapterImpl();
    const spacing = adapter.calculateSpacing(size);
    const typography = adapter.calculateTypography(size);
    
    return {
      layout: 'landscape',
      backgroundStyle: 'soft',
      titlePosition: 'center',
      showUIPreview: true,
      spacing,
      typography
    };
  }

  getOptimalSizes() {
    return ARCHETYPE_OPTIMAL_SIZES['web-showcase'];
  }

  getLayoutConstraints() {
    return {
      minWidth: 2,
      minHeight: 2,
      preferredAspectRatio: 1.5
    };
  }
}

export class MobileAppRenderer {
  render(data: BlockData, size: { w: number; h: number }) {
    const adapter = new LayoutAdapterImpl();
    const spacing = adapter.calculateSpacing(size);
    const typography = adapter.calculateTypography(size);
    
    return {
      layout: 'portrait',
      backgroundStyle: 'gradient',
      showPhoneMockup: true,
      tiltAngle: 5,
      spacing,
      typography
    };
  }

  getOptimalSizes() {
    return ARCHETYPE_OPTIMAL_SIZES['mobile-app'];
  }

  getLayoutConstraints() {
    return {
      minWidth: 2,
      minHeight: 3,
      preferredAspectRatio: 0.67
    };
  }
}

export class ConceptEditorialRenderer {
  render(data: BlockData, size: { w: number; h: number }) {
    const adapter = new LayoutAdapterImpl();
    const spacing = adapter.calculateSpacing(size);
    const typography = adapter.calculateTypography(size);
    
    return {
      layout: 'compact',
      typographyStyle: 'editorial',
      showSymbolicImage: true,
      descriptionStyle: 'poetic',
      spacing,
      typography
    };
  }

  getOptimalSizes() {
    return ARCHETYPE_OPTIMAL_SIZES['concept-editorial'];
  }

  getLayoutConstraints() {
    return {
      minWidth: 2,
      minHeight: 2,
      preferredAspectRatio: 1.2
    };
  }
}

export function getArchetypeRenderer(archetype: ProjectArchetype) {
  switch (archetype) {
    case 'web-showcase':
      return new WebShowcaseRenderer();
    case 'mobile-app':
      return new MobileAppRenderer();
    case 'concept-editorial':
      return new ConceptEditorialRenderer();
    default:
      return new WebShowcaseRenderer();
  }
}