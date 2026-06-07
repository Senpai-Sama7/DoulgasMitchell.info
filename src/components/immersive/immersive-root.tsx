'use client';

import Lenis from 'lenis';
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { ImmersiveProvider } from '@/components/immersive/immersive-context';
import { PageTransition } from '@/components/immersive/page-transition';
import {
  getMotionTierServerSnapshot,
  getMotionTierSnapshot,
  shouldEnableLenis,
  shouldEnableMagneticCursor,
  subscribeMotionTier,
} from '@/lib/motion-tier';

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <motion.div
      className="scroll-progress no-print"
      style={{ scaleX, transformOrigin: '0% 50%' }}
      aria-hidden
    />
  );
}

function MagneticCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const visibleRef = useRef(false);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;

      if (!visibleRef.current) {
        visibleRef.current = true;
        if (dotRef.current) {
          dotRef.current.style.opacity = '1';
        }
      }

      if (rafRef.current) return;

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        if (dotRef.current) {
          dotRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0) translate(-50%, -50%)`;
        }
      });
    };

    const onLeave = () => {
      visibleRef.current = false;
      if (dotRef.current) {
        dotRef.current.style.opacity = '0';
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={dotRef}
      className="pointer-events-none fixed top-0 left-0 z-[45] hidden h-8 w-8 rounded-full border border-foreground/20 opacity-0 will-change-transform md:block"
      aria-hidden
    >
      <div className="absolute inset-2 rounded-full bg-foreground/5 backdrop-blur-sm" />
    </div>
  );
}

export function ImmersiveRoot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const isAdmin = pathname.startsWith('/admin');
  const motionTier = useSyncExternalStore(
    subscribeMotionTier,
    getMotionTierSnapshot,
    getMotionTierServerSnapshot
  );

  const lenisEnabled =
    !isAdmin && !prefersReducedMotion && shouldEnableLenis(motionTier);

  useEffect(() => {
    if (!lenisEnabled) return;

    document.documentElement.classList.add('lenis');

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      document.documentElement.classList.remove('lenis');
    };
  }, [lenisEnabled]);

  if (isAdmin) {
    return <>{children}</>;
  }

  const showCursor = shouldEnableMagneticCursor(motionTier) && !prefersReducedMotion;

  return (
    <ImmersiveProvider motionTier={motionTier} lenisEnabled={lenisEnabled}>
      {!prefersReducedMotion && <ScrollProgressBar />}
      {showCursor && <MagneticCursor />}
      <PageTransition>{children}</PageTransition>
    </ImmersiveProvider>
  );
}
