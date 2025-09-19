# Douglas Mitchell — Ultimate Bento Blog (Self-Hosted)

A complete, self-hosted blog system with **drag-and-drop visual editing** and a **bento-grid** front-end.

**Stack**
- **Payload CMS** (self-hosted, admin UI) + **PostgreSQL**
- **GrapesJS** in the CMS admin for **drag‑and‑drop** page building (custom Bento blocks)
- **Next.js** front-end with **Framer Motion** animations
- **Caddy** reverse proxy with **automatic HTTPS**
- All orchestrated with **Docker Compose**

**Your domain:** `douglasmitchell.info`  
**Admin:** `admin.douglasmitchell.info`

---

## Quick start

> **Prereqs:** A VM (Ubuntu 22.04+ recommended), Docker + Docker Compose, and DNS A/AAAA records for both domains pointing to this VM.

1. Copy this folder to your server, then create a `.env` at project root by copying `.env.example` and filling values:
   ```bash
   cp .env.example .env
   ```

2. Bring everything online:
   ```bash
   docker compose up -d --build
   ```

3. After the first boot, an **admin user** and **starter content** are auto-seeded (configurable via `.env`).  
   - Site: https://douglasmitchell.info  
   - Admin: https://admin.douglasmitchell.info (log in with the seeded credentials)

> **Tip:** Change the seeded admin password after first login (Users → your account).

---

## What’s included

- **Bento homepage** built with GrapesJS blocks (Logo/Type/Toast/KPI/Imagery/Quick Links/Phone Mockup). Editors can rearrange tiles visually in the Admin.
- **Post types**: Article, Video, Audio, Gallery, Notes.
- **Animations**: smooth in-view reveals and hover micro‑interactions. Respects `prefers-reduced-motion`.
- **Accessible structure** with semantic tags and alt text.

---

## Project layout

```
.
├── Caddyfile
├── docker-compose.yml
├── .env.example              # Copy to .env and fill secrets
├── README.md
├── cms/                      # Payload CMS + GrapesJS admin
│   ├── package.json
│   ├── server.mjs
│   ├── payload.config.mjs
│   ├── src/
│   │   ├── collections/
│   │   │   ├── Users.mjs
│   │   │   ├── Posts.mjs
│   │   │   ├── Pages.mjs
│   │   │   └── Media.mjs
│   │   ├── admin/
│   │   │   ├── GrapesEditor.jsx
│   │   │   └── grapesjs-blocks.js
│   │   └── seed/
│   │       ├── home-layout.html
│   │       └── posts.json
│   ├── seed.mjs              # Auto-run on container start (creates admin + sample content)
│   └── Dockerfile
└── frontend/                 # Next.js animated bento front-end
    ├── package.json
    ├── next.config.mjs
    ├── public/
    │   └── media/
    │       ├── gradient-1.svg
    │       ├── gradient-2.svg
    │       ├── phone-frame.svg
    │       └── tone.wav
    ├── pages/
    │   ├── _app.js
    │   ├── index.js
    │   └── posts/
    │       └── [slug].js
    ├── components/
    │   ├── BentoGrid.js
    │   ├── PostCard.js
    │   └── HeaderFooter.js
    ├── styles/
    │   └── globals.css
    └── Dockerfile
```

---

## Notes

- To tweak blocks in the visual editor, see: `cms/src/admin/grapesjs-blocks.js`.
- To adjust grid sizing, edit CSS in `frontend/styles/globals.css` (`.bento-grid` and tile classes).
- Caddy handles HTTPS automatically as long as DNS points to this server.
- For backups, snapshot the VM or dump Postgres (`docker compose exec postgres pg_dump -U payload_user payload > backup.sql`).

Enjoy!
