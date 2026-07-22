'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { ProjectShowcase } from '@/lib/site-content';
import { ScrollReveal } from '@/components/immersive/scroll-reveal';

interface ImmersiveWorkSectionProps {
  projects: ProjectShowcase[];
}

export function ImmersiveWorkSection({ projects }: ImmersiveWorkSectionProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(projects.map((project) => project.category)))],
    [projects]
  );
  const filtered = useMemo(
    () =>
      activeCategory === 'All'
        ? projects
        : projects.filter((project) => project.category === activeCategory),
    [activeCategory, projects]
  );

  return (
    <section id="work" className="section-spacing">
      <div className="editorial-container">
        <ScrollReveal className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="immersive-kicker mb-4">Work</p>
            <h2 className="editorial-title">
              Proof
              <br />
              <span className="text-muted-foreground">architecture.</span>
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Case studies written as decision logs: challenge, constraint, path taken, outcome.
            </p>
          </div>

          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Filter projects by category"
          >
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={activeCategory === category}
                onClick={() => setActiveCategory(category)}
                className={`min-h-10 border px-3.5 text-sm transition-colors ${
                  activeCategory === category
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border/80 text-muted-foreground hover:border-foreground/35 hover:text-foreground'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </ScrollReveal>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-border/60"
          >
            {filtered.map((project, index) => {
              const featured = index === 0 && activeCategory === 'All';
              return (
                <Link
                  key={project.slug}
                  href={`/work/${project.slug}`}
                  className="work-row group block"
                >
                  <span className="font-mono text-xs tracking-widest text-muted-foreground">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: project.color }}
                        aria-hidden
                      />
                      <span>{project.category}</span>
                      <span className="text-muted-foreground/40">·</span>
                      <span>{project.timeline}</span>
                      <span className="text-muted-foreground/40">·</span>
                      <span>{project.status}</span>
                    </div>
                    <h3
                      className={`tracking-tight transition-colors group-hover:text-foreground ${
                        featured
                          ? 'font-display text-3xl md:text-4xl'
                          : 'text-xl font-medium md:text-2xl'
                      }`}
                    >
                      {project.title}
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                      {project.description}
                    </p>
                    {featured ? (
                      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground/80">
                        {project.techStack.slice(0, 5).map((tech) => (
                          <li key={tech}>{tech}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <span className="inline-flex h-10 w-10 items-center justify-center border border-border/70 text-muted-foreground transition-colors group-hover:border-foreground/45 group-hover:text-foreground">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </Link>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
