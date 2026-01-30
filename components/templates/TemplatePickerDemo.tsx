/**
 * Template Picker Demo Component
 * 
 * This component demonstrates the TemplatePicker functionality
 * and can be used for testing and validation.
 */

'use client';

import React, { useState } from 'react';
import { TemplatePicker, TileTemplate, useTemplatePicker } from './index';
import { BlockType } from '../Block';

export const TemplatePickerDemo: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<TileTemplate | null>(null);
  const [selectedTileType, setSelectedTileType] = useState<BlockType>('text');
  const [createdTiles, setCreatedTiles] = useState<Array<{
    template: TileTemplate;
    tileType: BlockType;
    position: { x: number; y: number };
  }>>([]);

  const {
    isPickerOpen,
    openPicker,
    closePicker,
    handleTemplateSelect
  } = useTemplatePicker({
    onCreateTile: (template, tileType, position) => {
      const newTile = {
        template,
        tileType,
        position: position || { x: 0, y: 0 }
      };
      setCreatedTiles(prev => [...prev, newTile]);
      setSelectedTemplate(template);
      setSelectedTileType(tileType);
    }
  });

  const handleManualSelect = (template: TileTemplate, tileType: BlockType) => {
    setSelectedTemplate(template);
    setSelectedTileType(tileType);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Template Picker Demo</h1>
      
      {/* Demo Controls */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Demo Controls</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => openPicker()}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Open Template Picker
          </button>
          <button
            onClick={() => openPicker('project')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Open for Project Tiles
          </button>
          <button
            onClick={() => openPicker('image')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Open for Image Tiles (Circle Only)
          </button>
          <button
            onClick={() => setCreatedTiles([])}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Clear Created Tiles
          </button>
        </div>
      </div>

      {/* Selected Template Display */}
      {selectedTemplate && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Last Selected Template</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Template Info</h3>
              <ul className="text-sm space-y-1">
                <li><strong>Name:</strong> {selectedTemplate.name}</li>
                <li><strong>Category:</strong> {selectedTemplate.category}</li>
                <li><strong>Dimensions:</strong> {selectedTemplate.dimensions.w}×{selectedTemplate.dimensions.h}</li>
                <li><strong>Aspect Ratio:</strong> {selectedTemplate.aspectRatio}</li>
                <li><strong>Tile Type:</strong> {selectedTileType}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
              <div className="mt-2">
                <h4 className="font-medium text-sm">Allowed Tile Types:</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedTemplate.allowedTileTypes.map(type => (
                    <span key={type} className="px-2 py-1 bg-white rounded text-xs border">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Created Tiles Display */}
      {createdTiles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Created Tiles ({createdTiles.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {createdTiles.map((tile, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-sm">{tile.template.name}</h3>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                    {tile.tileType}
                  </span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Size: {tile.template.dimensions.w}×{tile.template.dimensions.h}</div>
                  <div>Category: {tile.template.category}</div>
                  <div>Position: ({tile.position.x}, {tile.position.y})</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Template Picker Component */}
      <TemplatePicker
        isOpen={isPickerOpen}
        onClose={closePicker}
        onSelectTemplate={handleTemplateSelect}
        config={{
          showThumbnails: true,
          groupByCategory: true,
          filterByTileType: true,
          showDescriptions: true
        }}
      />

      {/* Manual Template Picker for Testing */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Manual Template Selection</h2>
        <p className="text-sm text-gray-600 mb-4">
          This section allows you to test the template picker with different configurations.
        </p>
        <TemplatePicker
          isOpen={false}
          onClose={() => {}}
          onSelectTemplate={handleManualSelect}
          config={{
            showThumbnails: true,
            groupByCategory: true,
            filterByTileType: false,
            showDescriptions: true
          }}
        />
      </div>
    </div>
  );
};