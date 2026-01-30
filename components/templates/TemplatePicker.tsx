/**
 * Template Picker Component
 * 
 * This component provides a visual template selection interface that allows users
 * to choose from predefined templates with thumbnail previews, category grouping,
 * and tile type filtering.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 */

'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Grid, Square, Circle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  TileTemplate, 
  TemplateCategory, 
  TemplatePickerConfig 
} from './types';
import { BlockType } from '../Block';
import { 
  getTemplateCategories, 
  getTemplatesForTileType, 
  getTemplatesByCategory,
  validateTemplateForTileType 
} from './validation';
import { getCircleTemplateStyles, calculateOptimalFontSize } from './utils';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TemplatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TileTemplate, tileType: BlockType) => void;
  selectedTileType?: BlockType;
  config?: Partial<TemplatePickerConfig>;
  className?: string;
}

const DEFAULT_CONFIG: TemplatePickerConfig = {
  showThumbnails: true,
  groupByCategory: true,
  filterByTileType: true,
  showDescriptions: true,
};

const TILE_TYPES: { type: BlockType; label: string; description: string; icon: string }[] = [
  { type: 'text', label: 'Text', description: 'Text content block', icon: '📝' },
  { type: 'thought', label: 'Thought', description: 'Sticky note style', icon: '💭' },
  { type: 'quote', label: 'Quote', description: 'Quote with attribution', icon: '💬' },
  { type: 'image', label: 'Image', description: 'Photo or image', icon: '🖼️' },
  { type: 'video', label: 'Video', description: 'Video or GIF', icon: '🎥' },
  { type: 'project', label: 'Project', description: 'Project showcase', icon: '🚀' },
  { type: 'status', label: 'Status', description: 'Status banner', icon: '📊' }
];

const CATEGORY_ICONS: Record<TemplateCategory, React.ReactNode> = {
  square: <Square size={16} />,
  rectangle: <Grid size={16} />,
  circle: <Circle size={16} />
};

