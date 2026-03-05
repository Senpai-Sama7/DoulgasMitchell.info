"use client";

import { useEffect, useRef, useCallback, useState, useMemo } from "react";

// ============================================
// Particle Pool for Memory Efficiency
// ============================================
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  baseOpacity: number;
  hue: number;
  pulsePhase: number;
  pulseSpeed: number;
  active: boolean;
  id: number;
}

class ParticlePool {
  private particles: Particle[];
  private activeCount: number = 0;
  private nextId: number = 0;

  constructor(poolSize: number) {
    this.particles = Array.from({ length: poolSize }, () => this.createParticle());
  }

  private createParticle(): Particle {
    return {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 0,
      opacity: 0,
      baseOpacity: 0,
      hue: 0,
      pulsePhase: 0,
      pulseSpeed: 0,
      active: false,
      id: this.nextId++,
    };
  }

  activate(x: number, y: number, config: Partial<Particle> = {}): Particle | null {
    if (this.activeCount >= this.particles.length) {
      return null;
    }

    const particle = this.particles.find(p => !p.active);
    if (!particle) return null;

    particle.active = true;
    particle.x = x;
    particle.y = y;
    particle.vx = config.vx ?? (Math.random() - 0.5) * 0.4;
    particle.vy = config.vy ?? (Math.random() - 0.5) * 0.4;
    particle.radius = config.radius ?? Math.random() * 2 + 1;
    particle.opacity = config.opacity ?? Math.random() * 0.4 + 0.2;
    particle.baseOpacity = config.baseOpacity ?? Math.random() * 0.4 + 0.2;
    particle.hue = config.hue ?? 35 + Math.random() * 30;
    particle.pulsePhase = config.pulsePhase ?? Math.random() * Math.PI * 2;
    particle.pulseSpeed = config.pulseSpeed ?? 0.02 + Math.random() * 0.02;

    this.activeCount++;
    return particle;
  }

  deactivate(particle: Particle): void {
    particle.active = false;
    this.activeCount = Math.max(0, this.activeCount - 1);
  }

  getActiveParticles(): Particle[] {
    return this.particles.filter(p => p.active);
  }

  getActiveCount(): number {
    return this.activeCount;
  }

  resize(newSize: number): void {
    if (newSize > this.particles.length) {
      for (let i = this.particles.length; i < newSize; i++) {
        this.particles.push(this.createParticle());
      }
    } else if (newSize < this.particles.length) {
      this.particles = this.particles.slice(0, newSize);
    }
  }
}

// ============================================
// Performance Optimizer
// ============================================
class PerformanceOptimizer {
  private frameCount: number = 0;
  private lastFpsCheck: number = 0;
  private currentFps: number = 60;
  private targetFps: number;
  private skipFrames: number = 0;

  constructor(targetFps: number = 60) {
    this.targetFps = targetFps;
  }

  shouldRender(): boolean {
    this.frameCount++;
    const now = performance.now();
    
    if (now - this.lastFpsCheck >= 1000) {
      this.currentFps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsCheck = now;
      
      // Adjust quality based on performance
      if (this.currentFps < this.targetFps * 0.7) {
        this.skipFrames = Math.min(3, this.skipFrames + 1);
      } else if (this.currentFps > this.targetFps * 0.9 && this.skipFrames > 0) {
        this.skipFrames--;
      }
    }

    return true;
  }

  getFps(): number {
    return this.currentFps;
  }

  getSkipFrames(): number {
    return this.skipFrames;
  }

  getQualityLevel(): "high" | "medium" | "low" {
    if (this.currentFps >= this.targetFps * 0.9) return "high";
    if (this.currentFps >= this.targetFps * 0.7) return "medium";
    return "low";
  }
}

// ============================================
// Particle Field Component
// ============================================
interface ParticleFieldProps {
  particleDensity?: number;
  connectionDistance?: number;
  mouseInfluence?: number;
  enablePulse?: boolean;
  enableConnections?: boolean;
  enableMouseMove?: boolean;
  enableTrails?: boolean;
  className?: string;
  colorMode?: "warm" | "cool" | "auto";
  quality?: "auto" | "high" | "medium" | "low";
}

