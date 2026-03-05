"use client";

import { useRef, ReactNode, useEffect, useState, createContext, useContext, useMemo, useCallback } from "react";
import { motion, useInView, useSpring, useTransform, useMotionValue, AnimatePresence, MotionValue, useScroll, useReducedMotion as useFramerReducedMotion } from "framer-motion";

// ============================================
// Reduced Motion Support
// ============================================
const ReducedMotionContext = createContext<boolean>(false);

export function useReducedMotion() {
  return useContext(ReducedMotionContext);
}

function getPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ReducedMotionProvider({ children }: { children: ReactNode }) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(getPrefersReducedMotion);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <ReducedMotionContext.Provider value={prefersReducedMotion}>
      {children}
    </ReducedMotionContext.Provider>
  );
}

// ============================================
// Animation Presets
// ============================================
export const animationPresets = {
  spring: {
    gentle: { type: "spring", stiffness: 120, damping: 15 },
    bouncy: { type: "spring", stiffness: 400, damping: 10 },
    snappy: { type: "spring", stiffness: 500, damping: 30 },
    smooth: { type: "spring", stiffness: 200, damping: 25 },
  },
  ease: {
    smooth: [0.25, 0.4, 0.25, 1],
    anticipate: [0.4, 0, 0.2, 1],
    easeOut: [0, 0, 0.2, 1],
    easeIn: [0.4, 0, 1, 1],
  },
  duration: {
    fast: 0.2,
    normal: 0.4,
    slow: 0.6,
    slower: 0.8,
  }
} as const;

// ============================================
// Page Transition Components
// ============================================
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  variant?: "fade" | "slide" | "scale" | "blur" | "wipe";
}

export function PageTransition({ 
  children, 
  className = "",
  variant = "slide" 
}: PageTransitionProps) {
  const prefersReducedMotion = useReducedMotion();

  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -20 },
    },
    scale: {
      initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 },
      animate: { opacity: 1, scale: 1 },
      exit: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.02 },
    },
    blur: {
      initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, filter: "blur(10px)" },
      animate: { opacity: 1, filter: "blur(0px)" },
      exit: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, filter: "blur(10px)" },
    },
    wipe: {
      initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, clipPath: "inset(0 100% 0 0)" },
      animate: { opacity: 1, clipPath: "inset(0 0% 0 0)" },
      exit: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, clipPath: "inset(0 0% 0 100%)" },
    },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={variants[variant].initial}
        animate={variants[variant].animate}
        exit={variants[variant].exit}
        transition={{
          duration: prefersReducedMotion ? 0.1 : 0.4,
          ease: animationPresets.ease.smooth,
        }}
        className={className}
        style={{ willChange: "opacity, transform" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// Scroll Reveal Component
// ============================================
interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "scale" | "fade" | "blur";
  duration?: number;
  threshold?: number;
  once?: boolean;
  rootMargin?: string;
}

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 0.6,
  threshold = 0.1,
  once = true,
  rootMargin = "-50px",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: rootMargin as never });
  const prefersReducedMotion = useReducedMotion();

  const getInitialPosition = useMemo(() => {
    if (prefersReducedMotion) return { opacity: 0 };
    
    switch (direction) {
      case "up":
        return { opacity: 0, y: 40 };
      case "down":
        return { opacity: 0, y: -40 };
      case "left":
        return { opacity: 0, x: 40 };
      case "right":
        return { opacity: 0, x: -40 };
      case "scale":
        return { opacity: 0, scale: 0.95 };
      case "blur":
        return { opacity: 0, filter: "blur(10px)" };
      case "fade":
      default:
        return { opacity: 0 };
    }
  }, [prefersReducedMotion, direction]);

  const getAnimatePosition = useMemo(() => {
    const base = { opacity: 1, y: 0, x: 0, scale: 1 };
    if (direction === "blur") {
      return { ...base, filter: "blur(0px)" };
    }
    return base;
  }, [direction]);

  return (
    <motion.div
      ref={ref}
      initial={getInitialPosition}
      animate={isInView ? getAnimatePosition : getInitialPosition}
      transition={{
        duration: prefersReducedMotion ? 0.1 : duration,
        delay: prefersReducedMotion ? 0 : delay,
        ease: animationPresets.ease.smooth,
      }}
      className={className}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Parallax Component
// ============================================
interface ParallaxProps {
  children: ReactNode;
  speed?: number;
  className?: string;
  direction?: "vertical" | "horizontal";
}

export function Parallax({ 
  children, 
  speed = 0.5, 
  className = "",
  direction = "vertical"
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`]);
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 100}%`]);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div 
      ref={ref} 
      style={{ 
        y: direction === "vertical" ? y : 0,
        x: direction === "horizontal" ? x : 0,
        willChange: "transform" 
      }} 
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Stagger Container & Items
// ============================================
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  direction?: "up" | "down" | "left" | "right" | "scale" | "fade";
  delayChildren?: number;
}

