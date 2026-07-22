'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, Star, Quote } from 'lucide-react';
import { bookShowcase } from '@/lib/site-content';
import { mediaManifest } from '@/lib/media-manifest';
import { ScrollReveal, ScrollRevealStagger, ScrollRevealItem } from '@/components/immersive/scroll-reveal';

export function ImmersiveBookSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
  const coverY    = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);
  const coverRot  = useTransform(scrollYProgress, [0, 1], [-2, 2]);

  return (
    <section id="book" ref={sectionRef} className="section-spacing overflow-hidden">
      <div className="editorial-container">

        {/* — Full-width section label line — */}
        <ScrollReveal className="mb-16 flex items-center gap-4">
          <p className="immersive-kicker shrink-0">Book</p>
          <div className="h-px flex-1 bg-border/50" />
          {bookShowcase.publishDate && (
            <span className="immersive-kicker shrink-0">{bookShowcase.publishDate}</span>
          )}
        </ScrollReveal>

        <div className="grid items-start gap-14 lg:grid-cols-[2fr_3fr]">

          {/* Book cover — parallax tilt */}
          <ScrollReveal className="flex justify-center lg:sticky lg:top-28">
            <motion.div
              className="relative"
              style={{ y: coverY, rotateY: coverRot, transformStyle: 'preserve-3d', perspective: 800 }}
            >
              {/* Shadow layer */}
              <div
                className="absolute -bottom-6 left-4 right-4 h-12 rounded-full blur-2xl"
                style={{ background: 'color-mix(in oklch, var(--foreground), transparent 82%)' }}
                aria-hidden
              />
              <div className="relative mx-auto w-full max-w-[280px] overflow-hidden border border-border/40 shadow-[0_28px_60px_-36px_color-mix(in_oklch,var(--foreground),transparent_70%)] lg:max-w-none">
                <Image
                  src={mediaManifest.book.cover}
                  alt={bookShowcase.title}
                  width={400}
                  height={533}
                  className="block h-auto w-full object-cover"
                  priority
                />
              </div>
            </motion.div>
          </ScrollReveal>

          {/* Text content */}
          <div>
            <ScrollReveal>
              <h2 className="editorial-title">{bookShowcase.title}</h2>
              <p className="mt-3 text-lg font-light text-muted-foreground">{bookShowcase.subtitle}</p>

              {bookShowcase.publisher && (
                <p className="mt-2 text-sm text-muted-foreground/60">
                  {bookShowcase.publisher}
                </p>
              )}

              <p className="mt-7 max-w-lg text-base leading-relaxed text-muted-foreground">
                {bookShowcase.description}
              </p>

              <div className="mt-8">
                <a
                  href={bookShowcase.amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="immersive-button"
                >
                  Get the book
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </ScrollReveal>

            {/* Highlights */}
            {bookShowcase.highlights.length > 0 && (
              <ScrollRevealStagger className="mt-12 grid gap-3 sm:grid-cols-2">
                {bookShowcase.highlights.slice(0, 4).map((h) => (
                  <ScrollRevealItem key={h}>
                    <div className="border border-border/60 bg-background/50 p-4">
                      <Star className="mb-2 h-3.5 w-3.5 text-muted-foreground/50" aria-hidden />
                      <p className="text-sm leading-relaxed text-muted-foreground">{h}</p>
                    </div>
                  </ScrollRevealItem>
                ))}
              </ScrollRevealStagger>
            )}

            {/* Testimonials */}
            {bookShowcase.testimonials?.length > 0 && (
              <ScrollReveal className="mt-10" delay={0.1}>
                <div className="border border-border/60 bg-background/50 p-6">
                  <Quote className="mb-3 h-5 w-5 text-muted-foreground/40" aria-hidden />
                  <blockquote className="text-base leading-relaxed text-foreground/85">
                    {bookShowcase.testimonials[0].text}
                  </blockquote>
                  <footer className="mt-4 text-sm text-muted-foreground">
                    {bookShowcase.testimonials[0].author}
                  </footer>
                </div>
              </ScrollReveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
