# The Social Runner - Project Files for Git

This document lists all the project files that should be tracked in version control.

## Configuration Files
- `package.json` - Node.js dependencies and scripts
- `package-lock.json` - Locked dependency versions
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `components.json` - Shadcn/UI component configuration
- `drizzle.config.ts` - Database ORM configuration
- `.gitignore` - Git ignore rules
- `README.md` - Project documentation

## Frontend Application (client/)
- `client/index.html` - Main HTML template
- `client/src/main.tsx` - React application entry point
- `client/src/App.tsx` - Main application component
- `client/src/index.css` - Global styles and CSS variables

### Pages (client/src/pages/)
- `about.tsx` - About page with founder story
- `auth.tsx` - Multi-provider authentication page
- `buddy-matching.tsx` - Running buddy finder
- `calendar.tsx` - Event calendar view
- `contact.tsx` - Contact information
- `create-event.tsx` - Event creation form
- `drag-drop-create.tsx` - Visual event creation
- `home.tsx` - Main dashboard for authenticated users
- `landing.tsx` - Landing page for visitors
- `my-events.tsx` - User's event management
- `news-article.tsx` - Individual news article view
- `news.tsx` - News and blog section
- `not-found.tsx` - 404 error page
- `notifications.tsx` - User notifications
- `parkrun-events.tsx` - Australian parkrun events
- `profile-setup.tsx` - Profile completion flow
- `profile.tsx` - User profile management
- `strava-club-sync.tsx` - Strava club integration

### Components (client/src/components/)
- UI components from Shadcn/UI library
- Custom components for navigation, events, maps, etc.

### Hooks (client/src/hooks/)
- `useAuth.ts` - Authentication state management
- `useOnboarding.ts` - User onboarding flow
- `use-toast.ts` - Toast notification system
- `use-mobile.tsx` - Mobile device detection

### Libraries (client/src/lib/)
- `authUtils.ts` - Authentication utilities
- `maps.ts` - Map integration helpers
- `profileUtils.ts` - Profile management utilities
- `queryClient.ts` - TanStack Query configuration
- `utils.ts` - General utility functions

## Backend Application (server/)
- `index.ts` - Express server entry point
- `routes.ts` - Main API route definitions
- `storage.ts` - Database storage interface
- `vite.ts` - Vite integration for development
- `db.ts` - Database connection configuration

### Authentication (server/)
- `buddyMatching.ts` - Buddy matching algorithm
- `emailAuth.ts` - Email/password authentication
- `notifications.ts` - Notification system
- `replitAuth.ts` - Replit OAuth integration
- `stravaAuth.ts` - Strava and Google OAuth
- `stravaClubSync.ts` - Strava club event sync

### Route Handlers (server/routes/)
- Additional route modules for specific features

## Shared Code (shared/)
- `schema.ts` - Database schema and TypeScript types
- `australianLocations.ts` - Australian location data

## Scripts (scripts/)
- Build and deployment automation scripts

## Assets
- SVG logos and graphics
- Profile pictures and event images
- Static assets for the application

## Environment Configuration
- `.env.example` - Template for environment variables
- Environment variables are stored as Replit secrets

## Total Files: 100+ source files
This represents a comprehensive full-stack TypeScript application with authentication, database integration, and modern React frontend.