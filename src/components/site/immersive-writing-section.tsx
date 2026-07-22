'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Clock } from 'lucide-react';
import type { ArticleShowcase } from '@/lib/site-content';
import { ScrollReveal, ScrollRevealItem, ScrollRevealStagger } from '@/components/immersive/scroll-reveal';

interface ImmersiveWritingSectionProps {
  articles: ArticleShowcase[];
}

export function ImmersiveWritingSection({ articles }: ImmersiveWritingSectionProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section id="writing" className="section-spacing">
      <div className="editorial-container">
        <ScrollReveal className="mb-12 grid gap-8 lg:grid-cols-[1fr_1.5fr] lg:items-end">
          <div>
            <p className="immersive-kicker mb-4">Writing</p>
            <h2 className="editorial-title">
              Essays &amp;
              <br />
              <span className="text-muted-foreground">field notes.</span>
            </h2>
          </div>
          <p className="max-w-xl text-muted-foreground">
            Long-form work on operations, context engineering, and human performance. Written to be
            used, cited, and argued with.
          </p>
        </ScrollReveal>

        <ScrollRevealStagger className="divide-y divide-border/55 border-y border-border/55">
          {articles.map((article, index) => (
            <ScrollRevealItem key={article.slug}>
              <Link
                href={`/writing/${article.slug}`}
                className="group block"
                onMouseEnter={() => setHovered(article.slug)}
                onMouseLeave={() => setHovered(null)}
              >
                <article className="flex flex-col gap-5 py-8 md:flex-row md:items-start md:gap-10">
                  <div
                    className="hidden shrink-0 font-display text-5xl font-light leading-none text-foreground/10 transition-colors group-hover:text-foreground/18 md:block"
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
                        <span className="link-underline">{article.title}</span>
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {article.excerpt}
                      </p>
                      <p className="mt-3 text-xs leading-relaxed text-muted-foreground/70">
                        {article.tags.slice(0, 3).join(' · ')}
                      </p>
                    </div>

                    <motion.span
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-border/70 text-muted-foreground transition-colors group-hover:border-foreground/40 group-hover:text-foreground"
                      animate={hovered === article.slug ? { x: 2, y: -2 } : { x: 0, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </motion.span>
                  </div>
                </article>
              </Link>
            </ScrollRevealItem>
          ))}
        </ScrollRevealStagger>

        <ScrollReveal delay={0.08} className="mt-10">
          <Link href="/search?q=" className="immersive-button-ghost inline-flex">
            Browse all writing
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
