'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ParticleTitleProps {
  firstName: string;
  lastName: string;
}

export function ParticleTitle({ firstName, lastName }: ParticleTitleProps) {
  const [phase, setPhase] = useState<'typing' | 'solidifying' | 'final'>('typing');
  const [typedFirst, setTypedFirst] = useState('');
  const [typedLast, setTypedLast] = useState('');

  useEffect(() => {
    let firstIdx = 0;
    let lastIdx = 0;
    
    const typeFirst = setInterval(() => {
      if (firstIdx <= firstName.length) {
        setTypedFirst(firstName.slice(0, firstIdx));
        firstIdx++;
      } else {
        clearInterval(typeFirst);
        const typeLast = setInterval(() => {
          if (lastIdx <= lastName.length) {
            setTypedLast(lastName.slice(0, lastIdx));
            lastIdx++;
          } else {
            clearInterval(typeLast);
            setTimeout(() => setPhase('solidifying'), 500);
          }
        }, 80);
      }
    }, 80);

    return () => {
      clearInterval(firstIdx as any);
      clearInterval(lastIdx as any);
    };
  }, [firstName, lastName]);

  useEffect(() => {
    if (phase === 'solidifying') {
      const timer = setTimeout(() => setPhase('final'), 1500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const particles = Array.from({ length: 120 }).map((_, i) => ({
    id: i,
    initialX: Math.random() * 800 - 400,
    initialY: Math.random() * 400 - 200,
    size: Math.random() * 4 + 1,
    delay: Math.random() * 0.5,
  }));

  const getAsciiBlock = (char: string) => {
    if (char === ' ') return ' ';
    const blocks = ['█', '▓', '▒', '░'];
    return blocks[Math.floor(Math.random() * blocks.length)];
  };

  const renderAsciiText = (text: string) => {
    return text.split('').map((char, i) => (
      <motion.span
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="inline-block"
      >
        {getAsciiBlock(char)}
      </motion.span>
    ));
  };

  return (
    <div className="relative inline-block py-4">
      <AnimatePresence mode="wait">
        {phase === 'typing' && (
          <motion.div
            key="typing"
            exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.1 }}
            className="font-mono text-3xl md:text-5xl lg:text-7xl tracking-tighter text-primary/80 flex flex-col items-center"
          >
            <div className="flex gap-1">{renderAsciiText(firstName)}</div>
            <div className="flex gap-1 text-foreground/60 mt-2">{renderAsciiText(lastName)}</div>
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-[0.5em] h-[1em] bg-primary align-middle mt-4"
            />
          </motion.div>
        )}

        {phase === 'solidifying' && (
          <motion.div
            key="solidifying"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative flex flex-col items-center"
          >
            {/* Background Particles Cluster */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ x: p.initialX, y: p.initialY, opacity: 0, scale: 2 }}
                  animate={{ x: 0, y: 0, opacity: [0, 1, 0], scale: 0.5 }}
                  transition={{ duration: 1.5, ease: "circOut", delay: p.delay }}
                  className="absolute bg-primary rounded-sm"
                  style={{ width: p.size, height: p.size }}
                />
              ))}
            </div>

            {/* Skeuomorphic High-Fidelity Solid Text */}
            <motion.h1 
              initial={{ scale: 0.8, filter: 'blur(30px)', opacity: 0 }}
              animate={{ scale: 1, filter: 'blur(0px)', opacity: 1 }}
              className="editorial-title relative z-10 text-center"
              style={{
                textShadow: '0 4px 12px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.1)',
                letterSpacing: '-0.04em'
              }}
            >
              <span className="block text-foreground drop-shadow-2xl">{firstName}</span>
              <span className="block text-primary drop-shadow-2xl mt-1">{lastName}</span>
            </motion.h1>
          </motion.div>
        )}

        {phase === 'final' && (
          <motion.h1 
            key="final"
            initial={{ opacity: 1 }}
            className="editorial-title text-center"
          >
            <span className="block text-foreground">{firstName}</span>
            <span className="block text-primary mt-1">{lastName}</span>
          </motion.h1>
        )}
      </AnimatePresence>
    </div>
  );
}
