# MEGA_CONTEXT.md - Digital Garden Architecture Guide

> **For the Learning Developer**: This document explains how your entire Digital Garden application works, how components connect, and what you should focus on learning next.

---

## 🏗️ OVERALL ARCHITECTURE

Your Digital Garden is a **Next.js 16 + React 19 + TypeScript** application that lets users create visual portfolios with draggable tiles. Think of it like a personal website builder, but more creative and flexible.

### The Big Picture
```
User visits app → Authentication check → Load their garden → Edit tiles → Auto-save to database
```

**Key Technologies:**
- **Frontend**: Next.js (React framework) with TypeScript for type safety
- **Database**: Supabase (PostgreSQL with real-time features)
- **Styling**: Tailwind CSS (utility-first CSS framework)
- **Grid System**: React Grid Layout (drag-and-drop grid)
- **Animations**: Framer Motion (smooth animations)
- **Authentication**: Supabase Auth (handles login/signup/OAuth)

---

## 🔐 AUTHENTICATION FLOW - How Users Get In

**The Journey:**
1. User visits any page → `middleware.ts` intercepts the request
2. Middleware checks if user has valid Supabase session
3. If accessing protected route without auth → redirect to `/login`
4. User signs in → `authService` handles Supabase authentication
5. User profile created in database → redirect to their garden

**Key Files to Understand:**
- `middleware.ts` - The bouncer at the door, checks every request
- `hooks/useAuth.tsx` - React hook that manages user state
- `lib/auth.ts` - Service that talks to Supabase for login/signup
- `lib/userService.ts` - Creates user profiles in database

**What You Should Learn:**
- How middleware works in Next.js (runs before every request)
- React Context API (how `AuthProvider` shares user data)
- Async/await patterns (how authentication calls work)
- Error handling in authentication flows

---

## 🎨 THE GARDEN SYSTEM - Core of Your App

### What is a "Garden"?
A garden is a user's personal space containing tiles (content blocks) arranged on a grid. Each user can have multiple gardens.

### Data Structure
```typescript
Garden {
  id: string
  user_id: string
  title: string
  tiles: TileData[]     // Array of all tiles
  layout: LayoutData    // Grid positions
  is_public: boolean
  slug: string         // For public URLs
}
```

### The 7 Tile Types
1. **Text** - Simple text content
2. **Thought** - Sticky note style with handwritten font
3. **Quote** - Inspirational quotes with attribution
4. **Image** - Photos with hover effects and polaroid style
5. **Video** - Videos/GIFs with custom controls
6. **Project** - Portfolio items with 3 different display styles
7. **Writing** - Blog posts with dates and excerpts

**What You Should Learn:**
- How JSONB works in PostgreSQL (storing complex data as JSON)
- TypeScript interfaces and type safety
- Component composition patterns
- State management with React hooks

---

## 🔄 DATA FLOW - How Information Moves

### The Complete Flow
```
User Action (add tile)
  ↓
GardenBuilder updates local state (immediate UI update)
  ↓
localStorage backup (for crash recovery)
  ↓
Auto-save timer starts (2 second delay)
  ↓
useGarden hook calls gardenService
  ↓
gardenService updates Supabase database
  ↓
Save status updates in UI
```

### Key Components in the Flow
- **GardenBuilder.tsx** - Main container, holds all state
- **useGarden.tsx** - Custom hook managing database operations
- **gardenService.ts** - Service layer for API calls
- **GridEngine.tsx** - Handles grid layout and drag-drop

**What You Should Learn:**
- React state management (useState, useEffect)
- Custom hooks pattern (reusable logic)
- Service layer pattern (separating API calls)
- Debouncing (preventing too many API calls)

---

## 📱 RESPONSIVE DESIGN - Works on All Devices

### Breakpoint System
```
Desktop (1400px+): 12 columns, full features
Tablet (768px+):   8 columns, scaled down
Mobile (576px-):   4 columns, compact layout
```

### How It Works
- **GridEngine** calculates optimal tile positions for each screen size
- Tiles automatically resize and reposition
- Some features hide on mobile for better UX
- CSS Grid and Flexbox handle the responsive layout

