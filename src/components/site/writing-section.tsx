'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Clock, Tag } from 'lucide-react';

const articles = [
  {
    title: 'Building AI-Powered Workflows That Actually Work',
    excerpt: 'A practical guide to implementing AI automation in your daily operations without falling into the hype trap.',
    category: 'Technical',
    readTime: '8 min',
    date: 'Jan 2025',
    featured: true,
  },
  {
    title: 'The Architecture of Confidence',
    excerpt: 'How systems thinking applies to personal development and building lasting self-assurance.',
    category: 'Insight',
    readTime: '6 min',
    date: 'Dec 2024',
    featured: true,
  },
  {
    title: 'From Operations to AI: A Career Transition Guide',
    excerpt: 'Practical steps for operations professionals looking to integrate AI into their skillset.',
    category: 'Essay',
    readTime: '10 min',
    date: 'Nov 2024',
    featured: false,
  },
  {
    title: 'System Design for Solo Founders',
    excerpt: 'Building scalable systems as a one-person team without burning out.',
    category: 'Technical',
    readTime: '12 min',
    date: 'Oct 2024',
    featured: false,
  },
];

export function WritingSection() {
  return (
    <section id="writing" className="section-spacing">
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
            <span>Writing</span>
          </div>
          <h2 className="editorial-title mb-4">
            Thoughts & Insights
          </h2>
          <p className="editorial-subtitle max-w-2xl mx-auto">
            Exploring the intersection of technology, operations, and human potential 
            through the lens of systems thinking and practical application.
          </p>
        </motion.div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {articles.map((article, index) => (
            <motion.article
              key={article.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group relative p-6 border border-border rounded-lg hover:border-primary/30 transition-colors ${
                article.featured ? 'bg-muted/30' : 'bg-background'
              }`}
            >
              {/* Featured Badge */}
              {article.featured && (
                <div className="absolute top-4 right-4">
                  <span className="font-mono text-xs text-primary">
                    ★ Featured
                  </span>
                </div>
              )}

              {/* Category */}
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-3 w-3 text-muted-foreground" />
                <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                  {article.category}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                {article.title}
              </h3>

              {/* Excerpt */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {article.excerpt}
              </p>

              {/* Meta */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span>{article.date}</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.readTime}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-primary group-hover:translate-x-1 transition-transform">
                  Read <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </motion.article>
          ))}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <span className="text-sm text-muted-foreground">
            More writing coming soon. Subscribe to stay updated.
          </span>
        </motion.div>
      </div>
    </section>
  );
}
