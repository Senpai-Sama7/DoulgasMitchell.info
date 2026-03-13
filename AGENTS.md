# AGENTS.md - Canonical Project Scaffold

This document is the **primary source of truth** for all AI agents (Gemini, Claude, etc.) working in this repository. It provides the architectural, technical, and semantic context required for high-fidelity codebase interaction.

## 1. Project Identity & Purpose
- **Identity:** `douglasmitchell.info` — A high-performance editorial platform and portfolio for Douglas Mitchell.
- **Goal:** To design and deploy resilient systems at the intersection of operational rigor, AI fluency, and premium human-centered design.
- **Design Philosophy:** "Editorial-Architectural" — precise, monochrome, monospaced typography, ASCII-inflected textures, and OKLCH-based color precision.

## 2. Technical Stack
- **Framework:** Next.js 16 (App Router), React 19, TypeScript 5.9.
- **Runtime:** Bun (primary for scripts, development, and builds).
- **Database:** Prisma 6 (PostgreSQL/Neon) with a sophisticated local SQLite fallback (`file:./dev.db`).
- **Styling:** Tailwind CSS 4, Framer Motion (animations), shadcn/ui primitives.
- **Auth:** JWT-based sessions + WebAuthn/Passkey support (`@simplewebauthn`).
- **AI Engine:**
    - **Admin:** Direct integration with Google Gemini (`@google/generative-ai`) via the "Architect" AI persona.
    - **Public:** "Public Knowledge Console" — A sophisticated local RAG/scoring system (`src/lib/public-assistant.ts`) with an agentic UI.
- **Media:** Sharp-based image optimization, local disk storage with S3/R2 readiness.

## 3. Architectural Map

### Core Data & Content Flow
- `src/lib/content-service.ts`: The central read-model and logic layer. It manages the **Resilient Fallback Pattern**:
    - Checks for table existence via `db-introspection.ts`.
    - If DB is unavailable/empty, it transparently falls back to `src/lib/site-content.ts` (static editorial data).
- `src/lib/db.ts`: Prisma client singleton with automated logging and connection handling.
- `prisma/schema.prisma`: The source of truth for all models (Article, Project, Certification, Book, Media, ActivityLog).

### AI & Agentic Components
- `src/components/ai-elements/`: A comprehensive "AI Workbench" library. Components for `reasoning`, `artifacts`, `sandboxes`, `tool-calls`, and `chain-of-thought`.
- `src/lib/admin-ai.ts`: Manages AI model catalog, usage tracking, budgeting, and provider settings.
- `src/app/api/admin/ai/route.ts`: The "Architect" AI backend, handling model instantiation and system instruction steering.

### Security & Auth
- `src/lib/auth.ts`: Session management (sign, verify, cookie handling).
- `src/lib/webauthn.ts`: Passkey registration and authentication logic.
- `src/lib/request.ts`: Trusted origin validation, client fingerprinting, and IP retrieval.

### Response & Operational Logic
- `src/lib/api-response.ts`: `ApiHandler` class for standardized success/error responses.
- `src/lib/activity.ts`: `logActivity()` for persisting audit trails of administrative actions.
- `src/lib/operational-compat.ts`: Compatibility layer for operational data (newsletter, contact, activity).

## 4. Coding Conventions & Standards

### Implementation Guidelines
- **UI Architecture:** Prefer Server Components for data fetching. Use Client Components for interactivity (mostly in `src/components/site`).
- **Styling:** Use `cn()` from `src/lib/utils.ts`. Stick to the monospaced/architectural aesthetic.
- **Validation:** ALWAYS use Zod schemas from `src/lib/forms.ts` or `src/lib/env.ts` for inputs and environment.
- **Error Handling:** Use `ApiHandler` for API routes. Ensure DB queries are wrapped in `withFallback` or similar patterns from `content-service.ts`.
- **Naming:** CamelCase for components/types, camelCase for functions/variables, kebab-case for filenames.

### Tooling & Commands
- **Dev:** `bun run dev` (output to `dev.log`).
- **DB:** `bun run db:push` (sync schema), `bun run db:generate` (client).
- **Admin:** `bun run admin:check` (verify user), `bun run admin:reset` (password).
- **Build:** `bun run build` (standalone mode).
- **Validation:** `bun run lint`, `bun run typecheck`, `bun run test` (Vitest).

## 5. Semantic Symbol Map

| Symbol | Location | Purpose |
| :--- | :--- | :--- |
| `db` | `src/lib/db.ts` | Shared Prisma client. |
| `getLandingPageData` | `src/lib/content-service.ts` | Main data source for the home page. |
| `logActivity` | `src/lib/activity.ts` | Persist audit logs for actions. |
| `ApiHandler` | `src/lib/api-response.ts` | Standardized API response factory. |
| `env` | `src/lib/env.ts` | Type-safe environment variables. |
| `HomePageShell` | `src/components/site/home-page-shell.tsx` | The primary interactive container. |

## 6. Legacy & Conflict Warnings
- **Rules Directory:** Ignore the `.kilocode/rules-*` directories. They contain outdated rules (e.g., `withMiddleware` pattern) that do not apply to this version of the project.
- **Rate Limiting:** `src/lib/rate-limit.ts` is currently in-memory. Do not assume persistent/distributed rate limiting unless explicitly upgraded to Redis.

---
*Last Updated: 2026-03-13*
