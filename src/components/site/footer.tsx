import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Magnetic } from '@/components/immersive/magnetic';
import { siteProfile } from '@/lib/site-content';
import { PUBLIC_CONTACT_HREF } from '@/lib/public-contact-config';

/* Same chapter numbering as the header nav and rail — the footer is the
   story's back matter, not a template link dump. */
const indexLinks = [
  { href: '/#about', label: 'About', chapter: '02' },
  { href: '/#atlas', label: 'Atlas', chapter: '03' },
  { href: '/#method', label: 'Method', chapter: '04' },
  { href: '/#work', label: 'Work', chapter: '05' },
  { href: '/#book', label: 'Book', chapter: '06' },
  { href: '/#writing', label: 'Writing', chapter: '07' },
  { href: '/#contact', label: 'Contact', chapter: '08' },
] as const;

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  const elsewhereLinks = [
    { href: siteProfile.githubUrl, label: 'GitHub' },
    { href: siteProfile.linkedinUrl, label: 'LinkedIn' },
    { href: siteProfile.bookUrl, label: 'The Confident Mind' },
  ] as const;

  return (
    <footer className="relative overflow-hidden border-t border-border/60 bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-accent/50 to-transparent" />

      <div className="editorial-container pt-16 md:pt-24">
        {/* ── Wordmark — the closing signature ─────────────────────────── */}
        <div className="border-b border-border/50 pb-10 md:pb-14">
          <p className="chapter-label mb-8">Colophon</p>
          <p className="font-display text-[clamp(2.75rem,8.5vw,7rem)] leading-[0.92] tracking-[-0.035em]">
            {siteProfile.name}
          </p>
          <div className="mt-6 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3">
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              {siteProfile.headline}
            </p>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
              {siteProfile.location}
            </p>
          </div>
        </div>

        {/* ── Back matter columns ──────────────────────────────────────── */}
        <div className="grid gap-12 py-12 md:grid-cols-2 md:py-14 lg:grid-cols-[1fr_1.1fr_1.2fr] lg:gap-16">
          <nav aria-label="Footer index">
            <h2 className="immersive-kicker mb-5">Index</h2>
            <ul className="space-y-0.5">
              {indexLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    data-cursor="interactive"
                    className="group flex items-baseline gap-3 py-1.5 text-sm text-foreground/85 transition-colors hover:text-foreground"
                  >
                    <span
                      className="font-mono text-[0.6rem] tabular-nums tracking-[0.2em] text-muted-foreground/60"
                      aria-hidden
                    >
                      {link.chapter}
                    </span>
                    <span className="lux-underline">{link.label}</span>
                  </a>
                </li>
              ))}
              <li>
                <Link
                  href="/chat"
                  data-cursor="interactive"
                  className="group flex items-baseline gap-3 py-1.5 text-sm text-foreground/85 transition-colors hover:text-foreground"
                >
                  <span
                    className="font-mono text-[0.6rem] tracking-[0.2em] text-muted-foreground/60"
                    aria-hidden
                  >
                    ··
                  </span>
                  <span className="lux-underline">Archive console</span>
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="immersive-kicker mb-5">Elsewhere</h2>
            <div className="flex flex-wrap gap-2.5">
              {elsewhereLinks.map((link) => (
                <Magnetic key={link.label} strength={0.22} radius={70}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex min-h-11 items-center gap-2 border border-border/70 px-4 text-sm transition-colors duration-300 hover:border-brand-accent/50 hover:bg-brand-accent/5"
                  >
                    {link.label}
                    <ArrowUpRight
                      className="h-3 w-3 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </a>
                </Magnetic>
              ))}
            </div>
          </div>

          <div>
            <h2 className="immersive-kicker mb-5">Correspond</h2>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              One inbox, one person. A short brief, the current constraint, and the outcome you
              want is enough to start.
            </p>
            <div className="mt-6">
              <Magnetic strength={0.22} radius={80}>
                <a href={PUBLIC_CONTACT_HREF} className="immersive-button-ghost">
                  Email Douglas
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </a>
              </Magnetic>
            </div>
          </div>
        </div>

        {/* ── Meta bar ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 border-t border-border/50 py-7 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} Douglas Mitchell · All rights reserved</p>
          <p>
            Set in Instrument Serif · Signal teal on ink ·{' '}
            <Link href="/admin" className="transition-colors hover:text-foreground">
              Studio
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
