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
const PANEL_TRANSITION = { duration: 0.95, ease: [0.16, 1, 0.3, 1] as const };

interface SplashOverlayProps {
  onComplete?: () => void;
  minDisplayTime?: number;
}

type Phase = 'intro' | 'settle' | 'exit';

const monoFont = '"IBM Plex Mono", "SFMono-Regular", Menlo, Monaco, Consolas, monospace';
const titleFont = '"Bodoni Moda", "Iowan Old Style", "Palatino Linotype", serif';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function mapIntensity(value: number) {
  const normalized = clamp((value + 2.8) / 5.6, 0, 0.999);
  return ASCII_RAMP[Math.floor(normalized * ASCII_RAMP.length)];
}

function pad(value: number, size = 3) {
  return value.toString().padStart(size, '0');
}

function createField(rows: number, cols: number, frame: number, progress: number, variant: 'mesh' | 'scan') {
  const lines: string[] = [];

  for (let y = 0; y < rows; y += 1) {
    let line = '';

    for (let x = 0; x < cols; x += 1) {
      const horizontal = Math.sin(x * 0.18 + frame * 0.24 + y * 0.12);
      const vertical = Math.cos(y * 0.54 - frame * 0.18 + x * 0.03);
      const diagonal = Math.sin((x + y) * 0.12 + progress * 0.08);
      const bias = variant === 'mesh' ? Math.cos((x - y) * 0.1 - frame * 0.16) : Math.sin((x * y) * 0.005 + frame * 0.08);

      const hotspotX = cols * (0.18 + ((frame % 32) / 44));
      const hotspotY = rows * (0.3 + ((progress % 40) / 120));
      const distance = Math.hypot((x - hotspotX) / cols, (y - hotspotY) / rows);
      const hotspot = Math.max(0, 1 - distance * 3.6);

      const value = horizontal + vertical + diagonal + bias + hotspot * 1.8;
      const highlight = Math.abs(x - ((frame * 3 + y * 2) % cols)) < 1 ? '@' : null;

      line += highlight && hotspot > 0.36 ? highlight : mapIntensity(value);
    }

    lines.push(line);
  }

  return lines.join('\n');
}

function createPulseBars(progress: number, frame: number) {
  const labels = ['SYNC', 'DEPTH', 'EDGE', 'CACHE', 'VOICE', 'FLOW'];

  return labels
    .map((label, index) => {
      const wave = Math.sin(frame * 0.28 + index * 0.72) * 0.5 + 0.5;
      const level = clamp(Math.round(progress * 0.34 + wave * 15 + index * 4), 4, 34);
      const bar = `${'#'.repeat(level)}${'.'.repeat(34 - level)}`;
      return `${label.padEnd(5, ' ')} [${bar}] ${pad(level, 2)}`;
    })
    .join('\n');
}

function createOrbit(progress: number, frame: number) {
  const width = 29;
  const height = 11;
  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  const radius = 4;
  const angle = frame * 0.24 + progress * 0.05;
  const markerX = Math.round(centerX + Math.cos(angle) * radius * 1.55);
  const markerY = Math.round(centerY + Math.sin(angle) * radius);
  const lines: string[] = [];

  for (let y = 0; y < height; y += 1) {
    let line = '';

    for (let x = 0; x < width; x += 1) {
      const dx = (x - centerX) / 1.65;
      const dy = y - centerY;
      const ring = Math.abs(Math.hypot(dx, dy) - radius) < 0.48;
      const crosshair = x === centerX || y === centerY;

      if (x === markerX && y === markerY) {
        line += '@';
      } else if (x === centerX && y === centerY) {
        line += '+';
      } else if (ring) {
        line += 'o';
      } else if (crosshair) {
        line += '.';
      } else {
        line += ' ';
      }
    }

    lines.push(line);
  }

  return lines.join('\n');
}

function createTelemetry(progress: number, frame: number, phase: Phase) {
  const drift = (Math.sin(frame * 0.22) * 4.8 + 12.6).toFixed(1);
  const tension = (Math.cos(frame * 0.18 + 0.6) * 7.6 + 18.4).toFixed(1);

  return [
    `phase        ${phase.toUpperCase()}`,
    `completion   ${pad(Math.round(progress))}%`,
    `drift        ${drift}db`,
    `tension      ${tension}db`,
    `carrier      ${SIGNALS[frame % SIGNALS.length]}`,
    `vector       ${pad(48 + (frame % 37), 2)}`,
  ].join('\n');
}

