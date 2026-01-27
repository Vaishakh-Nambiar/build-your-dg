'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Settings2, Check, Grid, Github, Twitter, FileText } from 'lucide-react';
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
const Responsive = RGL.Responsive;

interface Layout {
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
}

function useSize() {
    const [width, setWidth] = useState(1200);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;
        const observer = new ResizeObserver(([entry]) => {
            setWidth(entry.contentRect.width);
        });
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return { width, ref };
}

// --- CONSTANTS ---
const ROW_HEIGHT = 100;
const INITIAL_BLOCKS: BlockData[] = [
    {
        id: '1', type: 'image', category: 'Hobbies · Film',
        imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        imageTag: 'FilmNeverDie KIRO 400', title: 'Cat',
        x: 0, y: 0, w: 3, h: 4, objectFit: 'cover', isPolaroid: true
    },
    {
        id: '2', type: 'thought', category: 'Idea', title: 'Sticky Note',
        content: 'Digital gardens are less about the platform.',
        x: 3, y: 0, w: 3, h: 4, color: '#fbf8cc'
    },
    {
        id: '3', type: 'quote', category: 'Inspiration', title: 'Quote',
        content: 'We shape our tools.', author: 'Marshall McLuhan',
        x: 6, y: 0, w: 6, h: 3
    },
];

