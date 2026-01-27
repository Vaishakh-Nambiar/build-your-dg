import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Trash2, X, Quote, GripVertical, Edit3, Volume2, VolumeX, Repeat, Check } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type BlockType = 'image' | 'text' | 'thought' | 'quote' | 'project' | 'status' | 'video';

export interface BlockData {
    id: string;
    type: BlockType;
    category: string;
    title?: string;
    content?: string;
    imageUrl?: string;
    imageTag?: string;
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
        const border = isEditMode ? "border-2 border-dashed border-black/20" : "border border-black/[0.06] hover:shadow-2xl hover:shadow-black/5";

        if (data.type === 'thought') {
            return cn(
                base,
                "shadow-lg rotate-1 hover:rotate-0",
                !isEditMode && "border-none",
                isDebugMode && "ring-2 ring-red-500 ring-inset"
            );
        }
        return cn(base, "rounded-[24px] bg-white shadow-sm", border, isDebugMode && "ring-2 ring-red-500 ring-inset");
    };

    const combinedStyle: React.CSSProperties = {
        backgroundColor: data.color,
    };

    return (
        <div
            ref={ref}
            className={cn(
                getContainerClasses(),
                isDimmed && "opacity-20 grayscale pointer-events-none",
                className
            )}
            style={{
                ...style,
                backgroundColor: data.color,
            }}
            {...props}
        >
            {data.type === 'quote' && (
                <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center opacity-[0.03]">
                    <Quote size={200} className="text-black" />
                </div>
            )}

            {/* GRIP HANDLE - 6-DOT MOVEMENT CONTROL */}
            {isEditMode && (
                <div
                    className="drag-handle absolute top-3 left-1/2 -translate-x-1/2 z-30 flex h-8 w-12 cursor-grab touch-none items-center justify-center rounded-full bg-white/90 backdrop-blur-sm opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity hover:bg-white active:cursor-grabbing shadow-lg border border-black/10"
                    onClick={(e) => e.stopPropagation()}
                >
                    <GripVertical size={18} className="text-black/60" />
                </div>
            )}

            {/* HOVER CONTROLS - EDIT & DELETE */}
            {isEditMode && (
                <div className="absolute top-3 right-3 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowSettings(true);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-blue-50 hover:text-blue-600 transition-all shadow-lg border border-black/10"
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
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-red-50 hover:text-red-600 transition-all shadow-lg border border-black/10"
                        title="Delete"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            )}

            {/* SETTINGS OVERLAY - FIXED POSITION FOR SMALL TILES */}
            <AnimatePresence>
                {showSettings && isEditMode && (
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
                                        {(['text', 'image', 'video', 'quote', 'thought', 'project', 'status'] as BlockType[]).map(t => (
                                            <button
                                                key={t}
                                                onClick={() => onUpdate(data.id, { type: t })}
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
            <div className="flex h-full flex-col p-8 pointer-events-none select-none">
                <div className="mb-6 flex items-start justify-between">
                    <button
                        onClick={handleColorCycle}
                        className={cn(
                            "text-[10px] font-black uppercase tracking-[0.2em] text-black/30 transition-colors hover:text-black pointer-events-auto",
                            isEditMode && "pointer-events-none"
                        )}
                    >
                        {data.category}
                    </button>
                    {!data.isPolaroid && data.link && <ArrowUpRight className="h-4 w-4 text-black/20 group-hover:text-black/40 transition-colors" />}
                </div>
                <div className="flex-1 relative flex items-center justify-center w-full">
                    {/* TEXT BLOCK */}
                    {data.type === 'text' && (
                        <div className="flex flex-col h-full justify-center w-full text-left">
                            <h3 className="font-serif-display text-2xl font-medium leading-tight text-gray-900 mb-3">
                                {data.title}
                            </h3>
                            <p className="line-clamp-6 text-sm leading-relaxed text-gray-500 font-sans">
                                {data.content}
                            </p>
                            {data.meta && <div className="mt-4 text-[10px] text-gray-400">{data.meta}</div>}
                        </div>
                    )}

                    {/* STICKY NOTE */}
                    {data.type === 'thought' && (
                        <div className="flex flex-col h-full items-center justify-center text-center p-2">
                            <p className="font-hand text-2xl sm:text-3xl leading-snug text-gray-800 rotate-[-1deg]">
                                {data.content || data.title}
                            </p>
                        </div>
                    )}

                    {/* QUOTE BLOCK */}
                    {data.type === 'quote' && (
                        <div className="flex flex-col h-full items-center justify-center text-center relative z-10">
                            <p className="font-serif-display text-2xl sm:text-3xl italic leading-tight text-black mb-6">
                                "{data.content}"
                            </p>
                            {data.author && (
                                <div className="absolute bottom-0 right-0 text-[10px] uppercase tracking-widest text-gray-500">
                                    — {data.author}
                                </div>
                            )}
                        </div>
                    )}

                    {/* PROJECT TILE - GLASSMORPHISM */}
                    {data.type === 'project' && (
                        <div className="flex flex-col justify-between h-full w-full text-left">
                            <div className="mb-4">
                                <h3 className="font-serif-display text-4xl font-black leading-[0.9] tracking-tighter text-black/90 mb-3">
                                    {data.title}
                                </h3>
                                {data.content && (
                                    <p className="text-sm font-sans tracking-tight text-black/50 leading-relaxed line-clamp-2">
                                        {data.content}
                                    </p>
                                )}
                            </div>
                            <div className="relative mt-auto w-full overflow-hidden rounded-[20px] bg-gradient-to-br from-violet-50 via-pink-50 to-orange-50 group-hover:shadow-inner transition-all aspect-[4/3] border border-white">
                                <div className="absolute inset-0 bg-gradient-to-tr from-violet-200/40 via-pink-200/40 to-orange-100/40 opacity-80 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
                                <div className="absolute inset-x-4 bottom-4 h-12 bg-white/60 backdrop-blur-xl flex items-center px-5 rounded-full border border-white/50 shadow-sm transition-transform group-hover:scale-[1.02]">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-black/80">
                                        Open Case Study
                                    </span>
                                    <ArrowUpRight className="ml-auto h-3 w-3 text-black/40" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* IMAGE BLOCK - POLAROID STYLE */}
                    {data.type === 'image' && data.imageUrl && (
                        <div className={cn(
                            "absolute inset-0 z-0 transition-transform duration-700 hover:scale-105 overflow-hidden flex flex-col items-center justify-center",
                            data.isPolaroid
                                ? "bg-white shadow-xl rotate-1 p-4 pb-12"
                                : "rounded-t-lg"
                        )}>
                            <img
                                src={data.imageUrl}
                                alt={data.title || "Gallery Image"}
                                className={cn(
                                    "w-full h-full",
                                    data.objectFit === 'contain' ? "object-contain bg-gray-50" : "object-cover",
                                    data.isPolaroid && "border-[8px] border-white shadow-inner"
                                )}
                            />
                            {data.isPolaroid && (
                                <div className="absolute bottom-0 left-0 right-0 h-10 w-full bg-white flex items-center justify-between px-4 pb-1">
                                    <span className="font-hand text-lg text-gray-600 truncate">
                                        {data.title || 'Untitled'}
                                    </span>
                                    <span className="text-[8px] uppercase tracking-widest text-gray-400 shrink-0">
                                        {data.imageTag || 'Photo'}
                                    </span>
                                </div>
                            )}
                            {!data.isPolaroid && data.imageTag && (
                                <div className="absolute bottom-4 left-4 rounded-md bg-black/30 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-md">
                                    {data.imageTag}
                                </div>
                            )}
                        </div>
                    )}

                    {/* VIDEO BLOCK - WITH CONTROLS */}
                    {data.type === 'video' && data.videoUrl && (
                        <div className="absolute inset-0 z-0 overflow-hidden rounded-lg bg-black">
                            <video
                                src={data.videoUrl}
                                className="w-full h-full object-cover"
                                loop={data.isLooping !== false}
                                muted={data.isMuted !== false}
                                autoPlay
                                playsInline
                            />
                            {!isEditMode && (
                                <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onUpdate(data.id, { isLooping: !data.isLooping });
                                        }}
                                        className={cn(
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
                                        className={cn(
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
                    )}

                    {/* STATUS BLOCK */}
                    {data.type === 'status' && (
                        <div className="flex flex-col h-full w-full text-left">
                            <div className="flex gap-2 mb-3">
                                {data.status && (
                                    <span className="inline-flex items-center rounded-sm bg-orange-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-orange-600">
                                        {data.status}
                                    </span>
                                )}
                            </div>
                            <h3 className="font-serif-display text-4xl font-normal leading-none tracking-tight text-black">
                                {data.title}
                            </h3>
                            {data.content && <p className="mt-2 text-xs text-gray-500">{data.content}</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

Block.displayName = 'Block';
