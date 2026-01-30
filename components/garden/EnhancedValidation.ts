/**
 * Enhanced Form Validation and Error Handling System
 * 
 * Extends the base validation with advanced error handling,
 * save prevention for invalid data, and user-friendly error messages.
 * 
 * Requirements: 4.6, 9
 */

import { BlockData, BlockType } from '../Block';
import { TileTemplate } from '../templates/types';
import { validateFormSubmission, ValidationError, ValidationResult } from './validation';

export interface EnhancedValidationError extends ValidationError {
  severity: 'error' | 'warning' | 'info';
  code: string;
  suggestion?: string;
  relatedFields?: string[];
}

export interface EnhancedValidationResult {
  isValid: boolean;
  canSave: boolean;
  errors: EnhancedValidationError[];
  warnings: EnhancedValidationError[];
  infos: EnhancedValidationError[];
  summary: {
    errorCount: number;
    warningCount: number;
    infoCount: number;
    criticalErrors: string[];
  };
}

export interface ValidationContext {
  template: TileTemplate;
  isNewTile: boolean;
  hasUnsavedChanges: boolean;
  previousData?: BlockData;
}

/**
 * Enhanced validation with context awareness
 */
export class EnhancedValidator {
  private static instance: EnhancedValidator;
  
  static getInstance(): EnhancedValidator {
    if (!EnhancedValidator.instance) {
      EnhancedValidator.instance = new EnhancedValidator();
    }
    return EnhancedValidator.instance;
  }

  /**
   * Comprehensive validation with enhanced error handling
   */
  validateTileData(
    tileData: BlockData, 
    context?: Partial<ValidationContext>
  ): EnhancedValidationResult {
    // Start with base validation
    const baseValidation = validateFormSubmission(tileData);
    
    // Convert base errors to enhanced errors
    const enhancedErrors = baseValidation.errors.map(error => 
      this.enhanceValidationError(error, tileData, context)
    );

    // Add context-specific validations
    const contextErrors = this.validateContext(tileData, context);
    const templateErrors = this.validateTemplateCompatibility(tileData, context?.template);
    const contentQualityWarnings = this.validateContentQuality(tileData);
    const accessibilityWarnings = this.validateAccessibility(tileData);

    // Combine all validations
    const allValidations = [
      ...enhancedErrors,
      ...contextErrors,
      ...templateErrors,
      ...contentQualityWarnings,
      ...accessibilityWarnings
    ];

    // Categorize by severity
    const errors = allValidations.filter(v => v.severity === 'error');
    const warnings = allValidations.filter(v => v.severity === 'warning');
    const infos = allValidations.filter(v => v.severity === 'info');

    // Determine if save should be allowed
    const criticalErrors = errors.filter(e => this.isCriticalError(e.code));
    const canSave = criticalErrors.length === 0;

    return {
      isValid: errors.length === 0,
      canSave,
      errors,
      warnings,
      infos,
      summary: {
        errorCount: errors.length,
        warningCount: warnings.length,
        infoCount: infos.length,
        criticalErrors: criticalErrors.map(e => e.message)
      }
    };
  }

  /**
   * Enhance basic validation error with additional context
   */
  private enhanceValidationError(
    error: ValidationError,
    tileData: BlockData,
    context?: Partial<ValidationContext>
  ): EnhancedValidationError {
    const enhanced: EnhancedValidationError = {
      ...error,
      severity: 'error',
      code: this.generateErrorCode(error.field, error.message)
    };

    // Add suggestions based on error type
    enhanced.suggestion = this.generateSuggestion(error, tileData);

    // Add related fields
    enhanced.relatedFields = this.getRelatedFields(error.field, tileData.type);

    return enhanced;
  }

