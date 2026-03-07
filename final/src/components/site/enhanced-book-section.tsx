'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { BookOpen, ExternalLink, Quote, ArrowRight, Sparkles } from 'lucide-react';
import type { BookShowcase } from '@/lib/site-content';

interface EnhancedBookSectionProps {
  book: BookShowcase;
}

export function EnhancedBookSection({ book }: EnhancedBookSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-15, 0, 15]);

  // Auto-rotate chapters
  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setActiveChapter(prev => (prev + 1) % book.chapters.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [book.chapters.length, prefersReducedMotion]);

  const activeTestimonial = book.testimonials[activeChapter % book.testimonials.length] ?? book.testimonials[0];

  return (
    <section id="book" className="section-spacing bg-muted/30 relative overflow-hidden" ref={containerRef}>
      {/* Background ASCII */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
        <pre className="font-mono text-[8px] leading-tight text-muted-foreground whitespace-pre-wrap">
{`
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░  ╔════════════════════════════════════════════════════════════════╗  ░
░  ║  THE CONFIDENT MIND - A PRACTICAL GUIDE TO AUTHENTICITY        ║  ░
░  ╚════════════════════════════════════════════════════════════════╝  ░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
`}
        </pre>
      </div>

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
            <span className="font-mono text-xs text-muted-foreground">{'// 04'}</span>
            <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
          </div>
          
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-mono text-sm text-muted-foreground">PUBLISHED WORK</span>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Book Cover */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            {/* 3D Book Effect */}
            <motion.div 
              style={{ rotateY: prefersReducedMotion ? 0 : rotateY }}
              className="relative perspective-1000"
            >
              <div className="relative aspect-[2/3] max-w-sm mx-auto lg:mx-0">
                {/* Book Shadow */}
                <div className="absolute -bottom-4 left-4 right-4 h-8 bg-gradient-to-t from-black/20 to-transparent blur-lg" />
                
                {/* Book Cover */}
                <div className="relative w-full h-full bg-gradient-to-br from-primary via-primary to-primary/80 rounded-lg shadow-2xl overflow-hidden">
                  {/* Cover Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="bookPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                          <circle cx="10" cy="10" r="1" fill="currentColor" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#bookPattern)" />
                    </svg>
                  </div>

                  {/* Cover Content */}
                  <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-primary-foreground">
                    {/* ASCII Top */}
                    <pre className="font-mono text-[8px] opacity-50 mb-4">
{`╭──────────────╮
│              │
│    ◆ ◇ ◆    │
│              │
╰──────────────╯`}
                    </pre>

                    <BookOpen className="h-12 w-12 mb-6 opacity-80" />
                    
                    <h3 className="font-bold text-2xl text-center mb-2 tracking-tight">
                      {book.title}
                    </h3>
                    <p className="text-sm opacity-80 text-center leading-relaxed">
                      {book.subtitle}
                    </p>

                    {/* ASCII Bottom */}
                    <pre className="font-mono text-[8px] opacity-50 mt-6">
{`╭──────────────╮
│   by D.M.    │
╰──────────────╯`}
                    </pre>
                  </div>

                  {/* Book Edge */}
                  <div className="absolute right-0 top-0 bottom-0 w-4 bg-primary-foreground/10" />
                </div>

                {/* Floating Pages */}
                <motion.div
                  animate={{ y: [-2, 2, -2] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -right-2 top-2 bottom-2 w-2 bg-muted rounded-r shadow-md"
                />
              </div>
            </motion.div>

            {/* Decorative Elements */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%]"
            >
              <svg viewBox="0 0 200 200" className="w-full h-full opacity-20">
                <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
                <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 6" />
              </svg>
            </motion.div>
          </motion.div>

          {/* Book Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="editorial-title mb-4">
              {book.title}
            </h2>

            <p className="text-lg text-muted-foreground italic mb-6">
              {book.subtitle}
            </p>

            <p className="text-muted-foreground leading-relaxed mb-8">
              {book.description}
            </p>

            {/* Highlights */}
            <div className="space-y-3 mb-8">
              {book.highlights.map((highlight, i) => (
                <motion.div
                  key={highlight}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="text-primary">◆</span>
                  <span className="text-muted-foreground">{highlight}</span>
                </motion.div>
              ))}
            </div>

            {/* Chapters Preview */}
            <div className="mb-8 p-4 bg-background border border-border rounded-lg">
              <div className="font-mono text-xs text-muted-foreground mb-3">
                CHAPTERS
              </div>
              <div className="flex flex-wrap gap-2">
                {book.chapters.map((chapter, i) => (
                  <motion.span
                    key={chapter}
                    onClick={() => setActiveChapter(i)}
                    className={`px-3 py-1 text-xs font-mono rounded cursor-pointer transition-colors ${
                      i === activeChapter 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {i + 1}. {chapter}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Testimonial */}
            <div className="border-l-2 border-primary pl-4 mb-8">
              <Quote className="h-4 w-4 text-muted-foreground mb-2" />
              <motion.p 
                key={activeChapter}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm italic text-muted-foreground"
              >
                "{activeTestimonial.text}"
              </motion.p>
              <span className="text-xs text-muted-foreground mt-1 block">
                {activeTestimonial.author}
              </span>
            </div>

            {/* CTA */}
            <motion.a
              href={book.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-button group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <BookOpen className="h-4 w-4" />
              Get It on Amazon
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
