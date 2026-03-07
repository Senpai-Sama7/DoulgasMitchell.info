'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

const KATAKANA = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

// Large ASCII art for name
const ASCII_NAME = `
██████╗  ██████╗ ██╗   ██╗ ██████╗ ██╗      █████╗ ███████╗
██╔══██╗██╔═══██╗██║   ██║██╔═══██╗██║     ██╔══██╗██╔════╝
██║  ██║██║   ██║██║   ██║██║   ██║██║     ███████║███████╗
██║  ██║██║   ██║██║   ██║██║   ██║██║     ██╔══██║╚════██║
██████╔╝╚██████╔╝╚██████╔╝╚██████╔╝███████╗██║  ██║███████║
╚═════╝  ╚═════╝  ╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝

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

interface SplashOverlayProps {
  onComplete?: () => void;
  minDisplayTime?: number;
}

function createMatrixCharacters(length: number) {
  return Array.from({ length }, () => KATAKANA[Math.floor(Math.random() * KATAKANA.length)]);
}

export function SplashOverlay({ onComplete, minDisplayTime = 4000 }: SplashOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [phase, setPhase] = useState<'video' | 'matrix' | 'build' | 'reveal' | 'fade'>('video');

  useEffect(() => {
    // Clear seen flag for testing/troubleshooting to ensure it shows up
    sessionStorage.removeItem('splash-seen');
    setIsVisible(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  const [matrixChars, setMatrixChars] = useState<string[]>(() => createMatrixCharacters(150));
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentRole, setCurrentRole] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isVisible) {
      onComplete?.();
    }
  }, [isVisible, onComplete]);

  // Video intro phase
  useEffect(() => {
    if (!isVisible || prefersReducedMotion || phase !== 'video') return;

    const timer = setTimeout(() => {
      setPhase('matrix');
    }, 4000);

    return () => clearTimeout(timer);
  }, [isVisible, prefersReducedMotion, phase]);

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

    // Transition to build phase
    const timeout = setTimeout(() => {
      setPhase('build');
      clearInterval(interval);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isVisible, prefersReducedMotion, phase]);

  // Build phase - type out ASCII art
  useEffect(() => {
    if (phase !== 'build' || prefersReducedMotion) return;

    const lines = ASCII_NAME.split('\n').filter(line => line.trim());
    
    const typeInterval = setInterval(() => {
      setTypedLines(prev => {
        if (currentLine >= lines.length) {
          clearInterval(typeInterval);
          setTimeout(() => setPhase('reveal'), 500);
          return prev;
        }
        
        const line = lines[currentLine];
        const currentTyped = prev[currentLine] || '';
        
        if (currentTyped.length < line.length) {
          const next = [...prev];
          next[currentLine] = line.slice(0, currentTyped.length + 3);
          return next;
        } else {
          setCurrentLine(currentLine + 1);
          return [...prev, line];
        }
      });
    }, 30);

    return () => clearInterval(typeInterval);
  }, [phase, currentLine, prefersReducedMotion]);

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
      sessionStorage.setItem('splash-seen', 'true');
      setIsVisible(false);
    }, 1000); // Give it time to fade out properly

    return () => clearTimeout(timeout);
  }, [phase]);

  const handleSkip = useCallback(() => {
    sessionStorage.setItem('splash-seen', 'true');
    setIsVisible(false);
  }, []);

  // Skip on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleSkip();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSkip]);

  if (!isVisible && typeof window !== 'undefined') return null;

  // Reduced motion version - simple fade
  if (prefersReducedMotion) {
    return (
      <AnimatePresence onExitComplete={onComplete}>
        {isVisible && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
            onClick={handleSkip}
          >
            <div className="text-center">
              <p className="font-mono text-sm text-green-500">Loading...</p>
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
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center overflow-hidden cursor-pointer"
          style={{ height: '100dvh' }}
          onClick={handleSkip}
        >
          {/* Video Intro Phase */}
          {phase === 'video' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center p-4"
            >
              <video
                autoPlay
                muted
                playsInline
                poster="/media/breathing-dm-poster.webp"
                className="w-full h-full object-contain max-w-2xl mix-blend-screen"
              >
                <source src="/media/breathing-dm-loop.mp4" type="video/mp4" />
              </video>
            </motion.div>
          )}

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
            <AnimatePresence>
              {phase !== 'video' && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-8"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 border border-green-500/30 rounded-lg bg-green-500/5">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                    </div>
                    <span className="font-mono text-xs text-green-500/70">
                      douglas-mitchell-system-v4.2.0
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ASCII Art */}
            {(phase === 'build' || phase === 'reveal' || phase === 'fade') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 w-full max-w-full overflow-hidden flex justify-center"
              >
                <pre className="font-mono text-[5px] sm:text-[8px] md:text-[10px] lg:text-xs text-green-500 leading-none tracking-tighter whitespace-pre overflow-visible text-center inline-block mx-auto scale-[0.8] sm:scale-100">
                  {typedLines.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      {line}
                    </motion.div>
                  ))}
                </pre>
              </motion.div>
            )}

            {/* Subtitle */}
            {phase === 'reveal' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8"
              >
                <div className="flex items-center justify-center gap-4">
                  <span className="font-mono text-green-500/30">{'◄'}</span>
                  <span className="font-mono text-lg text-green-400 tracking-widest">
                    {SUBTITLE}
                  </span>
                  <span className="font-mono text-green-500/30">{'►'}</span>
                </div>
              </motion.div>
            )}

            {/* Rotating Role */}
            {phase === 'reveal' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-8 h-8"
              >
                <div className="flex items-center justify-center gap-3">
                  <span className="font-mono text-xs text-green-500/50">$</span>
                  <motion.span
                    key={currentRole}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="font-mono text-sm text-green-400"
                  >
                    {ROLES[currentRole]}
                  </motion.span>
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="font-mono text-green-500"
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
                className="w-64 sm:w-80 mx-auto"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs text-green-500/50">loading...</span>
                  <span className="font-mono text-xs text-green-400">{progress}%</span>
                </div>
                <div className="h-1 bg-green-500/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <div className="mt-2 font-mono text-[10px] text-green-500/30">
                  {'['}{'█'.repeat(Math.floor(progress / 5))}{'░'.repeat(20 - Math.floor(progress / 5))}{']'}
                </div>
              </motion.div>
            )}

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute bottom-8 left-0 right-0 text-center"
            >
              <p className="font-mono text-xs text-green-500/40">
                Press <kbd className="px-1.5 py-0.5 bg-green-500/10 rounded text-green-500/60">ESC</kbd> or click to skip
              </p>
            </motion.div>

            {/* Corner Decorations */}
            <div className="absolute top-8 left-8 font-mono text-xs text-green-500/30">
              ╭──────────────────╮
            </div>
            <div className="absolute top-8 right-8 font-mono text-xs text-green-500/30">
              ╭──────────────────╮
            </div>
            <div className="absolute bottom-8 left-8 font-mono text-xs text-green-500/30">
              ╰──────────────────╯
            </div>
            <div className="absolute bottom-8 right-8 font-mono text-xs text-green-500/30">
              ╰──────────────────╯
            </div>
          </div>

          {/* Scanline Effect */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.03) 2px, rgba(0,255,0,0.03) 4px)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