  /**
   * Validate context-specific rules
   */
  private validateContext(
    tileData: BlockData,
    context?: Partial<ValidationContext>
  ): EnhancedValidationError[] {
    const errors: EnhancedValidationError[] = [];

    if (context?.isNewTile && !tileData.content) {
      errors.push({
        field: 'content',
        message: 'New tiles should have some initial content',
        severity: 'warning',
        code: 'NEW_TILE_EMPTY_CONTENT',
        suggestion: 'Add some placeholder content to help users understand the tile purpose'
      });
    }

    if (context?.hasUnsavedChanges && context.previousData) {
      const significantChanges = this.hasSignificantChanges(tileData, context.previousData);
      if (significantChanges) {
        errors.push({
          field: 'general',
          message: 'You have unsaved changes that will be lost',
          severity: 'warning',
          code: 'UNSAVED_CHANGES',
          suggestion: 'Save your changes before navigating away'
        });
      }
    }

    return errors;
  }

  /**
   * Validate template compatibility
   */
  private validateTemplateCompatibility(
    tileData: BlockData,
    template?: TileTemplate
  ): EnhancedValidationError[] {
    const errors: EnhancedValidationError[] = [];

    if (!template) {
      errors.push({
        field: 'template',
        message: 'No template selected for this tile',
        severity: 'error',
        code: 'MISSING_TEMPLATE',
        suggestion: 'Select an appropriate template for your content'
      });
      return errors;
    }

    // Check if content fits template constraints
    if (template.constraints?.maxContentLength) {
      const contentLength = this.getContentLength(tileData);
      if (contentLength > template.constraints.maxContentLength) {
        errors.push({
          field: 'content',
          message: `Content is too long for this template (${contentLength}/${template.constraints.maxContentLength} characters)`,
          severity: 'error',
          code: 'CONTENT_TOO_LONG',
          suggestion: 'Shorten your content or choose a larger template'
        });
      }
    }

    // Check template-specific requirements
    if (template.category === 'circle' && tileData.type === 'image') {
      errors.push({
        field: 'template',
        message: 'Square images work best with circle templates',
        severity: 'info',
        code: 'CIRCLE_TEMPLATE_IMAGE_HINT',
        suggestion: 'Consider using a square aspect ratio image for better appearance'
      });
    }

    return errors;
  }

  /**
   * Validate content quality
   */
  private validateContentQuality(tileData: BlockData): EnhancedValidationError[] {
    const warnings: EnhancedValidationError[] = [];

    // Check for placeholder content
    const placeholderPatterns = [
      /lorem ipsum/i,
      /placeholder/i,
      /sample text/i,
      /test content/i,
      /example/i
    ];

    const content = this.getAllTextContent(tileData);
    if (placeholderPatterns.some(pattern => pattern.test(content))) {
      warnings.push({
        field: 'content',
        message: 'Content appears to contain placeholder text',
        severity: 'warning',
        code: 'PLACEHOLDER_CONTENT',
        suggestion: 'Replace placeholder text with actual content'
      });
    }

    // Check for very short content
    if (content.length > 0 && content.length < 10) {
      warnings.push({
        field: 'content',
        message: 'Content is very short',
        severity: 'info',
        code: 'SHORT_CONTENT',
        suggestion: 'Consider adding more descriptive content'
      });
    }

    // Check for missing punctuation in longer content
    if (content.length > 50 && !/[.!?]$/.test(content.trim())) {
      warnings.push({
        field: 'content',
        message: 'Content might benefit from proper punctuation',
        severity: 'info',
        code: 'MISSING_PUNCTUATION',
        suggestion: 'Add appropriate punctuation to improve readability'
      });
    }

    return warnings;
  }

  /**
   * Validate accessibility requirements
   */
  private validateAccessibility(tileData: BlockData): EnhancedValidationError[] {
    const warnings: EnhancedValidationError[] = [];

    // Check for alt text on images
    if (tileData.type === 'image' && tileData.content?.src && !tileData.content?.alt) {
      warnings.push({
        field: 'alt',
        message: 'Images should have alt text for accessibility',
        severity: 'warning',
        code: 'MISSING_ALT_TEXT',
        suggestion: 'Add descriptive alt text to help screen readers'
      });
    }

    // Check color contrast for custom colors
    if (tileData.content?.color && this.isLowContrast(tileData.content.color)) {
      warnings.push({
        field: 'color',
        message: 'Color may have poor contrast for readability',
        severity: 'warning',
        code: 'LOW_CONTRAST',
        suggestion: 'Choose a color with better contrast for improved readability'
      });
    }

    // Check for meaningful link text
    if (tileData.content?.link && (!tileData.content?.title || tileData.content.title.toLowerCase().includes('click here'))) {
      warnings.push({
        field: 'title',
        message: 'Link should have descriptive text',
        severity: 'info',
        code: 'GENERIC_LINK_TEXT',
        suggestion: 'Use descriptive text instead of "click here" or generic phrases'
      });
    }

    return warnings;
  }

