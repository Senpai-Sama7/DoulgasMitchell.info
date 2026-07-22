'use client';

import dynamic from 'next/dynamic';
import { useCallback, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePinnedScene } from '@/components/immersive';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { methodLadder, methodPatterns } from '@/lib/site-content';
import type { AtlasNodeId } from '@/components/site/system-atlas-nodes';

const AtlasFlowCanvas = dynamic(
  () =>
    import('@/components/site/system-atlas-nodes').then((module) => module.AtlasFlowCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="atlas-flow-loading" role="status">
        <span aria-hidden />
        Calibrating operating graph
      </div>
    ),
  }
);

interface AtlasDetail {
  code: string;
  title: string;
  role: string;
  rule: string;
  receipt: string;
}

const patternRule = (id: string, fallback: string) =>
  methodPatterns.find((pattern) => pattern.id === id)?.implement ?? fallback;

const ladderRule = (id: string, fallback: string) =>
  methodLadder.find((step) => step.id === id)?.rule ?? fallback;

const ATLAS_DETAILS: Record<AtlasNodeId, AtlasDetail> = {
  intake: {
    code: 'N–01 / ENTRY',
    title: 'Intake',
    role: 'Names the decision, owner, constraints, and evidence bar before a model sees the request.',
    rule: 'Reject incomplete intake. Missing ownership or success criteria is a stop condition, not an invitation to guess.',
    receipt: 'Required fields, source identity, received-at timestamp.',
  },
  normalize: {
    code: 'N–02 / SHAPE',
    title: 'Normalize',
    role: 'Converts noisy handoffs into a stable contract that downstream logic can actually evaluate.',
    rule: patternRule(
      'intake-normalization',
      'Validate structure before inference. Reject incomplete intake instead of guessing.'
    ),
    receipt: 'Schema version, validation result, rejected fields.',
  },
  'confidence-router': {
    code: 'N–03 / ROUTE',
    title: 'Confidence Router',
    role: 'Separates the clear path from the ambiguous path while preserving the original context.',
    rule: patternRule(
      'confidence-routing',
      'Threshold confidence. Auto-run only the clear path; escalate the rest with context intact.'
    ),
    receipt: 'Confidence score, threshold version, route selected.',
  },
  'auto-path': {
    code: 'N–04A / EXECUTE',
    title: 'Auto Path',
    role: 'Executes bounded, reversible work only after policy and confidence gates agree.',
    rule: ladderRule(
      'automate',
      'Automation without receipts is theater. Every action needs a decision trace.'
    ),
    receipt: 'Policy hit, tool call, action hash, rollback pointer.',
  },
  'human-checkpoint': {
    code: 'N–04B / REVIEW',
    title: 'Human Checkpoint',
    role: 'Keeps judgment with a named person when uncertainty or consequence crosses the line.',
    rule: 'Writes, irreversible sends, and high-cost errors pause by default. Review arrives with context, not a blank approval box.',
    receipt: 'Approver identity, disposition, rationale, reviewed-at timestamp.',
  },
  'decision-receipt': {
    code: 'N–05 / PROVE',
    title: 'Decision Receipt',
    role: 'Turns every mutation into an inspectable record instead of an unexplained side effect.',
    rule: patternRule(
      'decision-receipts',
      'Persist inputs, confidence, policy hit, approver, and action hash for every mutation.'
    ),
    receipt: 'Input digest, decision path, approver, output, action hash.',
  },
  'eval-loop': {
    code: 'N–06 / LEARN',
    title: 'Eval Loop',
    role: 'Scores outcomes by failure theme, then changes one system lever before rerunning.',
    rule: patternRule(
      'eval-first-loops',
      'Score structural and output metrics. Diagnose by theme. Change one lever, then rerun.'
    ),
    receipt: 'Eval set, baseline delta, failure theme, next intervention.',
  },
  'context-layers': {
    code: 'C–05 / BOUND',
    title: 'Context Layers',
    role: 'Composes system, task, tool, memory, and routing context without turning the prompt into a junk drawer.',
    rule: ladderRule(
      'constrain',
      'Pin identity and hard limits. Load tools just-in-time. Evict distractors early.'
    ),
    receipt: 'Layer manifest, source provenance, token budget, eviction log.',
  },
};

