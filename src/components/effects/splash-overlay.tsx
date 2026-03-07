'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// Nord color scheme
const NORD_COLORS = {
  bg: '#2E3440',
  fg: '#ECEFF4',
  cyan: '#88C0D0',
  blue: '#81A1C1',
  red: '#BF616A',
  green: '#A3BE8C',
  yellow: '#EBCB8B',
};

// Remove ASCII block constants
const SUBTITLE = 'THE ARCHITECT';
const ROLES = [
  'Operations Analyst',
  'AI Practitioner',
  'Systems Architect',
  'Author',
  'Google AI Certified',
  'Anthropic Certified',
];

// Dot characters for background
const DOT_CHARS = ['·', '○', '●', '◦', '○', '·'];

interface SplashOverlayProps {
  onComplete?: () => void;
  minDisplayTime?: number;
}

function createDotField(length: number) {
  return Array.from({ length }, () => DOT_CHARS[Math.floor(Math.random() * DOT_CHARS.length)]);
}

export function SplashOverlay({ onComplete, minDisplayTime = 4000 }: SplashOverlayProps) {
  const [typedName, setTypedName] = useState('');
  const [phase, setPhase] = useState<'matrix' | 'typing' | 'reveal' | 'fade'>('matrix');
  const [matrixChars, setMatrixChars] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentRole, setCurrentRole] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const FULL_NAME = "DOUGLAS MITCHELL";
  const KATAKANA = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

  useEffect(() => {
    // Initialize matrix chars
    setMatrixChars(Array.from({ length: 150 }, () => 
      KATAKANA[Math.floor(Math.random() * KATAKANA.length)]
    ));
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    if (!isVisible) {
      onComplete?.();
    }
  }, [isVisible, onComplete]);

  // Matrix rain effect
  useEffect(() => {
    if (!isVisible || prefersReducedMotion || phase !== 'matrix') return;

    const interval = setInterval(() => {
      setMatrixChars(prev => prev.map(() => 
        Math.random() > 0.7 
          ? KATAKANA[Math.floor(Math.random() * KATAKANA.length)]
          : prev[Math.floor(Math.random() * prev.length)]
      ));
    }, 100);

    const timeout = setTimeout(() => {
      setPhase('typing');
      clearInterval(interval);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isVisible, prefersReducedMotion, phase]);

  // Typing phase - GOD tier font reveal
  useEffect(() => {
    if (phase !== 'typing' || prefersReducedMotion) return;

    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (charIndex <= FULL_NAME.length) {
        setTypedName(FULL_NAME.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => setPhase('reveal'), 800);
      }
    }, 60);

    return () => clearInterval(typeInterval);
  }, [phase, prefersReducedMotion]);

  // Progress bar animation
  useEffect(() => {
    if (phase !== 'reveal') return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setPhase('fade'), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [phase]);

  // Role rotation
  useEffect(() => {
    if (phase !== 'reveal') return;

    const interval = setInterval(() => {
      setCurrentRole(prev => (prev + 1) % ROLES.length);
    }, 800);

    return () => clearInterval(interval);
  }, [phase]);

  // Complete splash
  useEffect(() => {
    if (phase !== 'fade') return;

    const timeout = setTimeout(() => {
      setIsVisible(false);
      // Mark splash as seen
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('splash-seen', 'true');
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [phase]);

  const handleSkip = useCallback(() => {
    setIsVisible(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleSkip();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSkip]);

  if (!isVisible && typeof window !== 'undefined') return null;

  // Reduced motion version
  if (prefersReducedMotion) {
    return (
      <AnimatePresence onExitComplete={onComplete}>
        {isVisible && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ backgroundColor: NORD_COLORS.bg, height: '100dvh' }}
            onClick={handleSkip}
          >
            <div className="text-center">
              <p className="font-mono text-sm" style={{ color: NORD_COLORS.cyan }}>Loading...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden cursor-pointer bg-black"
          style={{ height: '100dvh' }}
          onClick={handleSkip}
        >
          {/* Matrix Rain Background */}
          {phase === 'matrix' && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 grid grid-cols-[repeat(10,1fr)] sm:grid-cols-[repeat(15,1fr)] gap-1 p-4 sm:p-8 pointer-events-none"
            >
              {matrixChars.map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: [0, 1, 0.3], y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.01 }}
                  className="font-mono text-green-500/40 text-sm sm:text-lg text-center"
                  style={{
                    textShadow: '0 0 10px rgba(34, 197, 94, 0.5)',
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.div>
          )}

          {/* Main Content */}
          <div className="relative z-10 w-full flex flex-col items-center justify-center text-center px-4">
            {/* Terminal Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 border border-green-500/30 rounded-lg bg-green-500/5">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <span className="font-mono text-xs text-green-500/70 uppercase tracking-widest">
                  system_monitor.sh
                </span>
              </div>
            </motion.div>

            {/* GOD Tier Clean Typography - Stacked with massive gap */}
            {(phase === 'typing' || phase === 'reveal' || phase === 'fade') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-16 w-full flex flex-col items-center space-y-16 sm:space-y-24 lg:space-y-32"
              >
                <div className="relative">
                  <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[12rem] font-black tracking-[-0.05em] text-white leading-none uppercase">
                    {typedName.split(' ')[0]}
                    {phase === 'typing' && !typedName.includes(' ') && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.1, repeat: Infinity }}
                        className="inline-block w-[4px] h-[0.8em] bg-primary ml-2 align-middle"
                      />
                    )}
                  </h1>
                </div>
                
                <div className="relative">
                  <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[12rem] font-black tracking-[-0.05em] text-primary leading-none uppercase">
                    {typedName.split(' ')[1] || ''}
                    {phase === 'typing' && typedName.includes(' ') && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.1, repeat: Infinity }}
                        className="inline-block w-[4px] h-[0.8em] bg-white ml-2 align-middle"
                      />
                    )}
                  </h1>
                </div>
              </motion.div>
            )}

            {/* Subtitle */}
            {phase === 'reveal' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 sm:mb-8"
              >
                <div className="flex items-center justify-center gap-3 sm:gap-4">
                  <span className="font-mono text-xs sm:text-sm" style={{ color: NORD_COLORS.blue, opacity: 0.5 }}>{'◄'}</span>
                  <span className="font-mono text-base sm:text-lg md:text-xl tracking-widest" style={{ color: NORD_COLORS.fg }}>
                    {SUBTITLE}
                  </span>
                  <span className="font-mono text-xs sm:text-sm" style={{ color: NORD_COLORS.blue, opacity: 0.5 }}>{'►'}</span>
                </div>
              </motion.div>
            )}

            {/* Rotating Role */}
            {phase === 'reveal' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 sm:mb-8 h-6 sm:h-8"
              >
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <span className="font-mono text-xs" style={{ color: NORD_COLORS.blue, opacity: 0.5 }}>$</span>
                  <motion.span
                    key={currentRole}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="font-mono text-xs sm:text-sm"
                    style={{ color: NORD_COLORS.cyan }}
                  >
                    {ROLES[currentRole]}
                  </motion.span>
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="font-mono"
                    style={{ color: NORD_COLORS.green }}
                  >
                    ▊
                  </motion.span>
                </div>
              </motion.div>
            )}

            {/* Progress Bar */}
            {phase === 'reveal' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-48 sm:w-64 mx-auto"
              >
                <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                  <span className="font-mono text-[10px] sm:text-xs" style={{ color: NORD_COLORS.blue, opacity: 0.5 }}>loading...</span>
                  <span className="font-mono text-[10px] sm:text-xs" style={{ color: NORD_COLORS.cyan }}>{progress}%</span>
                </div>
                <div className="h-0.5 sm:h-1 rounded-full overflow-hidden" style={{ backgroundColor: NORD_COLORS.blue, opacity: 0.2 }}>
                  <motion.div
                    className="h-full"
                    style={{ backgroundColor: NORD_COLORS.cyan }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </motion.div>
            )}

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 sm:mt-12 text-center"
            >
              <p className="font-mono text-[10px] sm:text-xs" style={{ color: NORD_COLORS.blue, opacity: 0.5 }}>
                Press <kbd className="px-1.5 py-0.5 rounded text-[10px]" style={{ backgroundColor: 'rgba(136, 192, 208, 0.1)', color: NORD_COLORS.cyan }}>ESC</kbd> or click to skip
              </p>
            </motion.div>
          </div>

          {/* Subtle Glow */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(136, 192, 208, 0.05) 0%, transparent 70%)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
