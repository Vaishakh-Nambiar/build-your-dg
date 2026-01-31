# Requirements Document

## Introduction

This specification defines the requirements for transforming an existing frontend-only Digital Garden Next.js application into a full-stack application using Supabase as the backend infrastructure. The project aims to replace localStorage-based persistence with a robust database system while adding authentication, file management, and public sharing capabilities.

## Glossary

- **Digital_Garden**: The main application system for creating and managing tile-based content gardens
- **Garden**: A collection of tiles arranged in a grid layout representing a user's digital garden
- **Tile**: Individual content blocks (text, image, project, writing) that can be arranged in a garden
- **Supabase_Backend**: The PostgreSQL database and authentication system provided by Supabase
- **RLS_Policy**: Row Level Security policy that controls data access at the database level
- **Storage_Bucket**: Supabase storage container for media files and assets
- **Authentication_System**: User login and registration system with email and OAuth providers
- **Migration_Service**: System component responsible for transferring data from localStorage to database

## Requirements

### Requirement 1: Backend Infrastructure Setup

**User Story:** As a system administrator, I want to establish the Supabase backend infrastructure, so that the application has a reliable database and authentication foundation.

#### Acceptance Criteria

1. THE Supabase_Backend SHALL be configured with PostgreSQL database and authentication services
2. THE Storage_Bucket SHALL be created for media file storage with user-specific folder structure
3. THE RLS_Policy SHALL be implemented for all database tables to ensure data security
4. WHEN the backend is deployed, THE Digital_Garden SHALL connect successfully to all Supabase services
5. THE Authentication_System SHALL support email/password and OAuth providers (Google, GitHub)

### Requirement 2: Database Schema Implementation

**User Story:** As a developer, I want a comprehensive database schema, so that all application data can be stored and retrieved efficiently.

#### Acceptance Criteria

1. THE Supabase_Backend SHALL create a users table with profile information and onboarding status
2. THE Supabase_Backend SHALL create a gardens table with JSONB column for tile data storage
3. THE Supabase_Backend SHALL create a media_assets table for file metadata and storage paths
4. THE Supabase_Backend SHALL create a garden_views table for analytics tracking
5. WHEN any table is accessed, THE RLS_Policy SHALL enforce user-specific data access controls
6. THE gardens table SHALL support efficient querying by user_id and garden visibility status

### Requirement 3: User Authentication System

**User Story:** As a user, I want to create an account and log in securely, so that I can access my personal digital garden across devices.

#### Acceptance Criteria

1. WHEN a user registers with email/password, THE Authentication_System SHALL create a user account and send verification email
2. WHEN a user logs in with OAuth provider, THE Authentication_System SHALL create or link the account automatically
3. THE Authentication_System SHALL protect all garden routes requiring user authentication
4. WHEN authentication fails, THE Digital_Garden SHALL redirect to login page with appropriate error message
5. THE Authentication_System SHALL maintain user sessions across browser refreshes and device switches

### Requirement 4: Garden Data Management

**User Story:** As a user, I want my garden data to be saved automatically to the database, so that I never lose my work and can access it from any device.

#### Acceptance Criteria

1. WHEN a user modifies garden tiles, THE Digital_Garden SHALL auto-save changes to the database within 2 seconds
2. WHEN a user loads their garden, THE Digital_Garden SHALL retrieve all tile data from the database
3. THE Digital_Garden SHALL support creating, reading, updating, and deleting gardens for authenticated users
4. WHEN save conflicts occur, THE Digital_Garden SHALL implement conflict resolution to prevent data loss
5. THE Digital_Garden SHALL maintain garden metadata including creation date, last modified, and tile count

### Requirement 5: File Upload and Asset Management

**User Story:** As a user, I want to upload images and videos to my garden tiles, so that I can create rich multimedia content.

#### Acceptance Criteria

1. WHEN a user uploads an image file (JPEG, PNG, GIF, WebP, SVG), THE Digital_Garden SHALL accept files up to 10MB
2. WHEN a user uploads a video file (MP4, WebM), THE Digital_Garden SHALL accept files up to 50MB
3. THE Digital_Garden SHALL store uploaded files in user-specific folders within the Storage_Bucket
4. WHEN an image is uploaded, THE Digital_Garden SHALL generate thumbnail versions automatically
5. THE Digital_Garden SHALL provide secure URLs for accessing uploaded media files
6. WHEN file upload fails, THE Digital_Garden SHALL display clear error messages and retry options

### Requirement 6: Data Migration from localStorage

**User Story:** As an existing user, I want my current garden data to be preserved during the backend migration, so that I don't lose any of my existing work.

#### Acceptance Criteria

1. WHEN a user first logs in after migration, THE Migration_Service SHALL detect existing localStorage data
2. THE Migration_Service SHALL transfer all garden tiles and layout data to the user's database account
3. WHEN migration is complete, THE Digital_Garden SHALL display a confirmation message to the user
4. THE Migration_Service SHALL handle migration errors gracefully without data loss
5. WHEN migration fails partially, THE Digital_Garden SHALL allow users to retry the migration process

### Requirement 7: Public Garden Sharing

**User Story:** As a user, I want to make my garden publicly viewable, so that I can share my work with others and build an audience.

#### Acceptance Criteria

