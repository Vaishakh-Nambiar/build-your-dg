import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LandingPage } from '../LandingPage';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileInView, viewport, initial, animate, transition, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, initial, animate, transition, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, initial, animate, transition, ...props }: any) => <p {...props}>{children}</p>,
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

// Mock the PublicGardenGallery component
jest.mock('../PublicGardenGallery', () => ({
  PublicGardenGallery: () => <div data-testid="public-garden-gallery">Public Garden Gallery</div>
}));

describe('LandingPage', () => {
  beforeEach(() => {
    // Reset any mocks before each test
    jest.clearAllMocks();
  });

  it('renders the hero section with correct title', () => {
    render(<LandingPage />);
    
    expect(screen.getByText('Build Your')).toBeInTheDocument();
    expect(screen.getByText('Digital Garden')).toBeInTheDocument();
  });

  it('displays the hero description text', () => {
    render(<LandingPage />);
    
    expect(screen.getByText(/Create a beautiful, personalized space for your ideas/)).toBeInTheDocument();
  });

  it('renders call-to-action buttons in hero section', () => {
    render(<LandingPage />);
    
    const startBuildingButton = screen.getByRole('link', { name: /start building/i });
    const exploreGardensButton = screen.getByRole('link', { name: /explore gardens/i });
    
    expect(startBuildingButton).toBeInTheDocument();
    expect(startBuildingButton).toHaveAttribute('href', '/signup');
    
    expect(exploreGardensButton).toBeInTheDocument();
    expect(exploreGardensButton).toHaveAttribute('href', '#gallery');
  });

  it('renders the features section', () => {
    render(<LandingPage />);
    
    expect(screen.getByText('Why Digital Gardens?')).toBeInTheDocument();
    expect(screen.getByText('Creative Freedom')).toBeInTheDocument();
    expect(screen.getByText('Flexible Layout')).toBeInTheDocument();
    expect(screen.getByText('Share & Discover')).toBeInTheDocument();
  });

  it('displays feature descriptions', () => {
    render(<LandingPage />);
    
    expect(screen.getByText(/Arrange your content exactly how you want/)).toBeInTheDocument();
    expect(screen.getByText(/Drag, drop, and resize tiles/)).toBeInTheDocument();
    expect(screen.getByText(/Make your garden public to inspire others/)).toBeInTheDocument();
  });

  it('renders the gallery section', () => {
    render(<LandingPage />);
    
    expect(screen.getByText('Discover Gardens')).toBeInTheDocument();
    expect(screen.getByText(/Explore beautiful digital gardens created by our community/)).toBeInTheDocument();
    expect(screen.getByTestId('public-garden-gallery')).toBeInTheDocument();
  });

  it('renders the call-to-action section', () => {
    render(<LandingPage />);
    
    expect(screen.getByText('Ready to Grow?')).toBeInTheDocument();
    expect(screen.getByText(/Join thousands of creators/)).toBeInTheDocument();
    
    const createGardenButton = screen.getByRole('link', { name: /create your garden/i });
    expect(createGardenButton).toBeInTheDocument();
    expect(createGardenButton).toHaveAttribute('href', '/signup');
  });

  it('displays community stats in CTA section', () => {
    render(<LandingPage />);
    
    expect(screen.getByText('10,000+ creators')).toBeInTheDocument();
    expect(screen.getByText('Free forever')).toBeInTheDocument();
  });

  it('has proper section IDs for navigation', () => {
    render(<LandingPage />);
    
    const gallerySection = document.querySelector('#gallery');
    expect(gallerySection).toBeInTheDocument();
  });

  it('renders floating decorative elements', () => {
    render(<LandingPage />);
    
    // Check for decorative icons (they should be present but may not have specific text)
    const decorativeElements = document.querySelectorAll('[class*="absolute"]');
    expect(decorativeElements.length).toBeGreaterThan(0);
  });

  it('has responsive design classes', () => {
    render(<LandingPage />);
    
    const heroTitle = screen.getByText('Digital Garden');
    expect(heroTitle).toHaveClass('text-5xl', 'sm:text-7xl', 'lg:text-9xl');
  });

  it('includes proper semantic HTML structure', () => {
    render(<LandingPage />);
    
    // Check for semantic sections
    expect(document.querySelector('section')).toBeInTheDocument();
    
    // Check for proper heading hierarchy
    const h1Elements = screen.getAllByRole('heading', { level: 1 });
    expect(h1Elements.length).toBeGreaterThan(0);
    
    const h2Elements = screen.getAllByRole('heading', { level: 2 });
    expect(h2Elements.length).toBeGreaterThan(0);
  });
});