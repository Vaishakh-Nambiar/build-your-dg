import React from 'react';
import { BlockData } from '../Block';

interface ImageTileBlockProps {
    data: BlockData;
    isEditMode: boolean;
    isDebugMode: boolean;
}

/**
 * ImageTileBlock - A calm, editorial image component for digital gardens
 * 
 * Design principles:
 * - Soft, warm, editorial feel with rounded corners and subtle shadows
 * - Container remains fixed during hover - only image moves
 * - Gentle downward image movement on hover (no rotation/bounce)
 * - Optional metadata fades in with opacity only
 * - Respects reduced motion preferences
 */
export const ImageTileBlock: React.FC<ImageTileBlockProps> = ({ 
    data, 
    isEditMode, 
    isDebugMode 
}) => {
    if (!data.imageUrl) {
        return (
            <div className="absolute inset-0 rounded-xl bg-gray-50 shadow-sm flex items-center justify-center">
                <span className="text-gray-400 text-sm">No image</span>
            </div>
        );
    }

    // Determine grid size for responsive behavior
    const gridSize = `${data.w}x${data.h}`;
    const isSmall = data.w <= 2 && data.h <= 2;
    const showMetadata = !isSmall && (data.title || data.caption);

    return (
        <div 
            className="absolute inset-0 rounded-xl overflow-hidden shadow-sm group"
            style={{
                // Soft shadow that matches the calm aesthetic
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.08)'
            }}
        >
            {/* Image container - this is what moves on hover */}
            <div className="relative w-full h-full overflow-hidden">
                <img
                    src={data.imageUrl}
                    alt={data.title || 'Garden image'}
                    className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
                />
                
                {/* Subtle overlay on hover */}
                <div className="absolute inset-0 bg-black/0 transition-colors duration-500 ease-in-out group-hover:bg-black/5 motion-reduce:transition-none" />
                
                {/* Metadata overlay - fades in on hover */}
                {showMetadata && (
                    <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 transition-opacity duration-500 ease-in-out group-hover:opacity-100 motion-reduce:transition-none">
                        <div className="space-y-1">
                            {data.title && (
                                <h3 className="text-white text-sm font-medium leading-tight drop-shadow-sm">
                                    {data.title}
                                </h3>
                            )}
                            {data.caption && (
                                <p className="text-white/90 text-xs leading-relaxed drop-shadow-sm">
                                    {data.caption}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
            
            {/* Debug info */}
            {isDebugMode && (
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {gridSize}
                </div>
            )}
        </div>
    );
};