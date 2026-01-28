'use client';

import React, { useState, useEffect, useRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

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
    xl: { cols: 10, rowHeight: 90, margin: [14, 14] },
    lg: { cols: 8, rowHeight: 80, margin: [12, 12] },
    md: { cols: 6, rowHeight: 70, margin: [10, 10] },
    sm: { cols: 4, rowHeight: 60, margin: [8, 8] },
    xs: { cols: 2, rowHeight: 50, margin: [6, 6] }
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
        
        return layout.map(item => {
            let { w, h } = item;
            
            // Smart scaling based on breakpoint
            switch (breakpoint) {
                case 'xs':
                    // Force everything to be narrow on mobile
                    w = Math.min(w, 2);
                    h = Math.max(h, 2); // Maintain minimum height
                    break;
                case 'sm':
                    w = Math.min(w, 3);
                    break;
                case 'md':
                    w = Math.min(w, 4);
                    break;
                case 'lg':
                    w = Math.min(w, 6);
                    break;
                default:
                    // xl and xxl keep original sizes
                    break;
            }
            
            // Ensure items don't exceed column limits
            w = Math.min(w, maxCols);
            
            // Reposition if necessary
            let x = item.x;
            if (x + w > maxCols) {
                x = Math.max(0, maxCols - w);
            }
            
            return { ...item, x, w, h };
        });
    };

    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver(([entry]) => {
            const newWidth = Math.floor(entry.contentRect.width);
            const newBreakpoint = getBreakpoint(newWidth);
            
            setWidth(newWidth);
            
            if (newBreakpoint !== currentBreakpoint) {
                setCurrentBreakpoint(newBreakpoint);
                
                // Update layout for new breakpoint
                const responsiveLayout = getResponsiveLayout(currentLayout, newBreakpoint);
                if (JSON.stringify(responsiveLayout) !== JSON.stringify(currentLayout)) {
                    onLayoutChange(responsiveLayout);
                }
            }
        });

        if (containerRef.current) {
            const initialWidth = containerRef.current.offsetWidth;
            setWidth(initialWidth);
            setCurrentBreakpoint(getBreakpoint(initialWidth));
        }
        
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [currentLayout, currentBreakpoint, onLayoutChange]);

    const colWidth = (width - ((MAX_COLS - 1) * GRID_MARGIN[0])) / MAX_COLS;

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
                {/* VISUAL DEBUGGER OVERLAY */}
                {showGrid && (
                    <div className="absolute inset-0 pointer-events-none z-10">
                        {/* Breakpoint Indicator */}
                        <div className="absolute top-[-80px] left-0 bg-blue-100 text-blue-900 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">
                            {currentBreakpoint.toUpperCase()} • {MAX_COLS} cols • {width}px
                        </div>
                        
                        {/* Column Numbers */}
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
                                        {i + 1}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Grid Columns */}
                        <div className="h-full w-full relative">
                            {Array.from({ length: MAX_COLS }).map((_, i) => {
                                const leftPos = i * (colWidth + GRID_MARGIN[0]);
                                return (
                                    <div
                                        key={i}
                                        className={cn(
                                            "absolute top-0 bottom-0 border-x border-dashed transition-all duration-500",
                                            i === MAX_COLS - 1 ? "bg-yellow-50/30 border-yellow-400/20" : "bg-black/[0.005] border-black/5"
                                        )}
                                        style={{
                                            left: `${leftPos}px`,
                                            width: `${colWidth}px`
                                        }}
                                    />
                                );
                            })}
                        </div>
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
                    isResizable={isEditMode}
                    compactType={currentBreakpoint === 'xs' || currentBreakpoint === 'sm' ? 'vertical' : null}
                    preventCollision={false}
                    draggableHandle=".drag-handle"
                    resizeHandles={['se', 'e', 's']}
                    onLayoutChange={onLayoutChange}
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
                .react-resizable-handle {
                    z-index: 100;
                }
                .react-resizable-handle-se { cursor: nwse-resize; }
                .react-resizable-handle-e { cursor: col-resize; }
                .react-resizable-handle-s { cursor: row-resize; }

                .react-grid-item {
                    transition: all 500ms cubic-bezier(0.23, 1, 0.32, 1);
                    transition-property: left, top, width, height;
                }
                
                /* CRITICAL: Disable all transitions during active interactions to prevent lag */
                .react-grid-item.resizing, 
                .react-grid-item.react-grid-placeholder,
                .react-grid-item.react-draggable-dragging {
                    transition: none !important;
                    z-index: 100 !important;
                }

                ${isDebugMode ? `
                    .react-grid-item {
                        outline: 1px solid rgba(255, 0, 0, 0.2);
                        outline-offset: -1px;
                    }
                ` : ''}
            `}</style>
        </div>
    );
};
