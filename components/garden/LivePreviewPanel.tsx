'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BlockData } from '../Block';
import { 
    TextTile, 
    ThoughtTile, 
    QuoteTile, 
    ImageTileBlock, 
    VideoTile, 
    StatusTile, 
    WritingTileBlock,
    ProjectTile 
} from '../tiles';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface LivePreviewPanelProps {
    tileData: BlockData;
    className?: string;
}

export const LivePreviewPanel: React.FC<LivePreviewPanelProps> = ({
    tileData,
    className
}) => {
    const getPreviewContainerClasses = () => {
        const base = "group relative overflow-hidden transition-[background-color,border-color,opacity,box-shadow,transform] duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]";
        const border = "border border-black/[0.06] hover:shadow-2xl hover:shadow-black/5";

        if (tileData.type === 'thought') {
            return cn(
                base,
                "shadow-lg rotate-1 hover:rotate-0 border-none"
            );
        }

        // Premium styling for project tiles - match Block exactly
        if (tileData.type === 'project') {
            return cn(
                base,
                "rounded-[8px] bg-[#F9F9F9] shadow-sm border border-black/5 hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1"
            );
        }

        return cn(base, "rounded-[8px] bg-white shadow-sm", border);
    };

    // Calculate preview dimensions based on actual grid system
    // This matches the exact calculations from GridEngine.tsx
    const getPreviewDimensions = (breakpoint: 'xl' | 'lg' | 'md' | 'sm' = 'xl') => {
        // Use responsive configs from GridEngine
        const RESPONSIVE_CONFIGS = {
            xl: { cols: 12, rowHeight: 100, margin: [16, 16], containerWidth: 800 },
            lg: { cols: 10, rowHeight: 90, margin: [14, 14], containerWidth: 700 },
            md: { cols: 8, rowHeight: 80, margin: [12, 12], containerWidth: 600 },
            sm: { cols: 6, rowHeight: 70, margin: [10, 10], containerWidth: 500 }
        };
        
        const config = RESPONSIVE_CONFIGS[breakpoint];
        const { cols: MAX_COLS, rowHeight: ROW_HEIGHT, margin: GRID_MARGIN, containerWidth } = config;
        
        const colWidth = (containerWidth - ((MAX_COLS - 1) * GRID_MARGIN[0])) / MAX_COLS;
        
        // Calculate actual tile dimensions using grid formulas
        const actualWidth = tileData.w * colWidth + (tileData.w - 1) * GRID_MARGIN[0];
        const actualHeight = tileData.h * ROW_HEIGHT + (tileData.h - 1) * GRID_MARGIN[1];
        
        // Scale down for preview if too large, but maintain aspect ratio
        const maxPreviewWidth = 400;
        const maxPreviewHeight = 300;
        
        let previewWidth = actualWidth;
        let previewHeight = actualHeight;
        
        // Scale down proportionally if needed
        if (actualWidth > maxPreviewWidth || actualHeight > maxPreviewHeight) {
            const scaleX = maxPreviewWidth / actualWidth;
            const scaleY = maxPreviewHeight / actualHeight;
            const scale = Math.min(scaleX, scaleY);
            
            previewWidth = actualWidth * scale;
            previewHeight = actualHeight * scale;
        }
        
        return { 
            width: Math.round(previewWidth), 
            height: Math.round(previewHeight),
            actualWidth: Math.round(actualWidth),
            actualHeight: Math.round(actualHeight),
            colWidth: Math.round(colWidth),
            rowHeight: ROW_HEIGHT,
            breakpoint
        };
    };

    const { width, height, actualWidth, actualHeight, colWidth, rowHeight, breakpoint } = getPreviewDimensions();

    const renderTileContent = () => {
        const commonProps = {
            data: tileData,
            isEditMode: false,
            isDebugMode: false
        };

        switch (tileData.type) {
            case 'text':
                return <TextTile {...commonProps} />;
            case 'thought':
                return <ThoughtTile {...commonProps} />;
            case 'quote':
                return <QuoteTile {...commonProps} />;
            case 'image':
                return <ImageTileBlock {...commonProps} />;
            case 'video':
                return <VideoTile {...commonProps} onUpdate={() => {}} />;
            case 'project':
                return <ProjectTile {...commonProps} />;
            case 'status':
                return <StatusTile {...commonProps} />;
            case 'writing':
                return <WritingTileBlock {...commonProps} />;
            default:
                return <div className="text-gray-400 text-sm">Unknown tile type</div>;
        }
    };

    return (
        <div className={cn("flex flex-col items-center gap-6", className)}>
            {/* Preview Label */}
            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Live Preview</h3>
                <p className="text-sm text-gray-500">
                    {tileData.w}×{tileData.h} grid units • {actualWidth}×{actualHeight}px • {tileData.type} tile
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    Desktop view ({breakpoint.toUpperCase()}) • {colWidth}px cols × {rowHeight}px rows
                    {(width !== actualWidth || height !== actualHeight) && ` • Scaled to ${width}×${height}px`}
                </p>
            </div>

            {/* Preview Container with Enhanced Animations */}
            <motion.div
                layout
                key={`${tileData.id}-${tileData.type}-${tileData.w}-${tileData.h}`} // Force re-render on template changes
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                    type: 'spring',
                    damping: 25,
                    stiffness: 300,
                    mass: 0.8
                }}
                className={cn(
                    getPreviewContainerClasses(),
                    "transform-gpu"
                )}
                style={{
                    backgroundColor: tileData.color,
                    width: `${width}px`,
                    height: `${height}px`,
                    minWidth: '200px',
                    minHeight: '150px'
                }}
            >
                {/* Preview Content with Fade Transition - Match Block structure */}
                <motion.div 
                    className="flex h-full flex-col p-4 sm:p-6 lg:p-8 pointer-events-none select-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                >
                    {/* Category Header - Match Block structure */}
                    <motion.div 
                        className="mb-4 sm:mb-6 flex items-start justify-between"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                    >
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-black/30">
                            {tileData.category}
                        </span>
                    </motion.div>
                    
                    {/* Tile Content with Stagger Animation - Match Block structure */}
                    <motion.div 
                        className="flex-1 relative flex items-center justify-center w-full"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                    >
                        {renderTileContent()}
                    </motion.div>
                </motion.div>

                {/* Shimmer effect for content updates */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{
                        duration: 1.5,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatDelay: 3
                    }}
                />
            </motion.div>

            {/* Preview Info */}
            <div className="text-center text-xs text-gray-400 space-y-1">
                <div>Updates in real-time as you edit</div>
                {tileData.title && (
                    <div className="font-medium text-gray-600">"{tileData.title}"</div>
                )}
            </div>
        </div>
    );
};