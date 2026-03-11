# Deep Architectural & Semantic Audit Report

## 1. Architectural Patterns (Next.js App Router)
- **Current State**: The project uses Next.js App Router. API routes are defined under `src/app/api`. Authentication relies on `get-session` at the handler level instead of a centralized `middleware.ts`.
- **Evaluation**: This ad-hoc session checking is prone to security gaps if a route is missed.
- **Action**: Implement a centralized `middleware.ts` for robust, declarative route protection for `/admin` and `/api/admin` paths. Ensure edge compatibility.

## 2. Prisma Schema Analysis
- **Current State**: Models cover articles, projects, certifications, books, and admin users. 
- **Evaluation**: While basic indexing exists (e.g., `@@index([slug])`), foreign key columns and frequently queried lookup fields (like `userId`, `articleId`, `status`) often lack individual indexes, which can lead to full table scans as data grows.
- **Action**: Add explicit indexes on relational foreign keys and filter fields (e.g., `status`, `category`).

## 3. Authentication & Security Flows
- **Current State**: JWTs are created via `jose` and passwords hashed with `bcryptjs`. Session management relies on server-side cookies, but DB-backed sessions are only partially robust. WebAuthn exists but is fragmented.
- **Evaluation**: The current password hashing algorithm uses 12 salt rounds, which is acceptable but could be hardened. The missing global middleware means each admin page manually checks the session.
- **Action**: 
  - Centralize auth checks using Next.js Middleware.
  - Enhance `ActivityLog` indexing.
  - Audit WebAuthn models for standards compliance (e.g., storing `aaguid`, `signCount`).

## Prioritized Checklist for Implementation

### Phase 1: Database & Schema Optimization (Prisma)
- [ ] Add `@@index([userId])` to `Session`, `PasskeyCredential`.
- [ ] Add `@@index([articleId])` to `ArticleBlock`, `ArticleMedia`, `Comment`, `Reaction`.
- [ ] Add `@@index([projectId])` to `ProjectMedia`.
- [ ] Add `@@index([status])` and `@@index([createdAt])` to main content models.
- [ ] Run `bun run db:generate` and `bun run db:push`.

### Phase 2: Security Hardening (Middleware & Auth)
- [ ] Create `src/middleware.ts` to protect `/admin` and `/api/admin` routes globally.
- [ ] Refactor existing admin API routes to trust the middleware session.
- [ ] Standardize rate-limiting across all `/api/admin/auth/*` routes.

### Phase 3: API & Route Optimization
- [ ] Standardize API error responses using a unified Error Handler pattern.
- [ ] Optimize database queries in `src/app/api/admin/articles/route.ts` to use `select` instead of fetching all fields.
