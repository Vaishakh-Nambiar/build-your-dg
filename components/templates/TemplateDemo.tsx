/**
 * Template System Demo Component
 * 
 * This component demonstrates the template system functionality
 * and can be used for testing and validation.
 */

'use client';

import React, { useState } from 'react';
import {
  getTemplateCategories,
  getTemplatesByCategory,
  getTemplatesForTileType,
  validateTemplateForTileType,
  getDefaultTemplateForTileType,
  exportTemplateSystemState,
  TileTemplate,
  TemplateCategory,
} from './index';
import { BlockType } from '../Block';

export const TemplateDemo: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('square');
  const [selectedTileType, setSelectedTileType] = useState<BlockType>('text');
  const [selectedTemplate, setSelectedTemplate] = useState<TileTemplate | null>(null);

  const categories = getTemplateCategories();
  const tileTypes: BlockType[] = ['text', 'thought', 'quote', 'image', 'video', 'project', 'status'];
  
  const templatesByCategory = getTemplatesByCategory(selectedCategory);
  const templatesForTileType = getTemplatesForTileType(selectedTileType);
  const defaultTemplate = getDefaultTemplateForTileType(selectedTileType);
  const systemState = exportTemplateSystemState();

  const handleTemplateSelect = (template: TileTemplate) => {
    setSelectedTemplate(template);
  };

  const getValidationStatus = (template: TileTemplate, tileType: BlockType) => {
    const validation = validateTemplateForTileType(template, tileType);
    return validation.isValid ? '✅' : '❌';
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Template System Demo</h1>
      
      {/* System State Overview */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">System State</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <strong>Total Templates:</strong> {systemState.totalTemplates}
          </div>
          <div>
            <strong>Square:</strong> {systemState.templatesByCategory.square}
          </div>
          <div>
            <strong>Rectangle:</strong> {systemState.templatesByCategory.rectangle}
          </div>
          <div>
            <strong>Circle:</strong> {systemState.templatesByCategory.circle}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel: Category Browser */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
          
          {/* Category Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as TemplateCategory)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Templates in Category */}
          <div className="space-y-3">
            {templatesByCategory.map(template => (
              <div
                key={template.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-gray-600">{template.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {template.dimensions.w}×{template.dimensions.h} • Ratio: {template.aspectRatio}
                    </p>
                  </div>
                  <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {template.category}
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Allowed: {template.allowedTileTypes.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Tile Type Browser */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Browse by Tile Type</h2>
          
          {/* Tile Type Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select Tile Type:</label>
            <select
              value={selectedTileType}
              onChange={(e) => setSelectedTileType(e.target.value as BlockType)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {tileTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Default Template */}
          {defaultTemplate && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800">Default Template</h3>
              <p className="text-sm text-green-700">
                {defaultTemplate.name} ({defaultTemplate.dimensions.w}×{defaultTemplate.dimensions.h})
              </p>
            </div>
          )}

          {/* Available Templates */}
          <div className="space-y-3">
            <h3 className="font-medium">Available Templates:</h3>
            {templatesForTileType.map(template => (
              <div
                key={template.id}
                className="p-3 border border-gray-200 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-gray-600">
                      {template.dimensions.w}×{template.dimensions.h} • {template.category}
                    </p>
                  </div>
                  <div className="text-lg">
                    {getValidationStatus(template, selectedTileType)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Template Details */}
      {selectedTemplate && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Selected Template Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Basic Info</h3>
              <ul className="text-sm space-y-1">
                <li><strong>ID:</strong> {selectedTemplate.id}</li>
                <li><strong>Name:</strong> {selectedTemplate.name}</li>
                <li><strong>Category:</strong> {selectedTemplate.category}</li>
                <li><strong>Dimensions:</strong> {selectedTemplate.dimensions.w}×{selectedTemplate.dimensions.h}</li>
                <li><strong>Aspect Ratio:</strong> {selectedTemplate.aspectRatio}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Compatibility</h3>
              <div className="text-sm space-y-1">
                <div><strong>Allowed Tile Types:</strong></div>
                <div className="flex flex-wrap gap-1">
                  {selectedTemplate.allowedTileTypes.map(type => (
                    <span key={type} className="px-2 py-1 bg-white rounded text-xs">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Matrix */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Template-Tile Type Compatibility Matrix</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 p-2 text-left">Template</th>
                {tileTypes.map(type => (
                  <th key={type} className="border border-gray-300 p-2 text-center text-xs">
                    {type}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {templatesByCategory.map(template => (
                <tr key={template.id}>
                  <td className="border border-gray-300 p-2 font-medium text-sm">
                    {template.name}
                  </td>
                  {tileTypes.map(type => (
                    <td key={type} className="border border-gray-300 p-2 text-center">
                      {getValidationStatus(template, type)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};