'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const DESCRIPTORS = [
  'Systems, composed with precision.',
  'Applied intelligence, curated with restraint.',
  'Operations, design, and authorship in one frame.',
];

const SIGNALS = ['Private Residence', 'Editorial Portfolio', 'Douglas Mitchell'];

const VEIL_TRANSITION = { duration: 1.05, ease: [0.22, 1, 0.36, 1] as const };
const PANEL_TRANSITION = { duration: 0.95, ease: [0.16, 1, 0.3, 1] as const };

interface SplashOverlayProps {
  onComplete?: () => void;
  minDisplayTime?: number;
}

type Phase = 'intro' | 'settle' | 'exit';

const titleFont = '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif';

export function SplashOverlay({ onComplete, minDisplayTime = 4800 }: SplashOverlayProps) {
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('intro');
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [descriptorIndex, setDescriptorIndex] = useState(0);
  const [signalIndex, setSignalIndex] = useState(0);

  const introDuration = prefersReducedMotion ? 180 : 950;
  const holdDuration = Math.max(minDisplayTime, prefersReducedMotion ? 700 : 2800);
  const exitDuration = prefersReducedMotion ? 220 : 900;

  useEffect(() => {
    document.body.style.overflow = phase === 'exit' ? '' : 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, [phase]);

  const beginExit = useCallback(() => {
    setProgress(100);
    setPhase((current) => (current === 'exit' ? current : 'exit'));
  }, []);

  useEffect(() => {
    if (phase !== 'intro') {
      return;
    }

    const timer = window.setTimeout(() => {
      setPhase('settle');
    }, introDuration);

    return () => window.clearTimeout(timer);
  }, [introDuration, phase]);

  useEffect(() => {
    if (phase !== 'settle') {
      return;
    }

    const startedAt = Date.now();

    const progressTimer = window.setInterval(() => {
      const nextProgress = Math.min(100, ((Date.now() - startedAt) / holdDuration) * 100);
      setProgress(nextProgress);

      if (nextProgress >= 100) {
        window.clearInterval(progressTimer);
        beginExit();
      }
    }, prefersReducedMotion ? 80 : 32);

    const descriptorTimer = window.setInterval(() => {
      setDescriptorIndex((current) => (current + 1) % DESCRIPTORS.length);
      setSignalIndex((current) => (current + 1) % SIGNALS.length);
    }, prefersReducedMotion ? 1600 : 1200);

    return () => {
      window.clearInterval(progressTimer);
      window.clearInterval(descriptorTimer);
    };
  }, [beginExit, holdDuration, phase, prefersReducedMotion]);

  useEffect(() => {
    if (phase !== 'exit') {
      return;
    }

    const timer = window.setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, exitDuration);

    return () => window.clearTimeout(timer);
  }, [exitDuration, onComplete, phase]);

  const skip = useCallback(() => {
    beginExit();
  }, [beginExit]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        skip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [skip]);

  if (!visible) {
    return null;
  }

  return (
    <motion.div
      aria-label="Entrance overlay"
      className="fixed inset-0 z-[9999] cursor-pointer overflow-hidden bg-[#050505] text-[#f4ecdd]"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'exit' ? 0 : 1 }}
      transition={{ duration: prefersReducedMotion ? 0.2 : 0.7, ease: 'easeOut' }}
      onClick={skip}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 50% 34%, rgba(214, 179, 102, 0.2), transparent 0 24%),
            radial-gradient(circle at 20% 18%, rgba(255, 240, 214, 0.1), transparent 0 18%),
            radial-gradient(circle at 82% 20%, rgba(177, 141, 75, 0.12), transparent 0 20%),
            linear-gradient(180deg, rgba(15, 13, 11, 0.94) 0%, rgba(7, 7, 7, 0.98) 100%)
          `,
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 88%)',
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-[24px] rounded-[32px] border border-white/8"
        style={{
          boxShadow: 'inset 0 0 0 1px rgba(205, 179, 128, 0.14), inset 0 0 140px rgba(255, 255, 255, 0.03)',
        }}
      />

      <motion.div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-80 blur-3xl"
        animate={prefersReducedMotion ? { opacity: 0.55 } : { rotate: 360, scale: [0.96, 1.04, 0.96] }}
        transition={prefersReducedMotion ? undefined : { duration: 24, ease: 'linear', repeat: Infinity }}
        style={{
          background:
            'conic-gradient(from 180deg at 50% 50%, rgba(251, 237, 198, 0.04), rgba(203, 165, 92, 0.25), rgba(251, 237, 198, 0.04), rgba(148, 116, 55, 0.22), rgba(251, 237, 198, 0.04))',
        }}
      />

      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[48vh]"
        animate={{
          y: phase === 'exit' ? '-110%' : '0%',
          opacity: phase === 'exit' ? 0.15 : 1,
        }}
        transition={VEIL_TRANSITION}
        style={{
          background:
            'linear-gradient(180deg, rgba(4, 4, 4, 0.98) 0%, rgba(4, 4, 4, 0.72) 64%, rgba(4, 4, 4, 0) 100%)',
          boxShadow: '0 24px 120px rgba(0, 0, 0, 0.65)',
        }}
      />

      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[48vh]"
        animate={{
          y: phase === 'exit' ? '110%' : '0%',
          opacity: phase === 'exit' ? 0.15 : 1,
        }}
        transition={VEIL_TRANSITION}
        style={{
          background:
            'linear-gradient(0deg, rgba(4, 4, 4, 0.98) 0%, rgba(4, 4, 4, 0.76) 64%, rgba(4, 4, 4, 0) 100%)',
          boxShadow: '0 -24px 120px rgba(0, 0, 0, 0.65)',
        }}
      />

      <div className="relative flex min-h-screen items-center justify-center px-6 py-10 sm:px-10">
        <motion.div
          className="relative w-full max-w-[760px] overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] px-6 py-8 backdrop-blur-2xl sm:px-10 sm:py-12"
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{
            opacity: phase === 'exit' ? 0 : 1,
            y: phase === 'intro' ? 18 : phase === 'exit' ? -24 : 0,
            scale: phase === 'intro' ? 0.985 : phase === 'exit' ? 1.03 : 1,
            filter: phase === 'intro' ? 'blur(10px)' : phase === 'exit' ? 'blur(8px)' : 'blur(0px)',
          }}
          transition={PANEL_TRANSITION}
          style={{
            boxShadow:
              '0 30px 110px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08), inset 0 0 0 1px rgba(212, 184, 132, 0.08)',
          }}
        >
          <motion.div
            aria-hidden="true"
            className="absolute left-[-10%] top-0 h-px w-[42%]"
            animate={prefersReducedMotion ? { opacity: 0.7 } : { x: ['-20%', '165%'] }}
            transition={prefersReducedMotion ? undefined : { duration: 2.8, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.2 }}
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255, 244, 214, 0.92), transparent)',
              boxShadow: '0 0 24px rgba(255, 230, 176, 0.65)',
            }}
          />

          <div className="relative flex flex-col gap-8">
            <div className="flex items-center justify-between gap-4 text-[0.62rem] uppercase tracking-[0.34em] text-[#bca47a] sm:text-[0.68rem]">
              <span className="whitespace-nowrap">{SIGNALS[signalIndex]}</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#b89a66]/60 to-transparent" />
              <span className="whitespace-nowrap">Est. Presence</span>
            </div>

            <div className="flex flex-col items-center gap-6 text-center">
              <div className="relative flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
                <motion.div
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full"
                  animate={prefersReducedMotion ? { opacity: 0.7 } : { rotate: 360 }}
                  transition={prefersReducedMotion ? undefined : { duration: 14, ease: 'linear', repeat: Infinity }}
                  style={{
                    background:
                      'conic-gradient(from 90deg at 50% 50%, rgba(255,255,255,0) 0deg, rgba(214,179,102,0.9) 110deg, rgba(255,255,255,0) 220deg, rgba(214,179,102,0.75) 320deg, rgba(255,255,255,0) 360deg)',
                    padding: '1px',
                    WebkitMask:
                      'radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 1px))',
                    mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 1px))',
                  }}
                />
                <div
                  className="absolute inset-[8px] rounded-full border border-white/12 bg-[#100d09]/70"
                  style={{ boxShadow: 'inset 0 0 40px rgba(232, 202, 147, 0.08)' }}
                />
                <span
                  className="relative text-[1.7rem] tracking-[0.36em] text-[#f3e3bc] sm:text-[2rem]"
                  style={{ fontFamily: titleFont }}
                >
                  DM
                </span>
              </div>

              <div className="space-y-4">
                <p className="text-[0.7rem] uppercase tracking-[0.42em] text-[#e7d1a2]/82 sm:text-[0.76rem]">
                  Douglas Mitchell
                </p>
                <div className="space-y-2">
                  <h1
                    className="text-[clamp(2.9rem,7.6vw,5.8rem)] font-light leading-none tracking-[0.08em] text-[#fff7eb]"
                    style={{ fontFamily: titleFont }}
                  >
                    The Architect
                  </h1>
                  <p className="mx-auto max-w-[34rem] text-sm leading-7 text-[#efe2c6]/72 sm:text-base">
                    A refined portfolio of operations, intelligent systems, and authored perspective.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="overflow-hidden rounded-full border border-[#c8ab72]/20 bg-white/[0.03] px-4 py-3 text-center">
                <motion.p
                  key={descriptorIndex}
                  className="text-xs uppercase tracking-[0.26em] text-[#dcc190] sm:text-sm"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                >
                  {DESCRIPTORS[descriptorIndex]}
                </motion.p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-[0.62rem] uppercase tracking-[0.32em] text-[#d9bd8f]/62 sm:text-[0.68rem]">
                  <span>Preparing entrance</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-px overflow-hidden bg-white/10">
                  <motion.div
                    className="h-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: prefersReducedMotion ? 0.2 : 0.3, ease: 'easeOut' }}
                    style={{
                      background: 'linear-gradient(90deg, rgba(153, 116, 46, 0), rgba(217, 189, 143, 1), rgba(255, 247, 235, 1))',
                      boxShadow: '0 0 22px rgba(255, 229, 173, 0.62)',
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-3 border-t border-white/8 pt-5 text-[0.62rem] uppercase tracking-[0.32em] text-[#c8ad7e]/58 sm:flex-row sm:text-[0.68rem]">
              <span>Enter or click to continue</span>
              <span>Luxury motion system</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
