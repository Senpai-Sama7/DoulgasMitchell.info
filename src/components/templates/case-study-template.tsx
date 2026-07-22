'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, Github } from 'lucide-react';
import { ContentRenderer } from '@/components/site/content-renderer';
import type { ProjectShowcase } from '@/lib/site-content';
import { ScrollReveal, ScrollRevealItem, ScrollRevealStagger } from '@/components/immersive/scroll-reveal';
import { cn } from '@/lib/utils';

interface CaseStudyTemplateProps {
  project: ProjectShowcase;
  nextProject?: ProjectShowcase | null;
}

export function CaseStudyTemplate({ project, nextProject }: CaseStudyTemplateProps) {
  return (
    <div className="pb-20">
      <ScrollReveal className="editorial-container pt-6">
        <Link
          href="/#work"
          data-cursor="interactive"
          className="inline-flex min-h-11 items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Chapter 04 · Proof
        </Link>
      </ScrollReveal>

      {/* Full-bleed hero */}
      <ScrollReveal className="mt-8">
        <div
          className={cn(
            'relative overflow-hidden border-y border-border/40',
            'bg-gradient-to-br from-background via-background to-muted/30'
          )}
        >
          <div
            className={cn('pointer-events-none absolute inset-0 opacity-80', project.color)}
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in_oklch,var(--brand-accent),transparent_88%),transparent_55%)]" />

          <div className="editorial-container relative py-16 md:py-24">
            <div className="mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <p className="chapter-label">{project.category}</p>
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground/70">
                {project.timeline} · {project.status}
              </span>
            </div>

            <h1 className="display-title max-w-5xl">{project.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              {project.description}
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              {project.githubUrl ? (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="immersive-button"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              ) : null}
              {project.liveUrl ? (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="immersive-button-ghost"
                >
                  Live experience
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              ) : null}
            </div>

            {project.metrics.length > 0 ? (
              <div className="proof-strip mt-12 sm:grid-cols-2 lg:grid-cols-4">
                {project.metrics.map((metric) => (
                  <div key={metric.label}>
                    <div className="text-2xl font-light tracking-tight tabular-nums">{metric.value}</div>
                    <div className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal className="editorial-container mt-14 max-w-3xl">
        <ContentRenderer content={project.longDescription} />
      </ScrollReveal>

      {/* Brief ledger — labelled editorial rows, not a card farm */}
      <div className="editorial-container mt-14">
        <ScrollRevealStagger className="divide-y divide-border/60 border-y border-border/60">
          <ScrollRevealItem>
            <div className="grid gap-3 py-8 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-8">
              <p className="chapter-label">Challenge</p>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                {project.challenge}
              </p>
            </div>
          </ScrollRevealItem>
          <ScrollRevealItem>
            <div className="grid gap-3 py-8 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-8">
              <p className="chapter-label">Solution</p>
              <ul className="max-w-2xl space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                {project.solution.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollRevealItem>
          <ScrollRevealItem>
            <div className="grid gap-3 py-8 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-8">
              <p className="chapter-label">Outcomes</p>
              <ul className="max-w-2xl space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                {project.outcomes.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-foreground/40" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollRevealItem>
        </ScrollRevealStagger>
      </div>

      <ScrollReveal className="editorial-container mt-12">
        <p className="immersive-kicker mb-4">Stack</p>
        <p className="max-w-3xl font-mono text-[0.7rem] uppercase leading-loose tracking-[0.16em] text-muted-foreground">
          {project.techStack.join(' · ')}
        </p>
      </ScrollReveal>

      {nextProject ? (
        <ScrollReveal className="editorial-container mt-16">
          <Link
            href={`/work/${nextProject.slug}`}
            data-cursor="interactive"
            className="group block border-y border-border/60 py-10 md:py-12"
          >
            <p className="chapter-label mb-5">Next · Proof</p>
            <h2 className="font-display text-3xl tracking-tight md:text-4xl">
              <span className="lux-underline">{nextProject.title}</span>
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">{nextProject.description}</p>
            <span className="mt-6 inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors group-hover:text-foreground">
              Continue reading
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </Link>
        </ScrollReveal>
      ) : null}
    </div>
  );
}
