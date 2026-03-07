'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  char: string;
  x: number;
  y: number;
  opacity: number;
  speed: number;
  size: number;
}

interface AsciiParticlesProps {
  particleCount?: number;
  className?: string;
}

const ASCII_CHARS = '∙∘○●○∘∙┄┅┈┉╌╍═─│┌┐└┘├┤┬┴┼';
const MATRIX_CHARS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ';

export function AsciiParticles({ particleCount = 50, className = '' }: AsciiParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const prefersReducedMotion = useRef(false);

  // Check for reduced motion preference
  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const initParticles = useCallback((width: number, height: number) => {
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      char: ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)],
      x: Math.random() * width,
      y: Math.random() * height,
      opacity: Math.random() * 0.3 + 0.1,
      speed: Math.random() * 0.5 + 0.1,
      size: Math.random() * 12 + 10,
    }));
  }, [particleCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    if (prefersReducedMotion.current) {
      // Static render for reduced motion
      ctx.font = '14px monospace';
      ctx.fillStyle = 'currentColor';
      particlesRef.current.forEach(particle => {
        ctx.globalAlpha = particle.opacity;
        ctx.fillText(particle.char, particle.x, particle.y);
      });
      return () => window.removeEventListener('resize', handleResize);
    }

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
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none opacity-20 dark:opacity-10 ${className}`}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}

// Matrix rain effect (subtle)
export function MatrixRain({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const columnsRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const fontSize = 14;
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const columnCount = Math.floor(canvas.width / fontSize);
      columnsRef.current = Array(columnCount).fill(0).map(() => Math.random() * canvas.height / fontSize);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.font = `${fontSize}px monospace`;

      columnsRef.current.forEach((y, i) => {
        const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
        const x = i * fontSize;
        
        ctx.fillText(char, x, y * fontSize);

        if (y * fontSize > canvas.height && Math.random() > 0.975) {
          columnsRef.current[i] = 0;
        }
        columnsRef.current[i] += 0.5;
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
