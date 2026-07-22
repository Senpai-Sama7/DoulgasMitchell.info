'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChapterRail } from '@/components/immersive/chapter-rail';
import { useImmersive } from '@/components/immersive/immersive-context';
import { ImmersiveHeroSection } from '@/components/site/immersive-hero-section';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { PageViewTracker } from '@/components/site/page-view-tracker';
import { useTheme } from '@/lib/theme';
import type { ArticleShowcase, BookShowcase, CertificationShowcase, ProjectShowcase } from '@/lib/site-content';

const ImmersiveAboutSection = dynamic(
  () => import('@/components/site/immersive-about-section').then((m) => m.ImmersiveAboutSection),
  { ssr: true }
);
const ImmersiveMethodSection = dynamic(
  () => import('@/components/site/immersive-method-section').then((m) => m.ImmersiveMethodSection),
  { ssr: true }
);
const ImmersiveWorkSection = dynamic(
  () => import('@/components/site/immersive-work-section').then((m) => m.ImmersiveWorkSection),
  { ssr: true }
);
const ImmersiveBookSection = dynamic(
  () => import('@/components/site/immersive-book-section').then((m) => m.ImmersiveBookSection),
  { ssr: true }
);
const ImmersiveWritingSection = dynamic(
  () => import('@/components/site/immersive-writing-section').then((m) => m.ImmersiveWritingSection),
  { ssr: true }
);
const ImmersiveCertificationsSection = dynamic(
  () =>
    import('@/components/site/immersive-certifications-section').then(
      (m) => m.ImmersiveCertificationsSection
    ),
  { ssr: true }
);
const PublicKnowledgeConsole = dynamic(
  () => import('@/components/site/public-knowledge-console').then((m) => m.PublicKnowledgeConsole),
  { ssr: false }
);
const ImmersiveContactSection = dynamic(
  () => import('@/components/site/immersive-contact-section').then((m) => m.ImmersiveContactSection),
  { ssr: true }
);
const CommandPalette = dynamic(
  () => import('@/components/effects/command-palette').then((m) => m.CommandPalette),
  { ssr: false }
);
const CommandKTrigger = dynamic(
  () => import('@/components/effects/command-palette').then((m) => m.CommandKTrigger),
  { ssr: false }
);

interface PublicAssistantSettings {
  enabled: boolean;
  maxQuestionsPerIp: number;
  welcomeMessage: string;
  enableDecisionIntelligence: boolean;
}

interface HomePageShellProps {
  articles: ArticleShowcase[];
  book: BookShowcase;
  certifications: CertificationShowcase[];
  projects: ProjectShowcase[];
  contentSource?: 'database' | 'fallback';
  contentWarning?: string | null;
  publicAssistant: PublicAssistantSettings;
}

export function HomePageShell({
  articles,
  book: _book,
  certifications,
  projects,
  contentSource = 'database',
  contentWarning,
  publicAssistant,
}: HomePageShellProps) {
  const prefersReducedMotion = useReducedMotion();
  const { isDark, toggle } = useTheme();
  const { scrollTo } = useImmersive();
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      const timer = window.setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          scrollTo(el, { immediate: prefersReducedMotion === true });
        }
      }, 120);
      return () => window.clearTimeout(timer);
    }
  }, [prefersReducedMotion, scrollTo]);

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
        scrollTo(0, { immediate: prefersReducedMotion === true });
        return;
      }
      scrollTo(href, { immediate: prefersReducedMotion === true });
    },
    [prefersReducedMotion, scrollTo]
  );

  return (
    <>
      <PageViewTracker />
      <SiteHeader />
      <ChapterRail />

      <main id="main-content" className="flex-1">
        {contentSource === 'fallback' && contentWarning ? (
          <div className="editorial-container pt-24">
            <div className="border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
              {contentWarning}
            </div>
          </div>
        ) : null}

        <ImmersiveHeroSection />
        <ImmersiveAboutSection />
        <ImmersiveMethodSection />
        <ImmersiveWorkSection projects={projects} />
        <ImmersiveBookSection />
        <ImmersiveWritingSection articles={articles} />
        <ImmersiveCertificationsSection items={certifications} />
        <PublicKnowledgeConsole settings={publicAssistant} />
        <ImmersiveContactSection />
      </main>

      <SiteFooter />

      <CommandKTrigger onClick={() => setIsCommandOpen(true)} />

      <AnimatePresence>
        {isCommandOpen ? (
          <CommandPalette
            isOpen={isCommandOpen}
            isDark={isDark}
            onToggleTheme={toggle}
            onClose={() => setIsCommandOpen(false)}
            onNavigate={handleNavigate}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
