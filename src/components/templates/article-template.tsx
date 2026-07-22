'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { ContentRenderer } from '@/components/site/content-renderer';
import type { ArticleShowcase } from '@/lib/site-content';
import { ScrollReveal, ScrollRevealItem, ScrollRevealStagger } from '@/components/immersive/scroll-reveal';
interface ArticleTemplateProps {
  article: ArticleShowcase;
  related?: ArticleShowcase[];
}

export function ArticleTemplate({ article, related = [] }: ArticleTemplateProps) {
  return (
    <>
      <article className="pb-20">
        <div className="editorial-container pt-6">
          <ScrollReveal>
            <Link
              href="/#writing"
              data-cursor="interactive"
              className="inline-flex min-h-11 items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Chapter 06 · Voice
            </Link>
          </ScrollReveal>
        </div>

        <header className="editorial-container mx-auto mt-10 max-w-[44rem]">
          <ScrollReveal>
            <div className="mb-6 flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <p className="chapter-label">{article.category}</p>
              <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground/70">
                {article.readTime} · {article.date}
              </span>
            </div>
            <h1 className="editorial-title">{article.title}</h1>
            <p className="mt-6 text-xl leading-relaxed text-muted-foreground">{article.excerpt}</p>
            {article.tags.length > 0 ? (
              <p className="mt-8 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                {article.tags.join(' · ')}
              </p>
            ) : null}
          </ScrollReveal>
        </header>

        <div className="editorial-container mx-auto mt-4 max-w-[44rem]">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        <ScrollReveal className="editorial-container mx-auto mt-12 max-w-[44rem]">
          <div className="reading-content prose prose-neutral dark:prose-invert max-w-none">
            <ContentRenderer content={article.content} />
          </div>
        </ScrollReveal>

        {related.length > 0 ? (
          <div className="editorial-container mt-20">
            <ScrollReveal className="mb-8">
              <p className="chapter-label mb-4">Related · Voice</p>
              <h2 className="font-display text-2xl tracking-tight">More essays</h2>
            </ScrollReveal>
            <ScrollRevealStagger className="grid gap-4 md:grid-cols-2">
              {related.map((item) => (
                <ScrollRevealItem key={item.slug}>
                  <Link
                    href={`/writing/${item.slug}`}
                    data-cursor="interactive"
                    className="bento-card group block p-6 md:p-8"
                  >
                    <p className="immersive-kicker mb-3">{item.category}</p>
                    <h3 className="font-medium leading-snug">
                      <span className="lux-underline">{item.title}</span>
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.excerpt}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                      Read essay
                      <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </ScrollRevealItem>
              ))}
            </ScrollRevealStagger>
          </div>
        ) : null}
      </article>
    </>
  );
}
