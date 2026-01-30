/**
 * Template-Aware Video Tile
 * 
 * Enhanced VideoTile component with circle template support for maintaining
 * circular appearance across all screen sizes.
 * 
 * Requirements 5.5: Circle templates maintain their circular appearance at all sizes
 * Requirements 5.2: Implement responsive circle scaling
 */

import React from 'react';
import { Volume2, VolumeX, Repeat } from 'lucide-react';
import { clsx } from 'clsx';
import { BlockData } from '../Block';
import { TileTemplate } from '../templates/types';
import { useTemplateStyles } from '../templates/useTemplateStyles';

interface TemplateAwareVideoTileProps {
    data: BlockData;
    template?: TileTemplate;
    isEditMode: boolean;
    isDebugMode: boolean;
    onUpdate: (id: string, updates: Partial<BlockData>) => void;
}

export const TemplateAwareVideoTile: React.FC<TemplateAwareVideoTileProps> = ({ 
    data, 
    template,
    isEditMode, 
    isDebugMode, 
    onUpdate 
}) => {
    // Get template-aware styles
    const templateStyles = useTemplateStyles({
        template: template || {
            id: 'default-video',
            name: 'Default Video',
            category: 'rectangle',
            dimensions: { w: data.w, h: data.h },
            aspectRatio: data.w / data.h,
            allowedTileTypes: ['video'],
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

    if (!data.videoUrl) return null;

    // Container classes with circle template support
    const containerClasses = clsx(
        "absolute inset-0 z-0 overflow-hidden bg-black",
        templateStyles.isCircle ? "rounded-full" : "rounded-lg",
        templateStyles.containerClassName
    );

    // Video classes with circle template support
    const videoClasses = clsx(
        "w-full h-full object-cover",
        templateStyles.isCircle && "rounded-full",
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

    // Video style with circle template support
    const videoStyle: React.CSSProperties = {
        ...templateStyles.contentStyle,
        // For circle templates, ensure the video fills the circular container properly
        ...(templateStyles.isCircle && {
            borderRadius: '50%',
            objectFit: 'cover', // Always use cover for videos to maintain aspect ratio
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
                <video
                    src={data.videoUrl}
                    className={videoClasses}
                    style={videoStyle}
                    loop={data.isLooping !== false}
                    muted={data.isMuted !== false}
                    autoPlay
                    playsInline
                />
                
                {/* Control buttons - positioned differently for circle templates */}
                {!isEditMode && (
                    <div className={clsx(
                        "absolute flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity",
                        templateStyles.isCircle 
                            ? "bottom-2 left-1/2 transform -translate-x-1/2" // Centered for circles
                            : "bottom-4 right-4" // Standard positioning
                    )}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onUpdate(data.id, { isLooping: !data.isLooping });
                            }}
                            className={clsx(
                                "flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all shadow-lg border pointer-events-auto",
                                data.isLooping !== false ? "bg-white/90 text-black" : "bg-black/50 text-white"
                            )}
                            title={data.isLooping !== false ? "Loop On" : "Loop Off"}
                        >
                            <Repeat size={14} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onUpdate(data.id, { isMuted: !data.isMuted });
                            }}
                            className={clsx(
                                "flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all shadow-lg border pointer-events-auto",
                                data.isMuted !== false ? "bg-black/50 text-white" : "bg-white/90 text-black"
                            )}
                            title={data.isMuted !== false ? "Unmute" : "Mute"}
                        >
                            {data.isMuted !== false ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        </button>
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
export const EnhancedVideoTile: React.FC<TemplateAwareVideoTileProps & {
    templateId?: string;
}> = ({ templateId, ...props }) => {
    // Auto-detect circle template based on tile dimensions and type
    const isLikelyCircle = React.useMemo(() => {
        const { data } = props;
        // If dimensions are square and it's a video tile, it might be a circle template
        return data.w === data.h && data.type === 'video';
    }, [props.data]);

    // Create a mock circle template if likely
    const mockCircleTemplate: TileTemplate | undefined = React.useMemo(() => {
        if (!isLikelyCircle) return undefined;
        
        return {
            id: templateId || 'auto-circle-video',
            name: 'Auto Circle Video',
            category: 'circle',
            dimensions: { w: props.data.w, h: props.data.h },
            aspectRatio: 1,
            allowedTileTypes: ['video'],
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
        <TemplateAwareVideoTile
            {...props}
            template={props.template || mockCircleTemplate}
        />
    );
};