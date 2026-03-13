# Project Information: douglasmitchell.info

## Purpose
A high-performance editorial platform and portfolio for Douglas Mitchell. It focuses on operational rigor, AI fluency, and premium human-centered design.

## Tech Stack
- **Framework:** Next.js 16 (App Router), React 19, TypeScript 5.9.
- **Runtime:** Bun.
- **Database:** Prisma 6 (PostgreSQL/Neon) with SQLite fallback (`file:./dev.db`).
- **Styling:** Tailwind CSS 4, Framer Motion, shadcn/ui.
- **Auth:** JWT-based sessions + WebAuthn/Passkey support.
- **AI:** Google Gemini (@google/generative-ai) for Admin; local RAG for Public.
- **Media:** Sharp-based optimization, local disk storage.

## Structure
- `src/lib/content-service.ts`: Central read-model and logic (Resilient Fallback Pattern).
- `src/lib/db.ts`: Prisma client singleton.
- `prisma/schema.prisma`: Data models.
- `src/components/ai-elements/`: AI Workbench library.
- `src/lib/admin-ai.ts`: AI model management.
- `src/app/api/admin/ai/route.ts`: Architect AI backend.
- `src/lib/auth.ts`: Security and sessions.
- `src/lib/api-response.ts`: Standardized API responses.
