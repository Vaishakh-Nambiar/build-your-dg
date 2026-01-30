'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Block, BlockData, BlockType } from './Block';
import { Onboarding } from './Onboarding';
import { Navbar } from './garden/Navbar';
import { GridEngine } from './garden/GridEngine';
import { Controls } from './garden/Controls';
import { SidebarEditor } from './garden/SidebarEditor';
import { TileShowcase } from './TileShowcase';
import { getTileDefaults } from './garden/tileDefaults';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

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
    const [showGardenTitle, setShowGardenTitle] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isNewUser, setIsNewUser] = useState(true);
    const [showGrid, setShowGrid] = useState(false);
    const [isDebugMode, setIsDebugMode] = useState(false);
    const [sidePadding, setSidePadding] = useState(64);
    const [filter, setFilter] = useState<string | null>(null);
    const [showTileShowcase, setShowTileShowcase] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedTile, setSelectedTile] = useState<BlockData | null>(null);

    // --- INITIALIZATION ---
    useEffect(() => {
        const savedBlocks = localStorage.getItem('garden-blocks');
        const savedName = localStorage.getItem('garden-name');
        const savedUser = localStorage.getItem('garden-new-user');
        const savedGrid = localStorage.getItem('garden-show-grid');
        const savedPadding = localStorage.getItem('garden-padding');
        const savedShowTitle = localStorage.getItem('garden-show-title');

        if (savedGrid === 'true') setShowGrid(true);
        if (savedPadding) setSidePadding(parseInt(savedPadding));
        if (savedShowTitle === 'false') setShowGardenTitle(false);

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
        localStorage.setItem('garden-show-title', String(showGardenTitle));
    }, [blocks, gardenName, isNewUser, isMount, showGrid, sidePadding, showGardenTitle]);

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
        const defaults = getTileDefaults(type);
        const { x, y } = findFirstGap(defaults.w, defaults.h);
        const id = `block-${Date.now()}`;

        const newBlock: BlockData = {
            id,
            type,
            title: 'New Item',
            x,
            y,
            color: defaults.color || '#ffffff',
            ...defaults
        };

        // Special handling for project type
        if (type === 'project') {
            newBlock.title = 'Fields Of Chess';
            newBlock.imageUrl = 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
        }

        // Special handling for image type
        if (type === 'image') {
            newBlock.objectFit = 'cover';
        }

        setBlocks([...blocks, newBlock]);

        setTimeout(() => {
            document.querySelector(`[data-id="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

    const categories = useMemo(() => {
        return Array.from(new Set(blocks.map(b => b.category.split(' · ')[0])));
    }, [blocks]);

    // Handle tile editing with sidebar
    const handleEditTile = (tileData: BlockData) => {
        setSelectedTile(tileData);
        setSidebarOpen(true);
    };

    const handleSaveTile = (updatedTile: BlockData) => {
        setBlocks(prevBlocks => 
            prevBlocks.map(block => 
                block.id === updatedTile.id ? updatedTile : block
            )
        );
    };

    const handleDeleteTile = (tileId: string) => {
        setBlocks(prevBlocks => prevBlocks.filter(block => block.id !== tileId));
    };

    const handleCloseSidebar = () => {
        setSidebarOpen(false);
        setSelectedTile(null);
    };

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
            <main className={cn(
                "pb-16 sm:pb-20",
                showGardenTitle ? "pt-32 sm:pt-40" : "pt-20 sm:pt-24"
            )}>
                {showGardenTitle && (
                    <div
                        className="max-w-[1800px] mx-auto mb-12 sm:mb-20 px-4"
                        style={{ paddingLeft: `${Math.max(16, sidePadding)}px`, paddingRight: `${Math.max(16, sidePadding)}px` }}
                    >
                        <h1 className="font-serif-display text-4xl sm:text-6xl lg:text-8xl font-black italic tracking-tighter text-black/90 ml-[-2px] sm:ml-[-4px] leading-[0.8]">
                            {gardenName}
                        </h1>
                    </div>
                )}

                {/* MODULAR GRID ENGINE */}
                <GridEngine
                    isEditMode={isEditMode}
                    currentLayout={blocks.map(b => ({ i: b.id, x: b.x, y: b.y, w: b.w, h: b.h }))}
                    onLayoutChange={(newLayout) => {
                        // Only update when user actually drags items in edit mode (resizing is disabled)
                        if (isEditMode) {
                            const updated = blocks.map(b => {
                                const l = newLayout.find(li => li.i === b.id);
                                return l ? { ...b, x: l.x, y: l.y, w: l.w, h: l.h } : b;
                            });
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
                                    onUpdate={(id, d) => {
                                        const updatedBlocks = blocks.map(b => b.id === id ? { ...b, ...d } : b);
                                        setBlocks(updatedBlocks);
                                        
                                        // If size changed, we need to trigger a layout update
                                        if (d.w !== undefined || d.h !== undefined) {
                                            // Force a layout recalculation by updating the layout
                                            setTimeout(() => {
                                                const newLayout = updatedBlocks.map(b => ({ i: b.id, x: b.x, y: b.y, w: b.w, h: b.h }));
                                                // This will trigger the GridEngine to recalculate positions
                                            }, 50);
                                        }
                                    }}
                                    onEdit={() => handleEditTile(block)}
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
                showGardenTitle={showGardenTitle}
                setShowGardenTitle={setShowGardenTitle}
                onAddBlock={addBlock}
                onResetGarden={() => {
                    if (window.confirm('⚠️ Reset Layout?\n\nThis will clear all blocks and restore defaults. This action cannot be undone.')) {
                        setBlocks(DEFAULT_BLOCKS);
                        localStorage.setItem('garden-blocks', JSON.stringify(DEFAULT_BLOCKS));
                    }
                }}
                onShowTiles={() => setShowTileShowcase(true)}
            />

            {/* TILE SHOWCASE MODAL */}
            <AnimatePresence>
                {showTileShowcase && (
                    <TileShowcase
                        isOpen={showTileShowcase}
                        onClose={() => setShowTileShowcase(false)}
                    />
                )}
            </AnimatePresence>

            {/* SIDEBAR EDITOR */}
            <SidebarEditor
                isOpen={sidebarOpen}
                onClose={handleCloseSidebar}
                currentTile={selectedTile}
                onSave={handleSaveTile}
                onDelete={handleDeleteTile}
            />
        </div>
    );
}
