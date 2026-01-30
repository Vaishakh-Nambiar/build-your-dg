/**
 * Template Picker Component Tests
 * 
 * Unit tests for the TemplatePicker component functionality.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TemplatePicker } from '../TemplatePicker';
import { TileTemplate } from '../types';
import { BlockType } from '../../Block';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('TemplatePicker', () => {
  const mockOnClose = jest.fn();
  const mockOnSelectTemplate = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSelectTemplate: mockOnSelectTemplate,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open', () => {
    render(<TemplatePicker {...defaultProps} />);
    
    expect(screen.getByText('Choose Template')).toBeInTheDocument();
    expect(screen.getByText('Select a template for your text tile')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<TemplatePicker {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Choose Template')).not.toBeInTheDocument();
  });

  it('displays tile type selector', () => {
    render(<TemplatePicker {...defaultProps} />);
    
    // Check for tile type buttons
    expect(screen.getByText('Text')).toBeInTheDocument();
    expect(screen.getByText('Project')).toBeInTheDocument();
    expect(screen.getByText('Image')).toBeInTheDocument();
    expect(screen.getByText('Video')).toBeInTheDocument();
  });

  it('displays category filters', () => {
    render(<TemplatePicker {...defaultProps} />);
    
    expect(screen.getByText('All')).toBeInTheDocument();
    // Category buttons have icons, so we need to check for buttons containing the text
    const buttons = screen.getAllByRole('button');
    const hasSquareButton = buttons.some(button => button.textContent?.includes('Square'));
    const hasRectangleButton = buttons.some(button => button.textContent?.includes('Rectangle'));
    const hasCircleButton = buttons.some(button => button.textContent?.includes('Circle'));
    
    expect(hasSquareButton).toBe(true);
    expect(hasRectangleButton).toBe(true);
    expect(hasCircleButton).toBe(true);
  });

  it('shows templates for selected tile type', () => {
    render(<TemplatePicker {...defaultProps} selectedTileType="text" />);
    
    // Should show templates available for text tiles
    // Check that template buttons exist (they contain template names)
    const buttons = screen.getAllByRole('button');
    const hasTemplateButtons = buttons.some(button => 
      button.textContent?.includes('Small Square') || 
      button.textContent?.includes('Small Rectangle')
    );
    expect(hasTemplateButtons).toBe(true);
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<TemplatePicker {...defaultProps} />);
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', () => {
    render(<TemplatePicker {...defaultProps} />);
    
    const closeButton = screen.getByLabelText('Close template picker');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('create button is initially disabled', () => {
    render(<TemplatePicker {...defaultProps} />);
    
    const createButton = screen.getByText('Create Tile');
    expect(createButton).toBeDisabled();
  });

  it('shows correct tile type in description', () => {
    render(<TemplatePicker {...defaultProps} selectedTileType="project" />);
    
    expect(screen.getByText('Select a template for your project tile')).toBeInTheDocument();
  });

  it('respects configuration options', () => {
    const config = {
      showThumbnails: false,
      groupByCategory: false,
      filterByTileType: false,
      showDescriptions: false
    };
    
    render(<TemplatePicker {...defaultProps} config={config} />);
    
    // With groupByCategory false, should not show category filters
    expect(screen.queryByText('Category:')).not.toBeInTheDocument();
  });

  it('updates tile type description when tile type changes', async () => {
    render(<TemplatePicker {...defaultProps} />);
    
    // Initially shows text tile description
    expect(screen.getByText('Select a template for your text tile')).toBeInTheDocument();
    
    // Click on project tile type
    const projectButton = screen.getByText('Project');
    fireEvent.click(projectButton);
    
    await waitFor(() => {
      expect(screen.getByText('Select a template for your project tile')).toBeInTheDocument();
    });
  });

  it('handles template selection flow', async () => {
    render(<TemplatePicker {...defaultProps} />);
    
    // Find template buttons (they contain template information)
    const buttons = screen.getAllByRole('button');
    const templateButton = buttons.find(button => 
      button.textContent?.includes('Small Square') && 
      button.textContent?.includes('Perfect for status updates')
    );
    
    expect(templateButton).toBeInTheDocument();
    
    if (templateButton) {
      // Click the template
      fireEvent.click(templateButton);
      
      // Check that selection is reflected in footer - create button should be enabled
      await waitFor(() => {
        const createButton = screen.getByText('Create Tile');
        expect(createButton).not.toBeDisabled();
      });
      
      // Create button should now be enabled
      const createButton = screen.getByText('Create Tile');
      expect(createButton).not.toBeDisabled();
      
      // Click create button
      fireEvent.click(createButton);
      
      // Should call onSelectTemplate
      expect(mockOnSelectTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Small Square',
          category: 'square'
        }),
        'text'
      );
    }
  });
});