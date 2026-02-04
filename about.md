# Digital Garden - Complete Project Documentation

## 🌟 Project Overview

**Digital Garden** is a sophisticated block-based web application that enables users to create personalized, visual content layouts using an intelligent grid system. It combines the modularity of Notion blocks with the aesthetic appeal of Pinterest boards, featuring a calm, editorial design philosophy focused on personal expression and thoughtful content curation.

### Core Philosophy
- **Calm, Editorial Design**: Soft colors, rounded corners, subtle shadows, generous spacing
- **Personal Expression**: A quiet, personal space for thoughts and creativity (not social media)
- **Block-Based Flexibility**: Modular content blocks arranged in various grid sizes
- **Template-Driven**: Predefined layouts maintaining visual consistency while allowing customization

---

## 🏗️ Technical Architecture

### Frontend Stack
- **Next.js 16.1.5** with TypeScript and React 19.2.3
- **Tailwind CSS 4.0** for styling with inline theme configuration
- **React Grid Layout 2.2.2** for drag-and-drop grid system
- **Framer Motion 12.29.2** for smooth animations and transitions
- **Lucide React 0.563.0** for consistent iconography
- **Clsx + Tailwind Merge** for conditional styling

### Current Implementation Status
- ✅ **Fully functional frontend** with complete UI/UX
- ✅ **Responsive grid system** with intelligent breakpoints
- ✅ **7 distinct tile types** with specialized styling
- ✅ **Template system** with visual picker and responsive scaling
- ✅ **Live preview** with pixel-perfect accuracy
- ✅ **Advanced project archetype system**
- ❌ **Backend integration** (ready for implementation)
- ❌ **Data persistence** (currently local storage only)
- ❌ **User authentication** (not implemented)

---

## 🧩 Block System Architecture

### 1. Text Tile (`text`)
**Purpose**: Simple text content blocks for notes, descriptions, or short-form writing
**Grid Sizes**: 2×2, 3×2, 4×2
**Styling Features**:
- Serif display font for titles (Newsreader)
- Sans-serif body text (Inter)
- Transparent background option
- Line clamping for content overflow
- Responsive typography scaling

**Data Structure**:
```typescript
{
  type: 'text',
  title?: string,
  content: string,
  isTransparent?: boolean,
  category: string,
  color?: string
}
```

### 2. Thought Tile (`thought`)
**Purpose**: Sticky note style for quick thoughts, ideas, or reminders
**Grid Sizes**: 2×2 (primary)
**Styling Features**:
- Handwritten font (Caveat)
- Slight rotation effect (rotate-1, hover:rotate-0)
- Pastel color palette
- Shadow effects for depth
- Centered text alignment

**Visual Behavior**:
- Base rotation of 1 degree
- Straightens on hover
- Larger font sizes for impact

### 3. Quote Tile (`quote`)
**Purpose**: Inspirational quotes, excerpts, or attributed text
**Grid Sizes**: 3×3, 4×3
**Styling Features**:
- Elegant typography with proper quote formatting
- Author attribution display
- Larger sizes for impactful presentation
- Serif fonts for editorial feel

### 4. Image Tile (`image`)
**Purpose**: Photo display with calm, editorial aesthetic
**Grid Sizes**: 2×2, 3×2, 3×3, 3×4
**Styling Features**:
- Soft rounded corners (8px)
- Hover effects with subtle movement
- Object-fit options (cover/contain)
- Caption and title overlay on hover
- Polaroid styling option

**Visual Behavior**:
- Static image fills container
- Hover: Image moves down slightly (translate-y-1)
- Subtle dark overlay (5% opacity) on hover
- Metadata fades in on hover (opacity-based)
- No layout shift - container remains stable

### 5. Video Tile (`video`)
**Purpose**: Video content, GIFs, or multimedia with enhanced hover interactions
**Grid Sizes**: 3×3, 4×3, 6×3
**Styling Features**:
- **Stacked Design**: Two-layer system (video front, content back)
- **Hover Effects**: Video moves down to reveal content behind
- **Shape Options**: Rectangle or circle display modes
- **Interactive Controls**: Mute/unmute and loop toggles on hover
- **Dynamic Shift**: Content reveal adapts to title length
- **Responsive Scaling**: Maintains aspect ratio across breakpoints

