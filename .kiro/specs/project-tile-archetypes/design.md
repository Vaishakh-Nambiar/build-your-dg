# Design Document

## Overview

The modular Project Tile component system enhances the existing ProjectTile component with three distinct visual archetypes optimized for different project types. The system maintains the existing calm, garden-like aesthetic while providing specialized layouts that better showcase web applications, mobile apps, and conceptual projects.

The design leverages the existing BlockData structure, form system, and grid layout while introducing new archetype-specific rendering logic and adaptive layout capabilities. Each archetype provides optimized visual presentations for specific grid sizes while gracefully adapting to other dimensions.

## Architecture

### Component Hierarchy

```
ProjectTile (Enhanced)
├── ArchetypeRenderer
│   ├── WebShowcaseArchetype
│   ├── MobileAppArchetype
│   └── ConceptEditorialArchetype
├── LayoutAdapter
└── ArchetypeSelector (Form Integration)
```

### Data Flow

1. **Form Selection**: User selects archetype in FormPanel
2. **Data Storage**: Archetype choice stored in extended BlockData
3. **Rendering**: ProjectTile determines archetype and delegates to appropriate renderer
4. **Layout Adaptation**: LayoutAdapter adjusts presentation based on grid size
5. **Responsive Updates**: System maintains archetype characteristics across screen sizes

### Integration Points

- **BlockData Extension**: New `projectArchetype` field added to existing interface
- **FormPanel Enhancement**: Archetype selection integrated into project tile form
- **ProjectTile Replacement**: Enhanced component replaces existing implementation
- **Grid System Compatibility**: Full compatibility with existing grid layout and sizing

## Components and Interfaces

### Enhanced BlockData Interface

```typescript
interface BlockData {
  // ... existing properties
  projectArchetype?: 'web-showcase' | 'mobile-app' | 'concept-editorial';
  archetypeConfig?: {
    phoneOrientation?: 'portrait' | 'landscape';
    showPhoneMockup?: boolean;
    poeticDescription?: string;
    symbolicImageUrl?: string;
    uiPreviewMode?: 'embedded' | 'floating';
  };
}
```

### Archetype Renderer Interface

```typescript
interface ArchetypeRenderer {
  render(data: BlockData, dimensions: GridDimensions, isEditMode: boolean): JSX.Element;
  getOptimalSizes(): GridSize[];
  getLayoutConstraints(size: GridSize): LayoutConstraints;
}
```

### Layout Adapter Interface

```typescript
interface LayoutAdapter {
  calculateSpacing(archetype: string, gridSize: GridSize): SpacingConfig;
  getTypographyScale(archetype: string, gridSize: GridSize): TypographyConfig;
  adaptImageSizing(archetype: string, gridSize: GridSize): ImageConfig;
}
```

## Data Models

### Archetype Configuration

```typescript
type ProjectArchetype = 'web-showcase' | 'mobile-app' | 'concept-editorial';

interface ArchetypeConfig {
  phoneOrientation?: 'portrait' | 'landscape';
  showPhoneMockup?: boolean;
  poeticDescription?: string;
  symbolicImageUrl?: string;
  uiPreviewMode?: 'embedded' | 'floating';
}

interface GridDimensions {
  w: number;
  h: number;
  aspectRatio: number;
}

interface SpacingConfig {
  padding: string;
  titleMargin: string;
  contentGap: string;
  imageMargin: string;
}

interface TypographyConfig {
  titleSize: string;
  titleWeight: string;
  contentSize: string;
  metaSize: string;
}

interface ImageConfig {
  maxWidth: string;
  maxHeight: string;
  objectFit: 'cover' | 'contain';
  borderRadius: string;
}
```

### Archetype Specifications

#### Web Showcase Archetype
- **Optimal Sizes**: 3×2, 3×3, 4×3, 6×3, 6×4
- **Layout**: Landscape-oriented with centered title and embedded UI preview
- **Styling**: Soft background container, generous padding, subtle shadows
- **Content Priority**: Project title/logo → UI preview → description

#### Mobile App Archetype  
- **Optimal Sizes**: 2×3, 3×4, 4×3 (portrait preference)
- **Layout**: Portrait-oriented with floating phone mockup
- **Styling**: Neutral/gradient background, tilted phone for depth
- **Content Priority**: Phone mockup → minimal project name → subtle branding

#### Concept/Editorial Archetype
- **Optimal Sizes**: 2×2, 3×2, 4×2 (compact preference)
- **Layout**: Typography-led with symbolic imagery
- **Styling**: Neutral/warm background, editorial spacing
- **Content Priority**: Project title → poetic description → symbolic image

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Now I need to analyze the acceptance criteria to determine which ones are testable as properties.

Based on the prework analysis, I can now define the correctness properties:

### Property 1: Archetype Data Storage
*For any* archetype selection by a user, the Project_Tile_System should store the archetype choice in the Tile_Data and maintain it through all operations
**Validates: Requirements 1.2, 8.5**

### Property 2: Archetype Layout Characteristics  
*For any* project tile with a specified archetype, the Project_Tile_System should render with the layout characteristics specific to that archetype (landscape for Web Showcase, portrait for Mobile App, compact typography for Concept/Editorial)
**Validates: Requirements 2.1, 3.1, 4.1**

