# Style & Conventions: douglasmitchell.info

## Design Philosophy
"Editorial-Architectural" — precise, monochrome, monospaced typography, ASCII-inflected textures, and OKLCH-based color precision.

## Coding Standards
- **UI Architecture:** Prefer Server Components for data fetching. Use Client Components for interactivity.
- **Styling:** Use `cn()` from `src/lib/utils.ts`. Stick to the monospaced/architectural aesthetic.
- **Validation:** Use Zod schemas from `src/lib/forms.ts` or `src/lib/env.ts` for inputs and environment variables.
- **Error Handling:** Use `ApiHandler` for API routes. DB queries must be wrapped in `withFallback` or similar patterns from `content-service.ts`.
- **Naming:** CamelCase for components/types, camelCase for functions/variables, kebab-case for filenames.
- **Imports:** Standard TypeScript/Next.js import patterns.

## Symbol Management
- `db` in `src/lib/db.ts`: Shared Prisma client.
- `getLandingPageData` in `src/lib/content-service.ts`: Main data source for the home page.
- `logActivity` in `src/lib/activity.ts`: Persist audit logs for actions.
- `ApiHandler` in `src/lib/api-response.ts`: Standardized API response factory.
- `env` in `src/lib/env.ts`: Type-safe environment variables.
- `HomePageShell` in `src/components/site/home-page-shell.tsx`: Primary interactive container.

## Legacy & Conflict Warnings
- Ignore `.kilocode/rules-*` directories (outdated).
- Rate Limiting (`src/lib/rate-limit.ts`) is currently in-memory.