export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.1,
  direction = "up",
  delayChildren = 0,
}: StaggerContainerProps) {
  const prefersReducedMotion = useReducedMotion();

  const getInitialVariant = useMemo(() => {
    switch (direction) {
      case "up":
        return { opacity: 0, y: 20 };
      case "down":
        return { opacity: 0, y: -20 };
      case "left":
        return { opacity: 0, x: 20 };
      case "right":
        return { opacity: 0, x: -20 };
      case "scale":
        return { opacity: 0, scale: 0.95 };
      case "fade":
      default:
        return { opacity: 0 };
    }
  }, [direction]);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
            delayChildren: prefersReducedMotion ? 0 : delayChildren,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ 
  children, 
  className = "",
  direction = "up",
}: { 
  children: ReactNode; 
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "scale" | "fade";
}) {
  const prefersReducedMotion = useReducedMotion();

  const initialVariant = useMemo(() => {
    switch (direction) {
      case "up":
        return { opacity: 0, y: 20 };
      case "down":
        return { opacity: 0, y: -20 };
      case "left":
        return { opacity: 0, x: 20 };
      case "right":
        return { opacity: 0, x: -20 };
      case "scale":
        return { opacity: 0, scale: 0.95 };
      case "fade":
      default:
        return { opacity: 0 };
    }
  }, [direction]);

  return (
    <motion.div
      variants={{
        hidden: initialVariant,
        visible: {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          transition: { 
            duration: prefersReducedMotion ? 0.1 : 0.5, 
            ease: animationPresets.ease.smooth 
          },
        },
      }}
      className={className}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// List Stagger Animation
// ============================================
interface ListStaggerProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  itemClassName?: string;
  staggerDelay?: number;
  direction?: "up" | "down" | "left" | "right" | "scale" | "fade";
  keyExtractor?: (item: T, index: number) => string | number;
}

export function ListStagger<T>({
  items,
  renderItem,
  className = "",
  itemClassName = "",
  staggerDelay = 0.08,
  direction = "up",
  keyExtractor,
}: ListStaggerProps<T>) {
  const prefersReducedMotion = useReducedMotion();

  const initialVariant = useMemo(() => {
    switch (direction) {
      case "up": return { opacity: 0, y: 30 };
      case "down": return { opacity: 0, y: -30 };
      case "left": return { opacity: 0, x: 30 };
      case "right": return { opacity: 0, x: -30 };
      case "scale": return { opacity: 0, scale: 0.9 };
      case "fade":
      default: return { opacity: 0 };
    }
  }, [direction]);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-30px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
          },
        },
      }}
      className={className}
    >
      {items.map((item, index) => (
        <motion.div
          key={keyExtractor ? keyExtractor(item, index) : index}
          variants={{
            hidden: initialVariant,
            visible: {
              opacity: 1,
              y: 0,
              x: 0,
              scale: 1,
              transition: {
                duration: prefersReducedMotion ? 0.1 : 0.4,
                ease: animationPresets.ease.smooth,
              },
            },
          }}
          className={itemClassName}
          style={{ willChange: "opacity, transform" }}
        >
          {renderItem(item, index)}
        </motion.div>
      ))}
    </motion.div>
  );
}

// ============================================
// Grid Stagger Animation
// ============================================
interface GridStaggerProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  itemClassName?: string;
  columns?: number;
  staggerDelay?: number;
}

export function GridStagger<T>({
  items,
  renderItem,
  className = "",
  itemClassName = "",
  columns = 3,
  staggerDelay = 0.05,
}: GridStaggerProps<T>) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className={className}>
      {items.map((item, index) => {
        // Calculate stagger based on grid position
        const row = Math.floor(index / columns);
        const col = index % columns;
        const delay = prefersReducedMotion ? 0 : (row * staggerDelay + col * staggerDelay * 0.5);

        return (
          <motion.div
            key={index}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.95 }}
            transition={{
              duration: prefersReducedMotion ? 0.1 : 0.4,
              delay,
              ease: animationPresets.ease.smooth,
            }}
            className={itemClassName}
            style={{ willChange: "opacity, transform" }}
          >
            {renderItem(item, index)}
          </motion.div>
        );
      })}
    </div>
  );
}

