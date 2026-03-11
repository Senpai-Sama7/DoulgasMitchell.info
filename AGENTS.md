# AGENTS.md

This file provides guidance to AI coding agents working in this repository.

## Project Overview

**Senpai's Isekai** (douglasmitchell.info) - A Next.js 16 personal editorial platform and portfolio for Douglas Mitchell. It features a robust CMS for articles, project tracking, and an advanced admin portal with WebAuthn support.

## Technology Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript 5
- **Styling**: Tailwind CSS 4 + CSS Variables (CSS-first approach)
- **UI**: shadcn/ui + Radix primitives + Framer Motion
- **Database**: PostgreSQL + Prisma ORM (Version 6)
- **Auth**: JWT (jose) + bcrypt + WebAuthn/Passkeys
- **Package Manager**: Bun (preferred)

## Build and Development Commands

```bash
# Install dependencies
bun install

# Development server
bun run dev

# Production build
bun run build

# Production server
bun run start

# Testing (Vitest)
bun run test

# Database operations
bun run db:push       # Push schema changes
bun run db:generate   # Generate Prisma client
bun run db:migrate    # Run migrations
```

## Code Style Guidelines

### General Principles

- **No unnecessary comments** - Avoid unless logic is complex.
- **Prefer named exports** for functions and components.
- **Use TypeScript** strictly - avoid `any`.
- **Use functional components** with hooks.
- **Prefer Server Components** where possible.

### Key Patterns

- **Authentication**: Check session via `getSession()` from `@/lib/auth`.
- **API Routes**: Standard Next.js handlers. Use `logActivity` for all admin actions.
- **ASCII Art**: Use `src/lib/ascii` for editorial ASCII decorations.
- **Database**: Use the singleton `db` instance from `@/lib/db`.
- **AI Integration**: Use the Gemini AI agent at `src/app/api/admin/ai/route.ts` for coordinating admin tasks.
- **Hidden Admin Access**: The admin login is accessible via a discrete link in the footer (the word "intent.").

## File Structure

- `src/app`: App Router pages and API routes.
- `src/components`: UI components (shadcn/ui and custom).
- `src/lib`: Core business logic, services, and utilities.
- `src/__tests__`: Vitest test suites.
- `prisma`: Database schema and migrations.

## Important Notes

- Tailwind 4 is used; avoid legacy Tailwind 3 configuration patterns.
- Always check `src/lib/env.ts` for required environment variables.
- The project aesthetic is "The Architect" (precise, technical, monospaced).