**Visual Behavior**:
- **Base State**: Video fills container with soft rounded corners
- **Hover State**: Video moves down (translate-y) to reveal content
- **Controls Appear**: Mute and loop buttons fade in on hover
- **Content Display**: Title, description, and metadata shown behind video
- **Circle Mode**: Full circular clipping with `clip-path: circle()`
- **No Layout Shift**: Container remains stable during interactions

**Enhanced Features**:
- Auto-play with configurable loop and mute settings
- Backdrop blur effects on control buttons
- Gradient overlay for better text contrast
- Smooth transitions (500ms duration)
- Hover scale effects on control buttons

### 6. Project Tile (`project`) - Advanced Archetype System
**Purpose**: Showcase projects with specialized layouts based on project type
**Grid Sizes**: 3×2, 3×3, 4×3, 6×4

#### **Web Showcase Archetype**
- Landscape-oriented layout
- Soft background with UI preview container
- Accent border color customization
- Technology stack display
- Link integration

#### **Mobile App Archetype**
- **Two-Layer Design**: Background content layer with floating phone UI layer
- **Floating Phone Animation**: Phone starts rotated (-8deg) and offset (15% x, -10% y)
- **Sophisticated Hover**: Phone moves to center, straightens to 0deg, and scales up
- **Physical Easing**: Uses cubic-bezier(0.23,1,0.32,1) for natural motion
- **CSS Variables**: Easy tuning with `--phone-rotation`, `--phone-offset-x/y`, `--phone-scale`
- **Realistic Phone Frame**: Modern iPhone-style frame with notch and side buttons
- **Gradient Background**: Subtle blue-to-indigo gradient behind content
- **Content Positioning**: Title, description, and metadata positioned around floating phone
- **Auto-Scaling**: Works seamlessly across all tile sizes without branching logic
- **App store link integration and platform indicators**

#### **Concept/Editorial Archetype**
- Typography-focused design
- Editorial spacing and layout
- Symbolic imagery support
- Poetic description fields
- Minimal aesthetic

### 7. Writing Tile (`writing`)
**Purpose**: Long-form content like blog posts, essays, journal entries
**Grid Sizes**: 2×2, 3×2, 3×3, 3×4
**Styling Features**:
- Serif fonts for editorial feel
- Publication date formatting
- Excerpt with line clamping
- External link integration
- Responsive content scaling

**Visual Hierarchy**:
1. Category label (small, muted, top-left)
2. Title (serif font, prominent)
3. Date (formatted, e.g., "February 16, 2025")
4. Excerpt (body text, line-clamped)

---

## 🎨 Design System & Styling Architecture

### Color Palette
```css
/* Primary Colors */
--color-background: #F9F9F9;    /* Soft off-white background */
--color-foreground: #171717;    /* Near black text */
--text-secondary: #6b7280;      /* Gray-500 */
--text-muted: #9ca3af;          /* Gray-400 */

/* Pastel Palette (Thought tiles) */
--pastel-colors: [
  '#ffffff', '#fbf8cc', '#fde4cf', '#ffcfd2', 
  '#f1c0e8', '#cfbaf0', '#a3c4f3', '#90dbf4', 
  '#8eecf5', '#98f5e1', '#b9fbc0'
];
```

### Typography System
```css
/* Font Families */
--font-sans: Inter;           /* UI and body text */
--font-serif: Newsreader;     /* Editorial content */
--font-hand: Caveat;          /* Handwritten style */

/* Typography Scale */
.text-2xl { font-size: 1.5rem; }   /* Tile titles */
.text-xl { font-size: 1.25rem; }   /* Section headers */
.text-lg { font-size: 1.125rem; }  /* Large text */
.text-base { font-size: 1rem; }    /* Standard body */
.text-sm { font-size: 0.875rem; }  /* Small text */
.text-xs { font-size: 0.75rem; }   /* Captions */
```

### Shadow System
```css
/* Tile Shadows */
.shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06);
.shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.1);
.shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Hover Effects */
.hover\:shadow-2xl:hover { 
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
```

### Animation System
The project includes sophisticated animations defined in `app/globals.css`:

- **Hover Glow**: Subtle glow effect for interactive elements
- **Active Pulse**: Scaling animation for active states
- **Shimmer**: Loading state animation
- **Success Bounce**: Confirmation feedback
- **Error Shake**: Error state feedback
- **Template Morph**: Smooth transitions between template changes
- **Drop Zone Pulse**: Visual feedback for drag operations
- **Ripple Effect**: Button interaction feedback

