# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Culture-mate (컬쳐메이트) is a Next.js React application that serves as a cultural events and community platform. The project uses:

- **Next.js 15.4.4** with App Router and Turbopack for development
- **React 19.1.0** with client-side state management
- **Tailwind CSS 4** for styling
- **react-router-dom** for additional routing functionality

## Development Commands

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Architecture & Structure

### App Router Structure
The application uses Next.js App Router with the following main routes:
- `/` - Home page (placeholder)
- `/events` - Event listings and gallery
- `/with` - Companion finding feature
- `/community` - Community discussions
- `/mypage` - User profile page

### Component Organization
Components are organized by feature area under `/components/`:
- `global/` - Shared components (NavigationBar, Gallery, SearchBar, etc.)
- `events/` - Event-specific components
- `community/`, `with/`, `mypage/` - Feature-specific components

### Key Architectural Patterns

1. **Centralized Constants**: All routes, images, and icons are defined in `/constants/path.jsx` using named exports (ROUTES, IMAGES, ICONS)

2. **Global Layout**: RootLayout in `app/layout.jsx` includes NavigationBar and a centered main container with responsive padding

3. **Authentication State**: Uses localStorage for token-based authentication checking in NavigationBar component

4. **Responsive Design**: Uses Tailwind's clamp() function for responsive spacing and sizing

### Styling Conventions
- Korean language support (lang="ko" in layout)
- Consistent use of Tailwind utility classes
- Custom responsive values using clamp() for fluid design
- Color scheme: White backgrounds with gray text for secondary content

### Image Management
All images are stored in `/public/img/` and referenced through the IMAGES and ICONS constants. The Gallery component includes a default image fallback system.

### Component Patterns
- Client components marked with "use client" directive
- Consistent prop destructuring with default values
- Event handlers follow naming convention with "Handler" suffix
- State management using React hooks (useState, useEffect)