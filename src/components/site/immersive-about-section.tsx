'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  aboutRoles,
  expertiseByCategory,
  heroMetrics,
  operatingPrinciples,
  siteProfile,
} from '@/lib/site-content';
import { ScrollReveal } from '@/components/immersive/scroll-reveal';

export function ImmersiveAboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const lineH = useTransform(scrollYProgress, [0.12, 0.62], ['0%', '100%']);

  return (
    <section id="about" ref={sectionRef} className="section-spacing overflow-hidden">
      <div className="editorial-container">
        <ScrollReveal className="mb-16 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end">
          <div>
            <p className="immersive-kicker mb-4">About</p>
            <h2 className="editorial-title">
              Operator first.
              <br />
              <span className="text-muted-foreground">Editor second.</span>
            </h2>
          </div>
          <p className="max-w-md text-lg leading-relaxed text-muted-foreground lg:justify-self-end">
            {siteProfile.headline}. I build the decision path, the automation boundary, and the
            proof layer so teams can move without guessing.
          </p>
        </ScrollReveal>

        {/* Asymmetric role narrative — not four equal cards */}
        <div className="mb-20 grid gap-10 lg:grid-cols-[5fr_7fr]">
          <ScrollReveal className="space-y-6">
            <p className="immersive-kicker">Roles in practice</p>
            <ol className="space-y-0">
              {aboutRoles.map((role, index) => (
                <li
                  key={role.title}
                  className="grid grid-cols-[3rem_1fr] gap-4 border-t border-border/60 py-5 first:border-t-0 first:pt-0"
                >
                  <span className="font-mono text-xs tracking-widest text-brand-accent">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-lg font-medium tracking-tight">{role.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {role.description}
                    </p>
                    {role.stats ? (
                      <p className="mt-3 text-xs text-muted-foreground/70">{role.stats}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </ScrollReveal>

          <ScrollReveal delay={0.08} className="lg:pt-10">
            <div className="proof-strip">
              {heroMetrics.map((metric) => (
                <div key={metric.label}>
                  <p className="font-display text-4xl tracking-tight md:text-5xl">{metric.value}</p>
                  <p className="mt-2 text-sm font-medium">{metric.label}</p>
                  <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    {metric.detail}
                  </p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>

        <div className="grid gap-16 lg:grid-cols-[1fr_1.15fr]">
          <ScrollReveal>
            <p className="immersive-kicker mb-8">Operating principles</p>
            <div className="relative pl-6">
              <div className="absolute left-0 top-0 h-full w-px bg-border/40">
                <motion.div className="w-full origin-top bg-brand-accent/70" style={{ height: lineH }} />
              </div>
              <ul className="space-y-9">
                {operatingPrinciples.map((principle) => (
                  <li key={principle.title}>
                    <h3 className="text-base font-medium">{principle.title}</h3>
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
