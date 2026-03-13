import { describe, expect, it } from 'vitest';
import {
  buildBeliefState,
  buildConfidenceSummary,
  buildDecisionRecommendation,
  buildForecastIntelligence,
  computeNormalizedEntropy,
} from '@/lib/decision-intelligence';

describe('decision intelligence helpers', () => {
  it('computes normalized entropy for competing weights', () => {
    const entropy = computeNormalizedEntropy([10, 10, 10]);

    expect(entropy).toBeGreaterThan(0.9);
  });

  it('builds a stronger confidence summary for a dominant score', () => {
    const summary = buildConfidenceSummary([42, 10, 3], {
      baseAleatoric: 0.1,
    });

    expect(summary.confidence).toBeGreaterThan(0.7);
    expect(summary.confidenceLabel).toBe('high');
  });

  it('returns defer when confidence is below the defer threshold', () => {
    const decision = buildDecisionRecommendation(
      0.2,
      {
        conditionalThreshold: 0.6,
        deferThreshold: 0.35,
      },
      {
        missingInformation: ['Need a narrower title match.'],
      }
    );

    expect(decision.action).toBe('defer');
    expect(decision.requiredEvidence[0]).toMatch(/narrower title/i);
  });

  it('builds a posterior belief state with bounded intervals', () => {
    const belief = buildBeliefState(12, 88);

    expect(belief.mean).toBeGreaterThan(0);
    expect(belief.upperBound).toBeLessThan(1);
    expect(belief.lowerBound).toBeGreaterThanOrEqual(0);
  });

  it('produces a forecast bundle with calibration data', () => {
    const forecast = buildForecastIntelligence(
      [
        { date: '2026-03-01', value: 10 },
        { date: '2026-03-02', value: 11 },
        { date: '2026-03-03', value: 12 },
        { date: '2026-03-04', value: 11 },
        { date: '2026-03-05', value: 13 },
        { date: '2026-03-06', value: 14 },
        { date: '2026-03-07', value: 15 },
        { date: '2026-03-08', value: 16 },
      ],
      {
        horizonDays: 3,
        targetCoverage: 0.8,
      }
    );

    expect(forecast.forecast?.expectedTotal).toBeGreaterThan(0);
    expect(forecast.calibration?.sampleSize).toBeGreaterThan(0);
    expect(forecast.points.some((point) => point.projected)).toBe(true);
  });
});
