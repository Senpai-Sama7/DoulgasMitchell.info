'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { logger } from '@/lib/logger';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    logger.error('Root layout error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        <main id="main-content" className="flex min-h-screen items-center justify-center px-6 py-16">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-muted/30 p-8 md:p-10">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Critical error
            </p>
            <h1 className="mt-3 text-3xl font-semibold">An unexpected error occurred</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              The application encountered a fatal error and could not recover. Please try again.
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
      </body>
    </html>
  );
}
