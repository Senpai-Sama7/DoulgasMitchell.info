'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';

const LINES = ['DM', 'OPERATIONS ANALYST', 'AI PRACTITIONER', 'AUTHOR', 'SYSTEMS STRATEGIST'];
const AUTO_DISMISS_MS = 8000;
const PARTICLE_COUNT = 120;
const CANVAS_DPR = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

export function SplashOverlay({ onComplete }: { onComplete?: () => void }) {
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<'enter' | 'active' | 'exit' | 'done'>(
    prefersReducedMotion ? 'done' : 'enter'
  );
  const [visibleLine, setVisibleLine] = useState(0);
  const [dismissReady, setDismissReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const dimsRef = useRef({ w: 0, h: 0 });

  const dismiss = useCallback(() => {
    setPhase('exit');
    setTimeout(() => {
      setPhase('done');
      onComplete?.();
    }, 700);
  }, [onComplete]);

  // Phase transitions
  useEffect(() => {
    if (phase !== 'enter') return;
    const t = setTimeout(() => setPhase('active'), 500);
    return () => clearTimeout(t);
  }, [phase]);

  // Auto-dismiss
  useEffect(() => {
    if (phase !== 'active') return;
    const t = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [phase, dismiss]);

  // Enable skip button after a small delay
  useEffect(() => {
    if (phase !== 'active') return;
    const t = setTimeout(() => setDismissReady(true), 1200);
    return () => clearTimeout(t);
  }, [phase]);

  // Staggered line reveal
  useEffect(() => {
    if (phase !== 'active') return;
    const interval = setInterval(() => {
      setVisibleLine((prev) => {
        if (prev >= LINES.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [phase]);

  // Click to dismiss
  useEffect(() => {
    if (!dismissReady) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('button')) dismiss();
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [dismissReady, dismiss]);

  // Keyboard dismiss
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') dismiss();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dismiss]);

  // Canvas particle field
  useEffect(() => {
    if (phase === 'done' || phase === 'exit') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = CANVAS_DPR;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dimsRef.current = { w: window.innerWidth, h: window.innerHeight };
    };

    resize();
    window.addEventListener('resize', resize);

    // Init particles
    const { w, h } = dimsRef.current;
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      life: Math.random() * 200,
      maxLife: 180 + Math.random() * 120,
      size: 0.6 + Math.random() * 1.8,
      hue: 210 + Math.random() * 30,
    }));

    let frame = 0;
    const animate = () => {
      frame++;
      const { w: cw, h: ch } = dimsRef.current;
      ctx.clearRect(0, 0, cw, ch);

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        // Wrap around
        if (p.x < -20) p.x = cw + 20;
        if (p.x > cw + 20) p.x = -20;
        if (p.y < -20) p.y = ch + 20;
        if (p.y > ch + 20) p.y = -20;

        // Recycle dead particles
        if (p.life > p.maxLife) {
          p.x = Math.random() * cw;
          p.y = Math.random() * ch;
          p.vx = (Math.random() - 0.5) * 0.6;
          p.vy = (Math.random() - 0.5) * 0.6;
          p.life = 0;
          p.maxLife = 180 + Math.random() * 120;
          p.hue = 210 + Math.random() * 30;
        }

        const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.35;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 60%, 65%, ${alpha})`;
        ctx.fill();

        // Occasional brighter pulses
        if (frame % 3 === 0) {
          const pulseAlpha = alpha * 0.15;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 80%, 75%, ${pulseAlpha})`;
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [phase]);

  if (phase === 'done') return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: phase === 'exit' ? 0 : 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#05080f]"
      role="dialog"
      aria-modal="true"
      aria-label="Loading Douglas Mitchell portfolio"
    >
      {/* Particle canvas layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        aria-hidden="true"
      />

      {/* Radial vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,transparent_0%,rgba(5,8,15,0.7)_90%)]" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-10 px-6 text-center">
        {/* Progress bar */}
        {phase === 'enter' && (
          <div className="h-[1px] w-48 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full bg-gradient-to-r from-white/0 via-white/50 to-white/0"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        )}

        {/* Main label */}
        <div className="space-y-5">
          {phase === 'enter' ? (
            <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-white/20">
              Initializing
            </p>
          ) : (
            <div className="space-y-3">
              {LINES.map((line, i) => (
                <AnimatePresence key={line}>
                  {i < visibleLine && (
                    <motion.p
                      initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className={i === 0
                        ? 'text-4xl font-semibold tracking-tight text-white sm:text-5xl'
                        : 'font-mono text-[11px] uppercase tracking-[0.3em] text-white/35'
                      }
                    >
                      {i === 0 ? 'Douglas Mitchell' : line}
                    </motion.p>
                  )}
                </AnimatePresence>
              ))}
            </div>
          )}
        </div>

        {/* Skip hint */}
        {dismissReady && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={dismiss}
            className="font-mono text-[10px] uppercase tracking-[0.35em] text-white/20 transition-colors hover:text-white/50"
          >
            Press any key to enter
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
