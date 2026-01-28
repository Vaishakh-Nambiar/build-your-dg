'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Block, BlockData, BlockType } from './Block';
import { Onboarding } from './Onboarding';
import { Navbar } from './garden/Navbar';
import { GridEngine } from './garden/GridEngine';
import { Controls } from './garden/Controls';

// --- CONSTANTS ---
const DEFAULT_BLOCKS: BlockData[] = [
    {
        id: 'default-1',
        type: 'project',
        category: 'Projects',
        title: 'Digital Garden',
        content: 'A creative canvas for your ideas',
        x: 0, y: 0, w: 4, h: 4,
        color: '#ffffff'
    },
    {
        id: 'default-2',
        type: 'image',
        category: 'Hobbies · Photography',
        imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        imageTag: 'FilmNeverDie KIRO 400',
        title: 'Curious Cat',
        x: 4, y: 0, w: 3, h: 3,
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
        x: 7, y: 0, w: 2, h: 2,
        color: '#fbf8cc'
    }
];

export default function GardenBuilder() {
    const [isMount, setIsMount] = useState(false);
    const [blocks, setBlocks] = useState<BlockData[]>([]);
    const [gardenName, setGardenName] = useState('My Garden');
    const [isEditMode, setIsEditMode] = useState(false);
    const [isNewUser, setIsNewUser] = useState(true);
    const [showGrid, setShowGrid] = useState(false);
    const [isDebugMode, setIsDebugMode] = useState(false);
    const [sidePadding, setSidePadding] = useState(64);
    const [filter, setFilter] = useState<string | null>(null);

    // --- INITIALIZATION ---
    useEffect(() => {
        const savedBlocks = localStorage.getItem('garden-blocks');
        const savedName = localStorage.getItem('garden-name');
        const savedUser = localStorage.getItem('garden-new-user');
        const savedGrid = localStorage.getItem('garden-show-grid');
        const savedPadding = localStorage.getItem('garden-padding');

        if (savedGrid === 'true') setShowGrid(true);
        if (savedPadding) setSidePadding(parseInt(savedPadding));

        if (savedBlocks) {
            try {
                const parsed = JSON.parse(savedBlocks);
                setBlocks(Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_BLOCKS);
            } catch (e) {
                setBlocks(DEFAULT_BLOCKS);
            }
        } else {
            setBlocks(DEFAULT_BLOCKS);
        }

        if (savedName) setGardenName(savedName);
        if (savedUser === 'false') setIsNewUser(false);

        setTimeout(() => setIsMount(true), 100);
    }, []);

    // --- PERSISTENCE ---
    useEffect(() => {
        if (!isMount) return;
        localStorage.setItem('garden-blocks', JSON.stringify(blocks));
        localStorage.setItem('garden-name', gardenName);
        localStorage.setItem('garden-new-user', String(isNewUser));
        localStorage.setItem('garden-show-grid', String(showGrid));
        localStorage.setItem('garden-padding', String(sidePadding));
    }, [blocks, gardenName, isNewUser, isMount, showGrid, sidePadding]);

    // --- SMART GAP FINDING ---
    const findFirstGap = (w: number, h: number): { x: number; y: number } => {
        const occupied = new Set<string>();
        blocks.forEach(b => {
            for (let i = 0; i < b.w; i++) {
                for (let j = 0; j < b.h; j++) {
                    occupied.add(`${b.x + i},${b.y + j}`);
                }
            }
        });

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
                if (fits) return { x, y };
            }
        }
        return { x: 0, y: 0 };
    };

    // --- SMART SIZING BASED ON TYPE ---
    const addBlock = (type: BlockType) => {
        let w: number, h: number;

        switch (type) {
            case 'thought':
                w = 2; h = 2; break;
            case 'quote':
                w = 3; h = 3; break;
            case 'text':
                w = 3; h = 2; break;
            case 'image':
                w = 3; h = 3; break;
            case 'video':
                w = 4; h = 3; break;
            case 'project':
                w = 4; h = 4; break;
            case 'status':
                w = 2; h = 1; break;
            default:
                w = 2; h = 2;
        }

        const { x, y } = findFirstGap(w, h);
        const id = `block-${Date.now()}`;

        const newBlock: BlockData = {
            id, type, category: 'New', title: 'New Item',
            x, y, w, h,
            color: type === 'thought' ? '#fbf8cc' : '#ffffff'
        };

        if (type === 'image') {
            newBlock.imageUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
            newBlock.objectFit = 'cover';
        }

        if (type === 'video') {
            newBlock.videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
            newBlock.isLooping = true;
            newBlock.isMuted = true;
        }

        setBlocks([...blocks, newBlock]);

        setTimeout(() => {
            document.querySelector(`[data-id="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    const categories = useMemo(() => {
        return Array.from(new Set(blocks.map(b => b.category.split(' · ')[0])));
    }, [blocks]);

    if (!isMount) return <div className="min-h-screen bg-[#F9F9F9]" />;

    return (
        <div className="min-h-screen bg-[#F9F9F9] overflow-x-hidden selection:bg-black selection:text-white">
            <AnimatePresence>
                {isNewUser && (
                    <Onboarding
                        onComplete={(d) => {
                            setGardenName(d.name);
                            setIsNewUser(false);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* MODULAR NAVBAR */}
            <Navbar
                gardenName={gardenName}
                categories={categories}
                activeFilter={filter}
                onFilterChange={setFilter}
                isDebugMode={isDebugMode}
            />

            {/* MAIN PORTAL AREA */}
            <main className="pt-32 sm:pt-40 pb-16 sm:pb-20">
                <div
                    className="max-w-[1800px] mx-auto mb-12 sm:mb-20 px-4"
                    style={{ paddingLeft: `${Math.max(16, sidePadding)}px`, paddingRight: `${Math.max(16, sidePadding)}px` }}
                >
                    <h1 className="font-serif-display text-4xl sm:text-6xl lg:text-8xl font-black italic tracking-tighter text-black/90 ml-[-2px] sm:ml-[-4px] leading-[0.8]">
                        {gardenName}
                    </h1>
                </div>

                {/* MODULAR GRID ENGINE */}
                <GridEngine
                    isEditMode={isEditMode}
                    currentLayout={blocks.map(b => ({ i: b.id, x: b.x, y: b.y, w: b.w, h: b.h }))}
                    onLayoutChange={(newLayout) => {
                        const updated = blocks.map(b => {
                            const l = newLayout.find(li => li.i === b.id);
                            return l ? { ...b, x: l.x, y: l.y, w: l.w, h: l.h } : b;
                        });
                        if (JSON.stringify(updated) !== JSON.stringify(blocks)) {
                            setBlocks(updated);
                        }
                    }}
                    showGrid={showGrid}
                    isDebugMode={isDebugMode}
                    sidePadding={sidePadding}
                >
                    {blocks.map(block => (
                        <div key={block.id} data-id={block.id}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{
                                    type: 'spring',
                                    damping: 30,
                                    stiffness: 400,
                                    mass: 0.8
                                }}
                                className="h-full w-full"
                            >
                                <Block
                                    data={block}
                                    isEditMode={isEditMode}
                                    isDebugMode={isDebugMode}
                                    isDimmed={!!(filter && !block.category.startsWith(filter))}
                                    onDelete={(id) => setBlocks(p => p.filter(b => b.id !== id))}
                                    onUpdate={(id, d) => setBlocks(p => p.map(b => b.id === id ? { ...b, ...d } : b))}
                                />
                            </motion.div>
                        </div>
                    ))}
                </GridEngine>
            </main>

            {/* MODULAR CONTROLS */}
            <Controls
                isEditMode={isEditMode}
                setIsEditMode={setIsEditMode}
                showGrid={showGrid}
                setShowGrid={setShowGrid}
                isDebugMode={isDebugMode}
                setIsDebugMode={setIsDebugMode}
                sidePadding={sidePadding}
                setSidePadding={setSidePadding}
                onAddBlock={addBlock}
                onResetGarden={() => {
                    if (window.confirm('⚠️ Reset Layout?\n\nThis will clear all blocks and restore defaults. This action cannot be undone.')) {
                        setBlocks(DEFAULT_BLOCKS);
                        localStorage.setItem('garden-blocks', JSON.stringify(DEFAULT_BLOCKS));
                    }
                }}
            />
        </div>
    );
}