1. WHEN a user sets garden visibility to public, THE Digital_Garden SHALL generate a shareable public URL
2. THE Digital_Garden SHALL display public gardens without requiring authentication
3. WHEN a public garden is viewed, THE Digital_Garden SHALL track view analytics in the garden_views table
4. THE Digital_Garden SHALL optimize public garden pages for SEO with proper meta tags
5. THE Digital_Garden SHALL provide social sharing buttons for public gardens

### Requirement 8: Performance and Reliability

**User Story:** As a user, I want the application to perform reliably, so that I can work efficiently without interruptions.

#### Acceptance Criteria

1. WHEN a user loads their garden, THE Digital_Garden SHALL complete loading within 2 seconds
2. WHEN a user uploads files under 10MB, THE Digital_Garden SHALL complete upload within 10 seconds
3. THE Digital_Garden SHALL maintain 99.9% uptime for all core functionality
4. WHEN database operations fail, THE Digital_Garden SHALL implement retry logic with exponential backoff
5. THE Digital_Garden SHALL cache frequently accessed data to improve response times

### Requirement 9: Security and Data Protection

**User Story:** As a user, I want my data to be secure and private, so that I can trust the platform with my personal content.

#### Acceptance Criteria

1. THE RLS_Policy SHALL prevent users from accessing other users' private garden data
2. THE Authentication_System SHALL implement secure password hashing and session management
3. THE Digital_Garden SHALL validate and sanitize all user input to prevent security vulnerabilities
4. WHEN handling file uploads, THE Digital_Garden SHALL scan for malicious content and reject unsafe files
5. THE Digital_Garden SHALL implement HTTPS for all data transmission

### Requirement 10: Landing Page and Public Garden Discovery

**User Story:** As a visitor, I want to explore existing gardens and understand the platform's value, so that I can decide whether to create my own garden.

#### Acceptance Criteria

1. THE Digital_Garden SHALL provide a landing page at "/" with hero section "Build Your Digital Garden"
2. THE landing page SHALL include a gallery showcasing public gardens in curator mode
3. THE landing page SHALL display platform features and benefits clearly
4. THE landing page SHALL provide clear call-to-action buttons leading to "/signup"
5. THE gallery SHALL allow visitors to browse and preview public gardens without authentication

### Requirement 11: Application Route Structure and Navigation

**User Story:** As a user, I want intuitive navigation between different sections of the application, so that I can easily access all features.

#### Acceptance Criteria

1. THE Digital_Garden SHALL implement route structure: "/", "/signup", "/login", "/edit", "/[username]"
2. THE "/signup" route SHALL handle account creation with username selection
3. THE "/login" route SHALL redirect authenticated users to "/edit" after successful login
4. THE "/edit" route SHALL be protected and require authentication
5. THE "/[username]" route SHALL display public gardens in read-only mode

### Requirement 12: Smart Editor Top Bar Interface

**User Story:** As a user, I want a comprehensive top bar in the editor, so that I can access all garden management features efficiently.

#### Acceptance Criteria

1. THE editor top bar SHALL display logo, editable garden title, and save status indicator
2. THE top bar SHALL show "Unsaved Changes ⚠️" or "All Saved ✓" status clearly
3. THE top bar SHALL provide manual "Save Garden" button for immediate saving
4. THE top bar SHALL include "Publish/Unpublish" toggle for garden visibility
5. THE profile menu SHALL include: View Public Garden, Stats, Settings, Appearance, Help, and Logout options

### Requirement 13: Manual Save System with Local Backup

**User Story:** As a user, I want to manually save my garden when ready and have automatic local backup, so that I have control over when changes are persisted while ensuring data safety.

#### Acceptance Criteria

1. THE Digital_Garden SHALL allow users to build entire gardens before manually saving
2. THE manual save button SHALL persist all garden changes to the database at once
3. THE Digital_Garden SHALL implement localStorage backup every 2 minutes automatically
4. THE localStorage backup SHALL preserve all unsaved changes locally
5. WHEN the user returns, THE Digital_Garden SHALL offer to restore unsaved changes from localStorage

### Requirement 14: Public Garden Viewing Experience

**User Story:** As a visitor, I want to view public gardens in a clean, optimized interface, so that I can appreciate the content without distractions.

#### Acceptance Criteria

1. THE "/[username]" route SHALL display gardens in clean, read-only mode
2. THE public garden view SHALL hide all edit controls for visitors
3. WHEN viewing own garden publicly, THE Digital_Garden SHALL show "Edit Garden" button
4. THE public garden SHALL include footer with "Built with [Logo]" and "Create Yours" links
5. THE public garden view SHALL be optimized for sharing and SEO

### Requirement 15: Error Handling and User Experience

**User Story:** As a user, I want clear feedback when errors occur, so that I understand what happened and how to resolve issues.

#### Acceptance Criteria

1. WHEN network errors occur, THE Digital_Garden SHALL display user-friendly error messages with suggested actions
2. THE Digital_Garden SHALL implement offline detection and queue operations for when connectivity returns
3. WHEN authentication expires, THE Digital_Garden SHALL prompt for re-authentication without losing unsaved work
4. THE Digital_Garden SHALL provide loading states for all asynchronous operations
5. WHEN critical errors occur, THE Digital_Garden SHALL log detailed error information for debugging