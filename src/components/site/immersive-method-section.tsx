'use client';

import { ArrowUpRight } from 'lucide-react';
import { Magnetic, usePinnedScene } from '@/components/immersive';
import {
  ScrollReveal,
  ScrollRevealItem,
  ScrollRevealStagger,
} from '@/components/immersive/scroll-reveal';
import { easings, gsap, ScrollTrigger } from '@/lib/gsap';
import { methodGates, methodLadder, methodPatterns } from '@/lib/site-content';

/**
 * Chapter 06 — Method. Opens on a pinned beat where the four Clarity Ladder
 * steps scrub into focus one at a time behind large display numerals, then
 * unpins into the pattern ledger. The Four-Gate check that used to live here
 * grew into the full Decision Instrument (Chapter 07 · #simulator); this
 * chapter keeps a compact teaser strip that deep-links into it.
 * Reduced-motion / touch / low-tier contexts get the same content as a static
 * editorial stack (the default markup state — the pin only elevates it).
 */
export function ImmersiveMethodSection() {
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
              <p className="chapter-label mb-4">Chapter 06 · Method</p>
              <h2 className="editorial-title">
                The Operator
                <br />
                <span className="text-muted-foreground">Playbook.</span>
              </h2>
            </div>
            <p className="max-w-md text-muted-foreground lg:justify-self-end">
              A field manual for when to clarify, constrain, automate, and measure. Climb the ladder
              before you ship autonomy — the simplest control surface that earns the outcome wins.
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

      <div className="editorial-container pb-[var(--section-gap)]">
        {/* Four-Gate teaser — the full instrument is the next chapter */}
        <ScrollReveal className="mb-24">
          <div className="sim-teaser">
            <div>
              <p className="immersive-kicker mb-2">Interactive tool</p>
              <h3 className="font-display text-2xl tracking-tight md:text-3xl">
                Four-Gate Decision Check
              </h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                The gate check grew into a full working instrument — calibrated confidence,
                uncertainty decomposition, and a policy verdict for every reading.
              </p>
            </div>

            <div className="sim-teaser-gates">
              {methodGates.map((gate) => (
                <span key={gate.id} className="sim-teaser-gate">
                  <i aria-hidden />
                  {gate.title}
                </span>
              ))}
            </div>

            <Magnetic>
              <a href="#simulator" className="immersive-button" data-cursor="interactive">
                Run the autonomy gate
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            </Magnetic>
          </div>
        </ScrollReveal>

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
