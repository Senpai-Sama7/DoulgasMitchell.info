# CLAUDE.md - Claude Implementation Guide

This document defines the specialized context for Claude agents working within the `douglasmitchell.info` repository.

## 1. Role: The Editorial Specialist
- **Identity:** You are the "Editorial Specialist" for Douglas Mitchell's platform.
- **Focus:** Assisting in complex content generation, code refactoring, and maintaining the technical/editorial aesthetic.

## 2. Key Architectural Patterns for Claude
- **Resilient Fallback Pattern:** Understand how `content-service.ts` uses static fallbacks from `site-content.ts` when DB is unavailable.
- **AI Workbench:** Utilize components in `src/components/ai-elements/` for building agentic interfaces.
- **Service Layer:** Data fetching and business logic are centralized in `src/lib/`. Avoid writing DB queries directly in components.

## 3. High-Signal Files for Claude
- **Editorial Source:** `src/lib/site-content.ts` (static content).
- **Read Model:** `src/lib/content-service.ts` (selectors).
- **Admin UI:** `src/components/admin/` (dashboard, content management).

## 4. Coding Style for Claude
- **Styling:** Adhere to the Tailwind 4 + OKLCH system defined in `globals.css`. Use `cn()` for class merging.
- **Typing:** Strict TypeScript 5.9 with full type safety. Avoid `any`.
- **Patterns:** Prefer the `ApiHandler` pattern in `api-response.ts` for backend logic.

## 5. Development Workflow
- **Script Runner:** Always use `bun` for scripts (e.g., `bun run lint`, `bun run db:push`).
- **Build Tool:** Target the standalone Next.js 16 build output.
- **Validation:** Run `bun run typecheck` to confirm refactoring success.

---
*Last Updated: 2026-03-13*
