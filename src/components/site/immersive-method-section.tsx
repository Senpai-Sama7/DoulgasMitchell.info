'use client';

import { useMemo, useState } from 'react';
import { ArrowUpRight, Check, RotateCcw } from 'lucide-react';
import {
  methodGates,
  methodLadder,
  methodPatterns,
  type MethodGate,
} from '@/lib/site-content';
import {
  ScrollReveal,
  ScrollRevealItem,
  ScrollRevealStagger,
} from '@/components/immersive/scroll-reveal';

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

function GateControl({
  gate,
  answer,
  onAnswer,
}: {
  gate: MethodGate;
  answer: GateAnswer;
  onAnswer: (value: Exclude<GateAnswer, null>) => void;
}) {
  return (
    <div className="method-panel" data-active={answer !== null}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="immersive-kicker">{gate.title}</p>
        <span className="font-mono text-[0.65rem] tracking-widest text-muted-foreground">
          Gate {gate.id}
        </span>
      </div>
      <p className="mt-3 max-w-2xl text-base font-medium leading-snug tracking-tight md:text-lg">
        {gate.question}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onAnswer('pass')}
          className={`min-h-11 rounded-[var(--radius)] border px-4 text-sm transition-colors ${
            answer === 'pass'
              ? 'border-brand-accent bg-brand-accent/15 text-foreground'
              : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
          }`}
        >
          Pass signal
        </button>
        <button
          type="button"
          onClick={() => onAnswer('fail')}
          className={`min-h-11 rounded-[var(--radius)] border px-4 text-sm transition-colors ${
            answer === 'fail'
              ? 'border-foreground/50 bg-foreground/5 text-foreground'
              : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
          }`}
        >
          Fail signal
        </button>
      </div>
      {answer ? (
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {answer === 'pass' ? gate.passSignal : gate.failSignal}
        </p>
      ) : null}
    </div>
  );
}

