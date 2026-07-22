'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, RotateCcw } from 'lucide-react';
import { Magnetic, usePinnedScene } from '@/components/immersive';
import {
  ScrollReveal,
  ScrollRevealItem,
  ScrollRevealStagger,
} from '@/components/immersive/scroll-reveal';
import { easings, gsap, ScrollTrigger } from '@/lib/gsap';
import {
  methodGates,
  methodLadder,
  methodPatterns,
  type MethodGate,
} from '@/lib/site-content';

type GateAnswer = 'pass' | 'fail' | null;

function scoreRecommendation(answers: Record<string, GateAnswer>): {
  label: string;
  detail: string;
  tone: 'proceed' | 'workflow' | 'hold';
} {
  const values = Object.values(answers);
  if (values.some((value) => value === null) || values.length < methodGates.length) {
    return {
      label: 'Incomplete',
      detail: 'Answer all four gates. The recommendation only holds when the checklist is complete.',
      tone: 'hold',
    };
  }

  const passes = values.filter((value) => value === 'pass').length;
  if (passes === 4) {
    return {
      label: 'Agentic path is justified',
      detail:
        'Complexity, value, capability readiness, and reversible error cost all clear. Scope autonomy tightly and keep receipts.',
      tone: 'proceed',
    };
  }
  if (passes >= 2) {
    return {
      label: 'Prefer a mapped workflow',
      detail:
        'Enough signal exists to automate branches you can name. Keep humans on the ambiguous residue.',
      tone: 'workflow',
    };
  }
  return {
    label: 'Do not automate yet',
    detail:
      'Clarify the decision tree, derisk recovery, or lower error cost before adding model autonomy.',
    tone: 'hold',
  };
}

/**
 * One gate of the decision instrument: index + status lamp, question, a
 * two-position pass/fail switch with a sliding thumb, and the signal readout.
 */
