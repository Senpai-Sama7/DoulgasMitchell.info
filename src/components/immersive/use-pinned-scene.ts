'use client';

import { useRef, type RefObject } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '@/lib/gsap';
import { detectMotionTier, shouldEnablePinnedScenes } from '@/lib/motion-tier';

export interface PinnedSceneContext {
  /** Scrub timeline already wired to a pinned ScrollTrigger. Add tweens to it. */
  timeline: gsap.core.Timeline;
  /** The pinned root element. */
  root: HTMLElement;
}

export interface UsePinnedSceneOptions {
  /** Scroll distance (px) the scene stays pinned. Clamped to 1200–2800. */
  distance?: number;
  /** Scrub smoothing in seconds (true = hard-linked to scroll). */
  scrub?: number | boolean;
  /** ScrollTrigger start position. */
  start?: string;
  /** Values that should rebuild the scene when they change. */
  dependencies?: unknown[];
  /**
   * Called when no scrub of any kind runs (reduced motion, or a
   * non-pinnable context with no `onSoft` provided). Use it to put the
   * scene into its resting/final state so the section reads as normal
   * static content.
   */
  onStatic?: (root: HTMLElement) => void;
  /**
   * Soft-scrub builder for contexts that cannot pin (touch pointers, low
   * motion tier) but still allow motion. The hook builds an UNPINNED
   * ScrollTrigger timeline spanning the section's pass through the viewport
   * (`top 85%` → `bottom 15%`, scrub 1.2) and marks the root with
   * `data-motion="soft"` so CSS can adapt. Choreograph a compressed version
   * of the pinned story here — the section animates as the user scrolls
   * through it instead of sitting static.
   */
  onSoft?: (scene: PinnedSceneContext) => void;
}

const MIN_PIN_DISTANCE = 1200;
/** Long-form scroll stories (Cinema) legitimately need up to ~2800px. */
const MAX_PIN_DISTANCE = 2800;

/**
 * Pinned, scrubbed scene helper. Attach the returned ref to a section, then
 * build the timeline in `build` — only transform/opacity/clip-path/filter,
 * never layout properties.
 *
 * const ref = usePinnedScene<HTMLElement>(({ timeline, root }) => {
 *   timeline.fromTo('.panel', { yPercent: 20, opacity: 0 }, { yPercent: 0, opacity: 1 });
 * }, { distance: 1400, onStatic: (root) => gsap.set(root.querySelectorAll('.panel'), { opacity: 1 }) });
 *
 * gsap.matchMedia gates the experience into three tiers:
 *  - pin + scrub (`build`): fine pointer, no reduced-motion, `high` tier —
 *    unchanged from before.
 *  - soft scrub (`onSoft`): motion is allowed but pinning is not (coarse
 *    pointer / low tier). No pin, no layout trap — just a scrubbed timeline
 *    riding the section through the viewport. Sections opt in per scene;
 *    without `onSoft` they fall back to `onStatic`.
 *  - static (`onStatic`): reduced motion always lands here.
 *
 * Cleanup (including on media-query flips) is handled by matchMedia + useGSAP.
 */
export function usePinnedScene<T extends HTMLElement = HTMLDivElement>(
  build: (scene: PinnedSceneContext) => void,
  options: UsePinnedSceneOptions = {}
): RefObject<T | null> {
  const rootRef = useRef<T>(null);
  const {
    distance = 1500,
    scrub = 1,
    start = 'top top',
    dependencies = [],
    onStatic,
    onSoft,
  } = options;

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const pinDistance = Math.round(
        Math.min(MAX_PIN_DISTANCE, Math.max(MIN_PIN_DISTANCE, distance))
      );

      const mm = gsap.matchMedia();

      mm.add(
        {
          motionOk: '(prefers-reduced-motion: no-preference)',
          reduced: '(prefers-reduced-motion: reduce)',
          finePointer: '(pointer: fine)',
        },
        (context) => {
          const { motionOk = false, finePointer = false } = context.conditions ?? {};
          const pinningAllowed =
            motionOk && finePointer && shouldEnablePinnedScenes(detectMotionTier());

          if (!pinningAllowed) {
            // Soft path: motion is fine, pinning is not (touch / low tier).
            // Scrub a compressed choreography while the section passes
            // through the viewport — no pin, no layout re-flow.
            if (motionOk && onSoft) {
              root.dataset.motion = 'soft';
              const timeline = gsap.timeline({
                defaults: { ease: 'none' },
                scrollTrigger: {
                  trigger: root,
                  start: 'top 85%',
                  end: 'bottom 15%',
                  scrub: 1.2,
                  invalidateOnRefresh: true,
                },
              });
              onSoft({ timeline, root });
              return;
            }

            onStatic?.(root);
            return;
          }

          const timeline = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: root,
              start,
              end: `+=${pinDistance}`,
              pin: true,
              scrub,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          build({ timeline, root });
        }
      );

      return () => mm.revert();
    },
    { scope: rootRef, dependencies }
  );

  return rootRef;
}
