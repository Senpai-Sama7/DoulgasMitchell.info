'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, ExternalLink, GitFork, Github, Star, Terminal } from 'lucide-react';
import type { ProjectShowcase } from '@/lib/site-content';

const stats = [
  { label: 'Repositories', value: '85+' },
  { label: 'Stars Earned', value: '200+' },
  { label: 'Contributions', value: '500+' },
  { label: 'Languages', value: '12' },
];

interface EnhancedWorkSectionProps {
  projects: ProjectShowcase[];
}

export function EnhancedWorkSection({ projects }: EnhancedWorkSectionProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(projects.map((project) => project.category)))],
    [projects]
  );
  const filteredProjects = useMemo(
    () =>
      activeCategory === 'All'
        ? projects
        : projects.filter((project) => project.category === activeCategory),
    [activeCategory, projects]
  );
  const spotlightProject = filteredProjects[0] ?? projects[0];
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section id="work" className="section-spacing relative overflow-hidden" ref={containerRef}>
      {/* Background decoration */}
      <motion.div 
        style={{ y: prefersReducedMotion ? 0 : y }}
        className="absolute inset-0 opacity-30 pointer-events-none"
      >
        <div className="absolute top-20 left-10 font-mono text-[120px] text-muted-foreground/5">
          &lt;/&gt;
        </div>
        <div className="absolute bottom-20 right-10 font-mono text-[100px] text-muted-foreground/5">
          { } [ ]
        </div>
      </motion.div>

      <div className="editorial-container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs text-muted-foreground">{'// 02'}</span>
            <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h2 className="editorial-title mb-4">
                Proof Architecture
              </h2>
              <p className="editorial-subtitle max-w-xl">
                Real systems, real thinking, real delivery discipline. These case studies show how strategy becomes execution.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="font-mono text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-8 space-y-2">
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
              Filter case studies
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter work by category">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={activeCategory === category}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    activeCategory === category
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background hover:border-primary/40'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid gap-4 md:gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
          {filteredProjects.map((project, index) => (
            <motion.article
              key={project.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onHoverStart={() => setHoveredProject(project.slug)}
              onHoverEnd={() => setHoveredProject(null)}
              className="group relative"
            >
              {/* Project Card */}
              <div className={`relative h-full border border-border rounded-xl overflow-hidden bg-gradient-to-br ${project.color} backdrop-blur-sm`}>
                {/* Terminal Header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <span className="font-mono text-xs text-muted-foreground">
                      {project.category.toLowerCase().replace(' ', '-')}
                    </span>
                  </div>
                  {project.githubUrl ? (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={`View ${project.title} on GitHub`}
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  ) : (
                    <span className="h-4 w-4" />
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-muted-foreground" />
                    {project.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {project.description}
                  </p>

                  <div className="mb-4 flex flex-wrap gap-2 text-xs">
                    {project.metrics.map((metric) => (
                      <span
                        key={metric.label}
                        className="rounded-full border border-border/70 bg-background/70 px-2.5 py-1 font-mono text-muted-foreground"
                      >
                        {metric.label}: {metric.value}
                      </span>
                    ))}
                  </div>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 text-xs font-mono bg-muted/50 rounded border border-border/50"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 hover:text-yellow-500 transition-colors">
                        <Star className="h-3.5 w-3.5" />
                        {project.stars}
                      </span>
                      <span className="inline-flex items-center gap-1 hover:text-primary transition-colors">
                        <GitFork className="h-3.5 w-3.5" />
                        {project.forks}
                      </span>
                    </div>
                    <Link
                      href={`/work/${project.slug}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary"
                    >
                      Case study
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                    <motion.div
                      animate={{ 
                        x: hoveredProject === project.slug ? 0 : -10,
                        opacity: hoveredProject === project.slug ? 1 : 0 
                      }}
                      className="text-primary"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </motion.div>
                  </div>
                </div>

                {/* Hover Border Effect */}
                <motion.div
                  className="absolute inset-0 border-2 border-primary rounded-xl pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: hoveredProject === project.slug ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                />
              </div>

              {/* ASCII Corner Decoration */}
              <div className="absolute -top-2 -left-2 font-mono text-xs text-muted-foreground/30 pointer-events-none">
                ╭
              </div>
              <div className="absolute -bottom-2 -right-2 font-mono text-xs text-muted-foreground/30 pointer-events-none">
                ╯
              </div>
            </motion.article>
          ))}
          </div>

          {spotlightProject && (
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-[1.75rem] border border-border bg-background p-6 xl:sticky xl:top-28"
            >
              <div className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Project spotlight
              </div>
              <h3 className="mt-4 text-2xl font-semibold">{spotlightProject.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {spotlightProject.longDescription}
              </p>

              <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                <span className="rounded-full border border-border/70 px-3 py-1">{spotlightProject.category}</span>
                <span className="rounded-full border border-border/70 px-3 py-1">{spotlightProject.timeline}</span>
                <span className="rounded-full border border-border/70 px-3 py-1">{spotlightProject.status}</span>
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary">Challenge</div>
                  <p className="mt-2 text-sm text-muted-foreground">{spotlightProject.challenge}</p>
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary">How it was shaped</div>
                  <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                    {spotlightProject.solution.slice(0, 3).map((step) => (
                      <li key={step} className="flex gap-2">
                        <span className="text-primary">◆</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-[0.2em] text-primary">Outcomes</div>
                  <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                    {spotlightProject.outcomes.map((outcome) => (
                      <li key={outcome} className="flex gap-2">
                        <span className="text-primary">◆</span>
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/work/${spotlightProject.slug}`} className="cta-button">
                  Read case study
                </Link>
                {spotlightProject.githubUrl && (
                  <a
                    href={spotlightProject.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ghost-button"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                )}
              </div>
            </motion.aside>
          )}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <a
            href="https://github.com/Senpai-Sama7"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-6 py-3 border border-border rounded-full hover:border-primary/50 hover:bg-muted/30 transition-all group"
          >
            <Github className="h-5 w-5" />
            <span>View All Projects on GitHub</span>
            <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </motion.div>

        {/* ASCII Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center font-mono text-xs text-muted-foreground/30"
        >
          {'/* Built with passion. Shipped with confidence. */'}
        </motion.div>
      </div>
    </section>
  );
}
