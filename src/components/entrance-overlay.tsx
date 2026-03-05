"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const HOLD_MS = 2000;

interface EntranceOverlayProps {
  onComplete?: () => void;
}

export function EntranceOverlay({ onComplete }: EntranceOverlayProps) {
  const [visible, setVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  // Session gate: only show once per browser session
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("senpai-intro-seen") === "true") {
      onComplete?.();
      return;
    }
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, [onComplete]);

  // rAF-driven progress — zero React re-renders during animation
  useEffect(() => {
    if (!visible) return;
    startRef.current = 0;

    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const p = Math.min(((now - startRef.current) / HOLD_MS) * 100, 100);
      if (barRef.current) barRef.current.style.width = `${p}%`;
      if (numRef.current)
        numRef.current.textContent = Math.round(p).toString().padStart(3, "0");
      if (p < 100) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setVisible(false);
          localStorage.setItem("senpai-intro-seen", "true");
          setTimeout(() => onComplete?.(), 480);
        }, 60);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [visible, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="senpai-entrance-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            userSelect: "none",
            background:
              "radial-gradient(ellipse 110% 80% at 50% 55%, #1c0e04 0%, #0d0805 45%, #000000 100%)",
          }}
        >
          {/* Ambient amber glow orbs */}
          <div
            style={{
              pointerEvents: "none",
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 34% 40%, rgba(217,119,6,0.13) 0%, transparent 55%), " +
                "radial-gradient(circle at 68% 62%, rgba(180,83,9,0.09) 0%, transparent 50%)",
            }}
          />

          {/* Fine grain noise texture */}
          <div
            style={{
              pointerEvents: "none",
              position: "absolute",
              inset: 0,
              opacity: 0.04,
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")",
              backgroundSize: "300px 300px",
            }}
          />

          {/* Signature corner brackets */}
          <div style={{ position: "absolute", top: 28, left: 28, width: 52, height: 52, borderTop: "1px solid rgba(251,191,36,0.32)", borderLeft: "1px solid rgba(251,191,36,0.32)" }} />
          <div style={{ position: "absolute", top: 28, right: 28, width: 52, height: 52, borderTop: "1px solid rgba(251,191,36,0.32)", borderRight: "1px solid rgba(251,191,36,0.32)" }} />
          <div style={{ position: "absolute", bottom: 28, left: 28, width: 52, height: 52, borderBottom: "1px solid rgba(251,191,36,0.32)", borderLeft: "1px solid rgba(251,191,36,0.32)" }} />
          <div style={{ position: "absolute", bottom: 28, right: 28, width: 52, height: 52, borderBottom: "1px solid rgba(251,191,36,0.32)", borderRight: "1px solid rgba(251,191,36,0.32)" }} />

          {/* Floating amber dust particles */}
          {([...Array(10)] as undefined[]).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.45, 0] }}
              transition={{
                duration: 2.4 + i * 0.28,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
              style={{
                position: "absolute",
                left: `${6 + i * 9}%`,
                top: `${14 + (i * 17) % 68}%`,
                width: i % 3 === 0 ? 4 : 2.5,
                height: i % 3 === 0 ? 4 : 2.5,
                borderRadius: "50%",
                background: "rgba(251,191,36,0.55)",
                pointerEvents: "none",
                boxShadow: "0 0 6px rgba(217,119,6,0.4)",
              }}
            />
          ))}

          {/* ── Center content ── */}
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 18,
              textAlign: "center",
            }}
          >
            {/* "Welcome to" eyebrow */}
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.15em" }}
              animate={{ opacity: 0.72, letterSpacing: "0.42em" }}
              transition={{ delay: 0.1, duration: 0.95 }}
              style={{
                fontFamily: "var(--font-ibm-plex, monospace)",
                fontSize: "0.65rem",
                textTransform: "uppercase",
                color: "rgba(251,191,36,0.72)",
                margin: 0,
              }}
            >
              Welcome to
            </motion.p>

            {/* Main title — clipped slide-up reveal */}
            <div style={{ overflow: "hidden", paddingBottom: 4 }}>
              <motion.h1
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.32, duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontFamily: "var(--font-fraunces, Georgia, serif)",
                  fontSize: "clamp(2.6rem, 9vw, 5.5rem)",
                  fontWeight: 700,
                  color: "#ffffff",
                  margin: 0,
                  lineHeight: 1.05,
                  textShadow: "0 8px 48px rgba(0,0,0,0.55)",
                  letterSpacing: "-0.02em",
                }}
              >
                Senpai&apos;s Isekai
              </motion.h1>
            </div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 0.72, y: 0 }}
              transition={{ delay: 0.68, duration: 0.7, ease: "easeOut" }}
              style={{
                fontFamily: "var(--font-manrope, sans-serif)",
                fontSize: "clamp(0.65rem, 2vw, 0.82rem)",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.72)",
                margin: 0,
              }}
            >
              Open-Source Humanity
            </motion.p>

            {/* Handwritten sub-tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.92, duration: 0.6 }}
              style={{
                fontFamily: "var(--font-caveat, cursive)",
                fontSize: "clamp(1.1rem, 3.5vw, 1.55rem)",
                color: "rgba(251,191,36,0.5)",
                margin: 0,
                marginTop: -4,
              }}
            >
              ~ Thee Strongest ~
            </motion.p>
          </div>

          {/* ── rAF progress bar ── */}
          <div
            style={{
              position: "absolute",
              bottom: "8.5%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 220,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 8,
            }}
          >
            <motion.span
              ref={numRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.42 }}
              transition={{ delay: 0.4 }}
              style={{
                fontFamily: "var(--font-ibm-plex, monospace)",
                fontSize: "0.58rem",
                letterSpacing: "0.22em",
                color: "rgba(251,191,36,0.7)",
                fontVariantNumeric: "tabular-nums",
                display: "block",
                textAlign: "right",
              }}
            >
              000
            </motion.span>
            <div
              style={{
                width: "100%",
                height: 1,
                background: "rgba(255,255,255,0.07)",
                borderRadius: 9999,
                overflow: "hidden",
              }}
            >
              <div
                ref={barRef}
                style={{
                  height: "100%",
                  width: "0%",
                  background:
                    "linear-gradient(90deg, rgba(180,83,9,0.55), rgba(217,119,6,1), rgba(251,191,36,0.9))",
                  borderRadius: 9999,
                  boxShadow: "0 0 8px rgba(217,119,6,0.65)",
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
