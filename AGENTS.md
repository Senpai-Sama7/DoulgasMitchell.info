# AGENTS.md

This file is loaded before agent work in this repository. It is intentionally specific to the current codebase and should be treated as the first source of truth before making changes.

## Project Identity

- Project: Douglas Mitchell editorial platform / portfolio (`douglasmitchell.info`)
- App type: public editorial site plus protected admin portal
- Stack: Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS 4, Prisma 6, PostgreSQL schema, Bun-first scripts
- Design language: technical/editorial, monospaced, ASCII-inflected, precise rather than playful

## What The App Actually Does

- Public marketing/editorial experience renders the home page and content detail pages from `src/app/page.tsx`, `src/app/writing/[slug]/page.tsx`, and `src/app/work/[slug]/page.tsx`.
- The home page is assembled by [`src/components/site/home-page-shell.tsx`] and fed by `getLandingPageData()` in [`src/lib/content-service.ts`].
- Content can come from the database, but the site also has hardcoded editorial fallbacks in [`src/lib/site-content.ts`]. Agents must distinguish between fallback showcase data and persisted CMS data.
- The admin portal lives under `src/app/admin`. Protected routes are gated by [`src/app/admin/(protected)/layout.tsx`], which redirects to `/admin/login` when `getSession()` returns null.
- Hidden admin discovery is not magical. The footer literally links to `/admin` through the word `intent.` in [`src/components/site/footer.tsx`].

## Architecture Map

### Rendering model

- `src/app/layout.tsx` defines global metadata, fonts, JSON-LD, analytics, speed insights, and the toast host.
- `src/app/page.tsx` is a server component that fetches content through `getLandingPageData()` and passes it into the client shell.
- `src/components/site/home-page-shell.tsx` is the interaction-heavy landing-page shell. It owns splash state, command palette state, progress indicator, theme toggle wiring, and page-view tracking.
- Most `src/components/site/*` files are client components because the homepage is animation-heavy and interactive.

### Content and data flow

- `src/lib/content-service.ts` is the main read-model layer. Start there for public content and admin dashboard data.
- Key exported selectors:
  - `getLandingPageData()`
  - `getArticleBySlug()`
  - `getProjectBySlug()`
  - `getAdminDashboardData()`
  - `getAdminContentSnapshot()`
  - `getAdminAnalyticsData()`
  - `getAdminSecurityData()`
  - `getUserPasskeys()`
- `src/lib/site-content.ts` holds curated fallback content, profile metadata, hero metrics, social links, featured projects/articles, certification showcase data, and book metadata.
- `content-service.ts` dynamically checks whether required tables exist before querying content tables. If content tables are unavailable, it falls back to the static data in `site-content.ts`.

### Persistence model

- Prisma schema is in [`prisma/schema.prisma`].
- Core content models:
  - `Article`, `ArticleBlock`
  - `Project`
  - `Certification`
  - `Book`
  - `Media`, `ArticleMedia`, `ProjectMedia`
  - `ContactSubmission`
  - `SiteConfig`
- Auth/admin models:
  - `AdminUser`
  - `Session`
  - `PasskeyCredential`
  - `ActivityLog`
- Engagement/analytics models also exist in the schema beyond the first content block, including page views, comments, reactions, newsletter data, and request/activity-style logging. Read the schema before adding new reporting features.

### Auth and security boundaries

- Session auth is implemented in [`src/lib/auth.ts`].
- Sessions are JWT-backed and also persisted in the `Session` table for revocation and expiry checks.
- `getSession()` reads the `admin-session` cookie, verifies JWT, then verifies the persisted session row and active user state in the database.
- Password auth flows through [`src/app/api/admin/auth/route.ts`].
- Passkey flows use `@simplewebauthn` and are centered in [`src/lib/webauthn.ts`] and:
  - `src/app/api/admin/auth/passkey/generate-options/route.ts`
  - `src/app/api/admin/auth/passkey/verify/route.ts`
  - `src/app/api/admin/auth/passkey/register/generate-options/route.ts`
  - `src/app/api/admin/auth/passkey/register/verify/route.ts`
- Admin pages should assume protected layout is the primary gate, but API routes must still independently verify session.
- Security headers are configured centrally in [`next.config.ts`].

### API conventions