  /**
   * Generate error code from field and message
   */
  private generateErrorCode(field: string, message: string): string {
    const fieldCode = field.toUpperCase();
    
    if (message.includes('required')) return `${fieldCode}_REQUIRED`;
    if (message.includes('too long') || message.includes('characters or less')) return `${fieldCode}_TOO_LONG`;
    if (message.includes('too short') || message.includes('at least')) return `${fieldCode}_TOO_SHORT`;
    if (message.includes('valid URL')) return `${fieldCode}_INVALID_URL`;
    if (message.includes('valid email')) return `${fieldCode}_INVALID_EMAIL`;
    if (message.includes('valid hex color')) return `${fieldCode}_INVALID_COLOR`;
    
    return `${fieldCode}_VALIDATION_ERROR`;
  }

  /**
   * Generate helpful suggestions for errors
   */
  private generateSuggestion(error: ValidationError, tileData: BlockData): string {
    const suggestions: Record<string, string> = {
      'category': 'Try categories like "work", "personal", "ideas", or "projects"',
      'title': 'Add a clear, descriptive title for your content',
      'content': 'Add some meaningful content to make your tile useful',
      'author': 'Include the author\'s name or attribution',
      'imageUrl': 'Upload an image file or provide a valid image URL',
      'videoUrl': 'Upload a video file or provide a valid video URL',
      'link': 'Ensure the URL starts with http:// or https://',
      'color': 'Use a hex color format like #ffffff or #000000'
    };

    return suggestions[error.field] || 'Please check the field value and try again';
  }

  /**
   * Get related fields that might need attention
   */
  private getRelatedFields(field: string, tileType: BlockType): string[] {
    const relationships: Record<string, string[]> = {
      'title': ['content', 'category'],
      'content': ['title', 'category'],
      'imageUrl': ['alt', 'caption'],
      'videoUrl': ['title', 'description'],
      'author': ['content', 'source'],
      'color': ['content']
    };

    return relationships[field] || [];
  }

  /**
   * Check if error is critical (prevents saving)
   */
  private isCriticalError(code: string): boolean {
    const criticalCodes = [
      'MISSING_TEMPLATE',
      'CONTENT_REQUIRED',
      'TITLE_REQUIRED',
      'IMAGEURL_REQUIRED',
      'VIDEOURL_REQUIRED',
      'AUTHOR_REQUIRED',
      'CATEGORY_REQUIRED',
      'CONTENT_TOO_LONG'
    ];

    return criticalCodes.includes(code);
  }

  /**
   * Check if there are significant changes between versions
   */
  private hasSignificantChanges(current: BlockData, previous: BlockData): boolean {
    const significantFields = ['content', 'title', 'template'];
    
    return significantFields.some(field => {
      const currentValue = JSON.stringify(current[field as keyof BlockData]);
      const previousValue = JSON.stringify(previous[field as keyof BlockData]);
      return currentValue !== previousValue;
    });
  }

  /**
   * Get total content length for template validation
   */
  private getContentLength(tileData: BlockData): number {
    const content = this.getAllTextContent(tileData);
    return content.length;
  }

  /**
   * Get all text content from tile data
   */
  private getAllTextContent(tileData: BlockData): string {
    const textFields = [];
    
    if (tileData.content?.title) textFields.push(tileData.content.title);
    if (tileData.content?.text) textFields.push(tileData.content.text);
    if (tileData.content?.content) textFields.push(tileData.content.content);
    if (tileData.content?.thought) textFields.push(tileData.content.thought);
    if (tileData.content?.quote) textFields.push(tileData.content.quote);
    if (tileData.content?.description) textFields.push(tileData.content.description);
    if (tileData.content?.message) textFields.push(tileData.content.message);
    
    return textFields.join(' ');
  }

