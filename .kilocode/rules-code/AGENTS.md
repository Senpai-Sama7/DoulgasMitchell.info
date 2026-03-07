# AGENTS.md - Code Mode

This file provides guidance for code editing tasks in this repository.

## Code-Specific Rules

- Always use `withMiddleware()` wrapper for API routes - omitting it breaks error handling and CORS
- Use custom error classes (`ValidationError`, `AuthenticationError`, `NotFoundError`) instead of throwing generic errors
- Use `cn()` from `src/lib/utils.ts` - do not import clsx directly
- Static fallback data in `src/lib/data.ts` is used when DB is empty - do not remove without adding DB fallback
- Admin portal is a single ~2900 line file at `src/app/admin/page.tsx` - consider extracting to components for large changes

## Key Patterns

- API routes: `successResponse(data)`, `errorResponse(message, code)`
- Zod validation: import schemas from `src/lib/validations.ts`
- Client state: use Zustand stores from `src/lib/store.ts`

## Gotchas

- Images must be uploaded to `/public/uploads/images/` - other paths won't serve correctly
- TypeScript build errors are ignored - code will compile even with errors
- No test files exist - do not create tests
