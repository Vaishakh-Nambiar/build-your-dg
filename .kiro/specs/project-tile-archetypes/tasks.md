# Implementation Plan: Project Tile Archetypes

## Overview

This implementation plan converts the modular Project Tile archetype design into discrete coding tasks. The approach focuses on incremental development, starting with data structure extensions, then implementing each archetype renderer, followed by form integration, and finally comprehensive testing. Each task builds on previous work to ensure a cohesive implementation.

## Tasks

- [x] 1. Extend data structures and interfaces
  - Extend BlockData interface to include projectArchetype and archetypeConfig fields
  - Create TypeScript types for archetype configurations and layout adapters
  - Update existing type exports and ensure backward compatibility
  - _Requirements: 8.1, 8.4_

- [x] 2. Implement core archetype system
  - [x] 2.1 Create ArchetypeRenderer base interface and utilities
    - Define ArchetypeRenderer interface with render, getOptimalSizes, and getLayoutConstraints methods
    - Implement LayoutAdapter utility class for spacing, typography, and image calculations
    - Create archetype detection and default assignment logic
    - _Requirements: 1.5, 8.2, 8.3_
  
  - [ ]* 2.2 Write property test for archetype data storage
    - **Property 1: Archetype Data Storage**
    - **Validates: Requirements 1.2, 8.5**
  
  - [ ]* 2.3 Write property test for data structure integrity
    - **Property 8: Data Structure Integrity**
    - **Validates: Requirements 8.1, 8.4**

- [x] 3. Implement Web Showcase archetype renderer
  - [x] 3.1 Create WebShowcaseArchetype component
    - Implement landscape-oriented layout with soft background container
    - Add centered title positioning and embedded UI preview display
    - Implement generous padding and calm editorial spacing
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [x] 3.2 Add Web Showcase layout optimization
    - Implement optimal sizing for 3×2, 3×3, 4×3 grid dimensions
    - Add graceful adaptation for non-optimal sizes
    - Implement hover effects with subtle shadow and lift
    - _Requirements: 2.4, 2.5_
  
  - [ ]* 3.3 Write property test for Web Showcase layout characteristics
    - **Property 2: Archetype Layout Characteristics (Web Showcase)**
    - **Validates: Requirements 2.1, 2.2, 2.3**

- [x] 4. Implement Mobile App archetype renderer
  - [x] 4.1 Create MobileAppArchetype component
    - Implement portrait-oriented layout with neutral/gradient background
    - Add large floating phone mockup as primary visual element
    - Implement slight tilt for visual depth and minimal text display
    - _Requirements: 3.1, 3.2, 3.3, 3.5_
  
  - [x] 4.2 Add Mobile App layout optimization
    - Implement optimal sizing for 2×3, 3×4 portrait dimensions
    - Add graceful adaptation for landscape orientations
    - Implement phone mockup positioning and scaling
    - _Requirements: 3.4_
  
  - [ ]* 4.3 Write property test for Mobile App layout characteristics
    - **Property 2: Archetype Layout Characteristics (Mobile App)**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.5**

- [x] 5. Implement Concept/Editorial archetype renderer
  - [x] 5.1 Create ConceptEditorialArchetype component
    - Implement compact, typography-focused layout
    - Add prominent title positioning and one-line poetic description
    - Implement single abstract/symbolic image display
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [x] 5.2 Add Concept/Editorial layout optimization
    - Implement optimal sizing for 2×2, 3×2 compact dimensions
    - Add graceful adaptation for larger sizes
    - Implement editorial spacing and typography scaling
    - _Requirements: 4.5_
  
  - [ ]* 5.3 Write property test for Concept/Editorial layout characteristics
    - **Property 2: Archetype Layout Characteristics (Concept/Editorial)**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

- [ ] 6. Checkpoint - Ensure archetype renderers work correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Enhance ProjectTile component with archetype support
  - [x] 7.1 Update ProjectTile to use archetype renderers
    - Integrate archetype detection and renderer selection logic
    - Implement fallback to Web Showcase for legacy tiles
    - Maintain existing ProjectTile props and behavior
    - _Requirements: 1.5, 8.2, 8.3_
  
  - [x] 7.2 Add visual consistency and hover effects
    - Implement consistent soft shadows and rounded corners across archetypes
    - Add subtle border styling and color palette compatibility
    - Implement archetype-appropriate hover effects
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [ ]* 7.3 Write property test for visual consistency
    - **Property 7: Visual Consistency and Hover Effects**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**
  
  - [ ]* 7.4 Write property test for archetype visual updates
    - **Property 3: Archetype Visual Updates**
    - **Validates: Requirements 1.4**

