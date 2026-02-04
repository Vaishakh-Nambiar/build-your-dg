'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '@/hooks/useAuth';
import { 
  Save, 
  Check, 
  AlertTriangle, 
  Loader2, 
  Eye, 
  EyeOff, 
  User, 
  BarChart3, 
  Settings, 
  Palette, 
  HelpCircle, 
  LogOut,
  ExternalLink,
  Edit3
} from 'lucide-react';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface SaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
  hasUnsavedChanges?: boolean;
}

interface SplitTopBarProps {
  gardenName: string;
  onGardenNameChange: (name: string) => void;
  saveStatus: SaveStatus;
  onManualSave: () => Promise<void>;
  isPublic: boolean;
  onTogglePublic: () => Promise<void>;
  publicUrl?: string;
  className?: string;
  // Category filter props
  categories?: string[];
  activeFilter?: string | null;
  onFilterChange?: (filter: string | null) => void;
  // Owner context
  isOwner?: boolean;
  gardenOwner?: {
    displayName?: string;
    email?: string;
    avatarUrl?: string;
  };
}

export const SplitTopBar = ({
  gardenName,
  onGardenNameChange,
  saveStatus,
  onManualSave,
  isPublic,
  onTogglePublic,
  publicUrl,
  className,
  categories = [],
  activeFilter,
  onFilterChange,
  isOwner = false,
  gardenOwner
}: SplitTopBarProps) => {
  const { user, signOut } = useAuth();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(gardenName);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isManualSaving, setIsManualSaving] = useState(false);
  const [isTogglingPublic, setIsTogglingPublic] = useState(false);
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Handle title editing
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showProfileMenu]);

  const handleTitleSubmit = () => {
    if (tempTitle.trim() && tempTitle !== gardenName) {
      onGardenNameChange(tempTitle.trim());
    } else {
      setTempTitle(gardenName);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setTempTitle(gardenName);
      setIsEditingTitle(false);
    }
  };

  const handleManualSave = async () => {
    setIsManualSaving(true);
    try {
      await onManualSave();
    } finally {
      setIsManualSaving(false);
    }
  };

  const handleTogglePublic = async () => {
    setIsTogglingPublic(true);
    try {
      await onTogglePublic();
    } finally {
      setIsTogglingPublic(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus.status) {
      case 'saving':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'saved':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return saveStatus.hasUnsavedChanges ? 
          <AlertTriangle className="w-4 h-4 text-amber-600" /> : 
          <Check className="w-4 h-4 text-green-600" />;
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus.status) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'All Saved ✓';
      case 'error':
        return 'Save Failed';
      default:
        return saveStatus.hasUnsavedChanges ? 'Unsaved Changes ⚠️' : 'All Saved ✓';
    }
  };

  return (
    <div className={cn(
      "fixed top-4 sm:top-8 left-0 right-0 z-[100] px-2 sm:px-4 transition-all duration-500",
      className
    )}>
      {/* Split Navigation Container */}
      <div className="mx-auto w-full max-w-7xl flex gap-4">
        
        {/* LEFT NAVBAR - Garden Controls & Filters */}
        <nav className="flex-1 flex items-center justify-start rounded-full bg-white/90 px-3 sm:px-6 py-2 sm:py-3 shadow-2xl backdrop-blur-xl border border-black/[0.03]">
          {/* Logo */}
          <div className="flex items-center gap-2 mr-4">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">🌱</span>
            </div>
            <span className="hidden sm:block text-sm font-bold text-black/70">
              Digital Garden
            </span>
          </div>

          {/* Garden Title */}
          <div className="flex items-center gap-2 min-w-0 mr-4">
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={handleTitleKeyDown}
                className="font-serif-display text-lg sm:text-xl font-black italic tracking-tight text-black bg-transparent border-none outline-none min-w-0"
                placeholder="Garden Name"
              />
            ) : (
              <button
                onClick={() => isOwner && setIsEditingTitle(true)}
                disabled={!isOwner}
                className={cn(
                  "font-serif-display text-lg sm:text-xl font-black italic tracking-tight text-black text-left min-w-0 truncate group",
                  isOwner ? "hover:text-black/70 transition-colors cursor-pointer" : "cursor-default"
                )}
              >
                {gardenName}
                {isOwner && (
                  <Edit3 className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-50 transition-opacity inline" />
                )}
              </button>
            )}
          </div>

          {/* Category Filters */}
          <div className="hidden lg:flex items-center gap-2 flex-1">
            <motion.button
              onClick={() => onFilterChange?.(null)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                !activeFilter
                  ? "bg-black text-white shadow-sm"
                  : "text-black/30 hover:text-black hover:bg-black/5"
              )}
            >
              All
            </motion.button>
            {categories.slice(0, 4).map((cat, idx) => (
              <motion.button
                key={cat}
                onClick={() => onFilterChange?.(cat === activeFilter ? null : cat)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                  cat === activeFilter
                    ? "bg-black text-white shadow-sm"
                    : "text-black/30 hover:text-black hover:bg-black/5"
                )}
              >
                {cat}
              </motion.button>
            ))}
            {categories.length > 4 && (
              <span className="text-[9px] text-black/20">+{categories.length - 4}</span>
            )}
          </div>

          {/* Mobile Filter Indicator */}
          <div className="lg:hidden flex items-center">
            {activeFilter && (
              <motion.button
                onClick={() => onFilterChange?.(null)}
                className="px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-black text-white"
              >
                {activeFilter} ×
              </motion.button>
            )}
          </div>
        </nav>

        {/* RIGHT NAVBAR - Social Links & Account Details */}
        <nav className="flex items-center gap-2 sm:gap-4 rounded-full bg-white/90 px-3 sm:px-6 py-2 sm:py-3 shadow-2xl backdrop-blur-xl border border-black/[0.03]">
          {/* Social Links - Always visible */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            <motion.a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -2, color: '#000' }}
              className="text-[10px] font-black uppercase tracking-widest text-black/30 transition-colors hover:text-black"
            >
              GitHub
            </motion.a>
            <motion.a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -2, color: '#000' }}
              className="text-[10px] font-black uppercase tracking-widest text-black/30 transition-colors hover:text-black"
            >
              Twitter
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ y: -2, color: '#000' }}
              className="text-[10px] font-black uppercase tracking-widest text-black/30 transition-colors hover:text-black"
            >
              CV
            </motion.a>
          </div>

          {/* Owner-Only Account Details */}
          {isOwner && (
            <>
              {/* Save Status & Actions */}
              <div className="flex items-center gap-2 border-l border-black/10 pl-3 ml-3">
                {/* Save Status */}
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full bg-black/5">
                  {getSaveStatusIcon()}
                  <span className="text-xs font-medium text-black/70 hidden sm:block">
                    {getSaveStatusText()}
                  </span>
                </div>

                {/* Manual Save Button */}
                <motion.button
                  onClick={handleManualSave}
                  disabled={isManualSaving || saveStatus.status === 'saving'}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all",
                    (isManualSaving || saveStatus.status === 'saving')
                      ? "bg-black/10 text-black/40 cursor-not-allowed"
                      : "bg-black text-white hover:bg-black/80 shadow-md"
                  )}
                >
                  {isManualSaving ? (
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                  ) : (
                    <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                  <span className="hidden sm:block">Save</span>
                </motion.button>

                {/* Publish Toggle */}
                <motion.button
                  onClick={handleTogglePublic}
                  disabled={isTogglingPublic}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all",
                    isPublic
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {isTogglingPublic ? (
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                  ) : isPublic ? (
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                  <span className="hidden lg:block">
                    {isPublic ? 'Public' : 'Private'}
                  </span>
                </motion.button>
              </div>

              {/* User Profile */}
              <div className="relative" ref={profileMenuRef}>
                <motion.button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full hover:bg-black/5 transition-colors"
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.displayName || user.email}
                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-black/10 flex items-center justify-center">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 text-black/60" />
                    </div>
                  )}
                  <span className="hidden lg:block text-sm font-medium text-black/70 max-w-20 truncate">
                    {user?.displayName || user?.email?.split('@')[0]}
                  </span>
                </motion.button>

                {/* Profile Menu Dropdown */}
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-black/[0.03] py-2 z-50"
                    >
                      {/* View Public Garden */}
                      {isPublic && publicUrl && (
                        <a
                          href={publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-black/5 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 text-black/60" />
                          <span className="text-sm font-medium text-black/80">View Public Garden</span>
                        </a>
                      )}

                      {/* Stats */}
                      <button className="flex items-center gap-3 px-4 py-2.5 hover:bg-black/5 transition-colors w-full text-left">
                        <BarChart3 className="w-4 h-4 text-black/60" />
                        <span className="text-sm font-medium text-black/80">Stats</span>
                      </button>

                      {/* Settings */}
                      <button className="flex items-center gap-3 px-4 py-2.5 hover:bg-black/5 transition-colors w-full text-left">
                        <Settings className="w-4 h-4 text-black/60" />
                        <span className="text-sm font-medium text-black/80">Settings</span>
                      </button>

                      {/* Appearance */}
                      <button className="flex items-center gap-3 px-4 py-2.5 hover:bg-black/5 transition-colors w-full text-left">
                        <Palette className="w-4 h-4 text-black/60" />
                        <span className="text-sm font-medium text-black/80">Appearance</span>
                      </button>

                      {/* Help */}
                      <button className="flex items-center gap-3 px-4 py-2.5 hover:bg-black/5 transition-colors w-full text-left">
                        <HelpCircle className="w-4 h-4 text-black/60" />
                        <span className="text-sm font-medium text-black/80">Help</span>
                      </button>

                      <div className="border-t border-black/[0.03] my-2" />

                      {/* Logout */}
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors w-full text-left text-red-600"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}

          {/* Non-Owner View - Show Garden Owner Info */}
          {!isOwner && gardenOwner && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5">
              {gardenOwner.avatarUrl ? (
                <img
                  src={gardenOwner.avatarUrl}
                  alt={gardenOwner.displayName || gardenOwner.email}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center">
                  <User className="w-3 h-3 text-black/60" />
                </div>
              )}
              <span className="text-sm font-medium text-black/70">
                {gardenOwner.displayName || gardenOwner.email?.split('@')[0]}'s Garden
              </span>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
};