"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useSpring, useMotionValue, useTransform, AnimatePresence } from "framer-motion";

interface TrailPoint {
  id: number;
  x: number;
  y: number;
  opacity: number;
  scale: number;
  timestamp: number;
}

interface CursorState {
  isVisible: boolean;
  isHovering: boolean;
  isClicking: boolean;
  isMagnetic: boolean;
  hoverType: "default" | "link" | "button" | "image" | "text" | "input" | "video";
}

export function CustomCursor() {
  const [isMobile, setIsMobile] = useState(false);
  
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const hasPointerPositionRef = useRef(false);
  const [state, setState] = useState<CursorState>({
    isVisible: false,
    isHovering: false,
    isClicking: false,
    isMagnetic: false,
    hoverType: "default",
  });
  
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const magneticX = useMotionValue(0);
  const magneticY = useMotionValue(0);
  const magneticTargetRef = useRef<HTMLElement | null>(null);
  
  const springConfig = { damping: 20, stiffness: 400, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);
  
  const magneticSpringConfig = { damping: 15, stiffness: 200, mass: 0.8 };
  const magneticXSpring = useSpring(magneticX, magneticSpringConfig);
  const magneticYSpring = useSpring(magneticY, magneticSpringConfig);
  const cursorRenderX = useTransform([cursorXSpring, magneticXSpring], (values) => {
    const [x = 0, offset = 0] = values as number[];
    return x + offset;
  });
  const cursorRenderY = useTransform([cursorYSpring, magneticYSpring], (values) => {
    const [y = 0, offset = 0] = values as number[];
    return y + offset;
  });

  const prefersReducedMotion = typeof window !== "undefined" && 
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const getHoverType = useCallback((element: Element): "default" | "link" | "button" | "image" | "text" | "input" | "video" => {
    const tagName = element.tagName.toLowerCase();
    
    const cursorType = element.getAttribute("data-cursor-type") as CursorState["hoverType"];
    if (cursorType) return cursorType;
    
    if (tagName === "a" || element.closest("a")) return "link";
    if (tagName === "button" || element.getAttribute("role") === "button" || element.closest("button")) return "button";
    if (tagName === "video" || element.closest("video")) return "video";
    if (tagName === "img" || element.closest("[data-lightbox]") || element.classList.contains("image-card") || element.closest(".image-card")) return "image";
    if (tagName === "input" || tagName === "textarea" || element.getAttribute("contenteditable") === "true") return "input";
    if (tagName === "select" || element.closest("select")) return "input";
    
    return "default";
  }, []);

  const isMagneticElement = useCallback((element: Element): boolean => {
    return element.hasAttribute("data-magnetic") || 
           element.classList.contains("magnetic") ||
           element.closest("[data-magnetic]") !== null ||
           element.closest(".magnetic") !== null;
  }, []);

  const handleMagneticEffect = useCallback((e: MouseEvent, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const strength = parseFloat(element.getAttribute("data-magnetic-strength") || "0.3");
    
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    
    magneticX.set(deltaX);
    magneticY.set(deltaY);
  }, [magneticX, magneticY]);

  useEffect(() => {
    const isAdminPage = window.location.pathname.startsWith('/admin');
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0 || isAdminPage);
  }, []);
  
  useEffect(() => {
    if (prefersReducedMotion || isMobile) return;

    let rafId: number;
    let lastX = 0;
    let lastY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;

      if (!hasPointerPositionRef.current) {
        hasPointerPositionRef.current = true;
        setState((prev) => ({ ...prev, isVisible: true }));
      }
      
      if (rafId) cancelAnimationFrame(rafId);
      
      rafId = requestAnimationFrame(() => {
        cursorX.set(lastX);
        cursorY.set(lastY);
        if (magneticTargetRef.current) {
          handleMagneticEffect(e, magneticTargetRef.current);
        }
      });
    };

    const handleMouseDown = () => {
      setState(prev => ({ ...prev, isClicking: true }));
    };

    const handleMouseUp = () => {
      setState(prev => ({ ...prev, isClicking: false }));
    };

    const handleMouseLeave = () => {
      hasPointerPositionRef.current = false;
      magneticTargetRef.current = null;
      magneticX.set(0);
      magneticY.set(0);
      setState(prev => ({
        ...prev,
        isVisible: false,
        isMagnetic: false,
        isHovering: false,
        hoverType: "default",
      }));
    };

    const interactiveSelector =
      "a, button, input, textarea, select, [role='button'], img, video, .image-card, [data-lightbox], [data-cursor-hover], [data-magnetic], .magnetic";

    const handleElementHover = (target: Element) => {
      const hoverType = getHoverType(target);
      const isMagnetic = isMagneticElement(target);
      
      if (isMagnetic && target instanceof HTMLElement) {
        magneticTargetRef.current = target;
      }
      
      setState(prev => ({ 
        ...prev, 
        isHovering: true, 
        hoverType,
        isMagnetic 
      }));
    };

    const handleElementLeave = () => {
      magneticTargetRef.current = null;
      magneticX.set(0);
      magneticY.set(0);
      setState(prev => ({ 
        ...prev, 
        isHovering: false, 
        hoverType: "default",
        isMagnetic: false 
      }));
    };

    const handlePointerOver = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target) return;
      const interactiveTarget = target.closest(interactiveSelector);
      if (!interactiveTarget) return;
      handleElementHover(interactiveTarget);
    };

    const handlePointerOut = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target) return;
      const interactiveTarget = target.closest(interactiveSelector);
      if (!interactiveTarget) return;

      const relatedTarget = e.relatedTarget as Node | null;
      if (relatedTarget && interactiveTarget.contains(relatedTarget)) {
        return;
      }

      handleElementLeave();
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mousedown", handleMouseDown, { passive: true });
    document.addEventListener("mouseup", handleMouseUp, { passive: true });
    document.addEventListener("mouseover", handlePointerOver, { passive: true });
    document.addEventListener("mouseout", handlePointerOut, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handlePointerOver);
      document.removeEventListener("mouseout", handlePointerOut);
    };
  }, [
    cursorX,
    cursorY,
    getHoverType,
    isMagneticElement,
    handleMagneticEffect,
    magneticX,
    magneticY,
    prefersReducedMotion,
    isMobile,
  ]);

  if (prefersReducedMotion || isMobile) return null;

  // Keep a fixed base size and animate scale to avoid layout instability.
  const getCursorScale = () => {
    if (state.isClicking && state.isHovering) {
      return { x: 0.8, y: 0.8 };
    }
    
    switch (state.hoverType) {
      case "link":
      case "button":
        return { x: 1.5, y: 1.5 };
      case "image":
        return { x: 1.75, y: 1.75 };
      case "video":
        return { x: 2, y: 2 };
      case "text":
      case "input":
        return { x: 0.14, y: 0.75 };
      default:
        return { x: 1, y: 1 };
    }
  };

  // Get cursor border radius based on hover type
  const getCursorRadius = () => {
    switch (state.hoverType) {
      case "text":
      case "input":
        return "4px";
      default:
        return "50%";
    }
  };

  // Get cursor color based on state
  const getCursorColor = () => {
    if (state.isClicking) return "var(--primary)";
    if (state.hoverType === "link" || state.hoverType === "button") return "var(--primary)";
    return "transparent";
  };

  const cursorScale = getCursorScale();

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <>
      {/* Main cursor ring */}
      <motion.div
        ref={cursorRef}
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:flex items-center justify-center"
        style={{
          x: cursorRenderX,
          y: cursorRenderY,
          translateX: "-50%",
          translateY: "-50%",
          border: "2px solid var(--primary)",
          backgroundColor: getCursorColor(),
          opacity: state.isVisible ? 1 : 0,
          width: 32,
          height: 32,
          scaleX: cursorScale.x,
          scaleY: cursorScale.y,
          borderRadius: getCursorRadius(),
          contain: "paint",
          willChange: "transform, opacity",
          transition: "opacity 0.2s ease, background-color 0.15s ease, border-color 0.15s ease",
        }}
      >
        {/* Hover indicator icons */}
        <AnimatePresence mode="wait">
          {state.hoverType === "image" && state.isHovering && (
            <motion.div
              key="image-icon"
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <svg 
                className="w-5 h-5 text-primary-foreground" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </motion.div>
          )}
          {state.hoverType === "link" && state.isHovering && (
            <motion.div
              key="link-icon"
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <svg 
                className="w-4 h-4 text-primary-foreground" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </motion.div>
          )}
          {state.hoverType === "button" && state.isHovering && (
            <motion.div
              key="button-icon"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <svg 
                className="w-4 h-4 text-primary-foreground" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </motion.div>
          )}
          {state.hoverType === "video" && state.isHovering && (
            <motion.div
              key="video-icon"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <svg 
                className="w-5 h-5 text-primary-foreground" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Cursor dot - follows instantly */}
      <motion.div
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full pointer-events-none z-[9999] hidden md:block"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
          backgroundColor: state.isClicking ? "transparent" : "var(--primary)",
          opacity: state.isVisible ? (state.isClicking ? 0 : 1) : 0,
          scale: state.isClicking ? 2 : 1,
          transition: "opacity 0.2s ease, background-color 0.15s ease",
          willChange: "transform",
          contain: "paint",
        }}
      />

      {/* Click ripple effect */}
      <AnimatePresence>
        {state.isClicking && state.isHovering && (
          <motion.div
            className="fixed top-0 left-0 w-5 h-5 rounded-full pointer-events-none z-[9997] hidden md:block"
            initial={{ 
              opacity: 0.5,
              scale: 0.7,
              x: cursorX.get(),
              y: cursorY.get(),
            }}
            animate={{ 
              opacity: 0,
              scale: 2.6,
              x: cursorX.get(),
              y: cursorY.get(),
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              translateX: "-50%",
              translateY: "-50%",
              border: "2px solid var(--primary)",
              contain: "paint",
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Hook to use cursor state in other components
export function useCursorHover(type: "default" | "link" | "button" | "image" | "text" | "input" | "video" = "default") {
  const ref = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    element.setAttribute("data-cursor-hover", "");
    element.setAttribute("data-cursor-type", type);
    
    return () => {
      element.removeAttribute("data-cursor-hover");
      element.removeAttribute("data-cursor-type");
    };
  }, [type]);
  
  return ref;
}

// Hook to make an element magnetic
export function useMagnetic(strength: number = 0.3) {
  const ref = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    element.setAttribute("data-magnetic", "");
    element.setAttribute("data-magnetic-strength", strength.toString());
    
    return () => {
      element.removeAttribute("data-magnetic");
      element.removeAttribute("data-magnetic-strength");
    };
  }, [strength]);
  
  return ref;
}
