# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Development Commands

```bash
# Install dependencies
bun install

# Development server (port 3000, logs to dev.log)
bun run dev

# Production build
bun run build

# Production server (run from build output)
bun run start

# Linting (no tests exist in this codebase)
bun run lint

# Database operations
bun run db:push      # Push schema changes to database
bun run db:generate  # Generate Prisma client
bun run db:migrate   # Run migrations
bun run db:reset     # Reset database
bun run db:seed      # Seed database
```

## Architecture Overview

This is a Next.js 16 personal website/portfolio with a secure admin portal. The app uses a client-side admin interface with JWT-based authentication backed by Prisma and PostgreSQL.

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui Radix primitives
- **Animations**: Framer Motion
- **Database**: Prisma ORM with PostgreSQL
- **State**: Zustand for client state
- **Auth**: JWT tokens stored in httpOnly cookies + bcrypt
- **Markdown**: Custom simple markdown parser
- **Package Manager**: Bun

### Project Structure

```
src/
├── app/              # Next.js App Router pages and API routes
│   ├── api/          # API endpoints
│   │   ├── admin/    # Admin authentication
│   │   ├── gallery/  # Gallery CRUD
│   │   ├── journal/  # Journal CRUD
│   │   ├── upload/   # Image uploads
│   │   └── ...
│   ├── admin/        # Admin portal page (large file)
│   └── page.tsx      # Landing page
├── components/       # Reusable React components
│   ├── ui/          # shadcn/ui primitives
│   └── *.tsx       # Animations, layout components
└── lib/            # Core utilities
    ├── db.ts       # Prisma client singleton
    ├── security.ts # Auth, rate limiting, password hashing, JWT
    ├── middleware.ts # API middleware (error handling, CORS, logging)
    ├── validations.ts # Zod schemas
    └── ...
```

## Code Style Guidelines

### General Principles

- **No unnecessary comments** - Avoid adding comments unless explicitly requested
- **Prefer named exports** for functions and components
- **Use TypeScript** for all files - no plain JavaScript
- **Avoid `any`** - Use proper types or `unknown` when necessary
- **Use functional components** with hooks - no class components
- **Prefer `const`** over `let` - only use `let` when reassignment is truly needed
- **Prefer string literals** over enums where possible (e.g., gallery series)

### Imports

- **Sort imports** logically: external libs → internal modules → relative paths
- **Use `type` keyword** for type-only imports to improve performance
- **Avoid barrel imports** (index files) - import directly from modules

```typescript
// Good
import { NextRequest, NextResponse } from 'next/server';
import { getCorsHeaders, logRequest } from '@/lib/security';
import type { CreateGalleryImageInput } from '@/lib/validations';

// Client components
"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
```

### File Naming

- **Components**: PascalCase (e.g., `PageTransition.tsx`, `GalleryGrid.tsx`)
- **Utilities/Modules**: camelCase (e.g., `utils.ts`, `security.ts`, `store.ts`)
- **Types**: PascalCase with `.types.ts` suffix or co-located with `type` keyword
- **Constants**: PascalCase for exported constants, camelCase for internal

### Component Patterns

- **Props interface** should be defined inline for small components, or above the component
- **Use defaults** for optional props in function parameters
- **Extract complex types** to shared types file if reused across multiple components

```typescript
// Good component pattern
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  variant?: "fade" | "slide" | "scale";
}

export function PageTransition({ 
  children, 
  className = "",
  variant = "slide" 
}: PageTransitionProps) {
  // Component implementation
}
```

### React Hooks

- **Extract custom hooks** to `src/lib/hooks.ts` or component file
- **Use `useCallback`** for event handlers passed to memoized components
- **Use `useMemo`** for expensive calculations
- **Always include dependencies** in useEffect (lint rule is disabled but prefer correctness)
- **Check for SSR** when using browser APIs (e.g., `typeof window !== 'undefined'`)

```typescript
// Good hook usage
const handleMouseMove = useCallback((e: React.MouseEvent) => {
  if (prefersReducedMotion || disabled || !ref.current) return;
  // ...
}, [prefersReducedMotion, disabled, strength]);

const items = useMemo(() => {
  return data.filter(item => item.active);
}, [data]);
```

### API Routes

- **Wrap handlers** with `withMiddleware()` for consistent error handling, CORS, logging
- **Use named handlers** (GET, POST, etc.)
- **Validate input** using Zod schemas from `validations.ts`
- **Use error classes** from middleware: `ValidationError`, `AuthenticationError`, `NotFoundError`, etc.
- **Return responses** using `successResponse()`, `errorResponse()`, or `paginatedResponse()`

```typescript
// Good API route pattern
import { NextRequest } from 'next/server';
import { withMiddleware } from '@/lib/middleware';
import { validateInput, successResponse, NotFoundError } from '@/lib/middleware';
import { createGalleryImageSchema } from '@/lib/validations';

export const GET = withMiddleware(async (request: NextRequest) => {
  const body = await request.json();
  const data = validateInput(createGalleryImageSchema, body);
  
  // ... implementation
  
  return successResponse(image);
});
```

### Error Handling

- **Use custom error classes** for different error types (see `middleware.ts`)
- **Log errors** appropriately with `console.error`
- **Return structured errors** with `errorResponse()`

