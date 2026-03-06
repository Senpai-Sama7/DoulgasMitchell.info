"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error caught by boundary:", error, errorInfo);
    }
    
    // TODO: Send to error monitoring service in production
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onReset?.();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          onGoHome={this.handleGoHome}
          showDetails={this.props.showDetails ?? process.env.NODE_ENV === "development"}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  onReset: () => void;
  onGoHome: () => void;
  showDetails: boolean;
}

function ErrorFallback({ error, errorInfo, onReset, onGoHome, showDetails }: ErrorFallbackProps) {
  const [showStack, setShowStack] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[400px] flex items-center justify-center p-8"
    >
      <div className="max-w-lg w-full">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="glass-card p-8 text-center"
        >
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6"
          >
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </motion.div>

          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6">
            We encountered an unexpected error. Please try again or return to the home page.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onReset}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onGoHome}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <Home className="w-4 h-4" />
              Go Home
            </motion.button>
          </div>

          {showDetails && error && (
            <div className="text-left">
              <button
                onClick={() => setShowStack(!showStack)}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
              >
                <Bug className="w-4 h-4" />
                {showStack ? "Hide" : "Show"} Error Details
              </button>

              <AnimatePresence>
                {showStack && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-muted/50 rounded-lg p-4 text-xs font-mono overflow-auto max-h-48">
                      <p className="text-destructive font-semibold mb-2">{error.name}: {error.message}</p>
                      {errorInfo?.componentStack && (
                        <pre className="text-muted-foreground whitespace-pre-wrap">
                          {errorInfo.componentStack}
                        </pre>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

// Lightweight inline error component
interface InlineErrorProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function InlineError({ message = "Something went wrong", onRetry, className }: InlineErrorProps) {
  return (
    <div className={cn("flex items-center gap-3 p-4 rounded-lg bg-destructive/10 text-destructive", className)}>
      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm flex-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm underline hover:no-underline"
        >
          Retry
        </button>
      )}
    </div>
  );
}

// Async error boundary wrapper for use with Suspense
export function AsyncErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center min-h-[200px]">
          <InlineError message="Failed to load content" />
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export { ErrorBoundary };
