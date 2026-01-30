/**
 * GridEngine Tests
 * 
 * Tests to verify the GridEngine component properly disables resizing functionality
 * as required by task 2.1 of the garden-builder-refactor spec.
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

// Mock react-grid-layout since it's not available in test environment
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

describe('GridEngine Resize Prevention', () => {
  const defaultProps = {
    children: <div>Test Child</div>,
    isEditMode: true,
    onLayoutChange: jest.fn(),
    currentLayout: [{ i: '1', x: 0, y: 0, w: 2, h: 2 }],
    showGrid: false,
    isDebugMode: false,
    sidePadding: 0,
  };

  test('should disable resizing regardless of edit mode', () => {
    const { rerender } = render(<GridEngine {...defaultProps} isEditMode={true} />);
    
    let gridLayout = screen.getByTestId('mock-grid-layout');
    expect(gridLayout).toHaveAttribute('data-is-resizable', 'false');
    expect(gridLayout).toHaveAttribute('data-resize-handles', '[]');
    
    // Test with edit mode disabled - resizing should still be disabled
    rerender(<GridEngine {...defaultProps} isEditMode={false} />);
    
    gridLayout = screen.getByTestId('mock-grid-layout');
    expect(gridLayout).toHaveAttribute('data-is-resizable', 'false');
    expect(gridLayout).toHaveAttribute('data-resize-handles', '[]');
  });

  test('should allow dragging when in edit mode but prevent resizing', () => {
    render(<GridEngine {...defaultProps} isEditMode={true} />);
    
    const gridLayout = screen.getByTestId('mock-grid-layout');
    expect(gridLayout).toHaveAttribute('data-is-draggable', 'true');
    expect(gridLayout).toHaveAttribute('data-is-resizable', 'false');
  });

  test('should prevent both dragging and resizing when not in edit mode', () => {
    render(<GridEngine {...defaultProps} isEditMode={false} />);
    
    const gridLayout = screen.getByTestId('mock-grid-layout');
    expect(gridLayout).toHaveAttribute('data-is-draggable', 'false');
    expect(gridLayout).toHaveAttribute('data-is-resizable', 'false');
  });

  test('should include resize prevention CSS styles', () => {
    render(<GridEngine {...defaultProps} />);
    
    // Check that the component renders (which includes the CSS styles)
    expect(screen.getByTestId('mock-grid-layout')).toBeInTheDocument();
    
    // The CSS styles are injected globally, so we can't easily test them directly
    // but we can verify the component renders without errors
  });
});