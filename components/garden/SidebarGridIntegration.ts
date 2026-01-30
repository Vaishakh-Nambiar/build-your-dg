/**
 * Sidebar Grid Integration System
 * 
 * Connects sidebar editor with grid state management, handling tile selection,
 * editing workflow, form changes, and save/delete operations.
 * 
 * Requirements: 3.1, 3.7, 3.8, 8.2
 */

import React from 'react';
import { BlockData, BlockType } from '../Block';
import { TileTemplate } from '../templates/types';
import { updateGridItemTemplate, GridLayoutItem, updateBlockPositions } from './TemplateGridIntegration';

export interface SidebarGridState {
  selectedTileId: string | null;
  isEditing: boolean;
  editingTile: BlockData | null;
  hasUnsavedChanges: boolean;
}

export interface GridStateManager {
  blocks: BlockData[];
  layout: GridLayoutItem[];
  sidebarState: SidebarGridState;
}

export type GridStateAction = 
  | { type: 'SELECT_TILE'; payload: { tileId: string } }
  | { type: 'DESELECT_TILE' }
  | { type: 'START_EDITING'; payload: { tile: BlockData } }
  | { type: 'STOP_EDITING' }
  | { type: 'UPDATE_TILE_CONTENT'; payload: { tileId: string; content: any } }
  | { type: 'UPDATE_TILE_TEMPLATE'; payload: { tileId: string; template: TileTemplate } }
  | { type: 'SAVE_TILE'; payload: { tile: BlockData } }
  | { type: 'DELETE_TILE'; payload: { tileId: string } }
  | { type: 'ADD_TILE'; payload: { tile: BlockData; layoutItem: GridLayoutItem } }
  | { type: 'UPDATE_LAYOUT'; payload: { layout: GridLayoutItem[] } }
  | { type: 'SET_UNSAVED_CHANGES'; payload: { hasChanges: boolean } };

/**
 * Manages the integration between sidebar editor and grid state
 */
export class SidebarGridIntegration {
  private state: GridStateManager;
  private listeners: Set<(state: GridStateManager) => void> = new Set();
  private autoSaveTimeout: NodeJS.Timeout | null = null;

  constructor(initialBlocks: BlockData[] = [], initialLayout: GridLayoutItem[] = []) {
    this.state = {
      blocks: initialBlocks,
      layout: initialLayout,
      sidebarState: {
        selectedTileId: null,
        isEditing: false,
        editingTile: null,
        hasUnsavedChanges: false
      }
    };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: GridStateManager) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get current state
   */
  getState(): GridStateManager {
    return { ...this.state };
  }

  /**
   * Dispatch an action to update state
   */
  dispatch(action: GridStateAction): void {
    const newState = this.reducer(this.state, action);
    this.state = newState;
    this.notifyListeners();
  }

