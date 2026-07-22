'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, RotateCcw } from 'lucide-react';
import { Magnetic } from '@/components/immersive';
import { ScrollReveal } from '@/components/immersive/scroll-reveal';
import {
  CalibrationGauge,
  ForecastStrip,
  UncertaintyRadar,
  type ForecastStripPoint,
  type UncertaintyAxis,
} from '@/components/site/decision-viz';
import {
  buildConfidenceSummary,
  buildDecisionRecommendation,
  buildForecastIntelligence,
  formatPercent,
  type CalibrationSummary,
  type ConfidenceSummary,
  type DecisionAction,
  type DecisionRecommendation,
  type ForecastSummary,
} from '@/lib/decision-intelligence';
import { methodGates, type MethodGate } from '@/lib/site-content';

type GateAnswer = 'pass' | 'fail' | null;

const THRESHOLDS = { conditionalThreshold: 0.75, deferThreshold: 0.45 };

/**
 * Gate weights encode asymmetric stakes: a failed error-cost gate should drag
 * the evidence pool harder than a failed complexity gate. Weights feed both
 * the primary evidence score (passes) and rival hypothesis strength (fails).
 */
const GATE_WEIGHTS: Record<string, number> = {
  complexity: 0.9,
  value: 0.85,
  bottlenecks: 1.1,
  'error-cost': 1.25,
};

const MAX_EVIDENCE = 40;

const ACTION_LAMPS: Array<{ action: DecisionAction; label: string }> = [
  { action: 'proceed', label: 'Proceed' },
  { action: 'conditional', label: 'Cond' },
  { action: 'defer', label: 'Defer' },
  { action: 'refuse', label: 'Refuse' },
];

interface GateState {
  gate: MethodGate;
  answer: GateAnswer;
  weight: number;
}

interface InstrumentReading {
  summary: ConfidenceSummary;
  recommendation: DecisionRecommendation;
  axes: UncertaintyAxis[];
  points: ForecastStripPoint[];
  forecast: ForecastSummary | null;
  calibration: CalibrationSummary | null;
  receipt: Array<{ key: string; value: string; state?: string }>;
  answered: number;
}

/** Deterministic PRNG so the SSR and client renders agree point-for-point. */
function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FORECAST_ANCHOR_UTC = Date.UTC(2026, 6, 1);
const DAY_MS = 86_400_000;

function pointLabel(index: number) {
  if (index < 20) return `T-${20 - index}`;
  if (index === 20) return 'NOW';
  return `+${index - 20}`;
}

/**
 * Maps the four gate readings into the decision-intelligence pipeline.
 *
 * Passes strengthen a single leading hypothesis ("ship the agentic path");
 * every failed gate spawns a rival hypothesis whose strength scales with the
 * gate's weight, and every unanswered gate leaves an open interpretation in
 * the pool. buildConfidenceSummary turns that pool into confidence plus the
 * epistemic / aleatoric / semantic-entropy decomposition, and
 * buildDecisionRecommendation applies the policy floors on top.
 */
