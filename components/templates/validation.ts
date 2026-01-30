/**
 * Template Validation and Filtering Logic
 * 
 * This file implements validation and filtering logic for the template system,
 * ensuring templates are used correctly and providing filtering capabilities.
 */

import { 
  TileTemplate, 
  TemplateValidationResult, 
  TemplateFilterOptions,
  TemplateCategory,
  TemplateDimensions
} from './types';
import { BlockType } from '../Block';
import { ALL_TEMPLATES, TEMPLATES_BY_CATEGORY, TEMPLATES_BY_ID } from './definitions';

/**
 * Validates if a template is compatible with a given tile type
 * Requirements 1.5: Video and image tiles can ONLY use circle templates
 */
export function validateTemplateForTileType(
  template: TileTemplate, 
  tileType: BlockType
): TemplateValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if tile type is allowed for this template
  if (!template.allowedTileTypes.includes(tileType)) {
    errors.push(`Tile type '${tileType}' is not allowed for template '${template.name}'`);
  }

  // Special validation for circle templates (Requirements 1.5)
  if (template.category === 'circle') {
    if (!['video', 'image'].includes(tileType)) {
      errors.push(`Circle templates can only be used with video or image tiles, not '${tileType}'`);
    }
  }

  // Validate aspect ratio makes sense for tile type
  if (tileType === 'status' && template.aspectRatio > 2.5) {
    warnings.push(`Template '${template.name}' may be too wide for status content`);
  }

  if (tileType === 'thought' && (template.dimensions.w > 2 || template.dimensions.h > 2)) {
    warnings.push(`Template '${template.name}' may be too large for thought content`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates template dimensions are within acceptable ranges
 */
export function validateTemplateDimensions(dimensions: TemplateDimensions): TemplateValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check minimum dimensions
  if (dimensions.w < 1 || dimensions.h < 1) {
    errors.push('Template dimensions must be at least 1x1 grid units');
  }

  // Check maximum dimensions (reasonable limits for grid layout)
  if (dimensions.w > 12) {
    errors.push('Template width cannot exceed 12 grid units');
  }

  if (dimensions.h > 8) {
    warnings.push('Template height greater than 8 grid units may cause layout issues');
  }

  // Check for reasonable aspect ratios
  const aspectRatio = dimensions.w / dimensions.h;
  if (aspectRatio > 6 || aspectRatio < 0.2) {
    warnings.push('Extreme aspect ratios may cause display issues');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates a complete template configuration
 */
export function validateTemplate(template: TileTemplate): TemplateValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required fields
  if (!template.id || template.id.trim() === '') {
    errors.push('Template must have a valid ID');
  }

  if (!template.name || template.name.trim() === '') {
    errors.push('Template must have a valid name');
  }

  if (!['square', 'rectangle', 'circle'].includes(template.category)) {
    errors.push('Template category must be square, rectangle, or circle');
  }

  // Validate dimensions
  const dimensionValidation = validateTemplateDimensions(template.dimensions);
  errors.push(...dimensionValidation.errors);
  warnings.push(...dimensionValidation.warnings);

  // Validate aspect ratio matches dimensions
  const calculatedAspectRatio = template.dimensions.w / template.dimensions.h;
  if (Math.abs(template.aspectRatio - calculatedAspectRatio) > 0.01) {
    errors.push('Template aspect ratio does not match dimensions');
  }

  // Validate category matches dimensions for squares and circles
  if (template.category === 'square' || template.category === 'circle') {
    if (template.dimensions.w !== template.dimensions.h) {
      errors.push(`${template.category} templates must have equal width and height`);
    }
  }

  // Validate allowed tile types
  if (!template.allowedTileTypes || template.allowedTileTypes.length === 0) {
    errors.push('Template must specify at least one allowed tile type');
  }

  // Validate circle template restrictions (Requirements 1.5)
  if (template.category === 'circle') {
    const invalidTypes = template.allowedTileTypes.filter(type => !['video', 'image'].includes(type));
    if (invalidTypes.length > 0) {
      errors.push(`Circle templates can only allow video and image tile types, found: ${invalidTypes.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Filters templates based on provided criteria
 */
export function filterTemplates(options: TemplateFilterOptions): TileTemplate[] {
  let templates = ALL_TEMPLATES;

  // Filter by category
  if (options.category) {
    templates = templates.filter(template => template.category === options.category);
  }

  // Filter by tile type compatibility
  if (options.tileType) {
    templates = templates.filter(template => 
      template.allowedTileTypes.includes(options.tileType!)
    );
  }

  // Filter by dimensions
  if (options.minWidth !== undefined) {
    templates = templates.filter(template => template.dimensions.w >= options.minWidth!);
  }

  if (options.maxWidth !== undefined) {
    templates = templates.filter(template => template.dimensions.w <= options.maxWidth!);
  }

  if (options.minHeight !== undefined) {
    templates = templates.filter(template => template.dimensions.h >= options.minHeight!);
  }

  if (options.maxHeight !== undefined) {
    templates = templates.filter(template => template.dimensions.h <= options.maxHeight!);
  }

  return templates;
}

/**
 * Gets available templates for a specific tile type
 * Requirements 1.5: Video and image tiles can use circles, others cannot
 */
export function getTemplatesForTileType(tileType: BlockType): TileTemplate[] {
  return filterTemplates({ tileType });
}

/**
 * Gets templates by category
 * Requirements 1.1: Three template categories
 */
export function getTemplatesByCategory(category: TemplateCategory): TileTemplate[] {
  return TEMPLATES_BY_CATEGORY[category] || [];
}

/**
 * Gets a template by ID with validation
 */
export function getTemplateById(templateId: string): TileTemplate | null {
  const template = TEMPLATES_BY_ID[templateId];
  if (!template) {
    return null;
  }

  // Validate the template before returning
  const validation = validateTemplate(template);
  if (!validation.isValid) {
    console.warn(`Template ${templateId} failed validation:`, validation.errors);
    return null;
  }

  return template;
}

/**
 * Checks if a template exists and is valid
 */
export function isValidTemplateId(templateId: string): boolean {
  return getTemplateById(templateId) !== null;
}

/**
 * Gets all available template categories
 * Requirements 1.1: Should return exactly ['square', 'rectangle', 'circle']
 */
export function getTemplateCategories(): TemplateCategory[] {
  return ['square', 'rectangle', 'circle'];
}

/**
 * Validates that all predefined templates are correct
 * Used for system integrity checks
 */
export function validateAllTemplates(): TemplateValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate each template
  for (const template of ALL_TEMPLATES) {
    const validation = validateTemplate(template);
    if (!validation.isValid) {
      errors.push(`Template '${template.id}': ${validation.errors.join(', ')}`);
    }
    warnings.push(...validation.warnings.map(w => `Template '${template.id}': ${w}`));
  }

  // Check for duplicate IDs
  const ids = ALL_TEMPLATES.map(t => t.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    errors.push(`Duplicate template IDs found: ${duplicateIds.join(', ')}`);
  }

  // Validate category completeness (Requirements 1.1)
  const categories = ALL_TEMPLATES.map(t => t.category);
  const expectedCategories: TemplateCategory[] = ['square', 'rectangle', 'circle'];
  
  for (const expected of expectedCategories) {
    if (!categories.includes(expected)) {
      errors.push(`Missing templates for category: ${expected}`);
    }
  }

  for (const category of categories) {
    if (!expectedCategories.includes(category)) {
      errors.push(`Unexpected template category: ${category}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}