  /**
   * Check if color has low contrast (simplified check)
   */
  private isLowContrast(color: string): boolean {
    // Simple check for very light colors that might have poor contrast
    if (!color.startsWith('#')) return false;
    
    const hex = color.substring(1);
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Calculate relative luminance (simplified)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Consider very light colors (>0.9) as potentially low contrast
    return luminance > 0.9;
  }
}

/**
 * Error message display system
 */
export class ValidationErrorDisplay {
  /**
   * Format error for user display
   */
  static formatError(error: EnhancedValidationError): string {
    const prefix = error.severity === 'error' ? '❌' : 
                   error.severity === 'warning' ? '⚠️' : 'ℹ️';
    
    let message = `${prefix} ${error.message}`;
    
    if (error.suggestion) {
      message += `\n💡 ${error.suggestion}`;
    }
    
    return message;
  }

  /**
   * Group errors by field for display
   */
  static groupErrorsByField(errors: EnhancedValidationError[]): Record<string, EnhancedValidationError[]> {
    return errors.reduce((groups, error) => {
      if (!groups[error.field]) {
        groups[error.field] = [];
      }
      groups[error.field].push(error);
      return groups;
    }, {} as Record<string, EnhancedValidationError[]>);
  }

  /**
   * Get summary message for validation result
   */
  static getSummaryMessage(result: EnhancedValidationResult): string {
    const { summary } = result;
    
    if (summary.errorCount === 0 && summary.warningCount === 0) {
      return '✅ All validations passed';
    }
    
    const parts = [];
    
    if (summary.errorCount > 0) {
      parts.push(`${summary.errorCount} error${summary.errorCount > 1 ? 's' : ''}`);
    }
    
    if (summary.warningCount > 0) {
      parts.push(`${summary.warningCount} warning${summary.warningCount > 1 ? 's' : ''}`);
    }
    
    if (summary.infoCount > 0) {
      parts.push(`${summary.infoCount} suggestion${summary.infoCount > 1 ? 's' : ''}`);
    }
    
    return parts.join(', ');
  }
}

/**
 * Save prevention system
 */
export class SavePrevention {
  /**
   * Check if save should be prevented
   */
  static shouldPreventSave(result: EnhancedValidationResult): {
    prevent: boolean;
    reason: string;
    allowForceSave: boolean;
  } {
    if (!result.canSave) {
      return {
        prevent: true,
        reason: `Cannot save due to ${result.summary.criticalErrors.length} critical error${result.summary.criticalErrors.length > 1 ? 's' : ''}`,
        allowForceSave: false
      };
    }
    
    if (result.summary.warningCount > 0) {
      return {
        prevent: false,
        reason: `${result.summary.warningCount} warning${result.summary.warningCount > 1 ? 's' : ''} found`,
        allowForceSave: true
      };
    }
    
    return {
      prevent: false,
      reason: '',
      allowForceSave: false
    };
  }

  /**
   * Get save button state based on validation
   */
  static getSaveButtonState(result: EnhancedValidationResult): {
    disabled: boolean;
    className: string;
    tooltip: string;
    showWarning: boolean;
  } {
    const prevention = this.shouldPreventSave(result);
    
    if (prevention.prevent) {
      return {
        disabled: true,
        className: 'bg-red-100 text-red-600 cursor-not-allowed',
        tooltip: prevention.reason,
        showWarning: true
      };
    }
    
    if (result.summary.warningCount > 0) {
      return {
        disabled: false,
        className: 'bg-yellow-500 text-white hover:bg-yellow-600',
        tooltip: `Save with ${result.summary.warningCount} warning${result.summary.warningCount > 1 ? 's' : ''}`,
        showWarning: true
      };
    }
    
    return {
      disabled: false,
      className: 'bg-black text-white hover:bg-gray-800',
      tooltip: 'Save changes',
      showWarning: false
    };
  }
}