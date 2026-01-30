/**
 * Template Definitions
 * 
 * This file contains the predefined template configurations for square,
 * rectangle, and circle templates as specified in the requirements.
 */

import { TileTemplate, TemplateCategory, ResponsiveConfig, ResponsiveBreakpoints } from './types';
import { BlockType } from '../Block';

// Default Responsive Configuration
const DEFAULT_RESPONSIVE_CONFIG: ResponsiveConfig = {
  breakpoints: {
    mobile: {
      minWidth: 0,
      maxWidth: 768,
      scaleFactor: 0.8,
    },
    tablet: {
      minWidth: 769,
      maxWidth: 1024,
      scaleFactor: 0.9,
    },
    desktop: {
      minWidth: 1025,
      maxWidth: Infinity,
      scaleFactor: 1.0,
    },
  },
};

// Responsive Breakpoints Configuration
export const RESPONSIVE_BREAKPOINTS: ResponsiveBreakpoints = {
  mobile: {
    maxWidth: 768,
    cols: 2,
    rowHeight: 120,
    margin: [8, 8],
  },
  tablet: {
    maxWidth: 1024,
    cols: 4,
    rowHeight: 150,
    margin: [12, 12],
  },
  desktop: {
    minWidth: 1025,
    cols: 6,
    rowHeight: 180,
    margin: [16, 16],
  },
};

// All tile types that can use square and rectangle templates
const STANDARD_TILE_TYPES: BlockType[] = ['text', 'thought', 'quote', 'project', 'status'];

// Only video and image tiles can use circle templates (per requirements)
const CIRCLE_TILE_TYPES: BlockType[] = ['video', 'image'];

// All tile types for templates that support everything
const ALL_TILE_TYPES: BlockType[] = ['text', 'thought', 'quote', 'image', 'video', 'project', 'status'];

/**
 * Square Templates
 * Requirements 1.3: Square templates in sizes 1x1, 2x2, and 3x3 grid units
 */
export const SQUARE_TEMPLATES: TileTemplate[] = [
  {
    id: 'small-square',
    name: 'Small Square',
    category: 'square',
    dimensions: { w: 1, h: 1 },
    aspectRatio: 1.0,
    allowedTileTypes: STANDARD_TILE_TYPES,
    responsiveScaling: DEFAULT_RESPONSIVE_CONFIG,
    description: 'Perfect for status updates and small content',
  },
  {
    id: 'medium-square',
    name: 'Medium Square',
    category: 'square',
    dimensions: { w: 2, h: 2 },
    aspectRatio: 1.0,
    allowedTileTypes: ALL_TILE_TYPES, // Medium squares can hold any content
    responsiveScaling: DEFAULT_RESPONSIVE_CONFIG,
    description: 'Ideal for featured content and medium-sized media',
  },
  {
    id: 'large-square',
    name: 'Large Square',
    category: 'square',
    dimensions: { w: 3, h: 3 },
    aspectRatio: 1.0,
    allowedTileTypes: ALL_TILE_TYPES, // Large squares can hold any content
    responsiveScaling: DEFAULT_RESPONSIVE_CONFIG,
    description: 'Great for showcase pieces and large content',
  },
];

/**
 * Rectangle Templates
 * Requirements 1.4: Rectangle templates in sizes 2x1, 3x2, 4x2, and 6x3 grid units
 */
export const RECTANGLE_TEMPLATES: TileTemplate[] = [
  {
    id: 'small-rectangle',
    name: 'Small Rectangle',
    category: 'rectangle',
    dimensions: { w: 2, h: 1 },
    aspectRatio: 2.0,
    allowedTileTypes: STANDARD_TILE_TYPES,
    responsiveScaling: DEFAULT_RESPONSIVE_CONFIG,
    description: 'Perfect for text snippets and status updates',
  },
  {
    id: 'medium-rectangle',
    name: 'Medium Rectangle',
    category: 'rectangle',
    dimensions: { w: 3, h: 2 },
    aspectRatio: 1.5,
    allowedTileTypes: ALL_TILE_TYPES,
    responsiveScaling: DEFAULT_RESPONSIVE_CONFIG,
    description: 'Great for article previews and medium projects',
  },
  {
    id: 'wide-rectangle',
    name: 'Wide Rectangle',
    category: 'rectangle',
    dimensions: { w: 4, h: 2 },
    aspectRatio: 2.0,
    allowedTileTypes: ALL_TILE_TYPES,
    responsiveScaling: DEFAULT_RESPONSIVE_CONFIG,
    description: 'Ideal for banner content and wide images',
  },
  {
    id: 'large-rectangle',
    name: 'Large Rectangle',
    category: 'rectangle',
    dimensions: { w: 6, h: 3 },
    aspectRatio: 2.0,
    allowedTileTypes: ALL_TILE_TYPES,
    responsiveScaling: DEFAULT_RESPONSIVE_CONFIG,
    description: 'Perfect for featured projects and detailed content',
  },
];

