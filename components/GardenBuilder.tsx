'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Settings2, Check, Grid, Github, Twitter, FileText, RotateCcw } from 'lucide-react';
import { Block, BlockData, BlockType } from './Block';
import { Onboarding } from './Onboarding';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// Fix for Next.js/Turbopack ESM compatibility
const RGL = require('react-grid-layout');
const ReactGridLayout = typeof RGL === 'function' ? RGL : (RGL.default || RGL);
const Responsive = RGL.Responsive || RGL.default?.Responsive;

interface Layout {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
}

// --- CUSTOM HOOK: DYNAMIC WIDTH SYNC ---
function useGridWidth() {
    const [width, setWidth] = useState(1200);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;

        const observer = new ResizeObserver(([entry]) => {
            const newWidth = entry.contentRect.width;
            console.log('🔍 [GRID ENGINE] Container ResizeObserver:');
            console.log('  📏 Container Width:', newWidth, 'px');
            console.log('  🖥️ Viewport Width:', window.innerWidth, 'px');
            console.log('  📐 Column Width (12 cols, 16px margin):', (newWidth - (11 * 16)) / 12, 'px');
            console.log('  🎯 Max X for column 12:', 11, '(0-indexed)');
            setWidth(newWidth);
        });

        observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return { width, ref };
}

// --- CONSTANTS ---
const ROW_HEIGHT = 100;
const GRID_MARGIN: [number, number] = [16, 16];
const CONTAINER_PADDING: [number, number] = [0, 0];
const MAX_COLS = 12;

// High-quality default blocks
const DEFAULT_BLOCKS: BlockData[] = [
    {
        id: 'default-1',
        type: 'project',
        category: 'Projects',
        title: 'Digital Garden',
        content: 'A creative canvas for your ideas',
        x: 0,
        y: 0,
        w: 4,
        h: 4,
        color: '#ffffff'
    },
    {
        id: 'default-2',
        type: 'image',
        category: 'Hobbies · Photography',
        imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        imageTag: 'FilmNeverDie KIRO 400',
        title: 'Curious Cat',
        x: 4,
        y: 0,
        w: 3,
        h: 4,
        objectFit: 'cover',
        isPolaroid: true,
        color: '#ffffff'
    },
    {
        id: 'default-3',
        type: 'thought',
        category: 'Ideas',
        title: 'Welcome!',
        content: 'Digital gardens grow with you.',
        x: 7,
        y: 0,
        w: 3,
        h: 3,
        color: '#fbf8cc'
    }
];