export function ParticleField({
  particleDensity = 20000,
  connectionDistance = 120,
  mouseInfluence = 150,
  enablePulse = true,
  enableConnections = true,
  enableMouseMove = true,
  enableTrails = false,
  className = "",
  colorMode = "auto",
  quality = "auto",
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlePoolRef = useRef<ParticlePool | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const animationRef = useRef<number>();
  const lastTimeRef = useRef(0);
  const optimizerRef = useRef<PerformanceOptimizer | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const frameCountRef = useRef(0);
  
  // Use lazy state initializer for prefers-reduced-motion
  const getPrefersReducedMotion = (): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  };
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getPrefersReducedMotion);

  // Determine if mobile for performance
  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768 || 'ontouchstart' in window;
  }, []);

  // Check for reduced motion preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Intersection observer for visibility
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  // Initialize particle pool
  const initParticlePool = useCallback((width: number, height: number) => {
    const baseCount = Math.floor((width * height) / particleDensity);
    const particleCount = isMobile 
      ? Math.min(Math.max(baseCount, 20), 40)
      : Math.min(Math.max(baseCount, 30), 80);

    if (!particlePoolRef.current) {
      particlePoolRef.current = new ParticlePool(particleCount);
    } else {
      particlePoolRef.current.resize(particleCount);
    }

    // Initialize particles
    const pool = particlePoolRef.current;
    for (let i = 0; i < particleCount; i++) {
      pool.activate(
        Math.random() * width,
        Math.random() * height
      );
    }

    return pool;
  }, [particleDensity, isMobile]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prefersReducedMotion) return;

    const ctx = canvas.getContext("2d", { 
      alpha: true,
      desynchronized: true, // Better performance
    });
    if (!ctx) return;

    // Initialize performance optimizer
    optimizerRef.current = new PerformanceOptimizer(60);

    // Set canvas size with device pixel ratio for crisp rendering
    const setCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
      
      initParticlePool(width, height);
    };

    const handleResize = () => {
      setCanvasSize();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!enableMouseMove) return;
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000, active: false };
    };

    // Use requestIdleCallback for non-critical updates
    const scheduleIdleTask = (callback: () => void) => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(callback, { timeout: 100 });
      } else {
        setTimeout(callback, 16);
      }
    };

    setCanvasSize();
    window.addEventListener("resize", handleResize, { passive: true });
    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    // Main animation loop with time-based updates
    const animate = (currentTime: number) => {
      if (!ctx || !canvas || !isVisible || !particlePoolRef.current || !optimizerRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const optimizer = optimizerRef.current;
      
      // Frame skipping for performance
      frameCountRef.current++;
      const skipRate = optimizer.getSkipFrames();
      if (skipRate > 0 && frameCountRef.current % (skipRate + 1) !== 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Throttle to ~60fps
      const deltaTime = currentTime - lastTimeRef.current;
      if (deltaTime < 16) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastTimeRef.current = currentTime;

      const width = canvas.width / (Math.min(window.devicePixelRatio || 1, 2));
      const height = canvas.height / (Math.min(window.devicePixelRatio || 1, 2));

      // Clear with transparent background
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains("dark");
      
      // Particle color based on theme and color mode
      let particleHue: number;
      let particleSaturation: number;
      
      if (colorMode === "auto") {
        particleHue = isDark ? 45 : 40;
        particleSaturation = isDark ? 80 : 60;
      } else if (colorMode === "warm") {
        particleHue = 35;
        particleSaturation = 70;
      } else {
        particleHue = 200;
        particleSaturation = 60;
      }

      const qualityLevel = quality === "auto" ? optimizer.getQualityLevel() : quality;
      const drawConnections = enableConnections && qualityLevel !== "low";
      const drawPulse = enablePulse && qualityLevel === "high";
      const drawTrails = enableTrails && qualityLevel === "high";

      // Get active particles from pool
      const particles = particlePoolRef.current.getActiveParticles();

      // Update and draw particles
      particles.forEach((particle) => {
        // Pulse animation
        if (drawPulse) {
          particle.pulsePhase += particle.pulseSpeed;
          particle.opacity = particle.baseOpacity + Math.sin(particle.pulsePhase) * 0.1;
        }

        // Store previous position for trails
        const prevX = particle.x;
        const prevY = particle.y;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Mouse interaction with smooth influence
        if (enableMouseMove && mouseRef.current.active) {
          const dx = mouseRef.current.x - particle.x;
          const dy = mouseRef.current.y - particle.y;
          const distSq = dx * dx + dy * dy;
          const influenceSq = mouseInfluence * mouseInfluence;

          if (distSq < influenceSq) {
            const dist = Math.sqrt(distSq);
            const force = (mouseInfluence - dist) / mouseInfluence;
            const forceStrength = force * force * 0.015; // Quadratic falloff
            particle.vx -= (dx / dist) * forceStrength;
            particle.vy -= (dy / dist) * forceStrength;
          }
        }

        // Velocity damping
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // Boundary wrapping (more performant than bouncing)
        if (particle.x < -50) particle.x = width + 50;
        if (particle.x > width + 50) particle.x = -50;
        if (particle.y < -50) particle.y = height + 50;
        if (particle.y > height + 50) particle.y = -50;

        // Draw trail if enabled
        if (drawTrails) {
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(particle.x, particle.y);
          ctx.strokeStyle = `hsla(${particleHue}, ${particleSaturation}%, ${isDark ? 70 : 50}%, ${particle.opacity * 0.3})`;
          ctx.lineWidth = particle.radius;
          ctx.stroke();
        }

        // Draw particle with glow effect
        const radius = Math.max(0.5, particle.radius);
        
        // Outer glow (skip on low quality)
        if (qualityLevel !== "low") {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, radius * 2, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${particleHue}, ${particleSaturation}%, ${isDark ? 70 : 50}%, ${particle.opacity * 0.2})`;
          ctx.fill();
        }

        // Inner core
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${particleHue}, ${particleSaturation}%, ${isDark ? 80 : 60}%, ${particle.opacity})`;
        ctx.fill();
      });

      // Draw connections (optimized with distance squared check)
      if (drawConnections) {
        ctx.lineWidth = 0.5;
        const connectionDistSq = connectionDistance * connectionDistance;
        
        // Only check connections for nearby particles (basic optimization)
        for (let i = 0; i < particles.length; i++) {
          const p1 = particles[i];
          
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < connectionDistSq) {
              const dist = Math.sqrt(distSq);
              const opacity = (1 - dist / connectionDistance) * 0.15;
              
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `hsla(${particleHue}, ${particleSaturation}%, ${isDark ? 70 : 50}%, ${opacity})`;
              ctx.stroke();
            }
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    initParticlePool, 
    prefersReducedMotion, 
    isVisible, 
    connectionDistance, 
    mouseInfluence, 
    enablePulse, 
    enableConnections, 
    enableMouseMove, 
    enableTrails,
    colorMode,
    quality,
    isMobile,
  ]);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ 
        opacity: 0.5,
        contain: "strict",
        willChange: "auto",
      }}
      aria-hidden="true"
    />
  );
}

