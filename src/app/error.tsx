'use client';

import Link from 'next/link';
import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Global render error:', error);
  }, [error]);

  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-muted/30 p-8 md:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Runtime error</p>
        <h1 className="mt-3 text-3xl font-semibold">This view failed to render</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          A recoverable error occurred. You can retry the current view or return to the home page.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="cta-button">
            Retry
          </button>
          <Link href="/" className="ghost-button">
            Return home
          </Link>
        </div>
      </div>
    </main>
  );
}
