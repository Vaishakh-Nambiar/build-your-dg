/**
 * Data Migration System
 * 
 * Handles migration of legacy garden data to the new template-based system.
 * Provides size-to-template mapping, content preservation, and validation.
 * 
 * Requirements: 7.2, 7.3, 7.4
 */

import { BlockData } from '../Block';
import { TileTemplate, TemplateDimensions } from '../templates/types';
import { getTemplatesByCategory, validateTemplateForTileType } from '../templates/validation';
import { PREDEFINED_TEMPLATES } from '../templates/definitions';

export interface LegacyBlockData {
  id: string;
  type: string;
  content: any;
  x: number;
  y: number;
  w: number;
  h: number;
  // Legacy fields that may exist
  size?: string;
  category?: string;
  template?: string;
}

export interface MigrationResult {
  success: boolean;
  migratedData: BlockData | null;
  warnings: string[];
  errors: string[];
}

export interface MigrationSummary {
  totalItems: number;
  successfulMigrations: number;
  failedMigrations: number;
  warnings: string[];
  errors: string[];
}

/**
 * Maps legacy grid dimensions to appropriate templates
 */
export const mapSizeToTemplate = (
  dimensions: TemplateDimensions,
  tileType: string
): TileTemplate | null => {
  const { w, h } = dimensions;
  
  // Find templates that match the dimensions
  const allTemplates = Object.values(PREDEFINED_TEMPLATES);
  const matchingTemplates = allTemplates.filter(template => 
    template.dimensions.w === w && template.dimensions.h === h
  );
  
  if (matchingTemplates.length === 0) {
    // Try to find the closest template by area
    const targetArea = w * h;
    let closestTemplate: TileTemplate | null = null;
    let closestAreaDiff = Infinity;
    
    for (const template of allTemplates) {
      const templateArea = template.dimensions.w * template.dimensions.h;
      const areaDiff = Math.abs(templateArea - targetArea);
      
      if (areaDiff < closestAreaDiff) {
        // Validate that this template works for the tile type
        const validation = validateTemplateForTileType(template, tileType as any);
        if (validation.isValid) {
          closestTemplate = template;
          closestAreaDiff = areaDiff;
        }
      }
    }
    
    return closestTemplate;
  }
  
  // If multiple templates match, prefer the one that's valid for the tile type
  for (const template of matchingTemplates) {
    const validation = validateTemplateForTileType(template, tileType as any);
    if (validation.isValid) {
      return template;
    }
  }
  
  // If no valid template found, return the first matching one
  return matchingTemplates[0];
};

/**
 * Preserves content during migration while adapting to new structure
 */
export const preserveContent = (
  legacyContent: any,
  tileType: string,
  template: TileTemplate
): any => {
  // Base content structure
  const preservedContent: any = {
    ...legacyContent
  };
  
  // Type-specific content preservation
  switch (tileType) {
    case 'text':
      return {
        text: legacyContent.text || legacyContent.content || '',
        title: legacyContent.title || '',
        category: legacyContent.category || '',
        ...preservedContent
      };
      
    case 'thought':
      return {
        thought: legacyContent.thought || legacyContent.text || legacyContent.content || '',
        category: legacyContent.category || '',
        color: legacyContent.color || template.defaultStyles?.backgroundColor || '#fef3c7',
        ...preservedContent
      };
      
    case 'quote':
      return {
        quote: legacyContent.quote || legacyContent.text || legacyContent.content || '',
        author: legacyContent.author || '',
        source: legacyContent.source || '',
        category: legacyContent.category || '',
        ...preservedContent
      };
      
    case 'image':
      return {
        src: legacyContent.src || legacyContent.imageUrl || legacyContent.url || '',
        alt: legacyContent.alt || legacyContent.title || '',
        title: legacyContent.title || '',
        caption: legacyContent.caption || '',
        category: legacyContent.category || '',
        ...preservedContent
      };
      
    case 'video':
      return {
        src: legacyContent.src || legacyContent.videoUrl || legacyContent.url || '',
        title: legacyContent.title || '',
        description: legacyContent.description || '',
        thumbnail: legacyContent.thumbnail || legacyContent.poster || '',
        autoplay: legacyContent.autoplay || false,
        muted: legacyContent.muted || true,
        category: legacyContent.category || '',
        ...preservedContent
      };
      
    case 'project':
      return {
        title: legacyContent.title || '',
        description: legacyContent.description || '',
        image: legacyContent.image || legacyContent.thumbnail || '',
        link: legacyContent.link || legacyContent.url || '',
        tags: legacyContent.tags || [],
        status: legacyContent.status || 'completed',
        category: legacyContent.category || '',
        ...preservedContent
      };
      
    case 'status':
      return {
        status: legacyContent.status || 'active',
        message: legacyContent.message || legacyContent.text || '',
        color: legacyContent.color || template.defaultStyles?.backgroundColor || '#10b981',
        category: legacyContent.category || '',
        ...preservedContent
      };
      
    default:
      return preservedContent;
  }
};

/**
 * Validates migrated data for consistency and completeness
 */
