'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ExternalLink, Github, Star, GitFork } from 'lucide-react';

const featuredProjects = [
  {
    title: 'AI Workflow Automation',
    description: 'Intelligent automation systems that streamline operations and reduce manual overhead. Built with modern AI integration patterns.',
    tech: ['Python', 'LangChain', 'OpenAI', 'n8n'],
    category: 'AI Automation',
    github: 'https://github.com/Senpai-Sama7',
    stars: 42,
    forks: 12,
  },
  {
    title: 'The Confident Mind Platform',
    description: 'Digital platform companion for the book, featuring interactive exercises, progress tracking, and community features.',
    tech: ['Next.js', 'TypeScript', 'Prisma', 'Tailwind'],
    category: 'Web Development',
    github: 'https://github.com/Senpai-Sama7',
    stars: 38,
    forks: 8,
  },
  {
    title: 'Systems Architecture Toolkit',
    description: 'Collection of reusable patterns and tools for building scalable, maintainable systems. Documentation-first approach.',
    tech: ['TypeScript', 'Node.js', 'Docker', 'AWS'],
    category: 'System Design',
    github: 'https://github.com/Senpai-Sama7',
    stars: 56,
    forks: 15,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function WorkSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="work" className="section-spacing">
      <div className="editorial-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="ascii-marker mb-4 justify-center">
            <span>Work</span>
          </div>
          <h2 className="editorial-title mb-4">
            Proof Architecture
          </h2>
          <p className="editorial-subtitle max-w-2xl mx-auto">
            85+ repositories of public proof. Real systems, real solutions, real impact.
            Every project represents a commitment to quality and meaningful outcomes.
          </p>
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          variants={shouldReduceMotion ? {} : containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid lg:grid-cols-3 gap-6"
        >
          {featuredProjects.map((project) => (
            <motion.article
              key={project.title}
              variants={shouldReduceMotion ? {} : itemVariants}
              className="group border border-border rounded-lg overflow-hidden bg-background hover:border-primary/30 transition-colors"
            >
              {/* Project Header */}
              <div className="p-6 border-b border-border bg-muted/30">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {project.category}
                    </span>
                    <h3 className="font-semibold text-lg mt-1 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                  </div>
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={`View ${project.title} on GitHub`}
                  >
                    <Github className="h-5 w-5" />
                  </a>
                </div>
              </div>

              {/* Project Body */}
              <div className="p-6">
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {project.description}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 text-xs bg-muted rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5" />
                    {project.stars}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <GitFork className="h-3.5 w-3.5" />
                    {project.forks}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <a
            href="https://github.com/Senpai-Sama7"
            target="_blank"
            rel="noopener noreferrer"
            className="ghost-button"
          >
            <Github className="h-4 w-4" />
            View All Projects on GitHub
            <ExternalLink className="h-3 w-3" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
