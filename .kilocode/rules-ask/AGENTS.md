# AGENTS.md - Ask Mode

This file provides guidance for question-answering tasks about this repository.

## Documentation Context

- Project is a Next.js 16 + React 19 + TypeScript personal blog/portfolio
- Database: PostgreSQL with Prisma ORM
- Auth: JWT + session-based with optional WebAuthn/Passkeys
- Admin: Single large file at `src/app/admin/page.tsx` (~2900 lines)

## Key Files for Reference

- `src/lib/middleware.ts` - Custom error handling and response formatting
- `src/lib/validations.ts` - All Zod validation schemas  
- `src/lib/data.ts` - Static fallback when database is empty
- `src/lib/store.ts` - Zustand client-side state

## Architecture Notes

- Gallery has exactly 3 series: `recent-post`, `tech-deck`, `project`
- Images served from `/public/uploads/images/`
- Static fallback data used when no database records exist
- Admin password MUST be set via `ADMIN_PASSWORD` env var

## Noteworthy

- No test files exist (intentional)
- TypeScript errors ignored in build
- ESLint is relaxed with many rules disabled
