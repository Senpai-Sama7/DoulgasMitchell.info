import Link from 'next/link';
import { SiteFooter, SiteHeader } from '@/components/site';

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1 pt-24">
        <section className="content-container pb-16">
          <div className="glass-panel p-8 md:p-12">
            <p className="immersive-kicker mb-4">404</p>
            <h1 className="display-title">Page not found</h1>
            <p className="mt-4 max-w-xl text-muted-foreground">
              The address does not map to published content.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/" className="immersive-button">
                Return home
              </Link>
              <Link href="/search" className="immersive-button-ghost">
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
