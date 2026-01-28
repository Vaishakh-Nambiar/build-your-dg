'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Settings2, Check, Grid, RotateCcw, Bug, Maximize2, Minimize2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BlockType } from '../Block';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ControlsProps {
    isEditMode: boolean;
    setIsEditMode: (val: boolean) => void;
    showGrid: boolean;
    setShowGrid: (val: boolean) => void;
    isDebugMode: boolean;
    setIsDebugMode: (val: boolean) => void;
    sidePadding: number;
    setSidePadding: (val: number) => void;
    onAddBlock: (type: BlockType) => void;
    onResetGarden: () => void;
}

export const Controls = ({
    isEditMode,
    setIsEditMode,
    showGrid,
    setShowGrid,
    isDebugMode,
    setIsDebugMode,
    sidePadding,
    setSidePadding,
    onAddBlock,
    onResetGarden
}: ControlsProps) => {
    const [showAddMenu, setShowAddMenu] = useState(false);

    return (
        <div className={cn(
            "fixed bottom-4 sm:bottom-8 left-0 right-0 z-[100] px-4 sm:px-8 flex items-center justify-between pointer-events-none",
            isDebugMode && "border border-red-500/20"
        )}>
            {/* Left: Reset & Debug */}
            <div className="flex items-center gap-2 sm:gap-4 pointer-events-auto">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onResetGarden}
                    className="group relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-white text-gray-400 shadow-xl transition-all hover:bg-red-50 hover:text-red-500 border border-black/5"
                    title="Reset Layout"
                >
                    <RotateCcw size={18} className="sm:w-[22px] sm:h-[22px] transition-transform group-hover:rotate-180" />
                    <span className="absolute left-12 sm:left-16 whitespace-nowrap bg-black text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity hidden sm:block">
                        Reset Layout
                    </span>
                </motion.button>

                {/* Debug Button */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsDebugMode(!isDebugMode)}
                    className={cn(
                        "group relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full shadow-xl transition-all border border-black/5",
                        isDebugMode ? 'bg-red-500 text-white' : 'bg-white text-gray-400'
                    )}
                    title="Toggle Debug Borders"
                >
                    <Bug size={18} className="sm:w-[22px] sm:h-[22px]" />
                    <span className="absolute left-12 sm:left-16 whitespace-nowrap bg-black text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity hidden sm:block">
                        Debug Mode
                    </span>
                </motion.button>
            </div>

            {/* Center: Add Block (Visible only in Edit Mode) */}
            <div className={cn(
                "absolute left-1/2 -translate-x-1/2 transition-all duration-500 flex flex-col items-center gap-4",
                isEditMode ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-20 opacity-0 pointer-events-none"
            )}>
                <AnimatePresence>
                    {showAddMenu && (
                        <motion.div
                            className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 flex flex-col gap-1 rounded-2xl bg-white p-3 shadow-2xl border border-black/5 min-w-[160px] sm:min-w-[180px] max-h-[60vh] overflow-y-auto"
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        >
                            {[
                                { type: 'thought' as BlockType, size: '2×2', desc: 'Sticky note' },
                                { type: 'text' as BlockType, size: '3×2', desc: 'Text card' },
                                { type: 'quote' as BlockType, size: '3×3', desc: 'Quote block' },
                                { type: 'image' as BlockType, size: '3×3', desc: 'Photo' },
                                { type: 'video' as BlockType, size: '4×3', desc: 'Video/GIF' },
                                { type: 'project' as BlockType, size: '4×4', desc: 'Showcase' },
                                { type: 'status' as BlockType, size: '2×1', desc: 'Status banner' },
                            ].map(({ type, size, desc }) => (
                                <button
                                    key={type}
                                    onClick={() => {
                                        onAddBlock(type);
                                        setShowAddMenu(false);
                                    }}
                                    className="group flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-gray-50 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02]"
                                >
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <span className="uppercase tracking-wider text-black/80 group-hover:text-black text-[10px] sm:text-xs">{type}</span>
                                        <span className="text-[8px] sm:text-[9px] text-gray-400 hidden sm:inline">{desc}</span>
                                    </div>
                                    <span className="text-[9px] sm:text-[10px] font-mono bg-gray-100 px-1 sm:px-1.5 py-0.5 rounded text-gray-500 group-hover:bg-black group-hover:text-white transition-colors">{size}</span>
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowAddMenu(!showAddMenu)}
                    className={cn(
                        "flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full shadow-2xl transition-all border border-black/5 bg-black text-white",
                        showAddMenu && "rotate-45"
                    )}
                >
                    <Plus size={28} className="sm:w-8 sm:h-8" />
                </motion.button>
            </div>

            {/* Right: Grid, Edit, and Padding Control */}
            <div className="flex items-center gap-2 sm:gap-4 pointer-events-auto">
                {/* Padding Control - Hidden on mobile */}
                <div className="hidden sm:flex items-center gap-3 bg-white rounded-full px-4 h-14 shadow-xl border border-black/5 mr-2">
                    <button
                        onClick={() => setSidePadding(Math.max(0, sidePadding - 8))}
                        className="text-gray-400 hover:text-black transition-colors"
                    >
                        <Minimize2 size={18} />
                    </button>
                    <div className="flex flex-col items-center min-w-[60px]">
                        <span className="text-[9px] font-black uppercase tracking-widest text-black/30">Side Margin</span>
                        <span className="text-[10px] font-black">{sidePadding}px</span>
                    </div>
                    <button
                        onClick={() => setSidePadding(Math.min(128, sidePadding + 8))}
                        className="text-gray-400 hover:text-black transition-colors"
                    >
                        <Maximize2 size={18} />
                    </button>
                </div>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowGrid(!showGrid)}
                    className={cn(
                        "flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full shadow-xl transition-all border border-black/5",
                        showGrid ? 'bg-black text-white shadow-black/20' : 'bg-white text-gray-400 hover:text-black'
                    )}
                    title="Toggle Layout Grid"
                >
                    <Grid size={18} className="sm:w-[22px] sm:h-[22px]" />
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={cn(
                        "flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full shadow-xl transition-all border border-black/5",
                        isEditMode ? 'bg-black text-white hover:bg-neutral-800' : 'bg-white text-gray-400 hover:text-black'
                    )}
                    title={isEditMode ? "Save Layout" : "Edit Layout"}
                >
                    {isEditMode ? <Check size={18} className="sm:w-[22px] sm:h-[22px]" /> : <Settings2 size={18} className="sm:w-[22px] sm:h-[22px]" />}
                </motion.button>
            </div>
        </div>
    );
};
