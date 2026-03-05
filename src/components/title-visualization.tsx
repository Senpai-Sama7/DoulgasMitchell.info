"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export function TitleVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", handleMouseMove);

    // Particle system
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      hue: number;
      life: number;
      maxLife: number;
      type: "spark" | "orb" | "dust";
    }

    const particles: Particle[] = [];

    interface Node {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      size: number;
      connections: number[];
      pulsePhase: number;
    }

    const nodes: Node[] = [];

    // Floating geometric shapes
    interface FloatingShape {
      x: number;
      y: number;
      size: number;
      rotation: number;
      rotationSpeed: number;
      floatOffset: number;
      type: "triangle" | "diamond" | "hexagon" | "ring";
      opacity: number;
    }

    const floatingShapes: FloatingShape[] = [];

    const initNodes = () => {
      const rect = canvas.getBoundingClientRect();
      nodes.length = 0;
      const nodeCount = 12;
      
      for (let i = 0; i < nodeCount; i++) {
        const angle = (i / nodeCount) * Math.PI * 2;
        const radius = Math.min(rect.width, rect.height) * 0.35;
        nodes.push({
          x: rect.width * 0.5 + Math.cos(angle) * radius,
          y: rect.height * 0.5 + Math.sin(angle) * radius * 0.6,
          targetX: rect.width * 0.5 + Math.cos(angle) * radius,
          targetY: rect.height * 0.5 + Math.sin(angle) * radius * 0.6,
          size: 3 + Math.random() * 4,
          connections: [],
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }

      // Create connections
      nodes.forEach((node, i) => {
        const connectCount = 2 + Math.floor(Math.random() * 2);
        for (let j = 0; j < connectCount; j++) {
          const target = (i + 1 + Math.floor(Math.random() * 3)) % nodes.length;
          if (!node.connections.includes(target)) {
            node.connections.push(target);
          }
        }
      });
    };

    const initFloatingShapes = () => {
      const rect = canvas.getBoundingClientRect();
      floatingShapes.length = 0;
      const shapeCount = 15;
      
      for (let i = 0; i < shapeCount; i++) {
        floatingShapes.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          size: 10 + Math.random() * 20,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
          floatOffset: Math.random() * Math.PI * 2,
          type: ["triangle", "diamond", "hexagon", "ring"][Math.floor(Math.random() * 4)] as FloatingShape["type"],
          opacity: 0.05 + Math.random() * 0.1,
        });
      }
    };

    initNodes();
    initFloatingShapes();

    const drawShape = (ctx: CanvasRenderingContext2D, shape: FloatingShape, time: number, isDark: boolean) => {
      const floatY = Math.sin(time + shape.floatOffset) * 5;
      const floatX = Math.cos(time * 0.7 + shape.floatOffset) * 3;
      
      ctx.save();
      ctx.translate(shape.x + floatX, shape.y + floatY);
      ctx.rotate(shape.rotation);
      ctx.strokeStyle = `hsla(35, 30%, ${isDark ? '60%' : '50%'}, ${shape.opacity})`;
      ctx.lineWidth = 1;

      switch (shape.type) {
        case "triangle":
          ctx.beginPath();
          for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
            const x = Math.cos(angle) * shape.size;
            const y = Math.sin(angle) * shape.size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.stroke();
          break;

        case "diamond":
          ctx.beginPath();
          ctx.moveTo(0, -shape.size);
          ctx.lineTo(shape.size * 0.7, 0);
          ctx.lineTo(0, shape.size);
          ctx.lineTo(-shape.size * 0.7, 0);
          ctx.closePath();
          ctx.stroke();
          break;

        case "hexagon":
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x = Math.cos(angle) * shape.size;
            const y = Math.sin(angle) * shape.size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.stroke();
          break;

        case "ring":
          ctx.beginPath();
          ctx.arc(0, 0, shape.size, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(0, 0, shape.size * 0.6, 0, Math.PI * 2);
          ctx.stroke();
          break;
      }

      ctx.restore();
    };

    const animate = () => {
      if (!ctx || !canvas) return;

      const rect = canvas.getBoundingClientRect();
      const isDark = document.documentElement.classList.contains("dark");
      const time = timeRef.current;

      ctx.clearRect(0, 0, rect.width, rect.height);

      timeRef.current += 0.008;

      // ============ LAYER 1: Aurora Background ============
      const auroraGradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      auroraGradient.addColorStop(0, `hsla(${30 + Math.sin(time * 0.5) * 10}, 40%, ${isDark ? '20%' : '90%'}, 0.3)`);
      auroraGradient.addColorStop(0.5, `hsla(${45 + Math.cos(time * 0.3) * 15}, 35%, ${isDark ? '25%' : '85%'}, 0.2)`);
      auroraGradient.addColorStop(1, `hsla(${35 + Math.sin(time * 0.7) * 8}, 30%, ${isDark ? '15%' : '95%'}, 0.3)`);
      ctx.fillStyle = auroraGradient;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // ============ LAYER 2: Floating Shapes ============
      floatingShapes.forEach(shape => {
        shape.rotation += shape.rotationSpeed;
        drawShape(ctx, shape, time, isDark);
      });

      // ============ LAYER 3: Flowing Wave Lines ============
      for (let layer = 0; layer < 5; layer++) {
        ctx.beginPath();
        const baseY = rect.height * (0.2 + layer * 0.15);
        const amplitude = 15 + layer * 8;
        const frequency = 0.008 - layer * 0.001;
        const phase = time * (1.5 - layer * 0.2) + layer * Math.PI * 0.3;

        ctx.moveTo(-10, baseY);

        for (let x = -10; x <= rect.width + 10; x += 3) {
          const mouseInfluence = Math.max(0, 1 - Math.abs(x - mouseRef.current.x) / 100);
          const y = baseY + 
            Math.sin(x * frequency + phase) * amplitude +
            Math.sin(x * frequency * 2 + phase * 1.5) * (amplitude * 0.3) +
            mouseInfluence * -20;
          ctx.lineTo(x, y);
        }

        const gradient = ctx.createLinearGradient(0, 0, rect.width, 0);
        const baseOpacity = 0.05 + layer * 0.03;
        const hue = 35 + layer * 5;
        gradient.addColorStop(0, `hsla(${hue}, 30%, ${isDark ? '50%' : '40%'}, 0)`);
        gradient.addColorStop(0.3, `hsla(${hue}, 35%, ${isDark ? '55%' : '45%'}, ${baseOpacity})`);
        gradient.addColorStop(0.7, `hsla(${hue}, 35%, ${isDark ? '55%' : '45%'}, ${baseOpacity})`);
        gradient.addColorStop(1, `hsla(${hue}, 30%, ${isDark ? '50%' : '40%'}, 0)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5 - layer * 0.2;
        ctx.stroke();
      }

      // ============ LAYER 4: Geometric Grid ============
      const gridSpacing = 40;
      const gridOpacity = 0.08;
      
      ctx.strokeStyle = `hsla(35, 20%, ${isDark ? '60%' : '50%'}, ${gridOpacity})`;
      ctx.lineWidth = 0.5;

      // Horizontal lines
      for (let y = gridSpacing; y < rect.height; y += gridSpacing) {
        const offset = Math.sin(time + y * 0.01) * 5;
        ctx.beginPath();
        ctx.moveTo(0, y + offset);
        ctx.lineTo(rect.width, y + offset);
        ctx.stroke();
      }

      // Vertical lines with wave
      for (let x = gridSpacing; x < rect.width; x += gridSpacing) {
        ctx.beginPath();
        for (let y = 0; y <= rect.height; y += 5) {
          const wave = Math.sin(time * 2 + y * 0.02 + x * 0.01) * 3;
          if (y === 0) {
            ctx.moveTo(x + wave, y);
          } else {
            ctx.lineTo(x + wave, y);
          }
        }
        ctx.stroke();
      }

      // ============ LAYER 5: Orbital System ============
      const centerX = rect.width * 0.5;
      const centerY = rect.height * 0.5;

      // Update and draw nodes
      nodes.forEach((node, i) => {
        // Animate nodes
        const angle = (i / nodes.length) * Math.PI * 2 + time * 0.3;
        const orbitRadius = Math.min(rect.width, rect.height) * (0.25 + Math.sin(time + i) * 0.05);
        
        node.targetX = centerX + Math.cos(angle) * orbitRadius;
        node.targetY = centerY + Math.sin(angle) * orbitRadius * 0.6;
        
        node.x += (node.targetX - node.x) * 0.05;
        node.y += (node.targetY - node.y) * 0.05;

        // Draw connections
        node.connections.forEach((targetIdx) => {
          const target = nodes[targetIdx];
          if (!target) return;

          const gradient = ctx.createLinearGradient(node.x, node.y, target.x, target.y);
          gradient.addColorStop(0, `hsla(35, 40%, ${isDark ? '60%' : '50%'}, 0.15)`);
          gradient.addColorStop(0.5, `hsla(35, 40%, ${isDark ? '60%' : '50%'}, 0.08)`);
          gradient.addColorStop(1, `hsla(35, 40%, ${isDark ? '60%' : '50%'}, 0.15)`);

          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          
          // Curved connection
          const midX = (node.x + target.x) / 2;
          const midY = (node.y + target.y) / 2 - 20;
          ctx.quadraticCurveTo(midX, midY, target.x, target.y);
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      });

      // Draw nodes
      nodes.forEach((node, i) => {
        const pulse = Math.sin(time * 2 + node.pulsePhase) * 0.3 + 1;
        
        // Glow
        const glowGradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, node.size * 4 * pulse
        );
        glowGradient.addColorStop(0, `hsla(35, 50%, ${isDark ? '70%' : '60%'}, 0.3)`);
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * 4 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(35, 40%, ${isDark ? '80%' : '40%'}, 0.9)`;
        ctx.fill();

        // Inner highlight
        ctx.beginPath();
        ctx.arc(node.x - node.size * 0.3, node.y - node.size * 0.3, node.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(35, 30%, ${isDark ? '90%' : '70%'}, 0.6)`;
        ctx.fill();
      });

      // ============ LAYER 6: Central Mandala ============
      const mandalaRadius = Math.min(rect.width, rect.height) * 0.15;
      
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(time * 0.2);

      // Outer ring
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x1 = Math.cos(angle) * mandalaRadius;
        const y1 = Math.sin(angle) * mandalaRadius;
        const x2 = Math.cos(angle) * (mandalaRadius * 1.3);
        const y2 = Math.sin(angle) * (mandalaRadius * 1.3);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `hsla(35, 30%, ${isDark ? '60%' : '50%'}, 0.2)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Inner pattern
      for (let ring = 1; ring <= 3; ring++) {
        const ringRadius = mandalaRadius * (ring / 4);
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(35, 30%, ${isDark ? '60%' : '50%'}, ${0.1 + ring * 0.05})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Rotating diamonds
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + time;
        const dist = mandalaRadius * 0.7;
        
        ctx.save();
        ctx.translate(Math.cos(angle) * dist, Math.sin(angle) * dist);
        ctx.rotate(angle + Math.PI / 4);
        
        ctx.beginPath();
        ctx.rect(-4, -4, 8, 8);
        ctx.strokeStyle = `hsla(35, 40%, ${isDark ? '70%' : '50%'}, 0.3)`;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
      }

      ctx.restore();

      // ============ LAYER 7: Particle Field ============
      // Spawn new particles
      if (Math.random() < 0.3) {
        const types: Particle["type"][] = ["spark", "orb", "dust"];
        particles.push({
          x: Math.random() * rect.width,
          y: rect.height + 10,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -0.5 - Math.random() * 1,
          size: 1 + Math.random() * 2,
          opacity: 0.3 + Math.random() * 0.4,
          hue: 30 + Math.random() * 20,
          life: 0,
          maxLife: 100 + Math.random() * 100,
          type: types[Math.floor(Math.random() * types.length)],
        });
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        if (p.life > p.maxLife || p.y < -10) {
          particles.splice(i, 1);
          continue;
        }

        const lifeRatio = p.life / p.maxLife;
        const fadeIn = Math.min(1, p.life / 10);
        const fadeOut = lifeRatio > 0.7 ? 1 - (lifeRatio - 0.7) / 0.3 : 1;
        const opacity = p.opacity * fadeIn * fadeOut;

        // Draw based on type
        if (p.type === "spark") {
          // Trail
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 5, p.y - p.vy * 5);
          ctx.strokeStyle = `hsla(${p.hue}, 30%, ${isDark ? '70%' : '50%'}, ${opacity * 0.3})`;
          ctx.lineWidth = p.size * 0.5;
          ctx.stroke();

          // Particle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 40%, ${isDark ? '80%' : '60%'}, ${opacity})`;
          ctx.fill();
        } else if (p.type === "orb") {
          // Glowing orb
          const orbGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
          orbGradient.addColorStop(0, `hsla(${p.hue}, 50%, ${isDark ? '80%' : '70%'}, ${opacity})`);
          orbGradient.addColorStop(0.5, `hsla(${p.hue}, 40%, ${isDark ? '60%' : '50%'}, ${opacity * 0.3})`);
          orbGradient.addColorStop(1, 'transparent');
          ctx.fillStyle = orbGradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Dust particle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, 20%, ${isDark ? '70%' : '60%'}, ${opacity * 0.5})`;
          ctx.fill();
        }
      }

      // ============ LAYER 8: Corner Accents ============
      const drawCornerAccent = (x: number, y: number, rotation: number, size: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);

        // L-shape
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(size, 0);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, size);
        
        ctx.strokeStyle = `hsla(35, 40%, ${isDark ? '60%' : '50%'}, 0.3)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Decorative dot
        ctx.beginPath();
        ctx.arc(size * 0.5, size * 0.5, 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(35, 40%, ${isDark ? '60%' : '50%'}, 0.2)`;
        ctx.fill();

        ctx.restore();
      };

      drawCornerAccent(15, 15, 0, 25);
      drawCornerAccent(rect.width - 15, 15, Math.PI / 2, 25);
      drawCornerAccent(rect.width - 15, rect.height - 15, Math.PI, 25);
      drawCornerAccent(15, rect.height - 15, -Math.PI / 2, 25);

      // ============ LAYER 9: Data Visualization Bars ============
      const barCount = 8;
      const barWidth = 3;
      const barMaxHeight = 30;
      const barSpacing = 6;
      const barStartX = rect.width - 60;
      const barStartY = rect.height - 20;

      for (let i = 0; i < barCount; i++) {
        const height = (Math.sin(time * 2 + i * 0.5) * 0.5 + 0.5) * barMaxHeight;
        const x = barStartX + i * barSpacing;
        
        ctx.fillStyle = `hsla(35, 40%, ${isDark ? '60%' : '50%'}, 0.2)`;
        ctx.fillRect(x, barStartY - height, barWidth, height);
        
        // Top cap
        ctx.fillStyle = `hsla(35, 50%, ${isDark ? '70%' : '60%'}, 0.4)`;
        ctx.fillRect(x, barStartY - height - 2, barWidth, 2);
      }

      // ============ LAYER 10: Radial Pulse Effect ============
      const pulseRadius = Math.min(rect.width, rect.height) * 0.4 * (0.8 + Math.sin(time * 0.5) * 0.2);
      const pulseGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseRadius);
      pulseGradient.addColorStop(0, 'transparent');
      pulseGradient.addColorStop(0.7, 'transparent');
      pulseGradient.addColorStop(0.85, `hsla(35, 30%, ${isDark ? '60%' : '50%'}, 0.02)`);
      pulseGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = pulseGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
      ctx.fill();

      // ============ LAYER 11: Mouse Follower Glow ============
      if (mouseRef.current.x > 0 && mouseRef.current.y > 0) {
        const mouseGlow = ctx.createRadialGradient(
          mouseRef.current.x, mouseRef.current.y, 0,
          mouseRef.current.x, mouseRef.current.y, 100
        );
        mouseGlow.addColorStop(0, `hsla(35, 50%, ${isDark ? '70%' : '60%'}, 0.1)`);
        mouseGlow.addColorStop(0.5, `hsla(35, 40%, ${isDark ? '60%' : '50%'}, 0.05)`);
        mouseGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = mouseGlow;
        ctx.fillRect(0, 0, rect.width, rect.height);
      }

      // ============ LAYER 12: Vignette Effect ============
      const vignette = ctx.createRadialGradient(
        centerX, centerY, Math.min(rect.width, rect.height) * 0.3,
        centerX, centerY, Math.max(rect.width, rect.height) * 0.8
      );
      vignette.addColorStop(0, 'transparent');
      vignette.addColorStop(1, isDark ? 'rgba(20, 18, 15, 0.3)' : 'rgba(255, 250, 240, 0.2)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, rect.width, rect.height);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, delay: 0.3 }}
      className="relative w-full h-full"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        style={{ width: "100%", height: "100%" }}
      />
    </motion.div>
  );
}
