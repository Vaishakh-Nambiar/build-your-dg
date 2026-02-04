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

  // Load user's garden (either specific gardenId or their first garden)
  const loadUserGarden = useCallback(async () => {
    if (!user) return;
    
    console.log('[useGarden] Loading user garden:', { userId: user.id, gardenId });
    setLoading(true);
    try {
      if (gardenId) {
        // Load specific garden
        const gardenData = await gardenService.getGarden(gardenId, user.id);
        if (gardenData) {
          console.log('[useGarden] Loaded specific garden:', gardenData);
          setGarden(gardenData);
          setSaveStatus(prev => ({ ...prev, lastSaved: new Date(gardenData.updated_at) }));
        }
      } else {
        // Load user's gardens and use the first one
        const userGardens = await gardenService.getUserGardens(user.id);
        console.log('[useGarden] User gardens found:', userGardens.length);
        if (userGardens.length > 0) {
          const firstGarden = userGardens[0];
          console.log('[useGarden] Using first garden:', firstGarden);
          setGarden(firstGarden);
          setSaveStatus(prev => ({ ...prev, lastSaved: new Date(firstGarden.updated_at) }));
        } else {
          console.log('[useGarden] No gardens found for user');
        }
        // If no gardens exist, garden will remain null and can be created later
      }
    } catch (error) {
      console.error('[useGarden] Failed to load garden:', error);
      setSaveStatus(prev => ({ 
        ...prev, 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Failed to load garden' 
      }));
    } finally {
      setLoading(false);
    }
  }, [user, gardenId]);

  // Define loadGarden for backward compatibility
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

  // Define clearLocalBackup early to avoid circular dependency
  const clearLocalBackup = useCallback(() => {
    localStorage.removeItem('garden-backup');
  }, []);

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
      
      // Load user's garden
      loadUserGarden();
    }
  }, [user, loadUserGarden]);

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
    
    console.log('[useGarden] Creating garden:', { userId: user.id, gardenData });
    setLoading(true);
    try {
      const newGarden = await gardenService.createGarden(user.id, gardenData);
      console.log('[useGarden] Garden created successfully:', newGarden);
      setGarden(newGarden);
      setSaveStatus({
        status: 'saved',
        lastSaved: new Date(newGarden.created_at),
        hasUnsavedChanges: false
      });
      return newGarden;
    } catch (error) {
      console.error('[useGarden] Failed to create garden:', error);
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
    if (!garden || !user) {
      console.log('[useGarden] AutoSave skipped - no garden or user:', { garden: !!garden, user: !!user });
      return;
    }

    console.log('[useGarden] AutoSave triggered:', { 
      gardenId: garden.id, 
      tilesCount: tiles?.length, 
      title,
      layout 
    });

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
      
      if (Object.keys(changes).length === 0) {
        console.log('[useGarden] AutoSave - no changes to save');
        return;
      }

      console.log('[useGarden] AutoSave executing:', changes);
      setSaveStatus(prev => ({ ...prev, status: 'saving' }));
      
      try {
        await gardenService.autoSaveGarden(
          garden.id, 
          user.id, 
          changes.tiles || garden.tiles, 
          changes.layout || garden.layout
        );
        
        console.log('[useGarden] AutoSave successful');
        
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
        console.error('[useGarden] Auto-save failed:', error);
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
    loadGarden,
    loadUserGarden
  };
}