import Link from 'next/link';
import { SiteFooter, SiteHeader } from '@/components/site';

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1 pt-24">
        <section className="content-container pb-16">
          <div className="rounded-3xl border border-border bg-muted/30 p-8 md:p-10">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">404</p>
            <h1 className="mt-3 text-3xl font-semibold">Page not found</h1>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">
              The address does not map to published content.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/" className="cta-button">
                Return home
              </Link>
              <Link href="/search" className="ghost-button">
                Search content
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