### Property 3: Archetype Visual Updates
*For any* archetype change operation, the Project_Tile_System should immediately update the visual presentation without requiring a page refresh
**Validates: Requirements 1.4**

### Property 4: Optimal Size Layout Adaptation
*For any* tile with an archetype and grid size combination, the Layout_Adapter should optimize the layout for the archetype's preferred dimensions and gracefully adapt for non-optimal sizes
**Validates: Requirements 2.4, 3.4, 4.5, 5.3, 5.4**

### Property 5: Form Field Relevance
*For any* archetype selection in the form, the Form_System should show only the input fields relevant to that archetype and highlight recommended grid sizes
**Validates: Requirements 7.1, 5.1**

### Property 6: Content Display Rules
*For any* project tile with content, the Project_Tile_System should display content according to archetype-specific rules (embedded UI preview for Web Showcase, minimal text for Mobile App, poetic description for Concept/Editorial)
**Validates: Requirements 2.2, 2.3, 3.2, 3.5, 4.2, 4.3, 4.4**

### Property 7: Visual Consistency and Hover Effects
*For any* project tile regardless of archetype, the Project_Tile_System should maintain consistent visual styling (soft shadows, rounded corners, subtle borders) and apply appropriate hover effects
**Validates: Requirements 2.5, 6.1, 6.2, 6.3, 6.4**

### Property 8: Data Structure Integrity
*For any* project tile data, the Project_Tile_System should extend the BlockData interface to include archetype information while preserving all existing properties
**Validates: Requirements 8.1, 8.4**

### Property 9: Backward Compatibility
*For any* existing project tile data without archetype information, the Project_Tile_System should apply Web Showcase as the default archetype and maintain full functionality
**Validates: Requirements 1.5, 8.2, 8.3**

### Property 10: Form Data Preservation
*For any* archetype switching operation, the Form_System should preserve common field values and provide smooth transitions
**Validates: Requirements 7.5**

### Property 11: Responsive Layout Maintenance
*For any* screen size change or grid recalculation, the Project_Tile_System should maintain archetype-specific proportions and visual characteristics
**Validates: Requirements 5.5, 9.1, 9.2**

### Property 12: Integration Compatibility
*For any* existing garden builder operation (drag-and-drop, resize, grid positioning), the Project_Tile_System should work seamlessly with the enhanced archetype functionality
**Validates: Requirements 9.3, 9.4**

### Property 13: Form Preview Functionality
*For any* grid size selection in the form, the Form_System should show a preview of how the selected archetype will appear in that size
**Validates: Requirements 5.2**

## Error Handling

### Archetype Validation
- **Invalid Archetype Values**: Default to 'web-showcase' if invalid archetype specified
- **Missing Archetype Configuration**: Apply sensible defaults based on archetype type
- **Malformed Archetype Config**: Gracefully ignore invalid configuration properties

### Layout Adaptation Errors
- **Unsupported Grid Sizes**: Gracefully adapt layout using closest supported configuration
- **Missing Required Images**: Show placeholder with appropriate styling for archetype
- **Content Overflow**: Implement text truncation and responsive scaling

### Form Integration Errors
- **Field Validation Failures**: Show clear error messages with archetype-specific guidance
- **Archetype Switch Conflicts**: Preserve valid data and reset conflicting fields with user confirmation
- **Preview Generation Errors**: Show fallback preview with error indication

### Backward Compatibility Errors
- **Legacy Data Migration**: Handle missing archetype fields without breaking existing functionality
- **Property Conflicts**: Prioritize archetype-specific properties over legacy properties
- **Version Mismatches**: Maintain functionality across different data structure versions

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests** focus on:
- Specific archetype rendering examples
- Form integration with each archetype type
- Edge cases like missing images or invalid configurations
- Integration points with existing components
- Error handling scenarios

**Property-Based Tests** focus on:
- Universal properties that hold across all archetypes and grid sizes
- Data integrity through archetype changes and form operations
- Layout adaptation across different screen sizes and grid configurations
- Backward compatibility with existing tile data
- Performance characteristics under various load conditions

### Property-Based Testing Configuration

- **Testing Library**: React Testing Library with @fast-check/jest for property-based testing
- **Minimum Iterations**: 100 iterations per property test to ensure comprehensive input coverage
- **Test Tagging**: Each property test tagged with format: **Feature: project-tile-archetypes, Property {number}: {property_text}**
- **Generator Strategy**: Custom generators for BlockData, grid sizes, and archetype configurations
- **Assertion Strategy**: Visual regression testing combined with DOM structure validation

### Test Coverage Requirements

- **Archetype Rendering**: Each archetype tested across all supported grid sizes
- **Form Integration**: All form interactions tested with each archetype
- **Data Persistence**: Round-trip testing for all archetype configurations
- **Responsive Behavior**: Testing across mobile, tablet, and desktop breakpoints
- **Performance**: Rendering performance tested with multiple simultaneous archetype tiles

### Integration Testing

- **Garden Builder Integration**: Full workflow testing from tile creation to grid placement
- **Existing Component Compatibility**: Ensure no regressions in existing tile types
- **Form System Integration**: Complete form workflow testing for each archetype
- **Grid System Integration**: Drag, drop, and resize operations with archetype tiles