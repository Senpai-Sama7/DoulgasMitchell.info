'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useFilmPlayback } from '@/components/immersive/use-film-playback';
import { easings, gsap } from '@/lib/gsap';
import { mediaManifest } from '@/lib/media-manifest';

const ENTRANCE_KEY = 'dm-video-entrance-v1';

/** How long the progress hairline holds before the shutter (seconds). */
const HOLD_SECONDS = 1.2;

/** Brand wordmark — one masked line per word, staggered rise. */
const TITLE_LINES = ['Douglas', 'Mitchell'] as const;

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
 * Cinematic multi-beat gate — the one-shot prelude on first visit per session.
 * Six beats over ~4.5s plus a two-stage shutter exit (skippable at any point):
 *
 *  I    Ink hold. A signal-teal sight hairline blooms across dead center and
 *       the prelude slate stamps beneath it — № 00 · Prelude.
 *  II   The hairline becomes the film: the same center line widens into a
 *       letterbox slit that opens to full bleed while the loop scales down
 *       into it. Grain + scanlines settle, mono reel metadata stamps the
 *       corners, and on fine pointers the film drifts with the cursor.
 *  III  Masked wordmark cascade — Douglas, then Mitchell, each rising through
 *       its own overflow mask, the second line offset and italic.
 *  IV   The claim wipes on left-to-right through a clip-path:
 *       "Decision systems under uncertainty."
 *  V    The progress hairline fills while the reel counter reads 00.
 *  VI   Exit — the counter rolls 00 → 01, content lifts, and the panel
 *       collapses in two stages: first to a wide letterbox band (the live
 *       page is mask-revealed above and below for a breath), then the band
 *       snaps shut, twin teal hairlines riding both closing edges.
 *
 * Scroll is locked while the gate is up. Skipped entirely on reduced motion
 * and on revisits within the session (`dm-video-entrance-v1`); the session
 * key is only written once the exit completes, so a mid-animation re-render
 * can never strand a half-open gate. Escape and the Skip button both jump
 * straight to the shutter.
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
  // In-view autoplay with iOS muted/playsinline re-assertion — keeps the gate
  // film rolling even where plain autoPlay markup is refused.
  const { videoRef } = useFilmPlayback({ threshold: 0 });

  const active = shouldPlay && !done && prefersReducedMotion !== true;

  /** Jump straight to the shutter exit — shared by the Skip button and Escape. */
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

    let removeDrift: (() => void) | undefined;

    const ctx = gsap.context(() => {
      // Fine pointers only: the film plane drifts a hair with the cursor so
      // the gate feels inhabited rather than played back.
      if (window.matchMedia('(pointer: fine)').matches) {
        const drift = rootRef.current?.querySelector<HTMLElement>('.video-entrance-drift');
        if (drift) {
          const driftX = gsap.quickTo(drift, 'xPercent', { duration: 1.2, ease: 'power3.out' });
          const driftY = gsap.quickTo(drift, 'yPercent', { duration: 1.2, ease: 'power3.out' });
          const onPointerMove = (event: PointerEvent) => {
            driftX((event.clientX / window.innerWidth - 0.5) * 2.2);
            driftY((event.clientY / window.innerHeight - 0.5) * 1.6);
          };
          window.addEventListener('pointermove', onPointerMove, { passive: true });
          removeDrift = () => window.removeEventListener('pointermove', onPointerMove);
        }
      }

      const tl = gsap.timeline({
        defaults: { ease: easings.expo },
        onComplete: () => {
          window.sessionStorage.setItem(ENTRANCE_KEY, '1');
          document.documentElement.style.overflow = previousOverflow;
          setDone(true);
        },
      });
      timelineRef.current = tl;

      // ── Beat I — ink hold: the sight hairline blooms, the slate stamps ──
      tl.fromTo(
        '.video-entrance-sight',
        { scaleX: 0, autoAlpha: 1 },
        { scaleX: 1, duration: 0.7, ease: easings.power4 },
        0
      ).fromTo(
        '.video-entrance-prelude',
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        0.3
      );

      // ── Beat II — the hairline becomes the film: slit opens to full bleed ─
      tl.to(
        '.video-entrance-sight',
        { autoAlpha: 0, duration: 0.35, ease: 'power1.out' },
        1.0
      )
        .fromTo(
          '.video-entrance-film',
          { clipPath: 'inset(49.7% 0% 49.7% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: easings.power4 },
          1.0
        )
        .fromTo(
          '.video-entrance-media',
          { autoAlpha: 0, scale: 1.32 },
          { autoAlpha: 1, scale: 1.06, duration: 1.8, ease: 'power2.out' },
          1.0
        )
        .fromTo(
          '.video-entrance-skip',
          { autoAlpha: 0, y: 8 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' },
          1.25
        )
        .fromTo(
          '.video-entrance-grain, .video-entrance-scan',
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.8, ease: 'power1.out' },
          1.4
        )
        .fromTo(
          '.video-entrance-meta',
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.6, ease: 'power2.out' },
          1.55
        )
        .to(
          '.video-entrance-prelude',
          { autoAlpha: 0, y: -16, duration: 0.45, ease: 'power2.in' },
          1.75
        );

      // ── Beat III — masked wordmark cascade: Douglas, then Mitchell ──────
      const titleLines = gsap.utils.toArray<HTMLElement>('.video-entrance-title-text');
      titleLines.forEach((line, index) => {
        tl.fromTo(
          line,
          { yPercent: 116 },
          { yPercent: 0, duration: 0.95, ease: easings.power4 },
          2.0 + index * 0.18
        );
      });

      // ── Beat IV — the claim wipes on through a clip-path ────────────────
      tl.fromTo(
        '.video-entrance-claim',
        { autoAlpha: 1, clipPath: 'inset(-10% 102% -14% 0%)' },
        { clipPath: 'inset(-10% 0% -14% 0%)', duration: 0.8, ease: easings.power4 },
        2.7
      )
        // ── Beat V — progress hairline fills, reel counter reads 00 ───────
        .fromTo(
          '.video-entrance-progress-row',
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.45, ease: 'power2.out' },
          3.05
        )
        .fromTo(
          '.video-entrance-progress-fill',
          { scaleX: 0 },
          { scaleX: 1, duration: HOLD_SECONDS, ease: 'none' },
          3.2
        )
        .addLabel('exit', '>')
        // ── Beat VI — counter rolls 00 → 01, two-stage letterbox shutter ──
        .to(
          '.video-entrance-counter-track',
          { yPercent: -50, duration: 0.45, ease: easings.power4 },
          'exit'
        )
        .to(
          '.video-entrance-content, .video-entrance-meta, .video-entrance-skip',
          { autoAlpha: 0, y: -18, duration: 0.4, ease: 'power2.in' },
          'exit+=0.22'
        )
        .to(
          '.video-entrance-media',
          { scale: 1.2, duration: 1.3, ease: easings.power4 },
          'exit+=0.28'
        )
        .set('.video-entrance-edge', { autoAlpha: 1 }, 'exit+=0.28')
        // Stage 1 — collapse to a wide letterbox band; the live page is
        // mask-revealed above and below while the band holds for a breath.
        .to(
          '.video-entrance-panel',
          { clipPath: 'inset(34% 0% 34% 0%)', duration: 0.7, ease: 'power3.inOut' },
          'exit+=0.3'
        )
        .to(
          '.video-entrance-edge-top',
          { y: () => window.innerHeight * 0.34, duration: 0.7, ease: 'power3.inOut' },
          'exit+=0.3'
        )
        .to(
          '.video-entrance-edge-bottom',
          { y: () => window.innerHeight * -0.34, duration: 0.7, ease: 'power3.inOut' },
          'exit+=0.3'
        )
        // Stage 2 — the band snaps shut, hairlines converging on center.
        .to(
          '.video-entrance-panel',
          { clipPath: 'inset(50.05% 0% 50.05% 0%)', duration: 0.5, ease: 'power3.in' },
          'exit+=1.22'
        )
        .to(
          '.video-entrance-edge-top',
          { y: () => window.innerHeight * 0.5005, duration: 0.5, ease: 'power3.in' },
          'exit+=1.22'
        )
        .to(
          '.video-entrance-edge-bottom',
          { y: () => window.innerHeight * -0.5005, duration: 0.5, ease: 'power3.in' },
          'exit+=1.22'
        )
        .to(
          '.video-entrance-panel',
          { autoAlpha: 0, duration: 0.18, ease: 'power1.out' },
          'exit+=1.7'
        )
        .to(
          '.video-entrance-edge',
          { autoAlpha: 0, duration: 0.25, ease: 'power1.out' },
          'exit+=1.72'
        );
    }, rootRef);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      removeDrift?.();
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
        {/* Beat II host — the letterbox slit that opens to full bleed */}
        <div className="video-entrance-film" style={{ clipPath: 'inset(49.7% 0% 49.7% 0%)' }}>
          <div className="video-entrance-drift">
            <video
              ref={videoRef}
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
          </div>
          <div className="video-entrance-scrim" />
          <div className="video-entrance-grain opacity-0" />
          <div className="video-entrance-scan opacity-0" />
        </div>

        {/* Beat I — the sight hairline the film opens out of */}
        <span className="video-entrance-sight" />

        {/* Beats I / III–V — slate, wordmark cascade, claim, progress */}
        <div className="video-entrance-content">
          <p className="video-entrance-prelude opacity-0">
            <span className="video-entrance-prelude-no">№ 00</span>
            <span>Prelude</span>
          </p>

          <p className="video-entrance-title">
            {TITLE_LINES.map((line, index) => (
              <span key={line} className="video-entrance-title-line" data-line={index}>
                <span className="video-entrance-title-text font-display">{line}</span>
              </span>
            ))}
          </p>

          <p className="video-entrance-claim opacity-0">
            Decision systems under uncertainty.
          </p>

          <span className="video-entrance-progress-row opacity-0">
            <span className="video-entrance-counter">
              <span className="video-entrance-counter-track">
                <span>00</span>
                <span>01</span>
              </span>
            </span>
            <span className="video-entrance-progress">
              <span className="video-entrance-progress-fill" />
            </span>
            <span className="video-entrance-counter-total">01</span>
          </span>
        </div>

        {/* Reel metadata — mono corner stamps */}
        <div className="video-entrance-meta opacity-0">
          <span className="video-entrance-meta-tl">DM — Reel 00</span>
          <span className="video-entrance-meta-tr">Field print · 2026</span>
          <span className="video-entrance-meta-bl">29°45′ N · 95°22′ W — HOU</span>
        </div>
      </div>

      {/* Twin teal hairlines riding the letterbox shutter edges */}
      <span className="video-entrance-edge video-entrance-edge-top" aria-hidden />
      <span className="video-entrance-edge video-entrance-edge-bottom" aria-hidden />

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
