"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const HOLD_MS = 2000;

interface EntranceOverlayProps {
  onComplete?: () => void;
}

// ─── Animated SVG monogram ────────────────────────────────────────────────────
function IsekaiMonogram() {
  const outerR = 85;
  const outerC = +(2 * Math.PI * outerR).toFixed(2); // ≈5 34.07

  const ticks = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * 45 - 90) * (Math.PI / 180);
    return {
      x1: 100 + (outerR - 13) * Math.cos(angle),
      y1: 100 + (outerR - 13) * Math.sin(angle),
      x2: 100 + (outerR - 4) * Math.cos(angle),
      y2: 100 + (outerR - 4) * Math.sin(angle),
    };
  });

  const cardinals = [0, 90, 180, 270].map((deg) => {
    const rad = (deg - 90) * (Math.PI / 180);
    return { cx: 100 + outerR * Math.cos(rad), cy: 100 + outerR * Math.sin(rad) };
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.78 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.12, duration: 0.82, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: "relative", width: 190, height: 190, flexShrink: 0 }}
    >
      {/*
        CSS keyframes are embedded here so the spin + pulse animations run
        independently of framer-motion’s transform pipeline, avoiding the
        SVG transform-origin conflict that breaks rotation pivot points.
      */}
      <style>{`
        @keyframes ei-spin-cw {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes ei-spin-ccw {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes ei-pulse-out {
          0%   { transform: scale(1);    opacity: 0.38; }
          100% { transform: scale(1.73); opacity: 0; }
        }
        .ei-ring-cw {
          transform-origin: 100px 100px;
          transform-box: view-box;
          animation: ei-spin-cw 22s linear 1.08s infinite;
        }
        .ei-ring-ccw {
          transform-origin: 100px 100px;
          transform-box: view-box;
          animation: ei-spin-ccw 14s linear 0.52s infinite;
        }
        .ei-pulse-ring {
          transform-origin: center;
          transform-box: fill-box;
          animation: ei-pulse-out 2.2s ease-out 1.1s infinite;
          opacity: 0;
        }
      `}</style>

      {/* Pulsing ambient glow halo (div, not SVG — no transform-box conflict) */}
      <motion.div
        animate={{ opacity: [0.32, 0.7, 0.32], scale: [1, 1.12, 1] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(217,119,6,0.32) 0%, transparent 68%)",
          filter: "blur(22px)",
          pointerEvents: "none",
        }}
      />

      <svg
        viewBox="0 0 200 200"
        width="190"
        height="190"
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          <radialGradient id="ei-inner-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#1c0e04" stopOpacity="0.97" />
            <stop offset="100%" stopColor="#060402" stopOpacity="0.99" />
          </radialGradient>
          <filter id="ei-text-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="ei-dot-glow" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="2.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Expand-pulse ring — CSS animated, plain <circle> ── */}
        <circle
          cx="100" cy="100" r="52"
          fill="none"
          stroke="rgba(217,119,6,0.38)"
          strokeWidth="1"
          className="ei-pulse-ring"
        />

        {/*
          ── Outer dashed ring ──
          Spin: plain <g className="ei-ring-cw"> → CSS transform
          Draw: framer-motion <motion.circle> → strokeDashoffset only
          Keeping on separate elements prevents transform conflicts.
        */}
        <g className="ei-ring-cw">
          <motion.circle
            cx="100" cy="100"
            r={outerR}
            fill="none"
            stroke="rgba(251,191,36,0.44)"
            strokeWidth="0.85"
            strokeDasharray="6 3.5"
            initial={{ strokeDashoffset: outerC, opacity: 0 }}
            animate={{ strokeDashoffset: 0, opacity: 1 }}
            transition={{
              strokeDashoffset: { delay: 0.18, duration: 0.9, ease: [0.22, 1, 0.36, 1] },
              opacity:          { delay: 0.18, duration: 0.28 },
            }}
          />
        </g>

        {/*
          ── Inner counter-rotating dashed ring ──
          Spin: plain <g className="ei-ring-ccw"> → CSS transform
          Opacity: framer-motion on inner <motion.circle>
        */}
        <g className="ei-ring-ccw">
          <motion.circle
            cx="100" cy="100" r="65"
            fill="none"
            stroke="rgba(180,83,9,0.3)"
            strokeWidth="0.55"
            strokeDasharray="3 7"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.52, duration: 0.38 }}
          />
        </g>

        {/* ── Frosted inner disc ── */}
        <motion.circle
          cx="100" cy="100" r="52"
          fill="url(#ei-inner-grad)"
          stroke="rgba(251,191,36,0.15)"
          strokeWidth="0.75"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.28, duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />

        {/* ── 8 tick marks — opacity only (avoids transform-box complications) ── */}
        {ticks.map((t, i) => (
          <motion.line
            key={i}
            x1={t.x1} y1={t.y1}
            x2={t.x2} y2={t.y2}
            stroke={i % 2 === 0 ? "rgba(251,191,36,0.78)" : "rgba(251,191,36,0.3)"}
            strokeWidth={i % 2 === 0 ? 1.2 : 0.65}
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 + i * 0.05, duration: 0.22 }}
          />
        ))}

        {/* ── 4 cardinal amber dots ── */}
        {cardinals.map((c, i) => (
          <motion.circle
            key={i}
            cx={c.cx} cy={c.cy} r="3"
            fill="rgba(251,191,36,0.92)"
            filter="url(#ei-dot-glow)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.9 + i * 0.07, duration: 0.3, ease: "backOut" }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          />
        ))}

        {/* ── Central ‘S’ in Fraunces serif ── */}
        <motion.text
          x="97" y="116"
          textAnchor="middle"
          fill="rgba(255,255,255,0.95)"
          fontSize="58"
          fontFamily="var(--font-fraunces, Georgia, serif)"
          fontWeight="700"
          filter="url(#ei-text-glow)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.42, duration: 0.6 }}
          style={{ letterSpacing: "-0.02em" }}
        >
          S
        </motion.text>

        {/* ── ·I subscript in IBM Plex ── */}
        <motion.text
          x="125" y="109"
          textAnchor="start"
          fill="rgba(251,191,36,0.68)"
          fontSize="17"
          fontFamily="var(--font-ibm-plex, monospace)"
          fontWeight="400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.76, duration: 0.45 }}
        >
          ·I
        </motion.text>
      </svg>
    </motion.div>
  );
}

