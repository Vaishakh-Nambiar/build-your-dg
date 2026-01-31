'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Heart, Calendar, User, ExternalLink, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Mock data for public gardens - in real implementation, this would come from Supabase
const MOCK_PUBLIC_GARDENS = [
  {
    id: '1',
    title: 'Creative Explorations',
    username: 'sarah_designs',
    description: 'A collection of my design experiments, photography, and creative thoughts.',
    previewImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    viewCount: 1247,
    likeCount: 89,
    createdAt: '2024-01-15',
    tiles: [
      { type: 'image', imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
      { type: 'project', title: 'Brand Identity', color: '#ff6b6b' },
      { type: 'thought', title: 'Design Philosophy', content: 'Less is more, but more is fun too.' },
      { type: 'writing', title: 'Creative Process', content: 'How I approach new projects...' }
    ]
  },
  {
    id: '2',
    title: 'Tech & Coffee',
    username: 'dev_mike',
    description: 'My journey through code, coffee reviews, and side projects.',
    previewImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    viewCount: 892,
    likeCount: 67,
    createdAt: '2024-01-20',
    tiles: [
      { type: 'project', title: 'React Dashboard', color: '#4ecdc4' },
      { type: 'image', imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
      { type: 'thought', title: 'Code Quality', content: 'Clean code is not written by following a set of rules.' },
      { type: 'writing', title: 'Coffee Reviews', content: 'Today I tried a new Ethiopian blend...' }
    ]
  },
  {
    id: '3',
    title: 'Nature & Mindfulness',
    username: 'zen_walker',
    description: 'Capturing moments of peace in nature and sharing mindful reflections.',
    previewImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    viewCount: 2156,
    likeCount: 143,
    createdAt: '2024-01-10',
    tiles: [
      { type: 'image', imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
      { type: 'thought', title: 'Morning Meditation', content: 'The forest teaches us to be present.' },
      { type: 'writing', title: 'Trail Journal', content: 'Today\'s hike brought new insights...' },
      { type: 'image', imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' }
    ]
  },
  {
    id: '4',
    title: 'Urban Photography',
    username: 'city_lens',
    description: 'Street photography and urban exploration through my lens.',
    previewImage: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    viewCount: 756,
    likeCount: 52,
    createdAt: '2024-01-25',
    tiles: [
      { type: 'image', imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
      { type: 'project', title: 'Photo Series', color: '#feca57' },
      { type: 'thought', title: 'Street Stories', content: 'Every corner has a story to tell.' },
      { type: 'image', imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' }
    ]
  },
  {
    id: '5',
    title: 'Culinary Adventures',
    username: 'chef_anna',
    description: 'Recipes, food photography, and culinary experiments from my kitchen.',
    previewImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    viewCount: 1834,
    likeCount: 127,
    createdAt: '2024-01-12',
    tiles: [
      { type: 'image', imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
      { type: 'writing', title: 'Recipe: Pasta Primavera', content: 'A fresh take on a classic dish...' },
      { type: 'project', title: 'Cookbook Project', color: '#ff9ff3' },
      { type: 'thought', title: 'Food Philosophy', content: 'Cooking is love made visible.' }
    ]
  },
  {
    id: '6',
    title: 'Music & Memories',
    username: 'melody_maker',
    description: 'Original compositions, music theory explorations, and concert memories.',
    previewImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    viewCount: 643,
    likeCount: 78,
    createdAt: '2024-01-18',
    tiles: [
      { type: 'project', title: 'New Album', color: '#54a0ff' },
      { type: 'image', imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
      { type: 'writing', title: 'Song Stories', content: 'The inspiration behind my latest track...' },
      { type: 'thought', title: 'Music Theory', content: 'Exploring the mathematics of melody.' }
    ]
  }
];

interface PublicGarden {
  id: string;
  title: string;
  username: string;
  description: string;
  previewImage: string;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  tiles: Array<{
    type: string;
    title?: string;
    content?: string;
    imageUrl?: string;
    color?: string;
  }>;
}

export function PublicGardenGallery() {
  const [gardens, setGardens] = useState<PublicGarden[]>([]);
  const [selectedGarden, setSelectedGarden] = useState<PublicGarden | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const gardensPerPage = 3;
  const totalPages = Math.ceil(MOCK_PUBLIC_GARDENS.length / gardensPerPage);

  useEffect(() => {
    // Simulate loading from API
    const loadGardens = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      setGardens(MOCK_PUBLIC_GARDENS);
      setIsLoading(false);
    };

    loadGardens();
  }, []);

  const getCurrentPageGardens = () => {
    const startIndex = currentPage * gardensPerPage;
    return gardens.slice(startIndex, startIndex + gardensPerPage);
  };

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100">
            <div className="h-48 bg-gray-200 shimmer" />
            <div className="p-6">
              <div className="h-6 bg-gray-200 rounded mb-3 shimmer" />
              <div className="h-4 bg-gray-200 rounded mb-2 shimmer" />
              <div className="h-4 bg-gray-200 rounded w-3/4 shimmer" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Page {currentPage + 1} of {totalPages}</span>
            <span>•</span>
            <span>{gardens.length} gardens</span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={prevPage}
              disabled={currentPage === 0}
              className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
              className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Garden Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="grid md:grid-cols-3 gap-8"
          >
            {getCurrentPageGardens().map((garden, index) => (
              <motion.div
                key={garden.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                className="group bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedGarden(garden)}
              >
                {/* Preview Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={garden.previewImage}
                    alt={garden.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                    {garden.tiles.length} tiles
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">@{garden.username}</span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                    {garden.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                    {garden.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{garden.viewCount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span>{garden.likeCount}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(garden.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* View All Gardens CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black font-medium transition-colors duration-200"
          >
            View All Gardens
            <ExternalLink className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>

      {/* Garden Preview Modal */}
      <AnimatePresence>
        {selectedGarden && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedGarden(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {selectedGarden.title}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm">@{selectedGarden.username}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedGarden(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {selectedGarden.description}
                </p>

                {/* Tile Preview Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {selectedGarden.tiles.slice(0, 4).map((tile, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-2xl overflow-hidden border border-gray-100"
                      style={{ backgroundColor: tile.color || '#f9f9f9' }}
                    >
                      {tile.type === 'image' && tile.imageUrl ? (
                        <img
                          src={tile.imageUrl}
                          alt={tile.title || 'Tile image'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="p-4 h-full flex flex-col justify-center">
                          <h4 className="font-semibold text-sm mb-2 text-gray-900">
                            {tile.title}
                          </h4>
                          {tile.content && (
                            <p className="text-xs text-gray-600 line-clamp-3">
                              {tile.content}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{selectedGarden.viewCount.toLocaleString()} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{selectedGarden.likeCount} likes</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatDate(selectedGarden.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link
                    href={`/${selectedGarden.username}`}
                    className="flex-1 bg-black text-white text-center py-3 px-4 rounded-full font-medium hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Visit Garden
                  </Link>
                  <Link
                    href="/signup"
                    className="flex-1 border border-gray-300 text-gray-700 text-center py-3 px-4 rounded-full font-medium hover:bg-gray-50 transition-colors duration-200"
                  >
                    Create Your Own
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}