# AGENTS.md - douglasmitchell.info

## Stack
- Next.js 16.2 (App Router), React 19.2, TypeScript 5.9
- **Bun** runtime — all scripts use `bun run <cmd>` (not npm/npx)
- Prisma 6.19 with **dual schemas**: `schema.prisma` (PostgreSQL prod), `schema.sqlite.prisma` (SQLite dev/test)
- Tailwind CSS 4 (PostCSS `@tailwindcss/postcss`), shadcn/ui (new-york style), Framer Motion, GSAP, Three.js
- Vitest 3.2 (unit), Playwright (E2E)

## Commands
| Command | Purpose |
|---------|---------|
| `bun run dev` | Dev server (port 3000, webpack mode, logs to `dev.log`) |
| `bun run build` | Pre-build Prisma gen → standalone build → `postbuild-standalone.mjs` |
| `bun run start` | Production: `NODE_ENV=production bun .next/standalone/server.js` |
| `bun run lint` | ESLint |
| `bun run typecheck` | TypeScript check (`tsc --noEmit`) |
| `bun run format` | Prettier write |
| `bun run format:check` | Prettier check |
| `bun run test` | Vitest (runs `prisma generate --schema=...sqlite.prisma` first) |
| `bun run test:e2e` | Playwright (uses `bun run start` as webServer) |
| `bun run db:push` | Sync SQLite dev DB |
| `bun run db:generate` | Generate Prisma client (SQLite) |
| `bun run db:migrate` | Prisma migrate dev |
| `bun run db:reset` | Prisma migrate reset |
| `bun run admin:check` | Check admin status |
| `bun run admin:reset` | Reset admin password |
| `bun run admin:test-login` | Test login flow |
| `bun run secret:generate` | Generate JWT secret |
| `bun run backup` | Run backup script |

## Key Conventions
- **Pre-commit hook**: runs `typecheck` → `lint` (order matters). Hook is at `.husky/pre-commit`.
- **JWT_SECRET** required (min 32 chars) — app fails to start without it. Build phase inserts placeholder; runtime must have real secret.
- **Animations**: use `framer-motion` or `gsap` (not `motion/react`).
- **API responses**: use `ApiHandler` class from `src/lib/api-response.ts`.
- **Vitest**: node environment, mocks `server-only` via alias to `src/__tests__/server-only.ts`.
- **Path alias**: `@/` maps to `src/`.

## Architecture
- **Content layer**: `src/lib/content-service.ts` uses resilient fallback — tries DB first, falls back to `src/lib/site-content.ts` (static) if DB unavailable. Uses `react.cache()` (per-request only, not cross-request).
- **Auth**: JWT sessions (jose) + WebAuthn/Passkey (`@simplewebauthn`). Session is validated against both JWT and DB record (fail-closed if DB unreachable).
- **Dual DB schemas**: tests/dev use `schema.sqlite.prisma`; production uses `schema.prisma` (PostgreSQL). Build script auto-detects provider from `DATABASE_URL`.
- **`src/lib/env.ts`**: Zod-validated env with lazy Proxy. Build-safe: supplies placeholder `JWT_SECRET` during `NODE_ENV=production next build` if real secret absent.
- **Standalone output**: `next.config.ts` sets `output: "standalone"`. Post-build script copies `public/` and `.next/static/` into `.next/standalone/`.
- **Rate limiting** (`src/lib/rate-limit.ts`): Redis-backed (Upstash) with in-memory fallback. Not shared across instances on fallback.
- **AI**: multi-provider (Google Gemini, Groq, OpenRouter, SambaNova, Cerebras, Mistral, MiniMax, Ollama Cloud, OpenAI). Defined in `src/lib/admin-ai.ts`.
- **Security**: CSP, HSTS (prod only), `frame-ancestors 'none'`, `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Embedder-Policy: credentialless`.

## Gotchas
- Dev command explicitly uses `--webpack` flag (not turbopack).
- `next.config.ts` sets `allowedDevOrigins: ['127.0.0.1', 'localhost']`.
- Contact form submits to `/api/contact` — do NOT revert to setTimeout mock.
- `generateSecureToken(n)` returns `2n` hex chars (n bytes → hex); adjust call sites accordingly.
- Admin scripts use `bun scripts/admin/<name>.ts` (not `bun run`).
- `/images` and `/media` routes have `Cache-Control: public, max-age=31536000, immutable`.
- shadcn/ui components live in `src/components/ui/` (new-york style). Use `cn()` from `src/lib/utils.ts` for class merging.
- `mini-services/` and `.zscripts/` directories exist but are unused/no longer active.
