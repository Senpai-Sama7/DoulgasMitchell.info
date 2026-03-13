# CLAUDE.md

Claude agents should use [`AGENTS.md`](./AGENTS.md) as the canonical project scaffold for this repository. The file is shared intentionally so AGENTS/GEMINI/CLAUDE contexts do not drift.

High-signal starting points:

- Public homepage flow: `src/app/page.tsx` -> `src/lib/content-service.ts` -> `src/components/site/home-page-shell.tsx`
- Admin auth flow: `src/app/admin/login/page.tsx` -> `src/app/api/admin/auth/route.ts` -> `src/lib/auth.ts`
- Passkeys: `src/lib/webauthn.ts` plus `src/app/api/admin/auth/passkey/*`
- Media pipeline: `src/app/api/upload/route.ts` -> `src/lib/upload-server.ts` -> `src/lib/upload.ts`

Everything else, including architecture, conventions, testing expectations, commands, and semantic code-navigation guidance, is defined in [`AGENTS.md`](./AGENTS.md).
