'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Block, BlockData, BlockType } from './Block';
import { Onboarding } from './Onboarding';
import { SplitTopBar } from './garden/SplitTopBar';
import { GridEngine } from './garden/GridEngine';
import { Controls } from './garden/Controls';
import { SidebarEditor } from './garden/SidebarEditor';
import { TileShowcase } from './TileShowcase';
import { getTileDefaults } from './garden/tileDefaults';
import { useGarden } from '@/hooks/useGarden';
import { useAuth } from '@/hooks/useAuth';
import { DebugPanel } from './DebugPanel';

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
    const { user } = useAuth();
    const { 
        garden, 
        loading: gardenLoading, 
        saveStatus, 
        createGarden, 
        autoSave, 
        manualSave, 
        togglePublic, 
        getPublicUrl,
        checkForLocalBackup,
        restoreFromLocalBackup,
        loadUserGarden
    } = useGarden();
    
    const [isMount, setIsMount] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [initializationProgress, setInitializationProgress] = useState(0);
    const [initializationStep, setInitializationStep] = useState('Connecting...');
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
        let mounted = true;
        
        const initializeApp = async () => {
            if (!mounted) return;
            
            try {
                setInitializationStep('Checking authentication...');
                setInitializationProgress(10);
                
                if (!user) {
                    console.log('[GardenBuilder] No user found');
                    setInitializationStep('Please sign in');
                    setIsInitializing(false);
                    return;
                }
                
                console.log('[GardenBuilder] User authenticated:', user.email);
                setInitializationStep('Loading your garden...');
                setInitializationProgress(30);
                
                // Clear localStorage when user changes to prevent cross-user contamination
                const currentUserId = user.id;
                const lastUserId = localStorage.getItem('last-user-id');
                
                if (currentUserId !== lastUserId) {
                    localStorage.removeItem('garden-blocks');
                    localStorage.removeItem('garden-name');
                    localStorage.removeItem('garden-new-user');
                    localStorage.removeItem('garden-backup');
                    localStorage.setItem('last-user-id', currentUserId);
                }

                // Load UI preferences
                const savedGrid = localStorage.getItem('garden-show-grid');
                const savedPadding = localStorage.getItem('garden-padding');
                const savedShowTitle = localStorage.getItem('garden-show-title');

                if (savedGrid === 'true') setShowGrid(true);
                if (savedPadding) setSidePadding(parseInt(savedPadding));
                if (savedShowTitle === 'false') setShowGardenTitle(false);

                setInitializationStep('Setting up your space...');
                setInitializationProgress(50);

                // Don't wait indefinitely for garden loading - set a timeout
                let attempts = 0;
                const maxAttempts = 10;
                
                while (gardenLoading && attempts < maxAttempts && mounted) {
                    console.log('[GardenBuilder] Waiting for garden to load, attempt:', attempts + 1);
                    setInitializationStep(`Loading garden data... (${attempts + 1}/${maxAttempts})`);
                    setInitializationProgress(60 + (attempts * 2));
                    await new Promise(resolve => setTimeout(resolve, 500));
                    attempts++;
                }

                if (attempts >= maxAttempts) {
                    console.log('[GardenBuilder] Garden loading timeout, proceeding anyway');
                }

                setInitializationProgress(80);
                console.log('[GardenBuilder] Garden loading complete:', { garden: !!garden });

                if (garden) {
                    // User has garden data in database - use it
                    console.log('[GardenBuilder] Using existing garden:', garden.title);
                    setInitializationStep('Restoring your garden...');
                    setBlocks(garden.tiles || DEFAULT_BLOCKS);
                    setGardenName(garden.title || 'My Garden');
                    setIsNewUser(false); // User has data, not new
                    
                    // Check for local backup
                    const backup = checkForLocalBackup();
                    if (backup && backup.gardenId === garden.id) {
                        const shouldRestore = window.confirm(
                            'We found unsaved changes from a previous session. Would you like to restore them?'
                        );
                        if (shouldRestore) {
                            restoreFromLocalBackup();
                            setBlocks(backup.tiles || garden.tiles || DEFAULT_BLOCKS);
                            setGardenName(backup.title || garden.title || 'My Garden');
                        }
                    }
                } else {
                    // User is authenticated but no garden data - check if we need to create one
                    console.log('[GardenBuilder] No garden found, creating new one');
                    setInitializationStep('Creating your garden...');
                    
                    const savedBlocks = localStorage.getItem('garden-blocks');
                    const savedName = localStorage.getItem('garden-name');
                    const savedUser = localStorage.getItem('garden-new-user');
                    
                    let initialBlocks = DEFAULT_BLOCKS;
                    let initialName = 'My Garden';
                    let shouldShowOnboarding = true;
                    
                    if (savedBlocks) {
                        try {
                            const parsed = JSON.parse(savedBlocks);
                            initialBlocks = Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_BLOCKS;
                        } catch (e) {
                            initialBlocks = DEFAULT_BLOCKS;
                        }
                    }
                    
                    if (savedName) initialName = savedName;
                    if (savedUser === 'false') shouldShowOnboarding = false;
                    
                    setBlocks(initialBlocks);
                    setGardenName(initialName);
                    setIsNewUser(shouldShowOnboarding);
                    
                    // Create garden in database if user doesn't have one
                    if (!garden) {
                        try {
                            await createGarden({
                                title: initialName,
                                tiles: initialBlocks,
                                layout: { showGrid, sidePadding, showGardenTitle }
                            });
                        } catch (error) {
                            console.error('Failed to create garden:', error);
                            // Continue with local state even if creation fails
                        }
                    }
                }

                setInitializationStep('Almost ready...');
                setInitializationProgress(95);
                
                // Small delay to show completion
                setTimeout(() => {
                    if (mounted) {
                        setInitializationProgress(100);
                        setIsInitializing(false);
                        setIsMount(true);
                    }
                }, 300);
                
            } catch (error) {
                console.error('Initialization error:', error);
                if (mounted) {
                    setInitializationStep('Error loading garden');
                    setIsInitializing(false);
                    setIsMount(true);
                }
            }
        };

        // Add a small delay to prevent immediate execution
        const timer = setTimeout(initializeApp, 100);
        
        return () => {
            mounted = false;
            clearTimeout(timer);
        };
    }, [user, garden, gardenLoading, checkForLocalBackup, restoreFromLocalBackup, createGarden, loadUserGarden]);

    // --- PERSISTENCE ---
    useEffect(() => {
        if (!isMount || !user) return;
        
        // Save to localStorage as backup
        localStorage.setItem('garden-blocks', JSON.stringify(blocks));
        localStorage.setItem('garden-name', gardenName);
        localStorage.setItem('garden-new-user', String(isNewUser));
        localStorage.setItem('garden-show-grid', String(showGrid));
        localStorage.setItem('garden-padding', String(sidePadding));
        localStorage.setItem('garden-show-title', String(showGardenTitle));
        
        // Auto-save to database if user is authenticated and garden exists
        if (garden) {
            console.log('Auto-saving garden data...', { 
                blocksCount: blocks.length, 
                gardenId: garden.id,
                gardenName 
            });
            autoSave(blocks, { showGrid, sidePadding, showGardenTitle }, gardenName);
        } else if (user && blocks.length > 0) {
            // If no garden exists but we have blocks, create one
            console.log('Creating garden for user...', { blocksCount: blocks.length });
            createGarden({
                title: gardenName,
                tiles: blocks,
                layout: { showGrid, sidePadding, showGardenTitle }
            });
        }
    }, [blocks, gardenName, isNewUser, isMount, showGrid, sidePadding, showGardenTitle, user, garden, autoSave, createGarden]);

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

    // TopBar handlers
    const handleGardenNameChange = (newName: string) => {
        setGardenName(newName);
    };

    const handleManualSave = async () => {
        if (!user || !garden) {
            // If no garden exists, create one
            if (user && !garden) {
                await createGarden({
                    title: gardenName,
                    tiles: blocks,
                    layout: { showGrid, sidePadding, showGardenTitle },
                    isPublic: false
                });
            }
            return;
        }
        
        await manualSave();
    };

    const handleTogglePublic = async () => {
        if (!garden) return;
        await togglePublic();
    };

    // Show loading screen while initializing or loading garden data
    if (!isMount || gardenLoading || isInitializing) {
        return (
            <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
                <div className="text-center max-w-md px-6">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-6 mx-auto">
                        <span className="text-white text-lg animate-pulse">🌱</span>
                    </div>
                    
                    <div className="font-serif-display text-2xl sm:text-3xl italic mb-6 text-black/90">
                        {initializationStep}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-black/10 rounded-full h-2 mb-3">
                        <div 
                            className="bg-black h-2 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${initializationProgress}%` }}
                        />
                    </div>
                    
                    {/* Progress Percentage */}
                    <div className="text-sm text-black/60 mb-6">
                        {initializationProgress}%
                    </div>
                    
                    {/* Save Status */}
                    {saveStatus.status === 'saving' && (
                        <div className="text-sm text-black/60">
                            Saving your changes...
                        </div>
                    )}
                    
                    {saveStatus.status === 'error' && (
                        <div className="text-sm text-red-600">
                            {saveStatus.error || 'Failed to save'}
                        </div>
                    )}
                    
                    {saveStatus.status === 'saved' && saveStatus.lastSaved && (
                        <div className="text-sm text-green-600">
                            Saved {new Date(saveStatus.lastSaved).toLocaleTimeString()}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F9F9F9] overflow-x-hidden selection:bg-black selection:text-white">
            <AnimatePresence>
                {isNewUser && (
                    <Onboarding
                        onComplete={async (d) => {
                            console.log('Onboarding completed:', d);
                            setGardenName(d.name);
                            setIsNewUser(false);
                            
                            // Ensure garden is created with the new name
                            if (user && !garden) {
                                try {
                                    await createGarden({
                                        title: d.name,
                                        tiles: blocks,
                                        layout: { showGrid, sidePadding, showGardenTitle }
                                    });
                                    console.log('Garden created successfully after onboarding');
                                } catch (error) {
                                    console.error('Failed to create garden after onboarding:', error);
                                }
                            } else if (garden) {
                                // Update existing garden with new name
                                autoSave(blocks, { showGrid, sidePadding, showGardenTitle }, d.name);
                            }
                            
                            // Save to localStorage
                            localStorage.setItem('garden-name', d.name);
                            localStorage.setItem('garden-new-user', 'false');
                        }}
                    />
                )}
            </AnimatePresence>

            {/* SMART EDITOR TOP BAR */}
            <SplitTopBar
                gardenName={gardenName}
                onGardenNameChange={handleGardenNameChange}
                saveStatus={saveStatus}
                onManualSave={handleManualSave}
                isPublic={garden?.is_public || false}
                onTogglePublic={handleTogglePublic}
                publicUrl={getPublicUrl() || undefined}
                categories={categories}
                activeFilter={filter}
                onFilterChange={setFilter}
                isOwner={true} // Always true in GardenBuilder since it's the owner's view
                gardenOwner={user ? {
                    displayName: user.displayName,
                    email: user.email,
                    avatarUrl: user.avatarUrl
                } : undefined}
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
            
            {/* Debug Panel - only show in development */}
            {process.env.NODE_ENV === 'development' && <DebugPanel />}
        </div>
    );
}
