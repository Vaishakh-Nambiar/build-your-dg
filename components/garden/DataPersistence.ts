/**
 * Enhanced Data Persistence System
 * 
 * Handles saving and loading garden data with template information
 * while maintaining backward compatibility with existing data structures.
 * 
 * Requirements: 7.5
 */

import { BlockData } from '../Block';
import { TileTemplate } from '../templates/types';
import { autoMigrate, needsMigration } from './DataMigration';

export interface SavedGardenData {
  version: string;
  timestamp: string;
  blocks: BlockData[];
  metadata?: {
    totalBlocks: number;
    templateUsage: Record<string, number>;
    lastModified: string;
  };
}

export interface LegacySavedData {
  blocks: any[];
  // Legacy fields that might exist
  layout?: any[];
  items?: any[];
  tiles?: any[];
}

const CURRENT_VERSION = '2.0.0';
const STORAGE_KEY = 'garden-builder-data';
const BACKUP_KEY = 'garden-builder-backup';

/**
 * Enhanced save operation with template information
 */
export const saveGardenData = (blocks: BlockData[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Create backup of existing data before saving
      const existingData = localStorage.getItem(STORAGE_KEY);
      if (existingData) {
        localStorage.setItem(BACKUP_KEY, existingData);
      }
      
      // Calculate metadata
      const templateUsage: Record<string, number> = {};
      blocks.forEach(block => {
        if (block.template) {
          const templateId = block.template.id;
          templateUsage[templateId] = (templateUsage[templateId] || 0) + 1;
        }
      });
      
      const savedData: SavedGardenData = {
        version: CURRENT_VERSION,
        timestamp: new Date().toISOString(),
        blocks: blocks.map(block => ({
          ...block,
          updatedAt: new Date().toISOString()
        })),
        metadata: {
          totalBlocks: blocks.length,
          templateUsage,
          lastModified: new Date().toISOString()
        }
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
      
      // Dispatch custom event for other components to listen to
      window.dispatchEvent(new CustomEvent('gardenDataSaved', {
        detail: { blocks: savedData.blocks, metadata: savedData.metadata }
      }));
      
      resolve();
    } catch (error) {
      reject(new Error(`Failed to save garden data: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
};

/**
 * Enhanced load operation with automatic migration support
 */
export const loadGardenData = (): Promise<{
  blocks: BlockData[];
  migrationPerformed: boolean;
  migrationSummary?: any;
}> => {
  return new Promise((resolve, reject) => {
    try {
      const savedDataString = localStorage.getItem(STORAGE_KEY);
      
      if (!savedDataString) {
        // No saved data, return empty state
        resolve({
          blocks: [],
          migrationPerformed: false
        });
        return;
      }
      
      let parsedData: any;
      try {
        parsedData = JSON.parse(savedDataString);
      } catch (parseError) {
        reject(new Error('Failed to parse saved garden data'));
        return;
      }
      
      // Check if this is new format data
      if (parsedData.version && parsedData.blocks) {
        // New format - validate and return
        const blocks = parsedData.blocks.filter((block: any) => 
          block && 
          typeof block === 'object' && 
          block.id && 
          block.type
        );
        
        resolve({
          blocks,
          migrationPerformed: false
        });
        return;
      }
      
      // Check if this is legacy format that needs migration
      let legacyBlocks: any[] = [];
      
      if (Array.isArray(parsedData)) {
        // Direct array of blocks
        legacyBlocks = parsedData;
      } else if (parsedData.blocks && Array.isArray(parsedData.blocks)) {
        // Object with blocks array
        legacyBlocks = parsedData.blocks;
      } else if (parsedData.layout && Array.isArray(parsedData.layout)) {
        // React-grid-layout format
        legacyBlocks = parsedData.layout;
      } else if (parsedData.items && Array.isArray(parsedData.items)) {
        // Alternative format
        legacyBlocks = parsedData.items;
      } else if (parsedData.tiles && Array.isArray(parsedData.tiles)) {
        // Tiles format
        legacyBlocks = parsedData.tiles;
      }
      
      if (legacyBlocks.length === 0) {
        resolve({
          blocks: [],
          migrationPerformed: false
        });
        return;
      }
      
      // Perform migration
      const migrationResult = autoMigrate(legacyBlocks);
      
      if (migrationResult.needsMigration && migrationResult.migratedData) {
        // Save migrated data in new format
        saveGardenData(migrationResult.migratedData).catch(console.error);
        
        resolve({
          blocks: migrationResult.migratedData,
          migrationPerformed: true,
          migrationSummary: migrationResult.summary
        });
      } else {
        // No migration needed or migration failed
        resolve({
          blocks: legacyBlocks.filter((block: any) => 
            block && 
            typeof block === 'object' && 
            block.id && 
            block.type
          ),
          migrationPerformed: false
        });
      }
      
    } catch (error) {
      reject(new Error(`Failed to load garden data: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
};

/**
 * Export garden data for backup or sharing
 */
export const exportGardenData = (blocks: BlockData[]): string => {
  const exportData: SavedGardenData = {
    version: CURRENT_VERSION,
    timestamp: new Date().toISOString(),
    blocks,
    metadata: {
      totalBlocks: blocks.length,
      templateUsage: blocks.reduce((acc, block) => {
        if (block.template) {
          acc[block.template.id] = (acc[block.template.id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>),
      lastModified: new Date().toISOString()
    }
  };
  
  return JSON.stringify(exportData, null, 2);
};

/**
 * Import garden data from exported JSON
 */
export const importGardenData = (jsonString: string): Promise<{
  blocks: BlockData[];
  migrationPerformed: boolean;
  migrationSummary?: any;
}> => {
  return new Promise((resolve, reject) => {
    try {
      const importedData = JSON.parse(jsonString);
      
      // Check if this is new format
      if (importedData.version && importedData.blocks) {
        resolve({
          blocks: importedData.blocks,
          migrationPerformed: false
        });
        return;
      }
      
      // Try to migrate legacy format
      let legacyBlocks: any[] = [];
      
      if (Array.isArray(importedData)) {
        legacyBlocks = importedData;
      } else if (importedData.blocks) {
        legacyBlocks = importedData.blocks;
      }
      
      if (needsMigration(legacyBlocks)) {
        const migrationResult = autoMigrate(legacyBlocks);
        
        if (migrationResult.needsMigration && migrationResult.migratedData) {
          resolve({
            blocks: migrationResult.migratedData,
            migrationPerformed: true,
            migrationSummary: migrationResult.summary
          });
        } else {
          reject(new Error('Failed to migrate imported data'));
        }
      } else {
        resolve({
          blocks: legacyBlocks,
          migrationPerformed: false
        });
      }
      
    } catch (error) {
      reject(new Error(`Failed to import garden data: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
};

/**
 * Clear all saved data
 */
export const clearGardenData = (): Promise<void> => {
  return new Promise((resolve) => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BACKUP_KEY);
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('gardenDataCleared'));
    
    resolve();
  });
};

/**
 * Restore from backup
 */
export const restoreFromBackup = (): Promise<{
  blocks: BlockData[];
  migrationPerformed: boolean;
  migrationSummary?: any;
}> => {
  return new Promise((resolve, reject) => {
    const backupData = localStorage.getItem(BACKUP_KEY);
    
    if (!backupData) {
      reject(new Error('No backup data found'));
      return;
    }
    
    // Temporarily store current data
    const currentData = localStorage.getItem(STORAGE_KEY);
    
    try {
      // Replace current data with backup
      localStorage.setItem(STORAGE_KEY, backupData);
      
      // Load the backup data
      loadGardenData()
        .then(result => {
          resolve(result);
        })
        .catch(error => {
          // Restore current data if backup loading fails
          if (currentData) {
            localStorage.setItem(STORAGE_KEY, currentData);
          }
          reject(error);
        });
        
    } catch (error) {
      // Restore current data if anything fails
      if (currentData) {
        localStorage.setItem(STORAGE_KEY, currentData);
      }
      reject(new Error(`Failed to restore from backup: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
};

/**
 * Get storage usage information
 */
export const getStorageInfo = (): {
  hasData: boolean;
  hasBackup: boolean;
  dataSize: number;
  backupSize: number;
  lastModified?: string;
} => {
  const data = localStorage.getItem(STORAGE_KEY);
  const backup = localStorage.getItem(BACKUP_KEY);
  
  let lastModified: string | undefined;
  
  if (data) {
    try {
      const parsedData = JSON.parse(data);
      lastModified = parsedData.timestamp || parsedData.metadata?.lastModified;
    } catch {
      // Ignore parse errors
    }
  }
  
  return {
    hasData: !!data,
    hasBackup: !!backup,
    dataSize: data ? new Blob([data]).size : 0,
    backupSize: backup ? new Blob([backup]).size : 0,
    lastModified
  };
};