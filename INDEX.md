# Project index — DouglasMitchell.info (Senpai's Isekai)

Single entry point for project documentation: structure, API, key paths, and cross-references.

**See also:** [AGENTS.md](./AGENTS.md) (agent guidance) · [README.md](./README.md) (author/portfolio) · [README_INFRASTRUCTURE.md](./README_INFRASTRUCTURE.md) (infra)

---

## 1. Project overview

| Item | Value |
|------|--------|
| **Name** | Senpai's Isekai / douglasmitchell.info |
| **Stack** | Next.js 16, React 19, TypeScript |
| **Data** | SQLite + Prisma (see [prisma/schema.prisma](./prisma/schema.prisma)) |
| **Runtime** | Bun; dev port 3000 |

---

## 2. Directory structure

```
DoulgasMitchell.info/
├── AGENTS.md              # AI agent guidance (patterns, commands, key paths)
├── INDEX.md               # This file — project index
├── README.md              # Author/portfolio overview
├── README_INFRASTRUCTURE.md
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── prisma/
│   └── schema.prisma      # Data models (Article, Project, Certification, Book, ContactSubmission, etc.)
├── public/
│   ├── images/            # Static images (hero, gallery, journal, certs)
│   ├── uploads/           # Runtime uploads (gallery, journal, images, general)
│   └── .well-known/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── api/
│   │       ├── route.ts       # GET /api
│   │       ├── contact/route.ts
│   │       └── seed/route.ts
│   ├── components/
│   │   ├── ui/                # shadcn-style primitives (button, card, dialog, etc.)
│   │   ├── site/              # Page sections (hero, about, book, work, writing, contact, footer, header)
│   │   └── effects/           # ASCII particles, command palette, custom cursor
│   ├── hooks/
│   │   ├── use-mobile.ts
│   │   └── use-toast.ts
│   └── lib/
│       ├── db.ts              # Prisma client singleton
│       ├── utils.ts           # cn() and utilities
│       └── ascii/
│           ├── index.ts
│           └── patterns.ts
├── scripts/
├── db/                    # SQLite DB (e.g. custom.db)
├── .kilocode/             # Rule sets (architect, ask, code, debug)
└── final/                 # Alternate/full build (separate app copy)
```

---

## 3. API surface

All routes under `src/app/api/`. Response format is JSON.

| Method | Path | Purpose |
|--------|------|--------|
| GET | `/api` | Health/hello; returns `{ message: "Hello, world!" }`. |
| POST | `/api/contact` | Contact form. Body: `name`, `email`, `message`, optional `subject`, `source`. Persists to `ContactSubmission` when DB available. |
| (varies) | `/api/seed` | Seeding (see [src/app/api/seed/route.ts](./src/app/api/seed/route.ts)). |

**Note:** Admin and upload routes (e.g. `/api/admin/*`, `/api/upload`) are documented in [AGENTS.md](./AGENTS.md) and may exist in the `final/` tree; the root `src/` currently has the three routes above.

---

## 4. Data layer

- **ORM:** Prisma; **provider:** SQLite; **env:** `DATABASE_URL`.
- **Schema:** [prisma/schema.prisma](./prisma/schema.prisma).

| Model | Role |
|-------|------|
| Article | Blog/editorial (slug, title, content, category, tags, blocks). |
| ArticleBlock | Block content for articles (blockType, content JSON, order). |
| Project | Portfolio projects (slug, techStack JSON, category, status). |
| Certification | Certs (issuer, credentialUrl, skills JSON). |
| Book | Published books (title, amazonUrl, etc.). |
| SiteConfig | Key-value site config. |
| ContactSubmission | Contact form submissions (name, email, message, status). |

**Client:** Single Prisma client instance in [src/lib/db.ts](./src/lib/db.ts).

---

## 5. Key paths (code)

| Purpose | Path |
|--------|------|
| API middleware / error handling | See [AGENTS.md](./AGENTS.md); `src/lib/middleware.ts` if present. |
| Validation (Zod) | See [AGENTS.md](./AGENTS.md); `src/lib/validations.ts` if present. |
| Static/fallback data | See [AGENTS.md](./AGENTS.md); `src/lib/data.ts` if present. |
| Client state (Zustand) | See [AGENTS.md](./AGENTS.md); `src/lib/store.ts` if present. |
| DB client | [src/lib/db.ts](./src/lib/db.ts) |
| Class name utility | [src/lib/utils.ts](./src/lib/utils.ts) (`cn()`) |
| ASCII effects | [src/lib/ascii/index.ts](./src/lib/ascii/index.ts), [src/lib/ascii/patterns.ts](./src/lib/ascii/patterns.ts) |
| Root layout | [src/app/layout.tsx](./src/app/layout.tsx) |
| Home page | [src/app/page.tsx](./src/app/page.tsx) |
| Site sections | [src/components/site/index.ts](./src/components/site/index.ts) (re-exports) |
| Effects | [src/components/effects/index.ts](./src/components/effects/index.ts) |

---

## 6. Commands (quick reference)

From [AGENTS.md](./AGENTS.md):

```bash
bun install
bun run dev      # port 3000, logs to dev.log
bun run build    # standalone output
bun run start    # production
bun run lint
bun run db:push
bun run db:generate
```

---

## 7. Documentation map

| Doc | Role |
|-----|------|
| [INDEX.md](./INDEX.md) | This index — structure, API, data, paths. |
| [AGENTS.md](./AGENTS.md) | Conventions for AI agents (middleware, validations, admin, commands). |
| [README.md](./README.md) | Author bio, books, links. |
| [README_INFRASTRUCTURE.md](./README_INFRASTRUCTURE.md) | Infrastructure. |
| [QUICK_START.md](./QUICK_START.md) | Quick start. |
| Other `*.md` in root | Audits, reports, status (e.g. SECURITY.md, STATUS.md). |

---

## 8. Maintenance

- **Structure:** Update §2 when adding top-level dirs or major `src/` layout changes.
- **API:** Update §3 when adding or changing `src/app/api/*` routes.
- **Data:** Keep §4 in sync with [prisma/schema.prisma](./prisma/schema.prisma) and [src/lib/db.ts](./src/lib/db.ts).
- **Paths:** Keep §5 aligned with actual files; AGENTS.md may reference paths that live in `final/` only.

Last indexed: 2025-03-07.