// ─── Main overlay ─────────────────────────────────────────────────────────────
export function EntranceOverlay({ onComplete }: EntranceOverlayProps) {
  const [visible, setVisible] = useState(false);
  const barRef  = useRef<HTMLDivElement>(null);
  const numRef  = useRef<HTMLSpanElement>(null);
  const rafRef  = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("senpai-intro-seen") === "true") {
      onComplete?.();
      return;
    }
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, [onComplete]);

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
                "radial-gradient(circle at 34% 40%, rgba(217,119,6,0.12) 0%, transparent 55%), " +
                "radial-gradient(circle at 68% 62%, rgba(180,83,9,0.08) 0%, transparent 50%)",
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

          {/* ── Center stack ── */}
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
              textAlign: "center",
            }}
          >
            {/* “Welcome to” eyebrow */}
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.15em" }}
              animate={{ opacity: 0.65, letterSpacing: "0.42em" }}
              transition={{ delay: 0.08, duration: 0.95 }}
              style={{
                fontFamily: "var(--font-ibm-plex, monospace)",
                fontSize: "0.62rem",
                textTransform: "uppercase",
                color: "rgba(251,191,36,0.65)",
                margin: 0,
              }}
            >
              Welcome to
            </motion.p>

            {/* Animated SVG monogram */}
            <IsekaiMonogram />

            {/* Main title — clipped slide-up */}
            <div style={{ overflow: "hidden", paddingBottom: 4 }}>
              <motion.h1
                initial={{ y: 72, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.38, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontFamily: "var(--font-fraunces, Georgia, serif)",
                  fontSize: "clamp(2.4rem, 8vw, 5rem)",
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
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 0.7, y: 0 }}
              transition={{ delay: 0.7, duration: 0.65, ease: "easeOut" }}
              style={{
                fontFamily: "var(--font-manrope, sans-serif)",
                fontSize: "clamp(0.62rem, 1.8vw, 0.78rem)",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
                margin: 0,
              }}
            >
              Open-Source Humanity
            </motion.p>

            {/* Handwritten sub-tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.48 }}
              transition={{ delay: 0.92, duration: 0.55 }}
              style={{
                fontFamily: "var(--font-caveat, cursive)",
                fontSize: "clamp(1.05rem, 3vw, 1.45rem)",
                color: "rgba(251,191,36,0.5)",
                margin: 0,
                marginTop: -2,
              }}
            >
              ~ Thee Strongest ~
            </motion.p>
          </div>

          {/* ── rAF progress bar ── */}
          <div
            style={{
              position: "absolute",
              bottom: "7.5%",
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
              animate={{ opacity: 0.4 }}
              transition={{ delay: 0.38 }}
              style={{
                fontFamily: "var(--font-ibm-plex, monospace)",
                fontSize: "0.58rem",
                letterSpacing: "0.22em",
                color: "rgba(251,191,36,0.68)",
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
