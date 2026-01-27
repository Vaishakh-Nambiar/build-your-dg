import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Trash2, X, Quote, GripVertical } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type BlockType = 'image' | 'text' | 'thought' | 'quote' | 'project' | 'status';

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
    // RGL Layout Data (optional for BlockData but needed for parent mapping)
    x: number;
    y: number;
    w: number;
    h: number;
}

interface BlockProps {
    data: BlockData;
    isEditMode: boolean;
    onDelete: (id: string) => void;
    onUpdate: (id: string, data: Partial<BlockData>) => void;
    // RGL Props passed down
    style?: React.CSSProperties;
    className?: string;
    onMouseDown?: React.MouseEventHandler;
    onMouseUp?: React.MouseEventHandler;
    onTouchEnd?: React.TouchEventHandler;
}

const PASTEL_COLORS = [
    '#ffffff', '#fbf8cc', '#fde4cf', '#ffcfd2', '#f1c0e8',
    '#cfbaf0', '#a3c4f3', '#90dbf4', '#8eecf5', '#98f5e1', '#b9fbc0'
];

// Must forward ref for RGL? Actually RGL clones element and passes ref/style/etc.
// Standard functional component should pass ...props to root.
export const Block = React.forwardRef<HTMLDivElement, BlockProps>(({
    data,
    isEditMode,
    onDelete,
    onUpdate,
    style,
    className,
    onMouseDown,
    onMouseUp,
    onTouchEnd
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
        const base = "group relative h-full w-full overflow-hidden transition-all duration-300";
        const border = isEditMode ? "border-dashed border-black/20" : "border-black/5 hover:shadow-md";

        if (data.type === 'thought') {
            return cn(base, "shadow-sm rotate-1 hover:rotate-0 transition-transform bg-yellow-50", !isEditMode && "border-none");
        }
        return cn(base, "rounded-xl border bg-white shadow-sm", border);
    };

    // Combine passed style (positioning from RGL) with local style based on data
    const combinedStyle: React.CSSProperties = {
        ...style,
        backgroundColor: data.color,
        // Ensure z-index is handled by RGL usually, but we can boost it if active
    };

    return (
        <div
            ref={ref}
            className={cn(
                getContainerClasses(),
                isEditMode && "cursor-pointer", // RGL handles cursor usually, but good fallback
                className
            )}
            style={combinedStyle}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onTouchEnd={onTouchEnd}
            onClick={() => {
                if (isEditMode) setShowSettings(true);
            }}
        >
            {data.type === 'quote' && (
                <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center opacity-[0.03]">
                    <Quote size={200} className="text-black" />
                </div>
            )}

            {/* MOVEMENT HANDLE - RGL uses '.drag-handle' class selector if configured */}
            {isEditMode && (
                <div
                    className="drag-handle absolute top-2 left-1/2 -translate-x-1/2 z-30 flex h-8 w-12 cursor-grab touch-none items-center justify-center rounded-full bg-white/50 backdrop-blur-sm opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity hover:bg-white active:cursor-grabbing shadow-sm border border-black/5"
                    onClick={(e) => e.stopPropagation()}
                >
                    <GripVertical size={16} className="text-black/50" />
                </div>
            )}

            {/* SETTINGS OVERLAY */}
            <AnimatePresence>
                {showSettings && isEditMode && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute inset-0 z-[60] flex flex-col bg-white overflow-y-auto cursor-default"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()} // Prevent drag start on settings
                    >
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/80 p-4 backdrop-blur-md">
                            <span className="font-serif-display text-lg font-bold italic">Edit Block</span>
                            <button onClick={() => setShowSettings(false)} className="rounded-full bg-gray-100 p-2 hover:bg-gray-200"><X size={16} /></button>
                        </div>

                        <div className="flex-1 space-y-6 p-4 text-left">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-gray-400">Type</label>
                                <div className="flex flex-wrap gap-2">
                                    {(['text', 'image', 'quote', 'thought', 'project', 'status'] as BlockType[]).map(t => (
                                        <button key={t} onClick={() => onUpdate(data.id, { type: t })} className={cn("px-3 py-1 rounded-md text-xs border capitalize", data.type === t ? "bg-black text-white border-black" : "bg-white hover:bg-gray-50")}>{t}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-gray-400">Color</label>
                                <div className="flex flex-wrap gap-2">
                                    {PASTEL_COLORS.map(c => (
                                        <button key={c} onClick={() => onUpdate(data.id, { color: c })} className={cn("w-6 h-6 rounded-full border", data.color === c ? "border-black ring-1 ring-black ring-offset-1" : "border-gray-200")} style={{ backgroundColor: c }} />
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <input type="text" value={data.category} onChange={(e) => onUpdate(data.id, { category: e.target.value })} className="w-full rounded-lg border p-2 text-sm" placeholder="Category" />
                                <input type="text" value={data.title || ''} onChange={(e) => onUpdate(data.id, { title: e.target.value })} className="w-full rounded-lg border p-2 text-sm font-bold" placeholder="Title" />
                                <textarea value={data.content || ''} onChange={(e) => onUpdate(data.id, { content: e.target.value })} rows={3} className="w-full rounded-lg border p-2 text-sm" placeholder="Content" />
                                {data.type === 'quote' && (<input type="text" value={data.author || ''} onChange={(e) => onUpdate(data.id, { author: e.target.value })} className="w-full rounded-lg border p-2 text-sm" placeholder="Author Name" />)}
                                {data.type === 'image' && (
                                    <>
                                        <input type="text" value={data.imageUrl || ''} onChange={(e) => onUpdate(data.id, { imageUrl: e.target.value })} className="w-full rounded-lg border p-2 text-xs" placeholder="Image URL" />
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={data.objectFit === 'contain'} onChange={() => onUpdate(data.id, { objectFit: data.objectFit === 'contain' ? 'cover' : 'contain' })} /> Contain</label>
                                            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={data.isPolaroid || false} onChange={() => onUpdate(data.id, { isPolaroid: !data.isPolaroid })} /> Polaroid</label>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="pt-4 border-t border-gray-100">
                                <button onClick={() => onDelete(data.id)} className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600 hover:bg-red-100"><Trash2 size={16} /> Delete</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CONTENT RENDER */}
            <div className="flex h-full flex-col p-6 pointer-events-none select-none">
                <div className="mb-4 flex items-start justify-between">
                    <button onClick={handleColorCycle} className={cn("text-[10px] font-medium uppercase tracking-widest text-gray-400 transition-colors hover:text-black pointer-events-auto", isEditMode && "pointer-events-none")}>{data.category}</button>
                    {!data.isPolaroid && <ArrowUpRight className="h-4 w-4 text-gray-300" />}
                </div>
                <div className="flex-1 relative flex items-center justify-center w-full">
                    {data.type === 'text' && (
                        <div className="flex flex-col h-full justify-center w-full text-left">
                            <h3 className="font-serif-display text-2xl font-medium leading-tight text-gray-900 mb-3">{data.title}</h3>
                            <p className="line-clamp-6 text-sm leading-relaxed text-gray-500 font-sans">{data.content}</p>
                            {data.meta && <div className="mt-4 text-[10px] text-gray-400">{data.meta}</div>}
                        </div>
                    )}
                    {data.type === 'thought' && (
                        <div className="flex flex-col h-full items-center justify-center text-center p-2">
                            <p className="font-hand text-2xl sm:text-3xl leading-snug text-gray-800 rotate-[-1deg]">{data.content || data.title}</p>
                        </div>
                    )}
                    {data.type === 'quote' && (
                        <div className="flex flex-col h-full items-center justify-center text-center relative z-10">
                            <p className="font-serif-display text-2xl sm:text-3xl italic leading-tight text-black mb-6">"{data.content}"</p>
                            {data.author && <div className="absolute bottom-0 right-0 text-[10px] uppercase tracking-widest text-gray-500">— {data.author}</div>}
                        </div>
                    )}
                    {data.type === 'project' && (
                        <div className="flex flex-col justify-between h-full w-full text-left">
                            <div>
                                <h3 className="font-serif-display text-2xl font-bold leading-none tracking-tight text-black mb-2">{data.title}</h3>
                                {data.content && <p className="text-sm text-gray-500">{data.content}</p>}
                            </div>
                            <div className="relative mt-4 flex-1 w-full overflow-hidden rounded-xl bg-gray-50 group-hover:shadow-inner transition-all">
                                <div className="absolute inset-0 bg-gradient-to-tr from-violet-200 via-pink-200 to-orange-100 opacity-80 blur-xl" />
                                <div className="absolute bottom-0 left-0 right-0 h-10 bg-white/30 backdrop-blur-md flex items-center px-4"><span className="text-[10px] font-bold uppercase tracking-widest text-black/60">View Project</span></div>
                            </div>
                        </div>
                    )}
                    {data.type === 'image' && data.imageUrl && (
                        <div className={cn("absolute inset-0 z-0 transition-transform duration-700 hover:scale-105", data.isPolaroid ? "top-0 -mx-6 -mt-16 pb-12 bg-white flex flex-col shadow-lg rotate-1 items-center justify-center" : "-mx-6 -mb-6 mt-2 rounded-b-3xl overflow-hidden")}>
                            <img src={data.imageUrl} alt={data.title || "Gallery Image"} className={cn("w-full flex-1", data.objectFit === 'contain' ? "object-contain bg-gray-50" : "object-cover", data.isPolaroid ? "h-[85%] border-[12px] border-white w-auto max-w-full" : "h-full")} />
                            {data.isPolaroid && (<div className="h-[15%] w-full bg-white flex items-center justify-between px-6 pb-2 absolute bottom-0"><span className="font-hand text-xl text-gray-600 truncate">{data.title || 'Untitled'}</span><span className="text-[9px] uppercase tracking-widest text-gray-400 shrink-0">{data.imageTag || 'Photo'}</span></div>)}
                            {!data.isPolaroid && data.imageTag && (<div className="absolute bottom-4 left-4 rounded-md bg-black/20 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-md">{data.imageTag}</div>)}
                        </div>
                    )}
                    {data.type === 'status' && (
                        <div className="flex flex-col h-full w-full text-left">
                            <div className="flex gap-2 mb-3">
                                {data.status && <span className="inline-flex items-center rounded-sm bg-orange-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-orange-600">{data.status}</span>}
                            </div>
                            <h3 className="font-serif-display text-4xl font-normal leading-none tracking-tight text-black">{data.title}</h3>
                            {data.content && <p className="mt-2 text-xs text-gray-500">{data.content}</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});
Block.displayName = 'Block';
