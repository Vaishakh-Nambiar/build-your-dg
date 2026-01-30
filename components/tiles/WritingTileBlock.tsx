import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { BlockData } from '../Block';

interface WritingTileBlockProps {
    data: BlockData;
    isEditMode: boolean;
    isDebugMode: boolean;
}

/**
 * WritingTileBlock - A calm, editorial component for long-form writing
 * 
 * Design principles:
 * - Editorial, calm, minimal aesthetic
 * - Typographically driven with clear hierarchy
 * - Soft background with generous internal spacing
 * - Represents blog posts, essays, journal entries
 * - Feels like a quiet page from a personal notebook
 */
export const WritingTileBlock: React.FC<WritingTileBlockProps> = ({ 
    data, 
    isEditMode, 
    isDebugMode 
}) => {
    // Determine grid size for responsive behavior
    const gridSize = `${data.w}x${data.h}`;
    const isSmall = data.w <= 2 && data.h <= 2;
    const isFeatured = data.w >= 3 && data.h >= 4;
    const isStandard = !isSmall && !isFeatured;

    // Format date
    const formatDate = (dateInput: Date | string | undefined) => {
        if (!dateInput) return '';
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    // Determine excerpt line clamp based on grid size
    const getExcerptClamp = () => {
        if (isSmall) return 'line-clamp-2';
        if (isFeatured) return 'line-clamp-6';
        return 'line-clamp-4';
    };

    // Determine title size based on grid size
    const getTitleSize = () => {
        if (isSmall) return 'text-lg';
        if (isFeatured) return 'text-2xl';
        return 'text-xl';
    };

    const handleClick = () => {
        if (data.link) {
            window.open(data.link, '_blank', 'noopener,noreferrer');
        }
        // Could also trigger onOpen callback if provided
    };

    return (
        <div 
            className="absolute inset-0 rounded-xl overflow-hidden group cursor-pointer"
            onClick={handleClick}
            style={{
                backgroundColor: '#fafaf9', // Soft off-white background
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06)'
            }}
        >
            {/* Main content container */}
            <div className="h-full p-4 sm:p-5 lg:p-6 flex flex-col">
                
                {/* Category label and optional arrow */}
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <span className="text-xs text-gray-500 font-medium tracking-wide">
                        Writing · Blog
                    </span>
                    
                    {/* Arrow icon - fades in on hover */}
                    <ArrowUpRight 
                        size={16} 
                        className="text-gray-400 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-60 motion-reduce:transition-none" 
                    />
                </div>

                {/* Title - primary visual focus */}
                <h2 className={`font-serif leading-tight text-gray-900 mb-2 sm:mb-3 ${getTitleSize()} ${isSmall ? 'line-clamp-2' : ''}`}>
                    {data.title || 'Untitled'}
                </h2>

                {/* Date */}
                <time className="text-sm text-gray-500 mb-3 sm:mb-4 block">
                    {formatDate(data.publishedAt)}
                </time>

                {/* Excerpt - body text */}
                <div className="flex-1 overflow-hidden">
                    <p className={`text-sm leading-relaxed text-gray-700 ${getExcerptClamp()}`}>
                        {data.excerpt || data.content || ''}
                    </p>
                </div>
            </div>

            {/* Subtle hover effect - slight shadow increase */}
            <div 
                className="absolute inset-0 rounded-xl pointer-events-none transition-shadow duration-300 ease-in-out group-hover:shadow-lg motion-reduce:transition-none"
                style={{
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.1)'
                }}
            />
            
            {/* Debug info */}
            {isDebugMode && (
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {gridSize}
                </div>
            )}
        </div>
    );
};