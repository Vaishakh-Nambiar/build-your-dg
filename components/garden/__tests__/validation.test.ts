import { validateTileData, validateSingleField, validateFileUpload, validateFormSubmission, getFieldDisplayName } from '../validation';
import { BlockData } from '../../Block';

// Mock tile data for testing
const createMockTile = (overrides: Partial<BlockData> = {}): BlockData => ({
    id: 'test-tile',
    type: 'text',
    category: 'Test Category',
    title: 'Test Title',
    content: 'Test Content',
    color: '#ffffff',
    x: 0,
    y: 0,
    w: 2,
    h: 2,
    ...overrides
});

describe('validation', () => {
    describe('validateTileData', () => {
        it('validates required fields for text tiles', () => {
            const validTile = createMockTile({ type: 'text' });
            const result = validateTileData(validTile);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('fails validation when category is missing', () => {
            const invalidTile = createMockTile({ category: '' });
            const result = validateTileData(invalidTile);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'category',
                message: 'Category is required'
            });
        });

        it('fails validation when content is missing for text tiles', () => {
            const invalidTile = createMockTile({ type: 'text', content: '' });
            const result = validateTileData(invalidTile);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'content',
                message: 'Content is required for this tile type'
            });
        });

        it('validates required fields for quote tiles', () => {
            const validQuote = createMockTile({ 
                type: 'quote', 
                content: 'Great quote',
                author: 'Famous Person'
            });
            const result = validateTileData(validQuote);
            expect(result.isValid).toBe(true);
        });

        it('fails validation when author is missing for quote tiles', () => {
            const invalidQuote = createMockTile({ 
                type: 'quote', 
                content: 'Great quote',
                author: ''
            });
            const result = validateTileData(invalidQuote);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'author',
                message: 'Author is required for quote tiles'
            });
        });

        it('validates required fields for image tiles', () => {
            const validImage = createMockTile({ 
                type: 'image', 
                imageUrl: 'https://example.com/image.jpg'
            });
            const result = validateTileData(validImage);
            expect(result.isValid).toBe(true);
        });

        it('fails validation when imageUrl is missing for image tiles', () => {
            const invalidImage = createMockTile({ type: 'image', imageUrl: '' });
            const result = validateTileData(invalidImage);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'imageUrl',
                message: 'Image URL is required for image tiles'
            });
        });

        it('validates URL format', () => {
            const invalidUrl = createMockTile({ link: 'not-a-url' });
            const result = validateTileData(invalidUrl);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'link',
                message: 'link must be a valid URL (e.g., https://example.com)'
            });
        });

        it('validates character limits for thought tiles', () => {
            const longContent = 'a'.repeat(151);
            const invalidThought = createMockTile({ 
                type: 'thought', 
                content: longContent 
            });
            const result = validateTileData(invalidThought);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'content',
                message: 'Thought content must be 150 characters or less'
            });
        });

        it('validates minimum length requirements', () => {
            const shortCategory = createMockTile({ category: 'a' });
            const result = validateTileData(shortCategory);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContainEqual({
                field: 'category',
                message: 'category must be at least 2 characters long'
            });
        });
    });

    describe('validateSingleField', () => {
        it('validates individual fields correctly', () => {
            const error = validateSingleField('category', '', 'text');
            expect(error).toEqual({
                field: 'category',
                message: 'Category is required'
            });
        });

        it('returns null for valid fields', () => {
            const error = validateSingleField('category', 'Valid Category', 'text');
            expect(error).toBeNull();
        });

        it('validates URL fields', () => {
            const error = validateSingleField('link', 'invalid-url', 'text');
            expect(error).toEqual({
                field: 'link',
                message: 'link must be a valid URL (e.g., https://example.com)'
            });
        });
    });

    describe('validateFileUpload', () => {
        it('validates file size for images', () => {
            const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
            const error = validateFileUpload(largeFile, 'image');
            expect(error).toEqual({
                field: 'imageFile',
                message: 'File size must be less than 10MB'
            });
        });

        it('validates file type for images', () => {
            const invalidFile = new File(['content'], 'file.txt', { type: 'text/plain' });
            const error = validateFileUpload(invalidFile, 'image');
            expect(error).toEqual({
                field: 'imageFile',
                message: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)'
            });
        });

        it('accepts valid image files', () => {
            const validFile = new File(['content'], 'image.jpg', { type: 'image/jpeg' });
            const error = validateFileUpload(validFile, 'image');
            expect(error).toBeNull();
        });
    });

    describe('validateFormSubmission', () => {
        it('performs comprehensive validation before submission', () => {
            const invalidTile = createMockTile({ 
                category: '',
                content: '',
                type: 'text'
            });
            const result = validateFormSubmission(invalidTile);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it('validates blob URLs for uploaded files', () => {
            const tileWithBlobUrl = createMockTile({ 
                type: 'image',
                imageUrl: 'blob:http://localhost/12345'
            });
            const result = validateFormSubmission(tileWithBlobUrl);
            // Should be valid because blob URLs are accepted for uploaded files
            expect(result.isValid).toBe(true);
        });
    });

    describe('getFieldDisplayName', () => {
        it('returns user-friendly field names', () => {
            expect(getFieldDisplayName('category')).toBe('Category');
            expect(getFieldDisplayName('imageUrl')).toBe('Image URL');
            expect(getFieldDisplayName('showcaseBorderColor')).toBe('Border Color');
        });

        it('returns the field name if no display name is defined', () => {
            expect(getFieldDisplayName('unknownField')).toBe('unknownField');
        });
    });
});