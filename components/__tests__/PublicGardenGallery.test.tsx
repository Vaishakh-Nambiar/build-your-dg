import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PublicGardenGallery } from '../PublicGardenGallery';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileInView, viewport, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

describe('PublicGardenGallery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock timers to control the loading delay
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows loading state initially', () => {
    render(<PublicGardenGallery />);
    
    // Should show loading shimmer elements
    const shimmerElements = document.querySelectorAll('.shimmer');
    expect(shimmerElements.length).toBeGreaterThan(0);
  });

  it('displays gardens after loading', async () => {
    render(<PublicGardenGallery />);
    
    // Fast-forward through the loading delay
    jest.advanceTimersByTime(1000);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Creative Explorations')).toBeInTheDocument();
    });
    
    // Check for garden titles
    expect(screen.getByText('Tech & Coffee')).toBeInTheDocument();
    expect(screen.getByText('Nature & Mindfulness')).toBeInTheDocument();
  });

  it('displays garden metadata correctly', async () => {
    render(<PublicGardenGallery />);
    
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(screen.getByText('Creative Explorations')).toBeInTheDocument();
    });
    
    // Check for usernames
    expect(screen.getByText('@sarah_designs')).toBeInTheDocument();
    expect(screen.getByText('@dev_mike')).toBeInTheDocument();
    
    // Check for view counts and likes (formatted numbers)
    expect(screen.getByText('1,247')).toBeInTheDocument(); // view count
    expect(screen.getByText('89')).toBeInTheDocument(); // like count
  });

  it('shows pagination controls', async () => {
    render(<PublicGardenGallery />);
    
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();
    });
    
    // Check for navigation buttons (using aria-label or other attributes)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2); // prev and next buttons
  });

  it('shows tile count for each garden', async () => {
    render(<PublicGardenGallery />);
    
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(screen.getByText('4 tiles')).toBeInTheDocument();
    });
  });

  it('includes link to view all gardens', async () => {
    render(<PublicGardenGallery />);
    
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(screen.getByText('Creative Explorations')).toBeInTheDocument();
    });
    
    const viewAllLink = screen.getByRole('link', { name: /view all gardens/i });
    expect(viewAllLink).toBeInTheDocument();
    expect(viewAllLink).toHaveAttribute('href', '/explore');
  });

  it('displays garden descriptions', async () => {
    render(<PublicGardenGallery />);
    
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(screen.getByText(/A collection of my design experiments/)).toBeInTheDocument();
      expect(screen.getByText(/My journey through code, coffee reviews/)).toBeInTheDocument();
    });
  });

  it('shows proper date formatting', async () => {
    render(<PublicGardenGallery />);
    
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
      expect(screen.getByText('Jan 20, 2024')).toBeInTheDocument();
    });
  });

  it('opens garden preview modal when garden is clicked', async () => {
    render(<PublicGardenGallery />);
    
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(screen.getByText('Creative Explorations')).toBeInTheDocument();
    });
    
    // Click on a garden card
    const gardenCard = screen.getByText('Creative Explorations').closest('[role="button"], div[class*="cursor-pointer"]');
    if (gardenCard) {
      fireEvent.click(gardenCard);
    }
    
    // Should open modal with garden details
    await waitFor(() => {
      expect(screen.getByText('Visit Garden')).toBeInTheDocument();
      expect(screen.getByText('Create Your Own')).toBeInTheDocument();
    });
  });
});