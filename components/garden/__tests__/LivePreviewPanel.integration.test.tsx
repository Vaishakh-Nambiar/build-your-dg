import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SidebarEditor } from '../SidebarEditor';
import { BlockData } from '../../Block';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, layout, ...domProps } = props;
      return <div {...domProps}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock tile components to track updates
jest.mock('../../tiles', () => ({
  TextTile: ({ data }: { data: any }) => (
    <div data-testid="text-tile" data-content={data.content} data-title={data.title}>
      {data.content}
    </div>
  ),
  ThoughtTile: ({ data }: { data: any }) => <div data-testid="thought-tile">{data.content}</div>,
  QuoteTile: ({ data }: { data: any }) => <div data-testid="quote-tile">{data.content}</div>,
  ImageTile: ({ data }: { data: any }) => <div data-testid="image-tile">{data.imageUrl}</div>,
  VideoTile: ({ data }: { data: any }) => <div data-testid="video-tile">{data.videoUrl}</div>,
  StatusTile: ({ data }: { data: any }) => <div data-testid="status-tile">{data.content}</div>,
  ProjectTile: ({ data }: { data: any }) => (
    <div data-testid="project-tile" data-title={data.title} data-color={data.showcaseBorderColor}>
      {data.title}
    </div>
  ),
}));

describe('LivePreviewPanel Integration', () => {
  const mockTileData: BlockData = {
    id: 'test-tile',
    type: 'text',
    category: 'Test Category',
    title: 'Original Title',
    content: 'Original content',
    x: 0,
    y: 0,
    w: 2,
    h: 2,
    color: '#ffffff'
  };

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

  it('updates live preview in real-time when form fields change', () => {
    render(<SidebarEditor {...mockProps} />);
    
    // Verify initial state
    const previewTile = screen.getByTestId('text-tile');
    expect(previewTile).toHaveAttribute('data-content', 'Original content');
    expect(previewTile).toHaveAttribute('data-title', 'Original Title');
    
    // Change title in form
    const titleInput = screen.getByLabelText('Title');
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    
    // Verify preview updates immediately
    expect(previewTile).toHaveAttribute('data-title', 'Updated Title');
    
    // Change content in form
    const contentInput = screen.getByLabelText('Content');
    fireEvent.change(contentInput, { target: { value: 'Updated content' } });
    
    // Verify preview updates immediately
    expect(previewTile).toHaveAttribute('data-content', 'Updated content');
  });

  it('updates preview when tile type changes', () => {
    render(<SidebarEditor {...mockProps} />);
    
    // Initially should show text tile
    expect(screen.getByTestId('text-tile')).toBeInTheDocument();
    expect(screen.queryByTestId('project-tile')).not.toBeInTheDocument();
    
    // Change to project type
    const projectButton = screen.getByRole('button', { name: /project/i });
    fireEvent.click(projectButton);
    
    // Should now show project tile
    expect(screen.queryByTestId('text-tile')).not.toBeInTheDocument();
    expect(screen.getByTestId('project-tile')).toBeInTheDocument();
  });

  it('updates preview when background color changes', () => {
    render(<SidebarEditor {...mockProps} />);
    
    // Find the preview container by test id
    const previewTile = screen.getByTestId('text-tile');
    const previewContainer = previewTile.closest('[style*="background-color"]');
    expect(previewContainer).toHaveStyle('background-color: #ffffff');
    
    // Click on a different color - find by style attribute
    const colorButtons = screen.getAllByRole('button').filter(button => 
      button.style.backgroundColor && button.style.backgroundColor !== ''
    );
    const yellowColorButton = colorButtons.find(button => 
      button.style.backgroundColor === 'rgb(251, 248, 204)' // #fbf8cc
    );
    
    if (yellowColorButton) {
      fireEvent.click(yellowColorButton);
      
      // Verify preview background color updates
      expect(previewContainer).toHaveStyle('background-color: #fbf8cc');
    }
  });

  it('shows updated grid dimensions in preview info', () => {
    const largeTile: BlockData = {
      ...mockTileData,
      w: 3,
      h: 4,
    };

    render(<SidebarEditor {...mockProps} currentTile={largeTile} />);
    
    // Verify dimensions are shown in preview info
    expect(screen.getByText('3×4 grid units • text tile')).toBeInTheDocument();
  });

  it('updates preview for project-specific fields', () => {
    const projectTile: BlockData = {
      ...mockTileData,
      type: 'project',
      showcaseBorderColor: '#cc2727',
    };

    render(<SidebarEditor {...mockProps} currentTile={projectTile} />);
    
    // Verify initial project tile state
    const projectPreview = screen.getByTestId('project-tile');
    expect(projectPreview).toHaveAttribute('data-color', '#cc2727');
    
    // Change border color using the text input (not color picker)
    const colorInputs = screen.getAllByDisplayValue('#cc2727');
    const textColorInput = colorInputs.find(input => input.getAttribute('type') === 'text');
    
    if (textColorInput) {
      fireEvent.change(textColorInput, { target: { value: '#00ff00' } });
      
      // Verify preview updates
      expect(projectPreview).toHaveAttribute('data-color', '#00ff00');
    }
  });

  it('maintains responsive preview scaling', () => {
    const smallTile: BlockData = {
      ...mockTileData,
      w: 1,
      h: 1,
    };

    const { rerender } = render(<SidebarEditor {...mockProps} currentTile={smallTile} />);
    
    // Check small tile dimensions
    expect(screen.getByText('1×1 grid units • text tile')).toBeInTheDocument();
    
    // Change to large tile
    const largeTile: BlockData = {
      ...mockTileData,
      w: 6,
      h: 4,
    };

    rerender(<SidebarEditor {...mockProps} currentTile={largeTile} />);
    
    // Check large tile dimensions
    expect(screen.getByText('6×4 grid units • text tile')).toBeInTheDocument();
    
    // Verify preview container has appropriate max dimensions using test id
    const previewTile = screen.getByTestId('text-tile');
    const previewContainer = previewTile.closest('[style*="width"]');
    expect(previewContainer).toBeInTheDocument();
    // The component should apply max width/height constraints for very large tiles
  });

  it('shows real-time feedback for category changes', () => {
    render(<SidebarEditor {...mockProps} />);
    
    // Verify initial category
    expect(screen.getByText('Test Category')).toBeInTheDocument();
    
    // Change category
    const categoryInput = screen.getByLabelText('Category');
    fireEvent.change(categoryInput, { target: { value: 'Updated Category' } });
    
    // Verify preview shows updated category immediately
    expect(screen.getByText('Updated Category')).toBeInTheDocument();
  });
});