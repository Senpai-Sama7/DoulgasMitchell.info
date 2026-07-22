'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { Magnetic } from '@/components/immersive/magnetic';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { siteProfile } from '@/lib/site-content';
import { useTheme } from '@/lib/theme';

/**
 * Primary nav mirrors the homepage chapter arc — same ids, same numbering,
 * same order as the chapter rail, so the header reads as wayfinding for the
 * story rather than a generic link strip.
 */
interface NavLink {
  href: string;
  label: string;
  sectionId: string;
  chapter: string;
  beat: string;
  /** Only rendered in the desktop strip at lg+ to keep the md band uncrowded. */
  wideOnly?: boolean;
}

const navLinks: readonly NavLink[] = [
  { href: '/#about', label: 'About', sectionId: 'about', chapter: '02', beat: 'Identity' },
  { href: '/#atlas', label: 'Atlas', sectionId: 'atlas', chapter: '03', beat: 'Systems' },
  { href: '/#method', label: 'Method', sectionId: 'method', chapter: '04', beat: 'Method' },
  {
    href: '/#simulator',
    label: 'Instrument',
    sectionId: 'simulator',
    chapter: '05',
    beat: 'Decision',
    wideOnly: true,
  },
  { href: '/#work', label: 'Work', sectionId: 'work', chapter: '06', beat: 'Proof' },
  { href: '/#book', label: 'Book', sectionId: 'book', chapter: '07', beat: 'Artifact' },
  { href: '/#writing', label: 'Writing', sectionId: 'writing', chapter: '08', beat: 'Voice' },
  { href: '/#contact', label: 'Contact', sectionId: 'contact', chapter: '09', beat: 'Invitation' },
];

const signatureEase = [0.22, 1, 0.36, 1] as const;

const menuVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.35,
      ease: signatureEase,
      when: 'beforeChildren',
      staggerChildren: 0.055,
      delayChildren: 0.05,
    },
  },
  exit: { opacity: 0, transition: { duration: 0.28, ease: signatureEase } },
};

const menuLinkVariants: Variants = {
  hidden: { y: '110%' },
  visible: { y: '0%', transition: { duration: 0.6, ease: signatureEase } },
};

const menuMetaVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: signatureEase } },
};

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('about');
  const { isDark, toggle } = useTheme();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const syncHeaderState = () => {
      setIsScrolled(window.scrollY > 24);

      const offset = 160;
      const currentSection = navLinks.reduce<string>((current, link) => {
        const section = document.getElementById(link.sectionId);
        if (!section) {
          return current;
        }

        return window.scrollY + offset >= section.offsetTop ? link.sectionId : current;
      }, navLinks[0].sectionId);

      setActiveSection(window.location.hash.replace('#', '') || currentSection);
    };

    syncHeaderState();
    window.addEventListener('scroll', syncHeaderState, { passive: true });
    window.addEventListener('hashchange', syncHeaderState);

    return () => {
      window.removeEventListener('scroll', syncHeaderState);
      window.removeEventListener('hashchange', syncHeaderState);
    };
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      return;
    }

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background,border,box-shadow] duration-500',
        isScrolled
          ? 'border-b border-border/40 bg-background/55 shadow-[0_8px_32px_-12px_color-mix(in_oklch,var(--foreground),transparent_92%)] backdrop-blur-2xl backdrop-saturate-150'
          : 'border-b border-transparent bg-gradient-to-b from-background/70 via-background/30 to-transparent'
      )}
    >
      <nav aria-label="Primary" className="editorial-container">
        <div className="flex h-16 items-center justify-between gap-4 md:h-[4.5rem]">
          {/* Wordmark — the serif signal, nothing else */}
          <Link
            href="/"
            data-cursor="interactive"
            className="group flex items-baseline gap-2.5 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="font-display text-xl tracking-tight transition-opacity duration-300 group-hover:opacity-80 md:text-[1.35rem]">
              {siteProfile.name}
            </span>
            <span
              className="hidden font-mono text-[0.55rem] uppercase tracking-[0.28em] text-muted-foreground/70 lg:inline"
              aria-hidden
            >
              {siteProfile.location}
            </span>
          </Link>

          {/* Chapter nav — mono wayfinding with a teal signal hairline */}
          <ul className="hidden items-center xl:flex">
            {navLinks.map((link) => {
              const isActive = activeSection === link.sectionId;
              return (
                <li key={link.href} className={cn(link.wideOnly && 'hidden lg:block')}>
                  <a
                    href={link.href}
                    aria-current={isActive ? 'location' : undefined}
                    data-cursor="interactive"
                    className={cn(
                      'group relative flex items-baseline gap-1.5 px-3 py-2.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <span
                      className={cn(
                        'tabular-nums transition-colors duration-300',
                        isActive ? 'text-brand-accent' : 'text-muted-foreground/50'
                      )}
                      aria-hidden
                    >
                      {link.chapter}
                    </span>
                    {link.label}
                    <span
                      className={cn(
                        'absolute inset-x-3 bottom-1 h-px origin-left bg-brand-accent/80 transition-transform duration-500',
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      )}
                      aria-hidden
                    />
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/chat"
              data-cursor="interactive"
              className="hidden min-h-11 items-center px-2.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors duration-300 hover:text-foreground sm:flex"
              aria-label="Open the archive console"
            >
              Console
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className="h-9 w-9 rounded-full"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-pressed={isDark}
            >
              <motion.div
                initial={false}
                animate={{ rotate: isDark ? 180 : 0 }}
                transition={{ duration: 0.35, ease: signatureEase }}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </motion.div>
            </Button>

            <Magnetic className="hidden sm:block" strength={0.24} radius={90}>
              <Link
                href="/#contact"
                className="immersive-button !px-5 !py-2.5 text-sm"
                aria-label="Jump to contact section"
              >
                Connect
              </Link>
            </Magnetic>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-controls="site-mobile-menu"
              aria-expanded={isMobileMenuOpen}
              className="flex min-h-11 items-center px-2 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-foreground xl:hidden"
            >
              Menu
            </button>
          </div>
        </div>
      </nav>

      {/* Full-viewport chapter takeover — the mobile menu is a scene, not a dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen ? (
          <motion.div
            id="site-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            data-lenis-prevent
            variants={prefersReducedMotion ? undefined : menuVariants}
            initial={prefersReducedMotion ? false : 'hidden'}
            animate="visible"
            exit={prefersReducedMotion ? undefined : 'exit'}
            /* h-dvh instead of inset-0: the scrolled header's backdrop-blur makes
               the header the containing block for fixed descendants, so bottom-0
               would resolve against the 4rem bar rather than the viewport. */
            className="fixed inset-x-0 top-0 z-[60] flex h-dvh flex-col overflow-y-auto bg-background xl:hidden"
          >
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,color-mix(in_oklch,var(--brand-accent),transparent_93%),transparent_60%)]"
              aria-hidden
            />

            <div className="relative flex h-16 shrink-0 items-center justify-between px-5">
              <span className="font-display text-lg tracking-tight">{siteProfile.name}</span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="flex min-h-11 items-center px-2 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
              >
                Close
              </button>
            </div>

            <nav aria-label="Chapters" className="relative flex flex-1 flex-col justify-center px-5 py-8">
              <p className="chapter-label mb-6">Chapters</p>
              <ol>
                {navLinks.map((link) => {
                  const isActive = activeSection === link.sectionId;
                  return (
                    <li
                      key={link.href}
                      className="overflow-hidden border-b border-border/45 last:border-b-0"
                    >
                      <motion.a
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-current={isActive ? 'location' : undefined}
                        variants={prefersReducedMotion ? undefined : menuLinkVariants}
                        className="group flex items-baseline justify-between gap-4 py-4"
                      >
                        <span className="flex min-w-0 items-baseline gap-4">
                          <span
                            className={cn(
                              'font-mono text-[0.65rem] tabular-nums tracking-[0.22em]',
                              isActive ? 'text-brand-accent' : 'text-muted-foreground/60'
                            )}
                            aria-hidden
                          >
                            {link.chapter}
                          </span>
                          <span
                            className={cn(
                              'font-display text-4xl leading-none tracking-tight transition-colors',
                              isActive ? 'text-foreground' : 'text-foreground/85'
                            )}
                          >
                            {link.label}
                          </span>
                        </span>
                        <span className="font-mono text-[0.55rem] uppercase tracking-[0.24em] text-muted-foreground/60">
                          {link.beat}
                        </span>
                      </motion.a>
                    </li>
                  );
                })}
              </ol>
            </nav>

            <motion.div
              variants={prefersReducedMotion ? undefined : menuMetaVariants}
              className="relative shrink-0 space-y-5 px-5 pb-10"
            >
              <div className="flex items-center justify-between border-t border-border/45 pt-5">
                <Link
                  href="/chat"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  Archive console
                </Link>
                <button
                  type="button"
                  onClick={toggle}
                  aria-pressed={isDark}
                  className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {isDark ? 'Light mode' : 'Dark mode'}
                </button>
              </div>
              <Link
                href="/#contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="immersive-button w-full"
              >
                Connect
              </Link>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
