/**
 * Form validation utilities for garden builder components
 * Implements validation rules and error handling for tile data
 */

import { BlockData, BlockType } from '../Block';

export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

/**
 * Validation rules for different field types
 */
const VALIDATION_RULES = {
    // Required fields
    REQUIRED_FIELDS: {
        category: 'Category is required',
        title: 'Title is required for this tile type',
        content: 'Content is required for this tile type',
        author: 'Author is required for quote tiles',
        imageUrl: 'Image URL is required for image tiles',
        videoUrl: 'Video URL is required for video tiles'
    },
    
    // Field length limits
    MAX_LENGTHS: {
        category: 50,
        title: 100,
        content: 1000,
        thoughtContent: 150,
        author: 100,
        meta: 200,
        imageTag: 100
    },
    
    // Minimum length requirements
    MIN_LENGTHS: {
        category: 2,
        title: 3,
        content: 5,
        author: 2
    },
    
    // URL validation pattern (more comprehensive)
    URL_PATTERN: /^https?:\/\/(?:[-\w.])+(?:\:[0-9]+)?(?:\/(?:[\w\/_.])*(?:\?(?:[\w&=%.])*)?(?:\#(?:[\w.])*)?)?$/,
    
    // Color validation pattern (hex colors)
    COLOR_PATTERN: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    
    // File size limits (in bytes)
    MAX_FILE_SIZE: {
        image: 10 * 1024 * 1024, // 10MB
        video: 100 * 1024 * 1024  // 100MB
    }
};

/**
 * Validates a single field value
 */
function validateField(field: string, value: any, tileType: BlockType): ValidationError | null {
    // Check required fields based on tile type
    if (isFieldRequired(field, tileType) && (!value || value.toString().trim() === '')) {
        return {
            field,
            message: VALIDATION_RULES.REQUIRED_FIELDS[field as keyof typeof VALIDATION_RULES.REQUIRED_FIELDS] || `${field} is required`
        };
    }
    
    // Skip validation for empty optional fields
    if (!value || value.toString().trim() === '') {
        return null;
    }
    
    const stringValue = value.toString().trim();
    
    // Minimum length validation for required fields
    const minLength = VALIDATION_RULES.MIN_LENGTHS[field as keyof typeof VALIDATION_RULES.MIN_LENGTHS];
    if (minLength && stringValue.length < minLength && stringValue.length > 0) {
        return {
            field,
            message: `${field} must be at least ${minLength} characters long`
        };
    }
    
    // Length validation
    const maxLength = VALIDATION_RULES.MAX_LENGTHS[field as keyof typeof VALIDATION_RULES.MAX_LENGTHS];
    if (maxLength && stringValue.length > maxLength) {
        return {
            field,
            message: `${field} must be ${maxLength} characters or less`
        };
    }
    
    // URL validation (allow blob URLs for uploaded files)
    if ((field === 'link' || field === 'imageUrl' || field === 'videoUrl' || field === 'showcaseBackground') && stringValue) {
        // Allow blob URLs (for uploaded files) or regular URLs
        const isBlobUrl = stringValue.startsWith('blob:');
        const isValidUrl = VALIDATION_RULES.URL_PATTERN.test(stringValue);
        
        if (!isBlobUrl && !isValidUrl) {
            return {
                field,
                message: `${field} must be a valid URL (e.g., https://example.com)`
            };
        }
    }
    
    // Color validation
    if ((field === 'color' || field === 'showcaseBorderColor') && stringValue) {
        if (!VALIDATION_RULES.COLOR_PATTERN.test(stringValue)) {
            return {
                field,
                message: `${field} must be a valid hex color (e.g., #ffffff)`
            };
        }
    }
    
    // Special validation for thought content (character limit)
    if (field === 'content' && tileType === 'thought' && stringValue.length > VALIDATION_RULES.MAX_LENGTHS.thoughtContent) {
        return {
            field,
            message: `Thought content must be ${VALIDATION_RULES.MAX_LENGTHS.thoughtContent} characters or less`
        };
    }
    
    // Email validation for author field if it looks like an email
    if (field === 'author' && stringValue.includes('@')) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(stringValue)) {
            return {
                field,
                message: 'Author email must be a valid email address'
            };
        }
    }
    
    return null;
}

/**
 * Determines if a field is required based on tile type
 */
function isFieldRequired(field: string, tileType: BlockType): boolean {
    // Category is always required
    if (field === 'category') return true;
    
    // Type-specific required fields
    switch (tileType) {
        case 'text':
        case 'thought':
            return field === 'content';
        case 'quote':
            return field === 'content' || field === 'author';
        case 'image':
            return field === 'imageUrl';
        case 'video':
            return field === 'videoUrl';
        case 'project':
            return field === 'title' || field === 'content';
        case 'status':
            return field === 'title';
        default:
            return false;
    }
}

