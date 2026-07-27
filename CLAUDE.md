## RALPH BUILD PROTOCOL — PERMANENT RULES

**These rules were established at project init and apply permanently.**

### TRACKER MUTATION RULES — PERMANENT, NON-NEGOTIABLE

These rules apply to every agent (human or AI) editing PROGRESS_TRACKER.md. Violating them invalidates the proof chain.

1. **Permitted changes on completion only:**
   - `[ ]` → `[x]`
   - Replace `_pending_` with actual proof (command + output + timestamp)
   - Append a row to the Completion Log table

2. **Forbidden at all times:**
   - Rewriting, removing, or reordering any task
   - Adding or removing sections
   - Editing any uncompleted task
   - Replacing proof text without retaining the original attempt record

3. **On failure:** Leave `[ ]`. Append below the Proof line:
   ```
   ❌ FAIL: [error message, timestamp]
   ✅ FIX: [what replaced it and why]
   Proof: [final passing result]
   ```

### EXECUTION RULES (apply to every phase and every task)

**Planning:**
- Use step-by-step reasoning to produce the implementation plan.
- Show your reasoning before code — but the plan is not proof of completion.

**Gates (non-negotiable before marking any task [x]):**
- Every task must pass its gate command before being marked complete.
- Gate command output must appear verbatim in the Proof line (trimmed to relevant lines + timestamp).
- If the gate fails: task stays [ ], error is logged under ❌ FAIL:, and you fix before continuing. You do not move to the next task on a failing gate.

**Failures:**
- Do NOT delete original implementation attempts that failed.
- Keep the original code/approach, append ❌ FAIL: with the exact error, then append ✅ FIX: with what replaced it and why it worked.

**Proof format (required on every task):**
```
Proof: `<exact command>` → `<trimmed output with exit code>` @ <timestamp>
```
Example:
```
Proof: `npm run build` → `✓ Built in 3.2s, 0 errors` (exit 0) @ 2025-03-13T14:22:01Z
```

---

## 1. Architectural Blueprint

- **Paradigm**: Layered Server-Rendered Monolith (Next.js 16 App Router, React 19)
- **Invariants**:
  - `JWT_SECRET` is mandatory at runtime (min 32 chars). During `next build` a placeholder is injected; runtime must provide a real value. `src/lib/env.ts:72-95`
  - Auth is **fail-closed**: if DB is unreachable during session validation, request is rejected as unauthorized. `src/lib/auth` + `src/lib/admin-compat.ts`
  - Content delivery is **fail-open**: `content-service.ts` tries DB first, falls back to `site-content.ts` static exports. `src/lib/content-service.ts:1-23`
  - API contracts are standardized via `ApiHandler`. `src/lib/api-response.ts:16-69`
  - Passkey schema is backward-compatible via introspection + dynamic SQL (`admin-compat`, `operational-compat`).
  - `output: "standalone"` + post-build copy script for Docker/self-hosting. `next.config.ts:28`

## 2. Semantic Code Intelligence

| Symbol                    | Kind       | Intent                                       | Domain         | Location                            | Primary Consumers                       |
| ------------------------- | ---------- | -------------------------------------------- | -------------- | ----------------------------------- | --------------------------------------- |
| `getLandingPageData`      | Service    | Resilient home page data resolver            | Content        | `src/lib/content-service.ts`        | `src/app/page.tsx`                      |
| `withFallback`            | Utility    | DB-first cascading fallback pattern          | Infrastructure | `src/lib/content-service.ts`        | Admin snapshots, analytics, security    |
| `env`                     | Config     | Lazy Zod-validated env; build-safe           | Infrastructure | `src/lib/env.ts:118-123`            | All modules importing `env`             |
| `features`                | Config     | Lazy feature flags (`ENABLE_PASSKEYS`, etc.) | Infrastructure | `src/lib/env.ts:143-148`            | Feature gates, admin UI                 |
| `db`                      | Repository | Prisma singleton (global across hot reloads) | Data           | `src/lib/db.ts:11-17`               | All data access                         |
| `ApiHandler`              | HTTP       | Standardized JSON response factory           | Transport      | `src/lib/api-response.ts:16-69`     | API routes                              |
| `rateLimit`               | Middleware | Redis-or-memory rate limiter                 | Security       | `src/lib/rate-limit.ts:108-121`     | Public + admin API routes               |
| `getSession`              | Auth       | JWT + DB session validation (fail-closed)    | Auth           | `src/lib/auth`                      | Admin routes, operator route            |
| `getSearchableContent`    | Service    | Unified search index over DB + static        | Content        | `src/lib/content-service.ts`        | Public assistant                        |
| `PublicAssistantReply`    | Type       | Public-facing Q&A contract                   | AI             | `src/lib/public-assistant.ts:22-46` | `src/app/api/public-assistant/route.ts` |
| `admin-compat`            | Adapter    | Sharded backward-compatible admin schema     | Auth           | `src/lib/admin-compat.ts`           | Admin auth + dashboard                  |
| `operational-compat`      | Adapter    | Sharded contact/newsletter/media counters    | Analytics      | `src/lib/operational-compat.ts`     | Dashboard, content-service              |
| `publicAssistantSettings` | Setting    | Public assistant config (topics, behavior)   | AI             | `src/lib/admin-operator.ts`         | `src/app/api/public-assistant/route.ts` |
| `logger`                  | Utility    | Structured request/operational logging       | Infrastructure | `src/lib/logger.ts`                 | All server code                         |
| `motionTier`              | Config     | Animation tier selector (reduced motion)     | Frontend       | `src/lib/motion-tier.ts`            | Components, immersive root              |

