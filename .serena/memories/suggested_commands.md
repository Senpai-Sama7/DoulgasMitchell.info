# Suggested Commands for douglasmitchell.info

## Development
- `bun run dev`: Start the development server (logs to `dev.log`).

## Database
- `bun run db:push`: Sync Prisma schema to database.
- `bun run db:generate`: Generate Prisma client.
- `bun run db:migrate`: Create and apply database migrations.
- `bun run db:reset`: Reset database migrations.

## Build & Run
- `bun run build`: Build for production (Next.js standalone mode).
- `bun run start`: Start production server (logs to `server.log`).

## Verification
- `bun run lint`: Run ESLint check.
- `bun run typecheck`: Run TypeScript type check.
- `bun run test`: Run Vitest tests (generates Prisma client first).

## Admin Utilities
- `bun run admin:check`: Verify administrative user status.
- `bun run admin:reset`: Reset administrator password.
- `bun run admin:test-login`: Test administrative login flow.
- `bun run content:provision`: Provision initial content to the database.

## System Utilities (Linux)
- `ls`, `cd`, `pwd`: Standard navigation.
- `grep`, `find`: Standard searching.
- `bun x <command>`: Run a package without installing (like npx).