export function ImmersiveMethodSection() {
  const [activeStep, setActiveStep] = useState(methodLadder[0]?.id ?? 'clarify');
  const [answers, setAnswers] = useState<Record<string, GateAnswer>>(() =>
    Object.fromEntries(methodGates.map((gate) => [gate.id, null]))
  );

  const recommendation = useMemo(() => scoreRecommendation(answers), [answers]);
  const active = methodLadder.find((step) => step.id === activeStep) ?? methodLadder[0];

  return (
    <section id="method" className="section-spacing border-y border-border/50 bg-muted/20">
      <div className="editorial-container">
        <ScrollReveal className="mb-14 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="immersive-kicker mb-4">Method</p>
            <h2 className="editorial-title">
              The Operator
              <br />
              <span className="text-muted-foreground">Playbook.</span>
            </h2>
          </div>
          <p className="max-w-md text-muted-foreground lg:justify-self-end">
            A field manual for when to clarify, constrain, automate, and measure. Climb the ladder
            before you ship autonomy. Run the four gates before you trust a model with side effects.
          </p>
        </ScrollReveal>

        {/* Clarity Ladder */}
        <ScrollReveal className="mb-20">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="immersive-kicker mb-2">Clarity Ladder</p>
              <h3 className="font-display text-2xl tracking-tight md:text-3xl">
                Do not jump to agents.
              </h3>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">
              Same idea as Barry&apos;s evolution ladder for agent systems: ship the simplest
              control surface that earns the outcome.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,14rem)_1fr]">
            <div className="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:overflow-visible" role="tablist" aria-label="Clarity ladder steps">
              {methodLadder.map((step, index) => {
                const selected = step.id === activeStep;
                return (
                  <button
                    key={step.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActiveStep(step.id)}
                    className={`min-h-12 shrink-0 border px-4 py-3 text-left transition-colors ${
                      selected
                        ? 'border-brand-accent bg-brand-accent/10'
                        : 'border-border/70 hover:border-foreground/30'
                    }`}
                  >
                    <span className="font-mono text-[0.65rem] tracking-widest text-muted-foreground">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="mt-1 block text-sm font-medium">{step.title}</span>
                  </button>
                );
              })}
            </div>

            <div className="border border-border/70 bg-background/70 p-6 md:p-8" role="tabpanel">
              <p className="immersive-kicker mb-4">Step · {active.title}</p>
              <p className="max-w-2xl text-xl leading-snug tracking-tight md:text-2xl">
                {active.summary}
              </p>
              <p className="mt-6 max-w-2xl border-l-2 border-brand-accent/60 pl-4 text-sm leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">Production rule. </span>
                {active.rule}
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Four-gate interactive tool */}
        <ScrollReveal className="mb-20">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="immersive-kicker mb-2">Interactive tool</p>
              <h3 className="font-display text-2xl tracking-tight md:text-3xl">
                Four-Gate Decision Check
              </h3>
            </div>
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              onClick={() =>
                setAnswers(Object.fromEntries(methodGates.map((gate) => [gate.id, null])))
              }
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset gates
            </button>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="divide-y divide-border/60 border-y border-border/60">
              {methodGates.map((gate) => (
                <GateControl
                  key={gate.id}
                  gate={gate}
                  answer={answers[gate.id] ?? null}
                  onAnswer={(value) =>
                    setAnswers((previous) => ({
                      ...previous,
                      [gate.id]: value,
                    }))
                  }
                />
              ))}
            </div>

            <aside className="border border-border/70 bg-background/80 p-6 md:sticky md:top-28 md:self-start md:p-7">
              <p className="immersive-kicker mb-3">Recommendation</p>
              <p className="font-display text-2xl leading-tight tracking-tight">{recommendation.label}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {recommendation.detail}
              </p>
              <ul className="mt-6 space-y-2">
                {methodGates.map((gate) => {
                  const answer = answers[gate.id];
                  return (
                    <li
                      key={gate.id}
                      className="flex items-center justify-between gap-3 text-sm text-muted-foreground"
                    >
                      <span>{gate.title}</span>
                      <span className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider">
                        {answer === 'pass' ? (
                          <>
                            <Check className="h-3 w-3 text-brand-accent" /> Pass
                          </>
                        ) : answer === 'fail' ? (
                          'Fail'
                        ) : (
                          '—'
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <a href="#contact" className="immersive-button mt-8 w-full sm:w-fit">
                Stress-test a real system
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </aside>
          </div>
        </ScrollReveal>

        {/* Patterns */}
        <ScrollReveal>
          <div className="mb-8">
            <p className="immersive-kicker mb-2">Core patterns</p>
            <h3 className="font-display text-2xl tracking-tight md:text-3xl">
              What I actually implement
            </h3>
          </div>
        </ScrollReveal>

        <ScrollRevealStagger className="divide-y divide-border/60 border-y border-border/60">
          {methodPatterns.map((pattern, index) => (
            <ScrollRevealItem key={pattern.id}>
              <article className="grid gap-4 py-8 md:grid-cols-[4.5rem_1fr_1.1fr] md:gap-8">
                <span className="font-mono text-xs tracking-widest text-brand-accent">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h4 className="text-lg font-medium tracking-tight">{pattern.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    <span className="text-foreground/80">Solves: </span>
                    {pattern.solves}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    <span className="text-foreground/80">Implement: </span>
                    {pattern.implement}
                  </p>
                </div>
                <p className="border-l border-border/70 pl-4 text-sm leading-relaxed text-muted-foreground md:border-l-0 md:pl-0 md:border-t-0">
                  <span className="immersive-kicker mb-2 block !normal-case !tracking-normal">
                    Anti-pattern
                  </span>
                  {pattern.antipattern}
                </p>
              </article>
            </ScrollRevealItem>
          ))}
        </ScrollRevealStagger>
      </div>
    </section>
  );
}
