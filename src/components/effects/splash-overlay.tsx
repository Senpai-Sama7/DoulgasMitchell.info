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

// Large ASCII art for Douglas Mitchell - Stacked for impact
const ASCII_DOUGLAS = `
██████╗  ██████╗ ██╗   ██╗ ██████╗ ██╗      █████╗ ███████╗
██╔══██╗██╔═══██╗██║   ██║██╔════╝ ██║     ██╔══██╗██╔════╝
██║  ██║██║   ██║██║   ██║██║  ███╗██║     ███████║███████╗
██║  ██║██║   ██║██║   ██║██║   ██║██║     ██╔══██║╚════██║
██████╔╝╚██████╔╝╚██████╔╝╚██████╔╝███████╗██║  ██║███████║
╚═════╝  ╚═════╝  ╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝`;

const ASCII_MITCHELL = `
███╗   ███╗██╗████████╗ ██████╗██╗  ██╗███████╗██╗     ██╗     
████╗ ████║██║╚══██╔══╝██╔════╝██║  ██║██╔════╝██║     ██║     
██╔████╔██║██║   ██║   ██║     ███████║█████╗  ██║     ██║     
██║╚██╔╝██║██║   ██║   ██║     ██╔══██║██╔══╝  ██║     ██║     
██║ ╚═╝ ██║██║   ██║   ╚██████╗██║  ██║███████╗███████╗███████╗
╚═╝     ╚═╝╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝`;

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
  const [phase, setPhase] = useState<'dots' | 'typing' | 'reveal' | 'fade'>('dots');
  const [dotField, setDotField] = useState<string[]>(() => createDotField(100));
  const [progress, setProgress] = useState(0);
  const [currentRole, setCurrentRole] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const FULL_NAME = "DOUGLAS MITCHELL";

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

  // Dot field animation
  useEffect(() => {
    if (!isVisible || prefersReducedMotion || phase !== 'dots') return;

    const interval = setInterval(() => {
      setDotField(prev => prev.map(() => 
        Math.random() > 0.8 
          ? DOT_CHARS[Math.floor(Math.random() * DOT_CHARS.length)]
          : prev[Math.floor(Math.random() * prev.length)]
      ));
    }, 150);

    const timeout = setTimeout(() => {
      setPhase('build');
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
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden cursor-pointer"
          style={{ backgroundColor: NORD_COLORS.bg, height: '100dvh' }}
          onClick={handleSkip}
        >
          {/* Dot Field Background */}
          {phase === 'dots' && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2 sm:gap-3 p-4 pointer-events-none"
            >
              {dotField.map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: [0.2, 0.5, 0.2], scale: 1 }}
                  transition={{ duration: 1, delay: i * 0.02, repeat: Infinity }}
                  className="font-mono text-xs sm:text-sm md:text-base text-center"
                  style={{ color: NORD_COLORS.blue }}
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
              className="mb-6 sm:mb-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg"
                style={{ borderColor: NORD_COLORS.cyan, backgroundColor: 'rgba(136, 192, 208, 0.1)' }}>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: NORD_COLORS.red }} />
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: NORD_COLORS.yellow }} />
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: NORD_COLORS.green }} />
                </div>
                <span className="font-mono text-[10px] sm:text-xs" style={{ color: NORD_COLORS.cyan }}>
                  douglas-mitchell-v4.2.0
                </span>
              </div>
            </motion.div>

            {/* GOD Tier Typewriter Name */}
            {(phase === 'typing' || phase === 'reveal' || phase === 'fade') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-12 relative"
              >
                <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white flex flex-col items-center leading-[0.85]">
                  <span className="relative inline-block overflow-hidden">
                    {typedName.split(' ')[0]}
                    {phase === 'typing' && !typedName.includes(' ') && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.1, repeat: Infinity }}
                        className="inline-block w-[4px] h-[0.8em] bg-primary ml-1 align-middle"
                      />
                    )}
                  </span>
                  <span className="text-primary mt-2">
                    {typedName.split(' ')[1] || ''}
                    {phase === 'typing' && typedName.includes(' ') && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.1, repeat: Infinity }}
                        className="inline-block w-[4px] h-[0.8em] bg-white ml-1 align-middle"
                      />
                    )}
                  </span>
                </h1>
                
                {/* Architectural Accents */}
                <div className="absolute -inset-x-8 -inset-y-4 border-x border-white/5 pointer-events-none" />
                <div className="absolute -inset-x-4 -inset-y-8 border-y border-white/5 pointer-events-none" />
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
