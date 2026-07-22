import { describe, expect, it } from 'vitest';
import {
  detectMotionTier,
  getLenisOptions,
  getMotionTierServerSnapshot,
  getMotionTierSnapshot,
  shouldEnableLenis,
  shouldEnablePinnedScenes,
  shouldEnableWebGL,
} from '@/lib/motion-tier';

describe('motion-tier', () => {
  it('returns low on server snapshot', () => {
    expect(getMotionTierServerSnapshot()).toBe('low');
  });

  it('exposes client snapshot via detectMotionTier in jsdom', () => {
    const tier = getMotionTierSnapshot();
    expect(['high', 'low', 'reduced']).toContain(tier);
    expect(tier).toBe(detectMotionTier());
  });

  it('gates WebGL and pinned scenes to high tier only', () => {
    expect(shouldEnableWebGL('high')).toBe(true);
    expect(shouldEnableWebGL('low')).toBe(false);
    expect(shouldEnableWebGL('reduced')).toBe(false);
    expect(shouldEnablePinnedScenes('high')).toBe(true);
    expect(shouldEnablePinnedScenes('low')).toBe(false);
    expect(shouldEnablePinnedScenes('reduced')).toBe(false);
  });

  it('enables Lenis on high and low tiers, never reduced', () => {
    expect(shouldEnableLenis('high')).toBe(true);
    expect(shouldEnableLenis('low')).toBe(true);
    expect(shouldEnableLenis('reduced')).toBe(false);
    expect(getLenisOptions('high')?.duration).toBe(1.2);
    expect(getLenisOptions('low')?.duration).toBeLessThan(1.2);
    expect(getLenisOptions('reduced')).toBeNull();
  });
});
