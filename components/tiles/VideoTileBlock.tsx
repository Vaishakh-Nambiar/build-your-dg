import React from 'react';
import { Volume2, VolumeX, Repeat } from 'lucide-react';
import { clsx } from 'clsx';
import { BlockData } from '../Block';

interface VideoTileBlockProps {
    data: BlockData;
    isEditMode: boolean;
    isDebugMode: boolean;
    onUpdate: (id: string, updates: Partial<BlockData>) => void;
}

/**
 * VideoTileBlock - STACKED DESIGN (NEW DEFAULT)
 * 
 * Features:
 * - Two stacked containers: video (front) and content (back)
 * - ENTIRE TILE triggers hover effect
 * - Video moves down on hover to reveal content behind
 * - Dynamic shift based on title length (minimum 10%)
 * - Video controls appear on hover
 * - Title at top-left of back container
 * - Supports both rectangle and circle shapes
 */
export const VideoTileBlock: React.FC<VideoTileBlockProps> = ({ 
    data, 
    isEditMode, 
    isDebugMode,
    onUpdate 
}) => {
    if (!data.videoUrl) {
        return (
            <div className="absolute inset-0 rounded-xl bg-gray-50 shadow-sm flex items-center justify-center">
                <span className="text-gray-400 text-sm">No video</span>
            </div>
        );
    }

    const isCircular = data.videoShape === 'circle';
    
    // Calculate dynamic shift based on title length
    const titleLength = data.title?.length || 0;
    const titleLines = Math.ceil(titleLength / 25); // Rough estimate for smaller tiles
    const baseShift = 10; // Minimum 10%
    const titleShift = titleLines * 6; // Additional shift per line
    const totalShift = Math.max(baseShift, baseShift + titleShift);

    return (
        <div 
            className={clsx(
                "absolute inset-0 overflow-hidden shadow-sm group cursor-pointer",
                isCircular ? "rounded-full" : "rounded-xl"
            )}
            style={{
                '--video-shift': `${totalShift}%`,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.08)'
            } as React.CSSProperties}
        >
            {/* ============================= */}
            {/* BACK CONTAINER (CONTENT) - Always behind */}
            {/* ============================= */}
            <div className={clsx(
                "absolute inset-0 z-0 flex flex-col justify-start bg-neutral-900 text-white px-4 pt-4 pb-4",
                isCircular ? "rounded-full" : "rounded-xl"
            )}>
                {/* Title at the top, aligned left */}
                {data.title && (
                    <h3 className="text-sm font-medium leading-tight text-left max-w-full break-words mb-2">
                        {data.title}
                    </h3>
                )}
                
                {/* Additional content */}
                {data.content && (
                    <p className="text-xs text-white/80 leading-relaxed">
                        {data.content}
                    </p>
                )}
                
                {/* Video metadata */}
                {(data.isLooping !== false || data.isMuted !== false) && (
                    <div className="text-xs text-white/60 mt-2 space-y-1">
                        {data.isLooping !== false && <div>• Looping enabled</div>}
                        {data.isMuted !== false && <div>• Audio muted</div>}
                    </div>
                )}
                
                {/* Category at bottom */}
                <div className="mt-auto">
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">
                        {data.category || 'Video'}
                    </span>
                </div>
            </div>

            {/* ============================= */}
            {/* FRONT CONTAINER (VIDEO) - Moves on hover */}
            {/* ============================= */}
            <div 
                className={clsx(
                    "absolute inset-0 z-10 transition-transform duration-500 ease-out group-hover:translate-y-[var(--video-shift)] bg-black",
                    isCircular ? "rounded-full overflow-hidden" : "rounded-xl overflow-hidden"
                )}
            >
                {/* Video */}
                <video
                    src={data.videoUrl}
                    className={clsx(
                        "w-full h-full object-cover transition-all duration-500 pointer-events-none",
                        isCircular ? "rounded-full" : "rounded-xl"
                    )}
                    loop={data.isLooping !== false}
                    muted={data.isMuted !== false}
                    autoPlay
                    playsInline
                />
                
                {/* Video Controls - Appear on hover */}
                {!isEditMode && (
                    <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onUpdate(data.id, { isLooping: !data.isLooping });
                            }}
                            className={clsx(
                                "flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all shadow-lg border pointer-events-auto hover:scale-110",
                                data.isLooping !== false 
                                    ? "bg-white/90 text-black border-white/30 hover:bg-white" 
                                    : "bg-black/50 text-white border-white/20 hover:bg-black/70"
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
                                "flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all shadow-lg border pointer-events-auto hover:scale-110",
                                data.isMuted !== false 
                                    ? "bg-black/50 text-white border-white/20 hover:bg-black/70" 
                                    : "bg-white/90 text-black border-white/30 hover:bg-white"
                            )}
                            title={data.isMuted !== false ? "Unmute" : "Mute"}
                        >
                            {data.isMuted !== false ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        </button>
                    </div>
                )}
                
                {/* Optional overlay for better contrast */}
                <div className={clsx(
                    "absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
                    isCircular ? "rounded-full" : "rounded-xl"
                )} />
            </div>
            
            {/* Debug info */}
            {isDebugMode && (
                <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded z-20 pointer-events-none">
                    VIDEO {data.w}x{data.h}
                </div>
            )}
        </div>
    );
};