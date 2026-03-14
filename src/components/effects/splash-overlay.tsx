'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const DESCRIPTORS = [
  'Operations strategy, delivered with precision.',
  'Applied intelligence, integrated with intent.',
  'Analysis, AI practice, and authorship in one frame.',
];

const SIGNALS = ['ASCII GRID', 'FIELD STACK', 'MOTION INDEX'];
const STATUS_CODES = ['PRIME', 'LOCK', 'FLOW'];
const ASCII_RAMP = ' .:-=+*#%@';
const VEIL_TRANSITION = { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const };
const PANEL_TRANSITION = { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const };
const GRID_COLS = 22;
const GRID_ROWS = 14;
const ASCII_FRAME_MS = 80;
const BOOT_SEQUENCE_MS = 2200;
const AUTO_SKIP_MS = 9000;

function randChar(): string {
  return ASCII_RAMP[Math.floor(Math.random() * ASCII_RAMP.length)];
}

function buildGrid(): string[][] {
  return Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, randChar)
  );
}

export function SplashOverlay() {
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<'boot' | 'active' | 'exit' | 'done'>(
    prefersReducedMotion ? 'done' : 'boot'
  );
  const [grid, setGrid] = useState<string[][]>(buildGrid);
  const [tick, setTick] = useState(0);
  const [descriptorIndex, setDescriptorIndex] = useState(0);
  const [signalIndex, setSignalIndex] = useState(0);
  const [showCta, setShowCta] = useState(false);

  // Skip to done
  const dismiss = useCallback(() => {
    setPhase('exit');
    setTimeout(() => setPhase('done'), 900);
  }, []);

  // Boot sequence
  useEffect(() => {
    if (phase !== 'boot') return;
    const t = setTimeout(() => setPhase('active'), BOOT_SEQUENCE_MS);
    return () => clearTimeout(t);
  }, [phase]);

  // Auto-skip
  useEffect(() => {
    if (phase !== 'active') return;
    const t = setTimeout(dismiss, AUTO_SKIP_MS);
    return () => clearTimeout(t);
  }, [phase, dismiss]);

  // CTA reveal
  useEffect(() => {
    if (phase !== 'active') {
      setShowCta(false);
      return;
    }
    const t = setTimeout(() => setShowCta(true), 1600);
    return () => clearTimeout(t);
  }, [phase]);

  // ASCII grid animation
  useEffect(() => {
    if (phase === 'done' || phase === 'exit') return;
    const t = setInterval(() => {
      setGrid((prev) => {
        const next = prev.map((row) => [...row]);
        const mutations = Math.floor(GRID_COLS * GRID_ROWS * 0.18);
        for (let i = 0; i < mutations; i++) {
          const r = Math.floor(Math.random() * GRID_ROWS);
          const c = Math.floor(Math.random() * GRID_COLS);
          next[r][c] = randChar();
        }
        return next;
      });
      setTick((n) => n + 1);
    }, ASCII_FRAME_MS);
    return () => clearInterval(t);
  }, [phase]);

  // Cycle descriptors
  useEffect(() => {
    if (phase !== 'active') return;
    const t = setInterval(
      () => setDescriptorIndex((i) => (i + 1) % DESCRIPTORS.length),
      2800
    );
    return () => clearInterval(t);
  }, [phase]);

  // Cycle signals
  useEffect(() => {
    if (phase !== 'active') return;
    const t = setInterval(
      () => setSignalIndex((i) => (i + 1) % SIGNALS.length),
      1100
    );
    return () => clearInterval(t);
  }, [phase]);

  if (phase === 'done') return null;

  const statusCode = STATUS_CODES[signalIndex % STATUS_CODES.length];
  const signal = SIGNALS[signalIndex];

  return (
    <motion.div
      key="splash"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'exit' ? 0 : 1 }}
      transition={VEIL_TRANSITION}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-background"
      role="dialog"
      aria-modal="true"
      aria-label="Loading Douglas Mitchell — editorial systems operator"
    >
      {/* Background video — decorative, aria-hidden, has captions track for a11y audit */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/media/dougie-frame-poster.webp"
        className="absolute inset-0 h-full w-full object-cover opacity-[0.07] mix-blend-luminosity"
        aria-hidden="true"
        fetchPriority="high"
      >
        <source src="/media/dougie-loop-v2.mp4" type="video/mp4" />
        <track kind="captions" srcLang="en" label="English" default />
      </video>

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={PANEL_TRANSITION}
        className="relative z-10 w-full max-w-[1380px] overflow-hidden rounded-[34px] border border-border/60 bg-background/88 shadow-[0_40px_120px_-60px_rgba(2,6,23,0.85)] backdrop-blur-3xl mx-4"
      >
        {/* Top status bar */}
        <div className="flex items-center justify-between border-b border-border/40 px-7 py-3">
          <div className="flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70">
            <span>DM — EDITORIAL OS</span>
            <span aria-live="polite">{signal}</span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary"
              aria-live="polite"
            >
              {statusCode}
            </span>
            <button
              onClick={dismiss}
              className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 transition-colors hover:text-foreground"
              aria-label="Skip intro and enter the site"
            >
              skip
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-[1fr_auto] divide-x divide-border/40">
          {/* Left content */}
          <div className="space-y-8 p-8 sm:p-10">
            {phase === 'boot' ? (
              <div className="space-y-5">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted/40">
                  <motion.div
                    className="h-full bg-primary/60"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: BOOT_SEQUENCE_MS / 1000 - 0.2, ease: 'linear' }}
                  />
                </div>
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground/70">
                  Initialising field systems&hellip;
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-muted-foreground/60">
                  PROMPTING. AUTONOMY. AND SYSTEMS THINKING STUDIO IN ONE CLEAR SURFACE.
                </p>
                <h1 className="text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
                  Douglas<br />Mitchell
                </h1>
                <motion.p
                  key={descriptorIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="max-w-sm text-sm leading-relaxed text-muted-foreground"
                >
                  {DESCRIPTORS[descriptorIndex]}
                </motion.p>
                {showCta && (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    onClick={dismiss}
                    className="inline-flex items-center gap-3 rounded-2xl border border-border/70 bg-background px-5 py-3 text-sm font-medium transition-all hover:bg-muted/40"
                  >
                    Enter the archive
                    <span className="font-mono text-xs text-primary">→</span>
                  </motion.button>
                )}
              </div>
            )}
          </div>

          {/* Right ASCII grid */}
          <div
            className="hidden p-6 sm:flex sm:flex-col sm:gap-px"
            aria-hidden="true"
          >
            {grid.map((row, ri) => (
              <div key={ri} className="flex gap-px">
                {row.map((ch, ci) => (
                  <span
                    key={ci}
                    className="font-mono text-[9px] leading-none text-muted-foreground/30"
                  >
                    {ch}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between border-t border-border/40 px-7 py-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground/50">
            FLOW{' '}
            <span className="text-primary">100%</span>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-muted-foreground/50">
            Live Raster... <span aria-hidden="true">{tick % 2 === 0 ? '▮' : '▯'}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
