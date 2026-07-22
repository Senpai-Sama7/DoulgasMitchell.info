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
  /** Scroll distance (px) the scene stays pinned. Clamped to 1200–1800. */
  distance?: number;
  /** Scrub smoothing in seconds (true = hard-linked to scroll). */
  scrub?: number | boolean;
  /** ScrollTrigger start position. */
  start?: string;
  /** Values that should rebuild the scene when they change. */
  dependencies?: unknown[];
  /**
   * Called instead of `build` when pinning is disabled (reduced motion, touch,
   * low motion tier). Use it to put the scene into its resting/final state so
   * the section reads as normal static content.
   */
  onStatic?: (root: HTMLElement) => void;
}

const MIN_PIN_DISTANCE = 1200;
const MAX_PIN_DISTANCE = 1800;

/**
 * Pinned, scrubbed scene helper. Attach the returned ref to a section, then
 * build the timeline in `build` — only transform/opacity/clip-path/filter,
 * never layout properties.
 *
 * const ref = usePinnedScene<HTMLElement>(({ timeline, root }) => {
 *   timeline.fromTo('.panel', { yPercent: 20, opacity: 0 }, { yPercent: 0, opacity: 1 });
 * }, { distance: 1400, onStatic: (root) => gsap.set(root.querySelectorAll('.panel'), { opacity: 1 }) });
 *
 * gsap.matchMedia gates the pin: reduced-motion or coarse-pointer contexts and
 * non-`high` motion tiers get no pin and no scrub — just `onStatic`. Cleanup
 * (including on media-query flips) is handled by matchMedia + useGSAP.
 */
export function usePinnedScene<T extends HTMLElement = HTMLDivElement>(
  build: (scene: PinnedSceneContext) => void,
  options: UsePinnedSceneOptions = {}
): RefObject<T | null> {
  const rootRef = useRef<T>(null);
  const { distance = 1500, scrub = 1, start = 'top top', dependencies = [], onStatic } = options;

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
