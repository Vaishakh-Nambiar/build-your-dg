'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Settings2, Check, Grid, RotateCcw, Bug, Maximize2, Minimize2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type BlockType = 'text' | 'image' | 'quote' | 'thought' | 'project' | 'status';

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
            "fixed bottom-8 left-0 right-0 z-[100] px-8 flex items-center justify-between pointer-events-none",
            isDebugMode && "border border-red-500/20"
        )}>
            {/* Left: Reset */}
            <div className="flex items-center gap-4 pointer-events-auto">
                <button
                    onClick={onResetGarden}
                    className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-400 shadow-xl transition-all hover:bg-red-50 hover:text-red-500 border border-black/5"
                    title="Reset Layout"
                >
                    <RotateCcw size={22} className="transition-transform group-hover:rotate-180" />
                    <span className="absolute left-16 whitespace-nowrap bg-black text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
                        Reset Layout
                    </span>
                </button>

                {/* Debug Button */}
                <button
                    onClick={() => setIsDebugMode(!isDebugMode)}
                    className={cn(
                        "group relative flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all border border-black/5",
                        isDebugMode ? 'bg-red-500 text-white' : 'bg-white text-gray-400'
                    )}
                    title="Toggle Debug Borders"
                >
                    <Bug size={22} />
                    <span className="absolute left-16 whitespace-nowrap bg-black text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
                        Debug Mode
                    </span>
                </button>
            </div>

            {/* Center: Add Block (Visible only in Edit Mode) */}
            <div className={cn(
                "absolute left-1/2 -translate-x-1/2 transition-all duration-500 flex flex-col items-center gap-4",
                isEditMode ? "translate-y-0 opacity-100 pointer-events-auto" : "translate-y-20 opacity-0 pointer-events-none"
            )}>
                <AnimatePresence>
                    {showAddMenu && (
                        <motion.div
                            className="flex flex-col gap-1 rounded-3xl bg-white p-2 shadow-2xl border border-black/5 min-w-[160px]"
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        >
                            {(['text', 'image', 'quote', 'thought', 'project'] as BlockType[]).map(type => (
                                <button
                                    key={type}
                                    onClick={() => {
                                        onAddBlock(type);
                                        setShowAddMenu(false);
                                    }}
                                    className="px-6 py-2.5 hover:bg-black hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-left"
                                >
                                    {type}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    onClick={() => setShowAddMenu(!showAddMenu)}
                    className={cn(
                        "flex h-16 w-16 items-center justify-center rounded-full shadow-2xl transition-all border border-black/5 bg-black text-white hover:scale-105 active:scale-95",
                        showAddMenu && "rotate-45 bg-red-500"
                    )}
                >
                    <Plus size={32} />
                </button>
            </div>

            {/* Right: Grid, Edit, and Padding Control */}
            <div className="flex items-center gap-4 pointer-events-auto">
                {/* Padding Control */}
                <div className="flex items-center gap-3 bg-white rounded-full px-4 h-14 shadow-xl border border-black/5 mr-2">
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

                <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all border border-black/5",
                        showGrid ? 'bg-black text-white scale-110 shadow-black/20' : 'bg-white text-gray-400 hover:text-black'
                    )}
                    title="Toggle Layout Grid"
                >
                    <Grid size={22} />
                </button>
                <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all border border-black/5",
                        isEditMode ? 'bg-black text-white hover:bg-neutral-800' : 'bg-white text-gray-400 hover:text-black'
                    )}
                    title={isEditMode ? "Save Layout" : "Edit Layout"}
                >
                    {isEditMode ? <Check size={22} /> : <Settings2 size={22} />}
                </button>
            </div>
        </div>
    );
};
