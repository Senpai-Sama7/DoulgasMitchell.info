'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();
  const variants = shouldReduceMotion ? undefined : containerVariants;
  const childVariants = shouldReduceMotion ? undefined : itemVariants;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* ASCII Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        aria-hidden="true"
      >
        <div className="ascii-grid w-full h-full" />
      </div>

      {/* Content */}
      <motion.div
        variants={variants}
        initial="hidden"
        animate="visible"
        className="editorial-container text-center py-20 md:py-32 relative z-10"
      >
        {/* ASCII Marker */}
        <motion.div 
          variants={childVariants}
          className="ascii-marker mb-6 justify-center"
        >
          <Sparkles className="h-3 w-3" />
          <span>The Architect</span>
        </motion.div>

        {/* Main Title */}
        <motion.h1 
          variants={childVariants}
          className="editorial-title mb-6"
        >
          Douglas Mitchell
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          variants={childVariants}
          className="editorial-subtitle max-w-2xl mx-auto mb-8"
        >
          Operations Analyst. AI Practitioner. Author of{' '}
          <span className="text-foreground font-medium">The Confident Mind</span>.
          <br />
          Building systems at the intersection of technology and human potential.
        </motion.p>

        {/* ASCII Divider */}
        <motion.div 
          variants={childVariants}
          className="ascii-divider max-w-xs mx-auto mb-8"
        >
          {'◈'}
        </motion.div>

        {/* Credentials */}
        <motion.div 
          variants={childVariants}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {['Google AI Certified', 'Anthropic Certified', 'Houston-based'].map((credential) => (
            <span
              key={credential}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-muted rounded-full text-muted-foreground"
            >
              {credential}
            </span>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div 
          variants={childVariants}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <a href="#work" className="cta-button">
            View My Work
            <ArrowDown className="h-4 w-4" />
          </a>
          <a href="#about" className="ghost-button">
            Learn More
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2 text-muted-foreground"
        >
          <span className="font-mono text-xs">Scroll</span>
          <ArrowDown className="h-4 w-4" />
        </motion.div>
      </motion.div>
    </section>
  );
}
