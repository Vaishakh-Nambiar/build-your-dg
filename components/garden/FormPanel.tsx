'use client';

import React, { useState, useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AlertCircle } from 'lucide-react';
import { BlockData, BlockType } from '../Block';
import { validateTileData, validateSingleField, validateFileUpload, validateFormSubmission, getFieldDisplayName, ValidationError } from './validation';
import { getTypeChangeUpdates } from './tileDefaults';
import { STANDARD_TILE_SIZES } from './tileSizes';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface FormPanelProps {
    tileData: BlockData;
    onUpdate: (updates: Partial<BlockData>) => void;
    onValidationChange?: (isValid: boolean, errors: ValidationError[]) => void;
    onFileUploadError?: (error: string) => void;
}

const PASTEL_COLORS = [
    '#ffffff', '#fbf8cc', '#fde4cf', '#ffcfd2', '#f1c0e8',
    '#cfbaf0', '#a3c4f3', '#90dbf4', '#8eecf5', '#98f5e1', '#b9fbc0'
];

const TILE_TYPES: { type: BlockType; label: string; description: string }[] = [
    { type: 'text', label: 'Text', description: 'Text content block' },
    { type: 'thought', label: 'Thought', description: 'Sticky note style' },
    { type: 'quote', label: 'Quote', description: 'Quote with attribution' },
    { type: 'image', label: 'Image', description: 'Photo or image' },
    { type: 'video', label: 'Video', description: 'Video or GIF' },
    { type: 'project', label: 'Project', description: 'Project showcase' },
    { type: 'status', label: 'Status', description: 'Status banner' }
];

