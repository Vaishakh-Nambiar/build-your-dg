'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface NavbarProps {
    gardenName: string;
    categories: string[];
    activeFilter: string | null;
    onFilterChange: (filter: string | null) => void;
    isDebugMode?: boolean;
}

export const Navbar = ({
    gardenName,
    categories,
    activeFilter,
    onFilterChange,
    isDebugMode = false
}: NavbarProps) => {
    return (
        <div className={cn(
            "fixed top-4 sm:top-8 left-0 right-0 z-[100] px-2 sm:px-4 transition-all duration-500",
            isDebugMode && "border border-red-500/30"
        )}>
            <nav className={cn(
                "mx-auto flex items-center justify-between w-full max-w-7xl rounded-full bg-white/90 px-3 sm:px-8 py-2 sm:py-3 shadow-2xl backdrop-blur-xl border border-black/[0.03] transition-all",
                isDebugMode && "border-2 border-red-500"
            )}>
                {/* Left Section: Branding & Filters */}
                <div className="flex items-center gap-2 sm:gap-8 min-w-0 flex-1">
                    <span className="font-serif-display text-lg sm:text-xl font-black italic tracking-tight text-black flex items-center gap-2 truncate">
                        {gardenName}
                    </span>

                    <div className="hidden sm:flex items-center gap-2">
                        <motion.button
                            onClick={() => onFilterChange(null)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all",
                                !activeFilter
                                    ? "bg-black text-white shadow-md shadow-black/20"
                                    : "text-black/30 hover:text-black hover:bg-black/5"
                            )}
                        >
                            All
                        </motion.button>
                        {categories.slice(0, 4).map((cat, idx) => (
                            <motion.button
                                key={cat}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onFilterChange(cat === activeFilter ? null : cat)}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all",
                                    cat === activeFilter
                                        ? "bg-black text-white shadow-md shadow-black/20"
                                        : "text-black/30 hover:text-black hover:bg-black/5"
                                )}
                            >
                                {cat}
                            </motion.button>
                        ))}
                        {categories.length > 4 && (
                            <span className="text-[10px] text-black/20">+{categories.length - 4}</span>
                        )}
                    </div>

                    {/* Mobile Filter Indicator */}
                    <div className="sm:hidden flex items-center">
                        {activeFilter && (
                            <motion.button
                                onClick={() => onFilterChange(null)}
                                className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-black text-white"
                            >
                                {activeFilter} ×
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Right Section: Socials - Hidden on mobile */}
                <div className="hidden md:flex items-center gap-4 lg:gap-6 pr-2">
                    <motion.a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ y: -2, color: '#000' }}
                        className="text-[11px] font-black uppercase tracking-widest text-black/30 transition-colors"
                    >
                        GitHub
                    </motion.a>
                    <motion.a
                        href="https://twitter.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ y: -2, color: '#000' }}
                        className="text-[11px] font-black uppercase tracking-widest text-black/30 transition-colors"
                    >
                        Twitter
                    </motion.a>
                    <motion.a
                        href="#"
                        whileHover={{ y: -2, color: '#000' }}
                        className="text-[11px] font-black uppercase tracking-widest text-black/30 transition-colors"
                    >
                        CV
                    </motion.a>
                </div>
            </nav>
        </div>
    );
};
