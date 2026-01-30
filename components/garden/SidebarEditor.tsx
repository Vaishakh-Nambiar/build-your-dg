'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, Save, Trash2, AlertTriangle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BlockData, BlockType } from '../Block';
import { LivePreviewPanel } from './LivePreviewPanel';
import { FormPanel } from './FormPanel';
import { validateFormSubmission, ValidationError } from './validation';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SidebarEditorProps {
    isOpen: boolean;
    onClose: () => void;
    currentTile: BlockData | null;
    onSave: (tileData: BlockData) => void;
    onDelete: (tileId: string) => void;
}

export const SidebarEditor: React.FC<SidebarEditorProps> = ({
    isOpen,
    onClose,
    currentTile,
    onSave,
    onDelete
}) => {
    const [editedTile, setEditedTile] = useState<BlockData | null>(null);
    const [isDirty, setIsDirty] = useState(false);
    const [isValid, setIsValid] = useState(true);
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
    const [fileUploadError, setFileUploadError] = useState<string | null>(null);

    // Responsive state management
    const [isMobile, setIsMobile] = useState(false);

    // Check if we're on mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024); // lg breakpoint
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Handle swipe to close on mobile
    const handleDragEnd = useCallback((event: any, info: PanInfo) => {
        // Only handle swipe to close on mobile
        if (!isMobile) return;
        
        // If swiped right with sufficient velocity or distance, close
        if (info.offset.x > 100 || info.velocity.x > 500) {
            handleClose();
        }
    }, [isMobile]);

    // Initialize edited tile when currentTile changes
    useEffect(() => {
        if (currentTile) {
            setEditedTile({ ...currentTile });
            setIsDirty(false);
            setIsValid(true);
            setValidationErrors([]);
        } else {
            setEditedTile(null);
            setIsDirty(false);
            setIsValid(true);
            setValidationErrors([]);
        }
    }, [currentTile]);

    // Handle tile updates from form
    const handleTileUpdate = (updates: Partial<BlockData>) => {
        if (!editedTile) return;
        
        const updatedTile = { ...editedTile, ...updates };
        setEditedTile(updatedTile);
        setIsDirty(true);
    };

    // Handle validation state changes from FormPanel
    const handleValidationChange = (valid: boolean, errors: ValidationError[]) => {
        setIsValid(valid);
        setValidationErrors(errors);
    };

    // Handle file upload errors
    const handleFileUploadError = (error: string) => {
        setFileUploadError(error);
        // Clear after 5 seconds
        setTimeout(() => setFileUploadError(null), 5000);
    };

    // Handle save action
    const handleSave = () => {
        if (!editedTile) return;
        
        // Perform final validation before saving
        const finalValidation = validateFormSubmission(editedTile);
        
        if (!finalValidation.isValid) {
            // Update validation state to show all errors
            setIsValid(false);
            setValidationErrors(finalValidation.errors);
            
            // Show error summary
            const errorCount = finalValidation.errors.length;
            alert(`⚠️ Cannot Save\n\nPlease fix ${errorCount} validation error${errorCount > 1 ? 's' : ''} before saving.`);
            return;
        }
        
        onSave(editedTile);
        setIsDirty(false);
        onClose();
    };

    // Handle delete action
    const handleDelete = () => {
        if (!editedTile) return;
        
        if (window.confirm('⚠️ Delete Tile?\n\nThis action cannot be undone.')) {
            onDelete(editedTile.id);
            onClose();
        }
    };

    // Handle close with unsaved changes
    const handleClose = () => {
        if (isDirty) {
            if (window.confirm('⚠️ Unsaved Changes\n\nYou have unsaved changes. Are you sure you want to close?')) {
                onClose();
            }
        } else {
            onClose();
        }
    };

    // Get save button state and tooltip
    const getSaveButtonState = () => {
        if (!isDirty) {
            return {
                disabled: true,
                className: "bg-gray-200 text-gray-400 cursor-not-allowed",
                tooltip: "No changes to save"
            };
        }
        
        if (!isValid) {
            return {
                disabled: true,
                className: "bg-red-100 text-red-600 cursor-not-allowed",
                tooltip: `Cannot save: ${validationErrors.length} validation error${validationErrors.length > 1 ? 's' : ''}`
            };
        }
        
        return {
            disabled: false,
            className: "bg-black text-white hover:bg-gray-800",
            tooltip: "Save Changes"
        };
    };

    if (!editedTile) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Responsive Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={cn(
                            "fixed inset-0 z-[100]",
                            // Full backdrop on mobile for focus, partial on larger screens for grid usability
                            "bg-black/20 backdrop-blur-sm sm:bg-black/10 lg:bg-transparent",
                            // On large screens, only cover the left portion to maintain grid usability
                            "lg:bg-gradient-to-r lg:from-black/5 lg:via-transparent lg:to-transparent"
                        )}
                        onClick={handleClose}
                    />

                    {/* Sidebar Container - Responsive width with drag support */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        drag={isMobile ? "x" : false}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={handleDragEnd}
                        transition={{
                            type: 'spring',
                            damping: 30,
                            stiffness: 300,
                            mass: 0.8
                        }}
                        className={cn(
                            "fixed top-0 right-0 h-full bg-white shadow-2xl z-[101] flex flex-col",
                            // Responsive width: full width on mobile, 85% on tablet, 75% on desktop
                            "w-full sm:w-[85%] lg:w-[75%]",
                            // Add touch-friendly cursor on mobile
                            isMobile && "cursor-grab active:cursor-grabbing"
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-200 bg-white/95 backdrop-blur-md p-4 sm:p-6">
                            {/* Mobile swipe indicator */}
                            {isMobile && (
                                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gray-300 rounded-full" />
                            )}
                            
                            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
                                <h2 className="font-serif-display text-xl sm:text-2xl font-bold italic text-black truncate">
                                    Edit Tile
                                </h2>
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                    {isDirty && (
                                        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-amber-600">
                                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                                            <span className="hidden sm:inline">Unsaved changes</span>
                                            <span className="sm:hidden">Unsaved</span>
                                        </div>
                                    )}
                                    {!isValid && validationErrors.length > 0 && (
                                        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-red-600">
                                            <AlertTriangle size={14} className="sm:w-4 sm:h-4" />
                                            <span className="hidden sm:inline">
                                                {validationErrors.length} validation error{validationErrors.length > 1 ? 's' : ''}
                                            </span>
                                            <span className="sm:hidden">
                                                {validationErrors.length} error{validationErrors.length > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    )}
                                    {fileUploadError && (
                                        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-red-600">
                                            <AlertTriangle size={14} className="sm:w-4 sm:h-4" />
                                            <span className="hidden sm:inline">File upload error</span>
                                            <span className="sm:hidden">Upload error</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0 ml-2"
                                title="Close Editor"
                            >
                                <X size={16} className="sm:w-5 sm:h-5" />
                            </button>
                        </div>

                        {/* Main Content Area - Responsive Layout */}
                        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                            {/* Live Preview Panel - Full width on mobile, left half on desktop */}
                            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gray-50/50 min-h-[200px] lg:min-h-0">
                                <LivePreviewPanel
                                    tileData={editedTile}
                                    className="max-w-md w-full"
                                />
                            </div>

                            {/* Form Panel - Full width on mobile, right half on desktop */}
                            <div className="w-full lg:w-1/2 lg:border-l border-gray-200 overflow-y-auto flex-1 lg:flex-none">
                                <FormPanel
                                    tileData={editedTile}
                                    onUpdate={handleTileUpdate}
                                    onValidationChange={handleValidationChange}
                                    onFileUploadError={handleFileUploadError}
                                />
                            </div>
                        </div>

                        {/* Action Buttons Footer */}
                        <div className="border-t border-gray-200 bg-white/95 backdrop-blur-md p-4 sm:p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
                            <button
                                onClick={handleDelete}
                                className="flex items-center justify-center sm:justify-start gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium order-2 sm:order-1"
                                title="Delete Tile"
                            >
                                <Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" />
                                Delete
                            </button>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 order-1 sm:order-2">
                                <button
                                    onClick={handleClose}
                                    className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={getSaveButtonState().disabled}
                                    className={cn(
                                        "flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors",
                                        getSaveButtonState().className
                                    )}
                                    title={getSaveButtonState().tooltip}
                                >
                                    <Save size={16} className="sm:w-[18px] sm:h-[18px]" />
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};