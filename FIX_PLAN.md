# FIX PLAN — Douglas Mitchell Portfolio (Master Index)

> **Sources**: `fixes.md` (33 issues) + `FIXES_EVALUATION.md` (verified REAL) + `GAPS_AUDIT.md` (14 new categories)  
> **Prioritized by**: Security → Foundation → Core Functionality → UX → Observability → Testing → AI Safety → Polish

---

## DOCUMENT RECONCILIATION (Meta-Fixes)

| Conflict | FIXES_EVALUATION | FIX_PLAN (Old) | Resolution in This Document |
|----------|-------------------|-----------------|------------------------------|
| Tailwind paths | FALSE ✅ (config is correct) | P5 listed as "~15m fix" | **Removed P5** — not a bug |
| Missing admin pages | FALSE ✅ (pages verified) | C4 "Missing admin pages" | **Rephrased C4** → "Implement missing content" (routes exist) |
| ESLint duplicates | Same issue 3× | P1 "ESLint rules disabled" | **Consolidated** → single P1 issue |
| Numbers mismatch | "33 issues" cited | 40+ tasks listed | **Added tracing**: G1-G17 for gaps, S1-S8 for security, etc. |

---

## PHASE 1: SECURITY & CONFIGURATION (P0 — Do First)

### From Original Audit (fixes.md)
| # | Issue | Source Lines | Fix | Est. |
|---|-------|-------------|-----|-----|
| S1 | **Middleware missing try/catch** — security bypass | `fixes.md:634-644` | Wrap `proxy()` in try/catch, return 500 on exception | 15m |
| S2 | **JWT_SECRET crash in middleware** — app fails | `fixes.md:647-660` | Graceful handling: if missing, reject auth (don't crash) | 20m |
| S3 | **Env validation at module load** — crashes | `fixes.md:663-671` | Lazy `getEnv()`; startup validation script | 30m |
| S4 | **DB fallback to SQLite in prod** — dangerous | `fixes.md:674-683` | Remove auto-fallback; throw if DATABASE_URL missing | 15m |
| S5 | **Prisma schema duplication** — confusion | `fixes.md:686-697` | Merge to single schema; override via DATABASE_URL | 1h |
| S6 | **Origin validation via Referer spoofable** | `fixes.md:747-760` | Remove Referer fallback; require Origin header | 15m |
| S7 | **Rate limiter silent Redis fallback** | `fixes.md:700-716` | Log Redis failures; document in-memory limit | 30m |

### From Gap Audit (GAPS_AUDIT.md)
| # | Gap | Fix | Est. |
|---|-----|-----|------|
| G1 | **HTTP Security Headers Missing** — CSP, HSTS, X-Frame-Options | Create `src/lib/security-headers.ts`, apply in `proxy.ts` | 2h |
| G2 | **Cookie Hardening** — HttpOnly, Secure, SameSite | Audit `auth.ts`, `webauthn.ts` | 3h |
| G3 | **Authz Model Undefined** — resource-level perms | Analyze all `/api/admin/*` routes | 4h |
| G4 | **Secrets Management** — rotation, no log leaks | Audit `env.ts`, all API routes | 2h |

**Phase 1 Checkoff:**
- [ ] S1: Wrap middleware in try/catch
- [ ] S2: Graceful JWT_SECRET handling
- [ ] S3: Lazy env validation
- [ ] S4: Remove SQLite prod fallback
- [ ] S5: Merge Prisma schemas
- [ ] S6: Fix origin validation
- [ ] S7: Log Redis failures
- [ ] G1: Create security headers module
- [ ] G2: Audit + harden all cookies
- [ ] G3: Document authz rules
- [ ] G4: Secrets audit + rotation path

**Phase 1 Total**: ~13.5h (Original ~2.5h + Gaps ~11h)

---

## PHASE 2: FOUNDATION & DATABASE (P0 — After Security)

### From Original Audit
| # | Issue | Source Lines | Fix | Est. |
|---|-------|-------------|-----|-----|
| F1 | **dev.db empty/misplaced** — admin broken | `fixes.md:674-683` | Ensure `db:push` uses correct path | 30m |
| F2 | **Database indexes missing** — slow queries | `fixes.md:913-919` | Add indexes: `Article.publishedAt`, etc. | 30m |
| F3 | **Reaction unique constraint broken** | `fixes.md:861-869` | Fix Prisma constraint | 20m |
| F4 | **Comment self-reference not validated** | `fixes.md:872-882` | Add application-level check | 15m |
| F5 | **Newsletter missing confirmation token** | `fixes.md:885-899` | Add `confirmationToken` field | 30m |
| F6 | **ActivityLog userId nullable** | `fixes.md:902-910` | Handle nulls in queries | 15m |

### From Gap Audit
| # | Gap | Fix | Est. |
|---|-----|-----|------|
| G5 | **CSRF Tokens** — beyond origin check | Implement anti-CSRF tokens | 3h |
| G6 | **Privacy & Data Retention** — GDPR/CCPA | Define retention policies + cleanup | 3h |
| G7 | **PII in Logs** — redact JWTs, tokens | Audit `logger.ts`, API routes | 2h |

**Phase 2 Checkoff:**
- [ ] F1: Fix database file location
- [ ] F2: Add missing indexes
- [ ] F3: Fix Reaction unique constraint
- [ ] F4: Validate Comment parentId
- [ ] F5: Add newsletter confirmation token
- [ ] F6: Handle ActivityLog userId nulls
- [ ] G5: Implement CSRF tokens
- [ ] G6: Define + implement data retention
- [ ] G7: Redact PII from logs

**Phase 2 Total**: ~10h (Original ~2h + Gaps ~8h)

---

## PHASE 3: CORE FUNCTIONALITY (P0/P1)

### From Original Audit
| # | Issue | Source Lines | Fix | Est. |
|---|-------|-------------|-----|-----|
| C1 | **Public AI chat interface missing** | `fixes.md:14-29` | Create `/src/app/chat/page.tsx` | 3h |
| C2 | **Admin layout broken on mobile** | `fixes.md:33-60` | Add mobile collapse/hamburger | 2h |
| C3 | **Health check endpoint missing** | `fixes.md:424-440` | Create `/api/health` + `/api/metrics` | 30m |
| C4 | **Implement missing admin content** | `fixes.md:449-457` | Build: analytics, content, media, operator, security | 4h |
| C5 | **AI response components not connected** | `fixes.md:185-199` | Build response router (types → components) | 3h |
| C6 | **Session cleanup missing** | `fixes.md:732-742` | Add periodic cleanup for expired sessions | 1h |

### From Gap Audit
| # | Gap | Fix | Est. |
|---|-----|-----|------|
| G8 | **Logging Strategy** — correlation IDs, levels | Define logging standard, update `logger.ts` | 4h |
| G9 | **Tracing & Metrics** — request IDs, define metrics | Implement in `proxy.ts`, health/metrics endpoints | 4h |
| G10 | **Backup & Disaster Recovery** — DB backup, rollback | Create `scripts/backup.ts` | 3h |
| G11 | **CI Gatekeeping** — enforce green tests, type checks | Update CI config | 2h |

**Phase 3 Checkoff:**
- [ ] C1: Create public chat page
- [ ] C2: Fix admin layout responsiveness
- [ ] C3: Implement health/metrics endpoints
- [ ] C4: Build missing admin pages
- [ ] C5: Connect AI response components
- [ ] C6: Add session cleanup
- [ ] G8: Implement structured logging
- [ ] G9: Add request tracing + metrics
- [ ] G10: Create backup/rollback procedures
- [ ] G11: Enforce CI gates

**Phase 3 Total**: ~26h (Original ~13h + Gaps ~13h)

---

## PHASE 4: UI/UX & CHAT INTERFACE (P1)

### From Original Audit
| # | Issue | Source Lines | Fix | Est. |
|---|-------|-------------|-----|-----|
| U1 | **Chat box not maximizing viewport** | `fixes.md:62-98` | Full-screen layout with scrollable history | 2h |
| U2 | **Textarea auto-expand missing** | `fixes.md:125-160` | Implement dynamic height in `prompt-input.tsx` | 1h |
| U3 | **Admin stats cards misaligned** | `fixes.md:101-123` | Fix grid for tablet breakpoints | 1h |
| U4 | **No loading states** — blank pages | `fixes.md:301-312` | Add Suspense boundaries + skeletons | 3h |
| U5 | **Empty states missing from chat** | `fixes.md:400-407` | Show suggestions when `messages.length === 0` | 1h |
| U6 | **File upload error UI missing** | `fixes.md:351-363` | Display upload errors in chat | 1h |
| U7 | **Sidebar navigation missing active states** | `fixes.md:166-183` | Add `usePathname()` highlighting | 1h |

### From Gap Audit
| # | Gap | Fix | Est. |
|---|-----|-----|------|
| G12 | **Testing Strategy** — unit/integration/regression | Define coverage targets, add test suites | 4h |
| G13 | **Accessibility Beyond Color** — keyboard, ARIA, motion | Audit + fix all components | 6h |

**Phase 4 Checkoff:**
- [ ] U1: Maximize chat viewport usage
- [ ] U2: Implement textarea auto-expand
- [ ] U3: Fix stats card alignment
- [ ] U4: Add loading skeletons
- [ ] U5: Add chat empty state
- [ ] U6: Add upload error UI
- [ ] U7: Add sidebar active states
- [ ] G12: Define coverage targets + tests
- [ ] G13: Full accessibility audit + fixes

**Phase 4 Total**: ~19h (Original ~9h + Gaps ~10h)

---

## PHASE 5: PERFORMANCE & CODE QUALITY (P2)

### From Original Audit
| # | Issue | Source Lines | Fix | Est. |
|---|-------|-------------|-----|-----|
| P1 | **ESLint rules disabled** — no quality | `fixes.md:262-281` | Enable critical rules (consolidated) | 2h |
| P2 | **Public assistant re-evaluates knowledge** | `fixes.md:463-475` | Cache `buildDynamicKnowledge()` 5min TTL | 1h |
| P3 | **Admin header re-renders** — no memoization | `fixes.md:489-502` | Wrap `AdminHeader` in `React.memo()` | 15m |
| P4 | **Activity feed not memoized** | `fixes.md:478-486` | Add `React.memo()` + proper keys | 30m |
| P5 | ~~**Tailwind paths wrong**~~ | ~~`fixes.md:315-336`~~ | ~~Fix `tailwind.config.ts`~~ | ~~15m~~ **REMOVED** — not a bug |
| P6 | **Mixed import styles** — inconsistent | `fixes.md:942` | Standardize on `@/` alias | 2h |
| P7 | **Magic numbers throughout** — constants | `fixes.md:563-579` | Extract to named constants | 1h |

### From Gap Audit
| # | Gap | Fix | Est. |
|---|-----|-----|------|
| G14 | **AI Safety & Abuse** — prompt injection, rate limits | Audit `public-assistant.ts`, add defenses | 5h |
| G15 | **Deployment & Env Matrix** — doc environments | Create `deployment.md`, `.env.example` | 3h |

**Phase 5 Checkoff:**
- [ ] P1: Enable ESLint rules (consolidated)
- [ ] P2: Cache knowledge base
- [ ] P3: Memoize AdminHeader
- [ ] P4: Memoize ActivityFeed
- [ ] P6: Standardize imports
- [ ] P7: Extract magic numbers
- [ ] G14: Implement AI safety measures
- [ ] G15: Document deployment matrix

**Phase 5 Total**: ~14.5h (Original ~6.5h + Gaps ~8h)

---

## PHASE 6: POLISH & ACCESSIBILITY (P2)

### From Original Audit
| # | Issue | Source Lines | Fix | Est. |
|---|-------|-------------|-----|-----|
| L1 | **Inconsistent spacing** — no unified scale | `fixes.md:368-385` | Define CSS variables for spacing | 1h |
| L2 | **Card styling inconsistency** | `fixes.md:388-397` | Create unified card standard | 1h |
| L3 | **No visual feedback for interactive elements** | `fixes.md:508-516` | Add consistent hover/active/focus | 1h |
| L4 | **Typography scale undefined** | `fixes.md:519-527` | Define scale in Tailwind config | 1h |
| L5 | **Color contrast may fail WCAG AA** | `fixes.md:529-535` | Audit `--muted-foreground` ratios | 1h |
| L6 | **Attachment preview missing styling** | `fixes.md:411-419` | Add file attachment preview | 1h |
| L7 | **Passkey cookie expiry** — replay risk | `fixes.md:854-858` | Configure `SameSite=strict` + expiry | 30m |

### From Gap Audit
| # | Gap | Fix | Est. |
|---|-----|-----|------|
| G16 | **Coding Standards** — Prettier, Husky, structure | Add `.prettierrc`, `.husky/`, update `AGENTS.md` | 4h |
| G17 | **Living Documentation** — API docs, ADRs, onboarding | Create `docs/api/`, `docs/adr/`, update `CLAUDE.md` | 4h |

**Phase 6 Checkoff:**
- [ ] L1: Unify spacing scale
- [ ] L2: Standardize card styling
- [ ] L3: Add interactive feedback
- [ ] L4: Define typography scale
- [ ] L5: Audit color contrast
- [ ] L6: Style attachment previews
- [ ] L7: Fix passkey cookie config
- [ ] G16: Enforce code style (Prettier, Husky)
- [ ] G17: Create API docs, ADRs, onboarding

**Phase 6 Total**: ~13.5h (Original ~5.5h + Gaps ~8h)

---

## UNIFIED DEPENDENCY GRAPH

```
Phase 1 (Security & Config: S1-S7, G1-G4) ~13.5h
  └── Phase 2 (Foundation & DB: F1-F6, G5-G7) ~10h
        └── Phase 3 (Core Functionality: C1-C6, G8-G11) ~26h
              ├── Phase 4 (UI/UX: U1-U7, G12-G13) ~19h
              ├── Phase 5 (Performance: P1-P7, G14-G15) ~14.5h
              └── Phase 6 (Polish: L1-L7, G16-G17) ~13.5h
```

**Critical path**: Phase 1 → 2 → 3 → 4 → 5 → 6  
**Parallelizable**: Phases 4, 5, 6 can run concurrently after Phase 3

---

## QUICK WINS (Start Immediately)

1. **S7** (15m) — Log Redis failures → visibility into rate-limit issues
2. **F2** (30m) — Add DB indexes → prevents future slowness
3. **C3** (30m) — Health endpoint → unblocks monitoring
4. **U3** (1h) — Fix stats grid → visual improvement
5. **P3** (15m) — Memoize header → easy performance win
6. **G1** (2h) — Security headers → protects entire site
7. **G7** (2h) — PII redaction in logs → compliance risk reduction
8. **G11** (2h) — CI gatekeeping → prevents regressions

**Total quick wins**: ~9 hours for high-impact fixes

---

## TESTING CHECKLIST (After Each Phase)

- [ ] **Phase 1**: Middleware rejects invalid; env validates; cookies hardened; secrets not in logs
- [ ] **Phase 2**: DB indexes created; no schema errors; CSRF tokens work; PII redacted
- [ ] **Phase 3**: Chat page loads; admin responsive; health returns 200; tracing works; backups tested
- [ ] **Phase 4**: Chat fills viewport; skeletons show; tests pass coverage targets; keyboard nav works
- [ ] **Phase 5**: ESLint passes; AI rejects prompt injections; deployment matrix documented
- [ ] **Phase 6**: Focus visible; contrast passes; Prettier/Husky enforce; API docs complete

---

## ESTIMATED TOTALS

| Source | Effort | Issues |
|--------|--------|-------|
| Original Audit (fixes.md) | ~38.5h | ~33 verified issues |
| Gap Audit (GAPS_AUDIT.md) | ~45h | 17 gap categories (G1-G17) |
| Reconciliation (this document) | ~13h | Meta-fixes, renumbering |
| **GRAND TOTAL** | **~96.5h** | **~50 work items** |

---

## FILES CREATED/UPDATED

| File | Purpose |
|------|---------|
| `FIXES_EVALUATION.md` | Issue-by-issue accuracy verification |
| `GAPS_AUDIT.md` | 14 uncoved gap categories catalog |
| `GAPS_FIX_PLAN.md` | Execution plan for gap categories |
| **`FIX_PLAN.md`** | **This document** — unified master index |

**Next step**: Begin Phase 1, starting with Quick Wins S7, G1, G7.