## 3. Standard Operating Procedures

**Naming taxonomy**

- Models: PascalCase singular (`Article`, `Project`, `LayoutBlock`). Prisma enforces.
- Routes: kebab-case files in `src/app/api/<segment>/route.ts`.
- Lib modules: camelCase, single responsibility (`content-service.ts`, `admin-compat.ts`).
- React components: PascalCase files in `src/components/<scope>/`.
- Test files: `<module-under-test>.test.ts` in `src/__tests__/`.

**Import order**

1. Node standard library (`node:` prefix).
2. External packages (`next`, `react`, `@prisma`, `zod`, etc.).
3. Internal `@/` aliases.
4. Relative imports.

**Error handling**

- API routes: use `ApiHandler.error`, `ApiHandler.internalServerError`.
- Data access: throw upwards unless a fallback is defined; never swallow silently.
- Logging: `logger.error(...)` for operational visibility; `logger.warn(...)` for degraded paths.

**Logging**

- `src/lib/logger.ts` provides structured logger. Use in all server-side modules.

**Lint/Format**

- `bun run lint` (ESLint 9).
- `bun run format` (prettier write).
- Pre-commit hook: `typecheck` → `lint`. `.husky/pre-commit`

## 4. Development Lifecycle and Tooling

| Task                 | Command                       | Working Dir | Notes                                                             |
| -------------------- | ----------------------------- | ----------- | ----------------------------------------------------------------- |
| Install              | `bun install`                 | repo root   | Uses existing lockfile. Do not use npm/pnpm.                      |
| Dev server           | `bun run dev`                 | repo root   | `next dev --webpack -p 3000`; logs to `dev.log`. Port 3000.       |
| Type check           | `bun run typecheck`           | repo root   | `tsc --noEmit`. Run before push.                                  |
| Lint                 | `bun run lint`                | repo root   | ESLint 9.                                                         |
| Format               | `bun run format`              | repo root   | Prettier write.                                                   |
| Format check         | `bun run format:check`        | repo root   | Prettier check.                                                   |
| Test (unit)          | `bun run test`                | repo root   | Generates SQLite Prisma client then `vitest run`.                 |
| Test (e2e)           | `bun run test:e2e`            | repo root   | Playwright; uses `bun run start` as webServer.                    |
| DB push              | `bun run db:push`             | repo root   | SQLite dev schema sync.                                           |
| DB generate          | `bun run db:generate`         | repo root   | Generates SQLite Prisma client.                                   |
| DB generate prod     | `bun run db:generate:prod`    | repo root   | Generates PostgreSQL Prisma client.                               |
| DB migrate           | `bun run db:migrate`          | repo root   | Prisma migrate dev.                                               |
| DB reset             | `bun run db:reset`            | repo root   | Prisma migrate reset.                                             |
| Admin check          | `bun run admin:check`         | repo root   | Checks admin status.                                              |
| Admin reset password | `bun run admin:reset`         | repo root   | Resets admin password.                                            |
| Admin test login     | `bun run admin:test-login`    | repo root   | Tests login flow.                                                 |
| Admin provision      | `bun run admin:provision`     | repo root   | Provisions content.                                               |
| Secret generate      | `bun run secret:generate`     | repo root   | Generates JWT secret.                                             |
| Backup               | `bun run backup`              | repo root   | Runs backup script.                                               |
| Build                | `bun run build`               | repo root   | `build-generate.mjs` → `next build` → `postbuild-standalone.mjs`. |
| Start (prod)         | `bun run start`               | repo root   | `NODE_ENV=production bun .next/standalone/server.js`.             |
| Admin run            | `bun scripts/admin/<name>.ts` | repo root   | Executes admin maintenance scripts.                               |

