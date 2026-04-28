# GAPS_AUDIT.md — Uncovered Risk Categories

> **Scope**: These are categories **NOT covered** in `fixes.md`, `FIXES_EVALUATION.md`, or `FIX_PLAN.md`.  
> Anything mentioned in those docs is treated as "accounted for" — even if severity is disputed.

---

## 🔴 CRITICAL GAPS

### 1. Security Headers Missing
**Files**: None reviewed  
**Issue**: No mention of HTTP security headers in any doc:
- `Content-Security-Policy` (CSP) — open to XSS via injected scripts
- `X-Frame-Options` / `frame-ancestors` — clickjacking risk
- `Strict-Transport-Security` (HSTS) — protocol downgrade, mixed-content
- `Referrer-Policy` — PII leakage via referrer
- `Permissions-Policy` — camera, mic, geolocation abuse

**Risk**: Entire site vulnerable to XSS, clickjacking, and protocol downgrade attacks.

---

### 2. Cookie Hardening Incomplete
**Files**: `src/lib/auth.ts`, `src/lib/webauthn.ts` (not reviewed for this)  
**Issues NOT covered**:
- All auth/session cookies: `HttpOnly`, `Secure`, `SameSite=strict|lax` verification
- CSRF-sensitive flows rely on cookies — need `SameSite` + origin checking together
- Passkey/auth cookies: short TTLs, per-device scoping, rotation on use
- Challenge cookies (`passkey-challenge-cookie.ts`): `SameSite`, expiry not verified

**Risk**: Auth bypass, session fixation, CSRF attacks.

---

### 3. Authentication & Authorization Model Undefined
**Files**: `src/lib/auth.ts`, all `/api/admin/*` routes  
**Not analyzed**:
- Can non-admin hit `/admin` API routes directly via ID guessing?
- Resource-level permissions enforced (per-article edit, per-project visibility)?
- Explicit limits on active sessions per user / device scoping?
- Account lockout, MFA outside passkeys?
- Role escalation vectors (editor → admin)?

**Risk**: Privilege escalation, unauthorized data access.

---

### 4. Secrets Management & Key Rotation
**Files**: `src/lib/env.ts`, `.env` handling  
**Not reviewed**:
- Secrets (API keys, JWT keys, DB passwords) rotated/versioned/scoped per environment?
- Keys stored ONLY in env vars — or leak into logs, client bundles, committed configs?
- JWT signing key rotation path without invalidating all sessions at once?
- `.env.example` template missing (documented as gap in `fixes.md` but not scheduled).

**Risk**: Key compromise, session invalidation cascades.

---

## 🟠 HIGH GAPS

### 5. CSRF Protections Beyond Origin Check
**Files**: `src/lib/request.ts`  
** Gap**: Even after fixing Referer fallback (S6 in FIX_PLAN), no analysis of:
- Anti-CSRF tokens (synchronizer token, double-submit cookie) on state-changing routes
- Reliance on origin checking alone (brittle across older browsers, mobile in-app, proxies)
- API routes differentiated when called from scripts vs browsers

**Risk**: CSRF attacks on login, admin actions, chat writes.

---

### 6. Privacy, Data Retention & Compliance
**Files**: `prisma/schema.prisma`, logging infrastructure  
**No mention of**:
- AI conversation logs, uploaded files, embeddings → retention policy?
- Activity logs, analytics beyond `ActivityLog` schema's `userId` nullability
- Log files (`*-gate.log`, `e2e-gate.log`) committed to repo → may contain sensitive data
- GDPR/CCPA-style right-to-erasure requests → how to honor?

**Risk**: Regulatory non-compliance, PII leakage, unlimited liability.

---

### 7. PII & Secrets in Logs
**Files**: `src/lib/logger.ts` (not reviewed)  
**Not evaluated**:
- Do logs capture full request bodies, JWTs, tokens?
- AI prompts/responses (may include identifiable user data) logged in full?
- Logs structured, redacted, centralized — or scattered across filesystem?

**Risk**: PII leakage through log files, debug exposure.

---

