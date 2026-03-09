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

export function HomePageShell({ articles, book, certifications, projects }: HomePageShellProps) {
  const { scrollYProgress } = useScroll();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [splashKey, setSplashKey] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const { isDark, toggle } = useTheme();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const isDevelopment = process.env.NODE_ENV === 'development';

  const replaySplash = useCallback(() => {
    setSplashKey((previous) => previous + 1);
    setShowSplash(true);
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

      if (isDevelopment && event.key.toLowerCase() === 'o' && event.shiftKey) {
        event.preventDefault();
        replaySplash();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDevelopment, replaySplash]);

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
            key={`splash-${splashKey}`} 
            onComplete={() => {
              setShowSplash(false);
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

      <button
        type="button"
        onClick={replaySplash}
        className="fixed bottom-20 left-6 z-50 rounded-full border border-border bg-background/80 px-3 py-2 text-xs uppercase tracking-[0.24em] text-foreground shadow-lg backdrop-blur-sm transition-colors hover:bg-muted sm:bottom-6 sm:left-auto sm:right-32"
        aria-label="Replay entrance intro"
      >
        Replay Intro
      </button>
    </>
  );
}