```typescript
// Throwing errors
throw new ValidationError('Invalid input', { field: 'email' });
throw new AuthenticationError();
throw new NotFoundError('Image');
```

### Zod Schemas

- **Define schemas** in `src/lib/validations.ts`
- **Export types** using `z.infer<typeof schemaName>`
- **Use descriptive error messages** in schema definitions
- **Chain validators** for complex validation

```typescript
// Good schema pattern
export const createGalleryImageSchema = z.object({
  src: z.string().url('Invalid image URL').or(z.string().startsWith('/images/')),
  alt: z.string().min(1, 'Alt text is required').max(200),
  series: z.enum(['recent-post', 'tech-deck', 'project']),
});

export type CreateGalleryImageInput = z.infer<typeof createGalleryImageSchema>;
```

### CSS / Tailwind

- **Use Tailwind** for all styling - no custom CSS files unless necessary
- **Use `cn()` utility** from `utils.ts` for conditional classes
- **Prefer semantic class names** where possible
- **Use CSS variables** for theming (`--primary`, `--background`, etc.)

```typescript
// Good className usage
className={cn(
  "base-styles",
  isActive && "active-styles",
  variant === "primary" ? "bg-primary" : "bg-secondary"
)}
```

### Accessibility

- **Support reduced motion** - check `useReducedMotion()` preference
- **Use semantic HTML** elements
- **Include proper ARIA attributes** when needed

### Database (Prisma)

- **Use Prisma Client** from `db.ts` singleton
- **Define models** in `prisma/schema.prisma`
- **Run migrations** for schema changes: `bun run db:generate && bun run db:push`
- **Use TypeScript types** generated by Prisma

## Key Systems

**Authentication Flow**
- Login at `/admin` → POST to `/api/admin/auth` → JWT token stored in `admin-session` httpOnly cookie → Validated on each API request
- Rate limiting: 5 requests per 60 seconds (configurable via env vars)
- Session validation checks both JWT signature and database session record
- Default password: `senpai2024` (set via `ADMIN_PASSWORD` env var)

**Gallery System**
- Images organized into 3 series: `recent-post`, `tech-deck`, `project`
- Stores: src, alt, caption, series, dimensions, date, blurDataURL
- Supports drag-drop upload, batch operations, search, filtering

**Journal System**
- Markdown entries with title, date, content, quote, image, tags
- Tags are stored with many-to-many relationship
- Custom markdown → HTML converter in admin panel (no external markdown library)

**Admin Portal**
- Large single-file component (~1800 lines) with tabs for: gallery, journal, settings, activity, analytics, export/import
- Client-side authentication check via `/api/admin/auth` GET endpoint
- All CRUD operations go through API routes for security

**Middleware Pattern**
- API routes use `withMiddleware()` wrapper for:
  - CORS handling
  - Request logging to `RequestLog` model
  - Error handling with `errorResponse()`
  - Response formatting with `successResponse()`
- Custom error classes: `ValidationError`, `AuthenticationError`, `RateLimitError`, etc.

**Security**
- Password hashing with bcrypt (12 rounds)
- JWT tokens with expiration
- Rate limiting per IP address (in-memory Map, can be replaced with Redis in production)
- Session validation checks both token and database record
- Login attempts tracked in `LoginAttempt` model
- CSRF protection via httpOnly cookies

## Database Schema Highlights

Key models:
- `AdminUser` - Single admin user with password hash
- `Session` - Active user sessions with tokens
- `GalleryImage` - Gallery photos with series classification
- `JournalEntry` - Blog posts with markdown content
- `Settings` - Site-wide configuration
- `ActivityLog` - Audit trail for admin actions
- `RequestLog` - API request logging

Note: Schema uses PostgreSQL, not SQLite (schema.prisma sets `provider = "postgresql"`)

## Important Notes

- **Images**: Uploaded to `/public/uploads/images/`, served statically
- **No test files**: This codebase intentionally does not have test files
- **TypeScript build errors**: Ignored in config (`typescript.ignoreBuildErrors: true`)
- **Image optimization**: Disabled (`images.unoptimized: true`) in next.config.ts
- **Standalone output**: Configured for production deployment
- **CORS**: Handled in middleware for API routes
- **Admin password**: Must be set via `ADMIN_PASSWORD` env var, defaults to `senpai2024` if not set
- **Database URL**: Set via `DATABASE_URL` env variable

## Environment Variables

Required for production:
- `DATABASE_URL` - PostgreSQL connection string
- `ADMIN_PASSWORD` - Admin portal password
- `JWT_SECRET` - JWT signing secret
- `SESSION_MAX_AGE` - Session timeout (ms)
- `RATE_LIMIT_MAX` - Max requests per window
- `RATE_LIMIT_WINDOW_MS` - Time window for rate limiting

## Common Tasks

**Add new API endpoint**: Create `src/app/api/your-endpoint/route.ts`, export named handlers (GET, POST, etc.) wrapped with `withMiddleware()`, add to `RequestLog` via `logRequest()`

**Update database schema**: Modify `prisma/schema.prisma`, run `bun run db:generate`, then `bun run db:push`

**Add shadcn/ui component**: Use CLI then place in `src/components/ui/`

**Add admin functionality**: Modify `/admin/page.tsx` (large file) or extract to separate components as needed