- Standardized JSON responses should use `ApiHandler` from [`src/lib/api-response.ts`] where that pattern is already in use.
- Not every route uses `ApiHandler`; some older routes return `NextResponse.json(...)` directly. Preserve the local convention unless you are doing a deliberate cleanup.
- Administrative or auditable mutations should call `logActivity()` from [`src/lib/activity.ts`].
- Request metadata helpers live in [`src/lib/request.ts`] via `getClientIp()` and `getUserAgent()`.

### Media pipeline

- Client/server upload validation helpers live in [`src/lib/upload.ts`].
- Storage processing lives in [`src/lib/upload-server.ts`].
- Upload API lives in [`src/app/api/upload/route.ts`].
- Current implementation is local-disk oriented using `env.UPLOAD_DIR`, per-category folders, Sharp-based image optimization, thumbnail generation, and Prisma `Media` records.

### Theme and design system

- Tailwind 4 global design tokens and utility definitions live in [`src/app/globals.css`].
- Theme state is not handled by `next-themes`; the repo uses a custom `useSyncExternalStore` store in [`src/lib/theme.ts`].
- shadcn/ui primitives live in `src/components/ui`.
- The visual system relies on CSS variables, mono-heavy typography, bordered panels, subtle glow, ASCII dividers, and light/dark parity. Do not replace that with generic SaaS styling.

## Important Reality Checks

- The Prisma datasource is configured as `postgresql` in [`prisma/schema.prisma`], but both [`src/lib/env.ts`] and [`src/lib/db.ts`] fall back to `file:./dev.db`. That fallback is inconsistent with the Prisma datasource provider. Do not assume SQLite is actually a supported runtime without verifying the current environment and migration strategy.
- `src/lib/rate-limit.ts` is an in-memory `Map` implementation. It is not currently Redis-backed, despite older high-level docs suggesting Redis. Treat rate limiting as process-local unless you intentionally rework it.
- `features.passkeys` in [`src/lib/env.ts`] currently requires `ENABLE_PASSKEYS === "true"` and `ADMIN_PASSWORD` to be present. If passkeys behave unexpectedly, inspect that gate first.
- The admin AI route uses Google Gemini through [`src/app/api/admin/ai/route.ts`] and model settings/usage persistence in [`src/lib/admin-ai.ts`]. It is not abstracted behind a provider layer.

## Coding Conventions In This Repo

- Prefer server components for route entrypoints and data fetching.
- Use client components only where browser APIs, animations, local interaction state, or WebAuthn/browser-only libraries are required.
- Use the `@/` import alias for app code.
- Keep business logic in `src/lib`, not inline in route files or large components.
- Prefer named exports for utilities and components. Existing route default exports are fine where required by Next.js.
- Use strict TypeScript, but note that the repo currently has `noImplicitAny: false` in [`tsconfig.json`]. Do not introduce fresh `any` unless unavoidable.
- Keep comments sparse. The codebase mostly uses short section comments or explanatory comments around tricky behavior only.
- Preserve the editorial tone in user-facing copy: precise, premium, technical, no inflated marketing filler.

## Testing Requirements

- Test runner: Vitest via `bun run test`
- Config: [`vitest.config.ts`]
- Existing suites are in `src/__tests__` and currently cover:
  - auth helpers
  - form validation
  - site-content integrity
  - upload helpers
- Current tests are mostly unit-level and do not exercise full DB-backed flows.
- If you change logic in `src/lib/auth.ts`, `src/lib/forms.ts`, `src/lib/upload.ts`, or static content constraints in `src/lib/site-content.ts`, add or update tests in `src/__tests__`.
- For admin route or Prisma-heavy changes, at minimum run targeted reasoning plus `bun run typecheck`. Add tests when the change can be isolated without fragile environment setup.

## Preferred Commands

### Core

```bash
bun install
bun run dev
bun run build
bun run start
bun run test
bun run typecheck
bun run lint
```

### Database and admin

```bash
bun run db:generate
bun run db:push
bun run db:migrate
bun run db:reset
bun run admin:check
bun run admin:reset
bun run admin:test-login
```

### Fast code navigation

```bash
rg --files src prisma
rg -n "getSession\\(" src
rg -n "logActivity\\(" src
rg -n "use client" src/app src/components src/lib
rg -n "export (const|async function|function)" src/lib/content-service.ts
```

Use `rg` first for text, symbol hunting, route discovery, and reverse references. It is the fastest way to answer most “where is this implemented?” questions in this repo.

## Semantic Code Analysis Playbook

