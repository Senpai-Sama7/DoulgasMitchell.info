'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { operatingPrinciples, aboutRoles, expertiseByCategory } from '@/lib/site-content';
import {
  ScrollReveal,
  ScrollRevealItem,
  ScrollRevealStagger,
} from '@/components/immersive/scroll-reveal';

const accentNumbers = ['01', '02', '03', '04'];

export function ImmersiveAboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const lineH = useTransform(scrollYProgress, [0.1, 0.6], ['0%', '100%']);

  return (
    <section id="about" ref={sectionRef} className="section-spacing overflow-hidden">
      <div className="editorial-container">

        {/* Section header */}
        <ScrollReveal className="mb-20 grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:items-end">
          <div>
            <p className="immersive-kicker mb-4">About</p>
            <h2 className="editorial-title">
              Systems thinking<br />
              <span className="text-muted-foreground">with editorial precision.</span>
            </h2>
          </div>
          <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
            I work at the intersection of operations, AI, and human performance — designing
            systems that reduce ambiguity and increase execution quality. The through-line
            is always: less noise, sharper decisions, better outcomes.
          </p>
        </ScrollReveal>

        {/* Role cards with animated accent numbers */}
        <ScrollRevealStagger className="mb-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {aboutRoles.map((role, i) => (
            <ScrollRevealItem key={role.title}>
              <div className="bento-card group relative h-full overflow-hidden p-7">
                {/* Large background number */}
                <span
                  aria-hidden
                  className="absolute -right-2 -top-3 font-display text-[5rem] font-light leading-none text-foreground/5 transition-all duration-500 group-hover:text-foreground/8 group-hover:-translate-y-1"
                >
                  {accentNumbers[i]}
                </span>
                <div className="relative">
                  <h3 className="text-base font-medium">{role.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {role.description}
                  </p>
                  {role.stats && (
                    <p className="mt-4 text-xs text-muted-foreground/60">{role.stats}</p>
                  )}
                </div>
              </div>
            </ScrollRevealItem>
          ))}
        </ScrollRevealStagger>

        {/* Principles + expertise — two column with animated vertical line */}
        <div className="grid gap-16 lg:grid-cols-[1fr_1.1fr]">

          {/* Operating principles */}
          <ScrollReveal>
            <p className="immersive-kicker mb-8">Operating principles</p>
            <div className="relative pl-6">
              {/* Animated scroll-driven vertical line */}
              <div className="absolute left-0 top-0 h-full w-px bg-border/30">
                <motion.div
                  className="w-full origin-top bg-foreground/30"
                  style={{ height: lineH }}
                />
              </div>
              <ul className="space-y-8">
                {operatingPrinciples.map((p) => (
                  <li key={p.title}>
                    <h3 className="font-medium">{p.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {p.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          {/* Expertise matrix */}
          <ScrollReveal delay={0.12}>
            <p className="immersive-kicker mb-8">Expertise</p>
            <div className="space-y-7">
              {Object.entries(expertiseByCategory).map(([category, items]) => (
                <div key={category}>
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                    {category}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(items as string[]).map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-border/70 bg-muted/30 px-3 py-1 text-sm transition-colors hover:border-foreground/25 hover:bg-muted/60"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