export default function GardenBuilder() {
    const [isMount, setIsMount] = useState(false);
    // TESTING MODE: Always use INITIAL_BLOCKS
    const [blocks, setBlocks] = useState<BlockData[]>(INITIAL_BLOCKS);
    const [gardenName, setGardenName] = useState('My Garden');
    const [isEditMode, setIsEditMode] = useState(false);
    const [isNewUser, setIsNewUser] = useState(true);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [showGrid, setShowGrid] = useState(false);
    const [filter, setFilter] = useState<string | null>(null);
    const { width, ref: containerRef } = useSize();

    const ENABLE_GHOST_ADD = false;

    // --- INIT ---
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
                }
            } catch (e) {
                console.error('Error loading blocks:', e);
            }
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

    // Find first gap logic (Left-to-Right Flow)
    const findFirstGap = (w: number, h: number) => {
        const maxX = 12;
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
            for (let x = 0; x <= maxX - w; x++) {
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
                if (fits) return { x, y };
            }
        }
        return { x: 0, y: 0 };
    };

    const addBlockAt = (x: number, y: number, type: BlockType = 'text') => {
        const id = Date.now().toString();
        const newBlock: BlockData = {
            id, type, category: 'New', title: 'New Item', x, y, w: 1, h: 1, color: '#ffffff'
        };
        setBlocks([...blocks, newBlock]);

        // Smooth scroll to bottom as requested
        setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);

        console.log(`Adding block at manual coordinates X: ${x}, Y: ${y}`);
    };

    const addBlock = (type: BlockType) => {
        // Strict Top-Down Scan
        const w = 3;
        const h = 3;
        let pos = { x: 0, y: 0 };

        const occupied = new Set<string>();
        blocks.forEach(b => {
            for (let i = 0; i < b.w; i++) {
                for (let j = 0; j < b.h; j++) {
                    occupied.add(`${b.x + i},${b.y + j}`);
                }
            }
        });

        let found = false;
        for (let y = 0; y < 1000; y++) {
            for (let x = 0; x <= 12 - w; x++) {
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
                    pos = { x, y };
                    found = true;
                    break;
                }
            }
            if (found) break;
        }

        const id = Date.now().toString();
        const newBlock: BlockData = {
            id, type, category: 'New', title: 'New Item', x: pos.x, y: pos.y, w, h, color: '#ffffff'
        };

        if (type === 'image') {
            newBlock.imageUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
            newBlock.objectFit = 'cover';
        }

        setBlocks([...blocks, newBlock]);
        setShowAddMenu(false);

        // Smooth scroll to bottom as requested
        setTimeout(() => {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);

        console.log(`Adding block at scanned coordinates X: ${pos.x}, Y: ${pos.y}, Type: ${type}`);
    };

    const onLayoutChange = (layout: Layout[]) => {
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
        if (window.confirm('Are you sure you want to reset your garden? This will clear all changes.')) {
            setBlocks(INITIAL_BLOCKS);
            localStorage.setItem('garden-blocks', JSON.stringify(INITIAL_BLOCKS));
            // Optional: Reload to clear all states
            // window.location.reload();
        }
    };

    const onDrag = (layout: any, oldItem: any, newItem: any, placeholder: any, e: any, element: any) => {
        console.log(`Dragging block ${newItem.i} to X: ${newItem.x}, Y: ${newItem.y}`);
    };

    if (!isMount) return <div className="min-h-screen bg-[#F9F9F9]" />;

    return (
        <div className="min-h-screen p-8 pb-32 sm:p-12 bg-[#F9F9F9] transition-colors duration-500 overflow-x-hidden">
            <AnimatePresence>
                {isNewUser && <Onboarding onComplete={(d) => { setGardenName(d.name); setIsNewUser(false); }} />}
            </AnimatePresence>

            {/* NAVBAR */}
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 min-w-[400px] max-w-fit rounded-full bg-white/80 px-6 py-2 shadow-lg backdrop-blur-xl border border-black/5 transition-all">
                <div className="flex items-center gap-2">
                    <span className="font-serif-display text-lg font-bold italic mr-4">{gardenName}</span>
                    <div className="h-6 w-px bg-black/10 mx-2" />
                    <button
                        onClick={() => setFilter(null)}
                        className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap", !filter ? "bg-black text-white shadow-sm" : "text-gray-400 hover:text-black")}
                    >
                        All
                    </button>
                    {Array.from(new Set(blocks.map(b => b.category.split(' · ')[0] || 'Other'))).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat === filter ? null : cat)}
                            className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap", filter === cat ? "bg-black text-white shadow-sm" : "text-gray-400 hover:text-black")}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-4 border-l border-black/5 pl-4 ml-2 shrink-0">
                    <a href="#" className="text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-black transition-colors">GitHub</a>
                    <a href="#" className="text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-black transition-colors">Twitter</a>
                    <a href="#" className="text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-black transition-colors">CV</a>
                </div>
            </nav>

            <header className="mb-12 mt-20">
                <h1 className="font-serif-display text-5xl font-bold italic">{gardenName}</h1>
            </header>

            {/* GRID CONTAINER */}
            <div ref={containerRef} className="relative min-h-[600px] w-full max-w-full px-0 mx-auto overflow-x-hidden">
                {/* VISUAL GRID LAYER */}
                {showGrid && (
                    <div className="absolute inset-0 pointer-events-none z-0">


                        <div className="h-full w-full grid grid-cols-12 gap-0 opacity-20">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className={cn(
                                    "h-full border-x border-dashed border-black transition-colors relative",
                                    i === 11 ? "bg-yellow-200/40 border-r-solid" : "bg-black/[0.01]"
                                )}>
                                    {/* COLUMN NUMBERS */}
                                    <div className="absolute top-[-24px] left-0 right-0 text-[10px] font-bold text-gray-400 text-center">
                                        {i + 1}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ROW NUMBERS */}
                        <div className="absolute top-0 left-[-32px] bottom-0 flex flex-col pointer-events-none">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div key={i} className="h-[100px] flex items-center justify-center text-[10px] font-bold text-gray-400">
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundSize: '100% 100px', backgroundImage: 'linear-gradient(to bottom, #000 1px, transparent 1px)' }} />
                    </div>
                )}

                {/* HOVER-TO-ADD LAYER */}
                {isEditMode && showGrid && ENABLE_GHOST_ADD && (
                    <div className="absolute inset-0 z-10 pointer-events-none">
                        {(() => {
                            const maxX = 12;
                            const maxY = Math.max(12, Math.ceil(blocks.reduce((m, b) => Math.max(m, b.y + b.h), 0) + 2));
                            const occupied = new Set<string>();
                            blocks.forEach(b => {
                                for (let i = 0; i < b.w; i++) {
                                    for (let j = 0; j < b.h; j++) {
                                        occupied.add(`${b.x + i},${b.y + j}`);
                                    }
                                }
                            });

                            const emptySlots = [];
                            for (let y = 0; y < maxY; y++) {
                                for (let x = 0; x < maxX; x++) {
                                    if (!occupied.has(`${x},${y}`)) emptySlots.push({ x, y });
                                }
                            }

                            return emptySlots.map(slot => (
                                <div
                                    key={`${slot.x}-${slot.y}`}
                                    className="absolute group/slot pointer-events-auto cursor-pointer flex items-center justify-center transition-all hover:bg-black/5 rounded-lg"
                                    style={{
                                        left: `calc(${(slot.x / 12) * 100}%)`,
                                        top: slot.y * 112,
                                        width: `calc(${(1 / 12) * 100}%)`,
                                        height: 100,
                                        padding: 6
                                    }}
                                    onClick={() => addBlockAt(slot.x, slot.y)}
                                >
                                    <div className="opacity-0 group-hover/slot:opacity-40 transition-opacity bg-black text-white rounded-full p-1 shadow-sm">
                                        <Plus size={12} />
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                )}

                <Responsive
                    className="layout"
                    width={width}
                    layouts={{ lg: blocks.map(b => ({ i: b.id, x: b.x, y: b.y, w: b.w, h: b.h })) }}
                    breakpoints={{ lg: 0 }}
                    cols={{ lg: 12 }}
                    maxCols={12}
                    rowHeight={ROW_HEIGHT}
                    margin={[12, 12]}
                    containerPadding={[0, 0]}
                    isDraggable={isEditMode}
                    isResizable={isEditMode}
                    compactType={null}
                    preventCollision={false}
                    resizeHandles={['s', 'w', 'e', 'n', 'sw', 'nw', 'se', 'ne']}
                    onLayoutChange={onLayoutChange}
                    onDrag={onDrag}
                >
                    {blocks.map(block => {
                        const isDimmed = filter && !block.category.startsWith(filter);
                        return (
                            <div key={block.id} data-id={block.id} data-grid={{ x: block.x, y: block.y, w: block.w, h: block.h }}>
                                <div className={cn("h-full w-full transition-opacity duration-300", isDimmed ? "opacity-20 grayscale pointer-events-none" : "opacity-100")}>
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
                </Responsive>
            </div>

            {/* CONTROLS */}
            <div className="fixed bottom-8 right-8 flex items-center gap-4 z-[100]">
                <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={cn("flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all", showGrid ? 'bg-black text-white shadow-lg scale-110' : 'bg-white text-black hover:bg-gray-50 shadow-md')}
                >
                    <Grid size={24} />
                </button>
                <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={cn("flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all", isEditMode ? 'bg-black text-white shadow-lg' : 'bg-white text-black hover:bg-gray-50 shadow-md')}
                >
                    {isEditMode ? <Check size={24} /> : <Settings2 size={24} />}
                </button>
            </div>

            <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${isEditMode ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
                <AnimatePresence>
                    {showAddMenu && (
                        <motion.div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl border border-black/5 min-w-[140px]" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                            {(['text', 'image', 'quote', 'thought', 'project'] as BlockType[]).map(type => (
                                <button key={type} onClick={() => addBlock(type)} className="px-4 py-2 hover:bg-gray-50 rounded-xl text-xs font-semibold uppercase tracking-wider">{type}</button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
                <button onClick={() => setShowAddMenu(!showAddMenu)} className={cn("flex h-16 w-16 items-center justify-center rounded-full shadow-2xl transition-all border border-black/5 bg-black text-white", showAddMenu ? 'rotate-45' : 'hover:scale-105')}>
                    <Plus size={32} />
                </button>
            </div>

            {/* RESET GARDEN BUTTON */}
            <div className="fixed bottom-8 left-8 z-[100]">
                <button
                    onClick={handleResetGarden}
                    className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-400 shadow-lg transition-all hover:bg-red-50 hover:text-red-500 border border-black/5 overflow-hidden"
                >
                    <motion.div
                        className="flex items-center justify-center"
                        whileTap={{ rotate: 180 }}
                    >
                        <Settings2 size={24} className="group-hover:hidden" />
                        <Plus size={24} className="hidden group-hover:block rotate-45" />
                    </motion.div>
                    <span className="absolute left-16 overflow-hidden whitespace-nowrap bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all">
                        Reset Garden
                    </span>
                </button>
            </div>

            <style jsx global>{`
                .react-grid-placeholder {
                    background: rgba(0,0,0,0.05) !important;
                    border: 2px dashed rgba(0,0,0,0.5) !important;
                    border-radius: 12px !important;
                    opacity: 1 !important;
                    z-index: 10 !important;
                }
                .react-resizable-handle {
                    z-index: 100;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