// ============================================
// Magnetic Button Effect
// ============================================
interface MagneticProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  disabled?: boolean;
}

export function Magnetic({ 
  children, 
  className = "", 
  strength = 0.3,
  disabled = false 
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion();

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (prefersReducedMotion || disabled || !ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rawX = (e.clientX - centerX) * strength;
    const rawY = (e.clientY - centerY) * strength;
    const maxOffsetX = rect.width * 0.14;
    const maxOffsetY = rect.height * 0.14;

    x.set(Math.max(-maxOffsetX, Math.min(maxOffsetX, rawX)));
    y.set(Math.max(-maxOffsetY, Math.min(maxOffsetY, rawY)));
  }, [prefersReducedMotion, disabled, x, y, strength]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  if (prefersReducedMotion || disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y, willChange: "transform" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Text Reveal Animation
// ============================================
interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  splitBy?: "word" | "char";
}

export function TextReveal({ 
  text, 
  className = "", 
  delay = 0,
  splitBy = "word" 
}: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const prefersReducedMotion = useReducedMotion();

  const items = useMemo(() => {
    if (splitBy === "char") {
      return text.split("");
    }
    return text.split(" ");
  }, [text, splitBy]);

  return (
    <div ref={ref} className={className}>
      {items.map((item, i) => (
        <motion.span
          key={i}
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          transition={{ 
            duration: prefersReducedMotion ? 0.1 : 0.4, 
            delay: prefersReducedMotion ? 0 : delay + i * (splitBy === "char" ? 0.03 : 0.05),
            ease: animationPresets.ease.smooth
          }}
          className="inline-block"
          style={{ 
            marginRight: splitBy === "word" ? "0.375rem" : undefined,
            willChange: "opacity, transform" 
          }}
        >
          {item}
        </motion.span>
      ))}
    </div>
  );
}

// ============================================
// Typing Animation
// ============================================
interface TypingAnimationProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
  cursorChar?: string;
}

export function TypingAnimation({
  text,
  className = "",
  speed = 50,
  delay = 0,
  onComplete,
  cursorChar = "|",
}: TypingAnimationProps) {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayText(text);
      setIsComplete(true);
      setShowCursor(false);
      onComplete?.();
      return;
    }

    const startTimeout = setTimeout(() => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
          setIsComplete(true);
          onComplete?.();
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(startTimeout);
  }, [text, speed, delay, onComplete, prefersReducedMotion]);

  // Cursor blink
  useEffect(() => {
    if (isComplete) {
      const blinkTimeout = setTimeout(() => setShowCursor(false), 1000);
      return () => clearTimeout(blinkTimeout);
    }
    
    const blinkInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    return () => clearInterval(blinkInterval);
  }, [isComplete]);

  return (
    <span className={className}>
      {displayText}
      <motion.span 
        className="inline-block w-auto ml-0.5 align-middle"
        animate={{ opacity: showCursor ? 1 : 0 }}
        transition={{ duration: 0.1 }}
        style={{ 
          color: "var(--primary)",
          fontWeight: 300,
        }}
      >
        {cursorChar}
      </motion.span>
    </span>
  );
}

// ============================================
// Counter Animation
// ============================================
interface CounterAnimationProps {
  from?: number;
  to: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}

export function CounterAnimation({
  from = 0,
  to,
  duration = 2,
  className = "",
  suffix = "",
  prefix = "",
  decimals = 0,
}: CounterAnimationProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(from);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isInView) return;
    
    // For reduced motion, just set the final count directly
    if (prefersReducedMotion) {
      const frameId = requestAnimationFrame(() => setCount(to));
      return () => cancelAnimationFrame(frameId);
    }

    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(from + (to - from) * easeOut);

      if (now < endTime) {
        requestAnimationFrame(animate);
      } else {
        setCount(to);
      }
    };

    const frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isInView, from, to, duration, prefersReducedMotion]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString(undefined, { 
        minimumFractionDigits: decimals, 
        maximumFractionDigits: decimals 
      })}{suffix}
    </span>
  );
}

