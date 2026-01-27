'use client';

import React from 'react';
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
            "fixed top-8 left-0 right-0 z-[100] px-4 transition-all duration-500",
            isDebugMode && "border border-red-500/30"
        )}>
            <nav className={cn(
                "mx-auto flex items-center justify-between w-full max-w-7xl rounded-full bg-white/90 px-8 py-3 shadow-2xl backdrop-blur-xl border border-black/[0.03] transition-all",
                isDebugMode && "border-2 border-red-500"
            )}>
                {/* Left Section: Branding & Filters */}
                <div className="flex items-center gap-8">
                    <span className="font-serif-display text-xl font-black italic tracking-tight text-black flex items-center gap-2">
                        {gardenName}
                    </span>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onFilterChange(null)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all",
                                !activeFilter
                                    ? "bg-black text-white shadow-md scale-105"
                                    : "text-black/30 hover:text-black hover:bg-black/5"
                            )}
                        >
                            All
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => onFilterChange(cat === activeFilter ? null : cat)}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all",
                                    cat === activeFilter
                                        ? "bg-black text-white shadow-md scale-105"
                                        : "text-black/30 hover:text-black hover:bg-black/5"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Section: Socials */}
                <div className="flex items-center gap-6 pr-2">
                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-black uppercase tracking-widest text-black/30 hover:text-black transition-all hover:translate-y-[-2px]"
                    >
                        GitHub
                    </a>
                    <a
                        href="https://twitter.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-black uppercase tracking-widest text-black/30 hover:text-black transition-all hover:translate-y-[-2px]"
                    >
                        Twitter
                    </a>
                    <a
                        href="#"
                        className="text-[11px] font-black uppercase tracking-widest text-black/30 hover:text-black transition-all hover:translate-y-[-2px]"
                    >
                        CV
                    </a>
                </div>
            </nav>
        </div>
    );
};
