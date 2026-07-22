'use client';

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { easings, gsap } from '@/lib/gsap';
import { cn } from '@/lib/utils';

interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  /** Translation factor (0–1) applied to the pointer offset from center. */
  strength?: number;
  /** Activation radius in px measured from the element's center. */
  radius?: number;
  /** Cursor variant advertised to the ImmersiveCursor. */
  cursor?: 'interactive' | 'media' | 'drag';
}

/**
 * Magnetic wrapper for buttons/links: the element eases toward the pointer
 * while it is within `radius` of the center, then snaps back with an elastic
 * settle on release. Inert on touch devices and under reduced motion (renders
 * a plain wrapper), and only ever animates transforms.
 *
 * Usage: <Magnetic><a className="immersive-button" href="#contact">Talk</a></Magnetic>
 */
export function Magnetic({
  children,
  className,
  strength = 0.32,
  radius = 120,
  cursor = 'interactive',
}: MagneticProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element || prefersReducedMotion) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let active = false;

    const pull = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);

      if (Math.hypot(dx, dy) > radius) {
        release();
        return;
      }

      gsap.to(element, {
        x: dx * strength,
        y: dy * strength,
        duration: 0.4,
        ease: easings.cubic,
        overwrite: 'auto',
      });
    };

    const release = () => {
      if (!active) return;
      active = false;
      window.removeEventListener('pointermove', pull);
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.9,
        ease: 'elastic.out(1, 0.32)',
        overwrite: 'auto',
      });
    };

    const engage = () => {
      if (active) return;
      active = true;
      window.addEventListener('pointermove', pull, { passive: true });
    };

    element.addEventListener('pointerenter', engage);

    return () => {
      element.removeEventListener('pointerenter', engage);
      window.removeEventListener('pointermove', pull);
      gsap.killTweensOf(element);
    };
  }, [prefersReducedMotion, radius, strength]);

  return (
    <span
      ref={wrapperRef}
      data-cursor={cursor}
      className={cn('inline-block will-change-transform', className)}
    >
      {children}
    </span>
  );
}