  /**
   * State reducer
   */
  private reducer(state: GridStateManager, action: GridStateAction): GridStateManager {
    switch (action.type) {
      case 'SELECT_TILE': {
        const tile = state.blocks.find(b => b.id === action.payload.tileId);
        return {
          ...state,
          sidebarState: {
            ...state.sidebarState,
            selectedTileId: action.payload.tileId,
            editingTile: tile || null
          }
        };
      }

      case 'DESELECT_TILE': {
        return {
          ...state,
          sidebarState: {
            selectedTileId: null,
            isEditing: false,
            editingTile: null,
            hasUnsavedChanges: false
          }
        };
      }

      case 'START_EDITING': {
        return {
          ...state,
          sidebarState: {
            ...state.sidebarState,
            isEditing: true,
            editingTile: { ...action.payload.tile },
            selectedTileId: action.payload.tile.id,
            hasUnsavedChanges: false
          }
        };
      }

      case 'STOP_EDITING': {
        return {
          ...state,
          sidebarState: {
            ...state.sidebarState,
            isEditing: false,
            hasUnsavedChanges: false
          }
        };
      }

      case 'UPDATE_TILE_CONTENT': {
        if (!state.sidebarState.editingTile) return state;

        const updatedEditingTile = {
          ...state.sidebarState.editingTile,
          content: action.payload.content,
          updatedAt: new Date().toISOString()
        };

        return {
          ...state,
          sidebarState: {
            ...state.sidebarState,
            editingTile: updatedEditingTile,
            hasUnsavedChanges: true
          }
        };
      }

      case 'UPDATE_TILE_TEMPLATE': {
        if (!state.sidebarState.editingTile) return state;

        try {
          const { updatedGridItem, updatedBlockData, layoutChanged } = updateGridItemTemplate(
            state.sidebarState.editingTile,
            action.payload.template,
            state.layout
          );

          const newLayout = layoutChanged 
            ? state.layout.map(item => 
                item.i === updatedGridItem.i ? updatedGridItem : item
              )
            : state.layout;

          return {
            ...state,
            layout: newLayout,
            sidebarState: {
              ...state.sidebarState,
              editingTile: updatedBlockData,
              hasUnsavedChanges: true
            }
          };
        } catch (error) {
          console.error('Failed to update tile template:', error);
          return state;
        }
      }

      case 'SAVE_TILE': {
        const updatedBlocks = state.blocks.map(block =>
          block.id === action.payload.tile.id ? action.payload.tile : block
        );

        return {
          ...state,
          blocks: updatedBlocks,
          sidebarState: {
            ...state.sidebarState,
            hasUnsavedChanges: false,
            editingTile: action.payload.tile
          }
        };
      }

      case 'DELETE_TILE': {
        const filteredBlocks = state.blocks.filter(block => block.id !== action.payload.tileId);
        const filteredLayout = state.layout.filter(item => item.i !== action.payload.tileId);

        return {
          ...state,
          blocks: filteredBlocks,
          layout: filteredLayout,
          sidebarState: {
            selectedTileId: null,
            isEditing: false,
            editingTile: null,
            hasUnsavedChanges: false
          }
        };
      }

      case 'ADD_TILE': {
        return {
          ...state,
          blocks: [...state.blocks, action.payload.tile],
          layout: [...state.layout, action.payload.layoutItem]
        };
      }

      case 'UPDATE_LAYOUT': {
        const updatedBlocks = updateBlockPositions(state.blocks, action.payload.layout);
        
        return {
          ...state,
          blocks: updatedBlocks,
          layout: action.payload.layout
        };
      }

      case 'SET_UNSAVED_CHANGES': {
        return {
          ...state,
          sidebarState: {
            ...state.sidebarState,
            hasUnsavedChanges: action.payload.hasChanges
          }
        };
      }

      default:
        return state;
    }
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Handle tile selection from grid
   */
  selectTile(tileId: string): void {
    this.dispatch({ type: 'SELECT_TILE', payload: { tileId } });
  }

  /**
   * Handle tile deselection
   */
  deselectTile(): void {
    this.dispatch({ type: 'DESELECT_TILE' });
  }

  /**
   * Start editing a tile
   */
  startEditing(tile: BlockData): void {
    this.dispatch({ type: 'START_EDITING', payload: { tile } });
  }

  /**
   * Stop editing
   */
  stopEditing(): void {
    this.dispatch({ type: 'STOP_EDITING' });
  }

  /**
   * Update tile content during editing
   */
  updateTileContent(tileId: string, content: any): void {
    this.dispatch({ type: 'UPDATE_TILE_CONTENT', payload: { tileId, content } });
    this.scheduleAutoSave();
  }

  /**
   * Update tile template during editing
   */
  updateTileTemplate(tileId: string, template: TileTemplate): void {
    this.dispatch({ type: 'UPDATE_TILE_TEMPLATE', payload: { tileId, template } });
  }

  /**
   * Save tile changes
   */
  saveTile(tile: BlockData): void {
    this.dispatch({ type: 'SAVE_TILE', payload: { tile } });
    this.clearAutoSave();
  }

  /**
   * Delete a tile
   */
  deleteTile(tileId: string): void {
    this.dispatch({ type: 'DELETE_TILE', payload: { tileId } });
  }

  /**
   * Add a new tile
   */
  addTile(tile: BlockData, layoutItem: GridLayoutItem): void {
    this.dispatch({ type: 'ADD_TILE', payload: { tile, layoutItem } });
  }

  /**
   * Update grid layout
   */
  updateLayout(layout: GridLayoutItem[]): void {
    this.dispatch({ type: 'UPDATE_LAYOUT', payload: { layout } });
  }

  /**
   * Check if there are unsaved changes
   */
  hasUnsavedChanges(): boolean {
    return this.state.sidebarState.hasUnsavedChanges;
  }

  /**
   * Get currently selected tile
   */
  getSelectedTile(): BlockData | null {
    return this.state.sidebarState.editingTile;
  }

  /**
   * Get currently editing tile
   */
  getEditingTile(): BlockData | null {
    return this.state.sidebarState.editingTile;
  }

  /**
   * Check if currently editing
   */
  isEditing(): boolean {
    return this.state.sidebarState.isEditing;
  }

  /**
   * Schedule auto-save for unsaved changes
   */
  private scheduleAutoSave(): void {
    this.clearAutoSave();
    
    this.autoSaveTimeout = setTimeout(() => {
      if (this.state.sidebarState.hasUnsavedChanges && this.state.sidebarState.editingTile) {
        // Auto-save logic can be implemented here
        console.log('Auto-saving tile changes...');
      }
    }, 5000); // Auto-save after 5 seconds of inactivity
  }

  /**
   * Clear auto-save timeout
   */
  private clearAutoSave(): void {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
      this.autoSaveTimeout = null;
    }
  }

