/**
 * Central GSAP setup for the immersive layer.
 *
 * Always import `gsap` / `ScrollTrigger` from this module (never from 'gsap'
 * directly) so plugin registration happens exactly once, on the client only.
 * `ImmersiveRoot` owns the Lenis <-> ScrollTrigger sync; components should
 * only create tweens/timelines/triggers (ideally via `usePinnedScene` or
 * `useGSAP` scoped contexts) and let that sync drive them.
 */
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const isClient = typeof window !== 'undefined';

if (isClient) {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
}

/**
 * Signature cubic — cubic-bezier(0.22, 1, 0.36, 1), the same curve used by the
 * framer-motion transitions across the site, so GSAP and framer-motion moments
 * feel like one hand. Falls back to a named ease during SSR type evaluation.
 */
const signatureCubic: gsap.EaseFunction | string = isClient
  ? CustomEase.create('immersive-cubic', '0.22, 1, 0.36, 1')
  : 'power3.out';

/**
 * House easing map. Use these instead of ad-hoc strings so motion stays
 * consistent:
 * - `expo`   — fast attack, long luxurious settle. Hero/arrival moments.
 * - `power4` — strong but slightly softer than expo. Panels, cards, reveals.
 * - `cubic`  — the signature cubic-bezier(0.22, 1, 0.36, 1). Micro-interactions
 *              and anything that must match framer-motion transitions.
 */
export const easings = {
  expo: 'expo.out',
  power4: 'power4.out',
  cubic: signatureCubic,
} as const;

/**
 * Expo-like curve for Lenis smooth scrolling (canonical Lenis recipe).
 * Kept here so the scroll feel and tween easings live in one place.
 */
export function lenisEasing(t: number): number {
  return Math.min(1, 1.001 - Math.pow(2, -10 * t));
}

export { gsap, ScrollTrigger };
