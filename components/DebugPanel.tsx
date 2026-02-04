'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGarden } from '@/hooks/useGarden';
import { gardenService } from '@/lib/gardenService';

export const DebugPanel: React.FC = () => {
  const { user } = useAuth();
  const { garden, loading, saveStatus } = useGarden();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const fetchDebugInfo = async () => {
      if (!user) return;

      try {
        const userGardens = await gardenService.getUserGardens(user.id);
        setDebugInfo({
          user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName
          },
          gardens: userGardens.map(g => ({
            id: g.id,
            title: g.title,
            tilesCount: g.tiles?.length || 0,
            created: g.created_at,
            updated: g.updated_at
          })),
          currentGarden: garden ? {
            id: garden.id,
            title: garden.title,
            tilesCount: garden.tiles?.length || 0
          } : null,
          loading,
          saveStatus
        });
      } catch (error) {
        setDebugInfo({ error: error.message });
      }
    };

    fetchDebugInfo();
  }, [user, garden, loading, saveStatus]);

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 max-w-md max-h-96 overflow-auto text-xs shadow-lg z-50">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
};