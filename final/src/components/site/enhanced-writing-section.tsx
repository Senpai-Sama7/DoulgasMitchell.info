'use client';

import Link from 'next/link';
import { FormEvent, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Clock, Sparkles, Tag, TrendingUp } from 'lucide-react';
import type { ArticleShowcase } from '@/lib/site-content';

interface EnhancedWritingSectionProps {
  articles: ArticleShowcase[];
}

export function EnhancedWritingSection({ articles }: EnhancedWritingSectionProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const categories = ['All', ...Array.from(new Set(articles.map((article) => article.category)))];
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  
  const x = useTransform(scrollYProgress, [0, 1], [-50, 50]);

  const filteredArticles = activeCategory === 'All' 
    ? articles 
    : articles.filter(a => a.category === activeCategory);

  const handleSubscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          source: 'writing-section',
        }),
      });

      if (!response.ok) {
        throw new Error('Unable to subscribe');
      }

      setEmail('');
      setName('');
      setStatus('success');
    } catch {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="writing" className="section-spacing relative overflow-hidden" ref={containerRef}>
      {/* Background Animation */}
      <motion.div 
        style={{ x: prefersReducedMotion ? 0 : x }}
        className="absolute top-1/2 left-0 font-mono text-[200px] text-muted-foreground/5 pointer-events-none select-none -translate-y-1/2"
      >
        WRITING
      </motion.div>

      <div className="editorial-container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs text-muted-foreground">{'// 05'}</span>
            <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
          </div>
          
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h2 className="editorial-title mb-4">
                Thoughts & Insights
              </h2>
              <p className="editorial-subtitle max-w-xl">
                Exploring the intersection of technology, operations, and human potential.
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 text-sm font-mono rounded-lg transition-all ${
                    activeCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredArticles.map((article, index) => (
            <motion.article
              key={article.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`group relative border border-border rounded-xl overflow-hidden bg-background ${
                article.featured ? 'md:col-span-2 lg:col-span-1' : ''
              }`}
            >
              {/* Top Accent */}
              <div className={`h-1 ${article.featured ? 'bg-gradient-to-r from-primary via-primary/50 to-primary' : 'bg-muted'}`} />

              {/* Content */}
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                      {article.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {article.featured && (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-mono bg-primary/10 text-primary rounded">
                        <Sparkles className="h-3 w-3" />
                        Featured
                      </span>
                    )}
                    {article.trending && (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded">
                        <TrendingUp className="h-3 w-3" />
                        Trending
                      </span>
                    )}
                  </div>
                </div>

                {/* Title */}
                <Link href={`/writing/${article.slug}`} className="block">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                </Link>

                {/* Excerpt */}
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {article.excerpt}
                </p>

                <p className="mb-4 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm italic text-muted-foreground">
                  {article.insight}
                </p>

                {/* ASCII Divider */}
                <div className="flex items-center gap-2 mb-4 text-muted-foreground/30">
                  <span className="font-mono text-xs">{'─'.repeat(4)}</span>
                  <span className="font-mono text-xs">◈</span>
                  <span className="font-mono text-xs">{'─'.repeat(20)}</span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>{article.date}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {article.readTime}
                    </span>
                  </div>
                  <Link
                    href={`/writing/${article.slug}`}
                    className="inline-flex items-center gap-1 text-primary group-hover:translate-x-1 transition-transform"
                  >
                    Read <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Hover Border Glow */}
              <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/20 rounded-xl transition-colors pointer-events-none" />
            </motion.article>
          ))}
        </div>

        {/* View All / Newsletter CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 p-6 border border-border rounded-xl bg-muted/30"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-semibold mb-1">Stay Updated</h4>
              <p className="text-sm text-muted-foreground">
                Join the private list for new essays, project breakdowns, and systems notes.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="w-full md:w-auto">
              <div className="flex flex-col gap-3 md:flex-row">
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:border-primary md:w-44"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:border-primary md:w-64"
                  required
                />
                <button type="submit" disabled={isSubmitting} className="cta-button whitespace-nowrap disabled:opacity-60">
                  {isSubmitting ? 'Joining…' : 'Subscribe'}
                </button>
              </div>
              {status === 'success' && (
                <p className="mt-3 inline-flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                  You’re in. Expect thoughtful, low-noise updates.
                </p>
              )}
              {status === 'error' && (
                <p className="mt-3 text-sm text-destructive">
                  Something went wrong. Please try again in a moment.
                </p>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
