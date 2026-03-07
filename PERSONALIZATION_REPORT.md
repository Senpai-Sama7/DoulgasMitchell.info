# Douglas Mitchell personalization + Phase 2 expansion

## What changed

This pass rebuilt the public experience around four real identity streams instead of generic premium portfolio language:

1. **Operations / governance / execution**
2. **AI automation and workflow systems**
3. **Authorship and confidence framework**
4. **Public open-source builder signal**

## Major code changes

- Reworked the homepage into a tailored narrative surface with:
  - cinematic hero
  - credential strip
  - identity matrix
  - book spotlight
  - repository showcase
  - manifesto section
- Rewrote the About page to compress Douglas Mitchell’s role signals into a coherent profile rather than disconnected bios.
- Rebuilt the Contact page around inquiry lanes instead of generic CTA copy.
- Upgraded search to include taxonomy-aware matching.
- Extended block rendering with additional presentational support for timeline, pull-stat, contact, and code blocks.
- Expanded the seed data so default content aligns with the live public profile.
- Updated metadata and OG image framing to match the revised identity architecture.
- Improved the global CSS system with richer cinematic, ASCII, and editorial components.

## Primary files changed

- `apps/web/app/layout.tsx`
- `apps/web/app/opengraph-image.tsx`
- `apps/web/app/globals.css`
- `apps/web/app/(public)/page.tsx`
- `apps/web/app/(public)/about/page.tsx`
- `apps/web/app/(public)/contact/page.tsx`
- `apps/web/app/(public)/blog/page.tsx`
- `apps/web/app/(public)/search/page.tsx`
- `apps/web/app/(admin)/admin/page.tsx`
- `apps/web/components/public/hero-cinematic.tsx`
- `apps/web/components/public/story-scroll.tsx`
- `apps/web/components/public/ascii-texture.tsx`
- `apps/web/components/public/page-hero.tsx`
- `apps/web/components/public/post-card.tsx`
- `apps/web/components/public/signature-sections.tsx`
- `apps/web/components/content/block-renderer.tsx`
- `apps/web/lib/content.ts`
- `packages/db/seed.ts`

## Positioning logic used

The personalization assumes the site should foreground:

- operations analysis and workflow optimization
- data governance / compliance / execution discipline
- AI automation and applied workflow systems
- authorship around confidence, growth, and human capability
- open-source proof and product/system experimentation

## Caveat

This is a substantive code-and-content upgrade, not a verified build pass. Dependencies were not installed and a full runtime compilation was not executed in this environment.
