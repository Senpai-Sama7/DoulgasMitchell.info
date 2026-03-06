# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Project Overview

This is **Senpai's Isekai** (douglasmitchell.info) - a modern personal blog and portfolio website for Douglas D. Mitchell, featuring sophisticated animations, database-backed content management, and a secure admin portal.

The website showcases:
- A photography gallery organized into three series (Recent Post, Tech Deck, Project)
- A journal/blog with markdown content
- Contact forms and newsletter signup
- Secure admin portal for content management
- Rich animations and glassmorphism design

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: React 19 + TypeScript 5
- **Styling**: Tailwind CSS 4 + CSS Variables
- **UI Components**: shadcn/ui (New York style) with Radix primitives
- **Animations**: Framer Motion
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: Zustand (client-side)
- **Authentication**: JWT tokens in httpOnly cookies + bcrypt + WebAuthn/Passkeys
- **Package Manager**: Bun (also supports npm)
- **Deployment**: Standalone output for self-hosting or Vercel

## Build and Development Commands

```bash
# Install dependencies
bun install

# Development server (port 3000, logs to dev.log)
bun run dev

# Production build (includes Prisma generation and post-build standalone setup)
bun run build

# Production server (run from build output)
bun run start

# Linting
bun run lint

# Database operations
bun run db:push      # Push schema changes to database
bun run db:generate  # Generate Prisma client
bun run db:migrate   # Run migrations
bun run db:reset     # Reset database
bun run db:seed      # Seed database with initial data
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API endpoints
│   │   ├── admin/         # Admin authentication & passkey management
│   │   ├── activity/      # Activity log endpoints
│   │   ├── contact/       # Contact form submission
│   │   ├── gallery/       # Gallery CRUD + batch operations
│   │   ├── journal/       # Journal CRUD
│   │   ├── layout/        # Layout block management
│   │   ├── newsletter/    # Newsletter subscription
│   │   ├── settings/      # Site settings
│   │   └── upload/        # Image upload handling
│   ├── admin/             # Admin portal page (~2900 lines)
│   ├── about/             # About page
│   ├── contact/           # Contact page
│   ├── events/            # Events page
│   ├── faq/               # FAQ page
│   ├── galleries/         # Gallery showcase page
│   ├── journal/           # Journal/blog page
│   ├── press-kit/         # Press kit page
│   ├── samples/           # Samples page
│   ├── globals.css        # Global styles + design system
│   ├── layout.tsx         # Root layout with fonts
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # shadcn/ui primitives (50+ components)
│   ├── animations.tsx    # Animation components (ScrollReveal, Magnetic, etc.)
│   ├── contact-form.tsx  # Contact form component
│   ├── footer.tsx        # Site footer
│   ├── image-card.tsx    # Gallery image card
│   ├── journal-entry.tsx # Journal entry display
│   ├── lightbox.tsx      # Image lightbox
│   ├── main-layout.tsx   # Main layout wrapper
│   ├── navigation.tsx    # Site navigation
│   ├── reactions.tsx     # Reaction buttons component
│   └── ...               # Other components
├── hooks/                # Custom React hooks
│   ├── use-mobile.ts     # Mobile breakpoint detection
│   └── use-toast.ts      # Toast notifications
└── lib/                  # Core utilities
    ├── data.ts           # Data fetching + static fallback data
    ├── db.ts             # Prisma client singleton
    ├── middleware.ts     # API middleware (error handling, CORS, logging)
    ├── passkeys.ts       # WebAuthn/Passkey utilities
    ├── security.ts       # Auth, rate limiting, password hashing, JWT
    ├── store.ts          # Zustand stores (lightbox, reactions, admin)
    ├── utils.ts          # Utility functions (cn helper)
    └── validations.ts    # Zod schemas for all inputs

prisma/
└── schema.prisma         # Database schema (PostgreSQL)

public/
├── images/               # Static images
│   ├── gallery/         # Gallery images (recent-post, tech-deck, project)
│   ├── hero/            # Hero images
│   └── journal/         # Journal images
└── ...                  # Other static assets

scripts/
└── postbuild-standalone.mjs  # Post-build script for standalone output
```