// ============================================
// Preset Variants
// ============================================

// Lightweight particle variant for mobile
export function LightweightParticles({ className = "" }: { className?: string }) {
  return (
    <ParticleField
      particleDensity={40000}
      connectionDistance={80}
      mouseInfluence={100}
      enablePulse={false}
      enableConnections={true}
      enableMouseMove={true}
      enableTrails={false}
      quality="low"
      className={className}
    />
  );
}

// Premium particles with all effects enabled
export function PremiumParticles({ className = "" }: { className?: string }) {
  return (
    <ParticleField
      particleDensity={15000}
      connectionDistance={150}
      mouseInfluence={200}
      enablePulse={true}
      enableConnections={true}
      enableMouseMove={true}
      enableTrails={true}
      quality="high"
      className={className}
    />
  );
}

// Balanced particles for general use
export function BalancedParticles({ className = "" }: { className?: string }) {
  return (
    <ParticleField
      particleDensity={25000}
      connectionDistance={120}
      mouseInfluence={150}
      enablePulse={true}
      enableConnections={true}
      enableMouseMove={true}
      enableTrails={false}
      quality="auto"
      className={className}
    />
  );
}

// Cool color variant
export function CoolParticles({ className = "" }: { className?: string }) {
  return (
    <ParticleField
      particleDensity={20000}
      connectionDistance={120}
      mouseInfluence={150}
      enablePulse={true}
      enableConnections={true}
      enableMouseMove={true}
      colorMode="cool"
      quality="auto"
      className={className}
    />
  );
}

// Warm color variant
export function WarmParticles({ className = "" }: { className?: string }) {
  return (
    <ParticleField
      particleDensity={20000}
      connectionDistance={120}
      mouseInfluence={150}
      enablePulse={true}
      enableConnections={true}
      enableMouseMove={true}
      colorMode="warm"
      quality="auto"
      className={className}
    />
  );
}
