'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { gardenService, type CreateGardenData, type UpdateGardenData } from '@/lib/gardenService';
import { useAuth } from './useAuth';
import type { Database } from '@/lib/supabase';

type Garden = Database['public']['Tables']['gardens']['Row'];

export interface SaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
  hasUnsavedChanges?: boolean;
  error?: string;
}

export interface UseGardenOptions {
  gardenId?: string;
  autoSaveDelay?: number; // milliseconds
  localBackupInterval?: number; // milliseconds
}

export function useGarden(options: UseGardenOptions = {}) {
  const { user } = useAuth();
  const { gardenId, autoSaveDelay = 2000, localBackupInterval = 120000 } = options; // 2s auto-save, 2min backup
  
  const [garden, setGarden] = useState<Garden | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({
    status: 'idle',
    hasUnsavedChanges: false
  });
  
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();
  const localBackupIntervalRef = useRef<NodeJS.Timeout>();
  const pendingChangesRef = useRef<{
    tiles?: any[];
    layout?: any;
    title?: string;
  }>({});

  // Define loadGarden first before using it in useEffect
  const loadGarden = useCallback(async (id: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const gardenData = await gardenService.getGarden(id, user.id);
      if (gardenData) {
        setGarden(gardenData);
        setSaveStatus(prev => ({ ...prev, lastSaved: new Date(gardenData.updated_at) }));
      }
    } catch (error) {
      console.error('Failed to load garden:', error);
      setSaveStatus(prev => ({ 
        ...prev, 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Failed to load garden' 
      }));
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load garden on mount and clear localStorage on user change
  useEffect(() => {
    if (user) {
      // Clear localStorage if user changed
      const lastUserId = localStorage.getItem('last-garden-user-id');
      if (lastUserId && lastUserId !== user.id) {
        localStorage.removeItem('garden-backup');
        localStorage.setItem('last-garden-user-id', user.id);
      } else if (!lastUserId) {
        localStorage.setItem('last-garden-user-id', user.id);
      }
      
      if (gardenId) {
        loadGarden(gardenId);
      }
    }
  }, [gardenId, user, loadGarden]);

  // Set up local backup interval
  useEffect(() => {
    if (localBackupInterval > 0) {
      localBackupIntervalRef.current = setInterval(() => {
        backupToLocalStorage();
      }, localBackupInterval);

      return () => {
        if (localBackupIntervalRef.current) {
          clearInterval(localBackupIntervalRef.current);
        }
      };
    }
  }, [localBackupInterval]); // Removed backupToLocalStorage from dependencies

  // Check for local backup on mount
  useEffect(() => {
    checkForLocalBackup();
  }, []); // Removed checkForLocalBackup from dependencies

  const createGarden = useCallback(async (gardenData: CreateGardenData): Promise<Garden | null> => {
    if (!user) return null;
    
    setLoading(true);
    try {
      const newGarden = await gardenService.createGarden(user.id, gardenData);
      setGarden(newGarden);
      setSaveStatus({
        status: 'saved',
        lastSaved: new Date(newGarden.created_at),
        hasUnsavedChanges: false
      });
      return newGarden;
    } catch (error) {
      console.error('Failed to create garden:', error);
      setSaveStatus(prev => ({ 
        ...prev, 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Failed to create garden' 
      }));
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateGarden = useCallback(async (updates: UpdateGardenData): Promise<void> => {
    if (!garden || !user) return;
    
    setSaveStatus(prev => ({ ...prev, status: 'saving' }));
    
    try {
      const updatedGarden = await gardenService.updateGarden(garden.id, user.id, updates);
      setGarden(updatedGarden);
      setSaveStatus({
        status: 'saved',
        lastSaved: new Date(updatedGarden.updated_at),
        hasUnsavedChanges: false
      });
      
      // Clear pending changes
      pendingChangesRef.current = {};
      
      // Clear local backup since we've saved
      clearLocalBackup();
    } catch (error) {
      console.error('Failed to update garden:', error);
      setSaveStatus(prev => ({ 
        ...prev, 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Failed to save garden' 
      }));
    }
  }, [garden, user]);

  const autoSave = useCallback((tiles?: any[], layout?: any, title?: string) => {
    if (!garden || !user) return;

    // Update pending changes
    if (tiles !== undefined) pendingChangesRef.current.tiles = tiles;
    if (layout !== undefined) pendingChangesRef.current.layout = layout;
    if (title !== undefined) pendingChangesRef.current.title = title;

    // Mark as having unsaved changes
    setSaveStatus(prev => ({ ...prev, hasUnsavedChanges: true }));

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    autoSaveTimeoutRef.current = setTimeout(async () => {
      const changes = { ...pendingChangesRef.current };
      
      if (Object.keys(changes).length === 0) return;

      setSaveStatus(prev => ({ ...prev, status: 'saving' }));
      
      try {
        await gardenService.autoSaveGarden(
          garden.id, 
          user.id, 
          changes.tiles || garden.tiles, 
          changes.layout || garden.layout
        );
        
        // Update local garden state
        setGarden(prev => prev ? {
          ...prev,
          tiles: changes.tiles || prev.tiles,
          layout: changes.layout || prev.layout,
          title: changes.title || prev.title,
          updated_at: new Date().toISOString()
        } : null);
        
        setSaveStatus({
          status: 'saved',
          lastSaved: new Date(),
          hasUnsavedChanges: false
        });
        
        // Clear pending changes
        pendingChangesRef.current = {};
        
        // Clear local backup since we've saved
        clearLocalBackup();
      } catch (error) {
        console.error('Auto-save failed:', error);
        setSaveStatus(prev => ({ 
          ...prev, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Auto-save failed' 
        }));
      }
    }, autoSaveDelay);
  }, [garden, user, autoSaveDelay]);

  const manualSave = useCallback(async (): Promise<void> => {
    if (!garden || !user) return;

    const changes = { ...pendingChangesRef.current };
    
    // If no pending changes, just update the save status
    if (Object.keys(changes).length === 0) {
      setSaveStatus(prev => ({ ...prev, status: 'saved', hasUnsavedChanges: false }));
      return;
    }

    await updateGarden(changes);
  }, [garden, user, updateGarden]);

  const publishGarden = useCallback(async (slug: string): Promise<void> => {
    if (!garden || !user) return;
    
    setLoading(true);
    try {
      const updatedGarden = await gardenService.publishGarden(garden.id, user.id, slug);
      setGarden(updatedGarden);
    } catch (error) {
      console.error('Failed to publish garden:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [garden, user]);

  const unpublishGarden = useCallback(async (): Promise<void> => {
    if (!garden || !user) return;
    
    setLoading(true);
    try {
      const updatedGarden = await gardenService.unpublishGarden(garden.id, user.id);
      setGarden(updatedGarden);
    } catch (error) {
      console.error('Failed to unpublish garden:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [garden, user]);

  const togglePublic = useCallback(async (): Promise<void> => {
    if (!garden) return;
    
    if (garden.is_public) {
      await unpublishGarden();
    } else {
      // Generate a slug from the garden title
      const baseSlug = garden.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      const uniqueSlug = await gardenService.generateUniqueSlug(baseSlug, user!.id);
      await publishGarden(uniqueSlug);
    }
  }, [garden, user, publishGarden, unpublishGarden]);

  const backupToLocalStorage = useCallback(() => {
    if (!garden) return;
    
    const backup = {
      gardenId: garden.id,
      tiles: pendingChangesRef.current.tiles || garden.tiles,
      layout: pendingChangesRef.current.layout || garden.layout,
      title: pendingChangesRef.current.title || garden.title,
      timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('garden-backup', JSON.stringify(backup));
  }, [garden]);

  const checkForLocalBackup = useCallback(() => {
    const backup = localStorage.getItem('garden-backup');
    if (!backup) return null;
    
    try {
      return JSON.parse(backup);
    } catch {
      return null;
    }
  }, []);

  const restoreFromLocalBackup = useCallback(() => {
    const backup = checkForLocalBackup();
    if (!backup || !garden || backup.gardenId !== garden.id) return false;
    
    // Update pending changes
    pendingChangesRef.current = {
      tiles: backup.tiles,
      layout: backup.layout,
      title: backup.title
    };
    
    setSaveStatus(prev => ({ ...prev, hasUnsavedChanges: true }));
    
    return true;
  }, [garden, checkForLocalBackup]);

  const clearLocalBackup = useCallback(() => {
    localStorage.removeItem('garden-backup');
  }, []);

  const getPublicUrl = useCallback(() => {
    if (!garden?.is_public || !garden.slug) return null;
    return `${window.location.origin}/${garden.slug}`;
  }, [garden]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      if (localBackupIntervalRef.current) {
        clearInterval(localBackupIntervalRef.current);
      }
    };
  }, []);

  return {
    garden,
    loading,
    saveStatus,
    createGarden,
    updateGarden,
    autoSave,
    manualSave,
    publishGarden,
    unpublishGarden,
    togglePublic,
    backupToLocalStorage,
    checkForLocalBackup,
    restoreFromLocalBackup,
    clearLocalBackup,
    getPublicUrl,
    loadGarden
  };
}