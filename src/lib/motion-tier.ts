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

export function shouldEnableWebGL(tier: MotionTier): boolean {
  return tier === 'high';
}

export function shouldEnableLenis(tier: MotionTier): boolean {
  return tier === 'high';
}

export function shouldEnableMagneticCursor(tier: MotionTier): boolean {
  return tier === 'high' && typeof window !== 'undefined' &&
    window.matchMedia('(pointer: fine)').matches;
}
