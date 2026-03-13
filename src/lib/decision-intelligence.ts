export type DecisionAction = 'proceed' | 'conditional' | 'defer' | 'refuse';

export interface ConfidenceSummary {
  confidence: number;
  confidenceLabel: 'high' | 'moderate' | 'low';
  epistemic: number;
  aleatoric: number;
  semanticEntropy: number;
  calibrationStatus: 'heuristic' | 'benchmarking' | 'not-evaluated';
  drivers: string[];
}

export interface DecisionRecommendation {
  action: DecisionAction;
  label: string;
  rationale: string;
  requiredEvidence: string[];
}

export interface ForecastPoint {
  date: string;
  actual: number | null;
  prediction: number;
  lowerBound: number;
  upperBound: number;
  projected: boolean;
}

export interface ForecastSummary {
  horizonDays: number;
  expectedTotal: number;
  lowerBound: number;
  upperBound: number;
  averagePerDay: number;
  trendDelta: number;
  confidence: number;
}

export interface CalibrationSummary {
  status: 'healthy' | 'watch' | 'drift';
  coverage: number;
  targetCoverage: number;
  sharpness: number;
  ece: number;
  mae: number;
  sampleSize: number;
  note: string;
}

export interface BeliefState {
  alpha: number;
  beta: number;
  mean: number;
  variance: number;
  lowerBound: number;
  upperBound: number;
  observations: number;
}

export interface CausalExperimentRecommendation {
  title: string;
  intervention: string;
  estimand: string;
  primaryMetric: string;
  guardrailMetric: string;
  whyNow: string;
}

export interface BenchmarkSummary {
  sampleSize: number;
  accuracy: number;
  meanConfidence: number;
  ece: number;
  deferralRate: number;
}

interface ConfidenceOptions {
  baseAleatoric?: number;
  calibrationStatus?: ConfidenceSummary['calibrationStatus'];
  drivers?: string[];
  maxScore?: number;
}

interface ForecastOptions {
  horizonDays?: number;
  targetCoverage?: number;
}

interface DecisionThresholds {
  conditionalThreshold: number;
  deferThreshold: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function mean(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value: number, places = 3) {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function quantile(values: number[], probability: number) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const index = clamp((sorted.length - 1) * probability, 0, sorted.length - 1);
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);

  if (lowerIndex === upperIndex) {
    return sorted[lowerIndex];
  }

  const weight = index - lowerIndex;
  return sorted[lowerIndex] * (1 - weight) + sorted[upperIndex] * weight;
}

function computeBucketedCalibrationError(
  samples: Array<{ confidence: number; correct: boolean }>
) {
  if (samples.length === 0) {
    return 0;
  }

  const buckets = new Map<number, Array<{ confidence: number; correct: boolean }>>();

  for (const sample of samples) {
    const bucket = Math.min(4, Math.floor(sample.confidence * 5));
    const current = buckets.get(bucket) ?? [];
    current.push(sample);
    buckets.set(bucket, current);
  }

  let error = 0;

  for (const bucketSamples of buckets.values()) {
    const avgConfidence = mean(bucketSamples.map((sample) => sample.confidence));
    const accuracy =
      bucketSamples.filter((sample) => sample.correct).length / bucketSamples.length;
    error += Math.abs(avgConfidence - accuracy) * (bucketSamples.length / samples.length);
  }

  return round(error, 4);
}

export function formatPercent(value: number, fractionDigits = 0) {
  return `${(value * 100).toFixed(fractionDigits)}%`;
}

export function getConfidenceLabel(confidence: number): ConfidenceSummary['confidenceLabel'] {
  if (confidence >= 0.75) {
    return 'high';
  }

  if (confidence >= 0.45) {
    return 'moderate';
  }

  return 'low';
}

export function computeNormalizedEntropy(weights: number[]) {
  const positive = weights.filter((weight) => weight > 0);

  if (positive.length <= 1) {
    return 0;
  }

  const total = positive.reduce((sum, weight) => sum + weight, 0);
  if (total <= 0) {
    return 0;
  }

  const entropy = positive.reduce((sum, weight) => {
    const probability = weight / total;
    return sum - probability * Math.log2(probability);
  }, 0);

  return round(clamp(entropy / Math.log2(positive.length), 0, 1), 4);
}

