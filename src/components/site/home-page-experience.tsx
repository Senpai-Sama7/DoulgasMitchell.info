'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { PageViewTracker } from '@/components/site/page-view-tracker';
import { useTheme } from '@/lib/theme';
import { AnimatePresence } from 'framer-motion';

// Heavy effect components — defer until after first paint.
const CommandPalette = dynamic(
  () => import('@/components/effects/command-palette').then((m) => m.CommandPalette),
  { ssr: false }
);
const CommandKTrigger = dynamic(
  () => import('@/components/effects/command-palette').then((m) => m.CommandKTrigger),
  { ssr: false }
);

export function HomePageExperience() {
  const { scrollYProgress } = useScroll();
  const prefersReducedMotion = useReducedMotion();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const { isDark, toggle } = useTheme();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      const timer = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [prefersReducedMotion]);

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

      <motion.div
        className="scroll-progress"
        style={{
          scaleX,
          backgroundColor: isDark ? '#fafafa' : '#171717',
        }}
      />

      <CommandKTrigger
        onClick={() => setIsCommandOpen(true)}
      />

      <AnimatePresence>
        {isCommandOpen && (
          <CommandPalette
            isOpen={isCommandOpen}
            isDark={isDark}
            onToggleTheme={toggle}
            onClose={() => setIsCommandOpen(false)}
            onNavigate={handleNavigate}
          />
        )}
      </AnimatePresence>
    </>
  );
}