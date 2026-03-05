"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function EntranceOverlay() {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check if user has seen intro
    const seen = localStorage.getItem("hasSeenIntro");
    if (seen === "true") {
      setIsVisible(false);
      return;
    }

    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  const handleEnter = () => {
    localStorage.setItem("hasSeenIntro", "true");
    setIsVisible(false);
  };

  // Auto-enter after loading completes
  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        handleEnter();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black"
        >
          {/* Animated background grid */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          </div>

          {/* Main content */}
          <div className="relative z-10 text-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <h1 className="mb-6 font-serif text-7xl md:text-9xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                Douglas Mitchell
              </h1>
              <p className="text-xl md:text-2xl text-gray-400 mb-12 font-light tracking-wider">
                Author • Storyteller • Visionary
              </p>
            </motion.div>

            {/* Loading bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="w-64 md:w-96 mx-auto"
            >
              <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-4">
                <motion.div
                  className="h-full bg-gradient-to-r from-white to-gray-400"
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-sm text-gray-500">
                {progress < 100 ? "Loading experience..." : "Ready"}
              </p>
            </motion.div>

            {/* Enter button (appears when loaded) */}
            {progress === 100 && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleEnter}
                className="mt-12 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-full text-white font-light tracking-wider transition-all duration-300 hover:scale-105"
              >
                Enter
              </motion.button>
            )}
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: progress === 100 ? 1 : 0 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <ChevronDown className="w-6 h-6 text-white/50" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
