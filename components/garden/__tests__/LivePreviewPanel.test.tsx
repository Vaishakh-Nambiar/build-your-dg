import React from 'react';
import { render, screen } from '@testing-library/react';
import { LivePreviewPanel } from '../LivePreviewPanel';
import { BlockData } from '../../Block';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock tile components
jest.mock('../../tiles', () => ({
  TextTile: ({ data }: { data: BlockData }) => <div data-testid="text-tile">{data.content}</div>,
  ThoughtTile: ({ data }: { data: BlockData }) => <div data-testid="thought-tile">{data.content}</div>,
  QuoteTile: ({ data }: { data: BlockData }) => <div data-testid="quote-tile">{data.content}</div>,
  ImageTile: ({ data }: { data: BlockData }) => <div data-testid="image-tile">{data.imageUrl}</div>,
  VideoTile: ({ data }: { data: BlockData }) => <div data-testid="video-tile">{data.videoUrl}</div>,
  StatusTile: ({ data }: { data: BlockData }) => <div data-testid="status-tile">{data.content}</div>,
  ProjectTile: ({ data }: { data: BlockData }) => <div data-testid="project-tile">{data.title}</div>,
}));

describe('LivePreviewPanel', () => {
  const mockTileData: BlockData = {
    id: 'test-tile',
    type: 'text',
    category: 'Test Category',
    title: 'Test Title',
    content: 'Test content',
    color: '#ffffff',
    x: 0,
    y: 0,
    w: 2,
    h: 2,
  };

  it('renders live preview with tile data', () => {
    render(<LivePreviewPanel tileData={mockTileData} />);
    
    expect(screen.getByText('Live Preview')).toBeInTheDocument();
    expect(screen.getByText('2×2 grid units • text tile')).toBeInTheDocument();
    expect(screen.getByText('Test Category')).toBeInTheDocument();
    expect(screen.getByTestId('text-tile')).toBeInTheDocument();
  });

  it('renders different tile types correctly', () => {
    const projectTile: BlockData = {
      ...mockTileData,
      type: 'project',
      title: 'My Project',
    };

    render(<LivePreviewPanel tileData={projectTile} />);
    
    expect(screen.getByText('2×2 grid units • project tile')).toBeInTheDocument();
    expect(screen.getByTestId('project-tile')).toBeInTheDocument();
  });

  it('applies responsive preview dimensions', () => {
    const largeTile: BlockData = {
      ...mockTileData,
      w: 4,
      h: 3,
    };

    render(<LivePreviewPanel tileData={largeTile} />);
    
    expect(screen.getByText('4×3 grid units • text tile')).toBeInTheDocument();
    
    // Check that preview container has appropriate styling
    const previewContainer = screen.getByText('Test content').closest('[style*="width"]');
    expect(previewContainer).toBeInTheDocument();
  });

  it('shows tile title in preview info when available', () => {
    render(<LivePreviewPanel tileData={mockTileData} />);
    
    expect(screen.getByText('"Test Title"')).toBeInTheDocument();
  });

  it('handles tiles without title gracefully', () => {
    const tileWithoutTitle: BlockData = {
      ...mockTileData,
      title: undefined,
    };

    render(<LivePreviewPanel tileData={tileWithoutTitle} />);
    
    expect(screen.getByText('Live Preview')).toBeInTheDocument();
    expect(screen.queryByText('"Test Title"')).not.toBeInTheDocument();
  });

  it('applies background color from tile data', () => {
    const coloredTile: BlockData = {
      ...mockTileData,
      color: '#ff0000',
    };

    render(<LivePreviewPanel tileData={coloredTile} />);
    
    // Check that the preview container has the correct background color
    const previewContainer = screen.getByText('Test content').closest('[style*="background-color"]');
    expect(previewContainer).toHaveStyle('background-color: #ff0000');
  });

  it('handles unknown tile types gracefully', () => {
    const unknownTile: BlockData = {
      ...mockTileData,
      type: 'unknown' as any,
    };

    render(<LivePreviewPanel tileData={unknownTile} />);
    
    expect(screen.getByText('Unknown tile type')).toBeInTheDocument();
  });
});