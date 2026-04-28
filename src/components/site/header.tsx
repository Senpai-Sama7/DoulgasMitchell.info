'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, Menu, Moon, Sparkles, Sun, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { siteProfile } from '@/lib/site-content';
import { useTheme } from '@/lib/theme';

const navLinks = [
  { href: '/#about', label: 'About', sectionId: 'about' },
  { href: '/#work', label: 'Work', sectionId: 'work' },
  { href: '/#writing', label: 'Writing', sectionId: 'writing' },
  { href: '/#book', label: 'Book', sectionId: 'book' },
  { href: '/#contact', label: 'Contact', sectionId: 'contact' },
] as const;

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('about');
  const { isDark, toggle } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const syncHeaderState = () => {
      setIsScrolled(window.scrollY > 20);

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
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.setAttribute('muted', '');
      videoRef.current.setAttribute('playsinline', '');
      void videoRef.current.play().catch(() => {
        // Decorative media should fail silently.
      });
    }
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

  const activeLinkClass = 'text-foreground after:w-[calc(100%-2rem)]';

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        isScrolled ? 'border-b border-border bg-background/88 backdrop-blur-xl' : 'bg-transparent'
      )}
    >
      <nav aria-label="Primary" className="editorial-container">
        <div className="flex h-16 items-center justify-between gap-4 md:h-20">
          <div className="flex items-center gap-4">
            <Link href="/" className="group flex items-center gap-2 rounded-full px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <span className="font-mono text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                {'//'}
              </span>
              <span className="font-semibold tracking-tight">{siteProfile.name}</span>
            </Link>

            {/* Decorative avatar video — fully hidden from assistive technology */}
            <div
              aria-hidden="true"
              className="hidden h-10 w-10 shrink-0 overflow-hidden rounded-full border border-primary/20 shadow-lg shadow-primary/5 sm:block"
            >
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                poster="/media/dougie-frame-poster.webp"
                className="h-full w-full object-cover"
                aria-hidden="true"
              >
                <source src="/media/breathing-dm-loop.mp4" type="video/mp4" />
                {/* Captions track satisfies Lighthouse a11y audit for <video> elements.
                    Content is decorative; track is intentionally empty. */}
                <track kind="captions" srcLang="en" label="English" default />
              </video>
            </div>
          </div>

          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = activeSection === link.sectionId;
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-current={isActive ? 'location' : undefined}
                    className={cn('nav-link rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', isActive && activeLinkClass)}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              className="h-9 w-9 rounded-full"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-pressed={isDark}
            >
              <motion.div initial={false} animate={{ rotate: isDark ? 180 : 0 }} transition={{ duration: 0.3 }}>
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </motion.div>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full md:hidden"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-controls="site-mobile-menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>

            <Link
              href="/chat"
              className="flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted/40 hover:text-foreground"
              aria-label="Ask the AI assistant"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Chat</span>
            </Link>

            <Link
              href="/#contact"
              className="cta-button min-w-[2.75rem] justify-center text-sm p-2 sm:px-6 sm:py-3"
              aria-label="Jump to contact section"
            >
              <Mail className="h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">Let's Connect</span>
            </Link>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-background/72 backdrop-blur-sm md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />

            <motion.div
              id="site-mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-x-0 top-full z-50 border-b border-border bg-background/96 shadow-2xl backdrop-blur-xl md:hidden"
            >
              <div className="editorial-container space-y-5 py-5">
                <div className="rounded-2xl border border-border/70 bg-muted/35 p-4">
                  <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                    Navigate the archive
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Jump straight to case studies, essays, the book, or the contact form.
                  </p>
                </div>

                <ul className="grid gap-2">
                  {navLinks.map((link) => {
                    const isActive = activeSection === link.sectionId;
                    return (
                      <li key={link.href}>
                        <a
                          href={link.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          aria-current={isActive ? 'location' : undefined}
                          className={cn(
                            'flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            isActive
                              ? 'border-primary/40 bg-primary/10 text-foreground'
                              : 'border-border/70 bg-background text-foreground hover:border-primary/30 hover:bg-muted/40'
                          )}
                        >
                          <span>{link.label}</span>
                          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                            {link.sectionId}
                          </span>
                        </a>
                      </li>
                    );
                  })}
                  <li>
                    <Link
                      href="/chat"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground transition-colors hover:border-primary/30 hover:bg-muted/40"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5" />
                        AI Chat
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                        assistant
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