function deriveReading(answers: Record<string, GateAnswer>): InstrumentReading {
  const gateStates: GateState[] = methodGates.map((gate) => ({
    gate,
    answer: answers[gate.id] ?? null,
    weight: GATE_WEIGHTS[gate.id] ?? 1,
  }));

  const passes = gateStates.filter((state) => state.answer === 'pass');
  const fails = gateStates.filter((state) => state.answer === 'fail');
  const open = gateStates.filter((state) => state.answer === null);

  const primary = 10 + passes.reduce((sum, state) => sum + 7.5 * state.weight, 0);
  const rivals = fails.map((state) => primary * Math.min(0.85, 0.3 + 0.3 * state.weight));
  const openCandidates = open.map(() => primary * 0.42);
  // A small archive-noise floor keeps the entropy readout honest even on a
  // clean board — certainty never reads as exactly zero on a real system.
  const noise = [primary * 0.05, primary * 0.035];
  const scores = [primary, ...rivals, ...openCandidates, ...noise];

  const summary = buildConfidenceSummary(scores, {
    maxScore: MAX_EVIDENCE,
    baseAleatoric: 0.08 + fails.length * 0.045 + open.length * 0.02,
    calibrationStatus: open.length === 0 ? 'benchmarking' : 'heuristic',
    drivers: fails.map((state) => `${state.gate.title}: ${state.gate.failSignal}`),
  });

  const strength = Math.min(1, primary / MAX_EVIDENCE);
  const sortedScores = [...scores].sort((a, b) => b - a);
  const margin = sortedScores[0] > 0 ? (sortedScores[0] - (sortedScores[1] ?? 0)) / sortedScores[0] : 0;

  // Refusal condition: an undefined failure path combined with irreversible
  // error cost. No confidence level buys autonomy past that pair.
  const refusal = answers['bottlenecks'] === 'fail' && answers['error-cost'] === 'fail';

  const rationale = refusal
    ? 'A wrong action that can be neither observed nor reversed is a refusal condition. Rebuild recovery and receipts before this system touches autonomy again.'
    : open.length > 0
      ? 'The instrument holds its verdict until all four gates report. Partial readings default to human judgment, never to autopilot.'
      : summary.confidence < THRESHOLDS.deferThreshold
        ? 'Confidence sits below the deferral floor. Route this decision through a human owner and derisk the failing gates before spending autonomy budget.'
        : summary.confidence < THRESHOLDS.conditionalThreshold
          ? 'Signal clears the floor but ambiguity is live. Automate only the branches you can name, state residual risk out loud, and keep the escalation path warm.'
          : 'All four gates read clean and calibration holds. Scope autonomy tightly, keep decision receipts, and let the eval data argue for expansion.';

  // Partial boards never certify — the verdict floors to defer until the
  // instrument has all four signals, whatever the raw confidence says.
  const effectiveConfidence =
    open.length > 0
      ? Math.min(summary.confidence, THRESHOLDS.deferThreshold - 0.05)
      : summary.confidence;

  const recommendation = buildDecisionRecommendation(effectiveConfidence, THRESHOLDS, {
    refusal,
    missingInformation: open.map((state) => `${state.gate.title} gate reading`),
    rationale,
  });

  const axes: UncertaintyAxis[] = [
    { axis: 'Epistemic', value: summary.epistemic, envelope: 0.4 },
    { axis: 'Aleatoric', value: summary.aleatoric, envelope: 0.4 },
    { axis: 'Entropy', value: summary.semanticEntropy, envelope: 0.4 },
    { axis: 'Margin', value: Math.max(0, 1 - margin), envelope: 0.4 },
    { axis: 'Evidence', value: Math.max(0, 1 - strength), envelope: 0.4 },
  ];

  // Synthetic-but-coherent throughput history: level scales with confidence,
  // drift with net gate readings, volatility with irreducible noise. The lib
  // then runs its real walk-forward forecast + calibration over it.
  const seed = gateStates.reduce(
    (acc, state, index) =>
      acc + (state.answer === 'pass' ? 1 : state.answer === 'fail' ? 2 : 0) * 3 ** index,
    7
  );
  const random = mulberry32(seed);
  const base = 16 + summary.confidence * 26;
  const drift = (passes.length - fails.length) * 0.55;
  const volatility = 1.5 + summary.aleatoric * 14 + summary.semanticEntropy * 5;

  const series = Array.from({ length: 21 }, (_, index) => ({
    date: new Date(FORECAST_ANCHOR_UTC - (20 - index) * DAY_MS).toISOString().slice(0, 10),
    value: Math.max(
      2,
      base + drift * (index - 10) + Math.sin(index / 2.6) * volatility * 0.45 + (random() - 0.5) * 2 * volatility
    ),
  }));

  const intelligence = buildForecastIntelligence(series, { horizonDays: 7 });
  const points: ForecastStripPoint[] = intelligence.points.map((point, index) => ({
    ...point,
    label: pointLabel(index),
  }));

  const receipt: InstrumentReading['receipt'] = [
    ...gateStates.map((state) => ({
      key: `input.${state.gate.id}`,
      value: state.answer ?? 'awaiting',
      state: state.answer ?? 'open',
    })),
    { key: 'derived.evidence', value: strength.toFixed(2) },
    { key: 'derived.margin', value: margin.toFixed(2) },
    { key: 'derived.entropy', value: summary.semanticEntropy.toFixed(2) },
    { key: 'policy.defer_floor', value: THRESHOLDS.deferThreshold.toFixed(2) },
    { key: 'policy.cond_floor', value: THRESHOLDS.conditionalThreshold.toFixed(2) },
    { key: 'policy.refuse_rule', value: 'bottlenecks ∧ error-cost' },
    { key: 'calibration.mode', value: summary.calibrationStatus },
    { key: 'verdict.action', value: recommendation.action, state: recommendation.action },
    { key: 'verdict.confidence', value: summary.confidence.toFixed(3) },
  ];

  return {
    summary,
    recommendation,
    axes,
    points,
    forecast: intelligence.forecast,
    calibration: intelligence.calibration,
    receipt,
    answered: passes.length + fails.length,
  };
}