// ============================================
// Fade In Wrapper
// ============================================
interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function FadeIn({ children, className = "", delay = 0, duration = 0.5 }: FadeInProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: prefersReducedMotion ? 0.1 : duration,
        delay: prefersReducedMotion ? 0 : delay,
        ease: animationPresets.ease.smooth,
      }}
      className={className}
      style={{ willChange: "opacity" }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Scale In Wrapper
// ============================================
interface ScaleInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  scale?: number;
}

export function ScaleIn({ 
  children, 
  className = "", 
  delay = 0, 
  duration = 0.4,
  scale = 0.95 
}: ScaleInProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: prefersReducedMotion ? 0.1 : duration,
        delay: prefersReducedMotion ? 0 : delay,
        ease: animationPresets.ease.smooth,
      }}
      className={className}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Slide In Wrapper
// ============================================
interface SlideInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
}

export function SlideIn({
  children,
  className = "",
  delay = 0,
  duration = 0.5,
  direction = "up",
  distance = 20,
}: SlideInProps) {
  const prefersReducedMotion = useReducedMotion();

  const getInitial = useMemo(() => {
    if (prefersReducedMotion) return { opacity: 0 };
    
    switch (direction) {
      case "up": return { opacity: 0, y: distance };
      case "down": return { opacity: 0, y: -distance };
      case "left": return { opacity: 0, x: distance };
      case "right": return { opacity: 0, x: -distance };
      default: return { opacity: 0, y: distance };
    }
  }, [prefersReducedMotion, direction, distance]);

  return (
    <motion.div
      initial={getInitial}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{
        duration: prefersReducedMotion ? 0.1 : duration,
        delay: prefersReducedMotion ? 0 : delay,
        ease: animationPresets.ease.smooth,
      }}
      className={className}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Hover Scale Component
// ============================================
interface HoverScaleProps {
  children: ReactNode;
  className?: string;
  scale?: number;
  hoverScale?: number;
  tapScale?: number;
}

export function HoverScale({ 
  children, 
  className = "", 
  scale = 1,
  hoverScale = 1.05,
  tapScale = 0.98 
}: HoverScaleProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ scale }}
      whileHover={{ scale: prefersReducedMotion ? scale : hoverScale }}
      whileTap={{ scale: prefersReducedMotion ? scale : tapScale }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={className}
      style={{ willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Pulse Animation
// ============================================
interface PulseProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  scale?: number;
}

export function Pulse({ children, className = "", duration = 2, scale = 1.05 }: PulseProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      animate={prefersReducedMotion ? {} : {
        scale: [1, scale, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Float Animation
// ============================================
interface FloatProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  distance?: number;
}

export function Float({ children, className = "", duration = 3, distance = 10 }: FloatProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      animate={prefersReducedMotion ? {} : {
        y: [0, -distance, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
      style={{ willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Skeleton/Loading Components
// ============================================
interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "shimmer" | "none";
}

export function Skeleton({ 
  className = "", 
  variant = "rectangular",
  width,
  height,
  animation = "shimmer"
}: SkeletonProps) {
  const baseClasses = "bg-muted";
  const variantClasses = {
    text: "h-4 rounded",
    circular: "rounded-full aspect-square",
    rectangular: "rounded-lg",
    rounded: "rounded-xl",
  };
  
  const animationClasses = {
    pulse: "animate-pulse",
    shimmer: "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-background/30 before:to-transparent",
    none: "",
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={{ 
        width: width ? (typeof width === "number" ? `${width}px` : width) : "100%",
        height: height ? (typeof height === "number" ? `${height}px` : height) : undefined,
        contain: "layout style",
      }}
    />
  );
}

interface SkeletonCardProps {
  className?: string;
  lines?: number;
  showImage?: boolean;
  imageHeight?: number;
  showAvatar?: boolean;
}

export function SkeletonCard({ 
  className = "", 
  lines = 3, 
  showImage = true,
  imageHeight = 200,
  showAvatar = false,
}: SkeletonCardProps) {
  return (
    <div className={`glass-card p-4 space-y-4 ${className}`}>
      {showImage && (
        <Skeleton height={imageHeight} className="w-full" animation="shimmer" />
      )}
      {showAvatar && (
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="w-1/3" />
            <Skeleton variant="text" className="w-1/2" />
          </div>
        </div>
      )}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i} 
            variant="text" 
            height={16} 
            className={i === lines - 1 ? "w-2/3" : "w-full"} 
            animation="shimmer"
          />
        ))}
      </div>
    </div>
  );
}

interface SkeletonListProps {
  count?: number;
  className?: string;
  itemClassName?: string;
  showAvatar?: boolean;
}

export function SkeletonList({ 
  count = 3, 
  className = "", 
  itemClassName = "",
  showAvatar = true 
}: SkeletonListProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`flex items-center gap-4 ${itemClassName}`}>
          {showAvatar && <Skeleton variant="circular" width={48} height={48} animation="shimmer" />}
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="w-1/3" animation="shimmer" />
            <Skeleton variant="text" className="w-2/3" animation="shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

interface SkeletonGridProps {
  count?: number;
  className?: string;
  itemClassName?: string;
  columns?: number;
  imageHeight?: number;
}

export function SkeletonGrid({
  count = 6,
  className = "",
  itemClassName = "",
  columns = 3,
  imageHeight = 150,
}: SkeletonGridProps) {
  return (
    <div 
      className={`grid ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: "1rem" }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`space-y-3 ${itemClassName}`}>
          <Skeleton height={imageHeight} className="w-full" animation="shimmer" />
          <Skeleton variant="text" className="w-3/4" animation="shimmer" />
          <Skeleton variant="text" className="w-1/2" animation="shimmer" />
        </div>
      ))}
    </div>
  );
}

// ============================================
// Loading Spinner
// ============================================
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  variant?: "default" | "dots" | "bars" | "ring";
}

export function LoadingSpinner({ 
  size = "md", 
  className = "",
  variant = "default" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  if (variant === "dots") {
    return (
      <div className={`flex gap-1 ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`${sizeClasses[size]} rounded-full bg-primary`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "ring") {
    return (
      <motion.div
        className={`${sizeClasses[size]} border-2 border-primary/30 rounded-full ${className}`}
        style={{ contain: "layout style" }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <div 
          className="w-1/2 h-full border-t-2 border-l-2 border-primary rounded-tl-full"
          style={{ transformOrigin: "100% 50%" }}
        />
      </motion.div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} border-2 border-primary/30 border-t-primary rounded-full animate-spin ${className}`}
      style={{ contain: "layout style" }}
    />
  );
}

// ============================================
// Loading Overlay
// ============================================
interface LoadingOverlayProps {
  isLoading: boolean;
  children: ReactNode;
  className?: string;
  spinnerSize?: "sm" | "md" | "lg" | "xl";
  spinnerVariant?: "default" | "dots" | "bars" | "ring";
  blur?: boolean;
}

export function LoadingOverlay({ 
  isLoading, 
  children, 
  className = "",
  spinnerSize = "md",
  spinnerVariant = "default",
  blur = true,
}: LoadingOverlayProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`absolute inset-0 flex items-center justify-center z-10 rounded-lg ${
              blur ? "bg-background/80 backdrop-blur-sm" : "bg-background/90"
            }`}
            style={{ contain: "layout style" }}
          >
            <LoadingSpinner size={spinnerSize} variant={spinnerVariant} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// Progress Bar
// ============================================
interface ProgressBarProps {
  progress: number;
  className?: string;
  height?: number;
  showPercentage?: boolean;
  animated?: boolean;
}

export function ProgressBar({
  progress,
  className = "",
  height = 4,
  showPercentage = false,
  animated = true,
}: ProgressBarProps) {
  const prefersReducedMotion = useReducedMotion();
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={className}>
      <div 
        className="w-full bg-muted rounded-full overflow-hidden"
        style={{ height }}
      >
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={animated && !prefersReducedMotion ? { width: 0 } : undefined}
          animate={{ width: `${clampedProgress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ contain: "layout style" }}
        />
      </div>
      {showPercentage && (
        <span className="text-xs text-muted-foreground mt-1">
          {Math.round(clampedProgress)}%
        </span>
      )}
    </div>
  );
}

// ============================================
// Intersection Observer Hook
// ============================================
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const ref = useRef<Element>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      setEntry(entry);
    }, options);

    observer.observe(element);
    return () => observer.disconnect();
  }, [options.threshold, options.root, options.rootMargin]);

  return { ref, isIntersecting, entry };
}

// ============================================
// Scroll Progress Hook
// ============================================
export function useScrollProgress() {
  const { scrollYProgress } = useScroll();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => {
      setProgress(v * 100);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  return progress;
}