export default function GardenBuilder() {
    const [isMount, setIsMount] = useState(false);
    const [blocks, setBlocks] = useState<BlockData[]>([]);
    const [gardenName, setGardenName] = useState('My Garden');
    const [isEditMode, setIsEditMode] = useState(false);
    const [isNewUser, setIsNewUser] = useState(true);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [showGrid, setShowGrid] = useState(false);
    const [filter, setFilter] = useState<string | null>(null);
    const { width, ref: containerRef } = useGridWidth();

    // --- INITIALIZATION ---
    useEffect(() => {
        setIsMount(true);

        const savedBlocks = localStorage.getItem('garden-blocks');
        const savedName = localStorage.getItem('garden-name');
        const savedUser = localStorage.getItem('garden-new-user');
        const savedGrid = localStorage.getItem('garden-show-grid');

        if (savedGrid === 'true') setShowGrid(true);

        if (savedBlocks) {
            try {
                const parsed = JSON.parse(savedBlocks);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setBlocks(parsed);
                } else {
                    setBlocks(DEFAULT_BLOCKS);
                }
            } catch (e) {
                console.error('Error loading blocks:', e);
                setBlocks(DEFAULT_BLOCKS);
            }
        } else {
            setBlocks(DEFAULT_BLOCKS);
        }

        if (savedName) setGardenName(savedName);
        if (savedUser === 'false') setIsNewUser(false);
    }, []);

    // --- PERSISTENCE ---
    useEffect(() => {
        if (!isMount) return;
        localStorage.setItem('garden-blocks', JSON.stringify(blocks));
        localStorage.setItem('garden-name', gardenName);
        localStorage.setItem('garden-new-user', String(isNewUser));
        localStorage.setItem('garden-show-grid', String(showGrid));
    }, [blocks, gardenName, isNewUser, isMount, showGrid]);

    // --- GRID LOGIC ---

    // Smart insertion: scan grid from top-left to find first available space
    const findFirstGap = (w: number, h: number): { x: number; y: number } => {
        const occupied = new Set<string>();
        blocks.forEach(b => {
            for (let i = 0; i < b.w; i++) {
                for (let j = 0; j < b.h; j++) {
                    occupied.add(`${b.x + i},${b.y + j}`);
                }
            }
        });

        // Scan row by row (y), then left to right (x)
        for (let y = 0; y < 1000; y++) {
            for (let x = 0; x <= MAX_COLS - w; x++) {
                let fits = true;
                for (let i = 0; i < w; i++) {
                    for (let j = 0; j < h; j++) {
                        if (occupied.has(`${x + i},${y + j}`)) {
                            fits = false;
                            break;
                        }
                    }
                    if (!fits) break;
                }
                if (fits) {
                    console.log(`✅ [INSERTION] Found gap at X:${x}, Y:${y} for ${w}x${h} block`);
                    return { x, y };
                }
            }
        }
        return { x: 0, y: 0 };
    };

    const addBlock = (type: BlockType) => {
        // Blocks are 1x1 or 2x2 as requested
        const w = (type === 'project' || type === 'image') ? 2 : 1;
        const h = (type === 'project' || type === 'image') ? 2 : 1;
        const pos = findFirstGap(w, h);

        const id = `block-${Date.now()}`;
        const newBlock: BlockData = {
            id,
            type,
            category: 'New',
            title: 'New Item',
            x: pos.x,
            y: pos.y,
            w,
            h,
            color: type === 'thought' ? '#fbf8cc' : '#ffffff'
        };

        if (type === 'image') {
            newBlock.imageUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
            newBlock.objectFit = 'cover';
        }

        setBlocks([...blocks, newBlock]);
        setShowAddMenu(false);

        // Auto-focus: smooth scroll to new block
        setTimeout(() => {
            const element = document.querySelector(`[data-id="${id}"]`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);

        console.log(`➕ [ADD BLOCK] Type: ${type}, Position: X:${pos.x}, Y:${pos.y}`);
    };

    const onLayoutChange = (layout: Layout[]) => {
        console.log('🔄 [LAYOUT CHANGE] Grid updated:');
        layout.forEach((item) => {
            const block = blocks.find(b => b.id === item.i);
            console.log(`  📦 "${block?.title || item.i}":`, {
                x: item.x,
                y: item.y,
                w: item.w,
                h: item.h,
                rightEdge: item.x + item.w,
                reachesCol12: (item.x + item.w) === 12 ? '✅' : '❌'
            });
        });

        const updated = blocks.map(b => {
            const layoutItem = layout.find(l => l.i === b.id);
            if (layoutItem) {
                return {
                    ...b,
                    x: layoutItem.x,
                    y: layoutItem.y,
                    w: layoutItem.w,
                    h: layoutItem.h
                };
            }
            return b;
        });

        if (JSON.stringify(updated) !== JSON.stringify(blocks)) {
            setBlocks(updated);
        }
    };

    const handleResetGarden = () => {
        if (window.confirm('⚠️ Reset Layout?\n\nThis will clear all blocks and restore defaults. This action cannot be undone.')) {
            console.log('🔄 [RESET] Clearing garden and loading defaults...');
            setBlocks(DEFAULT_BLOCKS);
            localStorage.setItem('garden-blocks', JSON.stringify(DEFAULT_BLOCKS));
        }
    };

    // Extract unique categories for navbar
    const categories = useMemo(() => {
        const cats = blocks.map(b => b.category.split(' · ')[0] || 'Other');
        return Array.from(new Set(cats));
    }, [blocks]);

    if (!isMount) return <div className="min-h-screen bg-[#F9F9F9]" />;

    return (
        <div className="min-h-screen bg-[#F9F9F9] transition-colors duration-500">
            <AnimatePresence>
                {isNewUser && <Onboarding onComplete={(d) => { setGardenName(d.name); setIsNewUser(false); }} />}
            </AnimatePresence>

            {/* CHESTER PILL NAVBAR */}
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 min-w-[400px] max-w-fit rounded-full bg-white/80 px-6 py-3 shadow-xl backdrop-blur-md border border-black/5 transition-all">
                <div className="flex items-center gap-2">
                    <span className="font-serif-display text-lg font-bold italic mr-2">{gardenName}</span>
                    <div className="h-6 w-px bg-black/10 mx-1" />
                    <button
                        onClick={() => setFilter(null)}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                            !filter ? "bg-black text-white shadow-sm" : "text-gray-400 hover:text-black hover:bg-gray-50"
                        )}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat === filter ? null : cat)}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                                filter === cat ? "bg-black text-white shadow-sm" : "text-gray-400 hover:text-black hover:bg-gray-50"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3 border-l border-black/5 pl-3 ml-1 shrink-0">
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-black transition-colors">GitHub</a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-black transition-colors">Twitter</a>
                    <a href="#" className="text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-black transition-colors">CV</a>
                </div>
            </nav>

            <header className="mb-12 mt-20 px-2">
                <h1 className="font-serif-display text-5xl font-bold italic">{gardenName}</h1>
            </header>

            {/* GRID CONTAINER - THE WALL SOLUTION */}
            <div ref={containerRef} className="relative min-h-[600px] w-full p-2 pb-32">
                {/* VISUAL DEBUGGER */}
                {showGrid && (
                    <div className="absolute inset-0 pointer-events-none z-10">
                        {/* Column Numbers */}
                        <div className="absolute top-[-30px] left-0 right-0 flex">
                            {Array.from({ length: MAX_COLS }).map((_, i) => {
                                const colWidth = (width - (11 * GRID_MARGIN[0])) / MAX_COLS;
                                const leftPos = i * (colWidth + GRID_MARGIN[0]);
                                return (
                                    <div
                                        key={i}
                                        className={cn(
                                            "text-[11px] font-bold text-center py-1 rounded absolute",
                                            i === 11 ? "bg-yellow-100/80 text-yellow-800 px-2" : "text-black/40"
                                        )}
                                        style={{ left: `${leftPos}px`, width: `${colWidth}px` }}
                                    >
                                        {i + 1}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Grid Lines */}
                        <div className="h-full w-full relative">
                            {Array.from({ length: MAX_COLS }).map((_, i) => {
                                const colWidth = (width - (11 * GRID_MARGIN[0])) / MAX_COLS;
                                const leftPos = i * (colWidth + GRID_MARGIN[0]);
                                return (
                                    <div
                                        key={i}
                                        className={cn(
                                            "absolute top-0 bottom-0 border-x border-dashed",
                                            i === 11 ? "bg-yellow-50/50 border-yellow-400 border-2" : "bg-black/[0.02] border-black/10"
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

                {/* REACT GRID LAYOUT - ANTI-GRAVITY ENGINE */}
                <ReactGridLayout
                    className="layout"
                    width={width}
                    cols={MAX_COLS}
                    maxCols={MAX_COLS}
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
                    layout={blocks.map(b => ({ i: b.id, x: b.x, y: b.y, w: b.w, h: b.h }))}
                >
                    {blocks.map(block => {
                        const isDimmed = filter && !block.category.startsWith(filter);
                        return (
                            <div key={block.id} data-id={block.id}>
                                <div className={cn(
                                    "h-full w-full transition-opacity duration-300",
                                    isDimmed ? "opacity-20 grayscale pointer-events-none" : "opacity-100"
                                )}>
                                    <Block
                                        data={block}
                                        isEditMode={isEditMode}
                                        onDelete={(id) => setBlocks(p => p.filter(b => b.id !== id))}
                                        onUpdate={(id, d) => setBlocks(p => p.map(b => b.id === id ? { ...b, ...d } : b))}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </ReactGridLayout>
            </div>

            {/* CONTROLS - Bottom Right */}
            <div className="fixed bottom-8 right-8 flex items-center gap-4 z-[100]">
                <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all",
                        showGrid ? 'bg-black text-white shadow-lg scale-110' : 'bg-white text-black hover:bg-gray-50 shadow-md'
                    )}
                >
                    <Grid size={24} />
                </button>
                <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all",
                        isEditMode ? 'bg-black text-white shadow-lg' : 'bg-white text-black hover:bg-gray-50 shadow-md'
                    )}
                >
                    {isEditMode ? <Check size={24} /> : <Settings2 size={24} />}
                </button>
            </div>

            {/* ADD BLOCK MENU - Bottom Center */}
            <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${isEditMode ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
                <AnimatePresence>
                    {showAddMenu && (
                        <motion.div
                            className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl border border-black/5 min-w-[140px]"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                        >
                            {(['text', 'image', 'quote', 'thought', 'project'] as BlockType[]).map(type => (
                                <button
                                    key={type}
                                    onClick={() => addBlock(type)}
                                    className="px-4 py-2 hover:bg-gray-50 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
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
                        "flex h-16 w-16 items-center justify-center rounded-full shadow-2xl transition-all border border-black/5 bg-black text-white",
                        showAddMenu ? 'rotate-45' : 'hover:scale-105'
                    )}
                >
                    <Plus size={32} />
                </button>
            </div>

            {/* RESET BUTTON - Bottom Left */}
            <div className="fixed bottom-8 left-8 z-[100]">
                <button
                    onClick={handleResetGarden}
                    className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-400 shadow-lg transition-all hover:bg-red-50 hover:text-red-500 border border-black/5"
                    title="Reset Layout"
                >
                    <RotateCcw size={24} className="transition-transform group-hover:rotate-180" />
                    <span className="absolute left-16 whitespace-nowrap bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity">
                        Reset Layout
                    </span>
                </button>
            </div>

            <style jsx global>{`
                .react-grid-placeholder {
                    background: rgba(0,0,0,0.05) !important;
                    border: 2px dashed rgba(0,0,0,0.5) !important;
                    border-radius: 16px !important;
                    opacity: 1 !important;
                    z-index: 10 !important;
                }
                .react-resizable-handle {
                    z-index: 100;
                }
                .react-resizable-handle-se {
                    cursor: nwse-resize;
                }
                .react-resizable-handle-e {
                    cursor: col-resize;
                }
                .react-resizable-handle-s {
                    cursor: row-resize;
                }
            `}</style>
        </div>
    );
}