/**
 * Circle Templates
 * Requirements 1.5: Only video and image tiles can use circle templates
 * Note: Circle templates use square containers but apply circular styling
 */
export const CIRCLE_TEMPLATES: TileTemplate[] = [
  {
    id: 'small-circle',
    name: 'Small Circle',
    category: 'circle',
    dimensions: { w: 1, h: 1 },
    aspectRatio: 1.0,
    allowedTileTypes: CIRCLE_TILE_TYPES, // Only video and image
    responsiveScaling: DEFAULT_RESPONSIVE_CONFIG,
    description: 'Perfect for profile images and icons',
  },
  {
    id: 'medium-circle',
    name: 'Medium Circle',
    category: 'circle',
    dimensions: { w: 2, h: 2 },
    aspectRatio: 1.0,
    allowedTileTypes: CIRCLE_TILE_TYPES, // Only video and image
    responsiveScaling: DEFAULT_RESPONSIVE_CONFIG,
    description: 'Great for featured images and avatars',
  },
  {
    id: 'large-circle',
    name: 'Large Circle',
    category: 'circle',
    dimensions: { w: 3, h: 3 },
    aspectRatio: 1.0,
    allowedTileTypes: CIRCLE_TILE_TYPES, // Only video and image
    responsiveScaling: DEFAULT_RESPONSIVE_CONFIG,
    description: 'Ideal for hero images and main visuals',
  },
];

/**
 * All Templates Combined
 * Requirements 1.1: Three template categories - rectangle, square, and circle
 */
export const ALL_TEMPLATES: TileTemplate[] = [
  ...SQUARE_TEMPLATES,
  ...RECTANGLE_TEMPLATES,
  ...CIRCLE_TEMPLATES,
];

/**
 * Template Categories Map
 * For easy access to templates by category
 */
export const TEMPLATES_BY_CATEGORY: Record<TemplateCategory, TileTemplate[]> = {
  square: SQUARE_TEMPLATES,
  rectangle: RECTANGLE_TEMPLATES,
  circle: CIRCLE_TEMPLATES,
};

/**
 * Template ID Map
 * For quick template lookup by ID
 */
export const TEMPLATES_BY_ID: Record<string, TileTemplate> = ALL_TEMPLATES.reduce(
  (acc, template) => {
    acc[template.id] = template;
    return acc;
  },
  {} as Record<string, TileTemplate>
);

/**
 * Default Template IDs for each tile type
 * Used when creating new tiles
 */
export const DEFAULT_TEMPLATES_BY_TILE_TYPE: Record<BlockType, string> = {
  thought: 'small-square', // 1x1 for sticky notes
  text: 'small-rectangle', // 2x1 for text snippets
  quote: 'medium-square', // 2x2 for quotes
  image: 'medium-square', // 2x2 for images (can also use circles)
  video: 'medium-rectangle', // 3x2 for videos (can also use circles)
  project: 'large-rectangle', // 6x3 for projects
  status: 'small-rectangle', // 2x1 for status updates
};

/**
 * Legacy Size to Template Mapping
 * For migrating existing tiles to templates
 */
export const LEGACY_SIZE_MAPPING: Record<string, string> = {
  '1x1': 'small-square',
  '2x1': 'small-rectangle',
  '2x2': 'medium-square',
  '3x2': 'medium-rectangle',
  '3x3': 'large-square',
  '4x2': 'wide-rectangle',
  '4x3': 'medium-rectangle', // Closest match
  '6x3': 'large-rectangle',
  '6x4': 'large-rectangle', // Closest match
};