export const FormPanel: React.FC<FormPanelProps> = ({
    tileData,
    onUpdate,
    onValidationChange,
    onFileUploadError
}) => {
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
    const [fileUploadErrors, setFileUploadErrors] = useState<Record<string, string>>({});

    // Validate form whenever tileData changes
    useEffect(() => {
        const validation = validateFormSubmission(tileData);
        
        // Update field errors for touched fields only
        const newFieldErrors: Record<string, string> = {};
        validation.errors.forEach(error => {
            if (touchedFields.has(error.field)) {
                newFieldErrors[error.field] = error.message;
            }
        });
        
        // Merge with file upload errors
        const allErrors = { ...newFieldErrors, ...fileUploadErrors };
        setFieldErrors(allErrors);
        
        // Notify parent of validation state
        if (onValidationChange) {
            onValidationChange(validation.isValid && Object.keys(fileUploadErrors).length === 0, validation.errors);
        }
    }, [tileData, touchedFields, fileUploadErrors, onValidationChange]);

    // Handle field blur (mark as touched and validate)
    const handleFieldBlur = (fieldName: string) => {
        setTouchedFields(prev => new Set([...prev, fieldName]));
        
        // Validate this specific field
        const error = validateSingleField(fieldName, tileData[fieldName as keyof BlockData], tileData.type);
        if (error) {
            setFieldErrors(prev => ({ ...prev, [fieldName]: error.message }));
        } else {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    };

    // Handle field change with real-time validation for touched fields
    const handleFieldChange = (fieldName: string, value: any) => {
        onUpdate({ [fieldName]: value });
        
        // If field is touched, validate in real-time
        if (touchedFields.has(fieldName)) {
            const error = validateSingleField(fieldName, value, tileData.type);
            if (error) {
                setFieldErrors(prev => ({ ...prev, [fieldName]: error.message }));
            } else {
                setFieldErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[fieldName];
                    return newErrors;
                });
            }
        }
    };

    // Handle file upload with validation
    const handleFileUpload = (file: File, fileType: 'image' | 'video', urlField: string) => {
        // Validate file
        const fileError = validateFileUpload(file, fileType);
        if (fileError) {
            setFileUploadErrors(prev => ({ ...prev, [urlField]: fileError.message }));
            if (onFileUploadError) {
                onFileUploadError(fileError.message);
            }
            return;
        }
        
        // Clear any previous file upload errors
        setFileUploadErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[urlField];
            return newErrors;
        });
        
        // Create object URL for preview
        const fileUrl = URL.createObjectURL(file);
        handleFieldChange(urlField, fileUrl);
        
        // Mark field as touched
        setTouchedFields(prev => new Set([...prev, urlField]));
    };

    // Error display component
    const FieldError: React.FC<{ fieldName: string }> = ({ fieldName }) => {
        const error = fieldErrors[fieldName] || fileUploadErrors[fieldName];
        if (!error) return null;
        
        return (
            <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                <AlertCircle size={12} />
                <span>{error}</span>
            </div>
        );
    };

    // Input wrapper with error styling
    const getInputClassName = (fieldName: string, baseClassName: string) => {
        const hasError = fieldErrors[fieldName] || fileUploadErrors[fieldName];
        return cn(
            baseClassName,
            hasError 
                ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                : "border-gray-300 focus:ring-black focus:border-black"
        );
    };
    const renderCommonFields = () => (
        <div className="space-y-4">
            <div>
                <label htmlFor="category-input" className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                </label>
                <input
                    id="category-input"
                    type="text"
                    value={tileData.category}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    onBlur={() => handleFieldBlur('category')}
                    className={getInputClassName('category', "w-full px-3 py-2 border rounded-lg transition-all text-sm")}
                    placeholder="e.g., Projects, Ideas, Photography"
                />
                <FieldError fieldName="category" />
            </div>

            <div>
                <label htmlFor="title-input" className="block text-sm font-medium text-gray-700 mb-2">
                    Title {(['project', 'status'].includes(tileData.type)) && <span className="text-red-500">*</span>}
                </label>
                <input
                    id="title-input"
                    type="text"
                    value={tileData.title || ''}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    onBlur={() => handleFieldBlur('title')}
                    className={getInputClassName('title', "w-full px-3 py-2 border rounded-lg transition-all text-sm font-medium")}
                    placeholder="Tile title"
                />
                <FieldError fieldName="title" />
            </div>

            <div>
                <label htmlFor="content-input" className="block text-sm font-medium text-gray-700 mb-2">
                    Content {(['text', 'thought', 'quote', 'project'].includes(tileData.type)) && <span className="text-red-500">*</span>}
                </label>
                <textarea
                    id="content-input"
                    value={tileData.content || ''}
                    onChange={(e) => handleFieldChange('content', e.target.value)}
                    onBlur={() => handleFieldBlur('content')}
                    rows={3}
                    className={getInputClassName('content', "w-full px-3 py-2 border rounded-lg transition-all text-sm resize-none")}
                    placeholder="Tile content or description"
                />
                <FieldError fieldName="content" />
            </div>

            <div>
                <label htmlFor="link-input" className="block text-sm font-medium text-gray-700 mb-2">
                    Link URL (optional)
                </label>
                <input
                    id="link-input"
                    type="url"
                    value={tileData.link || ''}
                    onChange={(e) => handleFieldChange('link', e.target.value)}
                    onBlur={() => handleFieldBlur('link')}
                    className={getInputClassName('link', "w-full px-3 py-2 border rounded-lg transition-all text-sm")}
                    placeholder="https://example.com"
                />
                <FieldError fieldName="link" />
            </div>
        </div>
    );

    const renderProjectFields = () => (
        <div className="space-y-4">
            {/* Upload Options */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Image
                </label>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    handleFileUpload(file, 'image', 'imageUrl');
                                }
                            }}
                            className="hidden"
                            id="project-image-upload"
                        />
                        <label
                            htmlFor="project-image-upload"
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors text-sm font-medium"
                        >
                            📁 Upload Image
                        </label>
                        <span className="text-xs text-gray-500">or enter URL below</span>
                    </div>
                    <input
                        type="url"
                        value={tileData.imageUrl || ''}
                        onChange={(e) => handleFieldChange('imageUrl', e.target.value)}
                        onBlur={() => handleFieldBlur('imageUrl')}
                        className={getInputClassName('imageUrl', "w-full px-3 py-2 border rounded-lg transition-all text-sm")}
                        placeholder="https://example.com/image.jpg"
                    />
                    <FieldError fieldName="imageUrl" />
                </div>
            </div>

            {/* Showcase Settings */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Showcase Settings
                </label>
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Background Image (optional)</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        handleFileUpload(file, 'image', 'showcaseBackground');
                                    }
                                }}
                                className="hidden"
                                id="project-bg-upload"
                            />
                            <label
                                htmlFor="project-bg-upload"
                                className="flex items-center gap-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs cursor-pointer transition-colors"
                            >
                                📁 Upload
                            </label>
                            <input
                                type="url"
                                value={tileData.showcaseBackground || ''}
                                onChange={(e) => handleFieldChange('showcaseBackground', e.target.value)}
                                onBlur={() => handleFieldBlur('showcaseBackground')}
                                className={getInputClassName('showcaseBackground', "flex-1 px-3 py-2 border rounded-lg transition-all text-sm")}
                                placeholder="Background URL"
                            />
                        </div>
                        <FieldError fieldName="showcaseBackground" />
                    </div>
                    
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Border Color</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={tileData.showcaseBorderColor || '#cc2727'}
                                onChange={(e) => handleFieldChange('showcaseBorderColor', e.target.value)}
                                className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer"
                            />
                            <input
                                type="text"
                                value={tileData.showcaseBorderColor || '#cc2727'}
                                onChange={(e) => handleFieldChange('showcaseBorderColor', e.target.value)}
                                onBlur={() => handleFieldBlur('showcaseBorderColor')}
                                className={getInputClassName('showcaseBorderColor', "flex-1 px-3 py-2 border rounded-lg transition-all text-sm font-mono")}
                                placeholder="#cc2727"
                            />
                        </div>
                        <FieldError fieldName="showcaseBorderColor" />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Technologies Used (optional)</label>
                        <input
                            type="text"
                            value={tileData.meta || ''}
                            onChange={(e) => handleFieldChange('meta', e.target.value)}
                            onBlur={() => handleFieldBlur('meta')}
                            className={getInputClassName('meta', "w-full px-3 py-2 border rounded-lg transition-all text-sm")}
                            placeholder="React, TypeScript, Tailwind CSS"
                        />
                        <FieldError fieldName="meta" />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderImageFields = () => (
        <div className="space-y-4">
            {/* Upload Options */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Upload <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    handleFileUpload(file, 'image', 'imageUrl');
                                }
                            }}
                            className="hidden"
                            id="image-upload"
                        />
                        <label
                            htmlFor="image-upload"
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors text-sm font-medium"
                        >
                            📁 Upload Image
                        </label>
                        <span className="text-xs text-gray-500">or enter URL below</span>
                    </div>
                    <input
                        type="url"
                        value={tileData.imageUrl || ''}
                        onChange={(e) => handleFieldChange('imageUrl', e.target.value)}
                        onBlur={() => handleFieldBlur('imageUrl')}
                        className={getInputClassName('imageUrl', "w-full px-3 py-2 border rounded-lg transition-all text-sm")}
                        placeholder="https://example.com/image.jpg"
                    />
                    <FieldError fieldName="imageUrl" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Tag (optional)
                </label>
                <input
                    type="text"
                    value={tileData.imageTag || ''}
                    onChange={(e) => handleFieldChange('imageTag', e.target.value)}
                    onBlur={() => handleFieldBlur('imageTag')}
                    className={getInputClassName('imageTag', "w-full px-3 py-2 border rounded-lg transition-all text-sm")}
                    placeholder="e.g., Camera model, film type"
                />
                <FieldError fieldName="imageTag" />
            </div>

            {/* Enhanced Display Settings */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                    Display Settings
                </label>
                
                {/* Object Fit Options */}
                <div>
                    <label className="block text-xs text-gray-600 mb-2">Image Fit</label>
                    <div className="flex gap-3">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                                type="radio"
                                name="objectFit"
                                checked={tileData.objectFit !== 'contain'}
                                onChange={() => onUpdate({ objectFit: 'cover' })}
                                className="text-black focus:ring-black"
                            />
                            Cover (fill container)
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                                type="radio"
                                name="objectFit"
                                checked={tileData.objectFit === 'contain'}
                                onChange={() => onUpdate({ objectFit: 'contain' })}
                                className="text-black focus:ring-black"
                            />
                            Contain (fit to container)
                        </label>
                    </div>
                </div>

                {/* Style Options */}
                <div>
                    <label className="block text-xs text-gray-600 mb-2">Style Options</label>
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                checked={tileData.isPolaroid || false}
                                onChange={() => onUpdate({ isPolaroid: !tileData.isPolaroid })}
                                className="rounded border-gray-300 text-black focus:ring-black"
                            />
                            Polaroid style
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderVideoFields = () => (
        <div className="space-y-4">
            {/* Upload Options */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video Upload <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <input
                            type="file"
                            accept="video/*,.gif"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    handleFileUpload(file, 'video', 'videoUrl');
                                }
                            }}
                            className="hidden"
                            id="video-upload"
                        />
                        <label
                            htmlFor="video-upload"
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors text-sm font-medium"
                        >
                            🎥 Upload Video
                        </label>
                        <span className="text-xs text-gray-500">or enter URL below</span>
                    </div>
                    <input
                        type="url"
                        value={tileData.videoUrl || ''}
                        onChange={(e) => handleFieldChange('videoUrl', e.target.value)}
                        onBlur={() => handleFieldBlur('videoUrl')}
                        className={getInputClassName('videoUrl', "w-full px-3 py-2 border rounded-lg transition-all text-sm")}
                        placeholder="https://example.com/video.mp4"
                    />
                    <FieldError fieldName="videoUrl" />
                    <p className="text-xs text-gray-500">
                        Supports MP4, WebM, and GIF formats
                    </p>
                </div>
            </div>

            {/* Enhanced Playback Controls */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                    Playback Controls
                </label>
                
                <div className="space-y-3">
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                checked={tileData.isLooping !== false}
                                onChange={() => onUpdate({ isLooping: tileData.isLooping === false ? true : false })}
                                className="rounded border-gray-300 text-black focus:ring-black"
                            />
                            Loop video
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                checked={tileData.isMuted !== false}
                                onChange={() => onUpdate({ 
                                    isMuted: tileData.isMuted === false ? true : false 
                                })}
                                className="rounded border-gray-300 text-black focus:ring-black"
                            />
                            Muted by default
                        </label>
                    </div>
                    
                    {/* Video Shape Options */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Video Shape
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onUpdate({ videoShape: 'rectangle' })}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                    (tileData.videoShape || 'rectangle') === 'rectangle'
                                        ? "bg-black text-white"
                                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                )}
                            >
                                Rectangle
                            </button>
                            <button
                                onClick={() => onUpdate({ videoShape: 'circle' })}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                    tileData.videoShape === 'circle'
                                        ? "bg-black text-white"
                                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                )}
                            >
                                Circle
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Circle shape works best with square aspect ratio videos
                        </p>
                    </div>
                    
                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium mb-1">💡 Playback Tips:</p>
                        <ul className="space-y-1">
                            <li>• Videos autoplay when visible</li>
                            <li>• Loop is recommended for short clips</li>
                            <li>• Muted videos comply with browser autoplay policies</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderQuoteFields = () => (
        <div className="space-y-4">
            {/* Rich Text Editing for Quote */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quote Text <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>💡 Rich text formatting:</span>
                        <span className="bg-gray-100 px-2 py-1 rounded">**bold**</span>
                        <span className="bg-gray-100 px-2 py-1 rounded">*italic*</span>
                    </div>
                    <textarea
                        value={tileData.content || ''}
                        onChange={(e) => handleFieldChange('content', e.target.value)}
                        onBlur={() => handleFieldBlur('content')}
                        rows={4}
                        className={getInputClassName('content', "w-full px-3 py-2 border rounded-lg transition-all text-sm resize-none font-serif")}
                        placeholder="Enter the quote text... Use **bold** and *italic* for formatting"
                    />
                    <FieldError fieldName="content" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={tileData.author || ''}
                    onChange={(e) => handleFieldChange('author', e.target.value)}
                    onBlur={() => handleFieldBlur('author')}
                    className={getInputClassName('author', "w-full px-3 py-2 border rounded-lg transition-all text-sm")}
                    placeholder="Quote author"
                />
                <FieldError fieldName="author" />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Source (optional)
                </label>
                <input
                    type="text"
                    value={tileData.meta || ''}
                    onChange={(e) => handleFieldChange('meta', e.target.value)}
                    onBlur={() => handleFieldBlur('meta')}
                    className={getInputClassName('meta', "w-full px-3 py-2 border rounded-lg transition-all text-sm")}
                    placeholder="Book, speech, interview, etc."
                />
                <FieldError fieldName="meta" />
            </div>
        </div>
    );

    const renderTextFields = () => (
        <div className="space-y-4">
            {/* Rich Text Editing for Text Content */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Content <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>💡 Rich text formatting:</span>
                        <span className="bg-gray-100 px-2 py-1 rounded">**bold**</span>
                        <span className="bg-gray-100 px-2 py-1 rounded">*italic*</span>
                    </div>
                    <textarea
                        value={tileData.content || ''}
                        onChange={(e) => handleFieldChange('content', e.target.value)}
                        onBlur={() => handleFieldBlur('content')}
                        rows={6}
                        className={getInputClassName('content', "w-full px-3 py-2 border rounded-lg transition-all text-sm resize-none")}
                        placeholder="Enter your text content... Use **bold** and *italic* for formatting"
                    />
                    <FieldError fieldName="content" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Information (optional)
                </label>
                <input
                    type="text"
                    value={tileData.meta || ''}
                    onChange={(e) => handleFieldChange('meta', e.target.value)}
                    onBlur={() => handleFieldBlur('meta')}
                    className={getInputClassName('meta', "w-full px-3 py-2 border rounded-lg transition-all text-sm")}
                    placeholder="Date, location, or other context"
                />
                <FieldError fieldName="meta" />
            </div>

            {/* Background Options */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Style
                </label>
                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                            type="checkbox"
                            checked={tileData.isTransparent || false}
                            onChange={() => onUpdate({ isTransparent: !tileData.isTransparent })}
                            className="rounded border-gray-300 text-black focus:ring-black"
                        />
                        Transparent background
                    </label>
                    <p className="text-xs text-gray-500">
                        When enabled, the text will appear without a background, blending with the garden layout
                    </p>
                </div>
            </div>
        </div>
    );

    const renderThoughtFields = () => (
        <div className="space-y-4">
            {/* Rich Text Editing for Thought Content */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thought Content <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>💭 Keep it short and sweet for sticky note style</span>
                    </div>
                    <textarea
                        value={tileData.content || tileData.title || ''}
                        onChange={(e) => {
                            handleFieldChange('content', e.target.value);
                            handleFieldChange('title', e.target.value);
                        }}
                        onBlur={() => {
                            handleFieldBlur('content');
                            handleFieldBlur('title');
                        }}
                        rows={3}
                        className={getInputClassName('content', "w-full px-3 py-2 border rounded-lg transition-all text-sm resize-none font-hand")}
                        placeholder="Quick thought or note..."
                        maxLength={150}
                    />
                    <div className="flex justify-between items-center">
                        <FieldError fieldName="content" />
                        <div className={cn(
                            "text-xs text-right",
                            (tileData.content || tileData.title || '').length > 120 ? "text-amber-600" : "text-gray-400"
                        )}>
                            {(tileData.content || tileData.title || '').length}/150 characters
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mood/Tags (optional)
                </label>
                <input
                    type="text"
                    value={tileData.meta || ''}
                    onChange={(e) => handleFieldChange('meta', e.target.value)}
                    onBlur={() => handleFieldBlur('meta')}
                    className={getInputClassName('meta', "w-full px-3 py-2 border rounded-lg transition-all text-sm")}
                    placeholder="happy, work, idea, reminder"
                />
                <FieldError fieldName="meta" />
            </div>
        </div>
    );

    const renderTypeSpecificFields = () => {
        switch (tileData.type) {
            case 'project':
                return renderProjectFields();
            case 'image':
                return renderImageFields();
            case 'video':
                return renderVideoFields();
            case 'quote':
                return renderQuoteFields();
            case 'text':
                return renderTextFields();
            case 'thought':
                return renderThoughtFields();
            case 'status':
            default:
                return null; // Common fields are sufficient for status tiles
        }
    };

    return (
        <div className="p-6 space-y-8">
            {/* Tile Type Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tile Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {TILE_TYPES.map(({ type, label, description }) => (
                        <button
                            key={type}
                            onClick={() => {
                                const updates = getTypeChangeUpdates(type, tileData);
                                onUpdate(updates);
                            }}
                            className={cn(
                                "p-3 rounded-lg border text-left transition-all text-sm",
                                tileData.type === type
                                    ? "bg-black text-white border-black"
                                    : "bg-white hover:bg-gray-50 border-gray-300"
                            )}
                        >
                            <div className="font-medium">{label}</div>
                            <div className={cn(
                                "text-xs mt-1",
                                tileData.type === type ? "text-gray-300" : "text-gray-500"
                            )}>
                                {description}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tile Size Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tile Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {STANDARD_TILE_SIZES.map(size => (
                        <button
                            key={`${size.w}x${size.h}`}
                            onClick={() => onUpdate({ w: size.w, h: size.h })}
                            className={cn(
                                "p-3 rounded-lg border text-left transition-all text-sm",
                                tileData.w === size.w && tileData.h === size.h
                                    ? "bg-black text-white border-black"
                                    : "bg-white hover:bg-gray-50 border-gray-300"
                            )}
                        >
                            <div className="font-medium font-mono">{size.label}</div>
                            <div className={cn(
                                "text-xs mt-1",
                                tileData.w === size.w && tileData.h === size.h ? "text-gray-300" : "text-gray-500"
                            )}>
                                {size.desc}
                            </div>
                        </button>
                    ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    💡 Width × Height in grid units. Larger sizes work better for content-rich tiles.
                </p>
            </div>

            {/* Color Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Background Color
                </label>
                <div className="flex flex-wrap gap-2">
                    {PASTEL_COLORS.map(color => (
                        <button
                            key={color}
                            onClick={() => onUpdate({ color })}
                            className={cn(
                                "w-8 h-8 rounded-full border-2 transition-all hover:scale-110",
                                tileData.color === color
                                    ? "border-black ring-2 ring-black ring-offset-2"
                                    : "border-gray-200 hover:border-gray-400"
                            )}
                            style={{ backgroundColor: color }}
                            title={color}
                        />
                    ))}
                </div>
            </div>

            {/* Common Fields */}
            <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Basic Information</h3>
                {renderCommonFields()}
            </div>

            {/* Type-Specific Fields */}
            {renderTypeSpecificFields() && (
                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">
                        {tileData.type.charAt(0).toUpperCase() + tileData.type.slice(1)} Settings
                    </h3>
                    {renderTypeSpecificFields()}
                </div>
            )}

            {/* Tile Dimensions Info */}
            <div className="pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 space-y-1">
                    <div>Grid Position: {tileData.x}, {tileData.y}</div>
                    <div>Dimensions: {tileData.w}×{tileData.h} units</div>
                    <div className="text-amber-600">
                        ⚠️ Resizing is disabled in template mode
                    </div>
                </div>
            </div>
        </div>
    );
};