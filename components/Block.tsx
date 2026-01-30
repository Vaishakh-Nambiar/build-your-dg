import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Trash2, X, GripVertical, Edit3, Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
    TextTile, 
    ThoughtTile, 
    QuoteTile, 
    ImageTileBlock, 
    VideoTile, 
    StatusTile,
    WritingTileBlock, 
    ProjectTile 
} from './tiles';
import { getTypeChangeUpdates } from './garden/tileDefaults';
import { COMPACT_TILE_SIZES } from './garden/tileSizes';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type BlockType = 'image' | 'text' | 'thought' | 'quote' | 'project' | 'video' | 'writing' | 'status';

export interface BlockData {
    id: string;
    type: BlockType;
    category: string;
    title?: string;
    content?: string;
    imageUrl?: string;
    imageTag?: string;
    caption?: string;
    status?: string;
    meta?: string;
    link?: string;
    author?: string;
    objectFit?: 'cover' | 'contain';
    color?: string;
    isPolaroid?: boolean;
    videoUrl?: string;
    isLooping?: boolean;
    isMuted?: boolean;
    // Project-specific properties (for your Figma design)
    showcaseBackground?: string;
    showcaseBorderColor?: string;
    // Text-specific properties
    isTransparent?: boolean;
    // Video-specific properties
    videoShape?: 'rectangle' | 'circle';
    // Project Tile Archetype properties
    projectArchetype?: 'web-showcase' | 'mobile-app' | 'concept-editorial';
    // Mobile app specific
    appStoreUrl?: string;
    platform?: 'ios' | 'android' | 'cross-platform';
    // Concept/Editorial specific
    poeticDescription?: string;
    editorialStyle?: 'minimal' | 'classic' | 'modern';
    // Writing/Blog specific
    publishedAt?: Date | string;
    excerpt?: string;
    archetypeConfig?: {
        // Web Showcase specific
        uiPreviewMode?: 'embedded' | 'floating';
        showWebMetadata?: boolean;
        // Mobile App specific
        phoneOrientation?: 'portrait' | 'landscape';
        showPhoneMockup?: boolean;
        phoneTiltAngle?: number;
        // Concept/Editorial specific
        poeticDescription?: string;
        symbolicImageUrl?: string;
        editorialSpacing?: 'compact' | 'generous';
        // Common configuration
        customBackground?: string;
        customAccentColor?: string;
    };
    x: number;
    y: number;
    w: number;
    h: number;
}

interface BlockProps extends React.HTMLAttributes<HTMLDivElement> {
    data: BlockData;
    isEditMode: boolean;
    isDebugMode?: boolean;
    isDimmed?: boolean;
    onDelete: (id: string) => void;
    onUpdate: (id: string, data: Partial<BlockData>) => void;
    onEdit?: () => void;
}

const PASTEL_COLORS = [
    '#ffffff', '#fbf8cc', '#fde4cf', '#ffcfd2', '#f1c0e8',
    '#cfbaf0', '#a3c4f3', '#90dbf4', '#8eecf5', '#98f5e1', '#b9fbc0'
];