export const validateMigration = (
  originalData: LegacyBlockData,
  migratedData: BlockData
): { isValid: boolean; warnings: string[]; errors: string[] } => {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Check required fields
  if (!migratedData.id) {
    errors.push('Missing required field: id');
  }
  
  if (!migratedData.type) {
    errors.push('Missing required field: type');
  }
  
  if (!migratedData.template) {
    errors.push('Missing required field: template');
  }
  
  // Check template compatibility
  if (migratedData.template) {
    const validation = validateTemplateForTileType(migratedData.template, migratedData.type);
    if (!validation.isValid) {
      errors.push(`Template ${migratedData.template.id} is not compatible with tile type ${migratedData.type}`);
    }
  }
  
  // Check dimension changes
  if (originalData.w !== migratedData.template?.dimensions.w || 
      originalData.h !== migratedData.template?.dimensions.h) {
    warnings.push(
      `Dimensions changed from ${originalData.w}x${originalData.h} to ${migratedData.template?.dimensions.w}x${migratedData.template?.dimensions.h}`
    );
  }
  
  // Check content preservation
  if (originalData.content && !migratedData.content) {
    warnings.push('Content may have been lost during migration');
  }
  
  // Type-specific validation
  switch (migratedData.type) {
    case 'text':
      if (!migratedData.content?.text && originalData.content?.text) {
        warnings.push('Text content may have been lost');
      }
      break;
      
    case 'image':
      if (!migratedData.content?.src && originalData.content?.src) {
        warnings.push('Image source may have been lost');
      }
      break;
      
    case 'video':
      if (!migratedData.content?.src && originalData.content?.src) {
        warnings.push('Video source may have been lost');
      }
      break;
  }
  
  return {
    isValid: errors.length === 0,
    warnings,
    errors
  };
};

/**
 * Migrates a single legacy block to the new template system
 */
export const migrateLegacyBlock = (legacyBlock: LegacyBlockData): MigrationResult => {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  try {
    // Map dimensions to template
    const template = mapSizeToTemplate(
      { w: legacyBlock.w, h: legacyBlock.h },
      legacyBlock.type
    );
    
    if (!template) {
      errors.push(`No suitable template found for dimensions ${legacyBlock.w}x${legacyBlock.h} and type ${legacyBlock.type}`);
      return {
        success: false,
        migratedData: null,
        warnings,
        errors
      };
    }
    
    // Preserve content
    const preservedContent = preserveContent(legacyBlock.content, legacyBlock.type, template);
    
    // Create migrated block data
    const migratedData: BlockData = {
      id: legacyBlock.id,
      type: legacyBlock.type as any,
      content: preservedContent,
      template: template,
      position: {
        x: legacyBlock.x,
        y: legacyBlock.y
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Validate migration
    const validation = validateMigration(legacyBlock, migratedData);
    warnings.push(...validation.warnings);
    errors.push(...validation.errors);
    
    if (!validation.isValid) {
      return {
        success: false,
        migratedData: null,
        warnings,
        errors
      };
    }
    
    return {
      success: true,
      migratedData,
      warnings,
      errors
    };
    
  } catch (error) {
    errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      success: false,
      migratedData: null,
      warnings,
      errors
    };
  }
};

/**
 * Migrates an array of legacy blocks
 */
export const migrateLegacyData = (legacyBlocks: LegacyBlockData[]): {
  migratedBlocks: BlockData[];
  summary: MigrationSummary;
} => {
  const migratedBlocks: BlockData[] = [];
  const allWarnings: string[] = [];
  const allErrors: string[] = [];
  let successfulMigrations = 0;
  let failedMigrations = 0;
  
  for (const legacyBlock of legacyBlocks) {
    const result = migrateLegacyBlock(legacyBlock);
    
    if (result.success && result.migratedData) {
      migratedBlocks.push(result.migratedData);
      successfulMigrations++;
    } else {
      failedMigrations++;
    }
    
    allWarnings.push(...result.warnings.map(w => `Block ${legacyBlock.id}: ${w}`));
    allErrors.push(...result.errors.map(e => `Block ${legacyBlock.id}: ${e}`));
  }
  
  const summary: MigrationSummary = {
    totalItems: legacyBlocks.length,
    successfulMigrations,
    failedMigrations,
    warnings: allWarnings,
    errors: allErrors
  };
  
  return {
    migratedBlocks,
    summary
  };
};

/**
 * Checks if data needs migration
 */
export const needsMigration = (data: any): boolean => {
  if (!data || !Array.isArray(data)) {
    return false;
  }
  
  // Check if any item lacks template information
  return data.some(item => 
    item && 
    typeof item === 'object' && 
    !item.template && 
    (item.w !== undefined || item.h !== undefined)
  );
};

/**
 * Auto-detects and migrates legacy data
 */
export const autoMigrate = (data: any): {
  needsMigration: boolean;
  migratedData?: BlockData[];
  summary?: MigrationSummary;
} => {
  if (!needsMigration(data)) {
    return { needsMigration: false };
  }
  
  const { migratedBlocks, summary } = migrateLegacyData(data);
  
  return {
    needsMigration: true,
    migratedData: migratedBlocks,
    summary
  };
};