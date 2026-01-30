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
    ImageTile, 
    VideoTile, 
    StatusTile, 
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
        const base = "relative overflow-hidden transition-all duration-300 ease-out";
        
        if (tileData.type === 'thought') {
            return cn(
                base,
                "shadow-lg rotate-1 hover:rotate-0 border-none"
            );
        }

        if (tileData.type === 'project') {
            return cn(
                base,
                "rounded-[8px] bg-[#F9F9F9] shadow-sm border border-black/5"
            );
        }

        return cn(base, "rounded-[8px] bg-white shadow-sm border border-black/[0.06]");
    };

    // Calculate preview dimensions based on tile size
    // Scale down the actual grid dimensions for preview
    const getPreviewDimensions = () => {
        const baseWidth = 80; // Base width per grid unit
        const baseHeight = 60; // Base height per grid unit
        
        const width = Math.min(tileData.w * baseWidth, 400); // Max width 400px
        const height = Math.min(tileData.h * baseHeight, 300); // Max height 300px
        
        return { width, height };
    };

    const { width, height } = getPreviewDimensions();

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
                return <ImageTile {...commonProps} />;
            case 'video':
                return <VideoTile {...commonProps} onUpdate={() => {}} />;
            case 'project':
                return <ProjectTile {...commonProps} />;
            case 'status':
                return <StatusTile {...commonProps} />;
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
                    {tileData.w}×{tileData.h} grid units • {tileData.type} tile
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
                {/* Preview Content with Fade Transition */}
                <motion.div 
                    className="flex h-full flex-col p-4 pointer-events-none select-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                >
                    {/* Category Header */}
                    <motion.div 
                        className="mb-3 flex items-start justify-between"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                    >
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-black/30">
                            {tileData.category}
                        </span>
                    </motion.div>
                    
                    {/* Tile Content with Stagger Animation */}
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