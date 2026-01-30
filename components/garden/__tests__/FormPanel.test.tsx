import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FormPanel } from '../FormPanel';
import { BlockData } from '../../Block';

// Mock tile data for testing
const mockTileData: BlockData = {
    id: 'test-tile',
    type: 'text',
    category: 'Test Category',
    title: 'Test Title',
    content: 'Test Content',
    color: '#ffffff',
    x: 0,
    y: 0,
    w: 2,
    h: 2
};

describe('FormPanel', () => {
    const mockOnUpdate = jest.fn();
    const mockOnValidationChange = jest.fn();

    beforeEach(() => {
        mockOnUpdate.mockClear();
        mockOnValidationChange.mockClear();
    });

    it('renders common fields for all tile types', () => {
        render(<FormPanel tileData={mockTileData} onUpdate={mockOnUpdate} onValidationChange={mockOnValidationChange} />);
        
        expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/link url/i)).toBeInTheDocument();
    });

    it('renders tile type selection buttons', () => {
        render(<FormPanel tileData={mockTileData} onUpdate={mockOnUpdate} onValidationChange={mockOnValidationChange} />);
        
        expect(screen.getByText('Text')).toBeInTheDocument();
        expect(screen.getByText('Project')).toBeInTheDocument();
        expect(screen.getByText('Image')).toBeInTheDocument();
        expect(screen.getByText('Video')).toBeInTheDocument();
        expect(screen.getByText('Quote')).toBeInTheDocument();
        expect(screen.getByText('Thought')).toBeInTheDocument();
    });

    it('calls onUpdate when common fields are changed', () => {
        render(<FormPanel tileData={mockTileData} onUpdate={mockOnUpdate} onValidationChange={mockOnValidationChange} />);
        
        const categoryInput = screen.getByLabelText(/category/i);
        fireEvent.change(categoryInput, { target: { value: 'New Category' } });
        
        expect(mockOnUpdate).toHaveBeenCalledWith({ category: 'New Category' });
    });

    it('renders project-specific fields for project tiles', () => {
        const projectTile = { ...mockTileData, type: 'project' as const };
        render(<FormPanel tileData={projectTile} onUpdate={mockOnUpdate} onValidationChange={mockOnValidationChange} />);
        
        expect(screen.getByText(/project image/i)).toBeInTheDocument();
        expect(screen.getByText(/showcase settings/i)).toBeInTheDocument();
        expect(screen.getByText(/border color/i)).toBeInTheDocument();
    });

    it('renders image-specific fields for image tiles', () => {
        const imageTile = { ...mockTileData, type: 'image' as const };
        render(<FormPanel tileData={imageTile} onUpdate={mockOnUpdate} onValidationChange={mockOnValidationChange} />);
        
        expect(screen.getByText(/image upload/i)).toBeInTheDocument();
        expect(screen.getByText(/display settings/i)).toBeInTheDocument();
        expect(screen.getByText(/polaroid style/i)).toBeInTheDocument();
    });

    it('renders video-specific fields for video tiles', () => {
        const videoTile = { ...mockTileData, type: 'video' as const };
        render(<FormPanel tileData={videoTile} onUpdate={mockOnUpdate} onValidationChange={mockOnValidationChange} />);
        
        expect(screen.getByText(/video upload/i)).toBeInTheDocument();
        expect(screen.getByText(/playback controls/i)).toBeInTheDocument();
        expect(screen.getByText(/loop video/i)).toBeInTheDocument();
    });

    it('renders quote-specific fields for quote tiles', () => {
        const quoteTile = { ...mockTileData, type: 'quote' as const };
        render(<FormPanel tileData={quoteTile} onUpdate={mockOnUpdate} onValidationChange={mockOnValidationChange} />);
        
        expect(screen.getByText(/quote text/i)).toBeInTheDocument();
        expect(screen.getByText(/author/i)).toBeInTheDocument();
        expect(screen.getByText(/rich text formatting/i)).toBeInTheDocument();
    });

    it('renders text-specific fields for text tiles', () => {
        const textTile = { ...mockTileData, type: 'text' as const };
        render(<FormPanel tileData={textTile} onUpdate={mockOnUpdate} onValidationChange={mockOnValidationChange} />);
        
        expect(screen.getByText('Text Content')).toBeInTheDocument(); // Exact match for label
        expect(screen.getByText(/rich text formatting/i)).toBeInTheDocument();
        expect(screen.getByText(/meta information/i)).toBeInTheDocument();
    });

    it('renders thought-specific fields for thought tiles', () => {
        const thoughtTile = { ...mockTileData, type: 'thought' as const };
        render(<FormPanel tileData={thoughtTile} onUpdate={mockOnUpdate} onValidationChange={mockOnValidationChange} />);
        
        expect(screen.getByText(/thought content/i)).toBeInTheDocument();
        expect(screen.getByText(/keep it short and sweet/i)).toBeInTheDocument();
        expect(screen.getByText(/mood\/tags/i)).toBeInTheDocument();
    });

    it('updates tile type when type button is clicked', () => {
        render(<FormPanel tileData={mockTileData} onUpdate={mockOnUpdate} onValidationChange={mockOnValidationChange} />);
        
        const projectButton = screen.getByText('Project');
        fireEvent.click(projectButton);
        
        expect(mockOnUpdate).toHaveBeenCalledWith({ type: 'project' });
    });

    it('shows tile dimensions info', () => {
        render(<FormPanel tileData={mockTileData} onUpdate={mockOnUpdate} onValidationChange={mockOnValidationChange} />);
        
        expect(screen.getByText(/grid position: 0, 0/i)).toBeInTheDocument();
        expect(screen.getByText(/dimensions: 2×2 units/i)).toBeInTheDocument();
        expect(screen.getByText(/resizing is disabled in template mode/i)).toBeInTheDocument();
    });

    describe('validation', () => {
        it('shows required field indicators', () => {
            render(<FormPanel tileData={mockTileData} onUpdate={mockOnUpdate} onValidationChange={mockOnValidationChange} />);
            
            // Category should always be required
            expect(screen.getByText('Category')).toBeInTheDocument();
            expect(screen.getByText('*')).toBeInTheDocument();
        });

        it('shows validation errors when field is touched and invalid', async () => {
            render(<FormPanel tileData={mockTileData} onUpdate={mockOnUpdate} onValidationChange={mockOnValidationChange} />);
            
            const categoryInput = screen.getByLabelText(/category/i);
            
            // Clear the field and blur to trigger validation
            fireEvent.change(categoryInput, { target: { value: '' } });
            fireEvent.blur(categoryInput);
            
            await waitFor(() => {
                expect(screen.getByText(/category is required/i)).toBeInTheDocument();
            });
        });

        it('calls onValidationChange when validation state changes', async () => {
            render(<FormPanel tileData={mockTileData} onUpdate={mockOnUpdate} onValidationChange={mockOnValidationChange} />);
            
            // Should call with valid state initially
            expect(mockOnValidationChange).toHaveBeenCalledWith(true, []);
        });

        it('validates URL format for link field', async () => {
            render(<FormPanel tileData={mockTileData} onUpdate={mockOnUpdate} onValidationChange={mockOnValidationChange} />);
            
            const linkInput = screen.getByLabelText(/link url/i);
            
            // Enter invalid URL and blur
            fireEvent.change(linkInput, { target: { value: 'not-a-url' } });
            fireEvent.blur(linkInput);
            
            await waitFor(() => {
                expect(screen.getByText(/must be a valid url/i)).toBeInTheDocument();
            });
        });

        it('shows character count for thought tiles', () => {
            const thoughtTile = { ...mockTileData, type: 'thought' as const };
            render(<FormPanel tileData={thoughtTile} onUpdate={mockOnUpdate} onValidationChange={mockOnValidationChange} />);
            
            expect(screen.getByText(/\/150 characters/)).toBeInTheDocument();
        });
    });
});