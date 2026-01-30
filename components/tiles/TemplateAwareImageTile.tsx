/**
 * Template-Aware Image Tile
 * 
 * Enhanced ImageTile component with circle template support for maintaining
 * circular appearance across all screen sizes.
 * 
 * Requirements 5.5: Circle templates maintain their circular appearance at all sizes
 * Requirements 5.2: Implement responsive circle scaling
 */

import React from 'react';
import { clsx } from 'clsx';
import { BlockData } from '../Block';
import { TileTemplate } from '../templates/types';
import { useTemplateStyles } from '../templates/useTemplateStyles';

interface TemplateAwareImageTileProps {
    data: BlockData;
    template?: TileTemplate;
    isEditMode: boolean;
    isDebugMode: boolean;
}

export const TemplateAwareImageTile: React.FC<TemplateAwareImageTileProps> = ({ 
    data, 
    template,
    isEditMode, 
    isDebugMode 
}) => {
    // Get template-aware styles
    const templateStyles = useTemplateStyles({
        template: template || {
            id: 'default-image',
            name: 'Default Image',
            category: 'square',
            dimensions: { w: data.w, h: data.h },
            aspectRatio: 1,
            allowedTileTypes: ['image'],
            responsiveScaling: {
                breakpoints: {
                    mobile: { minWidth: 0, maxWidth: 768, scaleFactor: 0.8 },
                    tablet: { minWidth: 769, maxWidth: 1024, scaleFactor: 0.9 },
                    desktop: { minWidth: 1025, maxWidth: Infinity, scaleFactor: 1.0 }
                }
            }
        },
        enableResponsive: true
    });

    if (!data.imageUrl) return null;

    // Base container classes
    const containerClasses = clsx(
        "absolute inset-0 z-0 transition-transform duration-700 hover:scale-105 overflow-hidden flex flex-col items-center justify-center",
        templateStyles.isCircle && "rounded-full", // Force circular shape for circle templates
        data.isPolaroid && !templateStyles.isCircle
            ? "bg-white shadow-xl rotate-1 p-4 pb-12"
            : !templateStyles.isCircle && "rounded-t-lg",
        templateStyles.containerClassName
    );

    // Image classes with circle template support
    const imageClasses = clsx(
        "w-full h-full",
        data.objectFit === 'contain' ? "object-contain bg-gray-50" : "object-cover",
        templateStyles.isCircle && "rounded-full", // Ensure image is circular
        data.isPolaroid && !templateStyles.isCircle && "border-[8px] border-white shadow-inner",
        templateStyles.contentClassName
    );

    // Container style with template-aware properties
    const containerStyle: React.CSSProperties = {
        ...templateStyles.containerStyle,
        // For circle templates, ensure perfect circular clipping
        ...(templateStyles.isCircle && {
            borderRadius: '50%',
            overflow: 'hidden',
            aspectRatio: '1 / 1'
        })
    };

    // Image style with circle template support
    const imageStyle: React.CSSProperties = {
        ...templateStyles.contentStyle,
        // For circle templates, ensure the image fills the circular container properly
        ...(templateStyles.isCircle && {
            borderRadius: '50%',
            objectFit: data.objectFit === 'contain' ? 'contain' : 'cover',
            width: '100%',
            height: '100%'
        })
    };

    return (
        <>
            <div 
                className={containerClasses}
                style={containerStyle}
            >
                <img
                    src={data.imageUrl}
                    alt={data.title || "Gallery Image"}
                    className={imageClasses}
                    style={imageStyle}
                />
                
                {/* Polaroid styling - disabled for circle templates */}
                {data.isPolaroid && !templateStyles.isCircle && (
                    <div className="absolute bottom-0 left-0 right-0 h-10 w-full bg-white flex items-center justify-between px-4 pb-1">
                        <span className="font-hand text-lg text-gray-600 truncate">
                            {data.title || 'Untitled'}
                        </span>
                        <span className="text-[8px] uppercase tracking-widest text-gray-400 shrink-0">
                            {data.imageTag || 'Photo'}
                        </span>
                    </div>
                )}
                
                {/* Image tag - positioned differently for circle templates */}
                {!data.isPolaroid && data.imageTag && (
                    <div className={clsx(
                        "absolute rounded-md bg-black/30 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-md",
                        templateStyles.isCircle 
                            ? "bottom-2 left-1/2 transform -translate-x-1/2" // Centered for circles
                            : "bottom-4 left-4" // Standard positioning
                    )}>
                        {data.imageTag}
                    </div>
                )}
            </div>
            
            {/* Inject responsive CSS for circle templates */}
            {templateStyles.responsiveCSS && (
                <style>
                    {`:root { ${templateStyles.responsiveCSS} }`}
                </style>
            )}
        </>
    );
};

/**
 * Backward-compatible wrapper that automatically detects circle templates
 */
export const EnhancedImageTile: React.FC<TemplateAwareImageTileProps & {
    templateId?: string;
}> = ({ templateId, ...props }) => {
    // Auto-detect circle template based on tile dimensions and type
    const isLikelyCircle = React.useMemo(() => {
        const { data } = props;
        // If dimensions are square and it's an image tile, it might be a circle template
        return data.w === data.h && data.type === 'image';
    }, [props.data]);

    // Create a mock circle template if likely
    const mockCircleTemplate: TileTemplate | undefined = React.useMemo(() => {
        if (!isLikelyCircle) return undefined;
        
        return {
            id: templateId || 'auto-circle',
            name: 'Auto Circle',
            category: 'circle',
            dimensions: { w: props.data.w, h: props.data.h },
            aspectRatio: 1,
            allowedTileTypes: ['image'],
            responsiveScaling: {
                breakpoints: {
                    mobile: { minWidth: 0, maxWidth: 768, scaleFactor: 0.8 },
                    tablet: { minWidth: 769, maxWidth: 1024, scaleFactor: 0.9 },
                    desktop: { minWidth: 1025, maxWidth: Infinity, scaleFactor: 1.0 }
                }
            }
        };
    }, [isLikelyCircle, templateId, props.data.w, props.data.h]);

    return (
        <TemplateAwareImageTile
            {...props}
            template={props.template || mockCircleTemplate}
        />
    );
};