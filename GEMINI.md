# GEMINI.md

Gemini agents should use [`AGENTS.md`](./AGENTS.md) as the canonical project scaffold for this repository. The file is shared intentionally so AGENTS/GEMINI/CLAUDE contexts do not drift.

If a Gemini-specific task touches the admin AI system, start with:

- `src/app/api/admin/ai/route.ts`
- `src/lib/admin-ai.ts`
- `src/components/admin/ai/ai-agent.tsx`

Everything else, including architecture, conventions, testing expectations, commands, and semantic code-navigation guidance, is defined in [`AGENTS.md`](./AGENTS.md).
