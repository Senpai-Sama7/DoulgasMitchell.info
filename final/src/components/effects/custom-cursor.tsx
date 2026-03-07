'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface AsciiParticlesProps {
  particleCount?: number;
  className?: string;
}

const ASCII_CHARS = '∙∘○●○∘∙┄┅┈┉╌╍═─│┌┐└┘├┤┬┴┼';

export function AsciiParticles({ particleCount = 50, className = '' }: AsciiParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    char: string;
    x: number;
    y: number;
    opacity: number;
    speed: number;
  }>>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particlesRef.current = Array.from({ length: particleCount }, () => ({
        char: ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)],
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        opacity: Math.random() * 0.3 + 0.1,
        speed: Math.random() * 0.5 + 0.1,
      }));
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = '14px monospace';
      ctx.fillStyle = 'currentColor';

      particlesRef.current.forEach(particle => {
        particle.y -= particle.speed;
        
        if (particle.y < -20) {
          particle.y = canvas.height + 20;
          particle.x = Math.random() * canvas.width;
          particle.char = ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)];
        }

        ctx.globalAlpha = particle.opacity;
        ctx.fillText(particle.char, particle.x, particle.y);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none opacity-20 dark:opacity-10 ${className}`}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}

// Cursor trail effect
export function AsciiCursorTrail() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trailsRef = useRef<Array<{ id: number; el: HTMLSpanElement }>>([]);
  const charIndex = useRef(0);
  const idCounter = useRef(0);
  
  const chars = '∙∘○●○∘∙┄┅┈┉';
  
  // Calculate enabled state using useMemo
  const isEnabled = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = 'ontouchstart' in window;
    return !prefersReducedMotion && !isTouchDevice;
  }, []);

  useEffect(() => {
    if (!isEnabled) return;
    
    let lastX = 0;
    let lastY = 0;
    const threshold = 30;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const distance = Math.sqrt(Math.pow(e.clientX - lastX, 2) + Math.pow(e.clientY - lastY, 2));
      
      if (distance > threshold) {
        lastX = e.clientX;
        lastY = e.clientY;
        
        const char = chars[charIndex.current % chars.length];
        charIndex.current++;
        const id = idCounter.current++;
        
        const span = document.createElement('span');
        span.className = 'absolute font-mono text-xs text-muted-foreground';
        span.style.left = `${e.clientX}px`;
        span.style.top = `${e.clientY}px`;
        span.textContent = char;
        
        containerRef.current.appendChild(span);
        trailsRef.current.push({ id, el: span });
        
        requestAnimationFrame(() => {
          span.style.opacity = '0';
          span.style.transition = 'opacity 0.5s';
          setTimeout(() => {
            span.remove();
            trailsRef.current = trailsRef.current.filter(t => t.id !== id);
          }, 500);
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isEnabled]);

  if (!isEnabled) return null;

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-[9997]" aria-hidden="true" />;
}

// Custom cursor component
export function CustomCursor({ enabled = true }: { enabled?: boolean }) {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 300 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);
  
  // Calculate visibility using useMemo
  const isVisible = useMemo(() => {
    if (!enabled || typeof window === 'undefined') return false;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = 'ontouchstart' in window;
    return !prefersReducedMotion && !isTouchDevice;
  }, [enabled]);

  useEffect(() => {
    if (!isVisible) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [cursorX, cursorY, isVisible]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference hidden md:block"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        translateX: '-50%',
        translateY: '-50%',
      }}
    >
      <motion.div
        className="w-4 h-4 rounded-full bg-white"
        whileHover={{ scale: 2 }}
      />
    </motion.div>
  );
}
