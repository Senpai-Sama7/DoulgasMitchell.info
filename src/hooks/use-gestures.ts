"use client";

import * as React from "react";

// Swipe gesture hook
interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventDefaultTouchMove?: boolean;
}

interface SwipeState {
  startX: number;
  startY: number;
  isSwiping: boolean;
}

export function useSwipeGesture(config: SwipeConfig) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventDefaultTouchMove = false,
  } = config;

  const stateRef = React.useRef<SwipeState>({
    startX: 0,
    startY: 0,
    isSwiping: false,
  });

  const handleTouchStart = React.useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    stateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      isSwiping: true,
    };
  }, []);

  const handleTouchMove = React.useCallback((e: TouchEvent) => {
    if (preventDefaultTouchMove && stateRef.current.isSwiping) {
      e.preventDefault();
    }
  }, [preventDefaultTouchMove]);

  const handleTouchEnd = React.useCallback((e: TouchEvent) => {
    if (!stateRef.current.isSwiping) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - stateRef.current.startX;
    const deltaY = touch.clientY - stateRef.current.startY;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > absY && absX > threshold) {
      // Horizontal swipe
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    } else if (absY > absX && absY > threshold) {
      // Vertical swipe
      if (deltaY > 0) {
        onSwipeDown?.();
      } else {
        onSwipeUp?.();
      }
    }

    stateRef.current.isSwiping = false;
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);

  const ref = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener("touchstart", handleTouchStart, { passive: true });
    element.addEventListener("touchmove", handleTouchMove, { passive: !preventDefaultTouchMove });
    element.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventDefaultTouchMove]);

  return ref;
}

// Pull to refresh hook
interface PullToRefreshConfig {
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPullDistance?: number;
}

export function usePullToRefresh(config: PullToRefreshConfig) {
  const { onRefresh, threshold = 80, maxPullDistance = 150 } = config;
  const [isPulling, setIsPulling] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const startYRef = React.useRef(0);

  const handleTouchStart = React.useCallback((e: TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startYRef.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = React.useCallback((e: TouchEvent) => {
    if (!isPulling || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = Math.min(currentY - startYRef.current, maxPullDistance);
    
    if (distance > 0) {
      setPullDistance(distance);
    }
  }, [isPulling, isRefreshing, maxPullDistance]);

  const handleTouchEnd = React.useCallback(async () => {
    if (!isPulling) return;

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
    setIsPulling(false);
  }, [isPulling, pullDistance, threshold, isRefreshing, onRefresh]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    containerRef,
    isPulling,
    pullDistance,
    isRefreshing,
    pullProgress: Math.min(pullDistance / threshold, 1),
  };
}

// Long press hook
interface LongPressConfig {
  onLongPress: () => void;
  delay?: number;
  onStart?: () => void;
  onCancel?: () => void;
}

export function useLongPress(config: LongPressConfig) {
  const { onLongPress, delay = 500, onStart, onCancel } = config;
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = React.useRef(false);

  const start = React.useCallback(() => {
    isLongPressRef.current = false;
    onStart?.();
    timeoutRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onLongPress();
    }, delay);
  }, [onLongPress, delay, onStart]);

  const clear = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (!isLongPressRef.current) {
      onCancel?.();
    }
  }, [onCancel]);

  return {
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchEnd: clear,
    onTouchCancel: clear,
  };
}

// Double tap hook
interface DoubleTapConfig {
  onDoubleTap: () => void;
  delay?: number;
}

export function useDoubleTap(config: DoubleTapConfig) {
  const { onDoubleTap, delay = 300 } = config;
  const lastTapRef = React.useRef(0);

  const handleTap = React.useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < delay) {
      onDoubleTap();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  }, [onDoubleTap, delay]);

  return {
    onClick: handleTap,
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      handleTap();
    },
  };
}

// Pinch to zoom hook
interface PinchToZoomConfig {
  onZoom?: (scale: number) => void;
  minScale?: number;
  maxScale?: number;
}

export function usePinchToZoom(config: PinchToZoomConfig = {}) {
  const { onZoom, minScale = 1, maxScale = 4 } = config;
  const [scale, setScale] = React.useState(1);
  const initialDistanceRef = React.useRef(0);
  const initialScaleRef = React.useRef(1);

  const getDistance = (touches: TouchList): number => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = React.useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      initialDistanceRef.current = getDistance(e.touches);
      initialScaleRef.current = scale;
    }
  }, [scale]);

  const handleTouchMove = React.useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const currentDistance = getDistance(e.touches);
      const newScale = initialScaleRef.current * (currentDistance / initialDistanceRef.current);
      const clampedScale = Math.min(Math.max(newScale, minScale), maxScale);
      setScale(clampedScale);
      onZoom?.(clampedScale);
    }
  }, [minScale, maxScale, onZoom]);

  const reset = React.useCallback(() => {
    setScale(1);
    onZoom?.(1);
  }, [onZoom]);

  return {
    scale,
    reset,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
    },
  };
}

// Haptic feedback (for supported devices)
export function useHapticFeedback() {
  const isSupported = typeof navigator !== "undefined" && "vibrate" in navigator;

  const light = React.useCallback(() => {
    if (isSupported) {
      navigator.vibrate(10);
    }
  }, [isSupported]);

  const medium = React.useCallback(() => {
    if (isSupported) {
      navigator.vibrate(20);
    }
  }, [isSupported]);

  const heavy = React.useCallback(() => {
    if (isSupported) {
      navigator.vibrate(50);
    }
  }, [isSupported]);

  const success = React.useCallback(() => {
    if (isSupported) {
      navigator.vibrate([30, 20, 30]);
    }
  }, [isSupported]);

  const error = React.useCallback(() => {
    if (isSupported) {
      navigator.vibrate([50, 30, 50, 30, 50]);
    }
  }, [isSupported]);

  return {
    isSupported,
    light,
    medium,
    heavy,
    success,
    error,
  };
}