export const TemplatePicker: React.FC<TemplatePickerProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  selectedTileType,
  config = {},
  className
}) => {
  const [currentTileType, setCurrentTileType] = useState<BlockType>(selectedTileType || 'text');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<TileTemplate | null>(null);

  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const categories = getTemplateCategories();

  // Get available templates based on current filters
  const availableTemplates = useMemo(() => {
    let templates: TileTemplate[] = [];

    if (finalConfig.filterByTileType && currentTileType) {
      // Filter by tile type first (Requirements 8.5)
      templates = getTemplatesForTileType(currentTileType);
    } else {
      // Get all templates if no tile type filtering
      templates = categories.flatMap(cat => getTemplatesByCategory(cat));
    }

    // Filter by category if selected
    if (selectedCategory !== 'all') {
      templates = templates.filter(template => template.category === selectedCategory);
    }

    return templates;
  }, [currentTileType, selectedCategory, finalConfig.filterByTileType, categories]);

  // Group templates by category (Requirements 8.4)
  const templatesByCategory = useMemo(() => {
    if (!finalConfig.groupByCategory) {
      return { all: availableTemplates };
    }

    const grouped: Record<string, TileTemplate[]> = {};
    
    for (const template of availableTemplates) {
      if (!grouped[template.category]) {
        grouped[template.category] = [];
      }
      grouped[template.category].push(template);
    }

    return grouped;
  }, [availableTemplates, finalConfig.groupByCategory]);

  // Handle template selection with animation feedback
  const handleTemplateSelect = (template: TileTemplate) => {
    setSelectedTemplate(template);
    
    // Add haptic feedback for mobile devices
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // Handle confirm selection
  const handleConfirmSelection = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate, currentTileType);
      onClose();
    }
  };

  // Handle tile type change
  const handleTileTypeChange = (tileType: BlockType) => {
    setCurrentTileType(tileType);
    setSelectedTemplate(null); // Clear selection when changing tile type
  };

  // Render template thumbnail (Requirements 8.2)
  const renderTemplateThumbnail = (template: TileTemplate) => {
    const fontSizes = calculateOptimalFontSize(template);
    const isCircle = template.category === 'circle';
    const circleStyles = isCircle ? getCircleTemplateStyles(template) : '';
    
    // Calculate thumbnail dimensions (scaled down for display)
    const scale = 0.8;
    const thumbnailWidth = Math.max(60, template.dimensions.w * 20 * scale);
    const thumbnailHeight = Math.max(40, template.dimensions.h * 20 * scale);

    return (
      <motion.div
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn(
          "relative border-2 transition-all duration-300 bg-white shadow-sm cursor-pointer",
          isCircle ? circleStyles : "rounded-lg",
          selectedTemplate?.id === template.id
            ? "border-black shadow-xl scale-105 ring-2 ring-black/10"
            : "border-gray-200 hover:border-gray-400 hover:shadow-lg"
        )}
        style={{
          width: `${thumbnailWidth}px`,
          height: `${thumbnailHeight}px`,
          minWidth: '60px',
          minHeight: '40px'
        }}
      >
        {/* Template content preview */}
        <div className={cn(
          "absolute inset-2 flex flex-col justify-center items-center text-center",
          isCircle && "inset-3"
        )}>
          <div className={cn("font-medium text-gray-700", fontSizes.title)}>
            {template.name}
          </div>
          <div className={cn("text-gray-500 mt-1", fontSizes.category)}>
            {template.dimensions.w}×{template.dimensions.h}
          </div>
        </div>

        {/* Selection indicator with enhanced animation (Requirements 8.3) */}
        {selectedTemplate?.id === template.id && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ 
              type: "spring", 
              stiffness: 500, 
              damping: 25,
              duration: 0.6
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center shadow-lg"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Check size={14} />
            </motion.div>
          </motion.div>
        )}

        {/* Validation indicator with pulse animation */}
        {finalConfig.filterByTileType && (
          <motion.div 
            className="absolute top-1 left-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {validateTemplateForTileType(template, currentTileType).isValid ? (
              <motion.div 
                className="w-2 h-2 bg-green-500 rounded-full" 
                title="Compatible"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            ) : (
              <motion.div 
                className="w-2 h-2 bg-red-500 rounded-full" 
                title="Not compatible"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </motion.div>
        )}
      </motion.div>
    );
  };

  // Render category section
  const renderCategorySection = (category: string, templates: TileTemplate[]) => {
    if (templates.length === 0) return null;

    const categoryName = category === 'all' ? 'All Templates' : 
      category.charAt(0).toUpperCase() + category.slice(1);

    return (
      <div key={category} className="space-y-3">
        <div className="flex items-center gap-2">
          {category !== 'all' && CATEGORY_ICONS[category as TemplateCategory]}
          <h3 className="font-medium text-gray-800">{categoryName}</h3>
          <span className="text-xs text-gray-500">({templates.length})</span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {templates.map(template => (
            <motion.button
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {finalConfig.showThumbnails && renderTemplateThumbnail(template)}
              
              {finalConfig.showDescriptions && (
                <div className="text-center">
                  <div className="text-xs font-medium text-gray-700">
                    {template.name}
                  </div>
                  {template.description && (
                    <div className="text-xs text-gray-500 mt-1">
                      {template.description}
                    </div>
                  )}
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Modal with enhanced entrance animation */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              mass: 0.8
            }}
            className={cn(
              "bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden",
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with stagger animation */}
            <motion.div 
              className="flex items-center justify-between p-6 border-b border-gray-200"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-gray-900">Choose Template</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Select a template for your {currentTileType} tile
                </p>
              </motion.div>
              <motion.button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close template picker"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <X size={20} />
              </motion.button>
            </motion.div>

            {/* Tile Type Selector with stagger animation */}
            <motion.div 
              className="p-6 border-b border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <motion.label 
                className="block text-sm font-medium text-gray-700 mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Tile Type
              </motion.label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {TILE_TYPES.map(({ type, label, icon }, index) => (
                  <motion.button
                    key={type}
                    onClick={() => handleTileTypeChange(type)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-lg border transition-all text-xs",
                      currentTileType === type
                        ? "bg-black text-white border-black shadow-lg"
                        : "bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300"
                    )}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      delay: 0.4 + index * 0.05, 
                      duration: 0.3,
                      type: "spring",
                      stiffness: 300
                    }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.span 
                      className="text-lg"
                      animate={currentTileType === type ? { 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      {icon}
                    </motion.span>
                    <span className="font-medium">{label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Category Filter with animation */}
            {finalConfig.groupByCategory && (
              <motion.div 
                className="px-6 py-4 border-b border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <div className="flex items-center gap-2">
                  <motion.label 
                    className="text-sm font-medium text-gray-700"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Category:
                  </motion.label>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => setSelectedCategory('all')}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium transition-all duration-200",
                        selectedCategory === 'all'
                          ? "bg-black text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5, duration: 0.2 }}
                    >
                      All
                    </motion.button>
                    {categories.map((category, index) => (
                      <motion.button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={cn(
                          "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200",
                          selectedCategory === category
                            ? "bg-black text-white shadow-md"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.2 }}
                      >
                        <motion.div
                          animate={selectedCategory === category ? { rotate: [0, 360] } : {}}
                          transition={{ duration: 0.5 }}
                        >
                          {CATEGORY_ICONS[category]}
                        </motion.div>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Templates Grid with enhanced animations */}
            <motion.div 
              className="flex-1 overflow-y-auto p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <AnimatePresence mode="wait">
                {availableTemplates.length === 0 ? (
                  <motion.div
                    key="no-templates"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-12"
                  >
                    <motion.div 
                      className="text-gray-400 text-lg mb-2"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      🚫
                    </motion.div>
                    <p className="text-gray-600">
                      No templates available for {currentTileType} tiles
                      {selectedCategory !== 'all' && ` in ${selectedCategory} category`}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="templates-grid"
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {finalConfig.groupByCategory ? (
                      Object.entries(templatesByCategory).map(([category, templates]) =>
                        renderCategorySection(category, templates)
                      )
                    ) : (
                      renderCategorySection('all', availableTemplates)
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Footer with slide-up animation */}
            <motion.div 
              className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <motion.div 
                className="text-sm text-gray-600"
                key={selectedTemplate?.id || 'none'}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                {selectedTemplate ? (
                  <span>
                    Selected: <strong>{selectedTemplate.name}</strong> 
                    ({selectedTemplate.dimensions.w}×{selectedTemplate.dimensions.h})
                  </span>
                ) : (
                  'Select a template to continue'
                )}
              </motion.div>
              
              <div className="flex gap-3">
                <motion.button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleConfirmSelection}
                  disabled={!selectedTemplate}
                  className={cn(
                    "px-6 py-2 rounded-lg font-medium transition-all duration-200",
                    selectedTemplate
                      ? "bg-black text-white hover:bg-gray-800 shadow-lg"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                  whileHover={selectedTemplate ? { scale: 1.05, y: -1 } : {}}
                  whileTap={selectedTemplate ? { scale: 0.95 } : {}}
                  animate={selectedTemplate ? {
                    boxShadow: [
                      "0 4px 6px rgba(0, 0, 0, 0.1)",
                      "0 8px 15px rgba(0, 0, 0, 0.2)",
                      "0 4px 6px rgba(0, 0, 0, 0.1)"
                    ]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Create Tile
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};