When an agent needs symbol search, references, definitions, or diagnostics, use this order:

1. Definition lookup
- Start with `rg -n "export (const|function|async function|class) <symbol>" src`
- Then inspect the owning module directly.

2. Reference search
- Use `rg -n "<symbol>" src`
- For route handlers, also search the corresponding fetch paths, such as `rg -n "/api/admin/auth" src`

3. Architectural trace
- For public content: start at `src/app/page.tsx` -> `src/lib/content-service.ts` -> `src/lib/site-content.ts` or Prisma selectors.
- For admin auth: start at `src/app/admin/login/page.tsx` -> auth/passkey API routes -> `src/lib/auth.ts` and `src/lib/webauthn.ts`.
- For uploads: start at `src/components/admin/media-uploader.tsx` or `src/app/api/upload/route.ts` -> `src/lib/upload-server.ts` -> `src/lib/upload.ts`.

4. Diagnostics
- `bun run typecheck` for TypeScript regressions
- `bun run lint` for style and framework issues
- `bun run test` for unit coverage
- `dev.log` and `server.log` are real artifacts because `dev` and `start` scripts tee output there
- Prisma/runtime issues usually require checking env values and the active database URL first

5. Definitions across UI boundaries
- Search the component index barrels in `src/components/site/index.ts` and `src/components/admin/index.ts` before assuming a component is unused.

## File And Folder Guide

- `src/app`
  - Next.js routes, layouts, metadata, API handlers
- `src/components/site`
  - public-facing sections and landing-page shell
- `src/components/admin`
  - admin dashboard UI, AI panel, media uploader, passkey manager
- `src/components/ui`
  - shadcn/ui primitives and wrappers
- `src/components/effects`
  - splash, cursor, particle, and command-palette effects
- `src/lib`
  - actual business logic, auth, DB access, content selectors, upload pipeline, theme store, env parsing
- `src/__tests__`
  - Vitest unit suites
- `prisma`
  - schema and migrations
- `public/uploads`
  - local uploaded assets in the current storage mode

## Guidance By Change Type

### If editing the homepage

- Check `src/app/page.tsx`, `src/components/site/home-page-shell.tsx`, and whichever section component you are touching.
- If content is showcase-only, verify whether it belongs in `src/lib/site-content.ts` instead of hardcoding inside a component.
- Respect the ASCII/editorial motif defined in `globals.css`.

### If editing content retrieval

- Start in `src/lib/content-service.ts`.
- Preserve fallback behavior when DB tables are unavailable unless intentionally changing that strategy.
- Keep mapping helpers aligned with Prisma field shapes and site-facing showcase interfaces.

### If editing admin auth or security

- Read `src/lib/auth.ts`, `src/lib/webauthn.ts`, `src/app/api/admin/auth/route.ts`, and the relevant passkey routes together.
- Session changes affect both cookies and persisted DB sessions.
- For auditable actions, log them through `logActivity()`.

### If editing uploads/media

- Keep validation in `src/lib/upload.ts`.
- Keep file-system and Sharp logic in `src/lib/upload-server.ts`.
- Keep Prisma record creation/deletion and authorization in `src/app/api/upload/route.ts`.

### If editing AI admin features

- Model catalog, budget estimation, and usage persistence live in `src/lib/admin-ai.ts`.
- API access lives in `src/app/api/admin/ai/route.ts`.
- The admin-facing client component is `src/components/admin/ai/ai-agent.tsx`.

## Style Guidelines

- Match the repository’s existing formatting and quote style in the file you edit. The codebase is mixed; do not churn quote style unnecessarily.
- Prefer small, composable helpers in `src/lib` over bloated route files.
- Keep JSX class names aligned with current Tailwind/CSS-variable patterns rather than introducing ad hoc inline styles.
- Reuse established tokens like `editorial-container`, mono typography, border-driven cards, and muted foreground hierarchy.
- Maintain accessibility affordances already present in the app, including skip links, reduced-motion handling, and semantic labels.

## Before You Finish

- Run the narrowest useful verification for the change, and at minimum run `bun run typecheck` for nontrivial TypeScript edits.
- If you changed utilities or schema-shaping logic, run `bun run test`.
- If you changed route behavior or client/server boundaries, inspect for auth, cookie, and serialization issues.
- Call out any environment assumptions explicitly, especially around `DATABASE_URL`, Gemini API keys, and passkey origin settings.