- [x] 8. Implement form integration for archetype selection
  - [x] 8.1 Add archetype selector to FormPanel
    - Create archetype selection UI with three options
    - Implement archetype-specific field visibility and emphasis
    - Add recommended grid size highlighting for selected archetype
    - _Requirements: 1.1, 7.1, 5.1_
  
  - [x] 8.2 Add archetype-specific form sections
    - Implement Web Showcase form fields (project title, UI preview, web metadata)
    - Implement Mobile App form fields (app name, phone mockup, mobile options)
    - Implement Concept/Editorial form fields (title, poetic description, symbolic imagery)
    - _Requirements: 7.2, 7.3, 7.4_
  
  - [x] 8.3 Add form preview functionality
    - Implement live preview updates when archetype or grid size changes
    - Add preview generation for archetype/size combinations
    - Implement smooth transitions between archetype switches
    - _Requirements: 5.2, 7.5_
  
  - [ ]* 8.4 Write property test for form field relevance
    - **Property 5: Form Field Relevance**
    - **Validates: Requirements 7.1, 5.1**
  
  - [ ]* 8.5 Write property test for form data preservation
    - **Property 10: Form Data Preservation**
    - **Validates: Requirements 7.5**

- [x] 9. Implement layout adaptation system
  - [x] 9.1 Create responsive layout adaptation
    - Implement LayoutAdapter for spacing, typography, and image calculations
    - Add optimal size handling with graceful fallbacks
    - Implement responsive scaling across screen sizes
    - _Requirements: 5.3, 5.4, 5.5_
  
  - [x] 9.2 Add grid system integration
    - Ensure compatibility with existing drag-and-drop functionality
    - Implement seamless resize operations with archetype preservation
    - Add grid recalculation handling with visual characteristic maintenance
    - _Requirements: 9.3, 9.4, 9.1, 9.2_
  
  - [ ]* 9.3 Write property test for optimal size layout adaptation
    - **Property 4: Optimal Size Layout Adaptation**
    - **Validates: Requirements 2.4, 3.4, 4.5, 5.3, 5.4**
  
  - [ ]* 9.4 Write property test for responsive layout maintenance
    - **Property 11: Responsive Layout Maintenance**
    - **Validates: Requirements 5.5, 9.1, 9.2**

- [x] 10. Implement content display rules and error handling
  - [x] 10.1 Add archetype-specific content rendering
    - Implement embedded UI preview for Web Showcase projects
    - Implement minimal text display for Mobile App projects
    - Implement poetic description formatting for Concept/Editorial projects
    - _Requirements: 2.2, 2.3, 3.2, 3.5, 4.2, 4.3, 4.4_
  
  - [x] 10.2 Add comprehensive error handling
    - Implement invalid archetype value handling with Web Showcase fallback
    - Add missing image placeholder generation for each archetype
    - Implement content overflow handling with responsive scaling
    - Add form validation with archetype-specific guidance
  
  - [ ]* 10.3 Write property test for content display rules
    - **Property 6: Content Display Rules**
    - **Validates: Requirements 2.2, 2.3, 3.2, 3.5, 4.2, 4.3, 4.4**
  
  - [ ]* 10.4 Write property test for backward compatibility
    - **Property 9: Backward Compatibility**
    - **Validates: Requirements 1.5, 8.2, 8.3**

- [x] 11. Add integration testing and final validation
  - [x] 11.1 Implement integration with existing garden builder
    - Test complete workflow from tile creation to grid placement
    - Ensure no regressions in existing tile types
    - Validate form system integration across all archetypes
    - _Requirements: 9.3, 9.4_
  
  - [ ]* 11.2 Write property test for integration compatibility
    - **Property 12: Integration Compatibility**
    - **Validates: Requirements 9.3, 9.4**
  
  - [ ]* 11.3 Write property test for form preview functionality
    - **Property 13: Form Preview Functionality**
    - **Validates: Requirements 5.2**
  
  - [ ]* 11.4 Write unit tests for error handling scenarios
    - Test invalid archetype values and malformed configurations
    - Test missing images and content overflow scenarios
    - Test form validation failures and archetype switch conflicts

- [x] 12. Final checkpoint - Ensure all functionality works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties across all archetype combinations
- Unit tests validate specific examples, edge cases, and error conditions
- Integration tests ensure seamless compatibility with existing garden builder functionality