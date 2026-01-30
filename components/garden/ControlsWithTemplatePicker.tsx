/**
 * Enhanced Controls Component with Template Picker
 * 
 * This component extends the existing Controls component to integrate
 * the TemplatePicker for visual template selection when creating tiles.
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Settings2, Check, Grid, RotateCcw, Bug, Maximize2, Minimize2, Eye, Palette } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BlockType } from '../Block';
import { TemplatePicker, useTemplatePicker, TileTemplate } from '../templates';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ControlsWithTemplatePickerProps {
    isEditMode: boolean;
    setIsEditMode: (val: boolean) => void;
    showGrid: boolean;
    setShowGrid: (val: boolean) => void;
    isDebugMode: boolean;
    setIsDebugMode: (val: boolean) => void;
    sidePadding: number;
    setSidePadding: (val: number) => void;
    onAddBlock: (type: BlockType, template?: TileTemplate, position?: { x: number; y: number }) => void;
    onResetGarden: () => void;
    onShowTiles?: () => void;
    existingTiles?: any[]; // For position calculation
    gridCols?: number;
}

export const ControlsWithTemplatePicker = ({
    isEditMode,
    setIsEditMode,
    showGrid,
    setShowGrid,
    isDebugMode,
    setIsDebugMode,
    sidePadding,
    setSidePadding,
    onAddBlock,
    onResetGarden,
    onShowTiles,
    existingTiles = [],
    gridCols = 12
}: ControlsWithTemplatePickerProps) => {
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [useTemplatePicker, setUseTemplatePicker] = useState(true);

    // Template picker hook
    const {
        isPickerOpen,
        selectedTileType,
        openPicker,
        closePicker,
        handleTemplateSelect,
        createTileWithDefaultTemplate
    } = useTemplatePicker({
        onCreateTile: (template, tileType, position) => {
            onAddBlock(tileType, template, position);
        },
        existingTiles,
        gridCols
    });

    // Handle tile creation - either with template picker or default
    const handleCreateTile = (type: BlockType) => {
        setShowAddMenu(false);
        
        if (useTemplatePicker) {
            openPicker(type);
        } else {
            // Use legacy behavior with default templates
            createTileWithDefaultTemplate(type);
        }
    };

    // Toggle between template picker and quick creation
    const toggleCreationMode = () => {
        setUseTemplatePicker(!useTemplatePicker);
    };

    return (
        <>
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
                                className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 flex flex-col gap-1 rounded-2xl bg-white p-3 shadow-2xl border border-black/5 min-w-[160px] sm:min-w-[200px] max-h-[60vh] overflow-y-auto"
                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                                transition={{ 
                                    type: "spring", 
                                    stiffness: 400, 
                                    damping: 25,
                                    mass: 0.8
                                }}
                            >
                                {/* Creation Mode Toggle with Enhanced Animation */}
                                <motion.div 
                                    className="mb-2 p-2 bg-gray-50 rounded-lg"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <motion.button
                                        onClick={toggleCreationMode}
                                        className={cn(
                                            "flex items-center gap-2 w-full px-2 py-1 rounded text-xs font-medium transition-all duration-200",
                                            useTemplatePicker 
                                                ? "bg-black text-white shadow-md" 
                                                : "bg-white text-gray-600 hover:bg-gray-100"
                                        )}
                                        title={useTemplatePicker ? "Using Template Picker" : "Using Quick Creation"}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <motion.div
                                            animate={{ rotate: useTemplatePicker ? 0 : 180 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Palette size={12} />
                                        </motion.div>
                                        {useTemplatePicker ? "Template Picker" : "Quick Create"}
                                    </motion.button>
                                </motion.div>

                                {/* Tile Type Options with Stagger Animation */}
                                {[
                                    { type: 'thought' as BlockType, icon: '💭', desc: 'Sticky note' },
                                    { type: 'text' as BlockType, icon: '📝', desc: 'Text card' },
                                    { type: 'quote' as BlockType, icon: '💬', desc: 'Quote block' },
                                    { type: 'image' as BlockType, icon: '🖼️', desc: 'Photo' },
                                    { type: 'video' as BlockType, icon: '🎥', desc: 'Video/GIF' },
                                    { type: 'project' as BlockType, icon: '🚀', desc: 'Project showcase' },
                                    { type: 'status' as BlockType, icon: '📊', desc: 'Status banner' },
                                ].map(({ type, icon, desc }, index) => (
                                    <motion.button
                                        key={type}
                                        onClick={() => handleCreateTile(type)}
                                        className="group flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-gray-50 rounded-xl text-xs font-semibold transition-all duration-200"
                                        initial={{ opacity: 0, x: -20, scale: 0.9 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        transition={{ 
                                            delay: 0.2 + index * 0.05,
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 20
                                        }}
                                        whileHover={{ scale: 1.02, x: 2 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <motion.span 
                                                className="text-lg"
                                                whileHover={{ 
                                                    scale: 1.2,
                                                    rotate: [0, -10, 10, 0]
                                                }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                {icon}
                                            </motion.span>
                                            <div className="flex flex-col items-start">
                                                <span className="uppercase tracking-wider text-black/80 group-hover:text-black text-[10px] sm:text-xs">{type}</span>
                                                <span className="text-[8px] sm:text-[9px] text-gray-400">{desc}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {useTemplatePicker && (
                                                <motion.span 
                                                    className="text-[8px] bg-blue-100 text-blue-600 px-1 py-0.5 rounded"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.3 + index * 0.05 }}
                                                >
                                                    Template
                                                </motion.span>
                                            )}
                                        </div>
                                    </motion.button>
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
                    {/* Show Tiles Button - Only in Debug Mode */}
                    {isDebugMode && onShowTiles && (
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onShowTiles}
                            className="group relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-purple-500 text-white shadow-xl transition-all hover:bg-purple-600 border border-black/5"
                            title="Show All Tiles"
                        >
                            <Eye size={18} className="sm:w-[22px] sm:h-[22px]" />
                            <span className="absolute right-12 sm:right-16 whitespace-nowrap bg-black text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity hidden sm:block">
                                Show Tiles
                            </span>
                        </motion.button>
                    )}

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

            {/* Template Picker Modal */}
            <TemplatePicker
                isOpen={isPickerOpen}
                onClose={closePicker}
                onSelectTemplate={handleTemplateSelect}
                selectedTileType={selectedTileType}
                config={{
                    showThumbnails: true,
                    groupByCategory: true,
                    filterByTileType: true,
                    showDescriptions: true
                }}
            />
        </>
    );
};