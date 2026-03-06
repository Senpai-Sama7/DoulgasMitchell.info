# BLACKBOX.md - Project Context for AI Agents

> **Project**: Douglas Mitchell Personal Website (douglasmitchell.info)  
> **Type**: Next.js Full-Stack Web Application  
> **Last Updated**: March 2026

---

## Project Overview

This is a modern personal blog and portfolio website for Douglas D. Mitchell, an author and marketing strategist. The site features sophisticated animations, database-backed content management, and a secure admin portal.

### Key Features
- **Photography Gallery** - Three series (Recent Post, Tech Deck, Project) with masonry layout and lightbox
- **Journal/Blog** - Markdown-supported entries with tags
- **Contact Forms** - Validated contact form and newsletter signup
- **Admin Portal** - Secure content management with passkey support
- **Rich Animations** - Framer Motion, glassmorphism design, scroll reveals

---

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Runtime | React 19 + TypeScript 5 |
| Styling | Tailwind CSS 4 + CSS Variables |
| UI Components | shadcn/ui (New York style) + Radix primitives |
| Animations | Framer Motion |
| Database | PostgreSQL with Prisma ORM |
| State Management | Zustand (client-side) |
| Authentication | JWT + bcrypt + WebAuthn/Passkeys |
| Package Manager | Bun (also supports npm) |
| Deployment | Standalone output (self-hosted or Vercel) |

---

## Build and Development Commands

```bash
# Install dependencies
bun install

# Development server (port 3000, logs to dev.log)
bun run dev

# Production build (includes Prisma generation + postbuild)
bun run build

# Production server
bun run start

# Linting
bun run lint

# Database operations
bun run db:push      # Push schema changes
bun run db:generate  # Generate Prisma client
bun run db:migrate   # Run migrations
bun run db:reset     # Reset database
bun run db:seed      # Seed initial data
```

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   │   ├── admin/         # Auth & passkey management
│   │   ├── gallery/       # Gallery CRUD
│   │   ├── journal/       # Journal CRUD
│   │   ├── contact/       # Contact form
│   │   ├── newsletter/    # Newsletter subscription
│   │   ├── settings/      # Site settings
│   │   └── upload/        # Image upload
│   ├── admin/             # Admin portal (~2900 lines)
│   ├── about/             # About page
│   ├── contact/           # Contact page
│   ├── galleries/         # Gallery showcase
│   ├── journal/           # Journal/blog
│   ├── globals.css        # Global styles + design tokens
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # shadcn/ui primitives (50+)
│   ├── animations.tsx    # ScrollReveal, Magnetic, etc.
│   ├── navigation.tsx    # Site navigation
│   ├── lightbox.tsx      # Image lightbox
│   └── ...               # Other components
├── hooks/                # Custom hooks
│   ├── use-mobile.ts     # Mobile detection
│   └── use-toast.ts      # Toast notifications
└── lib/                  # Core utilities
    ├── db.ts             # Prisma client singleton
    ├── security.ts       # Auth, rate limiting, JWT
    ├── middleware.ts     # API middleware
    ├── store.ts          # Zustand stores
    ├── validations.ts    # Zod schemas
    └── utils.ts          # Utility functions

prisma/
└── schema.prisma         # PostgreSQL schema

public/
├── images/               # Static images
│   ├── gallery/         # Gallery images
│   └── hero/            # Hero images
└── uploads/             # Uploaded content
```

---

## Code Style Guidelines

### General Principles
- **No unnecessary comments** - Only add when explicitly requested
- **Prefer named exports** for functions and components
- **Use TypeScript** for all files - no plain JavaScript
- **Avoid `any`** - Use proper types or `unknown`
- **Functional components** with hooks - no class components
- **Prefer `const`** over `let`

### Imports
```typescript
// Sort: external → internal → relative
import { NextRequest, NextResponse } from 'next/server';
import { getCorsHeaders } from '@/lib/security';
import type { CreateGalleryImageInput } from '@/lib/validations';

// Client components use "use client" directive
"use client";
import { useState } from "react";
```

### File Naming
- **Components**: PascalCase (`PageTransition.tsx`)
- **Utilities**: camelCase (`utils.ts`, `security.ts`)
- **Types**: Co-located with `type` keyword

### Component Pattern
```typescript
interface Props {
  children: ReactNode;
  className?: string;
  variant?: "fade" | "slide";
}

