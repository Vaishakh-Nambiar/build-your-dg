'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { RepositioningEngine, GridItem, DropZone } from './RepositioningEngine';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Proper ES6 import with dynamic fallback
let ReactGridLayout: any;
try {
    ReactGridLayout = require('react-grid-layout').default || require('react-grid-layout');
} catch (error) {
    console.error('Failed to load react-grid-layout:', error);
}

interface Layout {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
}

interface GridEngineProps {
    children: React.ReactNode;
    isEditMode: boolean;
    onLayoutChange: (layout: Layout[]) => void;
    currentLayout: Layout[];
    showGrid: boolean;
    isDebugMode: boolean;
    sidePadding: number;
}

// Responsive breakpoints and configurations
const BREAKPOINTS = {
    xxl: 1400,
    xl: 1200,
    lg: 996,
    md: 768,
    sm: 576,
    xs: 0
};

const RESPONSIVE_CONFIGS = {
    xxl: { cols: 12, rowHeight: 100, margin: [16, 16] },
    xl: { cols: 12, rowHeight: 100, margin: [16, 16] },  // Keep desktop full-featured
    lg: { cols: 10, rowHeight: 90, margin: [14, 14] },
    md: { cols: 8, rowHeight: 80, margin: [12, 12] },
    sm: { cols: 6, rowHeight: 70, margin: [10, 10] },   // More columns for better layout
    xs: { cols: 4, rowHeight: 60, margin: [8, 8] }      // More columns on mobile
};

const CONTAINER_PADDING: [number, number] = [0, 0];