## Code Style Guidelines

### General Principles

- **No unnecessary comments** - Avoid adding comments unless explicitly requested
- **Prefer named exports** for functions and components
- **Use TypeScript** for all files - no plain JavaScript
- **Avoid `any`** - Use proper types or `unknown` when necessary
- **Use functional components** with hooks - no class components
- **Prefer `const`** over `let` - only use `let` when reassignment is truly needed
- **Prefer string literals** over enums where possible

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

- **Extract custom hooks** to `src/hooks/` or component file
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
- **Use CSS variables** for theming (defined in `globals.css`)
- **Design system**: Cream white + Glassmorphism + Soft warm gray

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
- **Focus visible styles** are defined in `globals.css`

## Key Systems

### Authentication Flow

1. **Login**: POST to `/api/admin/auth` with password
2. **JWT Generation**: Token stored in `admin-session` httpOnly cookie
3. **Session Storage**: Session also recorded in database with expiration
4. **Validation**: Each API request validates both JWT signature and database session
5. **Passkeys**: WebAuthn support for passwordless authentication (optional)
6. **Rate Limiting**: 5 requests per 60 seconds per IP (configurable via env vars)

### Gallery System

- **Three Series**: `recent-post`, `tech-deck`, `project`
- **Database Fields**: id, src, alt, caption, series, width, height, date, blurDataUrl, order
- **Features**: Drag-drop upload, batch operations, search, filtering, reordering
- **Fallback**: Static data in `src/lib/data.ts` used if database is empty

### Journal System

- **Markdown Entries**: Title, date, content, quote, image, imageAlt, tags
- **Tags**: Many-to-many relationship via `JournalTag` join table
- **Content**: Stored as plain text (custom markdown display, no external parser)

### Admin Portal

- **Location**: `/admin` route (`src/app/admin/page.tsx`)
- **Size**: ~2900 lines (single file with multiple tabs/sections)
- **Tabs**: Gallery, Journal, Settings, Activity, Analytics, Export/Import
- **Authentication**: Client-side auth check via `/api/admin/auth` GET endpoint

### Middleware Pattern

API routes use `withMiddleware()` wrapper for:
- CORS handling
- Request logging to `RequestLog` model
- Error handling with `errorResponse()`
- Response formatting with `successResponse()`

Custom error classes:
- `AppError` - Base error class
- `ValidationError` (400)
- `AuthenticationError` (401)
- `AuthorizationError` (403)
- `NotFoundError` (404)
- `RateLimitError` (429)
- `ServiceUnavailableError` (503)

### Security

- **Password Hashing**: bcrypt with 12 rounds
- **JWT Tokens**: HS256 with expiration
- **Rate Limiting**: In-memory Map (can be replaced with Redis in production)
- **Session Validation**: Checks both token signature and database record
- **CSRF Protection**: httpOnly cookies with SameSite=strict
- **Login Tracking**: Failed attempts tracked in `LoginAttempt` model

## Database Schema (Prisma)

Key models:

```prisma
model AdminUser {
  id           String   @id @default(cuid())
  username     String   @unique
  passwordHash String
  email        String?
  lastLoginAt  DateTime?
  sessions     Session[]
  passkeys     PasskeyCredential[]
}

model Session {
  id          String   @id @default(cuid())
  token       String   @unique
  adminUserId String
  expiresAt   DateTime
  ipAddress   String?
  userAgent   String?
  adminUser   AdminUser @relation(fields: [adminUserId], references: [id], onDelete: Cascade)
}

model GalleryImage {
  id          String   @id @default(cuid())
  src         String
  alt         String
  caption     String
  series      String   // 'recent-post' | 'tech-deck' | 'project'
  width       Int      @default(1344)
  height      Int      @default(768)
  date        String   // ISO date string
  blurDataUrl String?
  order       Int      @default(0)
}

model JournalEntry {
  id        String       @id @default(cuid())
  title     String
  date      String       // ISO date string
  content   String
  quote     String?
  image     String
  imageAlt  String
  order     Int          @default(0)
  tags      JournalTag[]
}

model Tag {
  id       String       @id @default(cuid())
  name     String       @unique
  journals JournalTag[]
}

model Settings {
  id              String @id @default(cuid())
  siteTitle       String @default("Senpai's Isekai")
  siteDescription String @default("A personal blog exploring architecture, technology, and creative expression")
  linkedin        String?
  github          String?
  telegram        String?
  whatsapp        String?
}

model ActivityLog {
  id         String   @id @default(cuid())
  action     String   // 'create', 'update', 'delete', 'upload', 'export', 'import', 'login', 'logout'
  resource   String   // 'gallery', 'journal', 'settings', 'auth', etc.
  resourceId String?
  details    String?  // JSON string
  ipAddress  String?
  createdAt  DateTime @default(now())
}

model RequestLog {
  id         String   @id @default(cuid())
  method     String
  path       String
  statusCode Int
  duration   Int      // milliseconds
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())
}

// Additional models: PasskeyCredential, LoginAttempt, LayoutBlock, 
// Newsletter, Testimonial, Event, ContactMessage, FAQ
```