export const Block = React.forwardRef<HTMLDivElement, BlockProps>(({
    data,
    isEditMode,
    isDebugMode = false,
    isDimmed = false,
    onDelete,
    onUpdate,
    onEdit,
    style,
    className,
    ...props
}, ref) => {
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        if (!isEditMode) setShowSettings(false);
    }, [isEditMode]);

    const handleColorCycle = (e: React.MouseEvent) => {
        e.stopPropagation();
        const currentIndex = PASTEL_COLORS.indexOf(data.color || '#ffffff');
        const nextColor = PASTEL_COLORS[(currentIndex + 1) % PASTEL_COLORS.length];
        onUpdate(data.id, { color: nextColor });
    };

    const getContainerClasses = () => {
        const base = "group relative h-full w-full overflow-hidden transition-[background-color,border-color,opacity,box-shadow,transform] duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]";
        const border = isEditMode ? "border-1 border-dashed border-black/20" : "border border-black/[0.06] hover:shadow-2xl hover:shadow-black/5";

        if (data.type === 'thought') {
            return cn(
                base,
                "shadow-lg rotate-1 hover:rotate-0",
                !isEditMode && "border-none",
                isDebugMode && "ring-2 ring-red-500 ring-inset"
            );
        }

        // Premium styling for project tiles
        if (data.type === 'project') {
            return cn(
                base,
                "rounded-[8px] bg-[#F9F9F9] shadow-sm",
                isEditMode ? "border-2 border-dashed border-black/20" : "border border-black/5",
                !isEditMode && "hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1",
                isDebugMode && "ring-2 ring-red-500 ring-inset"
            );
        }

        return cn(base, "rounded-[8px] bg-white shadow-sm", border, isDebugMode && "ring-2 ring-red-500 ring-inset");
    };

    return (
        <div
            ref={ref}
            className={cn(
                getContainerClasses(),
                isDimmed && "opacity-20 grayscale pointer-events-none",
                // Handle transparent background for text tiles
                data.type === 'text' && data.isTransparent && "!bg-transparent !border-transparent !shadow-none",
                className
            )}
            style={{
                ...style,
                backgroundColor: data.type === 'text' && data.isTransparent ? 'transparent' : data.color,
            }}
            {...props}
        >
            {/* GRIP HANDLE - 6-DOT MOVEMENT CONTROL */}
            {isEditMode && (
                <div
                    className="drag-handle absolute top-3 left-1/2 -translate-x-1/2 z-30 flex h-8 w-12 cursor-grab touch-none items-center justify-center rounded-full bg-white/95 backdrop-blur-sm opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity hover:bg-white active:cursor-grabbing shadow-lg border border-black/10"
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        // Allow the drag to proceed - react-grid-layout will handle it
                    }}
                    onTouchStart={(e) => {
                        e.stopPropagation();
                        // Allow the drag to proceed - react-grid-layout will handle it
                    }}
                >
                    <GripVertical size={18} className="text-black/60" />
                </div>
            )}

            {/* HOVER CONTROLS - EDIT & DELETE */}
            {isEditMode && (
                <div className="no-drag absolute top-3 right-3 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onEdit) {
                                onEdit();
                            } else {
                                setShowSettings(true);
                            }
                        }}
                        className="no-drag flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-blue-50 hover:text-blue-600 transition-all shadow-lg border border-black/10"
                        title="Edit"
                    >
                        <Edit3 size={14} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Delete this block?')) {
                                onDelete(data.id);
                            }
                        }}
                        className="no-drag flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-red-50 hover:text-red-600 transition-all shadow-lg border border-black/10"
                        title="Delete"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            )}

            {/* SETTINGS OVERLAY - FIXED POSITION FOR SMALL TILES */}
            <AnimatePresence>
                {showSettings && isEditMode && !onEdit && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[200]"
                            onClick={() => setShowSettings(false)}
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-[90vw] max-w-md max-h-[80vh] flex flex-col bg-white rounded-2xl overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/95 p-4 backdrop-blur-md">
                                <span className="font-serif-display text-lg font-bold italic">Edit Block</span>
                                <button onClick={() => setShowSettings(false)} className="rounded-full bg-gray-100 p-2 hover:bg-gray-200 transition-colors">
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="flex-1 space-y-6 p-4 text-left overflow-y-auto">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-gray-400">Type</label>
                                    <div className="flex flex-wrap gap-2">
                                        {(['text', 'image', 'video', 'quote', 'thought', 'project', 'writing'] as BlockType[]).map(t => (
                                            <button
                                                key={t}
                                                onClick={() => {
                                                    const updates = getTypeChangeUpdates(t, data);
                                                    onUpdate(data.id, updates);
                                                }}
                                                className={cn(
                                                    "px-3 py-1 rounded-md text-xs border capitalize transition-colors",
                                                    data.type === t ? "bg-black text-white border-black" : "bg-white hover:bg-gray-50"
                                                )}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-gray-400">Size</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {COMPACT_TILE_SIZES.map(size => (
                                            <button
                                                key={`${size.w}x${size.h}`}
                                                onClick={() => onUpdate(data.id, { w: size.w, h: size.h })}
                                                className={cn(
                                                    "px-2 py-1.5 rounded-md text-xs border transition-colors font-mono",
                                                    data.w === size.w && data.h === size.h 
                                                        ? "bg-black text-white border-black" 
                                                        : "bg-white hover:bg-gray-50"
                                                )}
                                            >
                                                {size.label}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[9px] text-gray-400">
                                        Width × Height in grid units
                                    </p>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-gray-400">Color</label>
                                    <div className="flex flex-wrap gap-2">
                                        {PASTEL_COLORS.map(c => (
                                            <button
                                                key={c}
                                                onClick={() => onUpdate(data.id, { color: c })}
                                                className={cn(
                                                    "w-6 h-6 rounded-full border transition-all",
                                                    data.color === c ? "border-black ring-2 ring-black ring-offset-2" : "border-gray-200 hover:scale-110"
                                                )}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={data.category}
                                        onChange={(e) => onUpdate(data.id, { category: e.target.value })}
                                        className="w-full rounded-lg border p-2 text-sm focus:ring-2 focus:ring-black focus:border-black transition-all"
                                        placeholder="Category"
                                    />
                                    <input
                                        type="text"
                                        value={data.title || ''}
                                        onChange={(e) => onUpdate(data.id, { title: e.target.value })}
                                        className="w-full rounded-lg border p-2 text-sm font-bold focus:ring-2 focus:ring-black focus:border-black transition-all"
                                        placeholder="Title"
                                    />
                                    <textarea
                                        value={data.content || ''}
                                        onChange={(e) => onUpdate(data.id, { content: e.target.value })}
                                        rows={3}
                                        className="w-full rounded-lg border p-2 text-sm focus:ring-2 focus:ring-black focus:border-black transition-all"
                                        placeholder="Content"
                                    />
                                    <input
                                        type="text"
                                        value={data.link || ''}
                                        onChange={(e) => onUpdate(data.id, { link: e.target.value })}
                                        className="w-full rounded-lg border p-2 text-sm focus:ring-2 focus:ring-black focus:border-black transition-all"
                                        placeholder="Link URL (optional)"
                                    />
                                    {data.type === 'quote' && (
                                        <input
                                            type="text"
                                            value={data.author || ''}
                                            onChange={(e) => onUpdate(data.id, { author: e.target.value })}
                                            className="w-full rounded-lg border p-2 text-sm focus:ring-2 focus:ring-black focus:border-black transition-all"
                                            placeholder="Author Name"
                                        />
                                    )}
                                    {data.type === 'text' && (
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-2 text-xs cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={data.isTransparent || false}
                                                    onChange={() => onUpdate(data.id, { isTransparent: !data.isTransparent })}
                                                    className="rounded"
                                                />
                                                Transparent Background
                                            </label>
                                        </div>
                                    )}
                                    {data.type === 'image' && (
                                        <>
                                            <input
                                                type="text"
                                                value={data.imageUrl || ''}
                                                onChange={(e) => onUpdate(data.id, { imageUrl: e.target.value })}
                                                className="w-full rounded-lg border p-2 text-xs focus:ring-2 focus:ring-black focus:border-black transition-all"
                                                placeholder="Image URL"
                                            />
                                            <input
                                                type="text"
                                                value={data.imageTag || ''}
                                                onChange={(e) => onUpdate(data.id, { imageTag: e.target.value })}
                                                className="w-full rounded-lg border p-2 text-xs focus:ring-2 focus:ring-black focus:border-black transition-all"
                                                placeholder="Image Tag (optional)"
                                            />
                                            <div className="flex items-center gap-4">
                                                <label className="flex items-center gap-2 text-xs cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.objectFit === 'contain'}
                                                        onChange={() => onUpdate(data.id, { objectFit: data.objectFit === 'contain' ? 'cover' : 'contain' })}
                                                        className="rounded"
                                                    />
                                                    Contain
                                                </label>
                                                <label className="flex items-center gap-2 text-xs cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.isPolaroid || false}
                                                        onChange={() => onUpdate(data.id, { isPolaroid: !data.isPolaroid })}
                                                        className="rounded"
                                                    />
                                                    Polaroid
                                                </label>
                                            </div>
                                        </>
                                    )}
                                    {data.type === 'video' && (
                                        <>
                                            <input
                                                type="text"
                                                value={data.videoUrl || ''}
                                                onChange={(e) => onUpdate(data.id, { videoUrl: e.target.value })}
                                                className="w-full rounded-lg border p-2 text-xs focus:ring-2 focus:ring-black focus:border-black transition-all"
                                                placeholder="Video/GIF URL (MP4, WebM, GIF)"
                                            />
                                            <div className="flex items-center gap-4">
                                                <label className="flex items-center gap-2 text-xs cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.isLooping || false}
                                                        onChange={() => onUpdate(data.id, { isLooping: !data.isLooping })}
                                                        className="rounded"
                                                    />
                                                    Loop
                                                </label>
                                                <label className="flex items-center gap-2 text-xs cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.isMuted !== false}
                                                        onChange={() => onUpdate(data.id, { isMuted: data.isMuted === false ? true : false })}
                                                        className="rounded"
                                                    />
                                                    Muted
                                                </label>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <label className="text-xs text-gray-600">Shape:</label>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => onUpdate(data.id, { videoShape: 'rectangle' })}
                                                        className={cn(
                                                            "px-3 py-1 rounded-md text-xs border transition-colors",
                                                            (data.videoShape || 'rectangle') === 'rectangle' ? "bg-black text-white border-black" : "bg-white hover:bg-gray-50"
                                                        )}
                                                    >
                                                        Rectangle
                                                    </button>
                                                    <button
                                                        onClick={() => onUpdate(data.id, { videoShape: 'circle' })}
                                                        className={cn(
                                                            "px-3 py-1 rounded-md text-xs border transition-colors",
                                                            data.videoShape === 'circle' ? "bg-black text-white border-black" : "bg-white hover:bg-gray-50"
                                                        )}
                                                    >
                                                        Circle
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {data.type === 'project' && (
                                        <>
                                            <input
                                                type="text"
                                                value={data.showcaseBackground || ''}
                                                onChange={(e) => onUpdate(data.id, { showcaseBackground: e.target.value })}
                                                className="w-full rounded-lg border p-2 text-xs focus:ring-2 focus:ring-black focus:border-black transition-all"
                                                placeholder="Background Image URL (optional)"
                                            />
                                            <div className="flex items-center gap-4">
                                                <label className="text-xs text-gray-600">Border Color:</label>
                                                <input
                                                    type="color"
                                                    value={data.showcaseBorderColor || '#cc2727'}
                                                    onChange={(e) => onUpdate(data.id, { showcaseBorderColor: e.target.value })}
                                                    className="w-12 h-8 rounded border cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={data.showcaseBorderColor || '#cc2727'}
                                                    onChange={(e) => onUpdate(data.id, { showcaseBorderColor: e.target.value })}
                                                    className="flex-1 rounded-lg border p-2 text-xs focus:ring-2 focus:ring-black focus:border-black transition-all"
                                                    placeholder="#cc2727"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Footer with Save and Delete */}
                            <div className="sticky bottom-0 border-t border-gray-100 bg-white/95 p-4 backdrop-blur-md flex gap-3">
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-black p-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
                                >
                                    <Check size={16} />
                                    Save Changes
                                </button>
                                <button
                                    onClick={() => {
                                        if (window.confirm('Delete this block?')) {
                                            onDelete(data.id);
                                            setShowSettings(false);
                                        }
                                    }}
                                    className="flex items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* CONTENT RENDER */}
            <div className="no-drag flex h-full flex-col p-4 sm:p-6 lg:p-8 pointer-events-none select-none">
                <div className="mb-4 sm:mb-6 flex items-start justify-between">
                    <button
                        onClick={handleColorCycle}
                        className={cn(
                            "no-drag text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-black/30 transition-colors hover:text-black pointer-events-auto",
                            isEditMode && "pointer-events-none"
                        )}
                    >
                        {data.category}
                    </button>
                    {!data.isPolaroid && data.link && <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-black/20 group-hover:text-black/40 transition-colors" />}
                </div>
                <div className="no-drag flex-1 relative flex items-center justify-center w-full">
                    {/* TEXT BLOCK */}
                    {data.type === 'text' && (
                        <TextTile data={data} isEditMode={isEditMode} isDebugMode={isDebugMode} />
                    )}

                    {/* STICKY NOTE */}
                    {data.type === 'thought' && (
                        <ThoughtTile data={data} isEditMode={isEditMode} isDebugMode={isDebugMode} />
                    )}

                    {/* QUOTE BLOCK */}
                    {data.type === 'quote' && (
                        <QuoteTile data={data} isEditMode={isEditMode} isDebugMode={isDebugMode} />
                    )}

                    {/* PROJECT TILE - Your Figma Design */}
                    {data.type === 'project' && (
                        <ProjectTile data={data} isEditMode={isEditMode} isDebugMode={isDebugMode} />
                    )}

                    {/* IMAGE BLOCK */}
                    {data.type === 'image' && (
                        <ImageTileBlock data={data} isEditMode={isEditMode} isDebugMode={isDebugMode} />
                    )}

                    {/* VIDEO BLOCK */}
                    {data.type === 'video' && (
                        <VideoTile 
                            data={data} 
                            isEditMode={isEditMode} 
                            isDebugMode={isDebugMode}
                            onUpdate={onUpdate}
                        />
                    )}

                    {/* STATUS BLOCK */}
                    {data.type === 'status' && (
                        <StatusTile data={data} isEditMode={isEditMode} isDebugMode={isDebugMode} />
                    )}

                    {/* WRITING BLOCK */}
                    {data.type === 'writing' && (
                        <WritingTileBlock data={data} isEditMode={isEditMode} isDebugMode={isDebugMode} />
                    )}
                </div>
            </div>
        </div>
    );
});

Block.displayName = 'Block';