export function Component({ 
  children, 
  className = "",
  variant = "slide" 
}: Props) {
  // Implementation
}
```

---

## API Route Pattern

All API routes use `withMiddleware()` wrapper for consistent error handling, CORS, and logging:

```typescript
import { NextRequest } from 'next/server';
import { withMiddleware, validateInput, successResponse, NotFoundError } from '@/lib/middleware';
import { createSchema } from '@/lib/validations';

export const POST = withMiddleware(async (request: NextRequest) => {
  const body = await request.json();
  const data = validateInput(createSchema, body);
  // ... implementation
  return successResponse(result);
});
```

### Custom Error Classes
- `ValidationError` (400)
- `AuthenticationError` (401)
- `AuthorizationError` (403)
- `NotFoundError` (404)
- `RateLimitError` (429)

---

## Database Schema (Prisma)

Key models:
- `AdminUser` - Admin accounts with passkey support
- `Session` - JWT sessions with expiration
- `GalleryImage` - Gallery items (series: recent-post, tech-deck, project)
- `JournalEntry` - Blog posts with tags (many-to-many via `JournalTag`)
- `Settings` - Site configuration
- `ActivityLog` - Audit trail for admin actions
- `RequestLog` - API request logging
- `Newsletter` - Email subscriptions
- `ContactMessage` - Contact form submissions
- `Event` - Author events (signings, readings, conferences)
- `Testimonial` - Featured testimonials
- `FAQ` - FAQ entries

---

## Authentication Flow

1. **Login**: POST to `/api/admin/auth` with password
2. **JWT**: Token stored in `admin-session` httpOnly cookie
3. **Session**: Recorded in database with expiration
4. **Validation**: Each request validates JWT + database session
5. **Passkeys**: WebAuthn support for passwordless auth (optional)
6. **Rate Limiting**: 5 requests per 60 seconds per IP

---

## Environment Variables

```bash
# Database (PostgreSQL)
DATABASE_URL="postgresql://..."
DATABASE_URL_UNPOOLED="postgresql://..."

# Authentication
ADMIN_PASSWORD="your-secure-password"
JWT_SECRET="your-jwt-secret-min-32-chars"
SESSION_MAX_AGE="86400000"  # 24 hours in ms

# Rate Limiting
RATE_LIMIT_MAX="5"
RATE_LIMIT_WINDOW_MS="60000"

# Passkeys (Optional)
PASSKEY_RP_ID="your-domain.com"
PASSKEY_EXPECTED_ORIGINS="https://your-domain.com"

# CORS
ALLOWED_ORIGIN="https://your-domain.com"
TRUST_PROXY_HEADERS="true"
```

---

## Design System

**Theme**: Cream White + Glassmorphism + Soft Warm Gray

| Element | Font |
|---------|------|
| Headings | Space Grotesk |
| Body | Plus Jakarta Sans |
| Monospace | JetBrains Mono |
| Accent/Quotes | Sora |

**Key Design Tokens** (defined in `globals.css`):
- Border radius: `--radius: 0.75rem`
- Smooth transitions and parallax effects
- Support for `prefers-reduced-motion`

---

## Important Notes

- **No test files** - Codebase intentionally does not include tests
- **TypeScript errors** - `ignoreBuildErrors: false` (strict mode)
- **Image optimization** - Enabled with remote patterns configured
- **Standalone output** - Configured for production deployment
- **Admin password** - Must be set via `ADMIN_PASSWORD` env var
- **ESLint** - Relaxed config (some strict rules disabled for rapid development)

---

## Common Tasks

### Add New API Endpoint
1. Create `src/app/api/your-endpoint/route.ts`
2. Export handlers wrapped with `withMiddleware()`
3. Add Zod schema in `validations.ts` if needed

### Update Database Schema
1. Modify `prisma/schema.prisma`
2. Run `bun run db:generate && bun run db:push`

### Add shadcn/ui Component
```bash
npx shadcn add component-name
```

### Modify Admin Portal
Edit `/admin/page.tsx` (single file with multiple tabs)

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/lib/security.ts` | Auth, JWT, rate limiting, password hashing |
| `src/lib/middleware.ts` | API middleware, error classes, response helpers |
| `src/lib/validations.ts` | Zod schemas for all inputs |
| `src/lib/store.ts` | Zustand stores (lightbox, reactions, admin) |
| `src/lib/db.ts` | Prisma client singleton |
| `src/app/globals.css` | Design tokens and global styles |
| `prisma/schema.prisma` | Database schema definition |

---

*Built with ❤️ by Douglas Mitchell*
