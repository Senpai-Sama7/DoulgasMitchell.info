# GEMINI.md - Agent Context & Project Blueprint

This document provides a deep-dive into the **Douglas Mitchell Editorial Platform** (douglasmitchell.info). It is designed to give AI agents (specifically Gemini-powered) expert-level context on architecture, patterns, and conventions.

## 🚀 Technical Core

- **Framework**: Next.js 16.1 (App Router) - Using the latest React 19 features.
- **Styling**: Tailwind CSS 4.0 - Utilizing the new `@import "tailwindcss"` syntax and CSS-variable-first theming.
- **Language**: TypeScript 5.x - Strict mode enabled, no `any` policy.
- **Database**: Prisma 6.x + PostgreSQL - High-performance ORM with a focus on relational integrity.
- **Runtime**: Bun - Primary package manager and runner (supports npm as fallback).

## 🏗️ Architecture & Patterns

### 1. Data Model (Prisma)
The platform is centered around an editorial/portfolio model. Key entities in `prisma/schema.prisma`:
- `Article` & `ArticleBlock`: Support for long-form content with custom block types (text, code, ascii-art, etc.).
- `Project`: Portfolio items with tech stack and status tracking.
- `AdminUser` & `Session`: Custom authentication and session management.
- `ActivityLog` & `RequestLog`: Comprehensive audit trailing.
- `SiteContent` & `Settings`: Dynamic configuration and content fragments.

### 2. Authentication System (`src/lib/auth.ts`)
- **JWT + Session**: Uses `jose` for secure JWT handling and stores sessions in the database for revocation support.
- **WebAuthn/Passkeys**: Native support for biometric/hardware authentication (`@simplewebauthn`).
- **Session Handling**: Cookies are `httpOnly`, `secure`, and `sameSite: strict`. Use `getSession()` in server components/actions.
- **Rate Limiting**: Native implementation in `src/lib/rate-limit.ts` (Redis-backed via `@upstash/redis` if configured).

### 3. API Design
- **Standard Handlers**: Uses native Next.js `NextRequest` and `NextResponse`.
- **Logic Location**: Core business logic resides in `src/lib/` (e.g., `content-service.ts`, `site-content.ts`).
- **Logging**: All administrative actions must call `logActivity()` from `@/lib/activity`.

### 4. UI & Styling
- **Components**: Based on `shadcn/ui` (Radix UI primitives). Located in `src/components/ui`.
- **Animations**: `framer-motion` for complex transitions; `tailwindcss-animate` for simple ones.
- **Theming**: Dark-mode primary. Brand colors: `--color-primary`, `--color-accent`.
- **Typography**: Specialized monospaced and orbital fonts (`Orbitron`, `JetBrains Mono`, `Share Tech Mono`).

### 5. Editorial ASCII Art System (`src/lib/ascii/`)
This is a first-class citizen, not a gimmick.
- **Pattern System**: `asciiPatterns` in `src/lib/ascii/patterns.ts` provides consistent borders, icons, and dividers.
- **Generators**: `generateAsciiBox`, `generateProgressBar`, and `glitchText` for dynamic UI elements.
- **Convention**: Use these for headers, section markers, and code block decorations to maintain the "Architect" aesthetic.

## 🛠️ Developer Workflow

### Common Commands
```bash
bun run dev          # Start development server
bun run build        # Build for production (includes standalone output)
bun run test         # Run Vitest suite
bun run typecheck    # Run tsc verification
bun run db:push      # Sync schema to DB
```

### Testing Strategy
- **Location**: `src/__tests__`
- **Tool**: Vitest.
- **Focus**: Unit tests for library utilities (auth, rate limits, content processing).
- **Rule**: Every new library function or critical API change *requires* a corresponding test.

## 📏 Coding Conventions

1. **Imports**: Sort by external → internal `@/` → relative `./`. Use `type` for type-only imports.
2. **Server/Client**: Default to Server Components. Use `"use client"` only when interactive state or browser APIs are needed.
3. **Error Handling**: Use the standard error responses. Log errors on the server, but provide user-friendly messages on the client via `sonner` toasts.
4. **Environment Variables**: Managed via `src/lib/env.ts`. Always validate env presence there.
5. **Database Access**: Always use the singleton `db` instance from `@/lib/db`.

## 🧠 Semantic Context for Agents

- **Symbol Search**: Core logic is in `src/lib`. API endpoints are in `src/app/api`.
- **Aesthetic**: "The Architect" - Technical, precise, monospaced, accented with ASCII.
- **References**: When modifying content, refer to the `ArticleBlock` model for how data is structured.
- **Diagnostics**: Check `dev.log` for runtime issues; check `ActivityLog` in the DB for audit trails.
