# 药记 (YaoJi) - Medication Tracking App

## Overview

药记 is a Chinese-language medication tracking Progressive Web App (PWA) designed for mobile-first use. Users can manage their medications, log doses with one tap, view statistics and streaks, and add the app to their home screen. The app features a dark cyberpunk-inspired UI with neon color accents and smooth animations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state, local component state for UI
- **Styling**: Tailwind CSS v4 with custom CSS variables for theming
- **UI Components**: shadcn/ui component library (New York style) with Radix UI primitives
- **Animations**: Framer Motion for smooth transitions and drag-and-drop reordering
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful JSON API under `/api/*` endpoints
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Validation**: Zod with drizzle-zod integration for type-safe validation

### Data Storage
- **Database**: PostgreSQL (configured via DATABASE_URL environment variable)
- **ORM**: Drizzle ORM with pg driver
- **Schema Location**: `shared/schema.ts` contains both database tables and Zod validation schemas
- **Tables**: 
  - `medications` - stores medication definitions (name, dosage, frequency, color, icon)
  - `medication_logs` - stores timestamped records of when medications were taken

### Project Structure
```
├── client/           # Frontend React application
│   ├── src/
│   │   ├── components/   # UI components (custom + shadcn)
│   │   ├── pages/        # Route pages (Home, Stats)
│   │   ├── lib/          # API client, hooks, utilities
│   │   └── hooks/        # Custom React hooks
├── server/           # Backend Express application
│   ├── index.ts      # Server entry point
│   ├── routes.ts     # API route definitions
│   ├── storage.ts    # Database operations layer
│   └── vite.ts       # Vite dev server integration
├── shared/           # Shared code between client/server
│   └── schema.ts     # Database schema and types
├── db/               # Database connection
│   └── index.ts      # Drizzle/pg pool setup
└── migrations/       # Drizzle migration files
```

### Key Design Decisions

1. **Monorepo with Shared Types**: The `shared/` directory contains schema definitions used by both frontend and backend, ensuring type safety across the stack.

2. **API Layer Abstraction**: The frontend uses a dedicated `lib/api.ts` module for all HTTP calls, with React Query hooks in `lib/hooks.ts` for data fetching and mutations.

3. **Mobile-First PWA**: The app is designed for mobile use with safe area insets, touch-friendly interactions, and home screen installation support.

4. **Drag-and-Drop Reordering**: Medications can be reordered via drag-and-drop using Framer Motion's Reorder components.

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connection via `DATABASE_URL` environment variable
- **Drizzle Kit**: Database migrations and schema management (`npm run db:push`)

### Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **framer-motion**: Animations and gesture handling
- **wouter**: Client-side routing
- **date-fns**: Date manipulation utilities
- **lucide-react**: Icon library

### UI Framework
- **shadcn/ui**: Pre-built accessible components
- **Radix UI**: Headless UI primitives (dialogs, dropdowns, etc.)
- **Tailwind CSS v4**: Utility-first styling with @tailwindcss/vite plugin

### Build & Development
- **Vite**: Frontend build tool with HMR
- **esbuild**: Server-side bundling for production
- **tsx**: TypeScript execution for development