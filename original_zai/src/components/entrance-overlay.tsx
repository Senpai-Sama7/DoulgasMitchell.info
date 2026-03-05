"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, VolumeX } from "lucide-react";

interface EntranceOverlayProps {
  onComplete?: () => void;
}

export function EntranceOverlay({ onComplete }: EntranceOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user has seen the intro
    const hasSeenIntro = localStorage.getItem("senpai-intro-seen");
    
    if (!hasSeenIntro) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      onComplete?.();
    }
  }, [onComplete]);

  useEffect(() => {
    // Enable skip after 2 seconds
    const skipTimer = setTimeout(() => {
      setCanSkip(true);
    }, 2000);

    return () => clearTimeout(skipTimer);
  }, []);

  const handleClose = () => {
    if (!canSkip) return;
    
    setIsVisible(false);
    localStorage.setItem("senpai-intro-seen", "true");
    
    setTimeout(() => {
      onComplete?.();
    }, 500);
  };

  const handleVideoEnd = () => {
    handleClose();
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
        >
          {/* Video Container */}
          <div className="relative w-full h-full">
            {/* Animated Background - Clear particle field */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Particle field - no blur */}
              <div className="absolute inset-0">
                {[...Array(40)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      opacity: 0,
                      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
                      y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080)
                    }}
                    animate={{ 
                      opacity: [0, 0.6, 0],
                      scale: [0.5, 1.2, 0.5]
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2
                    }}
                    className="absolute w-1.5 h-1.5 md:w-2 md:h-2 bg-amber-200/40 rounded-full"
                  />
                ))}
              </div>
              
              {/* Subtle vignette */}
              <div 
                className="absolute inset-0" 
                style={{ background: "radial-gradient(ellipse 80% 60% at center, transparent 0%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.9) 100%)" }}
              />
            </div>

            {/* Logo Animation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-center relative"
              >
                {/* Blurred dark background behind logo */}
                <div 
                  className="absolute left-1/2 top-1/2 w-[400px] h-[350px] md:w-[550px] md:h-[450px] rounded-full"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0.4) 70%, transparent 85%)',
                    filter: 'blur(25px)',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                {/* Extra dark core for maximum readability */}
                <div 
                  className="absolute left-1/2 top-1/2 w-[280px] h-[200px] md:w-[380px] md:h-[280px] rounded-full"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 50%, transparent 80%)',
                    filter: 'blur(15px)',
                    transform: 'translate(-50%, -50%)'
                  }}
                />
                {/* Decorative ring */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[400px] md:h-[400px]"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-full h-full rounded-full border border-amber-200/20"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-4 rounded-full border border-amber-200/15"
                  />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-8 rounded-full border border-amber-200/10"
                  />
                </motion.div>

                {/* Main Title */}
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                >
                  <motion.span
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="block text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white tracking-tight"
                    style={{ textShadow: "0 0 60px rgba(251, 191, 36, 0.3)" }}
                  >
                    Senpai&apos;s
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="block text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-amber-200/80 tracking-tight"
                    style={{ textShadow: "0 0 60px rgba(251, 191, 36, 0.4)" }}
                  >
                    Isekai
                  </motion.span>
                </motion.div>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5, duration: 0.8 }}
                  className="mt-4 text-lg md:text-xl text-white/60 font-light tracking-widest"
                >
                  Open-Source Humanity
                </motion.p>

                {/* Handwritten tagline */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2, duration: 1 }}
                  className="mt-2 font-handwritten text-2xl md:text-3xl text-amber-200/50"
                >
                  ~ Thee Strongest ~
                </motion.p>

                {/* Loading bar */}
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 2.5, duration: 0.5 }}
                  className="mt-8 mx-auto w-52 relative"
                >
                  {/* Loading bar background */}
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 2.5, duration: 2.5, ease: "easeInOut" }}
                      className="h-full bg-gradient-to-r from-amber-400/60 via-amber-200 to-amber-400/60 rounded-full"
                      onAnimationComplete={handleClose}
                    />
                  </div>
                  {/* Loading text */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: 2.5 }}
                    className="text-white/40 text-xs mt-2 font-mono tracking-wider"
                  >
                    LOADING EXPERIENCE...
                  </motion.p>
                </motion.div>

                {/* Enter button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3, duration: 0.5 }}
                  onClick={handleClose}
                  className="mt-8 px-8 py-3 border border-white/30 rounded-full text-white/80 text-sm tracking-wider hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
                >
                  ENTER WORLD
                </motion.button>
              </motion.div>
            </div>

            {/* Corner decorations */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-amber-200/30"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-amber-200/30"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-amber-200/30"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-amber-200/30"
            />

            {/* Skip button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: canSkip ? 1 : 0.3 }}
              onClick={handleClose}
              disabled={!canSkip}
              className="absolute bottom-8 right-8 md:bottom-12 md:right-12 flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-300 text-sm"
            >
              <span>Skip Intro</span>
              <X className="w-4 h-4" />
            </motion.button>

            {/* Sound toggle */}
            <button
              onClick={toggleMute}
              className="absolute bottom-8 left-8 md:bottom-12 md:left-12 text-white/60 hover:text-white transition-colors duration-300"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
