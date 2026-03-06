"use client";

import { motion } from "framer-motion";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="mx-auto w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6"
        >
          <WifiOff className="w-12 h-12 text-muted-foreground" />
        </motion.div>

        <h1 className="text-3xl font-bold mb-2">You're Offline</h1>
        <p className="text-muted-foreground mb-8">
          It looks like you've lost your internet connection. 
          Some content may not be available until you're back online.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRetry}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </motion.button>
          <Link href="/">
            <motion.span
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4" />
              Go Home
            </motion.span>
          </Link>
        </div>

        <div className="mt-12 p-4 rounded-lg bg-muted/50">
          <h2 className="font-semibold mb-2">What you can do:</h2>
          <ul className="text-sm text-muted-foreground text-left space-y-2">
            <li>• Check your internet connection</li>
            <li>• Try refreshing the page</li>
            <li>• Some pages may be available from cache</li>
            <li>• Your form submissions will be synced when you're back online</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}