/**
 * Validates all fields in tile data
 */
export function validateTileData(tileData: BlockData): ValidationResult {
    const errors: ValidationError[] = [];
    
    // Define fields to validate based on tile type
    const fieldsToValidate = getFieldsToValidate(tileData.type);
    
    // Validate each field
    for (const field of fieldsToValidate) {
        const value = tileData[field as keyof BlockData];
        const error = validateField(field, value, tileData.type);
        if (error) {
            errors.push(error);
        }
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Gets the list of fields that should be validated for a given tile type
 */
function getFieldsToValidate(tileType: BlockType): string[] {
    const commonFields = ['category', 'title', 'content', 'link', 'color'];
    
    switch (tileType) {
        case 'text':
            return [...commonFields, 'meta'];
        case 'thought':
            return ['category', 'content', 'meta', 'color'];
        case 'quote':
            return [...commonFields, 'author', 'meta'];
        case 'image':
            return [...commonFields, 'imageUrl', 'imageTag'];
        case 'video':
            return [...commonFields, 'videoUrl'];
        case 'project':
            return [...commonFields, 'imageUrl', 'showcaseBackground', 'showcaseBorderColor', 'meta'];
        case 'status':
            return ['category', 'title', 'content', 'color'];
        default:
            return commonFields;
    }
}

/**
 * Validates a single field (for real-time validation)
 */
export function validateSingleField(field: string, value: any, tileType: BlockType): ValidationError | null {
    return validateField(field, value, tileType);
}

/**
 * Gets user-friendly field names for error messages
 */
export function getFieldDisplayName(field: string): string {
    const displayNames: Record<string, string> = {
        category: 'Category',
        title: 'Title',
        content: 'Content',
        link: 'Link URL',
        author: 'Author',
        imageUrl: 'Image URL',
        videoUrl: 'Video URL',
        imageTag: 'Image Tag',
        meta: 'Meta Information',
        showcaseBackground: 'Background Image URL',
        showcaseBorderColor: 'Border Color',
        color: 'Background Color'
    };
    
    return displayNames[field] || field;
}

/**
 * Validates file uploads (size, type, etc.)
 */
export function validateFileUpload(file: File, fileType: 'image' | 'video'): ValidationError | null {
    // Check file size
    const maxSize = VALIDATION_RULES.MAX_FILE_SIZE[fileType];
    if (file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024));
        return {
            field: `${fileType}File`,
            message: `File size must be less than ${maxSizeMB}MB`
        };
    }
    
    // Check file type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'image/gif'];
    
    if (fileType === 'image' && !validImageTypes.includes(file.type)) {
        return {
            field: 'imageFile',
            message: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)'
        };
    }
    
    if (fileType === 'video' && !validVideoTypes.includes(file.type)) {
        return {
            field: 'videoFile',
            message: 'Please upload a valid video file (MP4, WebM, OGG, or GIF)'
        };
    }
    
    return null;
}

/**
 * Validates form data before submission
 */
export function validateFormSubmission(tileData: BlockData): ValidationResult {
    const validation = validateTileData(tileData);
    
    // Additional submission-specific validations
    const additionalErrors: ValidationError[] = [];
    
    // Ensure at least some content exists for content-heavy tiles
    if (['text', 'quote', 'project'].includes(tileData.type)) {
        const hasContent = tileData.content && tileData.content.trim().length > 0;
        const hasTitle = tileData.title && tileData.title.trim().length > 0;
        
        if (!hasContent && !hasTitle) {
            additionalErrors.push({
                field: 'content',
                message: 'Either title or content must be provided'
            });
        }
    }
    
    // Validate that media tiles have valid URLs or uploaded files
    if (tileData.type === 'image' && tileData.imageUrl) {
        // Check if it's a blob URL (uploaded file) or external URL
        if (!tileData.imageUrl.startsWith('blob:') && !VALIDATION_RULES.URL_PATTERN.test(tileData.imageUrl)) {
            additionalErrors.push({
                field: 'imageUrl',
                message: 'Please provide a valid image URL or upload a file'
            });
        }
    }
    
    if (tileData.type === 'video' && tileData.videoUrl) {
        // Check if it's a blob URL (uploaded file) or external URL
        if (!tileData.videoUrl.startsWith('blob:') && !VALIDATION_RULES.URL_PATTERN.test(tileData.videoUrl)) {
            additionalErrors.push({
                field: 'videoUrl',
                message: 'Please provide a valid video URL or upload a file'
            });
        }
    }
    
    const allErrors = [...validation.errors, ...additionalErrors];
    
    return {
        isValid: allErrors.length === 0,
        errors: allErrors
    };
}