'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Heart, Calendar, ExternalLink, Edit3 } from 'lucide-react';
import Link from 'next/link';
import { Block, BlockData } from './Block';

// Mock data for public garden - in real implementation, this would come from Supabase
const MOCK_GARDEN_DATA = {
  'sarah_designs': {
    id: '1',
    title: 'Creative Explorations',
    username: 'sarah_designs',
    description: 'A collection of my design experiments, photography, and creative thoughts.',
    viewCount: 1247,
    likeCount: 89,
    createdAt: '2024-01-15',
    isOwner: false, // This would be determined by authentication
    blocks: [
      {
        id: 'block-1',
        type: 'project' as const,
        category: 'Design',
        title: 'Brand Identity Project',
        content: 'Complete rebrand for a sustainable fashion startup',
        x: 0, y: 0, w: 4, h: 4,
        color: '#ff6b6b',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'block-2',
        type: 'image' as const,
        category: 'Photography',
        title: 'Urban Landscapes',
        imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        imageTag: 'Canon EOS R5',
        x: 4, y: 0, w: 3, h: 3,
        objectFit: 'cover',
        isPolaroid: true,
        color: '#ffffff'
      },
      {
        id: 'block-3',
        type: 'thought' as const,
        category: 'Philosophy',
        title: 'Design Thinking',
        content: 'Good design is not just what it looks like and feels like. Good design is how it works.',
        x: 7, y: 0, w: 2, h: 2,
        color: '#fbf8cc'
      },
      {
        id: 'block-4',
        type: 'writing' as const,
        category: 'Blog',
        title: 'The Future of Design',
        content: 'Exploring how AI and human creativity can work together to create better experiences...',
        x: 0, y: 4, w: 3, h: 3,
        color: '#e8f5e8'
      },
      {
        id: 'block-5',
        type: 'image' as const,
        category: 'Photography',
        title: 'Nature Study',
        imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        x: 3, y: 4, w: 2, h: 2,
        objectFit: 'cover',
        color: '#ffffff'
      }
    ]
  }
};

interface PublicGardenViewProps {
  username: string;
}

export function PublicGardenView({ username }: PublicGardenViewProps) {
  const [gardenData, setGardenData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadGarden = async () => {
      setIsLoading(true);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const data = MOCK_GARDEN_DATA[username as keyof typeof MOCK_GARDEN_DATA];
        if (data) {
          setGardenData(data);
          // Increment view count (in real app, this would be done server-side)
          data.viewCount += 1;
        } else {
          setNotFound(true);
        }
      } catch (error) {
        console.error('Error loading garden:', error);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadGarden();
  }, [username]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading garden...</p>
        </div>
      </div>
    );
  }

  if (notFound || !gardenData) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🌱</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Garden Not Found</h1>
          <p className="text-gray-600 mb-6">
            The garden you're looking for doesn't exist or has been made private.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors duration-200"
            >
              Explore Other Gardens
            </Link>
            <Link
              href="/signup"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors duration-200"
            >
              Create Your Own
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] overflow-x-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors duration-200">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🌱</span>
                </div>
                <span className="font-medium">Digital Garden</span>
              </Link>
              <span className="text-gray-300">•</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {gardenData.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="font-medium text-gray-900">@{gardenData.username}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {gardenData.isOwner && (
                <Link
                  href="/edit"
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors duration-200"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Garden
                </Link>
              )}
              <Link
                href="/signup"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors duration-200"
              >
                Create Yours
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Garden Title and Stats */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-8"
          >
            <h1 className="font-serif-display text-4xl sm:text-6xl lg:text-8xl font-black italic tracking-tighter text-black/90 leading-[0.8] mb-4">
              {gardenData.title}
            </h1>
            
            {gardenData.description && (
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
                {gardenData.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{gardenData.viewCount.toLocaleString()} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{gardenData.likeCount} likes</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Created {formatDate(gardenData.createdAt)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Garden Blocks */}
      <main className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-4 auto-rows-[100px]">
            {gardenData.blocks.map((block: BlockData, index: number) => (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                className={`col-span-${block.w} row-span-${block.h}`}
                style={{
                  gridColumn: `span ${block.w}`,
                  gridRow: `span ${block.h}`
                }}
              >
                <Block
                  data={block}
                  isEditMode={false}
                  isDebugMode={false}
                  isDimmed={false}
                  onDelete={() => {}}
                  onUpdate={() => {}}
                  onEdit={() => {}}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-gray-400">Built with</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-xs">🌱</span>
              </div>
              <span className="font-medium">Digital Garden</span>
            </div>
          </div>
          
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors duration-200"
          >
            Create Your Garden
            <ExternalLink className="w-4 h-4" />
          </Link>
          
          <div className="mt-6 text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-white transition-colors duration-200">
              Privacy
            </Link>
            <span className="mx-3">•</span>
            <Link href="/terms" className="hover:text-white transition-colors duration-200">
              Terms
            </Link>
            <span className="mx-3">•</span>
            <Link href="/help" className="hover:text-white transition-colors duration-200">
              Help
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}