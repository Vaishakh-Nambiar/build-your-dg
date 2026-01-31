# Implementation Plan: Garden Builder Refactor - MVP FOCUS

## Overview

This implementation plan converts the garden builder from a free-form grid system to a template-based approach with enhanced editing capabilities. The refactor maintains the existing react-grid-layout foundation while introducing predefined templates, intelligent repositioning, and a comprehensive sidebar editor with live preview functionality.

**MVP FOCUS: NO TESTS - BUILD FUNCTIONALITY ONLY**

## Tasks

- [x] 1. Set up template system foundation
  - Create TypeScript interfaces for templates, configurations, and responsive scaling
  - Define predefined template configurations (square, rectangle, circle)
  - Implement template validation and filtering logic
  - _Requirements: 1.1, 1.3, 1.4, 1.5, 1.6_

- [x] 2. Implement enhanced grid system manager
  - [x] 2.1 Modify react-grid-layout configuration to disable resizing
    - Set isResizable to false for all grid items
    - Implement resize prevention logic
    - _Requirements: 2.1, 2.2_
  
  - [x] 2.2 Implement intelligent repositioning logic
    - Create drop zone calculation algorithm
    - Implement tile shifting logic for accommodating moves
    - Add collision detection and prevention
    - _Requirements: 2.3_
  
  - [x] 2.3 Enhance debug visualization system
    - Add row and column border display
    - Implement gap and size markers
    - Create numerical dimension indicators
    - Add grid boundary highlighting
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 3. Create sidebar editor component
  - [x] 3.1 Build sidebar layout structure
    - Create 75% width sidebar container
    - Implement left panel for live preview (centered)
    - Implement right panel for form controls
    - Add save and delete action buttons
    - _Requirements: 3.1, 3.2, 3.3, 3.7, 3.8_
  
  - [x] 3.2 Implement live preview panel
    - Create real-time tile preview component
    - Implement preview update synchronization
    - Add responsive preview scaling
    - _Requirements: 3.4_
  
  - [x] 3.3 Build tile-specific form system
    - Create form configurations for each tile type
    - Implement project tile forms (upload options, showcase settings)
    - Implement video tile forms (upload options, playback controls)
    - Implement image tile forms (upload options, display settings)
    - Implement text/quote/thought tile forms (rich text editing)
    - Add common fields (category, title, content, links) for all types
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 4. Implement template picker component
  - Add template thumbnail previews
  - Create visual template selection interface
  - Implement selection highlighting
  - Add template grouping by category
  - Implement template filtering based on tile type restrictions
  - Add clear labels and descriptions for each template
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 5. Implement responsive system enhancements
  - [x] 5.1 Create responsive template scaling logic
    - Implement proportional scaling calculations
    - Add breakpoint-specific scaling rules
    - Ensure aspect ratio preservation across screen sizes
    - _Requirements: 5.1, 5.2_
  
  - [x] 5.2 Implement circle template shape preservation
    - Add CSS properties for maintaining circular appearance
    - Implement responsive circle scaling
    - _Requirements: 5.5_
  
  - [x] 5.3 Enhance sidebar responsiveness
    - Implement responsive sidebar behavior
    - Maintain grid usability when sidebar is open
    - _Requirements: 3.5, 3.6_

- [x] 6. Implement visual feedback and animations
  - Add visual feedback for repositioning operations (drop zones, hover states)
  - Implement smooth animations for tile movements
  - Add template change animations
  - Implement sidebar open/close animations
  - Add live preview update transitions
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 7. Implement data migration and compatibility
  - [x] 7.1 Create legacy data migration system
    - Implement size-to-template mapping logic
    - Create content preservation during migration
    - Add migration validation
    - _Requirements: 7.2, 7.3, 7.4_
  
  - [x] 7.2 Implement enhanced data persistence
    - Add template information to save operations
    - Maintain backward compatibility with existing data structures
    - _Requirements: 7.5_

- [x] 8. Integration and component wiring
  - [x] 8.1 Wire template system with grid layout
    - Connect template selection to grid item creation
    - Integrate template constraints with repositioning logic
    - _Requirements: 1.2_
  
  - [x] 8.2 Connect sidebar editor with grid state
    - Implement tile selection and editing workflow
    - Connect form changes to grid updates
    - Wire save/delete actions to grid operations
    - _Requirements: 3.1, 3.7, 3.8_
  
  - [x] 8.3 Integrate responsive system across components
    - Connect template scaling with grid responsive behavior
    - Ensure sidebar responsiveness works with grid layout
    - _Requirements: 2.6, 3.5, 3.6_

- [x] 9. Form validation and error handling (moved from 3.4)
  - Add input validation rules
  - Create error message display system
  - Implement save prevention for invalid data
  - _Requirements: 4.6_

- [x] 10. Final MVP validation
  - Ensure all template system components work together
  - Verify grid system prevents resizing and enables repositioning
  - Validate sidebar editor with live preview functionality
  - Confirm responsive behavior across devices
  - Validate professional editing experience

## Notes

- **MVP FOCUS**: All test-related tasks have been removed to focus on building core functionality
- Each task references specific requirements for traceability
- The refactor maintains existing react-grid-layout foundation while adding new capabilities
- Form validation moved to later in the process to avoid blocking other functionality