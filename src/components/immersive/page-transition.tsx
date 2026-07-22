'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ScrollTrigger } from '@/lib/gsap';

const signatureEase = [0.22, 1, 0.36, 1] as const;

/* Module-level targets so onAnimationComplete can identify the enter phase
   by reference and re-measure ScrollTrigger exactly once per navigation. */
const enterFrom = { opacity: 0, y: 18, filter: 'blur(10px)' };
const enterTo = { opacity: 1, y: 0, filter: 'blur(0px)' };
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
 * navigation never feels gated. Once the incoming page lands, every
 * ScrollTrigger re-measures against the new document height (the same
 * pattern ImmersiveRoot uses on pathname change). Reduced motion and the
 * admin surface render instantly.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion || pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
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
            requestAnimationFrame(() => ScrollTrigger.refresh());
          }
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
