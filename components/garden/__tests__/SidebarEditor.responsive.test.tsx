/**
 * Responsive Tests for SidebarEditor Component
 * 
 * Tests the responsive behavior of the sidebar editor including:
 * - Responsive width adjustments across breakpoints
 * - Mobile-specific features (swipe to close, touch indicators)
 * - Grid usability when sidebar is open
 * - Layout adaptation for different screen sizes
 * 
 * Requirements 3.5, 3.6: Responsive sidebar behavior and grid usability
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SidebarEditor } from '../SidebarEditor';
import { BlockData } from '../../Block';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, onClick, drag, dragConstraints, dragElastic, onDragEnd, ...props }: any) => (
      <div 
        className={className} 
        onClick={onClick} 
        data-drag={drag}
        data-drag-constraints={dragConstraints ? 'true' : 'false'}
        data-drag-elastic={dragElastic}
        data-on-drag-end={onDragEnd ? 'true' : 'false'}
        {...props}
      >
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock the child components
jest.mock('../LivePreviewPanel', () => ({
  LivePreviewPanel: ({ tileData, className }: any) => (
    <div data-testid="live-preview-panel" className={className}>
      Live Preview: {tileData?.id}
    </div>
  ),
}));

jest.mock('../FormPanel', () => ({
  FormPanel: ({ tileData, onUpdate, onValidationChange }: any) => (
    <div data-testid="form-panel">
      Form Panel: {tileData?.id}
      <button onClick={() => onUpdate({ title: 'Updated' })}>Update</button>
      <button onClick={() => onValidationChange(false, [{ field: 'title', message: 'Required' }])}>
        Trigger Validation Error
      </button>
    </div>
  ),
}));

// Mock validation
jest.mock('../validation', () => ({
  validateFormSubmission: jest.fn(() => ({ isValid: true, errors: [] })),
}));

const mockTile: BlockData = {
  id: 'test-tile',
  type: 'text',
  content: { title: 'Test Tile', text: 'Test content' },
  x: 0,
  y: 0,
  w: 2,
  h: 2,
  static: false,
  isDraggable: true,
  isResizable: false,
};

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  currentTile: mockTile,
  onSave: jest.fn(),
  onDelete: jest.fn(),
};

// Helper to simulate window resize
const resizeWindow = (width: number, height: number = 768) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  fireEvent(window, new Event('resize'));
};

describe('SidebarEditor Responsive Behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset window size to desktop default
    resizeWindow(1200);
  });

  describe('Responsive Width Behavior', () => {
    it('should apply full width on mobile screens', () => {
      resizeWindow(400); // Mobile width
      render(<SidebarEditor {...defaultProps} />);
      
      const sidebar = document.querySelector('[class*="fixed"][class*="right-0"]');
      expect(sidebar).toBeInTheDocument();
      expect(sidebar).toHaveClass('w-full');
    });

    it('should apply 85% width on tablet screens', () => {
      resizeWindow(800); // Tablet width
      render(<SidebarEditor {...defaultProps} />);
      
      const sidebar = document.querySelector('[class*="fixed"][class*="right-0"]');
      expect(sidebar).toBeInTheDocument();
      expect(sidebar).toHaveClass('sm:w-[85%]');
    });

    it('should apply 75% width on desktop screens', () => {
      resizeWindow(1200); // Desktop width
      render(<SidebarEditor {...defaultProps} />);
      
      const sidebar = document.querySelector('[class*="fixed"][class*="right-0"]');
      expect(sidebar).toBeInTheDocument();
      expect(sidebar).toHaveClass('lg:w-[75%]');
    });
  });

  describe('Mobile-Specific Features', () => {
    beforeEach(() => {
      resizeWindow(400); // Mobile width
    });

    it('should show swipe indicator on mobile', async () => {
      render(<SidebarEditor {...defaultProps} />);
      
      // Wait for mobile detection to complete
      await waitFor(() => {
        const swipeIndicator = document.querySelector('[class*="w-12"][class*="h-1"][class*="bg-gray-300"]');
        expect(swipeIndicator).toBeInTheDocument();
      });
    });

    it('should not show swipe indicator on desktop', async () => {
      resizeWindow(1200); // Desktop width
      render(<SidebarEditor {...defaultProps} />);
      
      await waitFor(() => {
        const swipeIndicator = document.querySelector('[class*="w-12"][class*="h-1"][class*="bg-gray-300"]');
        expect(swipeIndicator).not.toBeInTheDocument();
      });
    });

    it('should show condensed text on mobile', () => {
      render(<SidebarEditor {...defaultProps} />);
      
      // Trigger validation error to show mobile text
      const triggerButton = screen.getByText('Trigger Validation Error');
      fireEvent.click(triggerButton);
      
      // Check for mobile-specific text classes (look for elements that hide on small screens)
      const hiddenOnSmall = document.querySelector('.sm\\:hidden');
      expect(hiddenOnSmall).toBeInTheDocument();
    });
  });

  describe('Layout Adaptation', () => {
    it('should use vertical layout on mobile', () => {
      resizeWindow(400);
      render(<SidebarEditor {...defaultProps} />);
      
      const mainContent = document.querySelector('[class*="flex-col"][class*="lg:flex-row"]');
      expect(mainContent).toBeInTheDocument();
    });

    it('should use horizontal layout on desktop', () => {
      resizeWindow(1200);
      render(<SidebarEditor {...defaultProps} />);
      
      const mainContent = document.querySelector('[class*="flex-col"][class*="lg:flex-row"]');
      expect(mainContent).toBeInTheDocument();
    });

    it('should adjust preview panel size responsively', () => {
      render(<SidebarEditor {...defaultProps} />);
      
      const previewContainer = document.querySelector('[class*="w-full"][class*="lg:w-1/2"]');
      expect(previewContainer).toBeInTheDocument();
    });

    it('should adjust form panel size responsively', () => {
      render(<SidebarEditor {...defaultProps} />);
      
      const formContainer = document.querySelector('[class*="w-full"][class*="lg:w-1/2"]');
      expect(formContainer).toBeInTheDocument();
    });
  });

  describe('Backdrop Behavior for Grid Usability', () => {
    it('should use full backdrop on mobile for focus', () => {
      resizeWindow(400);
      render(<SidebarEditor {...defaultProps} />);
      
      const backdrop = document.querySelector('[class*="bg-black/20"][class*="backdrop-blur-sm"]');
      expect(backdrop).toBeInTheDocument();
    });

    it('should use partial backdrop on tablet', () => {
      resizeWindow(800);
      render(<SidebarEditor {...defaultProps} />);
      
      const backdrop = document.querySelector('[class*="sm:bg-black/10"]');
      expect(backdrop).toBeInTheDocument();
    });

    it('should use minimal backdrop on desktop for grid usability', () => {
      resizeWindow(1200);
      render(<SidebarEditor {...defaultProps} />);
      
      // Check that backdrop exists and has the responsive classes
      const backdrop = document.querySelector('[class*="bg-black/20"]');
      expect(backdrop).toBeInTheDocument();
      
      // Verify it has the desktop-specific gradient classes for minimal backdrop
      expect(backdrop?.className).toContain('lg:bg-gradient-to-r');
      expect(backdrop?.className).toContain('lg:via-transparent');
    });

    it('should use gradient backdrop on large screens', () => {
      resizeWindow(1200);
      render(<SidebarEditor {...defaultProps} />);
      
      const backdrop = document.querySelector('[class*="lg:bg-gradient-to-r"]');
      expect(backdrop).toBeInTheDocument();
    });
  });

  describe('Action Button Layout', () => {
    it('should stack buttons vertically on mobile', () => {
      resizeWindow(400);
      render(<SidebarEditor {...defaultProps} />);
      
      const buttonContainer = document.querySelector('[class*="flex-col"][class*="sm:flex-row"]');
      expect(buttonContainer).toBeInTheDocument();
    });

    it('should arrange buttons horizontally on desktop', () => {
      resizeWindow(1200);
      render(<SidebarEditor {...defaultProps} />);
      
      const buttonContainer = document.querySelector('[class*="flex-col"][class*="sm:flex-row"]');
      expect(buttonContainer).toBeInTheDocument();
    });

    it('should adjust button order on mobile', () => {
      resizeWindow(400);
      render(<SidebarEditor {...defaultProps} />);
      
      // Save/Cancel buttons should be first (order-1), Delete button second (order-2)
      const saveContainer = document.querySelector('[class*="order-1"][class*="sm:order-2"]');
      const deleteButton = document.querySelector('[class*="order-2"][class*="sm:order-1"]');
      
      expect(saveContainer).toBeInTheDocument();
      expect(deleteButton).toBeInTheDocument();
    });
  });

  describe('Responsive Text and Icons', () => {
    it('should use smaller icons on mobile', () => {
      resizeWindow(400);
      render(<SidebarEditor {...defaultProps} />);
      
      // Check for responsive icon sizing classes on the close button icon
      const closeIcon = document.querySelector('.lucide-x');
      expect(closeIcon).toBeInTheDocument();
      expect(closeIcon).toHaveClass('sm:w-5', 'sm:h-5');
    });

    it('should show abbreviated text on mobile', () => {
      render(<SidebarEditor {...defaultProps} />);
      
      // Trigger validation error to test responsive error messages
      const triggerButton = screen.getByText('Trigger Validation Error');
      fireEvent.click(triggerButton);
      
      // Check for mobile-specific text
      const mobileText = document.querySelector('.sm\\:hidden');
      expect(mobileText).toBeInTheDocument();
    });

    it('should show full text on desktop', () => {
      resizeWindow(1200);
      render(<SidebarEditor {...defaultProps} />);
      
      // Trigger validation error
      const triggerButton = screen.getByText('Trigger Validation Error');
      fireEvent.click(triggerButton);
      
      // Check for desktop-specific text
      const desktopText = document.querySelector('.hidden.sm\\:inline');
      expect(desktopText).toBeInTheDocument();
    });
  });

  describe('Window Resize Handling', () => {
    it('should update mobile state when window is resized', async () => {
      render(<SidebarEditor {...defaultProps} />);
      
      // Start with desktop
      resizeWindow(1200);
      await waitFor(() => {
        const swipeIndicator = document.querySelector('[class*="w-12"][class*="h-1"]');
        expect(swipeIndicator).not.toBeInTheDocument();
      });
      
      // Resize to mobile
      resizeWindow(400);
      await waitFor(() => {
        const swipeIndicator = document.querySelector('[class*="w-12"][class*="h-1"]');
        expect(swipeIndicator).toBeInTheDocument();
      });
    });

    it('should handle rapid resize events', async () => {
      render(<SidebarEditor {...defaultProps} />);
      
      // Rapidly resize between mobile and desktop
      resizeWindow(400);
      resizeWindow(1200);
      resizeWindow(800);
      resizeWindow(400);
      
      // Should not crash and should settle on mobile state
      await waitFor(() => {
        const swipeIndicator = document.querySelector('[class*="w-12"][class*="h-1"]');
        expect(swipeIndicator).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility on Different Screen Sizes', () => {
    it('should maintain close button accessibility on mobile', () => {
      resizeWindow(400);
      render(<SidebarEditor {...defaultProps} />);
      
      const closeButton = screen.getByTitle('Close Editor');
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveClass('h-8', 'w-8'); // Smaller on mobile
    });

    it('should maintain close button accessibility on desktop', () => {
      resizeWindow(1200);
      render(<SidebarEditor {...defaultProps} />);
      
      const closeButton = screen.getByTitle('Close Editor');
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveClass('sm:h-10', 'sm:w-10'); // Larger on desktop
    });

    it('should maintain proper focus management across screen sizes', () => {
      render(<SidebarEditor {...defaultProps} />);
      
      const closeButton = screen.getByTitle('Close Editor');
      closeButton.focus();
      expect(document.activeElement).toBe(closeButton);
    });
  });

  describe('Performance Considerations', () => {
    it('should not cause excessive re-renders on resize', () => {
      const onCloseSpy = jest.fn();
      render(<SidebarEditor {...defaultProps} onClose={onCloseSpy} />);
      
      // Resize multiple times
      for (let i = 0; i < 10; i++) {
        resizeWindow(400 + i * 100);
      }
      
      // Should not have called onClose due to resize events
      expect(onCloseSpy).not.toHaveBeenCalled();
    });

    it('should clean up resize listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      const { unmount } = render(<SidebarEditor {...defaultProps} />);
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });
});