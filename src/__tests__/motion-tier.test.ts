import { describe, expect, it } from 'vitest';
import {
  detectMotionTier,
  getMotionTierServerSnapshot,
  getMotionTierSnapshot,
  shouldEnableLenis,
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

  it('gates premium features to high tier only', () => {
    expect(shouldEnableWebGL('high')).toBe(true);
    expect(shouldEnableWebGL('low')).toBe(false);
    expect(shouldEnableWebGL('reduced')).toBe(false);
    expect(shouldEnableLenis('high')).toBe(true);
    expect(shouldEnableLenis('low')).toBe(false);
  });
});
