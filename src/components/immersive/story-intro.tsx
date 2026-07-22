'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useReducedMotion } from 'framer-motion';
import { easings, gsap } from '@/lib/gsap';

const INTRO_KEY = 'dm-story-intro-v2';

function subscribeIntro(_onStoreChange: () => void) {
  return () => undefined;
}

function getIntroSnapshot() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  return window.sessionStorage.getItem(INTRO_KEY) !== '1';
}

function getIntroServerSnapshot() {
  return false;
}

/**
 * One-shot cinematic wipe on first visit per session. Sets the emotional
 * register before Arrival — brand wordmark, then a clip-path reveal into the
 * page. Skipped on reduced motion, revisit within the session, and admin.
 */
export function StoryIntro() {
  const prefersReducedMotion = useReducedMotion();
  const shouldPlay = useSyncExternalStore(
    subscribeIntro,
    getIntroSnapshot,
    getIntroServerSnapshot
  );
  const [active, setActive] = useState(shouldPlay && prefersReducedMotion !== true);

  useEffect(() => {
    if (!active) return;
    window.sessionStorage.setItem(INTRO_KEY, '1');

    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: easings.expo },
        onComplete: () => {
          document.documentElement.style.overflow = previousOverflow;
          setActive(false);
        },
      });

      tl.fromTo(
        '.story-intro-mark',
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0, duration: 0.9 },
        0.15
      )
        .fromTo(
          '.story-intro-sub',
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.7 },
          0.45
        )
        .to('.story-intro-mark, .story-intro-sub', { autoAlpha: 0, y: -16, duration: 0.55 }, 1.55)
        .to(
          '.story-intro-panel',
          {
            clipPath: 'inset(0 0 100% 0)',
            duration: 0.95,
            ease: easings.power4,
          },
          1.75
        );
    });

    return () => {
      ctx.revert();
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      className="story-intro-panel fixed inset-0 z-[80] flex items-center justify-center bg-background"
      style={{ clipPath: 'inset(0 0 0 0)' }}
      aria-hidden
    >
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 50% at 50% 40%, color-mix(in oklch, var(--brand-accent), transparent 82%), transparent 70%)',
          }}
        />
      </div>
      <div className="relative px-6 text-center">
        <p className="story-intro-sub chapter-label mb-5 justify-center opacity-0">
          Chapter 00 · Prelude
        </p>
        <p className="story-intro-mark font-display text-[clamp(2.75rem,8vw,5.5rem)] leading-none tracking-tight opacity-0">
          Douglas Mitchell
        </p>
      </div>
    </div>
  );
}
