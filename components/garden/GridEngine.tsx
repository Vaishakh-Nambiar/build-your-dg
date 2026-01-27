'use client';

import React, { useState, useEffect, useRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Fix for Next.js/Turbopack ESM compatibility
const RGL = require('react-grid-layout');
const ReactGridLayout = typeof RGL === 'function' ? RGL : (RGL.default || RGL);

export type BlockType = 'text' | 'image' | 'quote' | 'thought' | 'project' | 'status';

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

const MAX_COLS = 12;
const ROW_HEIGHT = 100;
const GRID_MARGIN: [number, number] = [16, 16];
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
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver(([entry]) => {
            setWidth(Math.floor(entry.contentRect.width));
        });

        if (containerRef.current) setWidth(containerRef.current.offsetWidth);
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const colWidth = (width - (11 * GRID_MARGIN[0])) / MAX_COLS;

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
                        {/* Column Numbers */}
                        <div className="absolute top-[-50px] left-0 right-0 flex">
                            {Array.from({ length: MAX_COLS }).map((_, i) => {
                                const leftPos = i * (colWidth + GRID_MARGIN[0]);
                                return (
                                    <div
                                        key={i}
                                        className={cn(
                                            "text-[10px] font-black text-center py-2 rounded absolute tracking-tighter transition-all",
                                            i === 11 ? "bg-yellow-100 text-yellow-900 border border-yellow-200" : "text-black/20"
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
                                            i === 11 ? "bg-yellow-50/30 border-yellow-400/20" : "bg-black/[0.005] border-black/5"
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
                    compactType={null}
                    preventCollision={false}
                    draggableHandle=".drag-handle"
                    resizeHandles={['se', 'e', 's']}
                    onLayoutChange={onLayoutChange}
                    layout={currentLayout}
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