**What You Should Learn:**
- CSS Grid and Flexbox fundamentals
- Mobile-first design principles
- Responsive breakpoints and media queries
- Performance optimization for mobile

---

## 🧩 COMPONENT ARCHITECTURE - How UI Pieces Connect

### Component Hierarchy
```
GardenBuilder (main container)
├── SplitTopBar (navigation, save status)
├── GridEngine (drag-drop grid)
│   └── Block (tile wrapper) × N
│       ├── ImageTileBlock
│       ├── VideoTileBlock
│       ├── ProjectTile
│       └── Other tile types...
├── Controls (add tile buttons)
├── SidebarEditor (edit panel)
└── TileShowcase (preview modal)
```

### Communication Pattern
- **Props Down**: Parent passes data to children
- **Callbacks Up**: Children notify parents of changes
- **Context**: Shared state (like user auth) available everywhere
- **Hooks**: Reusable logic shared between components

**What You Should Learn:**
- React component composition
- Props vs state vs context
- When to lift state up
- Component lifecycle and effects

---

## 💾 DATABASE DESIGN - How Data is Stored

### Main Tables
```sql
users (Supabase Auth + custom profile)
├── id, email, display_name, avatar_url
└── onboarding_completed, preferences

gardens (user's creative spaces)
├── id, user_id, title, description
├── tiles (JSONB array)
├── layout (JSONB object)
└── is_public, slug, view_count

media_assets (uploaded files)
├── id, user_id, garden_id
├── file_name, file_type, storage_path
└── thumbnail_path, alt_text
```

### Why JSONB?
- Stores complex tile data as JSON in PostgreSQL
- Allows flexible tile properties without schema changes
- Enables fast queries on JSON properties
- Perfect for dynamic content like tiles

**What You Should Learn:**
- Relational database concepts (foreign keys, relationships)
- JSON vs JSONB in PostgreSQL
- Database indexing and performance
- Data modeling best practices

---

## 🔧 STATE MANAGEMENT - How Data Flows in React

### Current Approach
- **Local State**: `useState` for component-specific data
- **Custom Hooks**: `useGarden`, `useAuth` for business logic
- **Context**: `AuthProvider` for user data
- **localStorage**: Backup and user preferences

### State Flow Example
```typescript
// User clicks "Add Image Tile"
const handleAddTile = () => {
  const newTile = createImageTile();
  setBlocks([...blocks, newTile]);  // Local state update
  autoSave(blocks);                 // Trigger database save
};
```

**What You Should Learn:**
- useState vs useEffect vs useCallback
- Custom hooks pattern
- Context API for global state
- When to use local vs global state

---

## 🧪 TESTING STRATEGY - Ensuring Quality

### Current Setup
- **Jest** - Testing framework
- **React Testing Library** - Component testing
- **Property-based testing** - Edge case discovery

### Testing Patterns
```typescript
// Component test example
test('renders image tile with correct src', () => {
  render(<ImageTile imageUrl="test.jpg" />);
  expect(screen.getByRole('img')).toHaveAttribute('src', 'test.jpg');
});
```

**What You Should Learn:**
- Unit vs integration vs e2e testing
- Testing React components
- Mocking external dependencies
- Test-driven development (TDD)

---

## 🚀 PERFORMANCE OPTIMIZATIONS

### Current Optimizations
- **Auto-save debouncing** - Prevents excessive API calls
- **localStorage backup** - Instant recovery from crashes
- **Lazy loading** - Components load when needed
- **Image optimization** - Next.js automatic optimization
- **React Compiler** - Automatic performance optimizations

### Performance Patterns
```typescript
// Debounced auto-save
const debouncedSave = useCallback(
  debounce((data) => gardenService.save(data), 2000),
  []
);
```

**What You Should Learn:**
- React performance patterns (useMemo, useCallback)
- Debouncing and throttling
- Image optimization techniques
- Bundle size optimization

---

## 🔗 HOW EVERYTHING CONNECTS

