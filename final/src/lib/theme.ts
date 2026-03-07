'use client';

import { useSyncExternalStore, useEffect, useCallback } from 'react';

// Theme store using useSyncExternalStore pattern
function createThemeStore() {
  let listeners: Array<() => void> = [];
  let isDark = false;

  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    isDark = stored === 'dark' || (!stored && prefersDark);
  }

  return {
    subscribe: (listener: () => void) => {
      listeners.push(listener);
      return () => {
        listeners = listeners.filter(l => l !== listener);
      };
    },
    getSnapshot: () => isDark,
    getServerSnapshot: () => false,
    toggle: () => {
      isDark = !isDark;
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', isDark);
      listeners.forEach(l => l());
    },
    init: () => {
      if (typeof window !== 'undefined') {
        document.documentElement.classList.toggle('dark', isDark);
      }
    },
    setTheme: (theme: 'dark' | 'light') => {
      isDark = theme === 'dark';
      localStorage.setItem('theme', theme);
      document.documentElement.classList.toggle('dark', isDark);
      listeners.forEach(l => l());
    }
  };
}

// Singleton instance
const themeStore = createThemeStore();

// React hook for consuming theme
export function useTheme() {
  const isDark = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    () => false
  );

  useEffect(() => {
    themeStore.init();
  }, []);

  const toggle = useCallback(() => {
    themeStore.toggle();
  }, []);

  const setTheme = useCallback((theme: 'dark' | 'light') => {
    themeStore.setTheme(theme);
  }, []);

  return {
    isDark,
    toggle,
    setTheme,
    theme: isDark ? 'dark' : 'light'
  };
}

// Direct access for non-React contexts
export { themeStore };
