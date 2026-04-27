# AGENTS.md - douglasmitchell.info

Primary context for AI agents. Last updated: 2026-04-27

## Stack
- Next.js 16.1 (App Router), React 19, TypeScript 5.9
- Bun (all scripts: `bun run <cmd>`)
- Prisma 6.11 with SQLite fallback (`file:./dev.db`)
- Tailwind CSS 4, Framer Motion, shadcn/ui
- Vitest 3.2.4 for tests

## Commands
| Command | Purpose |
|---------|---------|
| `bun run dev` | Dev server (port 3000, logs to dev.log) |
| `bun run build` | Standalone build to `.next/standalone` |
| `bun run start` | Production server |
| `bun run lint` | ESLint |
| `bun run typecheck` | TypeScript check |
| `bun run test` | Vitest (requires `prisma generate` first) |
| `bun run db:push` | Sync Prisma schema |
| `bun run db:generate` | Generate Prisma client |

## Architecture
- **Content Layer:** `src/lib/content-service.ts` is the read model. Uses **Resilient Fallback Pattern** — falls back to `src/lib/site-content.ts` (static) if DB unavailable. Note: React's `cache()` is request-scoped, not persistent.
- **API Responses:** Use `ApiHandler` class from `src/lib/api-response.ts`
- **Validation:** Zod schemas in `src/lib/forms.ts`, env vars in `src/lib/env.ts`
- **Auth:** JWT sessions + WebAuthn/Passkey in `src/lib/auth.ts`, `src/lib/webauthn.ts`
- **Animations:** Use `framer-motion` imports, NOT `motion/react` (not installed)

## Coding Rules
- Prefer Server Components; Client Components only when hooks needed (`useState`, `useEffect`, `useReducedMotion`)
- Use `cn()` from `src/lib/utils.ts` for Tailwind class merging
- No `any` types; strict TypeScript
- Mobile: ensure `overflow-x-hidden` globally
- Admin mutation endpoints must check `session.role === 'admin'` (not just `session` truthiness)
- All mutation `logActivity` calls must include `userId: session.userId`
- Use `crypto.timingSafeEqual` for secret comparisons, never `===`
- `generateSecureToken(n)` returns `2n` hex chars (n bytes → hex); adjust call sites accordingly

## Key Paths
- `prisma/schema.prisma` — all data models
- `src/lib/site-content.ts` — static editorial content
- `src/components/ai-elements/` — AI workbench components
- `src/app/api/` — all API routes

## Gotchas
- **.kilocode/rules-\*** — ignore, contains outdated rules
- **JWT_SECRET** — must be set in env; no fallback (app fails to start if missing)
- Rate limiting (`src/lib/rate-limit.ts`) is in-memory only; use Redis in production
- No hardcoded fallback passwords in code
- Dev DB: `file:./dev.db` (SQLite) — PostgreSQL raw SQL in `admin-compat.ts`/`operational-compat.ts` will break on SQLite
- When DB is unavailable, `getSession()` returns `null` (forces re-auth) — never trusts JWT alone
- Contact form (`contact-section.tsx`) submits to `/api/contact` — do NOT revert to setTimeout mock

## SOLID Quick Reference
| Principle | Smell | Fix |
|-----------|-------|-----|
| SRP | Class has multiple `and` in description | Split into focused classes |
| OCP | Adding features requires modifying existing code | Use interfaces/strategy |
| LSP | Subclass throws unexpected exceptions | Composition over inheritance |
| ISP | Class implements methods it doesn't need | Split interface |
| DIP | `new` keyword for dependencies | Constructor injection