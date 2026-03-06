"use client";

import * as React from "react";

interface PWAStatus {
  isInstalled: boolean;
  isOnline: boolean;
  canInstall: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function usePWA() {
  const [status, setStatus] = React.useState<PWAStatus>({
    isInstalled: false,
    isOnline: true,
    canInstall: false,
    installPrompt: null,
  });

  // Check if app is installed
  React.useEffect(() => {
    const checkInstalled = () => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
      const isIOSStandalone = isIOS && (navigator as Navigator & { standalone?: boolean }).standalone;
      
      setStatus((prev) => ({
        ...prev,
        isInstalled: isStandalone || !!isIOSStandalone,
      }));
    };

    checkInstalled();
    window.addEventListener("appinstalled", checkInstalled);
    return () => window.removeEventListener("appinstalled", checkInstalled);
  }, []);

  // Track online/offline status
  React.useEffect(() => {
    const handleOnline = () => {
      setStatus((prev) => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setStatus((prev) => ({ ...prev, isOnline: false }));
    };

    setStatus((prev) => ({ ...prev, isOnline: navigator.onLine }));

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Capture install prompt
  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setStatus((prev) => ({
        ...prev,
        canInstall: true,
        installPrompt: promptEvent,
      }));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  // Install app
  const install = React.useCallback(async () => {
    if (!status.installPrompt) return false;

    try {
      await status.installPrompt.prompt();
      const { outcome } = await status.installPrompt.userChoice;

      if (outcome === "accepted") {
        setStatus((prev) => ({
          ...prev,
          isInstalled: true,
          canInstall: false,
          installPrompt: null,
        }));
        return true;
      }
    } catch (error) {
      console.error("Install failed:", error);
    }

    return false;
  }, [status.installPrompt]);

  // Register service worker
  React.useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration.scope);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }
  }, []);

  return {
    ...status,
    install,
  };
}

// Offline status indicator component
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const { isOnline } = usePWA();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className={cn(
            "fixed top-0 left-0 right-0 z-50",
            "bg-amber-500 text-amber-950",
            "py-2 px-4 text-center text-sm font-medium",
            className
          )}
        >
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span>You're offline. Some features may be limited.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Install prompt component
interface InstallPromptProps {
  className?: string;
}

export function InstallPrompt({ className }: InstallPromptProps) {
  const { canInstall, install, isInstalled } = usePWA();
  const [dismissed, setDismissed] = React.useState(false);

  if (!canInstall || isInstalled || dismissed) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className={cn(
        "fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80",
        "bg-card border border-border rounded-xl shadow-lg p-4 z-40",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">Install App</h3>
          <p className="text-sm text-muted-foreground">
            Install this app for a better experience with offline support.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-muted-foreground hover:text-foreground"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={install}
          className="flex-1 py-2 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Install
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="py-2 px-4 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors"
        >
          Not now
        </button>
      </div>
    </motion.div>
  );
}

// Connection status hook
export function useConnectionStatus() {
  const [connectionInfo, setConnectionInfo] = React.useState<{
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  } | null>(null);

  React.useEffect(() => {
    const connection = (navigator as Navigator & { connection?: {
      effectiveType: string;
      downlink: number;
      rtt: number;
      saveData: boolean;
      addEventListener: (type: string, listener: () => void) => void;
      removeEventListener: (type: string, listener: () => void) => void;
    } }).connection;

    if (!connection) return;

    const updateInfo = () => {
      setConnectionInfo({
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      });
    };

    updateInfo();
    connection.addEventListener("change", updateInfo);
    return () => connection.removeEventListener("change", updateInfo);
  }, []);

  return {
    ...connectionInfo,
    isSlowConnection: connectionInfo?.effectiveType === "2g" || connectionInfo?.effectiveType === "slow-2g",
    isDataSaver: connectionInfo?.saveData ?? false,
  };
}