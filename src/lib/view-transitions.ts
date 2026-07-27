"use client";

/**
 * View Transitions helpers for the public assistant and other client-side
 * navigation triggers. Falls back to native navigation in unsupported browsers.
 */

import { useCallback } from "react";

/**
 * Imperative helper for client-side view transitions.
 * Use when a JS-triggered event should animate before navigation.
 */
export function useViewTransition() {
  return useCallback((callback: () => void | Promise<void>) => {
    if (
      typeof document !== "undefined" &&
      typeof (document as Document & {
        startViewTransition?: (cb: () => unknown) => unknown;
      }).startViewTransition === "function"
    ) {
      (document as Document & {
        startViewTransition: (cb: () => unknown) => unknown;
      }).startViewTransition(callback);
    } else {
      void callback();
    }
  }, []);
}

/**
 * Apply view-transition-name to an element so it persists across pages
 * and morphs between them. Use a unique name per element (e.g. hero-image-${id}).
 */
export function viewTransitionName(name: string): React.CSSProperties {
  return { viewTransitionName: name };
}
