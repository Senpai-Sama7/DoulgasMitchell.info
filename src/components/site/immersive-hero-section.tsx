'use client';

import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { SignatureScene } from '@/components/immersive/signature-scene';
import { siteProfile } from '@/lib/site-content';

export function ImmersiveHeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });
  const rawY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const rawOp = useTransform(scrollYProgress, [0.5, 0.9], [1, 0]);
  const y = useSpring(rawY, { stiffness: 90, damping: 22 });
  const opacity = useSpring(rawOp, { stiffness: 90, damping: 22 });

  const nameVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.045 } },
  };
  const letterVariants = {
    hidden: { opacity: 0, y: 36 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  const lineOne = 'Douglas'.split('');
  const lineTwo = 'Mitchell'.split('');

  return (
    <section id="hero" ref={containerRef} className="relative min-h-[100svh] overflow-hidden">
      <SignatureScene className="absolute inset-0 -z-10 h-full w-full" />

      {/* Full-bleed atmosphere overlays — brand plane, not inset media */}
      <div
        className="pointer-events-none absolute inset-0 -z-[5]"
        style={{
          background:
            'radial-gradient(80% 60% at 70% 40%, transparent 0%, color-mix(in oklch, var(--background), transparent 35%) 70%, var(--background) 100%)',
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-48 bg-gradient-to-t from-background via-background/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-background/55 to-transparent" />

      <motion.div
        style={prefersReducedMotion ? {} : { y, opacity }}
        className="editorial-container relative z-20 flex min-h-[100svh] flex-col justify-end pb-16 pt-28 md:pb-24 md:pt-36"
      >
        {/* Hero budget: brand · one headline · one sentence · CTAs · dominant visual */}
        <motion.p
          className="immersive-kicker mb-8 flex items-center gap-3"
          initial={prefersReducedMotion ? false : { opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="h-px w-10 bg-foreground/35" />
          {siteProfile.location}
          <span className="text-muted-foreground/50">·</span>
          Practitioner studio
        </motion.p>

        <div className="overflow-hidden">
          <motion.h1
            variants={prefersReducedMotion ? undefined : nameVariants}
            initial={prefersReducedMotion ? false : 'hidden'}
            animate="visible"
            className="display-title"
            aria-label="Douglas Mitchell"
          >
            <span className="block">
              {lineOne.map((letter, index) => (
                <motion.span
                  key={`a-${index}`}
                  variants={prefersReducedMotion ? undefined : letterVariants}
                  style={{ display: 'inline-block' }}
                >
                  {letter}
                </motion.span>
              ))}
            </span>
            <span
              className="block"
              style={{
                color: 'color-mix(in oklch, var(--foreground), transparent 38%)',
                marginTop: '-0.04em',
              }}
            >
              {lineTwo.map((letter, index) => (
                <motion.span
                  key={`b-${index}`}
                  variants={prefersReducedMotion ? undefined : letterVariants}
                  style={{ display: 'inline-block' }}
                >
                  {letter}
                </motion.span>
              ))}
            </span>
          </motion.h1>
        </div>

        <motion.p
          className="mt-7 max-w-xl text-[1.35rem] leading-snug tracking-tight text-foreground/88 md:text-[1.65rem]"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          Decision systems that hold under load.
        </motion.p>

        <motion.p
          className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.58, ease: [0.22, 1, 0.36, 1] }}
        >
          {siteProfile.summary}
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.72, ease: [0.22, 1, 0.36, 1] }}
        >
          <a href="#method" className="immersive-button w-fit">
            Read the method
            <ArrowDown className="h-4 w-4" />
          </a>
          <a href="#work" className="immersive-button-ghost w-fit">
            See proof of work
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </motion.div>

        <motion.div
          className="mt-14 flex items-center gap-3"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.45, delay: 1 }}
          aria-hidden
        >
          <motion.div
            className="h-9 w-px origin-top bg-foreground/25"
            animate={prefersReducedMotion ? {} : { scaleY: [0.35, 1, 0.35] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: [0.45, 0, 0.55, 1] }}
          />
          <span className="immersive-kicker">Scroll the operating story</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
