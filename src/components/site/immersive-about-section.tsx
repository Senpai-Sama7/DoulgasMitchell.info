'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { usePinnedScene } from '@/components/immersive';
import { ScrollReveal } from '@/components/immersive/scroll-reveal';
import { gsap } from '@/lib/gsap';
import {
  aboutRoles,
  expertiseByCategory,
  heroMetrics,
  operatingPrinciples,
  siteProfile,
} from '@/lib/site-content';

const ROLE_SEGMENT = 1;

/**
 * Chapter 1 — "Identity". Asymmetric poster opener (editorial statement
 * overlapping the proof strip), then a pinned scrub scene (1500px) where the
 * four working roles unmask one-by-one against a growing progress spine.
 * Principles read as a timeline, expertise as rows.
 */
export function ImmersiveAboutSection() {
  const principlesRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: principlesRef,
    offset: ['start 0.85', 'end 0.45'],
  });
  const principlesLine = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  const stageRef = usePinnedScene<HTMLDivElement>(
    ({ timeline }) => {
      const total = aboutRoles.length * ROLE_SEGMENT + 0.6;

      // Progress spine grows across the whole scene.
      timeline.fromTo(
        '.about-progress',
        { scaleY: 0 },
        { scaleY: 1, duration: total, ease: 'none' },
        0
      );

      aboutRoles.forEach((_, index) => {
        const at = index * ROLE_SEGMENT + 0.2;

        // Each role unmasks top-down and settles into place.
        timeline.fromTo(
          `[data-role="${index}"]`,
          { autoAlpha: 0, y: 44, clipPath: 'inset(0% 0% 100% 0%)' },
          { autoAlpha: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7 },
          at
        );

        // Ghost counter crossfades with the active role.
        if (index > 0) {
          timeline.to(`[data-role-index="${index - 1}"]`, { autoAlpha: 0, duration: 0.22 }, at);
          timeline.fromTo(
            `[data-role-index="${index}"]`,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.22 },
            at
          );
        }
      });
    },
    {
      distance: 1500,
      scrub: 1,
      onStatic: (root) => {
        // Static path: all roles legible, spine at rest (full height).
        gsap.set(root.querySelectorAll('[data-role]'), {
          clearProps: 'opacity,visibility,transform,clipPath',
        });
        const spine = root.querySelector('.about-progress');
        if (spine) gsap.set(spine, { scaleY: 1 });
      },
    }
  );

  return (
    <section id="about" className="relative">
      {/* ── Poster opener: statement overlapping the proof strip ───────── */}
      <div className="editorial-container pt-[var(--section-gap)]">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-6">
          <ScrollReveal className="relative z-10 lg:col-span-8 lg:col-start-1 lg:row-start-1 lg:pb-10">
            <p className="chapter-label mb-7">02 · Identity</p>
            <h2 className="editorial-title text-[clamp(2.4rem,6.5vw,4.75rem)]">
              Operator first.
              <br />
              <span className="text-muted-foreground">Editor second.</span>
            </h2>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-muted-foreground">
              {siteProfile.headline}. I build the decision path, the automation boundary, and the
              proof layer so teams can move without guessing.
            </p>
          </ScrollReveal>

          {/* Proof strip — heroMetrics live below the hero, layered under the statement */}
          <ScrollReveal
            delay={0.12}
            className="relative mt-12 lg:col-span-7 lg:col-start-6 lg:row-start-2 lg:-mt-14"
          >
            <div className="proof-strip md:grid-cols-3">
              {heroMetrics.map((metric) => (
                <div key={metric.label}>
                  <p className="font-display text-4xl tracking-tight md:text-5xl">{metric.value}</p>
                  <p className="mt-2 text-sm font-medium">{metric.label}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {metric.detail}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* ── Pinned scene: roles reveal one-by-one against the spine ─────── */}
      <div ref={stageRef} className="about-stage relative lg:flex lg:min-h-[100svh] lg:items-center">
        <div className="editorial-container w-full py-20 lg:py-0">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-4">
              <p className="immersive-kicker mb-5">Roles in practice</p>
              <h3 className="font-display text-3xl leading-tight tracking-tight md:text-4xl">
                Four roles.
                <br />
                One operating model.
              </h3>
              <div className="relative mt-10 hidden h-36 lg:block" aria-hidden>
                {aboutRoles.map((_, index) => (
                  <span
                    key={index}
                    data-role-index={index}
                    className={`absolute left-0 top-0 font-display text-[8rem] leading-none tracking-tight text-foreground/[0.07] ${
                      index === 0 ? '' : 'opacity-0'
                    }`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                ))}
              </div>
            </div>

            <div className="hidden lg:col-span-1 lg:flex lg:justify-center" aria-hidden>
              <div className="relative w-px self-stretch bg-border/50">
                <div className="about-progress absolute inset-0 w-full origin-top bg-brand-accent/70" />
              </div>
            </div>

            <div className="lg:col-span-7">
              <ol className="space-y-10 lg:space-y-12">
                {aboutRoles.map((role, index) => (
                  <li
                    key={role.title}
                    data-role={index}
                    className="clip-mask grid grid-cols-[3.25rem_1fr] gap-5"
                  >
                    <span className="pt-1.5 font-mono text-xs tracking-widest text-brand-accent">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h4 className="font-display text-2xl tracking-tight md:text-[1.75rem]">
                        {role.title}
                      </h4>
                      <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
                        {role.description}
                      </p>
                      {role.stats ? (
                        <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground/70">
                          {role.stats}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* ── Principles timeline + expertise rows ────────────────────────── */}
      <div className="editorial-container pb-[var(--section-gap)] pt-8 lg:pt-0">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.15fr]">
          <ScrollReveal>
            <p className="immersive-kicker mb-8">Operating principles</p>
            <div ref={principlesRef} className="relative pl-8">
              <div className="absolute bottom-1 left-0 top-1 w-px bg-border/40">
                <motion.div
                  className="w-full origin-top bg-brand-accent/70"
                  style={{ height: principlesLine }}
                />
              </div>
              <ul className="space-y-10">
                {operatingPrinciples.map((principle, index) => (
                  <li key={principle.title} className="relative">
                    <span
                      className="absolute -left-8 top-1.5 h-2 w-2 -translate-x-1/2 border border-brand-accent bg-background"
                      aria-hidden
                    />
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground/70">
                      Principle {String(index + 1).padStart(2, '0')}
                    </p>
                    <h3 className="mt-2 text-base font-medium">{principle.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {principle.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <p className="immersive-kicker mb-6">Field map</p>
            <div>
              {Object.entries(expertiseByCategory).map(([category, items]) => (
                <div key={category} className="expertise-row">
                  <h3 className="pt-0.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {category}
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground/85">
                    {(items as string[]).join(' · ')}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