function createMonogram() {
  return [
    ' ______   __  __ ',
    '|  __  \\ |  \\/  |',
    '| |  | | | \\  / |',
    '| |  | | | |\\/| |',
    '| |__| | | |  | |',
    '|______/ |_|  |_|',
  ].join('\n');
}

export function SplashOverlay({ onComplete, minDisplayTime = 5600 }: SplashOverlayProps) {
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('intro');
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [descriptorIndex, setDescriptorIndex] = useState(0);
  const [signalIndex, setSignalIndex] = useState(0);
  const [frame, setFrame] = useState(0);

  const introDuration = prefersReducedMotion ? 180 : 900;
  const holdDuration = Math.max(minDisplayTime, prefersReducedMotion ? 900 : 3200);
  const exitDuration = prefersReducedMotion ? 220 : 820;

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
    if (phase === 'exit') {
      return;
    }

    const frameTimer = window.setInterval(() => {
      setFrame((current) => current + 1);
    }, prefersReducedMotion ? 200 : 90);

    return () => window.clearInterval(frameTimer);
  }, [phase, prefersReducedMotion]);

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
    }, prefersReducedMotion ? 100 : 32);

    const descriptorTimer = window.setInterval(() => {
      setDescriptorIndex((current) => (current + 1) % DESCRIPTORS.length);
      setSignalIndex((current) => (current + 1) % SIGNALS.length);
    }, prefersReducedMotion ? 1800 : 1100);

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

  const meshField = createField(16, 80, frame, progress, 'mesh');
  const scanField = createField(12, 72, frame + 6, progress + 12, 'scan');
  const pulseBars = createPulseBars(progress, frame);
  const orbit = createOrbit(progress, frame);
  const telemetry = createTelemetry(progress, frame, phase);
  const monogram = createMonogram();

  return (
    <motion.div
      aria-label="Entrance overlay"
      className="fixed inset-0 z-[9999] cursor-pointer overflow-hidden bg-background text-foreground"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'exit' ? 0 : 1 }}
      transition={{ duration: prefersReducedMotion ? 0.2 : 0.55, ease: 'easeOut' }}
      onClick={skip}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 50% 34%, hsl(var(--primary) / 0.2), transparent 0 24%),
            radial-gradient(circle at 20% 18%, hsl(var(--chart-1) / 0.18), transparent 0 18%),
            radial-gradient(circle at 82% 20%, hsl(var(--secondary) / 0.14), transparent 0 20%),
            linear-gradient(180deg, hsl(var(--background) / 0.96) 0%, hsl(var(--muted) / 0.98) 100%)
          `,
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground) / 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground) / 0.06) 1px, transparent 1px)
          `,
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(circle at center, hsl(var(--background)) 40%, transparent 88%)',
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-[24px] rounded-[32px] border border-border/70"
        style={{
          boxShadow: 'inset 0 0 0 1px hsl(var(--primary) / 0.14), inset 0 0 140px hsl(var(--ring) / 0.4)',
        }}
      />

      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[50vh]"
        animate={{ y: phase === 'exit' ? '-115%' : '0%' }}
        transition={VEIL_TRANSITION}
        style={{
          background:
            'linear-gradient(180deg, hsl(var(--background) / 0.98) 0%, hsl(var(--background) / 0.72) 68%, hsl(var(--background) / 0) 100%)',
        }}
      />

      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-[50vh]"
        animate={{ y: phase === 'exit' ? '115%' : '0%' }}
        transition={VEIL_TRANSITION}
        style={{
          background:
            'linear-gradient(0deg, hsl(var(--background) / 0.98) 0%, hsl(var(--background) / 0.72) 68%, hsl(var(--background) / 0) 100%)',
        }}
      />

      <motion.pre
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[8%] hidden -translate-x-1/2 whitespace-pre text-[0.5rem] uppercase leading-[1.18] tracking-[0.18em] text-[hsl(var(--accent-foreground))]/18 xl:block"
        animate={prefersReducedMotion ? { opacity: 0.22 } : { y: [0, 10, 0], opacity: [0.16, 0.24, 0.16] }}
        transition={prefersReducedMotion ? undefined : { duration: 8, ease: 'easeInOut', repeat: Infinity }}
        style={{ fontFamily: monoFont }}
      >
        {meshField}
      </motion.pre>

      <motion.pre
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[7%] right-[4%] hidden whitespace-pre text-[0.48rem] leading-[1.16] tracking-[0.14em] text-[hsl(var(--chart-1))]/16 lg:block"
        animate={prefersReducedMotion ? { opacity: 0.18 } : { x: [0, -14, 0], opacity: [0.14, 0.22, 0.14] }}
        transition={prefersReducedMotion ? undefined : { duration: 7.5, ease: 'easeInOut', repeat: Infinity }}
        style={{ fontFamily: monoFont }}
      >
        {scanField}
      </motion.pre>

      <div className="absolute inset-0 z-10 overflow-y-auto">
        <div className="relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-8 lg:px-12">
          <motion.div
          className="relative w-full max-w-[1380px] overflow-hidden rounded-[34px] border border-border/10 bg-background/72 p-4 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-6 lg:p-8"
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{
            opacity: phase === 'exit' ? 0 : 1,
            y: phase === 'intro' ? 18 : phase === 'exit' ? -22 : 0,
            scale: phase === 'intro' ? 0.985 : phase === 'exit' ? 1.02 : 1,
            filter: phase === 'intro' ? 'blur(8px)' : phase === 'exit' ? 'blur(7px)' : 'blur(0px)',
          }}
          transition={PANEL_TRANSITION}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-[34px]"
            style={{
              background:
                'linear-gradient(135deg, hsl(var(--primary) / 0.08) 0%, hsl(var(--background) / 0.02) 28%, hsl(var(--secondary) / 0.06) 100%)',
            }}
          />

          <motion.div
            aria-hidden="true"
            className="absolute left-0 top-0 h-px w-40 bg-gradient-to-r from-transparent via-[hsl(var(--primary))] to-transparent"
            animate={prefersReducedMotion ? { opacity: 0.7 } : { x: ['-15%', '680%'] }}
            transition={prefersReducedMotion ? undefined : { duration: 3.2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.8 }}
          />

          <div className="relative flex flex-col gap-5">
            <div className="flex flex-col gap-3 border-b border-border/8 pb-4 text-[0.66rem] uppercase tracking-[0.34em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_16px_hsl(var(--primary)/0.9)]" />
                <span>Douglas Mitchell / Entrance Overlay</span>
              </div>
              <div className="flex items-center gap-3 text-accent-foreground">
                <span>{STATUS_CODES[descriptorIndex]}</span>
                <span>{pad(Math.round(progress))}%</span>
                <span>{SIGNALS[signalIndex]}</span>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[0.92fr_1.42fr_0.96fr]">
              <motion.div
                className="rounded-[28px] border border-border/8 bg-card p-4 sm:p-5"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: phase === 'exit' ? 0 : 1, x: 0 }}
                transition={{ duration: prefersReducedMotion ? 0.2 : 0.65, delay: 0.08 }}
              >
                <div className="mb-4 flex items-center justify-between text-[0.62rem] uppercase tracking-[0.3em] text-muted-foreground/78">
                  <span>Field Mesh</span>
                  <span>Live Raster</span>
                </div>
                <pre
                  className="overflow-hidden rounded-[22px] border border-primary/18 bg-popover p-3 text-[0.38rem] leading-[1.18] tracking-[0.16em] text-primary sm:text-[0.44rem]"
                  style={{ fontFamily: monoFont }}
                >
                  {scanField}
                </pre>
                <div className="mt-4 rounded-[20px] border border-border/8 bg-muted p-3 text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground">
                  Prompting, authorship, and systems thinking staged as one signal surface.
                </div>
              </motion.div>

              <motion.div
                className="relative overflow-hidden rounded-[30px] border border-border/10 bg-card/24 px-5 py-6 sm:px-7 sm:py-8"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: phase === 'exit' ? 0 : 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0.2 : 0.72, delay: 0.12 }}
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-x-[12%] top-[14%] h-40 rounded-full blur-3xl"
                  style={{
                    background:
                      'radial-gradient(circle, hsl(var(--primary) / 0.18) 0%, hsl(var(--primary) / 0.03) 48%, transparent 76%)',
                  }}
                />

                <div className="relative flex flex-col items-center text-center">
                  <p className="mb-4 text-[0.72rem] uppercase tracking-[0.42em] text-muted-foreground/62">ASCII Resonance</p>

                  <pre
                    aria-hidden="true"
                    className="mb-6 whitespace-pre text-[0.72rem] leading-[1.02] tracking-[0.2em] text-foreground/88 sm:text-[0.92rem]"
                    style={{ fontFamily: monoFont }}
                  >
                    {monogram}
                  </pre>

                  <div className="space-y-4">
                    <h1
                      className="text-[clamp(2.8rem,7vw,7rem)] font-light uppercase leading-[0.88] tracking-[0.14em] text-primary-foreground"
                      style={{ fontFamily: titleFont }}
                    >
                      Modern
                      <br />
                      ASCII
                    </h1>
                    <p className="mx-auto max-w-[34rem] text-sm uppercase tracking-[0.28em] text-accent-foreground/76 sm:text-[0.82rem]">
                      Visual systems. Signal drama. Editorial control.
                    </p>
                  </div>

                  <div className="mt-6 w-full max-w-[40rem] rounded-[24px] border border-border/10 bg-card/24 px-4 py-4 sm:px-5">
                    <motion.p
                      key={descriptorIndex}
                      className="text-sm leading-7 text-card-foreground sm:text-[1rem]"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.42, ease: 'easeOut' }}
                    >
                      {DESCRIPTORS[descriptorIndex]}
                    </motion.p>
                  </div>

                  <div className="mt-7 flex w-full flex-col items-center gap-4 lg:flex-row lg:justify-center">
                    <div className="rounded-[24px] border border-primary/24 bg-popover/72 px-5 py-4">
                      <p className="text-[0.62rem] uppercase tracking-[0.34em] text-muted-foreground/70">Completion</p>
                      <p className="mt-2 text-[clamp(2.8rem,8vw,5.6rem)] leading-none text-primary-foreground" style={{ fontFamily: monoFont }}>
                        {pad(Math.round(progress))}%
                      </p>
                    </div>
                    <div className="w-full max-w-[18rem] rounded-[24px] border border-border/8 bg-muted px-4 py-4 text-left">
                      <p className="mb-3 text-[0.62rem] uppercase tracking-[0.34em] text-muted-foreground/70">Telemetry</p>
                      <pre className="text-[0.72rem] leading-7 text-muted-foreground/80" style={{ fontFamily: monoFont }}>
                        {telemetry}
                      </pre>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="rounded-[28px] border border-border/8 bg-card p-4 sm:p-5"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: phase === 'exit' ? 0 : 1, x: 0 }}
                transition={{ duration: prefersReducedMotion ? 0.2 : 0.68, delay: 0.14 }}
              >
                <div className="mb-4 flex items-center justify-between text-[0.62rem] uppercase tracking-[0.3em] text-muted-foreground/78">
                  <span>Signal Orbit</span>
                  <span>Load Trace</span>
                </div>
                <pre
                  className="mb-4 overflow-hidden rounded-[22px] border border-secondary/18 bg-popover/70 p-3 text-[0.48rem] leading-[1.12] tracking-[0.18em] text-secondary sm:text-[0.56rem]"
                  style={{ fontFamily: monoFont }}
                >
                  {orbit}
                </pre>
                <pre
                  className="overflow-hidden rounded-[22px] border border-border/8 bg-card/82 p-3 text-[0.54rem] leading-[1.55] text-card-foreground/82 sm:text-[0.64rem]"
                  style={{ fontFamily: monoFont }}
                >
                  {pulseBars}
                </pre>
              </motion.div>
            </div>

                <div className="flex flex-col items-center justify-between gap-3 border-t border-border/8 pt-5 text-[0.62rem] uppercase tracking-[0.32em] text-muted-foreground/58 sm:flex-row sm:text-[0.68rem]">
                  <span>Enter or click to continue</span>
                  <span>Editorial motion system</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    );
  }