function GateRow({
  gate,
  index,
  answer,
  onAnswer,
}: {
  gate: MethodGate;
  index: number;
  answer: GateAnswer;
  onAnswer: (value: Exclude<GateAnswer, null>) => void;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="gate-row" data-state={answer ?? 'open'}>
      <div className="gate-row-index">
        <span className="font-mono text-[0.65rem] tracking-[0.22em] text-muted-foreground">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="gate-lamp" data-state={answer ?? 'open'} aria-hidden />
      </div>

      <div className="min-w-0">
        <p className="immersive-kicker">{gate.title}</p>
        <p className="mt-2 max-w-xl text-base font-medium leading-snug tracking-tight md:text-lg">
          {gate.question}
        </p>

        <AnimatePresence mode="wait" initial={false}>
          {answer ? (
            <motion.p
              key={answer}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mt-4 max-w-xl"
            >
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                {answer === 'pass' ? 'Pass signal' : 'Fail signal'}
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                {answer === 'pass' ? gate.passSignal : gate.failSignal}
              </span>
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="gate-switch" role="group" aria-label={`${gate.title} gate signal`}>
        {(['pass', 'fail'] as const).map((value) => {
          const selected = answer === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={selected}
              onClick={() => onAnswer(value)}
              className="gate-switch-option"
            >
              {selected ? (
                <motion.span
                  layoutId={`gate-thumb-${gate.id}`}
                  className="gate-switch-thumb"
                  data-value={value}
                  transition={
                    prefersReducedMotion
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
 * Chapter 04 — Method. Opens on a pinned beat where the four Clarity Ladder
 * steps scrub into focus one at a time behind large display numerals, then
 * unpins into the Four-Gate decision instrument and the pattern ledger.
 * Reduced-motion / touch / low-tier contexts get the same content as a static
 * editorial stack (the default markup state — the pin only elevates it).
 */
export function ImmersiveMethodSection() {
  const prefersReducedMotion = useReducedMotion();
  const [answers, setAnswers] = useState<Record<string, GateAnswer>>(() =>
    Object.fromEntries(methodGates.map((gate) => [gate.id, null]))
  );

  const recommendation = useMemo(() => scoreRecommendation(answers), [answers]);
  const answered = Object.values(answers).filter((value) => value !== null).length;

  const stageRef = usePinnedScene<HTMLDivElement>(
    ({ timeline, root }) => {
      root.dataset.motion = 'pinned';

      const steps = gsap.utils.toArray<HTMLElement>('.method-step', root);
      const fill = root.querySelector<HTMLElement>('.method-progress-fill');

      steps.forEach((step, index) => {
        const numeral = step.querySelector<HTMLElement>('.method-step-numeral');
        const body = step.querySelector<HTMLElement>('.method-step-body');

        if (numeral) {
          timeline.fromTo(
            numeral,
            { yPercent: 34, opacity: 0, filter: 'blur(14px)' },
            { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.55, ease: easings.power4 },
            index
          );
        }
        if (body) {
          timeline.fromTo(
            body,
            { y: 46, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: easings.power4 },
            index + 0.12
          );
        }
        if (index < steps.length - 1) {
          timeline.to(
            step,
            { y: -34, autoAlpha: 0, duration: 0.34, ease: 'power2.in' },
            index + 0.8
          );
        }
      });

      if (fill) {
        timeline.fromTo(
          fill,
          { scaleY: 0 },
          { scaleY: 1, duration: Math.max(steps.length, 1), ease: 'none' },
          0
        );
      }

      // The layout flips from static stack to layered stage above — re-measure
      // the pin spacer once the new geometry has settled.
      requestAnimationFrame(() => ScrollTrigger.refresh());
    },
    {
      distance: 1300,
      onStatic: (root) => {
        root.dataset.motion = 'static';
      },
    }
  );

  return (
    <section id="method" className="border-y border-border/50 bg-muted/20">
      {/* Pinned intro beat — the Clarity Ladder */}
      <div ref={stageRef} className="method-stage">
        <div className="editorial-container w-full">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="chapter-label mb-4">Chapter 04 · Method</p>
              <h2 className="editorial-title">
                The Operator
                <br />
                <span className="text-muted-foreground">Playbook.</span>
              </h2>
            </div>
            <p className="max-w-md text-muted-foreground lg:justify-self-end">
              A field manual for when to clarify, constrain, automate, and measure. Climb the
              ladder before you ship autonomy — the simplest control surface that earns the
              outcome wins.
            </p>
          </div>

          <div className="method-steps">
            <div className="method-progress" aria-hidden>
              <span className="method-progress-fill" />
            </div>
            {methodLadder.map((step, index) => (
              <article key={step.id} className="method-step">
                <span className="method-step-numeral font-display" aria-hidden>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="method-step-body">
                  <p className="immersive-kicker mb-3">Clarity ladder · {step.title}</p>
                  <p className="max-w-xl text-xl leading-snug tracking-tight md:text-2xl lg:text-[1.7rem]">
                    {step.summary}
                  </p>
                  <p className="mt-5 max-w-xl border-l-2 border-brand-accent/60 pl-4 text-sm leading-relaxed text-muted-foreground">
                    <span className="font-medium text-foreground">Production rule. </span>
                    {step.rule}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Four-gate decision instrument */}
      <div className="editorial-container pb-[var(--section-gap)]">
        <ScrollReveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="immersive-kicker mb-2">Interactive tool</p>
            <h3 className="font-display text-2xl tracking-tight md:text-3xl">
              Four-Gate Decision Check
            </h3>
          </div>
          <button
            type="button"
            className="inline-flex min-h-11 items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
            onClick={() =>
              setAnswers(Object.fromEntries(methodGates.map((gate) => [gate.id, null])))
            }
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Reset gates
          </button>
        </ScrollReveal>

        <div className="mb-24 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <ScrollReveal className="border-y border-border/60">
            {methodGates.map((gate, index) => (
              <GateRow
                key={gate.id}
                gate={gate}
                index={index}
                answer={answers[gate.id] ?? null}
                onAnswer={(value) =>
                  setAnswers((previous) => ({
                    ...previous,
                    [gate.id]: value,
                  }))
                }
              />
            ))}
          </ScrollReveal>

          <ScrollReveal delay={0.08} className="lg:sticky lg:top-28 lg:self-start">
            <aside className="gate-console" data-tone={recommendation.tone}>
              <div className="gate-console-head">
                <p className="immersive-kicker">Recommendation</p>
                <span className="gate-console-status" aria-hidden />
              </div>

              <div className="gate-console-meter" aria-hidden>
                {methodGates.map((gate) => (
                  <span key={gate.id} data-state={answers[gate.id] ?? 'open'} />
                ))}
              </div>

              <div aria-live="polite" className="gate-console-readout">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={recommendation.label}
                    initial={
                      prefersReducedMotion ? false : { opacity: 0, y: 16, filter: 'blur(6px)' }
                    }
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={
                      prefersReducedMotion ? undefined : { opacity: 0, y: -10, filter: 'blur(4px)' }
                    }
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="font-display text-2xl leading-tight tracking-tight md:text-3xl">
                      {recommendation.label}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {recommendation.detail}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <ul className="gate-console-list">
                {methodGates.map((gate) => {
                  const answer = answers[gate.id] ?? null;
                  return (
                    <li key={gate.id}>
                      <span>{gate.title}</span>
                      <span className="gate-console-verdict" data-state={answer ?? 'open'}>
                        {answer === 'pass' ? 'Pass' : answer === 'fail' ? 'Fail' : 'Pending'}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <p className="mt-5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                {answered} / {methodGates.length} gates answered
              </p>

              <div className="mt-7">
                <Magnetic>
                  <a href="#contact" className="immersive-button">
                    Stress-test a real system
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </a>
                </Magnetic>
              </div>
            </aside>
          </ScrollReveal>
        </div>

        {/* Pattern ledger */}
        <ScrollReveal className="mb-10">
          <p className="immersive-kicker mb-2">Core patterns</p>
          <h3 className="font-display text-2xl tracking-tight md:text-3xl">
            What I actually implement
          </h3>
        </ScrollReveal>

        <div className="pattern-rows">
          <span className="pattern-accent-line" aria-hidden />
          <ScrollRevealStagger className="divide-y divide-border/60 border-y border-border/60">
            {methodPatterns.map((pattern, index) => (
              <ScrollRevealItem key={pattern.id}>
                <article className="pattern-row">
                  <span className="pattern-row-numeral font-display" aria-hidden>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h4 className="text-lg font-medium tracking-tight md:text-xl">
                      {pattern.title}
                    </h4>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      <span className="text-foreground/80">Solves: </span>
                      {pattern.solves}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      <span className="text-foreground/80">Implement: </span>
                      {pattern.implement}
                    </p>
                  </div>
                  <p className="pattern-row-anti text-sm leading-relaxed text-muted-foreground">
                    <span className="mb-2 block font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                      Anti-pattern
                    </span>
                    {pattern.antipattern}
                  </p>
                </article>
              </ScrollRevealItem>
            ))}
          </ScrollRevealStagger>
        </div>
      </div>
    </section>
  );
}
