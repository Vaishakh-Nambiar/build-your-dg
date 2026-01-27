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

const RGL = require('react-grid-layout');
const Responsive = RGL.Responsive;

interface Layout {
    i: string; y: number; x: number; w: number; h: number;
}

function useSize() {
    const [width, setWidth] = useState(1200);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!ref.current) return;
        const observer = new ResizeObserver(([entry]) => {
            const newWidth = entry.contentRect.width;
            console.log('🔍 [GRID DEBUG] Container ResizeObserver triggered:');
            console.log('  📏 Container Width:', newWidth, 'px');
            console.log('  🖥️ Viewport Width:', window.innerWidth, 'px');
            console.log('  📐 Column Width (with 12 cols, 12px margin):', (newWidth - (11 * 12)) / 12, 'px');
            console.log('  🎯 Max X position for column 12:', 11, '(0-indexed)');
            console.log('  ⚠️ Width difference (viewport - container):', window.innerWidth - newWidth, 'px (should be ~64-96px for padding)');
            setWidth(newWidth);
        });
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);
    return { width, ref };
}

const ROW_HEIGHT = 100;
const INITIAL_BLOCKS: BlockData[] = [
    {
        id: '1', type: 'image', category: 'Hobbies · Film',
        imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
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
    const [blocks, setBlocks] = useState<BlockData[]>(INITIAL_BLOCKS);
    const [gardenName, setGardenName] = useState('My Garden');
    const [isEditMode, setIsEditMode] = useState(false);
    const [isNewUser, setIsNewUser] = useState(true);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [showGrid, setShowGrid] = useState(false);
    const [filter, setFilter] = useState<string | null>(null);
    const { width, ref: containerRef } = useSize();

    // Extract unique categories from blocks
    const categories = useMemo(() => {
        const cats = blocks.map(b => b.category).filter(Boolean);
        return Array.from(new Set(cats));
    }, [blocks]);

    // Filter blocks based on selected category
    const filteredBlocks = useMemo(() => {
        if (!filter) return blocks;
        return blocks.filter(b => b.category === filter);
    }, [blocks, filter]);

    useEffect(() => {
        setIsMount(true);
        const saved = localStorage.getItem('garden-blocks');
        if (saved) { try { setBlocks(JSON.parse(saved)); } catch (e) { } }
        const name = localStorage.getItem('garden-name');
        if (name) setGardenName(name);
        if (localStorage.getItem('garden-new-user') === 'false') setIsNewUser(false);
    }, []);

    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset your garden? This will clear all blocks and revert to the initial seed data.")) {
            localStorage.removeItem('garden-blocks');
            localStorage.removeItem('garden-name');
            localStorage.removeItem('garden-new-user');
            setBlocks(INITIAL_BLOCKS);
            setGardenName('My Garden');
        }
    };

    useEffect(() => {
        if (!isMount) return;
        localStorage.setItem('garden-blocks', JSON.stringify(blocks));
        localStorage.setItem('garden-name', gardenName);
        localStorage.setItem('garden-new-user', String(isNewUser));
    }, [blocks, gardenName, isNewUser, isMount]);

    const addBlock = (type: BlockType) => {
        const id = Date.now().toString();
        const newBlock: BlockData = { id, type, category: 'New', title: 'New Item', x: 0, y: 0, w: 3, h: 3, color: '#ffffff' };
        setBlocks([...blocks, newBlock]);
        setShowAddMenu(false);
        setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
    };

    const onLayoutChange = (l: any) => {
        console.log('🔄 [LAYOUT CHANGE] Grid layout updated:');
        l.forEach((item: any) => {
            const block = blocks.find(b => b.id === item.i);
            console.log(`  📦 Block "${block?.title || item.i}":`, {
                x: item.x,
                y: item.y,
                w: item.w,
                h: item.h,
                rightEdge: item.x + item.w,
                reachesColumn12: (item.x + item.w) === 12 ? '✅ YES' : '❌ NO'
            });
        });
        const updated = blocks.map(b => {
            const item = l.find((li: any) => li.i === b.id);
            return item ? { ...b, x: item.x, y: item.y, w: item.w, h: item.h } : b;
        });
        setBlocks(updated);
    };

    useEffect(() => {
        if (isMount) {
            console.log('🚀 [GRID DEBUG] Garden Builder Mounted');
            console.log('  📊 Total Blocks:', blocks.length);
            console.log('  📏 Container Width:', width, 'px');
            console.log('  🎛️ Grid Config:', {
                cols: 12,
                rowHeight: ROW_HEIGHT,
                margin: [12, 12],
                containerPadding: [0, 0]
            });
        }
    }, [isMount, width]);

    if (!isMount) return null;

    return (
        <div className="min-h-screen bg-[#F9F9F9]">
            <AnimatePresence>
                {isNewUser && <Onboarding onComplete={(d) => { setGardenName(d.name); setIsNewUser(false); }} />}
            </AnimatePresence>

            <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 rounded-full bg-white/80 px-6 py-3 shadow-xl backdrop-blur-md border border-black/5 max-w-[90vw] overflow-x-auto">
                <span className="font-serif-display text-lg font-bold italic whitespace-nowrap">{gardenName}</span>
                <div className="h-6 w-px bg-black/10 mx-1" />
                <button
                    onClick={() => setFilter(null)}
                    className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all whitespace-nowrap",
                        !filter ? "bg-black text-white" : "text-gray-400 hover:text-black hover:bg-gray-100"
                    )}
                >
                    All
                </button>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all whitespace-nowrap",
                            filter === cat ? "bg-black text-white" : "text-gray-400 hover:text-black hover:bg-gray-100"
                        )}
                    >
                        {cat}
                    </button>
                ))}
                <div className="h-6 w-px bg-black/10 mx-1" />
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-black/5 transition-colors" title="GitHub">
                    <Github size={18} className="text-black/60" />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-black/5 transition-colors" title="Twitter">
                    <Twitter size={18} className="text-black/60" />
                </a>
                <a href="/cv.pdf" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-black/5 transition-colors" title="CV">
                    <FileText size={18} className="text-black/60" />
                </a>
            </nav>

            <header className="mb-12 mt-20 px-8 sm:px-12">
                <h1 className="font-serif-display text-5xl font-bold italic">{gardenName}</h1>
            </header>

            <div ref={containerRef} className="relative min-h-[600px] w-full px-8 sm:px-12 pb-32">
                {showGrid && (
                    <div className="absolute inset-0 pointer-events-none z-10">
                        <div className="absolute top-[-30px] left-0 right-0 grid grid-cols-12 gap-3">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className={cn(
                                    "text-[11px] font-bold text-center px-2 py-1 rounded",
                                    i === 11 ? "bg-yellow-100/80 text-yellow-800" : "text-black/40"
                                )}>{i + 1}</div>
                            ))}
                        </div>
                        <div className="absolute top-0 left-[-40px] bottom-0 flex flex-col">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-center text-[11px] font-bold text-black/40" style={{ height: ROW_HEIGHT + 12 }}>{i + 1}</div>
                            ))}
                        </div>
                        <div className="h-full w-full grid grid-cols-12 gap-3">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className={cn(
                                    "h-full border-x border-dashed",
                                    i === 11 ? "bg-yellow-100/50 border-yellow-400" : "bg-black/[0.02] border-black/10"
                                )} />
                            ))}
                        </div>
                    </div>
                )}

                <Responsive
                    width={width}
                    layouts={{
                        lg: filteredBlocks.map(b => ({ i: b.id, x: b.x, y: b.y, w: b.w, h: b.h })),
                        md: filteredBlocks.map(b => ({ i: b.id, x: b.x, y: b.y, w: b.w, h: b.h })),
                        sm: filteredBlocks.map(b => ({ i: b.id, x: b.x, y: b.y, w: b.w, h: b.h })),
                        xs: filteredBlocks.map(b => ({ i: b.id, x: b.x, y: b.y, w: b.w, h: b.h })),
                        xxs: filteredBlocks.map(b => ({ i: b.id, x: b.x, y: b.y, w: b.w, h: b.h }))
                    }}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
                    maxCols={12}
                    rowHeight={ROW_HEIGHT}
                    containerPadding={[0, 0]}
                    margin={[12, 12]}
                    compactType={null}
                    preventCollision={false}
                    isDraggable={isEditMode}
                    isResizable={isEditMode}
                    draggableHandle=".drag-handle"
                    onLayoutChange={onLayoutChange}
                >
                    {filteredBlocks.map(block => (
                        <div key={block.id} data-grid={{ x: block.x, y: block.y, w: block.w, h: block.h }}>
                            <Block
                                data={block}
                                isEditMode={isEditMode}
                                onDelete={(id) => setBlocks(p => p.filter(b => b.id !== id))}
                                onUpdate={(id, d) => setBlocks(p => p.map(b => b.id === id ? { ...b, ...d } : b))}
                            />
                        </div>
                    ))}
                </Responsive>
            </div>

            <div className="fixed bottom-8 right-8 flex items-center gap-4 z-[100]">
                <button onClick={() => setShowGrid(!showGrid)} className={cn("flex h-14 w-14 items-center justify-center rounded-full shadow-xl", showGrid ? 'bg-black text-white' : 'bg-white text-black')}><Grid size={24} /></button>
                <button onClick={() => setIsEditMode(!isEditMode)} className={cn("flex h-14 w-14 items-center justify-center rounded-full shadow-xl", isEditMode ? 'bg-black text-white' : 'bg-white text-black')}>{isEditMode ? <Check size={24} /> : <Settings2 size={24} />}</button>
            </div>

            <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all ${isEditMode ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
                <AnimatePresence>
                    {showAddMenu && (
                        <motion.div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl border border-black/5 min-w-[140px]">
                            {(['text', 'image', 'quote', 'thought', 'project'] as BlockType[]).map(type => (
                                <button key={type} onClick={() => addBlock(type)} className="px-4 py-2 hover:bg-gray-50 rounded-xl text-xs font-semibold uppercase">{type}</button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
                <button onClick={() => setShowAddMenu(!showAddMenu)} className="flex h-16 w-16 items-center justify-center rounded-full shadow-2xl bg-black text-white"><Plus size={32} /></button>
            </div>

            <div className="fixed bottom-8 left-8 z-[100]">
                <button onClick={handleReset} className="flex h-14 px-6 items-center justify-center rounded-full bg-white text-red-500 font-bold text-xs uppercase shadow-lg border border-red-50 hover:bg-red-50">Reset Garden</button>
            </div>

            <style jsx global>{`
                .react-grid-placeholder {
                    background: rgba(0,0,0,0.05) !important;
                    border: 2px dashed rgba(0,0,0,0.5) !important;
                    border-radius: 16px !important;
                    opacity: 1 !important;
                }
                .react-grid-item {
                    transition: all 200ms ease;
                    transition-property: left, top, width, height;
                }
                .react-grid-item.react-draggable-dragging {
                    transition: none;
                    z-index: 100;
                }
                .react-grid-item.resizing {
                    transition: none;
                    z-index: 100;
                }
            `}</style>
        </div>
    );
}