  /**
   * Handle form validation changes
   */
  handleValidationChange(isValid: boolean, errors: string[]): void {
    // Can be extended to handle validation state
    console.log('Validation changed:', { isValid, errors });
  }

  /**
   * Handle file upload errors
   */
  handleFileUploadError(error: string): void {
    // Can be extended to handle file upload errors
    console.error('File upload error:', error);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.clearAutoSave();
    this.listeners.clear();
  }
}

/**
 * React hook for using sidebar grid integration
 */
export const useSidebarGridIntegration = (
  initialBlocks: BlockData[] = [],
  initialLayout: GridLayoutItem[] = []
) => {
  const [integration] = React.useState(() => 
    new SidebarGridIntegration(initialBlocks, initialLayout)
  );
  
  const [state, setState] = React.useState(() => integration.getState());

  React.useEffect(() => {
    const unsubscribe = integration.subscribe(setState);
    return unsubscribe;
  }, [integration]);

  React.useEffect(() => {
    return () => integration.destroy();
  }, [integration]);

  return {
    state,
    actions: {
      selectTile: integration.selectTile.bind(integration),
      deselectTile: integration.deselectTile.bind(integration),
      startEditing: integration.startEditing.bind(integration),
      stopEditing: integration.stopEditing.bind(integration),
      updateTileContent: integration.updateTileContent.bind(integration),
      updateTileTemplate: integration.updateTileTemplate.bind(integration),
      saveTile: integration.saveTile.bind(integration),
      deleteTile: integration.deleteTile.bind(integration),
      addTile: integration.addTile.bind(integration),
      updateLayout: integration.updateLayout.bind(integration)
    },
    getters: {
      hasUnsavedChanges: integration.hasUnsavedChanges.bind(integration),
      getSelectedTile: integration.getSelectedTile.bind(integration),
      getEditingTile: integration.getEditingTile.bind(integration),
      isEditing: integration.isEditing.bind(integration)
    }
  };
};