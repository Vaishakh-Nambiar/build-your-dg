/**
 * Template Picker Hook
 * 
 * This hook manages the state and logic for the template picker component,
 * providing an easy way to integrate template selection into the garden builder.
 */

'use client';

import { useState, useCallback } from 'react';
import { TileTemplate } from './types';
import { BlockType } from '../Block';
import { getDefaultTemplateForTileType, findFirstAvailablePosition } from './utils';

interface UseTemplatePickerOptions {
  onCreateTile?: (template: TileTemplate, tileType: BlockType, position?: { x: number; y: number }) => void;
  existingTiles?: any[]; // Array of existing tiles for position calculation
  gridCols?: number;
}

interface UseTemplatePickerReturn {
  isPickerOpen: boolean;
  selectedTileType: BlockType | undefined;
  openPicker: (tileType?: BlockType) => void;
  closePicker: () => void;
  handleTemplateSelect: (template: TileTemplate, tileType: BlockType) => void;
  createTileWithDefaultTemplate: (tileType: BlockType) => void;
}

export const useTemplatePicker = (options: UseTemplatePickerOptions = {}): UseTemplatePickerReturn => {
  const { onCreateTile, existingTiles = [], gridCols = 12 } = options;
  
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedTileType, setSelectedTileType] = useState<BlockType | undefined>();

  // Open the template picker
  const openPicker = useCallback((tileType?: BlockType) => {
    setSelectedTileType(tileType);
    setIsPickerOpen(true);
  }, []);

  // Close the template picker
  const closePicker = useCallback(() => {
    setIsPickerOpen(false);
    setSelectedTileType(undefined);
  }, []);

  // Handle template selection and tile creation
  const handleTemplateSelect = useCallback((template: TileTemplate, tileType: BlockType) => {
    if (onCreateTile) {
      // Find the first available position for the template
      const position = findFirstAvailablePosition(template, existingTiles, gridCols);
      
      if (position) {
        onCreateTile(template, tileType, position);
      } else {
        // If no position found, create at origin and let the grid handle repositioning
        onCreateTile(template, tileType, { x: 0, y: 0 });
      }
    }
    
    closePicker();
  }, [onCreateTile, existingTiles, gridCols, closePicker]);

  // Create a tile with the default template for the given type
  const createTileWithDefaultTemplate = useCallback((tileType: BlockType) => {
    const defaultTemplate = getDefaultTemplateForTileType(tileType);
    
    if (defaultTemplate) {
      handleTemplateSelect(defaultTemplate, tileType);
    } else {
      // Fallback: open picker if no default template
      openPicker(tileType);
    }
  }, [handleTemplateSelect, openPicker]);

  return {
    isPickerOpen,
    selectedTileType,
    openPicker,
    closePicker,
    handleTemplateSelect,
    createTileWithDefaultTemplate
  };
};