/** One gate channel: index, lamp, weight readout, question, precision toggle. */
function SimulatorGate({
  state,
  index,
  onAnswer,
  reduceMotion,
}: {
  state: GateState;
  index: number;
  onAnswer: (value: Exclude<GateAnswer, null>) => void;
  reduceMotion: boolean;
}) {
  const { gate, answer, weight } = state;

  return (
    <div className="sim-gate" data-state={answer ?? 'open'}>
      <div className="sim-gate-index">
        <span className="font-mono text-[0.65rem] tracking-[0.22em] text-muted-foreground">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="sim-gate-lamp" data-state={answer ?? 'open'} aria-hidden />
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="immersive-kicker">{gate.title}</p>
          <span className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground/70">
            w ×{weight.toFixed(2)}
          </span>
        </div>
        <p className="mt-2 max-w-xl text-[0.95rem] font-medium leading-snug tracking-tight md:text-base">
          {gate.question}
        </p>

        <AnimatePresence mode="wait" initial={false}>
          {answer ? (
            <motion.p
              key={answer}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -5 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="mt-3 max-w-xl text-[0.8rem] leading-relaxed text-muted-foreground"
            >
              <span className="font-mono text-[0.55rem] uppercase tracking-[0.2em]">
                {answer === 'pass' ? 'Pass signal — ' : 'Fail signal — '}
              </span>
              {answer === 'pass' ? gate.passSignal : gate.failSignal}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="gate-switch sim-gate-switch" role="group" aria-label={`${gate.title} gate signal`}>
        {(['pass', 'fail'] as const).map((value) => {
          const selected = answer === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={selected}
              onClick={() => onAnswer(value)}
              data-cursor="interactive"
              className="gate-switch-option"
            >
              {selected ? (
                <motion.span
                  layoutId={`sim-gate-thumb-${gate.id}`}
                  className="gate-switch-thumb"
                  data-value={value}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 460, damping: 38 }
                  }
                  aria-hidden
                />
              ) : null}
              <span className="relative z-10">{value === 'pass' ? 'Pass' : 'Fail'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Chapter 05 — Decision Instrument. A full working console around the
 * Four-Gate autonomy check: every toggle re-runs the decision-intelligence
 * pipeline live — calibrated confidence on a radial gauge, an uncertainty
 * decomposition radar, a decision receipt ledger, and a walk-forward
 * throughput forecast with its calibration band. Free-scroll section; charts
 * render fully under reduced motion with springs and draw-ons disabled.
 */
export function DecisionSimulatorSection() {
  const prefersReducedMotion = useReducedMotion() === true;
  const [answers, setAnswers] = useState<Record<string, GateAnswer>>(() =>
    Object.fromEntries(methodGates.map((gate) => [gate.id, null]))
  );

  const reading = useMemo(() => deriveReading(answers), [answers]);
  const gateStates: GateState[] = methodGates.map((gate) => ({
    gate,
    answer: answers[gate.id] ?? null,
    weight: GATE_WEIGHTS[gate.id] ?? 1,
  }));

  const reset = () => setAnswers(Object.fromEntries(methodGates.map((gate) => [gate.id, null])));

  return (
    <section id="simulator" className="bg-background">
      <div className="editorial-container py-[var(--section-gap)]">
        {/* Chapter head */}
        <ScrollReveal className="mb-12 grid gap-8 lg:mb-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="chapter-label mb-4">Chapter 05 · Decision Instrument</p>
            <h2 className="editorial-title">
              Run the
              <br />
              <span className="text-muted-foreground">autonomy gate.</span>
            </h2>
          </div>
          <p className="max-w-md text-muted-foreground lg:justify-self-end">
            Flip the four gates against a real use case. Every reading re-runs the same
            decision-intelligence pipeline that scores the archive console — calibrated
            confidence, uncertainty decomposition, a policy verdict, and the forecast it
            implies. Nothing here is a mock-up of judgment; it is the judgment.
          </p>
        </ScrollReveal>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-start">
          {/* ── Instrument frame ─────────────────────────────────────────── */}
          <ScrollReveal>
            <div className="sim-frame">
              <span className="sim-frame-mark" data-corner="tl" aria-hidden />
              <span className="sim-frame-mark" data-corner="tr" aria-hidden />
              <span className="sim-frame-mark" data-corner="bl" aria-hidden />
              <span className="sim-frame-mark" data-corner="br" aria-hidden />

              <div className="sim-frame-head">
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
                  Instrument 05 · Autonomy gate array
                </span>
                <span className="flex items-center gap-4">
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                    {reading.answered}/{methodGates.length} read
                  </span>
                  <button
                    type="button"
                    onClick={reset}
                    data-cursor="interactive"
                    className="inline-flex min-h-9 items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <RotateCcw className="h-3 w-3" aria-hidden />
                    Reset
                  </button>
                </span>
              </div>

              <div className="sim-grid">
                {/* Gate array */}
                <div className="sim-panel sim-panel-span">
                  {gateStates.map((state, index) => (
                    <SimulatorGate
                      key={state.gate.id}
                      state={state}
                      index={index}
                      reduceMotion={prefersReducedMotion}
                      onAnswer={(value) =>
                        setAnswers((previous) => ({ ...previous, [state.gate.id]: value }))
                      }
                    />
                  ))}
                </div>

                {/* Uncertainty decomposition */}
                <div className="sim-panel">
                  <p className="sim-panel-head">Uncertainty decomposition</p>
                  <UncertaintyRadar axes={reading.axes} animate={!prefersReducedMotion} />
                  <div className="sim-legend">
                    <span>
                      <i className="sim-legend-swatch" data-kind="reading" aria-hidden /> Live
                      reading
                    </span>
                    <span>
                      <i className="sim-legend-swatch" data-kind="envelope" aria-hidden /> Deploy
                      envelope
                    </span>
                  </div>
                  <dl className="sim-readouts">
                    <div>
                      <dt>Epistemic</dt>
                      <dd>{reading.summary.epistemic.toFixed(2)}</dd>
                    </div>
                    <div>
                      <dt>Aleatoric</dt>
                      <dd>{reading.summary.aleatoric.toFixed(2)}</dd>
                    </div>
                    <div>
                      <dt>Entropy</dt>
                      <dd>{reading.summary.semanticEntropy.toFixed(2)}</dd>
                    </div>
                  </dl>
                </div>

                {/* Decision receipt */}
                <div className="sim-panel">
                  <p className="sim-panel-head">Decision receipt</p>
                  <ol className="sim-receipt" aria-label="Decision receipt ledger">
                    {reading.receipt.map((line) => (
                      <li key={line.key} data-state={line.state}>
                        <span>{line.key}</span>
                        <span className="sim-receipt-value">{line.value}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Forecast strip */}
                <div className="sim-panel sim-panel-span">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                    <p className="sim-panel-head !mb-0">Throughput forecast · 7-day horizon</p>
                    {reading.forecast && reading.calibration ? (
                      <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                        Σ {reading.forecast.expectedTotal}{' '}
                        <span className="text-muted-foreground/60">
                          [{reading.forecast.lowerBound}–{reading.forecast.upperBound}]
                        </span>
                        {' · '}trend {reading.forecast.trendDelta >= 0 ? '+' : ''}
                        {formatPercent(reading.forecast.trendDelta)}
                        {' · '}coverage {formatPercent(reading.calibration.coverage)}
                        <span className="text-muted-foreground/60">
                          /{formatPercent(reading.calibration.targetCoverage)}
                        </span>
                        {' · '}ece {reading.calibration.ece.toFixed(3)}
                      </p>
                    ) : null}
                  </div>
                  <div className="mt-4">
                    <ForecastStrip points={reading.points} animate={!prefersReducedMotion} />
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* ── Recommendation console — sticky readout head ─────────────── */}
          <ScrollReveal delay={0.08} className="lg:sticky lg:top-24 lg:self-start">
            <aside className="sim-console" data-tone={reading.recommendation.action}>
              <div className="sim-console-head">
                <p className="immersive-kicker">Recommendation console</p>
                <span className="sim-console-status" aria-hidden />
              </div>

              <CalibrationGauge
                value={reading.summary.confidence}
                label={`${reading.summary.confidenceLabel} signal`}
                deferThreshold={THRESHOLDS.deferThreshold}
                conditionalThreshold={THRESHOLDS.conditionalThreshold}
                reduceMotion={prefersReducedMotion}
              />

              <div className="sim-lamps" role="status" aria-label="Recommended action">
                {ACTION_LAMPS.map(({ action, label }) => (
                  <span
                    key={action}
                    className="sim-lamp"
                    data-action={action}
                    data-on={reading.recommendation.action === action || undefined}
                  >
                    <i aria-hidden />
                    {label}
                  </span>
                ))}
              </div>

              <div aria-live="polite" className="sim-console-readout">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`${reading.recommendation.action}-${reading.recommendation.requiredEvidence.length > 0 ? 'hold' : 'live'}`}
                    initial={
                      prefersReducedMotion ? false : { opacity: 0, y: 16, filter: 'blur(7px)' }
                    }
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={
                      prefersReducedMotion
                        ? undefined
                        : { opacity: 0, y: -10, filter: 'blur(5px)' }
                    }
                    transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="font-display text-2xl leading-tight tracking-tight md:text-[1.9rem]">
                      {reading.recommendation.label}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {reading.recommendation.rationale}
                    </p>
                    {reading.recommendation.requiredEvidence.length > 0 ? (
                      <ul className="mt-4 space-y-1.5">
                        {reading.recommendation.requiredEvidence.map((item) => (
                          <li
                            key={item}
                            className="flex items-baseline gap-2 text-xs text-muted-foreground"
                          >
                            <span className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-muted-foreground/70">
                              Awaiting
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="sim-console-meter" aria-hidden>
                {gateStates.map((state) => (
                  <span key={state.gate.id} data-state={state.answer ?? 'open'} />
                ))}
              </div>

              {reading.calibration ? (
                <p className="mt-4 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                  Calibration {reading.calibration.status} · coverage{' '}
                  {formatPercent(reading.calibration.coverage)} · mae{' '}
                  {reading.calibration.mae.toFixed(1)}
                </p>
              ) : null}

              <div className="mt-7">
                <Magnetic>
                  <a href="#contact" className="immersive-button">
                    Stress-test with me
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </a>
                </Magnetic>
              </div>
            </aside>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
