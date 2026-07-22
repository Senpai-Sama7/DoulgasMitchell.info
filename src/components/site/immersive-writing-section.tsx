'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Clock } from 'lucide-react';
import type { ArticleShowcase } from '@/lib/site-content';
import { Magnetic } from '@/components/immersive/magnetic';
import {
  ScrollReveal,
  ScrollRevealItem,
  ScrollRevealStagger,
} from '@/components/immersive/scroll-reveal';

interface ImmersiveWritingSectionProps {
  articles: ArticleShowcase[];
}

const lineContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14 } },
};

const lineReveal = {
  hidden: { y: '110%' },
  visible: {
    y: '0%',
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] as const },
  },
};

/** Masked line reveal for the chapter heading — staggers on enter. */
function KineticHeading({ lines }: { lines: React.ReactNode[] }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.h2
      className="editorial-title"
      initial={prefersReducedMotion ? false : 'hidden'}
      whileInView={prefersReducedMotion ? undefined : 'visible'}
      viewport={{ once: true, margin: '-12%' }}
      variants={prefersReducedMotion ? undefined : lineContainer}
    >
      {lines.map((line, index) => (
        <span key={index} className="kinetic-line">
          <motion.span
            className="kinetic-line-inner"
            variants={prefersReducedMotion ? undefined : lineReveal}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </motion.h2>
  );
}

export function ImmersiveWritingSection({ articles }: ImmersiveWritingSectionProps) {
  return (
    <section id="writing" className="section-spacing">
      <div className="editorial-container">
        <div className="mb-12 grid gap-8 lg:grid-cols-[1fr_1.5fr] lg:items-end">
          <div>
            <ScrollReveal y={12}>
              <p className="chapter-label mb-5">09 · Voice</p>
            </ScrollReveal>
            <KineticHeading
              lines={[
                <>Essays &amp;</>,
                <span key="l2" className="text-muted-foreground">
                  field notes.
                </span>,
              ]}
            />
          </div>
          <ScrollReveal delay={0.1}>
            <p className="max-w-xl text-muted-foreground">
              Long-form work on operations, context engineering, and human performance. Written to
              be used, cited, and argued with.
            </p>
          </ScrollReveal>
        </div>

        <ScrollRevealStagger className="divide-y divide-border/55 border-y border-border/55">
          {articles.map((article, index) => (
            <ScrollRevealItem key={article.slug}>
              <Link
                href={`/writing/${article.slug}`}
                className="group block"
                data-cursor="interactive"
              >
                <article className="flex flex-col gap-5 py-8 md:flex-row md:items-start md:gap-10">
                  <div
                    className="hidden shrink-0 font-display text-5xl font-light leading-none text-foreground/10 transition-colors duration-500 group-hover:text-brand-accent/40 md:block"
                    aria-hidden
                  >
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="max-w-2xl">
                      <div className="immersive-kicker mb-3 flex flex-wrap items-center gap-2 !normal-case !tracking-normal">
                        <span className="border border-border/70 px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.16em]">
                          {article.category}
                        </span>
                        <span className="text-muted-foreground/40">·</span>
                        <Clock className="h-3 w-3" aria-hidden />
                        <span className="text-xs tracking-wide text-muted-foreground">
                          {article.readTime}
                        </span>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="text-xs tracking-wide text-muted-foreground">
                          {article.date}
                        </span>
                        {article.trending ? (
                          <span className="border border-brand-accent/40 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-brand-accent">
                            Active
                          </span>
                        ) : null}
                      </div>
                      <h3 className="text-xl font-medium leading-snug tracking-tight md:text-2xl">
                        <span className="lux-underline">{article.title}</span>
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {article.excerpt}
                      </p>
                      <p className="mt-3 text-xs leading-relaxed text-muted-foreground/70">
                        {article.tags.slice(0, 3).join(' · ')}
                      </p>
                    </div>

                    <Magnetic strength={0.28} radius={72} className="shrink-0">
                      <span className="inline-flex h-10 w-10 items-center justify-center border border-border/70 text-muted-foreground transition-colors duration-300 group-hover:border-foreground/40 group-hover:text-foreground">
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    </Magnetic>
                  </div>
                </article>
              </Link>
            </ScrollRevealItem>
          ))}
        </ScrollRevealStagger>

        <ScrollReveal delay={0.08} className="mt-10">
          <Magnetic strength={0.22}>
            <Link href="/search?q=" className="immersive-button-ghost inline-flex">
              Browse all writing
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Magnetic>
        </ScrollReveal>
      </div>
    </section>
  );
}
