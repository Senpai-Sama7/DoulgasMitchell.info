"use client";

import * as React from "react";
import { ThemeProvider } from "@/hooks/use-theme";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { OfflineIndicator, InstallPrompt } from "@/hooks/use-pwa";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="douglasmitchell-theme">
        {children}
        <Toaster />
        <OfflineIndicator />
        <InstallPrompt />
      </ThemeProvider>
    </ErrorBoundary>
  );
}