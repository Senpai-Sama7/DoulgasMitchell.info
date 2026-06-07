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
        <ScrollReveal className="mb-12 grid gap-8 lg:grid-cols-[1fr_1.6fr] lg:items-end">
          <div>
            <p className="immersive-kicker mb-4">Writing</p>
            <h2 className="editorial-title">
              Essays &amp;<br />
              <span className="text-muted-foreground">field notes.</span>
            </h2>
          </div>
          <p className="max-w-xl text-muted-foreground">
            Long-form thinking on operations, AI, and human performance.
            Written to be actionable, not just interesting.
          </p>
        </ScrollReveal>

        <ScrollRevealStagger className="divide-y divide-border/50">
          {articles.map((article, index) => (
            <ScrollRevealItem key={article.slug}>
              <Link
                href={`/writing/${article.slug}`}
                className="group block"
                onMouseEnter={() => setHovered(article.slug)}
                onMouseLeave={() => setHovered(null)}
              >
                <article className="flex flex-col gap-5 py-8 transition-all duration-300 md:flex-row md:items-start md:gap-10">
                  {/* Index number */}
                  <div
                    className="hidden shrink-0 font-display text-5xl font-light leading-none text-foreground/8 transition-colors group-hover:text-foreground/14 md:block"
                    aria-hidden
                  >
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="max-w-2xl">
                      <div className="immersive-kicker mb-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-muted/60 px-2.5 py-0.5">{article.category}</span>
                        <span className="text-muted-foreground/40">·</span>
                        <Clock className="h-3 w-3" aria-hidden />
                        {article.readTime}
                        <span className="text-muted-foreground/40">·</span>
                        {article.date}
                        {article.trending && (
                          <span className="rounded-full bg-brand-accent/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-brand-accent">
                            Trending
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-medium leading-snug tracking-tight transition-colors group-hover:text-foreground md:text-2xl">
                        {article.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {article.excerpt}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {article.tags.slice(0, 3).map((t) => (
                          <span key={t} className="text-xs text-muted-foreground/60">#{t}</span>
                        ))}
                      </div>
                    </div>

                    <motion.span
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition-colors group-hover:border-foreground/40 group-hover:text-foreground"
                      animate={hovered === article.slug ? { scale: 1.08 } : { scale: 1 }}
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

        {/* Footer CTA */}
        <ScrollReveal delay={0.1} className="mt-10">
          <Link
            href="/search?q="
            className="immersive-button-ghost inline-flex"
          >
            Browse all writing
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
