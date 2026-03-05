"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useSpring, useMotionValue, AnimatePresence } from "framer-motion";

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
  // Disable on mobile/touch devices or admin page
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const isAdminPage = window.location.pathname.startsWith('/admin');
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0 || isAdminPage);
  }, []);
  
  if (isMobile) return null;
  
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CursorState>({
    isVisible: false,
    isHovering: false,
    isClicking: false,
    isMagnetic: false,
    hoverType: "default",
  });
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const trailIdRef = useRef(0);
  const lastTrailTimeRef = useRef(0);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const magneticTargetRef = useRef<HTMLElement | null>(null);
  
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const magneticX = useMotionValue(0);
  const magneticY = useMotionValue(0);
  
  const springConfig = { damping: 20, stiffness: 400, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);
  
  // Magnetic spring with more bounce
  const magneticSpringConfig = { damping: 15, stiffness: 200, mass: 0.8 };
  const magneticXSpring = useSpring(magneticX, magneticSpringConfig);
  const magneticYSpring = useSpring(magneticY, magneticSpringConfig);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== "undefined" && 
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Add trail point with velocity-based sizing
  const addTrailPoint = useCallback((x: number, y: number) => {
    const now = Date.now();
    if (now - lastTrailTimeRef.current < 25) return;
    lastTrailTimeRef.current = now;

    // Calculate velocity for dynamic trail sizing
    const dx = x - lastMousePosRef.current.x;
    const dy = y - lastMousePosRef.current.y;
    const velocity = Math.sqrt(dx * dx + dy * dy);
    
    lastMousePosRef.current = { x, y };

    const id = trailIdRef.current++;
    const scale = Math.min(1 + velocity * 0.01, 1.5);
    
    setTrail(prev => {
      const newTrail = [...prev, { 
        id, 
        x, 
        y, 
        opacity: 0.6, 
        scale,
        timestamp: now 
      }];
      // Keep only last 12 trail points
      return newTrail.slice(-12);
    });

    // Remove trail point after animation
    setTimeout(() => {
      setTrail(prev => prev.filter(p => p.id !== id));
    }, 600);
  }, []);

  // Detect element type for cursor styling
  const getHoverType = useCallback((element: Element): "default" | "link" | "button" | "image" | "text" | "input" | "video" => {
    const tagName = element.tagName.toLowerCase();
    
    // Check for data attributes first
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

  // Check if element has magnetic effect
  const isMagneticElement = useCallback((element: Element): boolean => {
    return element.hasAttribute("data-magnetic") || 
           element.classList.contains("magnetic") ||
           element.closest("[data-magnetic]") !== null ||
           element.closest(".magnetic") !== null;
  }, []);

  // Handle magnetic effect
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
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      
      // Handle magnetic effect
      if (magneticTargetRef.current && state.isMagnetic) {
        handleMagneticEffect(e, magneticTargetRef.current);
      }
      
      // Add trail point only when moving and visible
      if (state.isVisible && !state.isMagnetic) {
        addTrailPoint(e.clientX, e.clientY);
      }
    };

    const handleMouseDown = () => {
      setState(prev => ({ ...prev, isClicking: true }));
    };

    const handleMouseUp = () => {
      setState(prev => ({ ...prev, isClicking: false }));
    };

    const handleMouseEnter = () => {
      setState(prev => ({ ...prev, isVisible: true }));
    };

    const handleMouseLeave = () => {
      setState(prev => ({ ...prev, isVisible: false, isMagnetic: false }));
      setTrail([]);
    };

    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as Element;
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

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mousedown", handleMouseDown, { passive: true });
    document.addEventListener("mouseup", handleMouseUp, { passive: true });

    // Add listeners for interactive elements with mutation observer for dynamic content
    const addInteractiveListeners = () => {
      const interactiveElements = document.querySelectorAll(
        "a, button, input, textarea, select, [role='button'], img, video, .image-card, [data-lightbox], [data-cursor-hover], [data-magnetic], .magnetic"
      );
      interactiveElements.forEach((el) => {
        el.addEventListener("mouseenter", handleElementHover);
        el.addEventListener("mouseleave", handleElementLeave);
      });
    };

    addInteractiveListeners();

    // Mutation observer to detect new interactive elements
    const observer = new MutationObserver(() => {
      addInteractiveListeners();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      observer.disconnect();
      
      const interactiveElements = document.querySelectorAll(
        "a, button, input, textarea, select, [role='button'], img, video, .image-card, [data-lightbox], [data-cursor-hover], [data-magnetic], .magnetic"
      );
      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleElementHover);
        el.removeEventListener("mouseleave", handleElementLeave);
      });
    };
  }, [cursorX, cursorY, state.isVisible, state.isMagnetic, addTrailPoint, getHoverType, isMagneticElement, handleMagneticEffect, magneticX, magneticY, prefersReducedMotion]);

  // Get cursor size based on hover type
  const getCursorSize = () => {
    if (state.isClicking && state.isHovering) {
      return { width: 24, height: 24 };
    }
    
    switch (state.hoverType) {
      case "link":
      case "button":
        return { width: 48, height: 48 };
      case "image":
        return { width: 56, height: 56 };
      case "video":
        return { width: 64, height: 64 };
      case "text":
      case "input":
        return { width: 4, height: 24 };
      default:
        return { width: 32, height: 32 };
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

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <>
      {/* Gradient Trail Effect */}
      <AnimatePresence>
        {trail.map((point, index) => {
          // Calculate gradient opacity based on position in trail
          const gradientOpacity = (index / trail.length) * 0.5;
          
          return (
            <motion.div
              key={point.id}
              className="fixed pointer-events-none z-[9998] hidden md:block"
              initial={{ opacity: 0.6, scale: point.scale }}
              animate={{ opacity: 0, scale: 0.3 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
                left: point.x,
                top: point.y,
                width: 10 + index,
                height: 10 + index,
                transform: "translate(-50%, -50%)",
                contain: "layout style paint",
                willChange: "transform, opacity",
              }}
            >
              {/* Gradient circle */}
              <div 
                className="w-full h-full rounded-full"
                style={{
                  background: `radial-gradient(circle, 
                    hsla(45, 70%, 55%, ${gradientOpacity}) 0%, 
                    hsla(40, 60%, 50%, ${gradientOpacity * 0.5}) 50%, 
                    transparent 100%)`,
                }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
      
      {/* Main cursor ring */}
      <motion.div
        ref={cursorRef}
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999] mix-blend-difference hidden md:flex items-center justify-center"
        style={{
          x: state.isMagnetic ? magneticXSpring : cursorXSpring,
          y: state.isMagnetic ? magneticYSpring : cursorYSpring,
          translateX: "-50%",
          translateY: "-50%",
          border: "2px solid var(--primary)",
          backgroundColor: getCursorColor(),
          opacity: state.isVisible ? 1 : 0,
          width: getCursorSize().width,
          height: getCursorSize().height,
          contain: "layout style paint",
          willChange: "transform, opacity, width, height",
        }}
          borderRadius: getCursorRadius(),
          transition: "opacity 0.2s ease, background-color 0.15s ease, border-color 0.15s ease",
          willChange: "transform, opacity, width, height",
          contain: "layout style",
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
          transition: "opacity 0.2s ease, background-color 0.15s ease, transform 0.15s ease",
          willChange: "transform",
          contain: "layout style",
        }}
      />

      {/* Click ripple effect */}
      <AnimatePresence>
        {state.isClicking && state.isHovering && (
          <motion.div
            className="fixed rounded-full pointer-events-none z-[9997] hidden md:block"
            initial={{ 
              width: 20, 
              height: 20, 
              opacity: 0.5,
              x: cursorX.get() - 10,
              y: cursorY.get() - 10,
            }}
            animate={{ 
              width: 60, 
              height: 60, 
              opacity: 0,
              x: cursorX.get() - 30,
              y: cursorY.get() - 30,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              border: "2px solid var(--primary)",
              contain: "layout style",
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
