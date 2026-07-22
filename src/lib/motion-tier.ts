export type MotionTier = 'high' | 'low' | 'reduced';

const MOTION_TIER_MEDIA_QUERIES = [
  '(prefers-reduced-motion: reduce)',
  '(pointer: coarse)',
  '(max-width: 768px)',
  '(pointer: fine)',
] as const;

/** Subscribe to viewport / preference changes that affect motion tier. */
export function subscribeMotionTier(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const media = MOTION_TIER_MEDIA_QUERIES.map((query) => window.matchMedia(query));
  const handler = () => onStoreChange();

  for (const mq of media) {
    mq.addEventListener('change', handler);
  }

  return () => {
    for (const mq of media) {
      mq.removeEventListener('change', handler);
    }
  };
}

export function getMotionTierSnapshot(): MotionTier {
  return detectMotionTier();
}

export function getMotionTierServerSnapshot(): MotionTier {
  return 'low';
}

export function detectMotionTier(): MotionTier {
  if (typeof window === 'undefined') {
    return 'low';
  }

  const prefersReduced =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    return 'reduced';
  }

  const saveData = 'connection' in navigator &&
    (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
      ?.saveData;

  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const smallViewport = window.matchMedia('(max-width: 768px)').matches;
  const lowMemory =
    'deviceMemory' in navigator &&
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory !== undefined &&
    ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) < 4;
  const lowCores =
    typeof navigator.hardwareConcurrency === 'number' &&
    navigator.hardwareConcurrency <= 4;

  if (saveData || (coarsePointer && smallViewport) || lowMemory || lowCores) {
    return 'low';
  }

  return 'high';
}

/** WebGL scenes (hero signature scene) are expensive — high tier only. */
export function shouldEnableWebGL(tier: MotionTier): boolean {
  return tier === 'high';
}

/**
 * Lenis smooth scroll runs on `high` AND `low` tiers (with lighter settings on
 * `low` — see getLenisOptions). `reduced` always gets native scrolling: the
 * motion engine fails open for accessibility.
 */
export function shouldEnableLenis(tier: MotionTier): boolean {
  return tier === 'high' || tier === 'low';
}

export interface LenisTierOptions {
  /** Glide duration in seconds. */
  duration: number;
  smoothWheel: boolean;
}

/**
 * Tier-scaled Lenis settings. `high` gets the full 1.2s cinematic glide;
 * `low` gets a shorter, lighter glide so constrained devices stay responsive.
 * Returns null for `reduced` (native scroll, no Lenis instance at all).
 */
export function getLenisOptions(tier: MotionTier): LenisTierOptions | null {
  if (tier === 'high') {
    return { duration: 1.2, smoothWheel: true };
  }
  if (tier === 'low') {
    return { duration: 0.85, smoothWheel: true };
  }
  return null;
}

/**
 * Pinned/scrubbed ScrollTrigger scenes stay high-tier only, even though Lenis
 * now also runs on `low`: pinning re-layouts are the costly part.
 */
export function shouldEnablePinnedScenes(tier: MotionTier): boolean {
  return tier === 'high';
}

/** Custom dual-layer cursor: high tier + fine pointer only. */
export function shouldEnableCustomCursor(tier: MotionTier): boolean {
  return tier === 'high' && typeof window !== 'undefined' &&
    window.matchMedia('(pointer: fine)').matches;
}

/** @deprecated Use shouldEnableCustomCursor — kept for older call sites. */
export const shouldEnableMagneticCursor = shouldEnableCustomCursor;
