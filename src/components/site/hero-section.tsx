'use client';

import { motion, useReducedMotion, type Variants, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, Sparkles } from 'lucide-react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { siteProfile } from '@/lib/site-content';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 400], [1, 0.95]);
  const y = useTransform(scrollY, [0, 400], [0, 50]);

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/20 to-background z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,oklch(var(--background))_100%)] z-10" />
        <div className="absolute inset-0 opacity-10 mix-blend-overlay">
          <div className="ascii-grid w-full h-full" />
        </div>
      </div>

      {/* Centered DM Logo Video */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <motion.div 
          style={{ opacity: useTransform(scrollY, [0, 300], [0.15, 0]) }}
          className="w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full overflow-hidden border border-primary/10 mix-blend-screen grayscale contrast-125"
        >
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/media/breathing-dm-loop.mp4" type="video/mp4" />
          </video>
        </motion.div>
      </div>

      {/* Content */}
      <motion.div
        style={{ opacity, scale, y }}
        variants={variants}
        initial="hidden"
        animate="visible"
        className="editorial-container text-center pt-10 pb-20 md:pt-16 md:pb-32 relative z-10"
      >
        {/* ASCII Marker */}
        <motion.div 
          variants={childVariants}
          className="ascii-marker mb-6 justify-center"
        >
          <Sparkles className="h-3 w-3" />
          <span>{siteProfile.headline}</span>
        </motion.div>

        {/* Main Title - Positioned Higher */}
        <motion.div variants={childVariants} className="mb-6 relative">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.5em] text-muted-foreground/40 uppercase pointer-events-none">
            Architectural Systems
          </div>
          <h1 className="editorial-title text-5xl md:text-7xl lg:text-8xl tracking-tighter">
            {siteProfile.name}
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p 
          variants={childVariants}
          className="editorial-subtitle max-w-2xl mx-auto mb-8 text-lg md:text-xl"
        >
          Operations Analyst. AI Practitioner. Author of{' '}
          <span className="text-foreground font-medium italic underline decoration-primary/30 underline-offset-4">The Confident Mind</span>.
          <br />
          Designing resilient systems at the intersection of operational rigor and AI fluency.
        </motion.p>

        {/* ASCII Divider */}
        <motion.div 
          variants={childVariants}
          className="flex justify-center items-center gap-4 mb-8 text-muted-foreground/30"
        >
          <div className="h-px w-12 bg-border" />
          <div className="font-mono text-xs tracking-widest">DM-01</div>
          <div className="h-px w-12 bg-border" />
        </motion.div>

        {/* Credentials */}
        <motion.div 
          variants={childVariants}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {['Google AI Practitioner', 'Anthropic Certified', 'System Strategy'].map((credential) => (
            <span
              key={credential}
              className="inline-flex items-center px-4 py-1.5 text-[10px] uppercase tracking-widest font-mono border border-border/50 bg-background/50 backdrop-blur-sm rounded-none text-muted-foreground hover:text-foreground transition-colors"
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
          <a href="#work" className="cta-button group">
            <span className="flex items-center gap-2">
              01 VIEW MY WORK
              <ArrowDown className="h-4 w-4 group-hover:translate-y-1 transition-transform" />
            </span>
          </a>
          <a href="#about" className="ghost-button border border-border/50 px-8">
            02 LEARN MORE
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{ opacity: useTransform(scrollY, [0, 100], [1, 0]) }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2 text-muted-foreground"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-primary/50 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  );
}
