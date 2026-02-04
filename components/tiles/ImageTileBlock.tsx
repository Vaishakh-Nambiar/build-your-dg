import React from 'react';
import { clsx } from 'clsx';
import { BlockData } from '../Block';

interface ImageTileBlockProps {
    data: BlockData;
    isEditMode: boolean;
    isDebugMode: boolean;
}

/**
 * ImageTileBlock - STACKED DESIGN (NEW DEFAULT)
 * 
 * Features:
 * - Two stacked containers: image (front) and content (back)
 * - ENTIRE TILE triggers hover effect
 * - Image moves down on hover to reveal content behind
 * - Dynamic shift based on title length (minimum 10%)
 * - Tag styling changes on hover (white -> black background)
 * - Title at top-left of back container
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

    // Calculate dynamic shift based on title length
    const titleLength = data.title?.length || 0;
    const titleLines = Math.ceil(titleLength / 25); // Rough estimate for smaller tiles
    const baseShift = 10; // Minimum 10%
    const titleShift = titleLines * 6; // Additional shift per line
    const totalShift = Math.max(baseShift, baseShift + titleShift);

    return (
        <div 
            className="absolute inset-0 rounded-xl overflow-hidden shadow-sm group cursor-pointer"
            style={{
                '--image-shift': `${totalShift}%`,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.08)'
            } as React.CSSProperties}
        >
            {/* ============================= */}
            {/* BACK CONTAINER (CONTENT) - Always behind */}
            {/* ============================= */}
            <div className="absolute inset-0 z-0 flex flex-col justify-start bg-neutral-900 text-white px-4 pt-4 pb-4">
                {/* Title at the top, aligned left */}
                {data.title && (
                    <h3 className="text-sm font-medium leading-tight text-left max-w-full break-words mb-2">
                        {data.title}
                    </h3>
                )}
                
                {/* Additional content */}
                {data.caption && (
                    <p className="text-xs text-white/80 leading-relaxed">
                        {data.caption}
                    </p>
                )}
                
                {data.content && (
                    <p className="text-xs text-white/80 leading-relaxed mt-2">
                        {data.content}
                    </p>
                )}
                
                {/* Category at bottom */}
                <div className="mt-auto">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">
                        {data.category || 'Photography'}
                    </span>
                </div>
            </div>

            {/* ============================= */}
            {/* FRONT CONTAINER (IMAGE) - Moves on hover */}
            {/* ============================= */}
            <div 
                className={clsx(
                    "absolute inset-0 z-10 transition-transform duration-500 ease-out group-hover:translate-y-[var(--image-shift)]",
                    data.isPolaroid ? "bg-white shadow-xl p-4 pb-12 rounded-xl" : "rounded-xl overflow-hidden"
                )}
            >
                {/* Image */}
                <img
                    src={data.imageUrl}
                    alt={data.title || 'Garden image'}
                    className={clsx(
                        "w-full h-full transition-all duration-500 pointer-events-none",
                        data.objectFit === 'contain' ? 'object-contain bg-gray-50' : 'object-cover',
                        data.isPolaroid ? 'rounded-sm' : 'rounded-xl'
                    )}
                />
                
                {/* Image Tag - Changes style on hover */}
                {data.imageTag && (
                    <div className="absolute bottom-4 left-4 text-[10px] font-medium px-2 py-1 rounded-md transition-all duration-300 ease-out text-white bg-white/20 group-hover:bg-black group-hover:text-white backdrop-blur-sm border border-white/30 group-hover:border-black pointer-events-none">
                        {data.imageTag}
                    </div>
                )}
                
                {/* Optional overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
            
            {/* Debug info */}
            {isDebugMode && (
                <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded z-20 pointer-events-none">
                    BLOCK {data.w}x{data.h}
                </div>
            )}
        </div>
    );
};