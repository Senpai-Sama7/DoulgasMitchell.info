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
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to writing
            </Link>
          </ScrollReveal>
        </div>

        <header className="editorial-container mx-auto mt-10 max-w-[44rem]">
          <ScrollReveal>
            <div className="immersive-kicker mb-6 flex flex-wrap gap-x-3 gap-y-1">
              <span>{article.category}</span>
              <span className="text-muted-foreground/30">·</span>
              <span>{article.readTime}</span>
              <span className="text-muted-foreground/30">·</span>
              <span>{article.date}</span>
            </div>
            <h1 className="editorial-title">{article.title}</h1>
            <p className="mt-6 text-xl leading-relaxed text-muted-foreground">{article.excerpt}</p>
            {article.tags.length > 0 ? (
              <div className="mt-8 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border/60 bg-muted/20 px-3 py-1 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
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
              <p className="immersive-kicker mb-2">Related</p>
              <h2 className="font-display text-2xl tracking-tight">More essays</h2>
            </ScrollReveal>
            <ScrollRevealStagger className="grid gap-4 md:grid-cols-2">
              {related.map((item) => (
                <ScrollRevealItem key={item.slug}>
                  <Link href={`/writing/${item.slug}`} className="bento-card group block p-6 md:p-8">
                    <p className="immersive-kicker mb-3">{item.category}</p>
                    <h3 className="font-medium leading-snug transition-colors group-hover:text-foreground/80">
                      {item.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.excerpt}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
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