---

## 🎛️ User Interface Components

### 1. Block Component (`components/Block.tsx`)
**Core Wrapper**: Every tile is wrapped in the Block component
**Key Features**:
- **Edit Mode Controls**: Drag handle, edit/delete buttons
- **Hover States**: Consistent interaction feedback
- **Category Display**: Color-cycling category labels
- **Link Handling**: External link icons and navigation
- **Settings Overlay**: Modal-based editing interface
- **Debug Information**: Grid size and position indicators

**Styling Classes**:
```typescript
const getContainerClasses = () => {
  const base = "group relative h-full w-full overflow-hidden transition-[background-color,border-color,opacity,box-shadow,transform] duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]";
  const border = isEditMode ? "border-1 border-dashed border-black/20" : "border border-black/[0.06] hover:shadow-2xl hover:shadow-black/5";
  
  // Special styling for different tile types
  if (data.type === 'thought') {
    return cn(base, "shadow-lg rotate-1 hover:rotate-0", !isEditMode && "border-none");
  }
  
  if (data.type === 'project') {
    return cn(base, "rounded-[8px] bg-[#F9F9F9] shadow-sm", 
      !isEditMode && "hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1");
  }
  
  return cn(base, "rounded-[8px] bg-white shadow-sm", border);
};
```

### 2. Grid Engine (`components/garden/GridEngine.tsx`)
**Core Functionality**:
- React Grid Layout integration
- Responsive breakpoint management
- Intelligent tile repositioning
- Debug visualization
- Template integration

**Responsive Configuration**:
```typescript
const RESPONSIVE_CONFIGS = {
  xxl: { cols: 12, rowHeight: 100, margin: [16, 16] }, // 1536px+
  xl:  { cols: 12, rowHeight: 100, margin: [16, 16] }, // 1280px+  
  lg:  { cols: 10, rowHeight: 90,  margin: [14, 14] }, // 1024px+
  md:  { cols: 8,  rowHeight: 80,  margin: [12, 12] }, // 768px+
  sm:  { cols: 6,  rowHeight: 70,  margin: [10, 10] }, // 640px+
  xs:  { cols: 4,  rowHeight: 60,  margin: [8, 8] }    // <640px
};
```

### 3. Template System (`components/templates/`)
**Template Categories**:
- **Square Templates**: 1×1, 2×2, 3×3 grid units
- **Rectangle Templates**: 2×1, 3×2, 4×2, 6×3 grid units
- **Circle Templates**: Circular styling for video/image tiles only

**Template Picker**: Visual grid size selection with preview
**Responsive Scaling**: Automatic adaptation across breakpoints
**Circle Preservation**: Maintains circular appearance at all sizes

---

## 📁 File Structure & Organization

### Core Components
```
components/
├── Block.tsx                 # Main tile wrapper component
├── GardenBuilder.tsx        # Main application container
├── LandingPage.tsx          # Welcome/onboarding screen
├── AuthRedirect.tsx         # Authentication handling
├── ProtectedRoute.tsx       # Route protection
├── ErrorBoundary.tsx        # Error handling
└── DebugPanel.tsx           # Development tools
```

### Garden System
```
components/garden/
├── GridEngine.tsx           # Grid layout management
├── Controls.tsx             # Tile creation controls
├── FormPanel.tsx            # Sidebar editor
├── LivePreviewPanel.tsx     # Real-time preview
├── SidebarEditor.tsx        # Content editing
├── TopBar.tsx               # Navigation bar
├── Navbar.tsx               # Main navigation
├── validation.ts            # Form validation
├── tileDefaults.ts          # Default tile configurations
├── tileSizes.ts             # Grid size definitions
└── DataPersistence.ts       # Local storage handling
```

### Tile Components
```
components/tiles/
├── index.ts                 # Tile exports
├── TextTile.tsx             # Text content tiles
├── ThoughtTile.tsx          # Sticky note tiles
├── QuoteTile.tsx            # Quote display tiles
├── ImageTile.tsx            # Image display tiles
├── ImageTileBlock.tsx       # Enhanced image tiles with hover effects
├── VideoTile.tsx            # Basic video display tiles
├── VideoTileBlock.tsx       # Enhanced video tiles with hover effects
├── ProjectTile.tsx          # Project showcase tiles
├── WritingTileBlock.tsx     # Blog/article tiles
├── StatusTile.tsx           # Status update tiles
├── archetype-types.ts       # Project archetype definitions
├── archetype-utils.ts       # Archetype utility functions
└── layout-adapter.ts        # Layout adaptation logic
```

