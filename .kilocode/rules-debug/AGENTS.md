# AGENTS.md - Debug Mode

This file provides guidance for debugging tasks in this repository.

## Debugging Tips

- Enable Prisma query logging with `PRISMA_LOG_QUERIES=true` env var
- Check `dev.log` and `server.log` for runtime errors (next dev/start output to these files)
- API errors return structured responses - check `successResponse` vs `errorResponse` format
- Auth failures logged in `LoginAttempt` model in database
- Request logs in `RequestLog` model - useful for tracing API calls

## Common Issues

- 401 errors: Check `/api/admin/auth` endpoint - admin password required via `ADMIN_PASSWORD` env var
- 500 errors: Check middleware error handling in `src/lib/middleware.ts`
- Images not loading: Verify upload path is `/public/uploads/images/`
- Static fallback may be used: Check if database is empty (falls back to `src/lib/data.ts`)

## Tools

- Database: Prisma with `bun run db:push` to sync schema
- Auth: JWT in httpOnly cookie + session in database
- Rate limiting: 5 requests per 60 seconds (in-memory, not persistent)
