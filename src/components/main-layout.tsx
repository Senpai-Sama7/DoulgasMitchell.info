"use client";

import { ReactNode, useEffect, useState, createContext, useContext, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "./navigation";
import { Footer } from "./footer";
import { ReadingProgress } from "./reading-progress";
import { BalancedParticles, LightweightParticles } from "./particles";
import { CustomCursor } from "./cursor";
import { ReducedMotionProvider, useReducedMotion, LoadingSpinner } from "./animations";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";

// ============================================
// Layout Context
// ============================================
interface LayoutContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  showParticles: boolean;
  showCustomCursor: boolean;
  pageTransition: "fade" | "slide" | "scale" | "blur" | "wipe";
  setPageTransition: (transition: "fade" | "slide" | "scale" | "blur" | "wipe") => void;
}

const LayoutContext = createContext<LayoutContextType>({
  isLoading: false,
  setIsLoading: () => {},
  showParticles: true,
  showCustomCursor: true,
  pageTransition: "slide",
  setPageTransition: () => {},
});

export function useLayout() {
  return useContext(LayoutContext);
}

// ============================================
// Main Layout Props
// ============================================
interface MainLayoutProps {
  children: ReactNode;
  showParticles?: boolean;
  showCustomCursor?: boolean;
  showReadingProgress?: boolean;
  particleVariant?: "lightweight" | "balanced" | "premium";
  defaultTransition?: "fade" | "slide" | "scale" | "blur" | "wipe";
}

// ============================================
// Page Transition Variants
// ============================================
const pageTransitionVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.02 },
  },
  blur: {
    initial: { opacity: 0, filter: "blur(10px)" },
    animate: { opacity: 1, filter: "blur(0px)" },
    exit: { opacity: 0, filter: "blur(10px)" },
  },
  wipe: {
    initial: { opacity: 0, clipPath: "inset(0 100% 0 0)" },
    animate: { opacity: 1, clipPath: "inset(0 0% 0 0)" },
    exit: { opacity: 0, clipPath: "inset(0 0% 0 100%)" },
  },
};

// ============================================
// Inner Layout Component
// ============================================
function MainLayoutInner({ 
  children, 
  showParticles = true, 
  showCustomCursor = true,
  showReadingProgress = true,
  particleVariant = "balanced",
  defaultTransition = "slide",
}: MainLayoutProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isLoading, setIsLoading] = useState(false);
  const [pageTransition, setPageTransition] = useState(defaultTransition);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile for performance optimizations
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Add smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = prefersReducedMotion ? "auto" : "smooth";
    
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, [prefersReducedMotion]);

  // Add loading class to body when loading
  useEffect(() => {
    if (isLoading) {
      document.body.classList.add('is-loading');
    } else {
      document.body.classList.remove('is-loading');
    }
    
    return () => {
      document.body.classList.remove('is-loading');
    };
  }, [isLoading]);

  // Page entrance animation variants
  const currentVariant = pageTransitionVariants[pageTransition];
  
  // Apply reduced motion to variants
  const activeVariants = prefersReducedMotion 
    ? { 
        initial: { opacity: 0 }, 
        animate: { opacity: 1 }, 
        exit: { opacity: 0 } 
      }
    : currentVariant;

  // Get particle component based on variant
  const ParticleComponent = particleVariant === "lightweight" 
    ? LightweightParticles 
    : particleVariant === "premium" 
      ? BalancedParticles 
      : BalancedParticles;

  return (
    <LayoutContext.Provider 
      value={{ 
        isLoading, 
        setIsLoading, 
        showParticles, 
        showCustomCursor,
        pageTransition,
        setPageTransition,
      }}
    >
      <div className="min-h-screen flex flex-col relative">
        {/* Background Effects with performance optimizations */}
        {showParticles && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-0"
            style={{ contain: "layout style" }}
          >
            {isMobile ? <LightweightParticles /> : <ParticleComponent />}
          </motion.div>
        )}
        
        {/* Custom Cursor - Only on desktop */}
        {showCustomCursor && !isMobile && <CustomCursor />}
        
        {/* Reading Progress */}
        {showReadingProgress && <ReadingProgress />}
        
        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center"
              style={{ contain: "layout style" }}
            >
              <LoadingSpinner size="lg" variant="dots" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Navigation with stagger animation */}
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: prefersReducedMotion ? 0.1 : 0.5, 
            delay: prefersReducedMotion ? 0 : 0.1,
            ease: [0.25, 0.4, 0.25, 1]
          }}
          className="relative z-50"
          style={{ willChange: "opacity, transform" }}
        >
          <Navigation />
        </motion.div>
        
        {/* Main Content with page transition */}
        <AnimatePresence mode="wait">
          <motion.main
            key="main-content"
            variants={activeVariants}
            initial={false}
            animate="animate"
            exit="exit"
            transition={{
              duration: prefersReducedMotion ? 0.1 : 0.4,
              ease: [0.25, 0.4, 0.25, 1],
            }}
            className="flex-1 pt-20 pb-4 relative z-10"
            style={{ 
              willChange: "opacity, transform",
              contain: "layout style",
            }}
          >
            {/* Skip to main content link for accessibility */}
            <a 
              href="#main-content" 
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              Skip to main content
            </a>
            
            <div id="main-content">
              {children}
            </div>
          </motion.main>
        </AnimatePresence>
        
        {/* Footer with entrance animation */}
        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ 
            duration: prefersReducedMotion ? 0.1 : 0.5, 
            delay: prefersReducedMotion ? 0 : 0.3,
            ease: [0.25, 0.4, 0.25, 1]
          }}
          className="relative z-10"
          style={{ willChange: "opacity" }}
        >
          <Footer />
        </motion.div>
      </div>
    </LayoutContext.Provider>
  );
}

// ============================================
// Main Layout Wrapper
// ============================================
export function MainLayout(props: MainLayoutProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ReducedMotionProvider>
        <MainLayoutInner {...props} />
      </ReducedMotionProvider>
      <Toaster position="bottom-right" />
    </ThemeProvider>
  );
}

// ============================================
// Export Hooks
// ============================================
export { useReducedMotion } from "./animations";

// Hook to trigger loading state
export function usePageLoading() {
  const { isLoading, setIsLoading } = useLayout();
  
  const startLoading = useCallback(() => setIsLoading(true), [setIsLoading]);
  const stopLoading = useCallback(() => setIsLoading(false), [setIsLoading]);
  
  return { isLoading, startLoading, stopLoading };
}

// Hook to control page transitions
export function usePageTransition() {
  const { pageTransition, setPageTransition } = useLayout();
  
  return { pageTransition, setPageTransition };
}
