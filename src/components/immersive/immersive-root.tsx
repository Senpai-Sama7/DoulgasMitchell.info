'use client';

import Lenis from 'lenis';
import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { ImmersiveProvider } from '@/components/immersive/immersive-context';
import { PageTransition } from '@/components/immersive/page-transition';
import { VideoEntrance } from '@/components/immersive/video-entrance';
import { gsap, lenisEasing, ScrollTrigger } from '@/lib/gsap';
import {
  getLenisOptions,
  getMotionTierServerSnapshot,
  getMotionTierSnapshot,
  shouldEnableCustomCursor,
  shouldEnableLenis,
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

/**
 * Cursor grammar — set `data-cursor` on any element to change the cursor:
 * - "interactive": ring grows, dot shrinks (links, buttons, magnetic targets)
 * - "media": ring becomes a "View" badge (images, video, gallery cards)
 * - "drag": ring becomes a "Drag" badge (carousels, sliders)
 * Plain <a>/<button> elements get the interactive treatment automatically.
 */
type CursorVariant = 'default' | 'interactive' | 'media' | 'drag';

const CURSOR_VARIANTS: Record<CursorVariant, { ring: number; dot: number; label: string }> = {
  default: { ring: 1, dot: 1, label: '' },
  interactive: { ring: 1.6, dot: 0.4, label: '' },
  media: { ring: 2.6, dot: 0, label: 'View' },
  drag: { ring: 2.4, dot: 0, label: 'Drag' },
};

function isCursorVariant(value: string | null | undefined): value is CursorVariant {
  return value === 'interactive' || value === 'media' || value === 'drag';
}

function ImmersiveCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, autoAlpha: 0, force3D: true });
    gsap.set(label, { autoAlpha: 0 });

    // Dot tracks the pointer tightly; the ring trails on a longer lerp.
    const dotX = gsap.quickTo(dot, 'x', { duration: 0.15, ease: 'power3.out' });
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.15, ease: 'power3.out' });
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.55, ease: 'power3.out' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.55, ease: 'power3.out' });

    let visible = false;
    let variant: CursorVariant = 'default';
    let pressed = false;

    const setVisible = (next: boolean) => {
      if (visible === next) return;
      visible = next;
      gsap.to([dot, ring], {
        autoAlpha: next ? 1 : 0,
        duration: 0.25,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    const applyScale = () => {
      const preset = CURSOR_VARIANTS[variant];
      gsap.to(ring, {
        scale: preset.ring * (pressed ? 0.86 : 1),
        duration: 0.4,
        ease: 'power4.out',
        overwrite: 'auto',
      });
      gsap.to(dot, {
        scale: preset.dot * (pressed ? 0.6 : 1),
        duration: 0.3,
        ease: 'power4.out',
        overwrite: 'auto',
      });
    };

    const applyVariant = (next: CursorVariant) => {
      if (variant === next) return;
      variant = next;
      const preset = CURSOR_VARIANTS[next];
      if (preset.label) {
        label.textContent = preset.label;
      }
      gsap.to(label, {
        autoAlpha: preset.label ? 1 : 0,
        duration: 0.2,
        ease: 'power2.out',
        overwrite: 'auto',
      });
      applyScale();
    };

    const onMove = (event: PointerEvent) => {
      setVisible(true);
      dotX(event.clientX);
      dotY(event.clientY);
      ringX(event.clientX);
      ringY(event.clientY);
    };

    const onOver = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const host = target.closest('[data-cursor], a, button, [role="button"]');
      const declared = host?.getAttribute('data-cursor');
      if (isCursorVariant(declared)) {
        applyVariant(declared);
      } else {
        applyVariant(host ? 'interactive' : 'default');
      }
    };

    const onDown = () => {
      pressed = true;
      applyScale();
    };
    const onUp = () => {
      pressed = false;
      applyScale();
    };
    const onLeave = () => setVisible(false);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    window.addEventListener('blur', onLeave);

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('blur', onLeave);
      gsap.killTweensOf([dot, ring, label]);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] hidden md:block no-print" aria-hidden>
      <div
        ref={ringRef}
        className="fixed top-0 left-0 flex h-10 w-10 items-center justify-center rounded-full border border-foreground/30 bg-foreground/[0.03] opacity-0 backdrop-blur-[1.5px] will-change-transform"
      >
        <span
          ref={labelRef}
          className="select-none text-[8px] font-medium uppercase tracking-[0.18em] text-foreground opacity-0"
        />
      </div>
      <div
        ref={dotRef}
        className="fixed top-0 left-0 h-1.5 w-1.5 rounded-full bg-foreground opacity-0 will-change-transform"
      />
    </div>
  );
}

export function ImmersiveRoot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const isAdmin = pathname.startsWith('/admin');
  const lenisRef = useRef<Lenis | null>(null);
  const motionTier = useSyncExternalStore(
    subscribeMotionTier,
    getMotionTierSnapshot,
    getMotionTierServerSnapshot
  );

  const lenisEnabled =
    !isAdmin && !prefersReducedMotion && shouldEnableLenis(motionTier);

  useEffect(() => {
    if (!lenisEnabled) return;

    const tierOptions = getLenisOptions(motionTier);
    if (!tierOptions) return;

    document.documentElement.classList.add('lenis');

    // Canonical 2026 Lenis <-> GSAP sync: no Lenis autoRaf — GSAP's ticker is
    // the single clock. Lenis reports scroll to ScrollTrigger, the ticker
    // drives Lenis, and lagSmoothing(0) keeps scrub timelines pixel-locked.
    const lenis = new Lenis({
      duration: tierOptions.duration,
      easing: lenisEasing,
      smoothWheel: tierOptions.smoothWheel,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', () => ScrollTrigger.update());

    const onTick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenisRef.current = null;
      document.documentElement.classList.remove('lenis');
    };
  }, [lenisEnabled, motionTier]);

  // Route changes: reset scroll instantly and re-measure every trigger.
  useEffect(() => {
    if (isAdmin) return;
    lenisRef.current?.scrollTo(0, { immediate: true, force: true });
    ScrollTrigger.refresh();
  }, [pathname, isAdmin]);

  // Web fonts change layout metrics — re-measure once they settle.
  useEffect(() => {
    if (isAdmin) return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  if (isAdmin) {
    return <>{children}</>;
  }

  const showCursor = shouldEnableCustomCursor(motionTier) && !prefersReducedMotion;

  return (
    <ImmersiveProvider motionTier={motionTier} lenisEnabled={lenisEnabled} lenisRef={lenisRef}>
      {!prefersReducedMotion && <ScrollProgressBar />}
      <VideoEntrance />
      {showCursor && <ImmersiveCursor />}
      <PageTransition>{children}</PageTransition>
    </ImmersiveProvider>
  );
}
