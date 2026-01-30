'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Eye } from 'lucide-react';
import { Block, BlockData, BlockType } from './Block';

interface TileShowcaseProps {
    isOpen: boolean;
    onClose: () => void;
}

// Sample data for each tile type
const SAMPLE_TILES: BlockData[] = [
    {
        id: 'sample-text',
        type: 'text',
        category: 'Sample',
        title: 'Text Tile Example',
        content: 'This is how text tiles look with longer content that wraps nicely and shows the typography and spacing.',
        meta: 'Meta information',
        x: 0, y: 0, w: 3, h: 2,
        color: '#ffffff'
    },
    {
        id: 'sample-thought',
        type: 'thought',
        category: 'Ideas',
        title: 'Quick Thought',
        content: 'Sticky note style!',
        x: 0, y: 0, w: 2, h: 2,
        color: '#fbf8cc'
    },
    {
        id: 'sample-quote',
        type: 'quote',
        category: 'Wisdom',
        content: 'Design is not just what it looks like and feels like. Design is how it works.',
        author: 'Steve Jobs',
        x: 0, y: 0, w: 3, h: 3,
        color: '#ffffff'
    },
    {
        id: 'sample-image',
        type: 'image',
        category: 'Photography',
        title: 'Sample Photo',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        imageTag: 'Unsplash',
        isPolaroid: true,
        x: 0, y: 0, w: 3, h: 3,
        color: '#ffffff'
    },
    {
        id: 'sample-video',
        type: 'video',
        category: 'Media',
        title: 'Video Example',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        isLooping: true,
        isMuted: true,
        x: 0, y: 0, w: 4, h: 3,
        color: '#ffffff'
    },
    {
        id: 'sample-project',
        type: 'project',
        category: 'Projects',
        title: 'Fields Of Chess',
        imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        showcaseBackground: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        showcaseBorderColor: '#cc2727',
        link: 'https://example.com',
        x: 0, y: 0, w: 6, h: 4,
        color: '#ffffff'
    },
    {
        id: 'sample-status',
        type: 'status',
        category: 'Updates',
        title: 'Currently Working',
        content: 'Building amazing digital gardens',
        status: 'ACTIVE',
        x: 0, y: 0, w: 2, h: 1,
        color: '#ffffff'
    }
];

export const TileShowcase: React.FC<TileShowcaseProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/95 p-6 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                            <Eye className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="font-serif-display text-2xl font-bold">Tile Showcase</h2>
                            <p className="text-sm text-gray-500">Preview all tile types and their styling</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="rounded-full bg-gray-100 p-2 hover:bg-gray-200 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {SAMPLE_TILES.map((tile) => (
                            <div key={tile.id} className="space-y-4">
                                {/* Tile Info */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-lg capitalize">{tile.type} Tile</h3>
                                        <p className="text-sm text-gray-500">
                                            Size: {tile.w}×{tile.h} • {tile.category}
                                        </p>
                                    </div>
                                    <div className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                                        {tile.type}
                                    </div>
                                </div>

                                {/* Tile Preview */}
                                <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                                    {/* Scale container to fit preview */}
                                    <div 
                                        className="relative bg-[#F9F9F9]"
                                        style={{ 
                                            width: '100%',
                                            height: `${(tile.h / tile.w) * 300}px`,
                                            minHeight: '200px',
                                            maxHeight: '400px'
                                        }}
                                    >
                                        <Block
                                            data={tile}
                                            isEditMode={false}
                                            isDebugMode={false}
                                            isDimmed={false}
                                            onDelete={() => {}}
                                            onUpdate={() => {}}
                                            className="absolute inset-2"
                                        />
                                    </div>
                                </div>

                                {/* Tile Properties */}
                                <div className="text-xs space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Default Size:</span>
                                        <span className="font-mono">{tile.w}×{tile.h}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Background:</span>
                                        <span className="font-mono">{tile.color}</span>
                                    </div>
                                    {tile.type === 'project' && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Border:</span>
                                            <span className="font-mono">{tile.showcaseBorderColor}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Usage Guide */}
                    <div className="mt-12 p-6 bg-blue-50 rounded-xl border border-blue-200">
                        <h3 className="font-semibold text-blue-900 mb-3">🎨 Styling Guide</h3>
                        <div className="text-sm text-blue-800 space-y-2">
                            <p>• Each tile is a separate component in <code className="bg-blue-100 px-1 rounded">components/tiles/</code></p>
                            <p>• Edit individual tile components to customize styling</p>
                            <p>• All tiles respect the grid system and responsive breakpoints</p>
                            <p>• Use this showcase to test your styling changes in real-time</p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};