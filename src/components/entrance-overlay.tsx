"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, VolumeX } from "lucide-react";

interface EntranceOverlayProps {
  onComplete?: () => void;
  videoSrc?: string;
  minDurationMs?: number;
}

export function EntranceOverlay({
  onComplete,
  videoSrc = "/videos/entrance-hero.mp4",
  minDurationMs = 6500,
}: EntranceOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [canDismiss, setCanDismiss] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem("senpai-intro-seen");
    if (!hasSeenIntro) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 120);
      return () => clearTimeout(timer);
    }
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    if (!isVisible) return;
    const startedAt = Date.now();
    const dismissTimer = setTimeout(() => {
      setCanDismiss(true);
    }, minDurationMs);

    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setProgress(Math.min((elapsed / minDurationMs) * 100, 100));
    }, 80);

    return () => {
      clearTimeout(dismissTimer);
      clearInterval(progressTimer);
    };
  }, [isVisible, minDurationMs]);

  const closeIntro = () => {
    if (!canDismiss) return;
    setIsVisible(false);
    localStorage.setItem("senpai-intro-seen", "true");
    setTimeout(() => {
      onComplete?.();
    }, 450);
  };

  useEffect(() => {
    if (videoEnded && canDismiss) closeIntro();
  }, [videoEnded, canDismiss]);

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          className="fixed inset-0 z-[100] bg-black"
        >
          {!videoError && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              preload="auto"
              muted={isMuted}
              onEnded={() => setVideoEnded(true)}
              onError={() => setVideoError(true)}
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          )}

          {videoError && (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(120,53,15,0.45)_0%,_rgba(0,0,0,1)_72%)]" />
          )}

          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/90" />

          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 0,
                  x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1920),
                  y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 1080),
                }}
                animate={{
                  opacity: [0, 0.45, 0],
                  y: [0, (Math.random() - 0.5) * 40],
                }}
                transition={{
                  duration: 4 + Math.random() * 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
                className="absolute w-1.5 h-1.5 bg-amber-200/40 rounded-full"
              />
            ))}
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9 }}
              className="text-center px-6"
            >
              <motion.p
                initial={{ letterSpacing: "0.2em", opacity: 0 }}
                animate={{ letterSpacing: "0.45em", opacity: 0.9 }}
                transition={{ delay: 0.25, duration: 1.1 }}
                className="text-xs md:text-sm uppercase text-amber-100/80 mb-5 tracking-[0.45em]"
              >
                Welcome to
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.9 }}
                className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white"
                style={{ textShadow: "0 8px 45px rgba(0,0,0,0.6)" }}
              >
                Senpai&apos;s Isekai
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 0.8, y: 0 }}
                transition={{ delay: 0.95, duration: 0.7 }}
                className="mt-4 text-base md:text-xl text-white/80 tracking-[0.22em] uppercase"
              >
                Open-Source Humanity
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-8 mx-auto w-64"
              >
                <div className="h-1 rounded-full bg-white/15 overflow-hidden">
                  <motion.div
                    style={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-amber-500/80 to-amber-200"
                  />
                </div>
                <p className="mt-2 text-[11px] text-white/45 tracking-[0.2em] uppercase">
                  loading experience
                </p>
              </motion.div>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: canDismiss ? 1 : 0.4, y: 0 }}
                transition={{ delay: 1.4, duration: 0.4 }}
                onClick={closeIntro}
                disabled={!canDismiss}
                className="mt-7 px-7 py-2.5 rounded-full border border-white/35 text-white/85 text-sm tracking-[0.2em] uppercase hover:bg-white/10 disabled:cursor-not-allowed transition-all"
              >
                enter world
              </motion.button>
            </motion.div>
          </div>

          <button
            onClick={toggleMute}
            className="absolute bottom-8 left-8 text-white/65 hover:text-white transition-colors duration-300"
            aria-label="Toggle intro sound"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: canDismiss ? 1 : 0.35 }}
            onClick={closeIntro}
            disabled={!canDismiss}
            className="absolute bottom-8 right-8 flex items-center gap-2 text-white/65 hover:text-white transition-colors duration-300 text-sm disabled:cursor-not-allowed"
          >
            <span>Skip Intro</span>
            <X className="w-4 h-4" />
          </motion.button>

          <div className="absolute top-8 left-8 w-14 h-14 border-l border-t border-amber-200/40" />
          <div className="absolute top-8 right-8 w-14 h-14 border-r border-t border-amber-200/40" />
          <div className="absolute bottom-8 left-8 w-14 h-14 border-l border-b border-amber-200/40" />
          <div className="absolute bottom-8 right-8 w-14 h-14 border-r border-b border-amber-200/40" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
