# GAPS_FIX_PLAN.md — Execution Plan for Uncovered Gaps

> **Scope**: Addresses gaps in `GAPS_AUDIT.md` (NOT in `fixes.md`/`FIXES_EVALUATION.md`/`FIX_PLAN.md`)  
> **Phases**: Security → Compliance → Observability → Testing → Accessibility → AI Safety → Operations → DX

---

## PHASE 1: SECURITY HEADERS & COOKIE HARDENING (P0)

| # | Gap | Fix | Est. |
|---|-----|-----|------|
| **G1** | **HTTP Security Headers** → Add CSP, X-Frame-Options, HSTS, Referrer-Policy, Permissions-Policy | Create `src/lib/security-headers.ts`, apply in `src/proxy.ts` | 2h |
| **G2** | **Cookie Hardening** → Verify `HttpOnly`, `Secure`, `SameSite=strict|lax` on all auth/session cookies | Audit `src/lib/auth.ts`, `src/lib/webauthn.ts` | 3h |
| **G3** | **Authz Model** → Document can non-admin hit `/admin` routes? Resource-level perms? Session limits? | Analyze all `/api/admin/*` routes + `src/app/api/*/route.ts` | 4h |
| **G4** | **Secrets Management** → Key rotation, versioning, no leaks to logs/bundles, JWT signing key rotation path | Audit `src/lib/env.ts`, all API routes, logger | 2h |

**Phase 1 Checkoff:**
- [ ] G1: Create `security-headers.ts`, integrate into `proxy.ts`
- [ ] G2: Audit + harden all cookie settings
- [ ] G3: Document authz rules, add resource-level checks
- [ ] G4: Secrets audit, remove from logs, add rotation path

---

## PHASE 2: CSRF & PRIVACY (P0-P1)

| # | Gap | Fix | Est. |
|---|-----|-----|------|
| **G5** | **CSRF Tokens** → Add anti-CSRF tokens (synchronizer, double-submit cookie) beyond origin check | Implement in `src/lib/request.ts`, apply to state-changing routes | 3h |
| **G6** | **Privacy & Data Retention** → Define retention for AI logs, chat data, ActivityLog; honor GDPR/CCPA erasure | Add `dataRetentionPolicy` config, cleanup jobs | 3h |
| **G7** | **PII in Logs** → Redact JWTs, tokens, full request bodies; structure logs; no client bundle leaks | Audit `src/lib/logger.ts`, all API routes | 2h |

**Phase 2 Checkoff:**
- [ ] G5: Implement CSRF tokens for state-changing routes
- [ ] G6: Define + implement data retention policies
- [ ] G7: Redact PII from logs; audit client bundles

---

## PHASE 3: OBSERVABILITY & OPERATIONS (P1)

| # | Gap | Fix | Est. |
|---|-----|-----|------|
| **G8** | **Logging Strategy** → Consistent API (levels, correlation IDs, user/session IDs sans PII) | Define logging standard, update `logger.ts` | 4h |
| **G9** | **Tracing & Metrics** → Request IDs propagating edge→app; define metrics (latency, error rate, AI token usage, rate-limit hits) | Implement in `proxy.ts`, `/api/health`, `/api/metrics` | 4h |
| **G10** | **Backup & Disaster Recovery** → DB backup verification, migration rollback, environment-specific strategies | Create `scripts/backup.ts`, update deployment docs | 3h |
| **G11** | **CI Gatekeeping** → Enforce green tests for pushes to main; type checks in pipeline; validate Prisma migrations | Update CI config (Vercel/GitHub Actions) | 2h |

**Phase 3 Checkoff:**
- [ ] G8: Implement structured logging with correlation IDs
- [ ] G9: Add request tracing + define/implement metrics
- [ ] G10: Create backup/rollback procedures
- [ ] G11: Enforce CI gates (tests, types, migrations)

---

## PHASE 4: TESTING & ACCESSIBILITY (P2)

| # | Gap | Fix | Est. |
|---|-----|-----|------|
| **G12** | **Testing Strategy** → Unit coverage targets (auth, rate-limit, AI); integration tests (admin→content→AI); regression tests for fixed bugs | Define in `vitest.config.ts`, create test suites | 4h |
| **G13** | **Accessibility Beyond Color** → Keyboard nav (sidebar, chat, modals); ARIA roles/labels; `prefers-reduced-motion`; layout stability (CLS) | Audit + fix all `src/components/**`, `src/app/**` | 6h |

**Phase 4 Checkoff:**
- [ ] G12: Define coverage targets, add integration/regression tests
- [ ] G13: Full accessibility audit + fixes (keyboard, ARIA, motion, CLS)

---

## PHASE 5: AI SAFETY & DEPLOYMENT (P2)

