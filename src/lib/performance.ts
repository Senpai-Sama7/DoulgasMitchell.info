"use client";

import * as React from "react";

// Debounce hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttle hook
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = React.useState<T>(value);
  const lastUpdated = React.useRef<number>(Date.now());

  React.useEffect(() => {
    const now = Date.now();
    if (now - lastUpdated.current >= interval) {
      lastUpdated.current = now;
      setThrottledValue(value);
    }
  }, [value, interval]);

  return throttledValue;
}

// Intersection observer hook for lazy loading
interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<Element | null>, boolean] {
  const { threshold = 0, root = null, rootMargin = "0px", freezeOnceVisible = false } = options;
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<Element | null>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry.isIntersecting;
        setIsVisible(visible);
        if (visible && freezeOnceVisible) {
          observer.unobserve(element);
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, root, rootMargin, freezeOnceVisible]);

  return [ref, isVisible];
}

// Virtual list hook for large lists
interface VirtualListOptions {
  itemCount: number;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export function useVirtualList({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 3,
}: VirtualListOptions) {
  const [scrollTop, setScrollTop] = React.useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    itemCount - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = React.useMemo(() => {
    return Array.from({ length: endIndex - startIndex + 1 }, (_, i) => ({
      index: startIndex + i,
      style: {
        position: "absolute" as const,
        top: (startIndex + i) * itemHeight,
        height: itemHeight,
        left: 0,
        right: 0,
      },
    }));
  }, [startIndex, endIndex, itemHeight]);

  const totalHeight = itemCount * itemHeight;

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    startIndex,
    endIndex,
  };
}

// Memoized callback with dependencies
export function useMemoizedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: React.DependencyList
): T {
  return React.useCallback(callback, deps);
}

// Deep comparison memo
export function useDeepCompareMemo<T>(factory: () => T, deps: React.DependencyList): T {
  const ref = React.useRef<React.DependencyList>([]);
  const valueRef = React.useRef<T>();

  if (!deepEqual(deps, ref.current)) {
    ref.current = deps;
    valueRef.current = factory();
  }

  return valueRef.current as T;
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (typeof a !== "object") return a === b;

  const arrA = a as unknown[];
  const arrB = b as unknown[];
  if (Array.isArray(a) && Array.isArray(b)) {
    if (arrA.length !== arrB.length) return false;
    return arrA.every((item, index) => deepEqual(item, arrB[index]));
  }

  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => deepEqual(objA[key], objB[key]));
}

// Cache hook for API responses
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expires: number;
}

export function useCache<T>(key: string, ttl: number = 5 * 60 * 1000) {
  const cacheRef = React.useRef<Map<string, CacheEntry<T>>>(new Map());

  const get = React.useCallback(
    (cacheKey: string): T | null => {
      const entry = cacheRef.current.get(cacheKey);
      if (!entry) return null;
      if (Date.now() > entry.expires) {
        cacheRef.current.delete(cacheKey);
        return null;
      }
      return entry.data;
    },
    []
  );

  const set = React.useCallback(
    (cacheKey: string, data: T) => {
      cacheRef.current.set(cacheKey, {
        data,
        timestamp: Date.now(),
        expires: Date.now() + ttl,
      });
    },
    [ttl]
  );

  const invalidate = React.useCallback((cacheKey: string) => {
    cacheRef.current.delete(cacheKey);
  }, []);

  const clear = React.useCallback(() => {
    cacheRef.current.clear();
  }, []);

  return { get, set, invalidate, clear };
}

// Prefetch hook
export function usePrefetch() {
  const prefetchedRef = React.useRef<Set<string>>(new Set());

  const prefetch = React.useCallback(async (url: string) => {
    if (prefetchedRef.current.has(url)) return;

    try {
      // Preload images
      if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        const img = new Image();
        img.src = url;
        prefetchedRef.current.add(url);
        return;
      }

      // Prefetch pages
      if (url.startsWith("/")) {
        const link = document.createElement("link");
        link.rel = "prefetch";
        link.href = url;
        document.head.appendChild(link);
        prefetchedRef.current.add(url);
      }
    } catch (error) {
      console.error("Prefetch failed:", error);
    }
  }, []);

  return { prefetch };
}

// Window size hook
interface WindowSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export function useWindowSize(): WindowSize {
  const [size, setSize] = React.useState<WindowSize>({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setSize({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}

// Scroll position hook
interface ScrollPosition {
  x: number;
  y: number;
  direction: "up" | "down" | null;
  progress: number;
}

export function useScrollPosition(): ScrollPosition {
  const [position, setPosition] = React.useState<ScrollPosition>({
    x: 0,
    y: 0,
    direction: null,
    progress: 0,
  });
  const lastYRef = React.useRef(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const x = window.scrollX;
      const direction = y > lastYRef.current ? "down" : y < lastYRef.current ? "up" : null;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? y / maxScroll : 0;

      setPosition({ x, y, direction, progress });
      lastYRef.current = y;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return position;
}

// Media query hook
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

// Reduced motion hook
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

// Focus trap hook for modals
export function useFocusTrap<T extends HTMLElement>(isActive: boolean) {
  const containerRef = React.useRef<T>(null);

  React.useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    firstElement?.focus();

    return () => container.removeEventListener("keydown", handleKeyDown);
  }, [isActive]);

  return containerRef;
}

// Copy to clipboard hook
export function useCopyToClipboard() {
  const [copied, setCopied] = React.useState(false);

  const copy = React.useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (error) {
      console.error("Failed to copy:", error);
      return false;
    }
  }, []);

  return { copy, copied };
}

// Local storage hook with SSR support
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = React.useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Failed to read from localStorage:", error);
      return initialValue;
    }
  });

  const setValue = React.useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error("Failed to write to localStorage:", error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue] as const;
}