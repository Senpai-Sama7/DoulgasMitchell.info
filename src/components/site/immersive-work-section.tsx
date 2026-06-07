'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { ProjectShowcase } from '@/lib/site-content';
import { ScrollReveal } from '@/components/immersive/scroll-reveal';

interface ImmersiveWorkSectionProps {
  projects: ProjectShowcase[];
}

export function ImmersiveWorkSection({ projects }: ImmersiveWorkSectionProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(projects.map((p) => p.category)))],
    [projects]
  );
  const filtered = useMemo(
    () =>
      activeCategory === 'All'
        ? projects
        : projects.filter((p) => p.category === activeCategory),
    [activeCategory, projects]
  );

  return (
    <section id="work" className="section-spacing">
      <div className="editorial-container">

        {/* Header */}
        <ScrollReveal className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="immersive-kicker mb-4">Work</p>
            <h2 className="editorial-title">
              Proof<br />
              <span className="text-muted-foreground">architecture.</span>
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Real systems, real thinking, real delivery discipline. Every case study shows
              the decision logic behind the execution.
            </p>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter projects by category">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-foreground text-background shadow-md'
                    : 'border border-border/70 text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Bento grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {filtered.map((project, index) => {
              const isFeature = index === 0;
              return (
                <div
                  key={project.slug}
                  className={isFeature ? 'md:col-span-2 xl:row-span-2' : ''}
                >
                  <Link href={`/work/${project.slug}`} className="group block h-full">
                    <article
                      className="bento-card relative flex h-full flex-col overflow-hidden"
                      style={{ minHeight: isFeature ? 380 : 240 }}
                    >
                      {/* Accent gradient from project color */}
                      <div
                        className="pointer-events-none absolute inset-x-0 top-0 h-1 opacity-60 transition-opacity group-hover:opacity-100"
                        style={{
                          background: `linear-gradient(90deg, ${project.color}, color-mix(in oklch, ${project.color}, transparent 60%))`,
                        }}
                        aria-hidden
                      />

                      <div className="flex flex-1 flex-col p-6 md:p-8">
                        <div className="immersive-kicker mb-4 flex items-center gap-2">
                          <span
                            className="inline-block h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: project.color }}
                          />
                          {project.category}
                          <span className="text-muted-foreground/40">·</span>
                          {project.timeline}
                        </div>

                        <h3
                          className={`font-medium tracking-tight ${
                            isFeature ? 'text-3xl md:text-4xl' : 'text-2xl'
                          }`}
                        >
                          {project.title}
                        </h3>

                        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground md:text-base">
                          {project.description}
                        </p>

                        {isFeature && (
                          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {project.metrics.slice(0, 3).map((m) => (
                              <div key={m.label} className="rounded-xl bg-muted/40 p-3">
                                <div className="text-lg font-medium">{m.value}</div>
                                <div className="mt-0.5 text-xs text-muted-foreground">{m.label}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-6 flex items-center justify-between">
                          <div className="flex flex-wrap gap-2">
                            {project.techStack.slice(0, 3).map((t) => (
                              <span
                                key={t}
                                className="rounded-full bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">
                            Case study
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
