'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SiteFooter, SiteHeader } from '@/components/site';

export default function OfflinePage() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <motion.div
          className="glass-panel mx-auto max-w-md space-y-6 p-10"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="immersive-kicker">Offline</p>
          <h1 className="display-title text-4xl">You&apos;re offline</h1>
          <p className="text-muted-foreground">
            Connection lost. Cached content may still be available — refresh when
            you&apos;re back online.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="immersive-button"
          >
            Try again
          </button>
        </motion.div>
      </main>
      <SiteFooter />
    </>
  );
}