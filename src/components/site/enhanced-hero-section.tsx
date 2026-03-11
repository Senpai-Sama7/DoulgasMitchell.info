'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ChevronRight, Sparkles } from 'lucide-react';
import { heroMetrics, siteProfile, socialLinks } from '@/lib/site-content';
import { ParticleTitle } from '@/components/effects/particle-title';

const roles = [
  'Operations Analyst',
  'AI Practitioner', 
  'Systems Strategist',
  'Author',
];

export function EnhancedHeroSection() {
  const [displayedRole, setDisplayedRole] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 0.95]);


  // Ensure scroll starts at top
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Role rotation
  useEffect(() => {
    if (prefersReducedMotion) return;
    const interval = setInterval(() => {
      setDisplayedRole(prev => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);


  return (
    <section 
      ref={containerRef}
      className="relative min-h-[90vh] flex items-start justify-center pt-16 md:pt-24 lg:pt-32"
    >
      {/* ASCII Grid Background */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] z-[1]"
        aria-hidden="true"
      >
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none z-[2]" />

      {/* Content */}
      <motion.div
        style={{ y: prefersReducedMotion ? 0 : y, opacity, scale }}
        className="editorial-container py-10 md:py-20 relative z-10"
      >
        <div className="max-w-4xl mx-auto">

          {/* Mobile ASCII Marker */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center gap-2 mb-6 lg:hidden"
          >
            <span className="font-mono text-xs text-muted-foreground">{'[ '}</span>
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-mono text-sm">System Status: PRIME</span>
            <span className="font-mono text-xs text-muted-foreground">{' ]'}</span>
          </motion.div>

          {/* Main Title with ASCII decoration */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center"
          >
            {/* ASCII Top Decoration */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="font-mono text-lg text-muted-foreground/30">╭──</span>
              <span className="font-mono text-xs text-muted-foreground">DOUGLAS MITCHELL</span>
              <span className="font-mono text-lg text-muted-foreground/30">──╮</span>
            </div>

            <h1 
              // @ts-ignore
              fetchPriority="high"
              className="editorial-title mb-2 relative"
            >
              <ParticleTitle firstName="Douglas" lastName="Mitchell" />
            </h1>

            {/* ASCII Bottom Decoration */}
            <div className="flex items-center justify-center gap-4 mt-2 mb-6">
              <span className="font-mono text-lg text-muted-foreground/30">╰──</span>
              <span className="font-mono text-lg text-muted-foreground/30">{'═'.repeat(16)}</span>
              <span className="font-mono text-lg text-muted-foreground/30">──╯</span>
            </div>
          </motion.div>

          {/* Animated Role */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 border border-border rounded-full">
              <span className="font-mono text-xs text-muted-foreground">$</span>
              <motion.span
                key={displayedRole}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm font-medium"
              >
                {roles[displayedRole]}
              </motion.span>
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="font-mono"
              >
                ▊
              </motion.span>
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="editorial-subtitle max-w-2xl mx-auto mb-8 text-center"
          >
            {siteProfile.summary}
            <br />
            <span className="text-sm text-muted-foreground">
              Author of <em>The Confident Mind</em>. {siteProfile.location}.
            </span>
          </motion.p>

          {/* Credentials */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-2 mb-10"
          >
            {[
              { label: 'Google AI', icon: '◆' },
              { label: 'Anthropic', icon: '◆' },
              { label: '85+ Repos', icon: '◆' },
            ].map((credential, i) => (
              <motion.div
                key={credential.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="group flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-background border border-border rounded-full hover:border-primary/50 transition-colors cursor-default"
              >
                <span className="text-primary text-xs">{credential.icon}</span>
                {credential.label}
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <motion.a 
              href="#work"
              className="cta-button group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="font-mono text-xs opacity-70">01</span>
              View My Work
              <ArrowDown className="h-4 w-4 group-hover:translate-y-1 transition-transform" />
            </motion.a>
            <motion.a 
              href="#about"
              className="ghost-button group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="font-mono text-xs opacity-70">02</span>
              Learn More
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-8 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]"
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {heroMetrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="rounded-2xl border border-border bg-background/70 p-4 text-left backdrop-blur"
                >
                  <div className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                    {metric.label}
                  </div>
                  <div className="mt-3 text-2xl font-semibold text-foreground">{metric.value}</div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{metric.detail}</p>
                </motion.div>
              ))}
            </div>

            <div className="rounded-2xl border border-border bg-muted/40 p-4 text-left">
              <div className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Network
              </div>
              <div className="mt-4 space-y-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-center justify-between rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-sm transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ASCII Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-12 text-center"
          >
            <pre className="font-mono text-[8px] text-muted-foreground/30 inline-block">
{`─────✧─────✧─────✧─────`}
            </pre>
          </motion.div>
        </div>
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
          className="flex flex-col items-center gap-2"
        >
          <span className="font-mono text-xs text-muted-foreground">scroll</span>
          <div className="w-5 h-8 border border-muted-foreground/30 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1 h-1.5 bg-muted-foreground/50 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