const SCROLL_BEATS: readonly {
  id: AtlasNodeId;
  numeral: string;
  label: string;
  pan: { x: number; y: number };
}[] = [
  { id: 'intake', numeral: '01', label: 'Evidence enters', pan: { x: 3, y: 1 } },
  { id: 'normalize', numeral: '02', label: 'Noise becomes structure', pan: { x: 1.5, y: 0 } },
  {
    id: 'confidence-router',
    numeral: '03',
    label: 'Confidence chooses the path',
    pan: { x: 0, y: -1 },
  },
  {
    id: 'human-checkpoint',
    numeral: '04',
    label: 'Ambiguity meets judgment',
    pan: { x: -2, y: -1.5 },
  },
  {
    id: 'decision-receipt',
    numeral: '05',
    label: 'Every action leaves proof',
    pan: { x: -3.5, y: 0 },
  },
];

/**
 * Chapter 04 — Systems Atlas. A live operating model rather than a decorative
 * diagram: the graph stays selectable while a 1600px desktop scroll beat pans
 * the camera and traces Intake → Receipt. usePinnedScene supplies the static
 * path for reduced motion, touch input, and low motion tiers.
 */
export function SystemAtlasSection() {
  const prefersReducedMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<AtlasNodeId>('intake');
  const [flowReady, setFlowReady] = useState(false);

  const handleActivate = useCallback((id: AtlasNodeId) => {
    setActiveId(id);
  }, []);

  const handleFlowReady = useCallback(() => {
    setFlowReady(true);
  }, []);

  const stageRef = usePinnedScene<HTMLDivElement>(
    ({ timeline, root }) => {
      root.dataset.motion = 'pinned';

      const camera = root.querySelector<HTMLElement>('.atlas-camera');
      const beats = gsap.utils.toArray<HTMLElement>('.atlas-ghost-beat', root);
      const progress = root.querySelector<HTMLElement>('.atlas-scroll-progress-fill');

      timeline.set(beats, { autoAlpha: 0 }, 0);
      if (beats[0]) {
        timeline.set(beats[0], { autoAlpha: 1 }, 0);
      }

      SCROLL_BEATS.forEach((beat, index) => {
        const at = index;
        const signal = root.querySelector<HTMLElement>(
          `[data-atlas-node="${beat.id}"] .atlas-node-scroll-signal`
        );

        if (index > 0) {
          const previousBeat = beats[index - 1];
          const currentBeat = beats[index];

          if (previousBeat) {
            timeline.to(previousBeat, { autoAlpha: 0, y: -16, duration: 0.18 }, at);
          }
          if (currentBeat) {
            timeline.fromTo(
              currentBeat,
              { autoAlpha: 0, y: 18 },
              { autoAlpha: 1, y: 0, duration: 0.24 },
              at
            );
          }
        }

        if (camera) {
          timeline.to(
            camera,
            {
              xPercent: beat.pan.x,
              yPercent: beat.pan.y,
              duration: 0.82,
              ease: 'power2.inOut',
            },
            at
          );
        }

        if (signal) {
          timeline.fromTo(
            signal,
            { autoAlpha: 0, scale: 0.72 },
            { autoAlpha: 1, scale: 1, duration: 0.22 },
            at
          );

          if (index < SCROLL_BEATS.length - 1) {
            timeline.to(signal, { autoAlpha: 0, scale: 1.12, duration: 0.26 }, at + 0.72);
          }
        }
      });

      if (progress) {
        timeline.fromTo(
          progress,
          { scaleX: 0 },
          { scaleX: 1, duration: SCROLL_BEATS.length - 0.12, ease: 'none' },
          0
        );
      }

      requestAnimationFrame(() => ScrollTrigger.refresh());
    },
    {
      distance: 1600,
      scrub: 1,
      dependencies: [flowReady],
      onStatic: (root) => {
        root.dataset.motion = 'static';
        gsap.set(
          root.querySelectorAll(
            '.atlas-camera, .atlas-ghost-beat, .atlas-node-scroll-signal, .atlas-scroll-progress-fill'
          ),
          { clearProps: 'all' }
        );
      },
    }
  );

  const activeDetail = ATLAS_DETAILS[activeId];

  return (
    <section id="atlas" className="atlas-section" aria-labelledby="atlas-title">
      <div ref={stageRef} className="atlas-stage">
        <div className="atlas-stage-grid" aria-hidden />

        <div className="atlas-layout">
          <header className="atlas-copy">
            <p className="chapter-label atlas-chapter-label">Chapter 04 · Systems Atlas</p>
            <h2 id="atlas-title" className="atlas-title">
              The operating
              <br />
              <span>graph.</span>
            </h2>
            <p className="atlas-deck">
              Decision systems become trustworthy when context is layered, confidence is routed,
              and human checkpoints guard ambiguity.
            </p>

            <div className="atlas-copy-rule">
              <span aria-hidden>↳</span>
              <p>
                Select any node to inspect the production rule and the receipt it must leave
                behind.
              </p>
            </div>
          </header>

          <div className="atlas-panel" aria-label="Douglas Mitchell operating model">
            <div className="atlas-panel-head">
              <div>
                <span className="atlas-live-mark" aria-hidden />
                <span>Operating model / live topology</span>
              </div>
              <div aria-label="Graph contains 8 nodes and 9 routes">
                <span>08 nodes</span>
                <span>09 routes</span>
              </div>
            </div>

            <div className="atlas-panel-body">
              <div className="atlas-graph-viewport">
                <div className="atlas-camera">
                  <AtlasFlowCanvas
                    activeId={activeId}
                    onActivate={handleActivate}
                    onReady={handleFlowReady}
                  />
                </div>

                <div className="atlas-ghost-readout" aria-hidden>
                  {SCROLL_BEATS.map((beat, index) => (
                    <div
                      key={beat.id}
                      className={cnGhostBeat(index)}
                      data-atlas-beat={beat.id}
                    >
                      <span>{beat.numeral}</span>
                      <small>{beat.label}</small>
                    </div>
                  ))}
                </div>
              </div>

              <div
                id="atlas-detail-panel"
                className="atlas-detail-slot"
                aria-live="polite"
                aria-atomic="true"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.aside
                    key={activeId}
                    className="atlas-detail-panel"
                    initial={
                      prefersReducedMotion ? false : { opacity: 0, x: 28, filter: 'blur(7px)' }
                    }
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    exit={
                      prefersReducedMotion
                        ? undefined
                        : { opacity: 0, x: -12, filter: 'blur(4px)' }
                    }
                    transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="atlas-detail-head">
                      <span>{activeDetail.code}</span>
                      <span>Selected</span>
                    </div>

                    <h3>{activeDetail.title}</h3>
                    <p className="atlas-detail-role">{activeDetail.role}</p>

                    <dl>
                      <div>
                        <dt>Production rule</dt>
                        <dd>{activeDetail.rule}</dd>
                      </div>
                      <div>
                        <dt>Receipt fields</dt>
                        <dd>{activeDetail.receipt}</dd>
                      </div>
                    </dl>
                  </motion.aside>
                </AnimatePresence>
              </div>
            </div>

            <div className="atlas-panel-foot">
              <span>Drag canvas / select node / tab to inspect</span>
              <span className="atlas-scroll-progress" aria-hidden>
                <span className="atlas-scroll-progress-fill" />
              </span>
              <span>Signal path: intake → proof</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function cnGhostBeat(index: number) {
  return `atlas-ghost-beat${index === 0 ? ' atlas-ghost-beat-first' : ''}`;
}
