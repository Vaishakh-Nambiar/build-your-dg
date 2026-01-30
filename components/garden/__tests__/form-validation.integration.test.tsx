import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SidebarEditor } from '../SidebarEditor';
import { BlockData } from '../../Block';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
    AnimatePresence: ({ children }: any) => children,
}));

const mockTile: BlockData = {
    id: 'test-tile',
    type: 'text',
    category: 'Test',
    title: 'Test Title',
    content: 'Test Content',
    color: '#ffffff',
    x: 0,
    y: 0,
    w: 2,
    h: 2,
};

describe('Form Validation Integration', () => {
    const mockOnSave = jest.fn();
    const mockOnDelete = jest.fn();
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('prevents saving when validation fails', async () => {
        render(
            <SidebarEditor
                isOpen={true}
                currentTile={mockTile}
                onSave={mockOnSave}
                onDelete={mockOnDelete}
                onClose={mockOnClose}
            />
        );

        // Clear required field to make form invalid
        const categoryInput = screen.getByLabelText(/category/i);
        fireEvent.change(categoryInput, { target: { value: '' } });
        fireEvent.blur(categoryInput);

        // Try to save
        const saveButton = screen.getByRole('button', { name: /save changes/i });
        fireEvent.click(saveButton);

        // Should not call onSave
        expect(mockOnSave).not.toHaveBeenCalled();
    });

    it('shows validation errors in real-time', async () => {
        render(
            <SidebarEditor
                isOpen={true}
                currentTile={mockTile}
                onSave={mockOnSave}
                onDelete={mockOnDelete}
                onClose={mockOnClose}
            />
        );

        // Clear required field
        const categoryInput = screen.getByLabelText(/category/i);
        fireEvent.change(categoryInput, { target: { value: '' } });
        fireEvent.blur(categoryInput);

        // Should show error message
        await waitFor(() => {
            expect(screen.getByText(/category is required/i)).toBeInTheDocument();
        });
    });

    it('allows saving when form is valid', async () => {
        render(
            <SidebarEditor
                isOpen={true}
                currentTile={mockTile}
                onSave={mockOnSave}
                onDelete={mockOnDelete}
                onClose={mockOnClose}
            />
        );

        // Make a change to make form dirty
        const titleInput = screen.getByLabelText(/title/i);
        fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

        // Save should work
        const saveButton = screen.getByRole('button', { name: /save changes/i });
        fireEvent.click(saveButton);

        expect(mockOnSave).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Updated Title'
            })
        );
    });
});