import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SidebarEditor } from '../SidebarEditor';
import { BlockData } from '../../Block';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      // Filter out framer-motion specific props
      const { initial, animate, exit, transition, layout, ...domProps } = props;
      return <div {...domProps}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockTileData: BlockData = {
  id: 'test-tile',
  type: 'text',
  category: 'Test Category',
  title: 'Test Title',
  content: 'Test content',
  x: 0,
  y: 0,
  w: 2,
  h: 2,
  color: '#ffffff'
};

describe('SidebarEditor', () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    currentTile: mockTileData,
    onSave: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders sidebar with 75% width when open', () => {
    render(<SidebarEditor {...mockProps} />);
    
    const sidebar = screen.getByText('Edit Tile').closest('.w-\\[75\\%\\]');
    expect(sidebar).toBeInTheDocument();
    expect(sidebar).toHaveClass('w-[75%]');
  });

  it('displays left panel for live preview (centered)', () => {
    render(<SidebarEditor {...mockProps} />);
    
    // Check for live preview section
    expect(screen.getByText('Live Preview')).toBeInTheDocument();
    
    // Verify the left panel structure - find the parent container with w-1/2
    const previewContainer = screen.getByText('Live Preview').closest('div');
    const leftPanel = previewContainer?.closest('.w-1\\/2');
    expect(leftPanel).toHaveClass('w-1/2');
    expect(leftPanel).toHaveClass('flex', 'items-center', 'justify-center');
  });

  it('displays right panel for form controls', () => {
    render(<SidebarEditor {...mockProps} />);
    
    // Check for form elements
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Content')).toBeInTheDocument();
    
    // Verify the right panel structure
    const rightPanel = screen.getByLabelText('Category').closest('.w-1\\/2');
    expect(rightPanel).toHaveClass('border-l', 'border-gray-200');
  });

  it('displays save and delete action buttons', () => {
    render(<SidebarEditor {...mockProps} />);
    
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    
    expect(saveButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
    
    // Verify they are in the footer
    const footer = saveButton.closest('.border-t');
    expect(footer).toHaveClass('border-t', 'border-gray-200');
  });

  it('calls onSave when save button is clicked with changes', () => {
    render(<SidebarEditor {...mockProps} />);
    
    // Make a change to make the form dirty
    const titleInput = screen.getByLabelText('Title');
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    
    // Click save
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);
    
    expect(mockProps.onSave).toHaveBeenCalledWith({
      ...mockTileData,
      title: 'Updated Title'
    });
  });

  it('prevents saving when form has validation errors', () => {
    render(<SidebarEditor {...mockProps} />);
    
    // Make an invalid change (empty category)
    const categoryInput = screen.getByLabelText(/category/i);
    fireEvent.change(categoryInput, { target: { value: '' } });
    fireEvent.blur(categoryInput);
    
    // Save button should be disabled
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    expect(saveButton).toBeDisabled();
    
    // Should not call onSave when clicked
    fireEvent.click(saveButton);
    expect(mockProps.onSave).not.toHaveBeenCalled();
  });

  it('shows validation error indicator in header', () => {
    render(<SidebarEditor {...mockProps} />);
    
    // Make an invalid change
    const categoryInput = screen.getByLabelText(/category/i);
    fireEvent.change(categoryInput, { target: { value: '' } });
    fireEvent.blur(categoryInput);
    
    // Should show validation error indicator
    expect(screen.getByText(/validation error/i)).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked and confirmed', () => {
    // Mock window.confirm to return true
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);
    
    render(<SidebarEditor {...mockProps} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    
    expect(mockProps.onDelete).toHaveBeenCalledWith('test-tile');
    
    // Restore original confirm
    window.confirm = originalConfirm;
  });

  it('does not render when isOpen is false', () => {
    render(<SidebarEditor {...mockProps} isOpen={false} />);
    
    expect(screen.queryByText('Edit Tile')).not.toBeInTheDocument();
  });

  it('does not render when currentTile is null', () => {
    render(<SidebarEditor {...mockProps} currentTile={null} />);
    
    expect(screen.queryByText('Edit Tile')).not.toBeInTheDocument();
  });

  it('shows unsaved changes indicator when form is dirty', () => {
    render(<SidebarEditor {...mockProps} />);
    
    // Initially no unsaved changes indicator
    expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument();
    
    // Make a change
    const titleInput = screen.getByLabelText('Title');
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    
    // Should show unsaved changes indicator
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
  });

  it('maintains responsive layout structure', () => {
    render(<SidebarEditor {...mockProps} />);
    
    // Check main content area has flex layout - find the container that holds both panels
    const leftPanel = screen.getByText('Live Preview').closest('.w-1\\/2');
    const mainContentArea = leftPanel?.parentElement;
    expect(mainContentArea).toHaveClass('flex-1', 'flex', 'overflow-hidden');
    
    // Check left and right panels are 50% each
    const rightPanel = screen.getByLabelText('Category').closest('.w-1\\/2');
    
    expect(leftPanel).toBeInTheDocument();
    expect(rightPanel).toBeInTheDocument();
  });
});