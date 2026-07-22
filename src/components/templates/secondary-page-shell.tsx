'use client';

import { SiteFooter, SiteHeader } from '@/components/site';
import { PageViewTracker } from '@/components/site/page-view-tracker';
import { ScrollReveal } from '@/components/immersive/scroll-reveal';

interface SecondaryPageShellProps {
  children: React.ReactNode;
  kicker?: string;
  title?: string;
  description?: string;
  trackPageView?: boolean;
}

export function SecondaryPageShell({
  children,
  kicker,
  title,
  description,
  trackPageView = true,
}: SecondaryPageShellProps) {
  return (
    <>
      {trackPageView ? <PageViewTracker /> : null}
      <SiteHeader />
      <main id="main-content" className="flex-1 pt-24 md:pt-28">
        {(kicker || title || description) && (
          <div className="editorial-container pb-10">
            <ScrollReveal className="max-w-3xl">
              {kicker ? <p className="chapter-label mb-6">{kicker}</p> : null}
              {title ? <h1 className="display-title text-balance">{title}</h1> : null}
              {description ? (
                <p className="mt-6 text-lg text-muted-foreground">{description}</p>
              ) : null}
            </ScrollReveal>
          </div>
        )}
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
