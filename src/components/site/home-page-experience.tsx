'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { CommandKTrigger, CommandPalette, SplashOverlay } from '@/components/effects';
import { PageViewTracker } from '@/components/site/page-view-tracker';
import { useTheme } from '@/lib/theme';

const SPLASH_SEEN_KEY = 'dm-splash-seen';

export function HomePageExperience() {
  const { scrollYProgress } = useScroll();
  const prefersReducedMotion = useReducedMotion();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
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