### Template System
```
components/templates/
├── index.ts                 # Template exports
├── types.ts                 # Template type definitions
├── definitions.ts           # Template configurations
├── TemplatePicker.tsx       # Visual template selector
├── TemplateDemo.tsx         # Template preview
├── useTemplatePicker.ts     # Template selection logic
├── useTemplateStyles.ts     # Template styling hook
├── useResponsiveTemplates.ts # Responsive template logic
├── responsive.ts            # Responsive utilities
├── utils.ts                 # Template utilities
└── validation.ts            # Template validation
```

### Authentication & Services
```
lib/
├── auth.ts                  # Authentication logic
├── supabase.ts              # Database client
├── gardenService.ts         # Garden data operations
└── userService.ts           # User management

hooks/
├── useAuth.tsx              # Authentication hook
└── useGarden.tsx            # Garden state management
```

### Styling & Configuration
```
app/
├── globals.css              # Global styles and animations
├── layout.tsx               # Root layout component
└── page.tsx                 # Home page

postcss.config.mjs           # PostCSS configuration
next.config.ts               # Next.js configuration
tsconfig.json                # TypeScript configuration
```

---

## 🎯 Where to Modify Block and Tile Styles

### 1. **Global Styling Changes**
**File**: `app/globals.css`
**What to modify**:
- Color palette variables
- Typography scale
- Animation definitions
- Shadow system
- Background textures

**Example modifications**:
```css
/* Change primary background color */
--color-background: #F5F5F5; /* Instead of #F9F9F9 */

/* Modify shadow intensity */
.shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.15);

/* Add new animation */
@keyframes customFade {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}
```

### 2. **Block Container Styling**
**File**: `components/Block.tsx`
**Function**: `getContainerClasses()`
**What to modify**:
- Border styles and colors
- Background colors
- Hover effects
- Shadow effects
- Border radius
- Transition properties

**Example modifications**:
```typescript
// Change border radius for all tiles
return cn(base, "rounded-[12px] bg-white shadow-sm", border); // Instead of 8px

// Modify hover effects
const border = isEditMode ? "border-2 border-dashed border-blue-300" : "border border-black/[0.08] hover:shadow-3xl hover:shadow-blue/10";

// Add custom styling for specific tile types
if (data.type === 'custom') {
  return cn(base, "rounded-full bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg");
}
```

### 3. **Individual Tile Styling**
**Files**: `components/tiles/[TileName].tsx`
**What to modify**:
- Typography styles
- Layout and spacing
- Color schemes
- Content positioning
- Responsive behavior

**Text Tile Example** (`components/tiles/TextTile.tsx`):
```typescript
// Modify typography
<h3 className="font-sans text-2xl font-bold leading-tight text-gray-900 mb-4">
  {data.title}
</h3>

// Change text color and spacing
<p className="line-clamp-4 text-base leading-relaxed text-gray-600 font-serif">
  {data.content}
</p>
```

**Thought Tile Example** (`components/tiles/ThoughtTile.tsx`):
```typescript
// Modify video container styling
<div className={clsx(
  "absolute inset-0 z-10 transition-transform duration-700 ease-out group-hover:translate-y-[var(--video-shift)]",
  isCircular ? "rounded-full overflow-hidden" : "rounded-xl overflow-hidden"
)}>

// Customize control button styling
<button className={clsx(
  "flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all shadow-lg border pointer-events-auto hover:scale-110",
  data.isLooping !== false 
    ? "bg-white/90 text-black border-white/30 hover:bg-white" 
    : "bg-black/50 text-white border-white/20 hover:bg-black/70"
)}>
```
```typescript
// Modify handwritten font and rotation
<p className="font-hand text-xl sm:text-3xl lg:text-4xl leading-snug text-gray-900 rotate-[-2deg]">
  {data.content || data.title}
</p>
```

### 4. **Project Tile Archetype Styling**
**File**: `components/tiles/ProjectTile.tsx`
**What to modify**:
- Archetype-specific layouts
- Background gradients
- Border styles
- Typography hierarchy
- Image positioning
- **Mobile App Floating Animation**: CSS variables and hover effects