### 8. Observability Strategy Missing
**Files**: None  
**Not discussed**:
- Consistent logging API (log levels, correlation IDs, user/session IDs that don't leak PII)
- Distributed tracing / request IDs propagating from edge middleware through app code
- Application metrics beyond stub `/api/health` and `/api/metrics`:
  - Latency, error rate, AI token usage, DB query perf, rate-limit hits
- How to answer "what broke?" when failures happen?

**Risk**: Un-debuggable production failures, blind operations.

---

### 9. Backup, Migration & Disaster Recovery
**Files**: `prisma/`, deployment scripts  
**Never addressed**:
- How/when DB backups taken, verified, restored?
- Schema migrations: ordered, tested, rolled back if deploy fails midway?
- Environment-specific migration strategies (dev reseeds vs prod zero-downtime)?
- Clear revert plan for bad deployments?

**Risk**: Data loss, unrecoverable corrupt migrations.

---

## 🟡 MEDIUM GAPS

### 10. Testing Strategy Undefined
**Files**: `vitest.config.ts`, `playwright.config.ts`, CI pipeline  
**No mention of**:
- Minimum unit test coverage targets (auth, rate limiting, AI orchestration)
- Integration tests: "admin logs in → creates content → AI assistant references that content"
- Regression tests for bugs already found (prevent reappearance)
- CI gatekeeping: do pushes to main require green tests? Type checks enforced?
- Prisma migrations validated in pipeline before deploy?

**Risk**: Untested code paths, regressions, broken deployments.

---

### 11. Frontend Accessibility Beyond Color
**Files**: All UI components  
**Barely touched** (color contrast only):
- Keyboard navigation: sidebar, chat controls, modals, file upload — logical tab order?
- ARIA roles, labels, `aria-*` attributes for screen readers (admin panel, chat)
- Focus management: opening/closing overlays, error handling, chat transcript navigation
- `prefers-reduced-motion` media query respected?
- Layout stability: chat messages, admin stats cause CLS? Images/cards reserve space?

**Risk**: WCAG failures, unusable by assistive tech users.

---

### 12. AI Safety & Abuse Prevention
**Files**: `src/lib/public-assistant.ts`, AI tool definitions  
**Not inspected**:
- Prompt injection defenses (user telling AI to ignore system instructions, exfiltrate data, make arbitrary tool calls)
- Sanitise/constrain tool responses and system prompts before showing to user
- AI outputs filtered for harmful content (public-facing chat)?
- Per-user/IP limits on AI usage (requests/min, tokens/day)
- Timeouts/circuit-breakers when AI provider is slow/down
- Handling partial/streaming responses when connection drops mid-generation

**Risk**: Prompt injection, data exfiltration, cost abuse, DoS via AI.

---

## 🔵 LOW GAPS (but structurally important)

### 13. Deployment & Environment Matrix
**Files**: `package.json`, deployment configs  
**No documentation of**:
- How many environments (local, dev, staging, prod) and config differences?
- Feature toggles between environments (flags, env vars, branches)?
- Secrets/configs injected per environment (Vercel/Docker/bare metal)?
- Rollback procedures: previous build artifacts, DB state, cache?
- Incident procedures: who paged when health/metrics fail? Deployment verification beyond 200?

**Risk**: Deployment confusion, environment drift, unrecoverable failures.

---

### 14. Developer Experience & Maintainability
**Files**: Project root  
**Not covered**:
- Consistent code style enforced by Prettier or equivalent?
- Pre-commit hooks (Husky) to run lint/tests/format before code hits CI?
- Module/domain structure standard (how features grouped, AI logic vs UI)?
- API docs for internal routes (how `/api/health` and `/api/metrics` should behave)?
- ADRs (Architecture Decision Records) explaining why choices made?
- Developer onboarding docs beyond quickstart URL?

**Risk**: Codebase entropy, onboarding friction, repeated past mistakes.

---

## DOCUMENT INCONSISTENCIES (Meta-Issues)

### Conflict 1: Tailwind Paths
- `FIXES_EVALUATION.md` marks "Tailwind paths wrong" as **FALSE** ✅ (actual config is correct)
- `FIX_PLAN.md` Phase 5 lists it as **P5** with estimated fix time
- **Resolution**: Remove P5 from FIX_PLAN.md (eval is correct)

### Conflict 2: Missing Admin Pages
- `FIXES_EVALUATION.md` marks "Missing content type routes" as **FALSE** ✅ (pages verified in `admin/(protected)/*`)
- `FIX_PLAN.md` includes C4: "Missing admin pages — routes exist but no content"
- **Resolution**: Reclassify C4 as "Implement missing content" not "Create missing routes"

### Conflict 3: ESLint as Duplicate Issues
- `fixes.md` has "ESLint completely disabled" (line 778) and "ESLint rules disabled" (line 262)
- `FIX_PLAN.md` has P1 "ESLint rules disabled" 
- **Resolution**: Consolidate to single issue "ESLint rules disabled" (counted once)

### Conflict 4: Numbers Don't Add Up
- `FIX_PLAN.md` says "Analyzed from fixes.md (33 issues)" but tables add to 40+ tasks
- No mapping from original 33 audit items → derived tasks
- **Resolution**: Add issue numbering that traces cause-and-effect

---

## NEXT STEPS

1. **Reconcile FIX_PLAN.md** — remove false positives, consolidate duplicates, add tracing numbers
2. **Create GAPS_FIX_PLAN.md** — prioritize the 14 gap categories above
3. **Start with Phase 1** from original FIX_PLAN (security items S1-S7)
4. **Then address GAPS Phase 1** (Security Headers, Cookie Hardening, Authz Model)

---

## GAPS PRIORITY MATRIX

| Priority | Gap # | Category | Est. Effort |
|----------|--------|----------|-------------|
| **P0** | 1 | Security Headers | 2h |
| **P0** | 2 | Cookie Hardening | 3h |
| **P0** | 3 | Authz Model | 4h |
| **P0** | 4 | Secrets Management | 2h |
| **P1** | 5 | CSRF Protections | 3h |
| **P1** | 6 | Privacy/Retention | 3h |
| **P1** | 7 | PII in Logs | 2h |
| **P1** | 8 | Observability | 4h |
| **P1** | 9 | Backup/Recovery | 3h |
| **P2** | 10 | Testing Strategy | 4h |
| **P2** | 11 | Accessibility | 6h |
| **P2** | 12 | AI Safety | 5h |
| **P3** | 13 | Deployment/Env | 3h |
| **P3** | 14 | DX/Maintainability | 4h |

**Total estimated effort for gaps**: ~45 hours  
**Plus original FIX_PLAN effort**: ~38.5 hours  
**GRAND TOTAL**: ~83.5 hours
