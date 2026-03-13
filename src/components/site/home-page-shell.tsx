'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  CertificationsSection,
  EnhancedAboutSection,
  EnhancedBookSection,
  EnhancedContactSection,
  EnhancedHeroSection,
  EnhancedWorkSection,
  EnhancedWritingSection,
  SiteFooter,
  SiteHeader,
} from '@/components/site';
import { CommandKTrigger, CommandPalette, SplashOverlay } from '@/components/effects';
import { PageViewTracker } from '@/components/site/page-view-tracker';
import type { ArticleShowcase, BookShowcase, CertificationShowcase, ProjectShowcase } from '@/lib/site-content';
import { useTheme } from '@/lib/theme';

interface HomePageShellProps {
  articles: ArticleShowcase[];
  book: BookShowcase;
  certifications: CertificationShowcase[];
  projects: ProjectShowcase[];
}

const SPLASH_SEEN_KEY = 'dm-splash-seen';

export function HomePageShell({ articles, book, certifications, projects }: HomePageShellProps) {
  const { scrollYProgress } = useScroll();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const [showSplash, setShowSplash] = useState(false);
  const { isDark, toggle } = useTheme();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setShowSplash(false);
        return;
      }

      try {
        setShowSplash(window.sessionStorage.getItem(SPLASH_SEEN_KEY) !== '1');
      } catch {
        setShowSplash(false);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showSplash) {
      document.body.style.overflow = 'auto';
    }
  }, [showSplash]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setIsCommandOpen((previous) => !previous);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = useCallback(
    (href: string) => {
      if (href === '#') {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        return;
      }

      const element = document.querySelector(href);
      if (element instanceof HTMLElement) {
        element.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    },
    [prefersReducedMotion]
  );

  return (
    <>
      <PageViewTracker />

      <AnimatePresence>
        {showSplash && (
          <SplashOverlay 
            minDisplayTime={2400}
            onComplete={() => {
              setShowSplash(false);
              try {
                window.sessionStorage.setItem(SPLASH_SEEN_KEY, '1');
              } catch {
                // Ignore session storage write failures.
              }
            }} 
          />
        )}
      </AnimatePresence>

      <motion.div
        className="scroll-progress"
        style={{
          scaleX,
          backgroundColor: isDark ? '#fafafa' : '#171717',
        }}
      />

      <SiteHeader />

      <main id="main-content" className="flex-1">
        <EnhancedHeroSection />

        <div className="editorial-container">
          <div className="flex items-center justify-center gap-4 py-8">
            <span className="font-mono text-xl text-muted-foreground/20">{'═'.repeat(20)}</span>
            <span className="font-mono text-muted-foreground/30">◈</span>
            <span className="font-mono text-xl text-muted-foreground/20">{'═'.repeat(20)}</span>
          </div>
        </div>

        <EnhancedAboutSection />
        <EnhancedWorkSection projects={projects} />
        <EnhancedBookSection />
        <EnhancedWritingSection articles={articles} />
        <CertificationsSection items={certifications} />
        <EnhancedContactSection />
      </main>

      <SiteFooter />

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onNavigate={handleNavigate}
        isDark={isDark}
        onToggleTheme={toggle}
      />

      <CommandKTrigger onClick={() => setIsCommandOpen(true)} />

    </>
  );
}