## 5. Testing and Quality Assurance

- **Unit**: Vitest 3.2, node environment, mocks `server-only` via alias to `src/__tests__/server-only.ts`.
- **E2E**: Playwright, uses production webServer (`bun run start`).
- **Locations**: `src/__tests__/*.test.ts`.
- **Strategy**: Repository layer is NOT mocked; tests use SQLite via `prisma/schema.sqlite.prisma`.
- **Pre-merge**: `bun run typecheck && bun run lint` enforced via `.husky/pre-commit`.

## 6. Contextual Knowledge Graph

- `src/lib/content-service.ts` -> `uses` -> `src/lib/site-content.ts` : static fallback when DB unavailable or tables missing.
- `src/lib/content-service.ts` -> `uses` -> `src/lib/admin-compat.ts` : legacy admin + passkey snapshots for dashboard.
- `src/lib/content-service.ts` -> `uses` -> `src/lib/operational-compat.ts` : counts (contact, newsletter, media) and activity feed.
- `src/lib/db-introspection.ts` -> `used-by` -> `src/lib/admin-compat.ts` : dynamic column discovery for sharded tables.
- `src/lib/env.ts` -> `validated-by` -> `zod` schema : Zod-validated lazy proxy; build-time placeholder for `JWT_SECRET`.
- `src/app/api/admin/operator/route.ts` -> `uses` -> `src/lib/admin-operator.ts` : provider/model settings, validation cache.
- `src/app/api/admin/operator/route.ts` -> `uses` -> `src/lib/admin-content.ts` : CRUD for article/project/certification/book via tools.
- `src/app/api/public-assistant/route.ts` -> `uses` -> `src/lib/public-assistant.ts` : deterministic retrieval + decision intelligence.
- `src/lib/public-assistant.ts` -> `uses` -> `src/lib/decision-intelligence.ts` : confidence thresholds, epistemic/aleatoric metadata.
- `src/lib/redis.ts` -> `fallback` -> in-memory Map in `src/lib/rate-limit.ts` : when `UPSTASH_REDIS_URL` is absent.
- Prisma client in `src/lib/db.ts` -> `singleton` -> `globalThis` : prevents multiple instances during HMR.
- `next.config.ts` -> `output: "standalone"` -> `postbuild-standalone.mjs` : copies `public/` and `.next/static/` into standalone bundle.

## 7. Risks and Bottlenecks

| Risk                                              | Impact                                       | Evidence                                                                         | Mitigation Hint                                                                                           |
| ------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `JWT_SECRET` missing at runtime                   | App fails to start                           | `src/lib/env.ts:11` min 32 chars; `build-time-placeholder-not-for-runtime-use!!` | `bun run secret:generate`; set real secret in production env.                                             |
| Redis down -> in-memory rate limit degrades       | Rate limiting not shared across instances    | `src/lib/rate-limit.ts:109-121`                                                  | Acceptable for small deploys; consider sticky sessions or external rate limit at edge for multi-instance. |
| Dual Prisma schema drift                          | Runtime schema mismatch (Postgres vs SQLite) | `prisma/schema.prisma` vs `schema.sqlite.prisma` + `admin-compat` dynamic SQL    | Maintain both schemas; run `db:generate` per target before migrations.                                    |
| Passkey backward-compat complexity                | Auth breakage if column assumptions change   | `src/lib/admin-compat.ts` dynamic `userId`/`credentialId` mapping                | Test passkey flows on fresh SQLite and MySQL-backed environments.                                         |
| Public assistant topic leak                       | Data disclosure outside public profile       | `src/lib/public-assistant.ts:110-119` strict patterns                            | Add regression tests around sensitive pattern matching.                                                   |
| `content-service.ts` fallback masking DB failures | Dashboard shows stale or empty data silently | `withFallback` swallows errors per instance                                      | Review `withFallback` calls to ensure operational logs surface DB issues.                                 |

## 8. Quick Agent Boot

- `git clone <repo> && cd douglasmitchell.info`
- `bun install`
- `cp .env.example .env` (generate or paste `JWT_SECRET` min 32 chars)
- `bun run db:push`
- `bun run dev`
- Open `http://localhost:3000`
- Verify: `bun run test && bun run test:e2e`
