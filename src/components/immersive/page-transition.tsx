'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { ScrollTrigger } from '@/lib/gsap';

const signatureEase = [0.22, 1, 0.36, 1] as const;

/* Module-level targets so onAnimationComplete can identify the enter phase
   by reference and re-measure ScrollTrigger exactly once per navigation. */
const enterFrom = { opacity: 0, y: 18, filter: 'blur(10px)' };
/* transitionEnd snaps filter to 'none' the moment the enter settles: any
   non-none filter on this wrapper (even blur(0px)) creates a CSS containing
   block, which re-parents every position:fixed descendant — silently breaking
   ScrollTrigger pins across the whole page (pinned scenes scroll away as
   blank frames instead of holding the viewport). */
const enterTo = {
  opacity: 1,
  y: 0,
  filter: 'blur(0px)',
  transitionEnd: { filter: 'none' },
};
const exitTo = {
  opacity: 0,
  y: -12,
  filter: 'blur(6px)',
  transition: { duration: 0.2, ease: [0.55, 0, 0.55, 0.45] as [number, number, number, number] },
};

/**
 * Route-level cinematic handoff: the outgoing page lifts and softens out of
 * focus while the incoming one settles up from below — one continuous camera
 * move instead of a hard cut. The full exit + enter stays under ~500ms so
 * navigation never feels gated. Once the incoming page lands, the wrapper's
 * residual filter is released (see enterTo) and every ScrollTrigger
 * re-measures against the new document height (the same pattern
 * ImmersiveRoot uses on pathname change). Reduced motion and the admin
 * surface render instantly.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);

  /** Drop the containing-block styles and re-measure the pins. */
  const releaseFilter = useCallback(() => {
    const node = wrapperRef.current;
    if (node) {
      node.style.removeProperty('filter');
      node.style.removeProperty('will-change');
    }
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, []);

  /* AnimatePresence renders with initial={false}, so the very first mount
     paints the enter target directly and onAnimationComplete never fires —
     release the filter here for that case. During client navigations the
     enter animation simply re-drives the style until it completes, where
     onAnimationComplete + transitionEnd finish the job. */
  useEffect(() => {
    const frame = requestAnimationFrame(releaseFilter);
    return () => cancelAnimationFrame(frame);
  }, [pathname, releaseFilter]);

  if (prefersReducedMotion || pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        ref={wrapperRef}
        key={pathname}
        initial={enterFrom}
        animate={enterTo}
        exit={exitTo}
        transition={{ duration: 0.3, ease: signatureEase }}
        onAnimationComplete={(definition) => {
          const landed =
            definition === enterTo ||
            (typeof definition === 'object' &&
              definition !== null &&
              'opacity' in definition &&
              definition.opacity === 1);
          if (landed) {
            releaseFilter();
          }
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
