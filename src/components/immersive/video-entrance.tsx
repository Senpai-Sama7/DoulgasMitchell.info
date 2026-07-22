'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useReducedMotion } from 'framer-motion';
import { easings, gsap } from '@/lib/gsap';
import { mediaManifest } from '@/lib/media-manifest';

const ENTRANCE_KEY = 'dm-video-entrance-v1';

/** How long the brand mark holds over the film before the wipe (seconds). */
const HOLD_SECONDS = 2.4;

function subscribeEntrance(_onStoreChange: () => void) {
  return () => undefined;
}

function getEntranceSnapshot() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  return window.sessionStorage.getItem(ENTRANCE_KEY) !== '1';
}

function getEntranceServerSnapshot() {
  return false;
}

/**
 * Cinematic video gate — the one-shot prelude on first visit per session.
 *
 * A muted full-bleed film loop plays beneath a masked brand reveal (kicker,
 * wordmark, progress hairline), then a GSAP clip-path shutter wipes the whole
 * panel upward — a signal-teal hairline riding the wipe edge — to disclose the
 * live page underneath. Scroll is locked while the gate is up.
 *
 * Skipped entirely on reduced motion and on revisits within the session
 * (`dm-video-entrance-v1`). The session key is only written once the exit
 * completes, so a mid-animation re-render can never strand a half-open gate.
 */
export function VideoEntrance() {
  const prefersReducedMotion = useReducedMotion();
  const shouldPlay = useSyncExternalStore(
    subscribeEntrance,
    getEntranceSnapshot,
    getEntranceServerSnapshot
  );
  const [done, setDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const active = shouldPlay && !done && prefersReducedMotion !== true;

  /** Jump straight to the wipe exit — shared by the Skip button and Escape. */
  const handleSkip = useCallback(() => {
    const tl = timelineRef.current;
    if (!tl) return;
    const exitTime = tl.labels.exit;
    if (exitTime === undefined || tl.time() >= exitTime) return;
    tl.play('exit');
  }, []);

  useEffect(() => {
    if (!active) return;

    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleSkip();
    };
    window.addEventListener('keydown', onKeyDown);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: easings.expo },
        onComplete: () => {
          window.sessionStorage.setItem(ENTRANCE_KEY, '1');
          document.documentElement.style.overflow = previousOverflow;
          setDone(true);
        },
      });
      timelineRef.current = tl;

      // Arrival — the film breathes in from ink, then the brand mark unmasks.
      tl.fromTo(
        '.video-entrance-media',
        { autoAlpha: 0, scale: 1.08 },
        { autoAlpha: 1, scale: 1, duration: 1.6, ease: 'power2.out' },
        0
      )
        .fromTo(
          '.video-entrance-kicker',
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.7 },
          0.25
        )
        .fromTo(
          '.video-entrance-name',
          { autoAlpha: 0, yPercent: 112 },
          { autoAlpha: 1, yPercent: 0, duration: 1.05, ease: easings.power4 },
          0.4
        )
        .fromTo(
          '.video-entrance-progress',
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.5, ease: 'power2.out' },
          0.55
        )
        .fromTo(
          '.video-entrance-skip',
          { autoAlpha: 0, y: 8 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' },
          0.9
        )
        // Hold — the hairline fills linearly; when full, the gate opens.
        .fromTo(
          '.video-entrance-progress-fill',
          { scaleX: 0 },
          { scaleX: 1, duration: HOLD_SECONDS, ease: 'none' },
          0.55
        )
        .addLabel('exit', '>')
        // Exit — type lifts out, then the shutter wipes up with a teal edge
        // while the film scales into the mask for depth.
        .to(
          '.video-entrance-content, .video-entrance-skip',
          { autoAlpha: 0, y: -18, duration: 0.4, ease: 'power2.in' },
          'exit'
        )
        .set('.video-entrance-edge', { autoAlpha: 1 }, 'exit+=0.2')
        .to(
          '.video-entrance-media',
          { scale: 1.07, duration: 1.05, ease: easings.power4 },
          'exit+=0.2'
        )
        .to(
          '.video-entrance-panel',
          { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.05, ease: easings.power4 },
          'exit+=0.2'
        )
        .to(
          '.video-entrance-edge',
          { top: '0%', duration: 1.05, ease: easings.power4 },
          'exit+=0.2'
        )
        .to(
          '.video-entrance-edge',
          { autoAlpha: 0, duration: 0.18, ease: 'power1.out' },
          'exit+=1.1'
        );
    }, rootRef);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      timelineRef.current = null;
      ctx.revert();
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [active, handleSkip]);

  if (!active) return null;

  return (
    <div ref={rootRef} className="video-entrance no-print">
      <div
        className="video-entrance-panel"
        style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
        aria-hidden
      >
        <video
          className="video-entrance-media opacity-0"
          src={mediaManifest.hero.videoLoop}
          poster={mediaManifest.hero.videoPoster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          tabIndex={-1}
        />
        <div className="video-entrance-scrim" />
        <div className="video-entrance-content">
          <p className="video-entrance-kicker opacity-0">Chapter 00 · Prelude</p>
          <p className="video-entrance-line">
            <span className="video-entrance-name font-display opacity-0">
              Douglas Mitchell
            </span>
          </p>
          <span className="video-entrance-progress opacity-0">
            <span className="video-entrance-progress-fill" />
          </span>
        </div>
      </div>
      <span className="video-entrance-edge" aria-hidden />
      <button
        type="button"
        className="video-entrance-skip opacity-0"
        onClick={handleSkip}
        aria-label="Skip intro"
      >
        Skip
      </button>
    </div>
  );
}