export function buildConfidenceSummary(
  scores: number[],
  options: ConfidenceOptions = {}
): ConfidenceSummary {
  const positiveScores = scores.filter((score) => score > 0).sort((left, right) => right - left);
  const topScore = positiveScores[0] ?? 0;
  const secondScore = positiveScores[1] ?? 0;
  const maxScore = options.maxScore ?? 40;
  const strength = clamp(topScore / maxScore, 0, 1);
  const margin = topScore > 0 ? clamp((topScore - secondScore) / topScore, 0, 1) : 0;
  const semanticEntropy = computeNormalizedEntropy(positiveScores.slice(0, 5));
  const aleatoric = clamp(
    (options.baseAleatoric ?? 0.12) +
      (positiveScores.length > 3 ? 0.04 : 0) +
      (topScore < 12 ? 0.08 : 0),
    0.05,
    0.6
  );
  const epistemic = clamp(
    0.72 - strength * 0.38 - margin * 0.18 + semanticEntropy * 0.42,
    0.05,
    0.95
  );
  const confidence = clamp(
    0.12 + strength * 0.45 + margin * 0.25 + (1 - semanticEntropy) * 0.18 - aleatoric * 0.1,
    0.05,
    0.98
  );

  const drivers = [
    topScore < 12 ? 'Weak evidence match in the archive.' : 'Strong evidence match in the archive.',
    margin < 0.2
      ? 'Top candidates are close together, so retrieval ambiguity is elevated.'
      : 'The leading match is clearly ahead of alternatives.',
    semanticEntropy > 0.5
      ? 'Several plausible interpretations are competing.'
      : 'Candidate interpretations are tightly clustered.',
    ...(options.drivers ?? []),
  ];

  return {
    confidence: round(confidence, 3),
    confidenceLabel: getConfidenceLabel(confidence),
    epistemic: round(epistemic, 3),
    aleatoric: round(aleatoric, 3),
    semanticEntropy,
    calibrationStatus: options.calibrationStatus ?? 'heuristic',
    drivers,
  };
}

export function buildDecisionRecommendation(
  confidence: number,
  thresholds: DecisionThresholds,
  options: {
    refusal?: boolean;
    missingInformation?: string[];
    rationale?: string;
  } = {}
): DecisionRecommendation {
  const requiredEvidence = options.missingInformation ?? [];

  if (options.refusal) {
    return {
      action: 'refuse',
      label: 'Refuse',
      rationale:
        options.rationale ??
        'The request falls outside the public portfolio surface or asks for sensitive information.',
      requiredEvidence,
    };
  }

  if (confidence < thresholds.deferThreshold) {
    return {
      action: 'defer',
      label: 'Defer to human',
      rationale:
        options.rationale ??
        'Evidence quality is too weak to answer cleanly without risking a hallucinated or misleading response.',
      requiredEvidence,
    };
  }

  if (confidence < thresholds.conditionalThreshold) {
    return {
      action: 'conditional',
      label: 'Conditional proceed',
      rationale:
        options.rationale ??
        'There is enough signal to answer, but some ambiguity remains and should be stated explicitly.',
      requiredEvidence,
    };
  }

  return {
    action: 'proceed',
    label: 'Proceed with confidence',
    rationale:
      options.rationale ??
      'Evidence quality is strong enough to answer directly while staying inside the public knowledge boundary.',
    requiredEvidence,
  };
}

function buildMovingAveragePredictions(values: number[], horizonDays: number, window: number) {
  const history = [...values];
  const predictions: number[] = [];

  for (let step = 0; step < horizonDays; step += 1) {
    const lookback = history.slice(-window);
    const prediction = mean(lookback);
    predictions.push(prediction);
    history.push(prediction);
  }

  return predictions;
}

