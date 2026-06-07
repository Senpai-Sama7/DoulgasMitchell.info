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
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to work
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
            <div className="immersive-kicker mb-6 flex flex-wrap items-center gap-3">
              <span>{project.category}</span>
              <span className="text-muted-foreground/30">·</span>
              <span>{project.timeline}</span>
              <span className="text-muted-foreground/30">·</span>
              <span>{project.status}</span>
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
              <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {project.metrics.map((metric) => (
                  <div key={metric.label} className="glass-panel p-5">
                    <div className="text-2xl font-light tracking-tight tabular-nums">{metric.value}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{metric.label}</div>
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

      <div className="editorial-container mt-14">
        <ScrollRevealStagger className="grid gap-4 lg:grid-cols-3">
          <ScrollRevealItem>
            <div className="bento-card h-full p-6 md:p-8">
              <p className="immersive-kicker mb-4">Challenge</p>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                {project.challenge}
              </p>
            </div>
          </ScrollRevealItem>
          <ScrollRevealItem>
            <div className="bento-card h-full p-6 md:p-8">
              <p className="immersive-kicker mb-4">Solution</p>
              <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
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
            <div className="bento-card h-full p-6 md:p-8">
              <p className="immersive-kicker mb-4">Outcomes</p>
              <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
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
        <div className="flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-border/70 bg-background/60 px-3.5 py-1.5 text-sm text-muted-foreground"
            >
              {tech}
            </span>
          ))}
        </div>
      </ScrollReveal>

      {nextProject ? (
        <ScrollReveal className="editorial-container mt-16">
          <Link href={`/work/${nextProject.slug}`} className="group block">
            <div className="bento-card p-8 md:p-10">
              <p className="immersive-kicker mb-3">Next case study</p>
              <h2 className="font-display text-3xl tracking-tight transition-colors group-hover:text-foreground/80">
                {nextProject.title}
              </h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">{nextProject.description}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium">
                Continue reading
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        </ScrollReveal>
      ) : null}
    </div>
  );
}
