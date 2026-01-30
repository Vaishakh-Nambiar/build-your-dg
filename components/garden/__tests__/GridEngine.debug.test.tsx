/**
 * GridEngine Debug Visualization Tests
 * 
 * Tests to verify the enhanced debug visualization system meets requirements 9.1-9.5
 * of the garden-builder-refactor spec.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { GridEngine } from '../GridEngine';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock react-grid-layout
jest.mock('react-grid-layout', () => {
  return function MockReactGridLayout(props: any) {
    return (
      <div 
        data-testid="mock-grid-layout"
        data-is-resizable={props.isResizable}
        data-resize-handles={JSON.stringify(props.resizeHandles)}
        data-is-draggable={props.isDraggable}
      >
        {props.children}
      </div>
    );
  };
});

describe('GridEngine Enhanced Debug Visualization', () => {
  const defaultProps = {
    children: <div>Test Child</div>,
    isEditMode: true,
    onLayoutChange: jest.fn(),
    currentLayout: [
      { i: '1', x: 0, y: 0, w: 2, h: 2 },
      { i: '2', x: 2, y: 0, w: 3, h: 1 },
      { i: '3', x: 0, y: 2, w: 1, h: 1 }
    ],
    showGrid: true,
    isDebugMode: true,
    sidePadding: 64,
  };

  test('should display gap and size markers when debug mode is enabled', () => {
    const { container } = render(<GridEngine {...defaultProps} />);
    
    // Check for gap markers between columns
    const columnGapMarkers = container.querySelectorAll('[class*="bg-red-100/50"][class*="border-red-300/30"]');
    expect(columnGapMarkers.length).toBeGreaterThan(0);
    
    // Check for gap size indicators
    const gapSizeIndicators = container.querySelectorAll('[class*="text-red-600"]');
    expect(gapSizeIndicators.length).toBeGreaterThan(0);
  });

  test('should show borders around each row in the grid', () => {
    const { container } = render(<GridEngine {...defaultProps} />);
    
    // Check for row borders
    const rowBorders = container.querySelectorAll('[class*="border-green-400/40"]');
    expect(rowBorders.length).toBeGreaterThan(0);
  });

  test('should display numerical indicators for row and column dimensions', () => {
    const { container } = render(<GridEngine {...defaultProps} />);
    
    // Check for column dimension indicators
    const columnDimensions = container.querySelectorAll('[class*="text-black/40"]');
    expect(columnDimensions.length).toBeGreaterThan(0);
    
    // Check for row dimension indicators
    const rowDimensions = container.querySelectorAll('[class*="text-green-700"]');
    expect(rowDimensions.length).toBeGreaterThan(0);
  });

  test('should highlight grid boundaries and spacing measurements', () => {
    const { container } = render(<GridEngine {...defaultProps} />);
    
    // Check for grid boundary highlighting
    const gridBoundary = container.querySelector('[class*="border-purple-500/50"]');
    expect(gridBoundary).toBeInTheDocument();
    
    // Check for grid boundary label
    expect(container.querySelector('[class*="bg-purple-100"]')).toBeInTheDocument();
    
    // Check for spacing measurements by looking for the text content
    const spacingMeasurements = Array.from(container.querySelectorAll('*')).filter(
      el => el.textContent?.includes('Container:')
    );
    expect(spacingMeasurements.length).toBeGreaterThan(0);
  });

  test('should provide clear visual distinction between content areas and grid structure', () => {
    const { container } = render(<GridEngine {...defaultProps} />);
    
    // Check for different colored borders and backgrounds for different elements
    const columnBorders = container.querySelectorAll('[class*="border-blue-400/40"]');
    const rowBorders = container.querySelectorAll('[class*="border-green-400/40"]');
    const gapMarkers = container.querySelectorAll('[class*="bg-red-100/50"]');
    const gridBoundary = container.querySelector('[class*="border-purple-500/50"]');
    
    expect(columnBorders.length).toBeGreaterThan(0);
    expect(rowBorders.length).toBeGreaterThan(0);
    expect(gapMarkers.length).toBeGreaterThan(0);
    expect(gridBoundary).toBeInTheDocument();
  });

  test('should not show enhanced debug features when debug mode is disabled', () => {
    const { container } = render(<GridEngine {...defaultProps} isDebugMode={false} />);
    
    // Row borders should not be present
    const rowBorders = container.querySelectorAll('[class*="border-green-400/40"]');
    expect(rowBorders.length).toBe(0);
    
    // Gap markers should not be present
    const gapMarkers = container.querySelectorAll('[class*="bg-red-100/50"]');
    expect(gapMarkers.length).toBe(0);
    
    // Grid boundary highlighting should not be present
    const gridBoundary = container.querySelector('[class*="border-purple-500/50"]');
    expect(gridBoundary).not.toBeInTheDocument();
  });

  test('should not show any debug features when showGrid is disabled', () => {
    const { container } = render(<GridEngine {...defaultProps} showGrid={false} />);
    
    // No debug overlay should be present
    const debugOverlay = container.querySelector('[class*="absolute inset-0 pointer-events-none z-10"]');
    expect(debugOverlay).not.toBeInTheDocument();
  });

  test('should show row numbers and dimensions', () => {
    const { container } = render(<GridEngine {...defaultProps} />);
    
    // Check for row number indicators (R1, R2, etc.)
    const rowNumbers = container.querySelectorAll('[class*="bg-green-100"]');
    expect(rowNumbers.length).toBeGreaterThan(0);
  });

  test('should display column numbers and dimensions', () => {
    const { container } = render(<GridEngine {...defaultProps} />);
    
    // Check for column numbers (1, 2, 3, etc.)
    const columnNumbers = container.querySelectorAll('[class*="text-center py-2"]');
    expect(columnNumbers.length).toBeGreaterThan(0);
  });

  test('should calculate and display container dimensions', () => {
    const { container } = render(<GridEngine {...defaultProps} />);
    
    // Check for container dimension display by looking for the text content
    const containerDimensions = Array.from(container.querySelectorAll('*')).filter(
      el => el.textContent?.includes('Container:')
    );
    expect(containerDimensions.length).toBeGreaterThan(0);
  });
});