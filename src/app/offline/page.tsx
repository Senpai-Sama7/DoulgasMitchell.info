'use client';

import { SiteFooter, SiteHeader } from '@/components/site';

export default function OfflinePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mx-auto max-w-md space-y-6">
          <div className="text-6xl" role="img" aria-label="Offline">📡</div>
          <h1 className="editorial-title text-3xl">You&apos;re Offline</h1>
          <p className="text-muted-foreground">
            It looks like you&apos;ve lost your internet connection. Some content
            may still be available from cache — try refreshing when you&apos;re
            back online.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}