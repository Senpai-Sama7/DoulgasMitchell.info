'use client';

import { createContext, useCallback, useContext, useMemo, type RefObject } from 'react';
import type Lenis from 'lenis';
import type { MotionTier } from '@/lib/motion-tier';

export interface ImmersiveScrollToOptions {
  /** Pixel offset applied to the resolved target position. */
  offset?: number;
  /** Jump without animating (used for route changes / reduced motion). */
  immediate?: boolean;
  /** Override the scroll duration in seconds (Lenis only). */
  duration?: number;
  onComplete?: () => void;
}

interface ImmersiveContextValue {
  motionTier: MotionTier;
  lenisEnabled: boolean;
  /** Live Lenis instance — null when smooth scroll is disabled (admin, reduced motion). */
  lenisRef: RefObject<Lenis | null>;
  /**
   * Scrolls to a pixel offset, CSS selector ('#work') or element. Routes
   * through Lenis when active, otherwise falls back to native scrolling, so
   * callers (chapter rail, command palette, anchors) never need to branch.
   */
  scrollTo: (target: number | string | HTMLElement, options?: ImmersiveScrollToOptions) => void;
}

function nativeScrollTo(
  target: number | string | HTMLElement,
  options: ImmersiveScrollToOptions = {}
): void {
  if (typeof window === 'undefined') return;

  const behavior: ScrollBehavior = options.immediate ? 'auto' : 'smooth';

  if (typeof target === 'number') {
    window.scrollTo({ top: target + (options.offset ?? 0), behavior });
    options.onComplete?.();
    return;
  }

  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (element instanceof HTMLElement) {
    const top = element.getBoundingClientRect().top + window.scrollY + (options.offset ?? 0);
    window.scrollTo({ top, behavior });
    options.onComplete?.();
  }
}

const ImmersiveContext = createContext<ImmersiveContextValue>({
  motionTier: 'low',
  lenisEnabled: false,
  lenisRef: { current: null },
  scrollTo: nativeScrollTo,
});

export function ImmersiveProvider({
  children,
  motionTier,
  lenisEnabled,
  lenisRef,
}: {
  children: React.ReactNode;
  motionTier: MotionTier;
  lenisEnabled: boolean;
  lenisRef: RefObject<Lenis | null>;
}) {
  const scrollTo = useCallback(
    (target: number | string | HTMLElement, options: ImmersiveScrollToOptions = {}) => {
      const lenis = lenisRef.current;
      if (lenis) {
        lenis.scrollTo(target, {
          offset: options.offset,
          immediate: options.immediate,
          duration: options.duration,
          onComplete: options.onComplete,
        });
        return;
      }
      nativeScrollTo(target, options);
    },
    [lenisRef]
  );

  const value = useMemo(
    () => ({ motionTier, lenisEnabled, lenisRef, scrollTo }),
    [motionTier, lenisEnabled, lenisRef, scrollTo]
  );

  return <ImmersiveContext.Provider value={value}>{children}</ImmersiveContext.Provider>;
}

export function useImmersive() {
  return useContext(ImmersiveContext);
}
