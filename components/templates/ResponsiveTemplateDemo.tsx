/**
 * Responsive Template Scaling Demo
 * 
 * This component demonstrates the responsive template scaling functionality
 * by showing how templates adapt to different screen sizes while maintaining
 * their aspect ratios and proportional relationships.
 */

'use client';

import React, { useState } from 'react';
import { useResponsiveTemplates } from './useResponsiveTemplates';
import { SQUARE_TEMPLATES, RECTANGLE_TEMPLATES, CIRCLE_TEMPLATES } from './definitions';
import { TileTemplate } from './types';

interface ResponsiveTemplateDemoProps {
  className?: string;
}

export const ResponsiveTemplateDemo: React.FC<ResponsiveTemplateDemoProps> = ({
  className = ''
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TileTemplate>(SQUARE_TEMPLATES[1]);
  const [simulatedWidth, setSimulatedWidth] = useState(1200);
  
  // Use the responsive templates hook with simulated width
  const responsive = useResponsiveTemplates({
    initialWidth: simulatedWidth,
    debug: true,
    containerPadding: 20
  });
  
  // Get responsive dimensions for the selected template
  const responsiveDimensions = responsive.scaleTemplate(selectedTemplate, simulatedWidth);
  const validation = responsive.validateDimensions(responsiveDimensions);
  
  // All templates for selection
  const allTemplates = [...SQUARE_TEMPLATES, ...RECTANGLE_TEMPLATES, ...CIRCLE_TEMPLATES];
  
  // Simulate different screen sizes
  const screenSizes = [
    { name: 'Mobile', width: 400 },
    { name: 'Tablet', width: 800 },
    { name: 'Desktop', width: 1200 },
    { name: 'Large Desktop', width: 1600 }
  ];
  
  return (
    <div className={`p-6 bg-white rounded-lg shadow-lg ${className}`}>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Responsive Template Scaling Demo
      </h2>
      
      {/* Template Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Select Template</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {allTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedTemplate.id === template.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium text-gray-800">
                {template.name}
              </div>
              <div className="text-xs text-gray-500">
                {template.dimensions.w}×{template.dimensions.h} • {template.category}
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Screen Size Simulation */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Simulate Screen Size</h3>
        <div className="flex flex-wrap gap-2">
          {screenSizes.map((size) => (
            <button
              key={size.name}
              onClick={() => setSimulatedWidth(size.width)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                simulatedWidth === size.width
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {size.name} ({size.width}px)
            </button>
          ))}
        </div>
        
        {/* Custom Width Slider */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Width: {simulatedWidth}px
          </label>
          <input
            type="range"
            min="320"
            max="2000"
            value={simulatedWidth}
            onChange={(e) => setSimulatedWidth(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
      
      {/* Current State Display */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Current State</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-600">Breakpoint</div>
            <div className="text-lg font-bold text-blue-600">
              {responsive.currentBreakpoint.name.toUpperCase()}
            </div>
            <div className="text-xs text-gray-500">
              {responsive.currentBreakpoint.cols} columns
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-600">Original Dimensions</div>
            <div className="text-lg font-bold text-gray-800">
              {selectedTemplate.dimensions.w}×{selectedTemplate.dimensions.h}
            </div>
            <div className="text-xs text-gray-500">
              Aspect Ratio: {selectedTemplate.aspectRatio.toFixed(2)}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-600">Responsive Dimensions</div>
            <div className="text-lg font-bold text-green-600">
              {responsiveDimensions.w}×{responsiveDimensions.h}
            </div>
            <div className="text-xs text-gray-500">
              Ratio: {(responsiveDimensions.w / responsiveDimensions.h).toFixed(2)}
            </div>
          </div>
        </div>
        
        {/* Validation Status */}
        <div className="mt-4">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            validation.isValid 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {validation.isValid ? '✓ Valid' : '✗ Invalid'}
          </div>
          {!validation.isValid && (
            <div className="mt-2 text-sm text-red-600">
              {validation.errors.join(', ')}
            </div>
          )}
        </div>
      </div>
      
      {/* Visual Representation */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Visual Representation</h3>
        <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-2">
            Grid: {responsive.currentBreakpoint.cols} columns × {responsive.currentBreakpoint.rowHeight}px rows
          </div>
          
          {/* Grid Visualization */}
          <div 
            className="relative bg-gray-100 rounded"
            style={{
              width: '100%',
              maxWidth: '600px',
              height: '300px'
            }}
          >
            {/* Grid Lines */}
            <div className="absolute inset-0 grid opacity-20" 
                 style={{ 
                   gridTemplateColumns: `repeat(${responsive.currentBreakpoint.cols}, 1fr)`,
                   gap: '2px'
                 }}>
              {Array.from({ length: responsive.currentBreakpoint.cols * 6 }).map((_, i) => (
                <div key={i} className="bg-gray-400 rounded-sm"></div>
              ))}
            </div>
            
            {/* Template Visualization */}
            <div 
              className={`absolute top-2 left-2 rounded-lg border-2 border-blue-500 flex items-center justify-center text-white font-bold ${
                selectedTemplate.category === 'circle' ? 'rounded-full' : ''
              }`}
              style={{
                width: `${(responsiveDimensions.w / responsive.currentBreakpoint.cols) * 100}%`,
                height: `${Math.min(responsiveDimensions.h * 40, 280)}px`,
                backgroundColor: selectedTemplate.category === 'square' ? '#3B82F6' :
                                selectedTemplate.category === 'rectangle' ? '#10B981' : '#F59E0B'
              }}
            >
              <div className="text-center">
                <div className="text-sm">{selectedTemplate.name}</div>
                <div className="text-xs opacity-80">
                  {responsiveDimensions.w}×{responsiveDimensions.h}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Responsive Comparison */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Cross-Breakpoint Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {screenSizes.map((size) => {
            const dimensions = responsive.scaleTemplate(selectedTemplate, size.width);
            const breakpoint = responsive.getGridConfig();
            
            return (
              <div key={size.name} className="p-3 border rounded-lg">
                <div className="font-medium text-gray-800">{size.name}</div>
                <div className="text-sm text-gray-600">{size.width}px</div>
                <div className="text-lg font-bold text-blue-600 mt-1">
                  {dimensions.w}×{dimensions.h}
                </div>
                <div className="text-xs text-gray-500">
                  Ratio: {(dimensions.w / dimensions.h).toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Debug Information */}
      {responsive.debugInfo && Object.keys(responsive.debugInfo).length > 0 && (
        <div className="p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-sm">
          <h3 className="text-lg font-semibold mb-3 text-green-300">Debug Information</h3>
          <pre>{JSON.stringify(responsive.debugInfo, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};