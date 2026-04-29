# AGENTS.md - douglasmitchell.info

## Stack
- Next.js 16.2 (App Router), React 19.2, TypeScript 5.9
- **Bun** runtime — all scripts use `bun run <cmd>` (not npm/npx)
- Prisma 6.19 with **dual schemas**: `schema.prisma` (PostgreSQL prod), `schema.sqlite.prisma` (SQLite dev/test)
- Tailwind CSS 4, Framer Motion, shadcn/ui
- Vitest 3.2 for tests

## Commands
| Command | Purpose |
|---------|---------|
| `bun run dev` | Dev server (port 3000, webpack mode, logs to `dev.log`) |
| `bun run build` | Standalone build → `.next/standalone` (runs `postbuild-standalone.mjs`) |
| `bun run start` | Production: `NODE_ENV=production bun .next/standalone/server.js` |
| `bun run lint` | ESLint |
| `bun run typecheck` | TypeScript check |
| `bun run test` | Vitest (runs `prisma generate --schema=...sqlite.prisma` first) |
| `bun run db:push` | Sync SQLite dev DB |
| `bun run db:generate` | Generate Prisma client (SQLite) |

## Key Conventions
- **Pre-commit hook**: runs `typecheck` → `lint` (order matters)
- **JWT_SECRET** required in env — app fails to start without it
- **Animations**: import from `framer-motion` (not `motion/react`)
- **API responses**: use `ApiHandler` class from `src/lib/api-response.ts`
- **Vitest**: node environment, mocks `server-only` via alias to `src/__tests__/server-only.ts`

## Architecture
- **Content layer**: `src/lib/content-service.ts` uses resilient fallback — tries DB first, falls back to `src/lib/site-content.ts` (static) if DB unavailable
- **Auth**: JWT sessions + WebAuthn/Passkey in `src/lib/auth.ts`, `src/lib/webauthn.ts`
- **Dual DB schemas**: tests/dev use `schema.sqlite.prisma`; production uses `schema.prisma` (PostgreSQL)
- **`src/lib/env.ts`**: Zod-validated env with defaults (DATABASE_URL defaults to `file:./dev.db`)

## Gotchas
- Dev command explicitly uses `--webpack` flag (not turbopack)
- `next.config.ts` sets `allowedDevOrigins: ['127.0.0.1', 'localhost']`
- Rate limiting (`src/lib/rate-limit.ts`) is in-memory only — not for production
- Contact form submits to `/api/contact` — do NOT revert to setTimeout mock
- `generateSecureToken(n)` returns `2n` hex chars (n bytes → hex); adjust call sites accordingly
- Admin scripts use `bun scripts/admin/<name>.ts` (not `bun run`)
