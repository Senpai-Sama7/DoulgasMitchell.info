import { CertificationsSection } from '@/components/site/certifications-section';
import { EnhancedAboutSection } from '@/components/site/enhanced-about-section';
import { EnhancedBookSection } from '@/components/site/enhanced-book-section';
import { EnhancedContactSection } from '@/components/site/enhanced-contact-section';
import { EnhancedHeroSection } from '@/components/site/enhanced-hero-section';
import { PublicKnowledgeConsole } from '@/components/site/public-knowledge-console';
import { EnhancedWorkSection } from '@/components/site/enhanced-work-section';
import { EnhancedWritingSection } from '@/components/site/enhanced-writing-section';
import { SiteFooter } from '@/components/site/footer';
import { SiteHeader } from '@/components/site/header';
import { HomePageExperience } from '@/components/site/home-page-experience';
import type { ArticleShowcase, BookShowcase, CertificationShowcase, ProjectShowcase } from '@/lib/site-content';

interface PublicAssistantSettings {
  enabled: boolean;
  maxQuestionsPerIp: number;
  welcomeMessage: string;
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
        <PublicKnowledgeConsole settings={publicAssistant} />
        <EnhancedContactSection />
      </main>

      <SiteFooter />
    </>
  );
}
