'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { logger } from '@/lib/logger';

interface AdminErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    logger.error('Admin render error:', error);
  }, [error]);

  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-muted/30 p-8 md:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Admin Error</p>
        <h1 className="mt-3 text-3xl font-semibold">Admin panel failed to load</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          An error occurred in the admin panel. You can retry or return to the admin dashboard.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="cta-button">
            Retry
          </button>
          <Link href="/admin" className="ghost-button">
            Dashboard
          </Link>
          <Link href="/" className="ghost-button">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
