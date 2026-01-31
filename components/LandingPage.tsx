'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Grid3X3, Share2, Eye, Heart, Users } from 'lucide-react';
import Link from 'next/link';
import { PublicGardenGallery } from '@/components/PublicGardenGallery';

export function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#F9F9F9] overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <h1 className="font-serif-display text-5xl sm:text-7xl lg:text-9xl font-black italic tracking-tighter text-black/90 leading-[0.8] mb-6">
              Build Your
              <br />
              <span className="relative">
                Digital Garden
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isLoaded ? 1 : 0 }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                  className="absolute bottom-2 left-0 right-0 h-2 bg-yellow-200 -z-10 origin-left"
                />
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Create a beautiful, personalized space for your ideas, projects, and memories. 
            Share your digital garden with the world or keep it private—it's entirely up to you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href="/signup"
              className="group bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-all duration-300 flex items-center gap-2 hover:gap-3"
            >
              Start Building
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link
              href="#gallery"
              className="text-gray-600 hover:text-black px-8 py-4 text-lg font-medium transition-colors duration-300 flex items-center gap-2"
            >
              <Eye className="w-5 h-5" />
              Explore Gardens
            </Link>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.8 }}
          transition={{ duration: 1, delay: 1, ease: "easeOut" }}
          className="absolute top-20 left-10 hidden lg:block"
        >
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
            <Sparkles className="w-8 h-8 text-yellow-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.8 }}
          transition={{ duration: 1, delay: 1.2, ease: "easeOut" }}
          className="absolute top-32 right-16 hidden lg:block"
        >
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
            <Grid3X3 className="w-8 h-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.8 }}
          transition={{ duration: 1, delay: 1.4, ease: "easeOut" }}
          className="absolute bottom-32 left-20 hidden lg:block"
        >
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
            <Share2 className="w-8 h-8 text-green-500" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif-display text-4xl sm:text-6xl font-black italic tracking-tighter text-black/90 mb-6">
              Why Digital Gardens?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Unlike traditional blogs or portfolios, digital gardens grow organically. 
              They're living spaces that evolve with your thoughts and creativity.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
              className="text-center p-8 rounded-3xl bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-100"
            >
              <div className="bg-yellow-200 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-yellow-700" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Creative Freedom</h3>
              <p className="text-gray-600 leading-relaxed">
                Arrange your content exactly how you want. No templates, no restrictions—just pure creative expression.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              viewport={{ once: true }}
              className="text-center p-8 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100"
            >
              <div className="bg-blue-200 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Grid3X3 className="w-8 h-8 text-blue-700" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Flexible Layout</h3>
              <p className="text-gray-600 leading-relaxed">
                Drag, drop, and resize tiles to create the perfect layout. Your garden adapts to your vision.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              viewport={{ once: true }}
              className="text-center p-8 rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100"
            >
              <div className="bg-green-200 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Share2 className="w-8 h-8 text-green-700" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Share & Discover</h3>
              <p className="text-gray-600 leading-relaxed">
                Make your garden public to inspire others, or keep it private for personal reflection.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Public Garden Gallery */}
      <section id="gallery" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif-display text-4xl sm:text-6xl font-black italic tracking-tighter text-black/90 mb-6">
              Discover Gardens
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore beautiful digital gardens created by our community. 
              Get inspired and see what's possible with your own garden.
            </p>
          </motion.div>

          <PublicGardenGallery />
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif-display text-4xl sm:text-6xl font-black italic tracking-tighter mb-6">
              Ready to Grow?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Join thousands of creators who are building their digital gardens. 
              Start your journey today—it's completely free.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/signup"
                className="group bg-white text-black px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-100 transition-all duration-300 flex items-center gap-2 hover:gap-3"
              >
                Create Your Garden
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
              
              <div className="flex items-center gap-6 text-gray-400">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>10,000+ creators</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  <span>Free forever</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}