export function buildForecastIntelligence(
  series: Array<{ date: string; value: number }>,
  options: ForecastOptions = {}
) {
  const sortedSeries = [...series].sort((left, right) => left.date.localeCompare(right.date));
  const values = sortedSeries.map((point) => Math.max(point.value, 0));
  const horizonDays = options.horizonDays ?? 7;
  const targetCoverage = options.targetCoverage ?? 0.8;

  if (values.length === 0) {
    return {
      forecast: null,
      calibration: null,
      points: [] as ForecastPoint[],
    };
  }

  const window = clamp(Math.min(7, values.length), 3, 7);
  const residuals: Array<{ predicted: number; actual: number; absoluteError: number }> = [];

  for (let index = window; index < values.length; index += 1) {
    const predicted = mean(values.slice(index - window, index));
    const actual = values[index];
    residuals.push({
      predicted,
      actual,
      absoluteError: Math.abs(actual - predicted),
    });
  }

  const q =
    residuals.length > 0
      ? quantile(
          residuals.map((residual) => residual.absoluteError),
          targetCoverage
        )
      : Math.max(1, mean(values) * 0.18);
  const coverage =
    residuals.length > 0
      ? residuals.filter((residual) => residual.absoluteError <= q).length / residuals.length
      : targetCoverage;
  const samples = residuals.map((residual) => ({
    confidence: clamp(1 - q / Math.max(residual.predicted, 1), 0.05, 0.95),
    correct: residual.absoluteError <= q,
  }));
  const calibration: CalibrationSummary = {
    status:
      coverage >= targetCoverage - 0.05
        ? 'healthy'
        : coverage >= targetCoverage - 0.12
          ? 'watch'
          : 'drift',
    coverage: round(coverage, 3),
    targetCoverage: round(targetCoverage, 3),
    sharpness: round(q * 2, 3),
    ece: computeBucketedCalibrationError(samples),
    mae: round(mean(residuals.map((residual) => residual.absoluteError)), 3),
    sampleSize: residuals.length,
    note:
      residuals.length > 0
        ? 'Coverage is estimated with a walk-forward moving-average baseline.'
        : 'Not enough history for walk-forward calibration. Using heuristic fallback intervals.',
  };

  const forecastValues = buildMovingAveragePredictions(values, horizonDays, window);
  const recentWindow = values.slice(-window);
  const previousWindow =
    values.length >= window * 2 ? values.slice(-(window * 2), -window) : recentWindow;
  const recentAverage = mean(recentWindow);
  const previousAverage = Math.max(mean(previousWindow), 1);
  const trendDelta = clamp((recentAverage - previousAverage) / previousAverage, -1, 1);
  const averagePerDay = mean(forecastValues);
  const expectedTotal = forecastValues.reduce((sum, value) => sum + value, 0);
  const forecastConfidence = clamp(
    coverage - Math.max(0, calibration.ece - 0.08) * 0.5,
    0.1,
    0.95
  );

  const historicalPoints: ForecastPoint[] = sortedSeries.map((point) => ({
    date: point.date,
    actual: point.value,
    prediction: point.value,
    lowerBound: point.value,
    upperBound: point.value,
    projected: false,
  }));

  const forecastPoints: ForecastPoint[] = forecastValues.map((prediction, index) => {
    const sourceDate = new Date(sortedSeries[sortedSeries.length - 1].date);
    sourceDate.setDate(sourceDate.getDate() + index + 1);
    const date = sourceDate.toISOString().slice(0, 10);

    return {
      date,
      actual: null,
      prediction: round(prediction, 3),
      lowerBound: round(Math.max(0, prediction - q), 3),
      upperBound: round(prediction + q, 3),
      projected: true,
    };
  });

  const forecast: ForecastSummary = {
    horizonDays,
    expectedTotal: Math.round(expectedTotal),
    lowerBound: Math.max(0, Math.round(forecastPoints.reduce((sum, point) => sum + point.lowerBound, 0))),
    upperBound: Math.round(forecastPoints.reduce((sum, point) => sum + point.upperBound, 0)),
    averagePerDay: round(averagePerDay, 2),
    trendDelta: round(trendDelta, 3),
    confidence: round(forecastConfidence, 3),
  };

  return {
    forecast,
    calibration,
    points: [...historicalPoints, ...forecastPoints],
  };
}

export function buildBeliefState(
  successes: number,
  failures: number,
  alpha = 1,
  beta = 1
): BeliefState {
  const posteriorAlpha = alpha + Math.max(0, successes);
  const posteriorBeta = beta + Math.max(0, failures);
  const meanValue = posteriorAlpha / (posteriorAlpha + posteriorBeta);
  const variance =
    (posteriorAlpha * posteriorBeta) /
    (((posteriorAlpha + posteriorBeta) ** 2) * (posteriorAlpha + posteriorBeta + 1));
  const margin = 1.64 * Math.sqrt(variance);

  return {
    alpha: posteriorAlpha,
    beta: posteriorBeta,
    mean: round(meanValue, 5),
    variance: round(variance, 6),
    lowerBound: round(clamp(meanValue - margin, 0, 1), 5),
    upperBound: round(clamp(meanValue + margin, 0, 1), 5),
    observations: Math.max(0, successes) + Math.max(0, failures),
  };
}