**Note**: Database uses PostgreSQL (not SQLite).

## Environment Variables

Required for production:

```bash
# Database (PostgreSQL)
DATABASE_URL="postgresql://..."
DATABASE_URL_UNPOOLED="postgresql://..."  # Direct connection

# Authentication
ADMIN_PASSWORD="your-secure-password"
JWT_SECRET="your-jwt-secret-min-32-chars"
SESSION_MAX_AGE="86400000"  # 24 hours in ms

# Rate Limiting
RATE_LIMIT_MAX="5"
RATE_LIMIT_WINDOW_MS="60000"

# Passkeys (WebAuthn) - Optional
PASSKEY_RP_ID="your-domain.com"
PASSKEY_EXPECTED_ORIGINS="https://your-domain.com"
PASSKEY_RP_NAME="Your App Name"

# CORS / Origins
ALLOWED_ORIGIN="https://your-domain.com"
TRUST_PROXY_HEADERS="true"  # If behind reverse proxy
```

## Important Notes

- **Images**: Uploaded to `/public/uploads/images/`, served statically
- **No test files**: This codebase intentionally does not have test files
- **TypeScript build errors**: Ignored in config (`typescript.ignoreBuildErrors: true`)
- **Image optimization**: Disabled (`images.unoptimized: true`) in next.config.ts
- **Standalone output**: Configured for production deployment
- **CORS**: Handled in middleware for API routes
- **Admin password**: Must be set via `ADMIN_PASSWORD` env var, no default
- **Prisma logging**: Enabled for queries in development when `PRISMA_LOG_QUERIES=true`

## Common Tasks

**Add new API endpoint**: 
1. Create `src/app/api/your-endpoint/route.ts`
2. Export named handlers (GET, POST, etc.) wrapped with `withMiddleware()`
3. Add Zod schema in `validations.ts` if needed

**Update database schema**:
1. Modify `prisma/schema.prisma`
2. Run `bun run db:generate`
3. Run `bun run db:push`

**Add shadcn/ui component**:
```bash
npx shadcn add component-name
```
Place in `src/components/ui/`

**Add admin functionality**: 
Modify `/admin/page.tsx` or extract to separate components as needed

## ESLint Configuration

The project uses a relaxed ESLint configuration (see `eslint.config.mjs`):

- Many TypeScript strict rules are disabled (`@typescript-eslint/no-explicit-any: off`)
- React hooks rules are disabled (`react-hooks/exhaustive-deps: off`)
- Console and debugger statements are allowed
- This allows for rapid development without strict linting constraints

## Design System

The project uses a custom "Cream White + Glassmorphism + Soft Warm Gray" design system:

- **Primary Font**: Space Grotesk (headings), Plus Jakarta Sans (body)
- **Monospace**: JetBrains Mono (dates, technical text)
- **Accent**: Sora (quotes, handwritten style)
- **Colors**: Cream whites, warm grays, with glassmorphism overlays
- **Border Radius**: 0.75rem base (`--radius`)
- **Animations**: Smooth transitions, parallax effects, scroll reveals

See `src/app/globals.css` for complete design token definitions.
