"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, VolumeX, RotateCcw, Play, Pause } from "lucide-react";

interface EntranceOverlayProps {
  onComplete?: () => void;
}

type AnimationPhase = "intro" | "title" | "tagline" | "loading" | "complete";

export function EntranceOverlay({ onComplete }: EntranceOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>("intro");
  const [typedTagline, setTypedTagline] = useState("");
  const [showReplay, setShowReplay] = useState(false);
  const [letterboxOpen, setLetterboxOpen] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Array<{ x: number; y: number; size: number; speed: number; opacity: number; color: string; angle: number }>>([]);

  const fullTagline = "~ Thee Strongest ~";
  const totalDuration = 5500; // Total intro duration in ms

  // Initialize particles
  useEffect(() => {
    const colors = [
      "rgba(251, 191, 36, 0.6)",    // amber
      "rgba(253, 224, 71, 0.5)",    // yellow
      "rgba(255, 237, 213, 0.4)",   // orange light
      "rgba(217, 119, 6, 0.4)",     // amber dark
      "rgba(254, 243, 199, 0.5)",   // amber light
    ];

    particlesRef.current = Array.from({ length: 60 }, () => ({
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
      y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
      size: Math.random() * 4 + 1,
      speed: Math.random() * 0.5 + 0.2,
      opacity: Math.random() * 0.6 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: Math.random() * Math.PI * 2,
    }));
  }, []);

  // Check if user has seen the intro
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem("senpai-intro-seen");
    
    if (!hasSeenIntro) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setShowReplay(true);
      // Immediately call onComplete if already seen
      setTimeout(() => onComplete?.(), 0);
    }
  }, [onComplete]);

  // Enable skip after 1.5 seconds
  useEffect(() => {
    const skipTimer = setTimeout(() => {
      setCanSkip(true);
    }, 1500);
    return () => clearTimeout(skipTimer);
  }, []);

  // Animation phases
  useEffect(() => {
    if (!isVisible || isExiting) return;

    const phaseTimers: NodeJS.Timeout[] = [];
    
    phaseTimers.push(setTimeout(() => setAnimationPhase("title"), 500));
    phaseTimers.push(setTimeout(() => setAnimationPhase("tagline"), 1500));
    phaseTimers.push(setTimeout(() => setAnimationPhase("loading"), 2500));
    phaseTimers.push(setTimeout(() => setAnimationPhase("complete"), totalDuration));

    return () => phaseTimers.forEach(clearTimeout);
  }, [isVisible, isExiting]);

  // Typing effect for tagline
  useEffect(() => {
    if (animationPhase !== "tagline") return;

    let index = 0;
    const typingInterval = setInterval(() => {
      if (index <= fullTagline.length) {
        setTypedTagline(fullTagline.slice(0, index));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 80);

    return () => clearInterval(typingInterval);
  }, [animationPhase]);

  // Progress percentage
  useEffect(() => {
    if (!isVisible || isExiting) return;

    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const percentage = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(percentage);
    }, 50);

    return () => clearInterval(progressInterval);
  }, [isVisible, isExiting]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;
      
      if (e.key === "Enter") {
        handleClose();
      } else if (e.key === " ") {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, isMuted, canSkip]);

  // Play sound effect
  const playSound = useCallback((type: "whoosh" | "typing" | "complete") => {
    if (isMuted || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === "whoosh") {
      oscillator.frequency.setValueAtTime(200, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } else if (type === "typing") {
      oscillator.frequency.setValueAtTime(800 + Math.random() * 400, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.03, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.05);
    } else if (type === "complete") {
      oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.5);
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    }
  }, [isMuted]);

  // Initialize audio context
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
    };

    if (isVisible) {
      initAudio();
    }
  }, [isVisible]);

  // Play complete sound when animation finishes
  useEffect(() => {
    if (animationPhase === "complete" && !isExiting) {
      playSound("complete");
    }
  }, [animationPhase, isExiting, playSound]);

  const handleClose = useCallback(() => {
    if (isExiting) return;
    
    setIsExiting(true);
    setLetterboxOpen(true);
    playSound("whoosh");
    
    setTimeout(() => {
      setIsVisible(false);
      localStorage.setItem("senpai-intro-seen", "true");
      setShowReplay(true);
      onComplete?.();
    }, 800);
  }, [isExiting, onComplete, playSound]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const handleReplay = useCallback(() => {
    setShowReplay(false);
    setProgress(0);
    setTypedTagline("");
    setAnimationPhase("intro");
    setCanSkip(false);
    setIsExiting(false);
    setLetterboxOpen(false);
    localStorage.removeItem("senpai-intro-seen");
    
    setTimeout(() => {
      setIsVisible(true);
      setTimeout(() => setCanSkip(true), 1500);
    }, 100);
  }, []);

  return (
    <>
      {/* Replay Button - Always visible when intro was seen */}
      <AnimatePresence>
        {showReplay && !isVisible && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleReplay}
            className="fixed bottom-4 left-4 z-[90] flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm border border-white/20 rounded-full text-white/70 hover:text-white hover:border-white/40 transition-all duration-300 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Replay Intro</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Overlay */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden pointer-events-auto"
          >
            {/* Film grain overlay */}
            <div 
              className="absolute inset-0 pointer-events-none z-50 opacity-[0.15]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
              }}
            />

            {/* Cinematic letterbox bars */}
            <motion.div
              initial={{ height: "15%" }}
              animate={{ height: letterboxOpen ? "0%" : "15%" }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              className="absolute top-0 left-0 right-0 bg-black z-40"
            />
            <motion.div
              initial={{ height: "15%" }}
              animate={{ height: letterboxOpen ? "0%" : "15%" }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              className="absolute bottom-0 left-0 right-0 bg-black z-40"
            />

            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Enhanced particle field */}
              <div className="absolute inset-0">
                {particlesRef.current.map((particle, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      opacity: 0,
                      x: particle.x,
                      y: particle.y,
                      scale: 0
                    }}
                    animate={{ 
                      opacity: [0, particle.opacity, 0],
                      scale: [0.5, 1, 0.5],
                      x: [particle.x, particle.x + Math.cos(particle.angle) * 50],
                      y: [particle.y, particle.y + Math.sin(particle.angle) * 50]
                    }}
                    transition={{
                      duration: 4 + Math.random() * 3,
                      repeat: Infinity,
                      delay: Math.random() * 3
                    }}
                    style={{
                      width: particle.size,
                      height: particle.size,
                      backgroundColor: particle.color,
                      boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                    }}
                    className="absolute rounded-full"
                  />
                ))}
              </div>
              
              {/* Radial gradient overlay */}
              <div 
                className="absolute inset-0" 
                style={{ background: "radial-gradient(ellipse 70% 50% at center, transparent 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.95) 100%)" }}
              />

              {/* Subtle scan lines */}
              <div 
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)"
                }}
              />
            </div>

            {/* Logo Animation Container */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: isExiting ? 1.1 : 1, opacity: isExiting ? 0 : 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-center relative"
              >
                {/* Blurred dark background behind logo */}
                <div 
                  className="absolute left-1/2 top-1/2 w-[400px] h-[350px] md:w-[600px] md:h-[500px] rounded-full"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0.3) 70%, transparent 85%)',
                    filter: 'blur(30px)',
                    transform: 'translate(-50%, -50%)'
                  }}
                />

                {/* Decorative rings */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] md:w-[450px] md:h-[450px]"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="w-full h-full rounded-full border border-amber-200/20"
                    style={{ boxShadow: "inset 0 0 30px rgba(251, 191, 36, 0.1)" }}
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-4 rounded-full border border-amber-200/15"
                  />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-8 rounded-full border border-amber-200/10"
                  />
                  {/* Inner glow ring */}
                  <motion.div
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-12 rounded-full border border-amber-400/20"
                    style={{ boxShadow: "0 0 20px rgba(251, 191, 36, 0.15)" }}
                  />
                </motion.div>

                {/* Main Title - Phase 1 */}
                <AnimatePresence>
                  {(animationPhase === "title" || animationPhase === "tagline" || animationPhase === "loading" || animationPhase === "complete") && (
                    <motion.div
                      initial={{ y: 60, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -30, opacity: 0 }}
                      transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                    >
                      <motion.span
                        initial={{ opacity: 0, x: -40, filter: "blur(10px)" }}
                        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                        transition={{ delay: 0.2, duration: 0.9 }}
                        className="block text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white tracking-tight"
                        style={{ textShadow: "0 0 80px rgba(251, 191, 36, 0.4), 0 0 40px rgba(251, 191, 36, 0.2)" }}
                      >
                        Senpai&apos;s
                      </motion.span>
                      <motion.span
                        initial={{ opacity: 0, x: 40, filter: "blur(10px)" }}
                        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                        transition={{ delay: 0.4, duration: 0.9 }}
                        className="block text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-amber-200/90 tracking-tight"
                        style={{ textShadow: "0 0 80px rgba(251, 191, 36, 0.5), 0 0 40px rgba(251, 191, 36, 0.3)" }}
                      >
                        Isekai
                      </motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Subtitle */}
                <AnimatePresence>
                  {(animationPhase === "title" || animationPhase === "tagline" || animationPhase === "loading" || animationPhase === "complete") && (
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.7 }}
                      className="mt-5 text-lg md:text-xl text-white/60 font-light tracking-[0.3em]"
                    >
                      Open-Source Humanity
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Animated Tagline with typing effect */}
                <AnimatePresence>
                  {(animationPhase === "tagline" || animationPhase === "loading" || animationPhase === "complete") && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-3"
                    >
                      <p className="font-handwritten text-2xl md:text-3xl text-amber-200/60 min-h-[40px]">
                        {typedTagline}
                        {animationPhase === "tagline" && typedTagline.length < fullTagline.length && (
                          <motion.span
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="inline-block w-[3px] h-[24px] bg-amber-200/60 ml-1 align-middle"
                          />
                        )}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Progress bar with percentage */}
                <AnimatePresence>
                  {(animationPhase === "loading" || animationPhase === "complete") && !isExiting && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4 }}
                      className="mt-10"
                    >
                      {/* Progress bar */}
                      <div className="w-64 md:w-72 mx-auto">
                        <div className="h-0.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
                          <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.1 }}
                            className="h-full bg-gradient-to-r from-amber-400/60 via-amber-200 to-amber-400/60 rounded-full"
                            style={{ boxShadow: "0 0 10px rgba(251, 191, 36, 0.5)" }}
                          />
                        </div>
                        
                        {/* Percentage and loading text */}
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-white/40 text-xs font-mono tracking-wider">
                            LOADING EXPERIENCE
                          </span>
                          <span className="text-amber-200/70 text-sm font-mono font-medium">
                            {Math.round(progress)}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Enter button */}
                <AnimatePresence>
                  {(animationPhase === "complete" || canSkip) && !isExiting && (
                    <motion.button
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5 }}
                      onClick={handleClose}
                      className="mt-8 px-10 py-3.5 bg-gradient-to-r from-amber-400/20 via-amber-200/30 to-amber-400/20 border border-amber-200/40 rounded-full text-white text-sm tracking-[0.2em] font-medium hover:from-amber-400/30 hover:via-amber-200/40 hover:to-amber-400/30 hover:border-amber-200/60 transition-all duration-500 backdrop-blur-sm group relative overflow-hidden"
                    >
                      <span className="relative z-10">ENTER WORLD</span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                      />
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Corner decorations with enhanced animation */}
            {["top-left", "top-right", "bottom-left", "bottom-right"].map((position, i) => {
              const isTop = position.includes("top");
              const isLeft = position.includes("left");
              return (
                <motion.div
                  key={position}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                  className={`absolute ${isTop ? 'top-6 md:top-8' : 'bottom-6 md:bottom-8'} ${isLeft ? 'left-6 md:left-8' : 'right-6 md:right-8'} w-12 h-12 md:w-16 md:h-16`}
                >
                  <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                    className={`absolute ${isTop ? 'top-0' : 'bottom-0'} ${isLeft ? 'left-0' : 'right-0'} w-full h-px bg-gradient-to-r ${isLeft ? 'from-amber-200/40 to-transparent' : 'from-transparent to-amber-200/40'}`}
                  />
                  <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 + 0.2 }}
                    className={`absolute ${isLeft ? 'left-0' : 'right-0'} ${isTop ? 'top-0' : 'bottom-0'} w-px h-full bg-gradient-to-b ${isTop ? 'from-amber-200/40 to-transparent' : 'from-transparent to-amber-200/40'}`}
                  />
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className={`absolute ${isTop ? 'top-0' : 'bottom-0'} ${isLeft ? 'left-0' : 'right-0'} w-2 h-2 border-amber-200/50 ${isTop && isLeft ? 'border-l border-t' : isTop && !isLeft ? 'border-r border-t' : !isTop && isLeft ? 'border-l border-b' : 'border-r border-b'}`}
                  />
                </motion.div>
              );
            })}

            {/* Bottom controls */}
            <div className="absolute bottom-6 md:bottom-8 left-0 right-0 flex justify-between items-center px-6 md:px-10">
              {/* Left controls - Sound */}
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleMute}
                  className="flex items-center gap-2 text-white/50 hover:text-white transition-colors duration-300 text-sm group"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  ) : (
                    <Volume2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  )}
                  <span className="hidden md:inline">Sound {isMuted ? 'Off' : 'On'}</span>
                </button>
                
                {/* Keyboard hint */}
                <span className="hidden md:flex items-center gap-1 text-white/30 text-xs">
                  <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono">SPACE</kbd>
                  <span>toggle</span>
                </span>
              </div>

              {/* Right controls - Skip */}
              <div className="flex items-center gap-4">
                {/* Keyboard hint */}
                <span className="hidden md:flex items-center gap-1 text-white/30 text-xs">
                  <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono">ENTER</kbd>
                  <span>skip</span>
                </span>
                
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: canSkip ? 1 : 0.3 }}
                  onClick={handleClose}
                  disabled={!canSkip}
                  className="flex items-center gap-2 text-white/50 hover:text-white transition-colors duration-300 text-sm group"
                >
                  <span>Skip Intro</span>
                  <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
