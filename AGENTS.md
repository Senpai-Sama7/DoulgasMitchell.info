# AGENTS.md - Canonical Project Scaffold

This document is the **primary source of truth** for all AI agents (Gemini, Claude, etc.) working in this repository. It provides the deeply tailored architectural, technical, and semantic context required for high-fidelity codebase interaction.

## 1. Project Identity & Purpose
- **Identity:** `douglasmitchell.info` — A high-performance editorial platform and portfolio for Douglas Mitchell.
- **Goal:** To design and deploy resilient systems at the intersection of operational rigor, AI fluency, and premium human-centered design.
- **Design Philosophy:** "Editorial-Architectural" — precise, monochrome, monospaced typography, ASCII-inflected textures, and OKLCH-based color precision.

## 2. Technical Stack & Dependencies
- **Framework:** Next.js 16.1 (App Router), React 19.
- **Runtime:** Bun (primary for scripts, development, and builds).
- **Database:** Prisma 6.11 (PostgreSQL/Neon) with a local SQLite fallback (`file:./dev.db`).
- **Styling:** Tailwind CSS 4, Framer Motion (animations), shadcn/ui primitives.
- **Auth:** JWT-based sessions + WebAuthn/Passkey support (`@simplewebauthn`).
- **Testing:** Vitest 3.2.4 for robust, fast unit and integration testing.
- **AI Engine:**
    - **Admin:** Direct integration with Google Gemini (`@google/generative-ai`) via the "Architect" AI persona.
    - **Public:** "Public Knowledge Console" — A sophisticated local RAG/scoring system (`src/lib/public-assistant.ts`).
- **Media:** Sharp-based image optimization, local disk storage with S3/R2 readiness.

## 3. Architectural Map & Component Topology

### Core Data & Content Flow
- `src/lib/content-service.ts`: The central read-model and logic layer. It manages the **Resilient Fallback Pattern**:
    - Checks for table existence via `db-introspection.ts`.
    - If DB is unavailable/empty, it transparently falls back to `src/lib/site-content.ts` (static editorial data).
- `src/lib/db.ts`: Prisma client singleton with automated logging and connection handling.
- `prisma/schema.prisma`: The source of truth for all models (Article, Project, Certification, Book, Media, ActivityLog).

### Security & Authentication
- `src/lib/auth.ts`: Session management (sign, verify, cookie handling, bcrypt hashing).
- `src/lib/webauthn.ts`: Passkey registration and authentication logic.
- `src/lib/request.ts`: Trusted origin validation, client fingerprinting, and IP extraction.
- `src/lib/rate-limit.ts`: In-memory rate limiting implementation to prevent brute force attacks.

### API & Response Handlers
- `src/lib/api-response.ts`: `ApiHandler` class for standardized success/error JSON responses.
- `src/app/api/`: All backend routes are isolated here (e.g., `/api/admin/*`, `/api/upload/route.ts`).
- `src/lib/activity.ts`: `logActivity()` for persisting audit trails of administrative actions.

### AI & Agentic Components
- `src/components/ai-elements/`: A comprehensive "AI Workbench" library with `reasoning`, `artifacts`, `sandboxes`, `tool-calls`, and `chain-of-thought`.
- `src/lib/admin-ai.ts` & `src/app/api/admin/ai/route.ts`: Admin Architect AI model definitions and API endpoint.

## 4. Coding Conventions & Style Guidelines

### Implementation Rules
- **UI Architecture:** Prefer Server Components for data fetching. Use Client Components ONLY when interactivity or hooks (like `useState`, `useEffect`, `useReducedMotion`) are required.
- **Styling:** Use `cn()` from `src/lib/utils.ts` for Tailwind class merging. Stick to the monospaced/architectural aesthetic. Ensure `overflow-x-hidden` globally on mobile.
- **Validation:** ALWAYS use Zod schemas for parsing inputs (`src/lib/forms.ts`) and environment variables (`src/lib/env.ts`).
- **Error Handling:** Use `ApiHandler` for API routes. Ensure DB queries are wrapped in `withFallback` or similar patterns.
- **Naming:** `CamelCase` for React components/types, `camelCase` for functions/variables, `kebab-case` for filenames and directories.
- **TypeScript:** Strict TS 5.9 with full type safety. Do not use `any`.

## 5. Testing & Validation Requirements
- **Unit/Integration Tests:** Located in `src/__tests__/`. ALWAYS run tests before finalizing code changes.
- **Test Command:** `bun run test` (executes Vitest 3.2.4).
- **Coverage & Boundaries:** Ensure edge-case failures, boundary conditions, and security implications (e.g., file upload MIME types, SQLi prevention) are explicitly covered and verified.

## 6. Tooling & Preferred Commands
- **Dev Server:** `bun run dev` (output to `dev.log`).
- **Build (Standalone):** `bun run build` (outputs to `.next/standalone`).
- **Code Validation:** `bun run lint` (ESLint) and `bun run typecheck` (tsc).
- **Database:** `bun run db:push` (sync schema), `bun run db:generate` (client).
- **Admin Utilities:** `bun run admin:check`, `bun run admin:reset`.

## 7. Semantic Code Analysis & Diagnostics
When navigating this codebase, agents should use specific semantic references:
- **Symbol Search:** To find core utilities, search for `ApiHandler` (responses), `db` (Prisma instance), `env` (Zod env parser).
- **References:** `logActivity` is referenced in all admin mutation routes. `getLandingPageData` is the primary data source for the home page.
- **Diagnostics:** If the app fails to start, check `db-introspection.ts` and `rate-limit.ts` first. For file uploads, check `upload.ts` (MIME/size validation) and `upload-server.ts`.

## 8. Legacy & Conflict Warnings
- **Rules Directory:** Ignore the `.kilocode/rules-*` directories. They contain outdated rules.
- **Rate Limiting:** `src/lib/rate-limit.ts` is currently in-memory. Do not assume persistent distributed rate limiting unless specifically requested.
- **Passwords:** DO NOT use hardcoded fallback passwords (e.g. `senpai2024`) anywhere in the code.

---
*Last Updated: 2026-03-13*

## 9. EXECUTION RULES (apply to every phase and every task)
**Planning:**
- Use step-by-step reasoning to produce the implementation plan. 
  Show your reasoning before code — but the plan is not proof of completion.
**Gates (non-negotiable before marking any task [x]):**
- Every task must pass its gate command before being marked complete.
- Gate command output must appear verbatim in the Proof line (trimmed to relevant lines + timestamp).
- If the gate fails: task stays [ ], error is logged under ❌ FAIL:, and you fix 
  before continuing. You do not move to the next task on a failing gate.
**Failures:**
- Do NOT delete original implementation attempts that failed.
- Keep the original code/approach, append ❌ FAIL: with the exact error, 
  then append ✅ FIX: with what replaced it and why it worked.
**Proof format (required on every task):**
```
Proof: `<exact command>` → `<trimmed output with exit code>` @ <timestamp>
```
Example:
```
Proof: `npm run build` → `✓ Built in 3.2s, 0 errors` (exit 0) @ 2025-03-13T14:22:01Z
```

## 10. TRACKER MUTATION RULES — PERMANENT, NON-NEGOTIABLE
These rules apply to every agent (human or AI) editing this file. Violating them 
invalidates the proof chain.

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

*Note: These rules were established at project init and apply permanently. Any AI agent reading AGENTS.md must treat these rules as hard constraints, not suggestions.*
