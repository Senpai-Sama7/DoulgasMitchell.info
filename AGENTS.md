# AGENTS.md

This file provides guidance to AI coding agents working in this repository.

## Project Overview

**Senpai's Isekai** (douglasmitchell.info) - a Next.js 16 personal blog/portfolio with PostgreSQL, Prisma ORM, JWT auth, and an admin portal.

## Technology Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript 5
- **Styling**: Tailwind CSS 4 + CSS Variables
- **UI**: shadcn/ui + Radix primitives + Framer Motion
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT (httpOnly cookies) + bcrypt + WebAuthn/Passkeys
- **Package Manager**: Bun (also supports npm)

## Build and Development Commands

```bash
# Install dependencies
bun install

# Development server (port 3000, logs to dev.log)
bun run dev

# Production build + standalone setup
bun run build

# Production server (from build output)
bun run start

# Linting
bun run lint

# Type checking
bun run typecheck

# Testing (uses Vitest)
bun run test              # Run all tests
bun run test -- run       # Same as above
bun vitest run src/lib/utils.test.ts  # Run single test file

# Database operations
bun run db:push       # Push schema changes
bun run db:generate   # Generate Prisma client
bun run db:migrate    # Run migrations
bun run db:reset      # Reset database
bun run db:seed       # Seed initial data
```

## Code Style Guidelines

### General Principles

- **No unnecessary comments** - Avoid unless explicitly requested
- **Prefer named exports** for functions and components
- **Use TypeScript** for all files - no plain JavaScript
- **Avoid `any`** - Use proper types or `unknown`
- **Use functional components** with hooks - no class components
- **Prefer `const`** over `let`
- **Prefer string literals** over enums

### Imports

Sort logically: external libs → internal modules → relative paths. Use `type` keyword for type-only imports.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCorsHeaders, logRequest } from '@/lib/security';
import type { CreateGalleryImageInput } from '@/lib/validations';

// Client components
"use client";
import { useState, useEffect, useCallback } from "react";
```

### File Naming

- **Components**: PascalCase (`PageTransition.tsx`, `GalleryGrid.tsx`)
- **Utilities**: camelCase (`utils.ts`, `security.ts`, `store.ts`)
- **Types**: PascalCase with `.types.ts` suffix or inline with `type` keyword

### Component Patterns

```typescript
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

- Extract custom hooks to `src/hooks/` or component file
- Use `useCallback` for event handlers passed to memoized components
- Use `useMemo` for expensive calculations
- Check for SSR when using browser APIs (`typeof window !== 'undefined'`)

### API Routes

Wrap handlers with `withMiddleware()`, use named handlers (GET, POST), validate input with Zod schemas.

```typescript
export const GET = withMiddleware(async (request: NextRequest) => {
  const data = validateInput(createSchema, await request.json());
  return successResponse(result);
});
```

### Error Handling

Use custom error classes from `middleware.ts`: `ValidationError`, `AuthenticationError`, `NotFoundError`, etc.

```typescript
throw new ValidationError('Invalid input', { field: 'email' });
throw new NotFoundError('Image');
```

### CSS / Tailwind

- Use Tailwind for all styling - no custom CSS unless necessary
- Use `cn()` utility from `utils.ts` for conditional classes
- Use CSS variables for theming (defined in `globals.css`)

### Accessibility

- Support reduced motion - check `useReducedMotion()` preference
- Use semantic HTML elements
- Include proper ARIA attributes

## Key Systems

### Authentication
- POST to `/api/admin/auth` with password
- JWT in `admin-session` httpOnly cookie
- Session stored in database with expiration
- Rate limiting: 5 requests/60s per IP

### API Middleware Pattern
API routes use `withMiddleware()` for CORS, logging, error handling. Response helpers: `successResponse()`, `errorResponse()`, `paginatedResponse()`.

### Database
- PostgreSQL with Prisma ORM
- Key models: AdminUser, Session, GalleryImage, JournalEntry, Tag, Settings, ActivityLog, RequestLog

### Admin Portal
- Located at `/admin` (`src/app/admin/page.tsx`)
- Tabs: Gallery, Journal, Settings, Activity, Analytics, Export/Import
- Auth check via `/api/admin/auth` GET endpoint

## Important Notes

- **No test files** in this codebase
- TypeScript build errors ignored (`typescript.ignoreBuildErrors: true`)
- Images uploaded to `/public/uploads/images/`
- Admin password via `ADMIN_PASSWORD` env var (no default)
- Relaxed ESLint config - many strict rules disabled

## Common Tasks

**Add API endpoint**: Create `src/app/api/your-endpoint/route.ts`, export named handlers wrapped with `withMiddleware()`.

**Update schema**: Modify `prisma/schema.prisma`, run `bun run db:generate`, then `bun run db:push`.

**Add shadcn component**: `npx shadcn add component-name` (places in `src/components/ui/`).