| # | Gap | Fix | Est. |
|---|-----|-----|------|
| **G14** | **AI Safety & Abuse** → Prompt injection defenses; output filtering; per-user/IP rate limits; timeouts/circuit-breakers for AI provider | Audit `src/lib/public-assistant.ts`, add rate limits | 5h |
| **G15** | **Deployment & Env Matrix** → Document environments (local/dev/staging/prod); feature flags; secrets injection; rollback procedures; incident response | Create `deployment.md`, `.env.example`, update `README.md` | 3h |

**Phase 5 Checkoff:**
- [ ] G14: Implement AI safety measures (injection, abuse, rate limits)
- [ ] G15: Document deployment matrix + incident procedures

---

## PHASE 6: DX & DOCUMENTATION (P3)

| # | Gap | Fix | Est. |
|---|-----|-----|------|
| **G16** | **Coding Standards** → Prettier config; pre-commit hooks via Husky; module/domain structure standard | Add `.prettierrc`, `.husky/`, update `AGENTS.md` | 4h |
| **G17** | **Living Documentation** → API docs for internal routes; ADRs for key decisions; developer onboarding beyond quickstart | Create `docs/api/`, `docs/adr/`, update `CLAUDE.md` | 4h |

**Phase 6 Checkoff:**
- [ ] G16: Enforce code style (Prettier, Husky, standards)
- [ ] G17: Create API docs, ADRs, onboarding docs

---

## DEPENDENCY GRAPH (Gaps)

```
Phase 1 (Security Headers/Cookies/Authz/Secrets)
  └── Phase 2 (CSRF/Privacy/PII)
       └── Phase 3 (Observability/Operations)
              ├── Phase 4 (Testing/Accessibility)
              ├── Phase 5 (AI Safety/Deployment)
              └── Phase 6 (DX/Documentation)
```

**Critical path**: Phase 1 → 2 → 3 → 4 → 5 → 6  
**Parallelizable**: Phases 4, 5, 6 can run concurrently after Phase 3

---

## RECONCILED MASTER PLAN (Updated FIX_PLAN.md)

| Phase | From Original FIX_PLAN | From GAPS_PLAN | Total Est. |
|-------|----------------------|-------------------|-------------|
| Phase 1 | S1-S7 (Security & Config) ~2.5h | G1-G4 (Headers/Cookies/Authz/Secrets) ~11h | **~13.5h** |
| Phase 2 | F1-F6 (Foundation & DB) ~2h | G5-G7 (CSRF/Privacy/PII) ~8h | **~10h** |
| Phase 3 | C1-C6 (Core Functionality) ~13h | G8-G11 (Observability/Operations) ~13h | **~26h** |
| Phase 4 | U1-U7 (UI/UX) ~9h | G12-G13 (Testing/Accessibility) ~10h | **~19h** |
| Phase 5 | P1-P7 (Performance/Quality) ~6.5h | G14-G15 (AI Safety/Deploy) ~8h | **~14.5h** |
| Phase 6 | L1-L7 (Polish) ~5.5h | G16-G17 (DX/Docs) ~8h | **~13.5h** |

**GRAND TOTAL**: ~96.5 hours (Original ~38.5h + Gaps ~45h + Reconciliation ~13h)

---

## QUICK WINS (Start Immediately)

1. **G1** (2h) — Security headers → protects entire site from XSS/clickjacking
2. **G2** (3h) — Cookie hardening → prevents session attacks  
3. **G7** (2h) — PII redaction in logs → compliance risk reduction
4. **G11** (2h) — CI gatekeeping → prevents regressions

**Total quick wins**: ~9 hours for high-impact security/compliance fixes

---

## TESTING CHECKLIST (After Each Gap Phase)

- [ ] **Phase 1**: Security headers present in responses; cookies hardened; authz rules documented; secrets not in logs
- [ ] **Phase 2**: CSRF tokens validate; data retention cleanup works; PII redacted from logs
- [ ] **Phase 3**: Correlation IDs trace requests; metrics endpoint returns data; backup/rollback tested
- [ ] **Phase 4**: Test coverage meets targets; keyboard nav works; ARIA labels present; no CLS
- [ ] **Phase 5**: AI rejects prompt injections; rate limits enforced; deployment matrix documented
- [ ] **Phase 6**: Pre-commit hooks pass; API docs complete; ADRs written

---

## FILES CREATED/UPDATED

| File | Purpose |
|------|---------|
| `GAPS_AUDIT.md` | Catalog of all 14 uncoved gap categories |
| `GAPS_FIX_PLAN.md` | This document — prioritized execution plan for gaps |
| `FIX_PLAN.md` | **Update needed** — reconcile inconsistencies, add gap phases |

**Next step**: Update `FIX_PLAN.md` to reference `GAPS_AUDIT.md` and incorporate the reconciled phases above.
