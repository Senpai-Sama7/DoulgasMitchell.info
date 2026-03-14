import dynamic from 'next/dynamic';
import { EnhancedHeroSection } from '@/components/site/enhanced-hero-section';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { HomePageExperience } from '@/components/site/home-page-experience';
import type { ArticleShowcase, BookShowcase, CertificationShowcase, ProjectShowcase } from '@/lib/site-content';

// Below-fold sections: lazily loaded as user scrolls to save ~264KB on initial parse.
// ssr:true keeps SEO content in HTML; the JS bundle for each is deferred.
const EnhancedAboutSection = dynamic(
  () => import('@/components/site/enhanced-about-section').then((m) => m.EnhancedAboutSection),
  { ssr: true }
);
const EnhancedWorkSection = dynamic(
  () => import('@/components/site/enhanced-work-section').then((m) => m.EnhancedWorkSection),
  { ssr: true }
);
const EnhancedBookSection = dynamic(
  () => import('@/components/site/enhanced-book-section').then((m) => m.EnhancedBookSection),
  { ssr: true }
);
const EnhancedWritingSection = dynamic(
  () => import('@/components/site/enhanced-writing-section').then((m) => m.EnhancedWritingSection),
  { ssr: true }
);
const CertificationsSection = dynamic(
  () => import('@/components/site/certifications-section').then((m) => m.CertificationsSection),
  { ssr: true }
);
const PublicKnowledgeConsole = dynamic(
  () => import('@/components/site/public-knowledge-console').then((m) => m.PublicKnowledgeConsole),
  { ssr: false } // AI console — no SSR needed, client-only
);
const EnhancedContactSection = dynamic(
  () => import('@/components/site/enhanced-contact-section').then((m) => m.EnhancedContactSection),
  { ssr: true }
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
  return (
    <>
      <HomePageExperience />
      <SiteHeader />

      <main id="main-content" className="flex-1">
        {contentSource === 'fallback' && contentWarning ? (
          <div className="editorial-container pt-24">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
              {contentWarning}
            </div>
          </div>
        ) : null}

        {/* Hero is above the fold — always eager */}
        <EnhancedHeroSection />

        <div className="editorial-container">
          <div className="flex items-center justify-center gap-4 py-8">
            <span className="font-mono text-xl text-muted-foreground/20">{'\u2550'.repeat(20)}</span>
            <span className="font-mono text-muted-foreground/30">◈</span>
            <span className="font-mono text-xl text-muted-foreground/20">{'\u2550'.repeat(20)}</span>
          </div>
        </div>

        {/* All sections below the fold are dynamically loaded */}
        <EnhancedAboutSection />
        <EnhancedWorkSection projects={projects} />
        <EnhancedBookSection />
        <EnhancedWritingSection articles={articles} />
        <CertificationsSection items={certifications} />
        <PublicKnowledgeConsole settings={publicAssistant} />
        <EnhancedContactSection />
      </main>

      <SiteFooter />
    </>
  );
}
