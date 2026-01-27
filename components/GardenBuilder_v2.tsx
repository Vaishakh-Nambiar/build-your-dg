'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Block, BlockData } from './Block';
import { Onboarding } from './Onboarding';
import { Navbar } from './garden/Navbar';
import { GridEngine, BlockType } from './garden/GridEngine';
import { Controls } from './garden/Controls';

// --- CONSTANTS ---
const DEFAULT_BLOCKS: BlockData[] = [
    {
        id: 'default-1',
        type: 'project',
        category: 'Projects',
        title: 'Anti-Gravity Canvas',
        content: 'A high-performance 12-column grid system.',
        x: 0, y: 0, w: 4, h: 4,
        color: '#ffffff'
    },
    {
        id: 'default-2',
        type: 'image',
        category: 'Photography',
        imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        imageTag: 'Fuji 400H',
        title: 'Abstract Harmony',
        x: 4, y: 0, w: 4, h: 4,
        objectFit: 'cover',
        isPolaroid: true,
        color: '#ffffff'
    },
    {
        id: 'default-3',
        type: 'thought',
        category: 'Philosophies',
        title: 'Digital Minimalism',
        content: 'Design should disappear, leaving only the content.',
        x: 8, y: 0, w: 4, h: 4,
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
    const [sidePadding, setSidePadding] = useState(64); // Default 64px
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

    // --- HANDLERS ---
    // --- HELPERS ---
    const findFirstGap = (w: number, h: number) => {
        let y = 0;
        let x = 0;
        while (true) {
            const hasCollision = blocks.some(b =>
                x < b.x + b.w &&
                x + w > b.x &&
                y < b.y + b.h &&
                y + h > b.y
            );
            if (!hasCollision && x + w <= 12) return { x, y };
            x++;
            if (x + w > 12) {
                x = 0;
                y++;
            }
            if (y > 100) return { x: 0, y: 0 }; // Safety
        }
    };

    const addBlock = (type: BlockType) => {
        const id = `block-${Date.now()}`;
        const { x, y } = findFirstGap(2, 2);
        const newBlock: BlockData = {
            id, type, category: 'New', title: 'New Item',
            x, y, w: 2, h: 2,
            color: type === 'thought' ? '#fbf8cc' : '#ffffff'
        };

        if (type === 'image') {
            newBlock.imageUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
            newBlock.objectFit = 'cover';
        }

        setBlocks([...blocks, newBlock]);

        // Auto-scroll logic
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
            <main className="pt-40 pb-20">
                <div
                    className="max-w-[1800px] mx-auto mb-20 px-4"
                    style={{ paddingLeft: `${sidePadding}px`, paddingRight: `${sidePadding}px` }}
                >
                    <h1 className="font-serif-display text-8xl font-black italic tracking-tighter text-black/90 ml-[-4px] leading-[0.8]">
                        {gardenName}
                    </h1>
                </div>

                {/* MODULAR GRID ENGINE */}
                <GridEngine
                    isEditMode={isEditMode}
                    currentLayout={blocks.map(b => ({ i: b.id, x: b.x, y: b.y, w: b.w, h: b.h }))}
                    onLayoutChange={(newLayout) => {
                        // Keep state in sync if RGL changes things internally
                        const updated = blocks.map(b => {
                            const l = newLayout.find(li => li.i === b.id);
                            return l ? { ...b, x: l.x, y: l.y, w: l.w, h: l.h } : b;
                        });
                        // Only update if actually different to prevent flicker
                        if (JSON.stringify(updated) !== JSON.stringify(blocks)) {
                            setBlocks(updated);
                        }
                    }}
                    showGrid={showGrid}
                    isDebugMode={isDebugMode}
                    sidePadding={sidePadding}
                >
                    {blocks.map(block => (
                        <Block
                            key={block.id}
                            data-id={block.id}
                            data={block}
                            isEditMode={isEditMode}
                            isDebugMode={isDebugMode}
                            isDimmed={!!(filter && !block.category.startsWith(filter))}
                            onDelete={(id) => setBlocks(p => p.filter(b => b.id !== id))}
                            onUpdate={(id, d) => setBlocks(p => p.map(b => b.id === id ? { ...b, ...d } : b))}
                        />
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
                    if (window.confirm('Reset Layout?')) {
                        setBlocks(DEFAULT_BLOCKS);
                        localStorage.setItem('garden-blocks', JSON.stringify(DEFAULT_BLOCKS));
                    }
                }}
            />
        </div>
    );
}