export const GridEngine = ({
    children,
    isEditMode,
    onLayoutChange,
    currentLayout,
    showGrid,
    isDebugMode,
    sidePadding
}: GridEngineProps) => {
    const [width, setWidth] = useState(1200);
    const [currentBreakpoint, setCurrentBreakpoint] = useState('xxl');
    const [repositioningEngine] = useState(() => new RepositioningEngine(12, null));
    const [draggedItem, setDraggedItem] = useState<GridItem | null>(null);
    const [dropZones, setDropZones] = useState<DropZone[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Get current responsive config
    const config = RESPONSIVE_CONFIGS[currentBreakpoint as keyof typeof RESPONSIVE_CONFIGS];
    const { cols: MAX_COLS, rowHeight: ROW_HEIGHT, margin: GRID_MARGIN } = config;

    // Determine current breakpoint based on width
    const getBreakpoint = (width: number): string => {
        if (width >= BREAKPOINTS.xxl) return 'xxl';
        if (width >= BREAKPOINTS.xl) return 'xl';
        if (width >= BREAKPOINTS.lg) return 'lg';
        if (width >= BREAKPOINTS.md) return 'md';
        if (width >= BREAKPOINTS.sm) return 'sm';
        return 'xs';
    };

    // Smart layout compaction for smaller screens
    const getResponsiveLayout = (layout: Layout[], breakpoint: string) => {
        const maxCols = RESPONSIVE_CONFIGS[breakpoint as keyof typeof RESPONSIVE_CONFIGS].cols;
        
        // On desktop breakpoints (xl, xxl), return original layout unchanged
        if (breakpoint === 'xl' || breakpoint === 'xxl') {
            return layout;
        }
        
        // On smaller screens, use smarter responsive sizing
        return layout.map((item) => {
            let responsiveW: number;
            let responsiveH: number;
            
            // Better responsive sizing that maintains usability
            switch (breakpoint) {
                case 'xs':
                    // Mobile: Use more reasonable sizes
                    if (item.w >= 4) responsiveW = 4;      // Large items take full width
                    else if (item.w >= 3) responsiveW = 3; // Medium items
                    else responsiveW = 2;                  // Small items minimum 2 cols
                    responsiveH = Math.max(item.h, 2);     // Maintain reasonable height
                    break;
                case 'sm':
                    // Large mobile/small tablet: Better proportions
                    if (item.w >= 4) responsiveW = 5;      // Large items
                    else if (item.w >= 3) responsiveW = 4; // Medium items  
                    else responsiveW = 3;                  // Small items
                    responsiveH = Math.max(item.h, 2);
                    break;
                case 'md':
                    // Tablet: Scale down but keep proportions
                    responsiveW = Math.min(Math.max(item.w - 1, 2), 6); // Scale down by 1, min 2, max 6
                    responsiveH = Math.max(item.h, 2);
                    break;
                case 'lg':
                    // Small desktop: Minor scaling
                    responsiveW = Math.min(item.w, 8);
                    responsiveH = item.h;
                    break;
                default:
                    responsiveW = item.w;
                    responsiveH = item.h;
            }
            
            // Ensure items don't exceed column limits
            responsiveW = Math.min(responsiveW, maxCols);
            
            // Smart repositioning
            let responsiveX = item.x;
            if (responsiveX + responsiveW > maxCols) {
                responsiveX = Math.max(0, maxCols - responsiveW);
            }
            
            return { 
                ...item, 
                x: responsiveX, 
                w: responsiveW, 
                h: responsiveH 
            };
        });
    };

    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver(([entry]) => {
            const newWidth = Math.floor(entry.contentRect.width);
            const newBreakpoint = getBreakpoint(newWidth);
            
            setWidth(newWidth);
            setCurrentBreakpoint(newBreakpoint);
            // No automatic layout changes - just update the display
        });

        if (containerRef.current) {
            const initialWidth = containerRef.current.offsetWidth;
            setWidth(initialWidth);
            setCurrentBreakpoint(getBreakpoint(initialWidth));
        }
        
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []); // No dependencies needed

    const colWidth = (width - ((MAX_COLS - 1) * GRID_MARGIN[0])) / MAX_COLS;

    // Intelligent repositioning handlers
    const handleDragStart = (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => {
        if (!isEditMode) return;
        
        const gridItem: GridItem = {
            i: newItem.i,
            x: newItem.x,
            y: newItem.y,
            w: newItem.w,
            h: newItem.h,
            isDraggable: true
        };
        
        setDraggedItem(gridItem);
    };

    const handleDrag = (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => {
        if (!isEditMode || !draggedItem) return;

        // Calculate drop zones for visual feedback
        const currentLayout: GridItem[] = layout.map(item => ({
            i: item.i,
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
            isDraggable: true
        }));

        const zones = repositioningEngine.calculateValidDropZones(
            draggedItem,
            currentLayout,
            newItem.x,
            newItem.y
        );

        setDropZones(zones);
    };

    const handleDragStop = (layout: Layout[], oldItem: Layout, newItem: Layout, placeholder: Layout, e: MouseEvent, element: HTMLElement) => {
        if (!isEditMode || !draggedItem) return;

        // Use intelligent repositioning to handle the drop
        const currentLayout: GridItem[] = layout.map(item => ({
            i: item.i,
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
            isDraggable: true
        }));

        const repositionResult = repositioningEngine.shiftTilesOnDrop(
            draggedItem,
            newItem.x,
            newItem.y,
            currentLayout
        );

        if (repositionResult.success) {
            // Convert back to react-grid-layout format
            const newLayout: Layout[] = repositionResult.newLayout.map(item => ({
                i: item.i,
                x: item.x,
                y: item.y,
                w: item.w,
                h: item.h
            }));

            onLayoutChange(newLayout);
        } else {
            // Revert to original position if repositioning fails
            console.warn('Repositioning failed:', repositionResult.reason);
            // The layout will automatically revert since we don't call onLayoutChange
        }

        // Clean up drag state
        setDraggedItem(null);
        setDropZones([]);
    };

    return (
        <div
            className={cn(
                "relative mx-auto w-full transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]",
                isDebugMode && "border-x border-blue-500/20 bg-blue-50/5"
            )}
            style={{
                paddingLeft: `${sidePadding}px`,
                paddingRight: `${sidePadding}px`,
                maxWidth: '1800px'
            }}
        >
            <div
                ref={containerRef}
                className={cn(
                    "relative min-h-[800px] w-full transition-all duration-300",
                    isDebugMode && "ring-1 ring-blue-500/30"
                )}
            >
                {/* ENHANCED DEBUG VISUALIZATION OVERLAY */}
                {showGrid && (
                    <div className="absolute inset-0 pointer-events-none z-10">
                        {/* Breakpoint Indicator */}
                        <div className="absolute top-[-80px] left-0 bg-blue-100 text-blue-900 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">
                            {currentBreakpoint.toUpperCase()} • {MAX_COLS} cols • {width}px
                            <span className="ml-2 text-xs text-blue-700">
                                {currentBreakpoint === 'xl' || currentBreakpoint === 'xxl' ? 'ORIGINAL SIZES' : 'RESPONSIVE SIZES'}
                            </span>
                        </div>
                        
                        {/* Column Numbers and Dimensions */}
                        <div className="absolute top-[-50px] left-0 right-0 flex">
                            {Array.from({ length: MAX_COLS }).map((_, i) => {
                                const leftPos = i * (colWidth + GRID_MARGIN[0]);
                                return (
                                    <div
                                        key={i}
                                        className={cn(
                                            "text-[10px] font-black text-center py-2 rounded absolute tracking-tighter transition-all",
                                            i === MAX_COLS - 1 ? "bg-yellow-100 text-yellow-900 border border-yellow-200" : "text-black/20"
                                        )}
                                        style={{ left: `${leftPos}px`, width: `${colWidth}px` }}
                                    >
                                        <div>{i + 1}</div>
                                        {isDebugMode && (
                                            <div className="text-[8px] text-black/40 mt-1">
                                                {Math.round(colWidth)}px
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Enhanced Grid Structure with Row and Column Borders */}
                        <div className="h-full w-full relative">
                            {/* Column Borders and Gap Markers */}
                            {Array.from({ length: MAX_COLS }).map((_, i) => {
                                const leftPos = i * (colWidth + GRID_MARGIN[0]);
                                return (
                                    <div key={`col-${i}`} className="absolute top-0 bottom-0">
                                        {/* Column Border */}
                                        <div
                                            className={cn(
                                                "absolute top-0 bottom-0 border-x border-dashed transition-all duration-500",
                                                isDebugMode 
                                                    ? "border-blue-400/40 bg-blue-50/10" 
                                                    : i === MAX_COLS - 1 
                                                        ? "bg-yellow-50/30 border-yellow-400/20" 
                                                        : "bg-black/[0.005] border-black/5"
                                            )}
                                            style={{
                                                left: `${leftPos}px`,
                                                width: `${colWidth}px`
                                            }}
                                        />
                                        
                                        {/* Gap Markers between columns */}
                                        {isDebugMode && i < MAX_COLS - 1 && (
                                            <div
                                                className="absolute top-0 bottom-0 bg-red-100/50 border-x border-red-300/30"
                                                style={{
                                                    left: `${leftPos + colWidth}px`,
                                                    width: `${GRID_MARGIN[0]}px`
                                                }}
                                            >
                                                {/* Gap size indicator */}
                                                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-[8px] font-bold text-red-600 bg-white/80 px-1 rounded">
                                                    {GRID_MARGIN[0]}px
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Row Borders and Indicators */}
                            {isDebugMode && (
                                <div className="absolute inset-0">
                                    {/* Calculate visible rows based on current layout */}
                                    {(() => {
                                        const maxY = Math.max(...currentLayout.map(item => item.y + item.h), 5);
                                        return Array.from({ length: maxY + 2 }).map((_, rowIndex) => {
                                            const topPos = rowIndex * (ROW_HEIGHT + GRID_MARGIN[1]);
                                            return (
                                                <div key={`row-${rowIndex}`} className="absolute left-0 right-0">
                                                    {/* Row Border */}
                                                    <div
                                                        className="absolute left-0 right-0 border-t border-dashed border-green-400/40 bg-green-50/5"
                                                        style={{
                                                            top: `${topPos}px`,
                                                            height: `${ROW_HEIGHT}px`
                                                        }}
                                                    />
                                                    
                                                    {/* Row Number and Dimension Indicator */}
                                                    <div
                                                        className="absolute left-[-40px] bg-green-100 text-green-900 px-2 py-1 rounded text-[10px] font-bold"
                                                        style={{ top: `${topPos + ROW_HEIGHT/2 - 10}px` }}
                                                    >
                                                        <div>R{rowIndex + 1}</div>
                                                        <div className="text-[8px] text-green-700">
                                                            {ROW_HEIGHT}px
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Gap Marker between rows */}
                                                    {rowIndex < maxY + 1 && (
                                                        <div
                                                            className="absolute left-0 right-0 bg-red-100/50 border-y border-red-300/30"
                                                            style={{
                                                                top: `${topPos + ROW_HEIGHT}px`,
                                                                height: `${GRID_MARGIN[1]}px`
                                                            }}
                                                        >
                                                            {/* Gap size indicator */}
                                                            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[8px] font-bold text-red-600 bg-white/80 px-1 rounded">
                                                                {GRID_MARGIN[1]}px gap
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            )}

                            {/* Grid Boundary Highlighting */}
                            {isDebugMode && (
                                <div className="absolute inset-0 border-2 border-purple-500/50 bg-purple-50/5 rounded-lg">
                                    {/* Grid boundary label */}
                                    <div className="absolute top-2 right-2 bg-purple-100 text-purple-900 px-2 py-1 rounded text-[10px] font-bold">
                                        GRID BOUNDARY
                                    </div>
                                    
                                    {/* Spacing measurements */}
                                    <div className="absolute bottom-2 left-2 bg-purple-100 text-purple-900 px-2 py-1 rounded text-[8px] font-bold">
                                        Container: {width}px × {(() => {
                                            const maxY = Math.max(...currentLayout.map(item => item.y + item.h), 5);
                                            return (maxY + 2) * (ROW_HEIGHT + GRID_MARGIN[1]) - GRID_MARGIN[1];
                                        })()}px
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Enhanced Drop Zone Visual Feedback with Animations */}
                        {isEditMode && draggedItem && dropZones.length > 0 && (
                            <div className="absolute inset-0 pointer-events-none z-20">
                                {dropZones.map((zone, index) => {
                                    const leftPos = zone.x * (colWidth + GRID_MARGIN[0]);
                                    const topPos = zone.y * (ROW_HEIGHT + GRID_MARGIN[1]);
                                    const zoneWidth = draggedItem.w * colWidth + (draggedItem.w - 1) * GRID_MARGIN[0];
                                    const zoneHeight = draggedItem.h * ROW_HEIGHT + (draggedItem.h - 1) * GRID_MARGIN[1];

                                    return (
                                        <motion.div
                                            key={`dropzone-${index}`}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ 
                                                opacity: index === 0 ? 0.9 : 0.5,
                                                scale: 1,
                                                y: [0, -2, 0]
                                            }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{
                                                duration: 0.3,
                                                y: {
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }
                                            }}
                                            className={cn(
                                                "absolute rounded-lg border-2 transition-all duration-200",
                                                zone.isValid 
                                                    ? "bg-green-100/60 border-green-400 border-dashed shadow-lg" 
                                                    : "bg-red-100/60 border-red-400 border-dashed shadow-lg",
                                                index === 0 ? "z-30 ring-2 ring-white/50" : "z-20"
                                            )}
                                            style={{
                                                left: `${leftPos}px`,
                                                top: `${topPos}px`,
                                                width: `${zoneWidth}px`,
                                                height: `${zoneHeight}px`,
                                            }}
                                        >
                                            {/* Animated drop zone indicator */}
                                            <motion.div 
                                                className={cn(
                                                    "absolute inset-2 rounded flex items-center justify-center text-xs font-bold",
                                                    zone.isValid ? "text-green-700" : "text-red-700"
                                                )}
                                                animate={{
                                                    scale: [1, 1.1, 1],
                                                }}
                                                transition={{
                                                    duration: 1.5,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                            >
                                                {index === 0 && (
                                                    <motion.span
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="flex items-center gap-1"
                                                    >
                                                        {zone.isValid ? (
                                                            <>
                                                                <span>✓</span>
                                                                {zone.shiftRequired ? "SHIFT" : "DROP"}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span>✗</span>
                                                                "BLOCKED"
                                                            </>
                                                        )}
                                                    </motion.span>
                                                )}
                                            </motion.div>

                                            {/* Ripple effect for primary drop zone */}
                                            {index === 0 && zone.isValid && (
                                                <motion.div
                                                    className="absolute inset-0 rounded-lg border-2 border-green-400"
                                                    animate={{
                                                        scale: [1, 1.2, 1],
                                                        opacity: [0.5, 0, 0.5]
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: "easeOut"
                                                    }}
                                                />
                                            )}
                                        </motion.div>
                                    );
                                })}

                                {/* Enhanced Shift Preview with Smooth Animations */}
                                {dropZones[0]?.shiftRequired && dropZones[0]?.shiftPreview && (
                                    <>
                                        {dropZones[0].shiftPreview.map((previewItem) => {
                                            // Only show preview for tiles that will actually move
                                            const originalItem = currentLayout.find(item => item.i === previewItem.i);
                                            if (!originalItem || (originalItem.x === previewItem.x && originalItem.y === previewItem.y)) {
                                                return null;
                                            }

                                            const leftPos = previewItem.x * (colWidth + GRID_MARGIN[0]);
                                            const topPos = previewItem.y * (ROW_HEIGHT + GRID_MARGIN[1]);
                                            const previewWidth = previewItem.w * colWidth + (previewItem.w - 1) * GRID_MARGIN[0];
                                            const previewHeight = previewItem.h * ROW_HEIGHT + (previewItem.h - 1) * GRID_MARGIN[1];

                                            return (
                                                <motion.div
                                                    key={`shift-preview-${previewItem.i}`}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ 
                                                        opacity: 0.7, 
                                                        scale: 1,
                                                        x: [0, 2, 0],
                                                    }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    transition={{
                                                        duration: 0.3,
                                                        x: {
                                                            duration: 1.5,
                                                            repeat: Infinity,
                                                            ease: "easeInOut"
                                                        }
                                                    }}
                                                    className="absolute rounded-lg border-2 border-blue-400 border-dashed bg-blue-100/40 z-25 shadow-md"
                                                    style={{
                                                        left: `${leftPos}px`,
                                                        top: `${topPos}px`,
                                                        width: `${previewWidth}px`,
                                                        height: `${previewHeight}px`,
                                                    }}
                                                >
                                                    <motion.div 
                                                        className="absolute inset-2 rounded flex items-center justify-center text-xs font-bold text-blue-700"
                                                        animate={{
                                                            scale: [1, 1.05, 1],
                                                        }}
                                                        transition={{
                                                            duration: 1,
                                                            repeat: Infinity,
                                                            ease: "easeInOut"
                                                        }}
                                                    >
                                                        <span className="flex items-center gap-1">
                                                            <span>→</span>
                                                            MOVE
                                                        </span>
                                                    </motion.div>
                                                </motion.div>
                                            );
                                        })}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ANTI-GRAVITY ENGINE */}
                <ReactGridLayout
                    className="layout"
                    width={width}
                    cols={MAX_COLS}
                    rowHeight={ROW_HEIGHT}
                    margin={GRID_MARGIN}
                    containerPadding={CONTAINER_PADDING}
                    isDraggable={isEditMode}
                    isResizable={false}
                    compactType={currentBreakpoint === 'xs' || currentBreakpoint === 'sm' ? 'vertical' : null}
                    preventCollision={false}
                    draggableHandle=".drag-handle"
                    resizeHandles={[]}
                    onLayoutChange={onLayoutChange}
                    onDragStart={handleDragStart}
                    onDrag={handleDrag}
                    onDragStop={handleDragStop}
                    layout={getResponsiveLayout(currentLayout, currentBreakpoint)}
                    useCSSTransforms={true}
                    autoSize={true}
                >
                    {children}
                </ReactGridLayout>
            </div>

            <style jsx global>{`
                .react-grid-placeholder {
                    background: rgba(0,0,0,0.03) !important;
                    border: 2px dashed rgba(0,0,0,0.3) !important;
                    border-radius: 24px !important;
                    opacity: 1 !important;
                    z-index: 10 !important;
                }
                
                /* Resize prevention: Hide all resize handles */
                .react-resizable-handle {
                    display: none !important;
                }

                /* Enhanced smooth animations for tile movements */
                .react-grid-item {
                    transition: all 600ms cubic-bezier(0.23, 1, 0.32, 1);
                    transition-property: left, top, width, height, transform, opacity;
                    will-change: transform;
                }
                
                /* Hover state animations for repositionable tiles */
                .react-grid-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                    z-index: 10;
                }
                
                /* Active dragging state with enhanced visual feedback */
                .react-grid-item.react-draggable-dragging {
                    transition: none !important;
                    z-index: 100 !important;
                    transform: rotate(2deg) scale(1.05) !important;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3) !important;
                    opacity: 0.9 !important;
                }
                
                /* Enhanced placeholder with pulsing animation */
                .react-grid-placeholder {
                    background: linear-gradient(45deg, rgba(0,0,0,0.03), rgba(0,0,0,0.06)) !important;
                    border: 2px dashed rgba(0,0,0,0.3) !important;
                    border-radius: 24px !important;
                    opacity: 1 !important;
                    z-index: 10 !important;
                    animation: placeholderPulse 2s ease-in-out infinite !important;
                }
                
                @keyframes placeholderPulse {
                    0%, 100% { 
                        opacity: 0.6;
                        transform: scale(1);
                    }
                    50% { 
                        opacity: 1;
                        transform: scale(1.02);
                    }
                }
                
                /* Template change animation */
                .react-grid-item.template-changing {
                    animation: templateChange 800ms cubic-bezier(0.23, 1, 0.32, 1);
                }
                
                @keyframes templateChange {
                    0% { 
                        transform: scale(1) rotate(0deg);
                        opacity: 1;
                    }
                    25% { 
                        transform: scale(0.95) rotate(-1deg);
                        opacity: 0.8;
                    }
                    50% { 
                        transform: scale(1.05) rotate(1deg);
                        opacity: 0.9;
                    }
                    75% { 
                        transform: scale(0.98) rotate(-0.5deg);
                        opacity: 0.95;
                    }
                    100% { 
                        transform: scale(1) rotate(0deg);
                        opacity: 1;
                    }
                }
                
                /* CRITICAL: Disable all transitions during active interactions to prevent lag */
                .react-grid-item.resizing, 
                .react-grid-item.react-grid-placeholder {
                    transition: none !important;
                }

                /* Resize prevention: Disable pointer events on any remaining resize elements */
                .react-resizable {
                    position: relative;
                }
                
                .react-resizable .react-resizable-handle {
                    pointer-events: none !important;
                    display: none !important;
                }

                ${isDebugMode ? `
                    .react-grid-item {
                        outline: 2px solid rgba(59, 130, 246, 0.4);
                        outline-offset: -2px;
                        background: rgba(59, 130, 246, 0.02);
                    }
                    
                    .react-grid-item:hover {
                        outline-color: rgba(59, 130, 246, 0.6);
                        background: rgba(59, 130, 246, 0.05);
                    }
                ` : ''}
            `}</style>
        </div>
    );
};
