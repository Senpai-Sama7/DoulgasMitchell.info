'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ParticleTitleProps {
  firstName: string;
  lastName: string;
}

export function ParticleTitle({ firstName, lastName }: ParticleTitleProps) {
  const [phase, setPhase] = useState<'typing' | 'solidifying' | 'final'>('typing');
  const [typedFirst, setTypedFirst] = useState('');
  const [typedLast, setTypedLast] = useState('');
  const seedSource = `${firstName}:${lastName}`;

  useEffect(() => {
    let firstIdx = 0;
    let lastIdx = 0;
    let typeLast: ReturnType<typeof setInterval> | undefined;
    let solidifyTimeout: ReturnType<typeof setTimeout> | undefined;

    const typeFirst = setInterval(() => {
      if (firstIdx <= firstName.length) {
        setTypedFirst(firstName.slice(0, firstIdx));
        firstIdx++;
      } else {
        clearInterval(typeFirst);
        typeLast = setInterval(() => {
          if (lastIdx <= lastName.length) {
            setTypedLast(lastName.slice(0, lastIdx));
            lastIdx++;
          } else {
            clearInterval(typeLast);
            solidifyTimeout = setTimeout(() => setPhase('solidifying'), 500);
          }
        }, 80);
      }
    }, 80);

    return () => {
      clearInterval(typeFirst);
      if (typeLast) clearInterval(typeLast);
      if (solidifyTimeout) clearTimeout(solidifyTimeout);
    };
  }, [firstName, lastName]);

  useEffect(() => {
    if (phase === 'solidifying') {
      const timer = setTimeout(() => setPhase('final'), 1500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const hashValue = (input: string) => {
    let hash = 2166136261;
    for (let i = 0; i < input.length; i++) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  };

  const seededValue = (key: string) =>
    hashValue(`${seedSource}:${key}`) / 0xffffffff;

  const particles = useMemo(() => {
    const hv = (input: string): number => {
      let h = 2166136261;
      for (let i = 0; i < input.length; i++) {
        h ^= input.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return h >>> 0;
    };
    const sv = (key: string): number =>
      hv(`${seedSource}:${key}`) / 0xffffffff;

    return Array.from({ length: 120 }).map((_, i) => ({
      id: i,
      initialX: sv(`particle:${i}:x`) * 800 - 400,
      initialY: sv(`particle:${i}:y`) * 400 - 200,
      size: sv(`particle:${i}:size`) * 4 + 1,
      delay: sv(`particle:${i}:delay`) * 0.5,
    }));
  }, [seedSource]);

  const getAsciiBlock = (char: string, index: number) => {
    if (char === ' ') return ' ';
    const blocks = ['\u2588', '\u2593', '\u2592', '\u2591'];
    const blockIndex =
      Math.floor(seededValue(`glyph:${index}:${char}`) * blocks.length) %
      blocks.length;
    return blocks[blockIndex];
  };

  const renderAsciiText = (text: string) =>
    text.split('').map((char, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="inline-block"
      >
        {getAsciiBlock(char, i)}
      </motion.span>
    ));

  return (
    <div className="relative inline-block py-4">
      {/*
       * LCP FIX: The real heading text is always rendered visibly in the DOM
       * so Lighthouse can measure it on first paint. The animation layers sit
       * on top via absolute positioning and pointer-events:none.
       *
       * Before this fix, the only visible content during the ~3.4s animation
       * sequence was aria-hidden ASCII blocks. The sr-only h1 is off-screen
       * and Lighthouse does NOT count it as the LCP element, so LCP was
       * deferred until phase==='final' — costing ~3s on Slow 4G.
       */}

      {/* Always-visible real text — this IS the LCP element Lighthouse measures */}
      <div className="editorial-title text-center" aria-hidden={phase !== 'final'}>
        <span className="block text-foreground">{firstName}</span>
        <span className="block text-primary mt-1">{lastName}</span>
      </div>

      {/* Animation overlay — sits on top, does not affect LCP measurement */}
      <AnimatePresence mode="wait">
        {phase !== 'final' && (
          <motion.div
            key={phase}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(8px)', transition: { duration: 0.4 } }}
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
            aria-hidden="true"
          >
            {phase === 'typing' && (
              <div className="font-mono text-3xl md:text-5xl lg:text-7xl tracking-tighter text-primary/80 flex flex-col items-center">
                <div className="flex min-h-[1em] gap-1">{renderAsciiText(typedFirst)}</div>
                <div className="mt-2 flex min-h-[1em] gap-1 text-foreground/60">{renderAsciiText(typedLast)}</div>
                <div className="flex flex-col items-center mt-4">
                  <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground/40 mb-2">DM</span>
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="inline-block w-[0.5em] h-[1.2em] bg-primary"
                  />
                </div>
              </div>
            )}

            {phase === 'solidifying' && (
              <div className="relative flex flex-col items-center w-full h-full">
                {/* Particle burst */}
                <div className="absolute inset-0 flex items-center justify-center overflow-visible">
                  {particles.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ x: p.initialX, y: p.initialY, opacity: 0, scale: 2 }}
                      animate={{ x: 0, y: 0, opacity: [0, 1, 0], scale: 0.5 }}
                      transition={{ duration: 1.5, ease: 'circOut', delay: p.delay }}
                      className="absolute bg-primary rounded-sm"
                      style={{ width: p.size, height: p.size }}
                    />
                  ))}
                </div>

                {/* Frosted overlay text matching final layout */}
                <motion.div
                  initial={{ scale: 0.8, filter: 'blur(30px)', opacity: 0 }}
                  animate={{ scale: 1, filter: 'blur(0px)', opacity: 1 }}
                  className="editorial-title relative z-10 text-center"
                  style={{ textShadow: '0 4px 12px rgba(0,0,0,0.2)', letterSpacing: '-0.04em' }}
                >
                  <span className="block text-foreground drop-shadow-2xl">{firstName}</span>
                  <span className="block text-primary drop-shadow-2xl mt-1">{lastName}</span>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