### The Complete User Journey
1. **Landing** → User visits app
2. **Auth Check** → Middleware validates session
3. **Garden Load** → useGarden hook fetches data
4. **Render** → GardenBuilder displays tiles in GridEngine
5. **Interaction** → User drags tiles, GridEngine updates positions
6. **Auto-save** → Changes saved to database after 2s
7. **Real-time** → UI shows save status

### Key Integration Points
- **Middleware ↔ Auth Service** - Session validation
- **GardenBuilder ↔ useGarden** - State management
- **GridEngine ↔ Block Components** - Layout management
- **Tile Components ↔ Database** - Content persistence

---

## 📚 WHAT YOU SHOULD LEARN NEXT

### Beginner Level (Start Here)
1. **React Fundamentals**
   - Components, props, state
   - useEffect and component lifecycle
   - Event handling and forms

2. **TypeScript Basics**
   - Type annotations and interfaces
   - Generic types
   - Type safety benefits

3. **CSS/Tailwind**
   - Flexbox and Grid
   - Responsive design
   - Utility-first CSS

### Intermediate Level
1. **React Patterns**
   - Custom hooks
   - Context API
   - Component composition
   - Error boundaries

2. **Next.js Features**
   - File-based routing
   - API routes
   - Middleware
   - Server vs client components

3. **Database Concepts**
   - SQL basics
   - Relationships and foreign keys
   - JSON/JSONB in PostgreSQL

### Advanced Level
1. **Architecture Patterns**
   - Service layer pattern
   - Repository pattern
   - State management (Redux/Zustand)
   - Micro-frontends

2. **Performance**
   - React performance optimization
   - Database query optimization
   - Caching strategies
   - Bundle optimization

3. **Testing**
   - Test-driven development
   - Integration testing
   - E2E testing with Playwright
   - Performance testing

---

## 🎯 CURRENT STRENGTHS OF YOUR ARCHITECTURE

### What's Working Well
✅ **Clean Separation**: UI, business logic, and data layers are well-separated
✅ **Type Safety**: TypeScript prevents many runtime errors
✅ **Responsive**: Works great on all device sizes
✅ **Performance**: Auto-save, debouncing, and optimistic updates
✅ **Security**: Proper authentication and route protection
✅ **Scalable**: Easy to add new tile types and features

### Areas for Future Enhancement
🔄 **State Management**: Consider Redux Toolkit for complex state
🔄 **Real-time**: Add WebSocket support for live collaboration
🔄 **Testing**: Expand test coverage for better reliability
🔄 **Accessibility**: Add ARIA labels and keyboard navigation
🔄 **SEO**: Improve meta tags and social sharing

---

## 🛠️ DEVELOPMENT WORKFLOW

### Daily Development
```bash
# Start development
npm run dev

# Run tests
npm run test:watch

# Check types
npx tsc --noEmit

# Lint code
npm run lint
```

### Adding New Features
1. **Plan** - Understand the requirement
2. **Design** - Sketch component structure
3. **Implement** - Write TypeScript components
4. **Test** - Add unit and integration tests
5. **Review** - Check performance and accessibility

---

## 🎓 LEARNING RESOURCES

### Essential Reading
- [React Documentation](https://react.dev) - Official React docs
- [Next.js Documentation](https://nextjs.org/docs) - Next.js features
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript guide
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS

### Practice Projects
- Build a todo app with React + TypeScript
- Create a blog with Next.js
- Build a dashboard with charts and data
- Make a real-time chat app

### Code Quality
- Learn ESLint and Prettier
- Understand Git workflows
- Practice code reviews
- Study design patterns

---

## 🎉 CONCLUSION

Your Digital Garden application is well-architected with modern patterns and best practices. The separation of concerns, type safety, and responsive design make it a solid foundation for learning and growth.

**Key Takeaways:**
- Focus on understanding React fundamentals first
- Learn TypeScript gradually - it will save you time
- Practice reading and writing tests
- Study how data flows through your application
- Don't be afraid to experiment and break things

Remember: Every senior developer started where you are now. The fact that you want to understand the architecture shows you're on the right path to becoming a better developer!

---

*This document is your roadmap. Refer back to it as you learn and grow. Update it as you discover new patterns and techniques.*