export function buildCausalExperimentRecommendations(input: {
  topPaths: Array<{ path: string; views: number }>;
  contactRate: number;
  forecastConfidence: number;
  coverage: number;
}) {
  const topPaths = input.topPaths.slice(0, 3);
  const pathLabels = topPaths.map((item) => item.path);
  const recommendations: CausalExperimentRecommendation[] = [];

  recommendations.push({
    title: 'Hero CTA intervention',
    intervention: 'Test a stronger above-the-fold CTA on the homepage versus the current editorial CTA.',
    estimand:
      'Average treatment effect of a revised hero CTA on contact submission rate per session.',
    primaryMetric: 'Contact submissions / unique sessions',
    guardrailMetric: 'Bounce rate on / and writing depth on featured content',
    whyNow:
      pathLabels.includes('/')
        ? 'The homepage is already an acquisition surface, so even a modest uplift compounds quickly.'
        : 'The homepage needs a controlled test before assuming it is the strongest acquisition surface.',
  });

  if (pathLabels.some((path) => path.startsWith('/writing'))) {
    recommendations.push({
      title: 'Writing-to-contact bridge',
      intervention:
        'Introduce a contextual CTA block at the end of top writing pages and compare against the current generic footer CTA.',
      estimand:
        'Conditional average treatment effect of contextual writing CTAs on downstream contact intent.',
      primaryMetric: 'Contact submissions sourced from writing pages',
      guardrailMetric: 'Article completion depth and time on page',
      whyNow:
        'Writing pages are already pulling attention, which makes them a good candidate for a causal bridge into inquiries.',
    });
  }

  if (pathLabels.some((path) => path.startsWith('/work'))) {
    recommendations.push({
      title: 'Case-study proof framing',
      intervention:
        'Compare outcome-led project intros against architecture-led intros on top work pages.',
      estimand:
        'Average treatment effect of outcome-led proof framing on inquiry quality and conversion.',
      primaryMetric: 'Qualified contact submissions from /work/* pages',
      guardrailMetric: 'Scroll depth and GitHub / LinkedIn outbound clicks',
      whyNow:
        'Visitors are already inspecting project detail, so message framing is a testable bottleneck rather than a guess.',
    });
  }

  if (recommendations.length < 3) {
    recommendations.push({
      title: 'Assistant escalation prompt',
      intervention:
        'Test a clearer “what would reduce uncertainty” prompt inside the public assistant for low-confidence questions.',
      estimand:
        'Average treatment effect of an explicit clarification prompt on assisted conversion and abandonment.',
      primaryMetric: 'Follow-up question rate after low-confidence assistant replies',
      guardrailMetric: 'Refusal rate and user drop-off after assistant interaction',
      whyNow:
        input.forecastConfidence < 0.6 || input.coverage < 0.75
          ? 'Current uncertainty is high enough that better clarification behavior could raise trust without hallucinating.'
          : 'Even with acceptable coverage, assistant clarification is a low-risk place to improve guided conversion.',
    });
  }

  return recommendations.slice(0, 3);
}

export function buildBenchmarkSummary(samples: Array<{ confidence: number; correct: boolean; deferred: boolean }>): BenchmarkSummary {
  if (samples.length === 0) {
    return {
      sampleSize: 0,
      accuracy: 0,
      meanConfidence: 0,
      ece: 0,
      deferralRate: 0,
    };
  }

  const accuracy = samples.filter((sample) => sample.correct).length / samples.length;
  const meanConfidence = mean(samples.map((sample) => sample.confidence));
  const deferralRate = samples.filter((sample) => sample.deferred).length / samples.length;

  return {
    sampleSize: samples.length,
    accuracy: round(accuracy, 3),
    meanConfidence: round(meanConfidence, 3),
    ece: computeBucketedCalibrationError(samples),
    deferralRate: round(deferralRate, 3),
  };
}
