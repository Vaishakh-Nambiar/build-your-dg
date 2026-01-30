/**
 * Circle Template Shape Preservation Demo
 * 
 * This demo component showcases the circle template shape preservation
 * functionality across different screen sizes and responsive breakpoints.
 * 
 * Requirements 5.5: Circle templates maintain their circular appearance at all sizes
 * Requirements 5.2: Implement responsive circle scaling
 */

import React, { useState, useEffect } from 'react';
import { CIRCLE_TEMPLATES } from './definitions';
import { useTemplateStyles, useTemplateBreakpoint } from './useTemplateStyles';
import { useCircleTemplateCSS } from './circleTemplateCSS';
import { TileTemplate } from './types';

export const CircleTemplateDemo: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<TileTemplate>(CIRCLE_TEMPLATES[0]);
  const [simulatedWidth, setSimulatedWidth] = useState<number>(1200);
  
  // Auto-inject circle template CSS
  const { isInjected } = useCircleTemplateCSS();
  
  // Get current breakpoint info
  const breakpointInfo = useTemplateBreakpoint();
  
  // Get template styles for the selected template
  const templateStyles = useTemplateStyles({
    template: selectedTemplate,
    enableResponsive: true
  });

  // Simulate different screen sizes
  const screenSizes = [
    { name: 'Mobile (XS)', width: 400 },
    { name: 'Mobile (SM)', width: 600 },
    { name: 'Tablet (MD)', width: 800 },
    { name: 'Desktop (LG)', width: 1000 },
    { name: 'Desktop (XL)', width: 1400 },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Circle Template Shape Preservation Demo</h1>
      
      {/* CSS Injection Status */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Circle CSS Injected:</strong> {isInjected ? '✅ Yes' : '❌ No'}
          </div>
          <div>
            <strong>Current Breakpoint:</strong> {breakpointInfo.breakpoint} ({breakpointInfo.screenWidth}px)
          </div>
          <div>
            <strong>Device Type:</strong> {
              breakpointInfo.isMobile ? 'Mobile' : 
              breakpointInfo.isTablet ? 'Tablet' : 'Desktop'
            }
          </div>
          <div>
            <strong>Template Applied:</strong> {templateStyles.isCircle ? '🔵 Circle' : '⬜ Standard'}
          </div>
        </div>
      </div>

      {/* Template Selection */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Select Circle Template</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CIRCLE_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className={`p-4 border rounded-lg transition-all ${
                selectedTemplate.id === template.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-left">
                <h3 className="font-medium">{template.name}</h3>
                <p className="text-sm text-gray-600">{template.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {template.dimensions.w}×{template.dimensions.h} • Ratio: {template.aspectRatio}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Screen Size Simulation */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Simulate Screen Sizes</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {screenSizes.map((size) => (
            <button
              key={size.name}
              onClick={() => setSimulatedWidth(size.width)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                simulatedWidth === size.width
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {size.name}
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-600">
          Current simulated width: <strong>{simulatedWidth}px</strong>
        </div>
      </div>

      {/* Circle Template Showcase */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Circle Template Showcase</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Image Circle Example */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-3">Image Circle Template</h3>
            <div 
              className={`mx-auto bg-gradient-to-br from-blue-400 to-purple-600 ${templateStyles.containerClassName}`}
              style={{
                ...templateStyles.containerStyle,
                width: '200px',
                height: '200px'
              }}
            >
              <div 
                className={`bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold ${templateStyles.contentClassName}`}
                style={templateStyles.contentStyle}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">🖼️</div>
                  <div className="text-sm">Image</div>
                </div>
              </div>
            </div>
          </div>

          {/* Video Circle Example */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-medium mb-3">Video Circle Template</h3>
            <div 
              className={`mx-auto bg-gradient-to-br from-red-400 to-pink-600 ${templateStyles.containerClassName}`}
              style={{
                ...templateStyles.containerStyle,
                width: '200px',
                height: '200px'
              }}
            >
              <div 
                className={`bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold ${templateStyles.contentClassName}`}
                style={templateStyles.contentStyle}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">🎥</div>
                  <div className="text-sm">Video</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Scaling Demonstration */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Responsive Scaling Demonstration</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {screenSizes.map((size) => {
            const sizeStyles = useTemplateStyles({
              template: selectedTemplate,
              enableResponsive: true
            });
            
            // Calculate size based on screen width simulation
            const scaleFactor = size.width <= 600 ? 0.6 : size.width <= 900 ? 0.8 : 1.0;
            const circleSize = Math.max(60, 120 * scaleFactor);
            
            return (
              <div key={size.name} className="text-center">
                <div className="text-xs font-medium mb-2">{size.name}</div>
                <div 
                  className={`mx-auto bg-gradient-to-br from-green-400 to-blue-500 ${sizeStyles.containerClassName}`}
                  style={{
                    ...sizeStyles.containerStyle,
                    width: `${circleSize}px`,
                    height: `${circleSize}px`
                  }}
                >
                  <div 
                    className={`bg-white/30 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xs ${sizeStyles.contentClassName}`}
                    style={sizeStyles.contentStyle}
                  >
                    {Math.round(circleSize)}px
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{size.width}px</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CSS Properties Display */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Applied CSS Properties</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Container Styles */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Container Styles</h3>
            <div className="text-sm space-y-1">
              <div><strong>Classes:</strong> <code className="bg-white px-1 rounded">{templateStyles.containerClassName || 'none'}</code></div>
              <div><strong>Aspect Ratio:</strong> <code className="bg-white px-1 rounded">{templateStyles.containerStyle.aspectRatio || 'auto'}</code></div>
              <div><strong>Display:</strong> <code className="bg-white px-1 rounded">{templateStyles.containerStyle.display || 'block'}</code></div>
              <div><strong>Min Width:</strong> <code className="bg-white px-1 rounded">{templateStyles.containerStyle.minWidth || 'auto'}</code></div>
            </div>
          </div>

          {/* Content Styles */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">Content Styles</h3>
            <div className="text-sm space-y-1">
              <div><strong>Classes:</strong> <code className="bg-white px-1 rounded">{templateStyles.contentClassName || 'none'}</code></div>
              <div><strong>Border Radius:</strong> <code className="bg-white px-1 rounded">{templateStyles.contentStyle.borderRadius || 'none'}</code></div>
              <div><strong>Overflow:</strong> <code className="bg-white px-1 rounded">{templateStyles.contentStyle.overflow || 'visible'}</code></div>
              <div><strong>Transition:</strong> <code className="bg-white px-1 rounded">{templateStyles.contentStyle.transition || 'none'}</code></div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive CSS Variables */}
      {templateStyles.responsiveCSS && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Responsive CSS Variables</h2>
          <div className="p-4 bg-gray-50 rounded-lg">
            <pre className="text-xs overflow-x-auto">
              <code>{templateStyles.responsiveCSS}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Usage Instructions</h2>
        <div className="text-sm space-y-2">
          <p>
            <strong>1. Template Selection:</strong> Choose different circle templates to see how they maintain their circular shape.
          </p>
          <p>
            <strong>2. Screen Size Simulation:</strong> Click different screen sizes to see responsive scaling in action.
          </p>
          <p>
            <strong>3. CSS Properties:</strong> Observe how the CSS properties change to maintain circular appearance.
          </p>
          <p>
            <strong>4. Aspect Ratio:</strong> Notice how all circle templates maintain a perfect 1:1 aspect ratio.
          </p>
        </div>
      </div>
    </div>
  );
};