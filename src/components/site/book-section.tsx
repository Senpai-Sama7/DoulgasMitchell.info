'use client';

import { motion } from 'framer-motion';
import { ExternalLink, BookOpen, Quote } from 'lucide-react';

const bookData = {
  title: 'The Confident Mind',
  subtitle: 'A Practical Manual to Repair, Build & Sustain Authentic Confidence',
  description: 'Drawing from psychology, personal experience, and real-world application, this book offers a practical framework for building lasting confidence without the toxic self-help baggage.',
  highlights: [
    'Psychology-backed confidence framework',
    'Actionable exercises and reflections',
    'Real-world application strategies',
    'Sustainable growth methodology',
  ],
  amazonUrl: 'https://www.amazon.com/Confident-Mind-Practical-Authentic-Confidence-ebook/dp/B0FPJPPPC9',
};

export function BookSection() {
  return (
    <section id="book" className="section-spacing bg-muted/30">
      <div className="editorial-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          {/* Book Cover */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-[2/3] max-w-xs mx-auto lg:mx-0">
              {/* ASCII Frame */}
              <div className="absolute -inset-4 border border-border rounded-lg opacity-50" />
              <div className="absolute -top-2 -left-2 font-mono text-xs text-muted-foreground">
                {'[book]'}
              </div>
              
              {/* Book Cover Placeholder */}
              <div className="w-full h-full bg-gradient-to-br from-primary/90 to-primary rounded-lg shadow-xl flex flex-col items-center justify-center p-8 text-primary-foreground">
                <BookOpen className="h-12 w-12 mb-4 opacity-80" />
                <h3 className="font-bold text-xl text-center mb-2">
                  {bookData.title}
                </h3>
                <p className="text-sm opacity-80 text-center">
                  {bookData.subtitle}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Book Info */}
          <div>
            <div className="ascii-marker mb-4">
              <BookOpen className="h-3 w-3" />
              <span>Published Work</span>
            </div>

            <h2 className="editorial-title mb-4">
              {bookData.title}
            </h2>

            <p className="text-lg text-muted-foreground italic mb-6">
              {bookData.subtitle}
            </p>

            <p className="text-muted-foreground leading-relaxed mb-6">
              {bookData.description}
            </p>

            {/* Highlights */}
            <ul className="space-y-2 mb-8">
              {bookData.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-0.5">•</span>
                  <span className="text-muted-foreground">{highlight}</span>
                </li>
              ))}
            </ul>

            {/* Quote */}
            <blockquote className="border-l-2 border-primary pl-4 mb-8">
              <Quote className="h-4 w-4 text-muted-foreground mb-2" />
              <p className="text-sm italic text-muted-foreground">
                "Bridging technical expertise with human psychology — the same analytical rigor applied to understanding confidence and personal growth."
              </p>
            </blockquote>

            {/* CTA */}
            <a
              href={bookData.amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-button"
            >
              <BookOpen className="h-4 w-4" />
              Get It on Amazon
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
