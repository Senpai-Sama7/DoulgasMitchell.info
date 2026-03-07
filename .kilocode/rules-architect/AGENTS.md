# AGENTS.md - Architect Mode

This file provides guidance for planning and architectural decisions in this repository.

## Architectural Constraints

- Must use `withMiddleware()` wrapper for all API routes - this is non-negotiable for error handling
- Custom error classes required (ValidationError, AuthenticationError, NotFoundError, etc.)
- Static fallback data pattern in `src/lib/data.ts` - DB must fallback gracefully
- Client state via Zustand only - do not introduce other state libraries
- No test infrastructure - tests are intentionally absent

## Technical Decisions

- Image upload: `/public/uploads/images/` only, served statically
- Admin auth: JWT + database session, optional WebAuthn/Passkeys
- Rate limiting: in-memory (not persistent), 5 req/60sec default
- Build: standalone output for production deployment
- TypeScript: errors ignored in build (configured in tsconfig)

## Database

- PostgreSQL with Prisma ORM
- Gallery: 3 series (`recent-post`, `tech-deck`, `project`)
- Key models: AdminUser, Session, GalleryImage, JournalEntry, Settings, ActivityLog

## Dependencies to Know

- React 19 + Next.js 16 (App Router)
- Zod for validation
- Zustand for client state
- Framer Motion for animations
- Three.js for 3D effects
- shadcn/ui for components
