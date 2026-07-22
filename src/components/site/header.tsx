'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, Menu, Moon, Sparkles, Sun, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { siteProfile } from '@/lib/site-content';
import { mediaManifest } from '@/lib/media-manifest';
import { useTheme } from '@/lib/theme';

const navLinks = [
  { href: '/#about', label: 'About', sectionId: 'about' },
  { href: '/#method', label: 'Method', sectionId: 'method' },
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
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="group flex items-center gap-3 rounded-full px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div
                aria-hidden="true"
                className="hidden h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border/60 shadow-sm sm:block"
              >
                <video
                  ref={videoRef}
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster="/media/dougie-frame-poster.webp"
                  className="h-full w-full object-cover"
                  aria-hidden
                  tabIndex={-1}
                >
                  <source src={mediaManifest.hero.videoLoop} type="video/mp4" />
                  <source src={mediaManifest.hero.videoLoopAlt} type="video/mp4" />
                </video>
              </div>
              <span className="font-display text-lg tracking-tight transition-opacity group-hover:opacity-80">
                {siteProfile.name}
              </span>
            </Link>
          </div>

          <ul className="hidden items-center gap-0.5 md:flex">
            {navLinks.map((link) => {
              const isActive = activeSection === link.sectionId;
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-current={isActive ? 'location' : undefined}
                    className={cn(
                      'nav-link px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isActive && 'text-foreground after:w-[calc(100%-1.5rem)]'
                    )}
                  >
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-1.5 sm:gap-2">
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
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
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
              className="hidden items-center gap-1.5 rounded-full border border-border/50 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-border hover:bg-muted/30 hover:text-foreground sm:flex"
              aria-label="Ask the AI assistant"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Chat</span>
            </Link>

            <Link
              href="/#contact"
              className="immersive-button !px-4 !py-2.5 text-sm sm:!px-5"
              aria-label="Jump to contact section"
            >
              <Mail className="h-4 w-4 sm:hidden" />
              <span className="hidden sm:inline">Connect</span>
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
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-md md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />

            <motion.div
              id="site-mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-3 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-border/50 bg-background/90 shadow-2xl backdrop-blur-2xl md:hidden"
            >
              <div className="space-y-1 p-3">
                {navLinks.map((link, index) => {
                  const isActive = activeSection === link.sectionId;
                  return (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-current={isActive ? 'location' : undefined}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className={cn(
                        'flex items-center justify-between rounded-xl px-4 py-3.5 text-sm transition-colors',
                        isActive
                          ? 'bg-foreground text-background'
                          : 'text-foreground hover:bg-muted/50'
                      )}
                    >
                      <span>{link.label}</span>
                      <span className="immersive-kicker !text-[0.6rem] opacity-60">{link.sectionId}</span>
                    </motion.a>
                  );
                })}
                <Link
                  href="/chat"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3.5 text-sm text-foreground transition-colors hover:bg-muted/50"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI Assistant
                  </span>
                </Link>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
