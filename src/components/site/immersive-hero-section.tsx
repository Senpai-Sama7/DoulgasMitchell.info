'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { SignatureScene } from '@/components/immersive/signature-scene';
import { heroMetrics, siteProfile } from '@/lib/site-content';
const roleSignals = [
  { title: 'Operations Analyst', accent: 'Systems · Process · Delivery' },
  { title: 'AI Practitioner',    accent: 'Automation · LLM · Trust' },
  { title: 'Systems Strategist', accent: 'Architecture · Clarity · Scale' },
  { title: 'Author',             accent: 'Confidence · Performance · Mind' },
] as const;

function CountUp({ value, duration = 1.4 }: { value: string; duration?: number }) {
  const num = parseFloat(value.replace(/[^0-9.]/g, ''));
  const suffix = value.replace(/[0-9.]/g, '');
  const isNumeric = !Number.isNaN(num);
  const [displayed, setDisplayed] = useState(isNumeric ? '0' : value);

  useEffect(() => {
    if (!isNumeric) return;

    let cancelled = false;
    let frameId = 0;
    let start: number | null = null;

    const step = (ts: number) => {
      if (cancelled) return;
      if (!start) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(String(Math.round(eased * num)) + suffix);
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
    };
  }, [num, suffix, duration, isNumeric]);

  return <span>{displayed}</span>;
}

export function ImmersiveHeroSection() {
  const [activeRole, setActiveRole] = useState(0);
  const [metricsVisible, setMetricsVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLElement>(null);
  const metricsRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end start'] });
  const rawY   = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const rawOp  = useTransform(scrollYProgress, [0.55, 0.85], [1, 0]);
  const y      = useSpring(rawY,  { stiffness: 80, damping: 20 });
  const opacity = useSpring(rawOp, { stiffness: 80, damping: 20 });

  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = window.setInterval(() => setActiveRole(c => (c + 1) % roleSignals.length), 4000);
    return () => window.clearInterval(id);
  }, [prefersReducedMotion]);

  useEffect(() => {
    const el = metricsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setMetricsVisible(true); }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const role = roleSignals[activeRole];

  const nameVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
  };
  const letterVariants = {
    hidden: { opacity: 0, y: 40, rotateX: -30 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  const letters1 = 'Douglas'.split('');
  const letters2 = 'Mitchell'.split('');

  return (
    <section ref={containerRef} className="relative min-h-[100svh] overflow-hidden">
      {/* WebGL backdrop */}
      <SignatureScene className="absolute inset-0 -z-10 h-full w-full" />

      {/* Subtle dark vignette bottom */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-64 bg-gradient-to-t from-background via-background/60 to-transparent" />
      {/* Subtle top vignette for header legibility */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-background/50 to-transparent" />

      <motion.div
        style={prefersReducedMotion ? {} : { y, opacity }}
        className="editorial-container relative z-20 flex min-h-[100svh] flex-col justify-end pb-14 pt-28 md:pb-20 md:pt-36"
      >
        {/* Kicker */}
        <motion.p
          className="immersive-kicker mb-8 flex items-center gap-3"
          initial={prefersReducedMotion ? false : { opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="h-px w-10 bg-foreground/30" />
          {siteProfile.location}
          <span className="h-px w-4 bg-foreground/20" />
          {siteProfile.headline}
        </motion.p>

        {/* Giant name */}
        <div className="overflow-hidden" style={{ perspective: 800 }}>
          <motion.h1
            variants={prefersReducedMotion ? undefined : nameVariants}
            initial={prefersReducedMotion ? false : 'hidden'}
            animate="visible"
            className="display-title leading-none"
            aria-label="Douglas Mitchell"
          >
            {/* Line 1 */}
            <span className="block">
              {letters1.map((l, i) => (
                <motion.span
                  key={`l1-${i}`}
                  variants={prefersReducedMotion ? undefined : letterVariants}
                  style={{ display: 'inline-block', whiteSpace: l === ' ' ? 'pre' : 'normal' }}
                >
                  {l}
                </motion.span>
              ))}
            </span>
            {/* Line 2 — slightly smaller, muted */}
            <span
              className="block"
              style={{
                color: 'color-mix(in oklch, var(--foreground), transparent 42%)',
                marginTop: '-0.05em',
              }}
            >
              {letters2.map((l, i) => (
                <motion.span
                  key={`l2-${i}`}
                  variants={prefersReducedMotion ? undefined : letterVariants}
                  style={{ display: 'inline-block', whiteSpace: l === ' ' ? 'pre' : 'normal' }}
                >
                  {l}
                </motion.span>
              ))}
            </span>
          </motion.h1>
        </div>

        {/* Tagline */}
        <motion.p
          className="mt-8 max-w-2xl text-xl leading-relaxed text-foreground/80 md:text-2xl"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          Calm, premium operating systems for work that has to hold up in the real world.
        </motion.p>

        {/* Role cycling */}
        <motion.div
          className="mt-5 flex items-center gap-3"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.75 }}
        >
          <div className="relative h-6 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={role.title}
                className="block text-base font-medium text-foreground"
                initial={prefersReducedMotion ? false : { y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={prefersReducedMotion ? undefined : { y: -24, opacity: 0 }}
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              >
                {role.title}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="h-px w-5 bg-foreground/25" />
          <span className="text-sm text-muted-foreground">{role.accent}</span>
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="mt-10 flex flex-col gap-3 sm:flex-row"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          <a href="#work" className="immersive-button w-fit">
            Proof of work
            <ArrowDown className="h-4 w-4" />
          </a>
          <a href="#contact" className="immersive-button-ghost w-fit">
            Start a conversation
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </motion.div>

        {/* Metrics strip */}
        <motion.div
          ref={metricsRef}
          className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
        >
          {heroMetrics.map((m) => (
            <div
              key={m.label}
              className="glass-panel group flex flex-col gap-1 p-5 transition-transform duration-300 hover:-translate-y-0.5"
            >
              <span className="text-3xl font-light tracking-tight tabular-nums">
                {metricsVisible && !prefersReducedMotion ? (
                  <CountUp value={m.value} />
                ) : (
                  m.value
                )}
              </span>
              <span className="text-xs text-muted-foreground">{m.label}</span>
              {m.detail ? (
                <span className="mt-1 line-clamp-2 text-xs text-muted-foreground/60 opacity-0 transition-opacity group-hover:opacity-100">
                  {m.detail}
                </span>
              ) : null}
            </div>
          ))}
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          className="mt-10 flex items-center gap-2"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.3 }}
          aria-hidden
        >
          <motion.div
            className="h-8 w-[1px] bg-foreground/20"
            animate={prefersReducedMotion ? {} : { scaleY: [0.4, 1, 0.4] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="immersive-kicker">scroll</span>
        </motion.div>
      </motion.div>
    </section>
  );
}