**Mobile App Archetype Styling**:
```typescript
// Modify floating phone animation variables
style={{
  '--phone-rotation': '-12deg',      // Default rotation
  '--phone-offset-x': '20%',         // Horizontal offset
  '--phone-offset-y': '-15%',        // Vertical offset
  '--phone-scale': '0.8',            // Default scale
  '--phone-hover-scale': '1.0'       // Hover scale
}}

// Customize hover transition
className="transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"

// Modify phone frame styling
<div className="bg-slate-900 rounded-[28px] shadow-3xl shadow-slate-900/30">
```

**Example archetype modifications**:
```typescript
// Modify web showcase archetype
if (data.projectArchetype === 'web-showcase') {
  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6">
      {/* Custom styling */}
    </div>
  );
}
```

### 5. **Template System Styling**
**File**: `components/templates/useTemplateStyles.ts`
**What to modify**:
- Circle template properties
- Responsive scaling factors
- Template-specific CSS
- Container dimensions

**Example modifications**:
```typescript
// Modify circle template styling
const circleProps = {
  className: 'rounded-full overflow-hidden border-4 border-white shadow-2xl',
  style: {
    aspectRatio: '1/1',
    clipPath: 'circle(50%)',
    // Custom circle properties
  }
};
```

### 6. **Grid and Layout Styling**
**File**: `components/garden/GridEngine.tsx`
**What to modify**:
- Grid margins and spacing
- Responsive breakpoints
- Row heights
- Column configurations

**Example modifications**:
```typescript
// Modify responsive configuration
const RESPONSIVE_CONFIGS = {
  xl: { cols: 12, rowHeight: 120, margin: [20, 20] }, // Increased spacing
  lg: { cols: 10, rowHeight: 100, margin: [18, 18] },
  // ... other breakpoints
};
```

### 7. **Animation and Transition Styling**
**File**: `app/globals.css`
**What to modify**:
- Hover animations
- Transition durations
- Easing functions
- Transform effects

**Example modifications**:
```css
/* Modify hover transition */
.transition-[background-color,border-color,opacity,box-shadow,transform] {
  transition-duration: 500ms; /* Instead of 700ms */
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); /* Different easing */
}

/* Add custom hover effect */
.custom-hover:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}
```

### 8. **Color System Modifications**
**File**: `components/Block.tsx`
**Constant**: `PASTEL_COLORS`
**What to modify**:
- Color palette for tiles
- Color cycling behavior
- Default colors

**Example modifications**:
```typescript
const PASTEL_COLORS = [
  '#ffffff', '#f0f9ff', '#ecfdf5', '#fef7cd', '#fce7f3', 
  '#f3e8ff', '#e0f2fe', '#f0fdfa', '#fffbeb', '#fdf2f8'
]; // Custom pastel palette
```

### 9. **Typography System**
**Files**: Multiple tile components
**What to modify**:
- Font families
- Font sizes
- Font weights
- Line heights
- Letter spacing

**Global font modifications** in `app/globals.css`:
```css
@theme inline {
  --font-sans: 'Custom Sans', var(--font-inter);
  --font-serif: 'Custom Serif', var(--font-newsreader);
  --font-hand: 'Custom Hand', var(--font-caveat);
}
```

### 10. **Responsive Design Modifications**
**File**: `components/templates/responsive.ts`
**What to modify**:
- Breakpoint definitions
- Scaling factors
- Mobile-specific styling
- Tablet adaptations

---

## 🔄 Data Flow & State Management

### Current State Architecture
- **Local Component State**: React useState for UI interactions
- **Props Drilling**: Parent-child data flow for tile updates
- **Local Storage**: Basic persistence (development only)
- **No Global State**: Ready for Redux/Zustand integration

### Block Data Interface
```typescript
export interface BlockData {
  // Core identification
  id: string;
  type: BlockType;
  category: string;
  
  // Grid positioning
  x: number; y: number; w: number; h: number;
  
  // Universal content fields
  title?: string; content?: string; link?: string; color?: string;
  
  // Type-specific fields
  imageUrl?: string; videoUrl?: string; author?: string;
  publishedAt?: Date | string; excerpt?: string;
  
  // Project archetype system
  projectArchetype?: 'web-showcase' | 'mobile-app' | 'concept-editorial';
  archetypeConfig?: ArchetypeConfig;
  
  // Styling options
  isTransparent?: boolean; objectFit?: 'cover' | 'contain';
  videoShape?: 'rectangle' | 'circle';
}
```

