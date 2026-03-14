'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

const POINT_COUNT = 12;
const MAX_CONNECTION_DISTANCE = 160;

type NodeRecord = {
  offsetX: number;
  offsetY: number;
  orbitRadius: number;
  angle: number;
  speed: number;
  radius: number;
  x: number;
  y: number;
};

const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

const planetColors = ['#fef08a', '#60a5fa', '#a5b4fc', '#fb7185', '#34d399'];

const createNodes = (width: number, height: number): NodeRecord[] => {
  const baseRadius = Math.min(width, height) * 0.45;
  const orbitLevels = Array.from({ length: POINT_COUNT }, (_, index) => {
    const spacing = (baseRadius * 0.6) / POINT_COUNT;
    return 60 + spacing * index;
  });
  return Array.from({ length: POINT_COUNT }, (_, index) => {
    const offsetX = randomInRange(-width * 0.05, width * 0.05);
    const offsetY = randomInRange(-height * 0.05, height * 0.05);
    const orbitRadius = orbitLevels[index];
    return {
      offsetX,
      offsetY,
      orbitRadius,
      angle: Math.random() * Math.PI * 2,
      speed: randomInRange(0.0016, 0.0032),
      radius: randomInRange(3.4, 6.4),
      x: 0,
      y: 0,
    };
  });
};

const distanceBetween = (a: NodeRecord, b: NodeRecord) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export function HeroEnergyPlot() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const nodesRef = useRef<NodeRecord[]>([]);
  const resizeObserver = useRef<ResizeObserver | null>(null);

  const gradientStops = useMemo(
    () =>
      [
        ['0%', 'rgba(248,250,252,0.32)'],
        ['35%', 'rgba(59,130,246,0.12)'],
        ['65%', 'rgba(14,165,233,0.08)'],
        ['100%', 'rgba(37,99,235,0.02)'],
      ] as const,
    []
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const setCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(dpr, dpr);
      nodesRef.current = createNodes(rect.width, rect.height);
    };

    setCanvasSize();

    const handleResize = () => {
      setCanvasSize();
    };

    resizeObserver.current?.disconnect();
    resizeObserver.current = new ResizeObserver(handleResize);
    resizeObserver.current.observe(canvas);

    let animationId: number;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      context.clearRect(0, 0, rect.width, rect.height);

      const gradient = context.createLinearGradient(0, 0, rect.width, rect.height);
      gradientStops.forEach(([offset, color]) => gradient.addColorStop(parseFloat(offset) / 100, color));
      context.fillStyle = gradient;
      context.fillRect(0, 0, rect.width, rect.height);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const sunRadius = Math.min(rect.width, rect.height) * 0.26;
      const sunGradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, sunRadius);
      sunGradient.addColorStop(0, 'rgba(248,250,252,0.35)');
      sunGradient.addColorStop(0.65, 'rgba(245,158,11,0.4)');
      sunGradient.addColorStop(1, 'rgba(245,158,11,0)');
      context.fillStyle = sunGradient;
      context.fillRect(0, 0, rect.width, rect.height);

      context.save();
      context.setLineDash([6, 14]);
      context.strokeStyle = 'rgba(148,163,184,0.25)';
      context.lineWidth = 1;
      nodesRef.current.forEach((node) => {
        context.beginPath();
        context.arc(centerX + node.offsetX, centerY + node.offsetY, node.orbitRadius, 0, Math.PI * 2);
        context.stroke();
      });
      context.restore();

      const nodes = nodesRef.current;

      nodes.forEach((node) => {
        node.angle += node.speed;
        const orbitX = centerX + node.offsetX;
        const orbitY = centerY + node.offsetY;
        node.x = orbitX + Math.cos(node.angle) * node.orbitRadius;
        node.y = orbitY + Math.sin(node.angle) * node.orbitRadius;
      });

      context.strokeStyle = 'rgba(148,163,184,0.35)';
      context.lineWidth = 1.1;
      context.lineCap = 'round';

      nodes.forEach((node, idx) => {
        for (let j = idx + 1; j < nodes.length; j += 1) {
          const other = nodes[j];
          const distance = distanceBetween(node, other);
          if (distance < MAX_CONNECTION_DISTANCE) {
            const alpha = 1 - distance / MAX_CONNECTION_DISTANCE;
            context.strokeStyle = `rgba(94,234,212,${alpha * 0.5})`;
            context.beginPath();
            context.moveTo(node.x, node.y);
            context.lineTo(other.x, other.y);
            context.stroke();
          }
        }
      });

      nodes.forEach((node, idx) => {
        context.beginPath();
        context.fillStyle = planetColors[idx % planetColors.length];
        context.shadowBlur = 18;
        context.shadowColor = 'rgba(14,165,233,0.65)';
        context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        context.fill();
        context.shadowBlur = 0;
      });

      animationId = window.requestAnimationFrame(draw);
    };

    animationId = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(animationId);
      resizeObserver.current?.disconnect();
    };
  }, [gradientStops, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div className="h-full w-full rounded-[1.6rem] bg-[radial-gradient(circle_at_top,rgba(248,250,252,0.25),transparent_48%),rgba(15,23,42,0.65)]" />
    );
  }

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full rounded-[1.6rem]" aria-hidden="true" />;
}