---

## 🚀 Backend Integration Requirements

### Database Schema
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Gardens table
CREATE TABLE gardens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) DEFAULT 'My Digital Garden',
  is_public BOOLEAN DEFAULT false,
  slug VARCHAR(100) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tiles table
CREATE TABLE tiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  garden_id UUID REFERENCES gardens(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  x INTEGER NOT NULL, y INTEGER NOT NULL,
  w INTEGER NOT NULL, h INTEGER NOT NULL,
  content JSONB NOT NULL,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Required API Endpoints
```
Authentication:
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

Garden Management:
GET    /api/gardens
POST   /api/gardens
GET    /api/gardens/:id
PUT    /api/gardens/:id
DELETE /api/gardens/:id

Tile Operations:
GET    /api/gardens/:id/tiles
POST   /api/gardens/:id/tiles
PUT    /api/tiles/:id
DELETE /api/tiles/:id
POST   /api/tiles/batch-update

Media Upload:
POST   /api/media/upload
DELETE /api/media/:id
```

---

## 🎨 Design Philosophy & Aesthetic Guidelines

### Visual Principles
1. **Calm Minimalism**: Subtle colors, generous whitespace, soft shadows
2. **Editorial Quality**: Typography-focused, readable, sophisticated
3. **Organic Feel**: Slight rotations, natural spacing, handwritten elements
4. **Consistent Interaction**: Predictable hover states, smooth transitions
5. **Responsive Elegance**: Graceful adaptation across all screen sizes

### Color Psychology
- **Soft Backgrounds**: Reduce eye strain, promote focus
- **Pastel Accents**: Gentle, non-aggressive color cycling
- **High Contrast Text**: Ensure readability and accessibility
- **Subtle Shadows**: Create depth without harshness

### Typography Hierarchy
1. **Display Text**: Serif fonts for editorial feel (titles, quotes)
2. **Body Text**: Sans-serif for readability (descriptions, content)
3. **Handwritten**: Script fonts for personal touch (thoughts, notes)
4. **Monospace**: Technical information (grid sizes, debug info)

---

## 🔮 Future Enhancement Roadmap

### Phase 2: Backend Integration
- User authentication and profiles
- Cloud data persistence
- Public garden sharing
- Media upload and optimization
- Real-time collaboration

### Phase 3: Advanced Features
- Rich text editing
- Template marketplace
- Export capabilities (PDF, image, static site)
- Analytics and insights
- Mobile applications

### Phase 4: Enterprise Features
- Team workspaces
- Advanced permissions
- API integrations
- Custom domains
- White-label solutions

---

## 🛠️ Development Guidelines

### Code Style
- **TypeScript**: Strict typing for all components
- **Functional Components**: React hooks over class components
- **Tailwind CSS**: Utility-first styling approach
- **Component Composition**: Reusable, modular architecture
- **Performance**: Optimized rendering and state management

### Testing Strategy
- **Unit Tests**: Individual component testing
- **Integration Tests**: User workflow testing
- **Visual Regression**: Screenshot comparison testing
- **Performance Tests**: Load time and interaction testing
- **Accessibility Tests**: WCAG compliance verification

### Performance Optimizations
- **Image Optimization**: WebP conversion, lazy loading
- **Code Splitting**: Dynamic imports for large components
- **Memoization**: React.memo for expensive renders
- **Virtual Scrolling**: For large tile collections
- **Service Workers**: Offline functionality and caching

---

## 📊 Success Metrics

### User Experience Goals
- **Time to First Tile**: < 30 seconds from landing
- **Learning Curve**: All tile types understood within 5 minutes
- **Performance**: Grid interactions feel instant (< 100ms)
- **Mobile Usage**: 40%+ of users access via mobile

### Technical Goals
- **Uptime**: 99.9% availability
- **Load Time**: < 2 seconds initial page load
- **Image Optimization**: 80% reduction in file sizes
- **Database Performance**: < 50ms average query time

---

This comprehensive documentation captures the complete current state of the Digital Garden project, providing detailed information about architecture, styling, and implementation for future development and maintenance.