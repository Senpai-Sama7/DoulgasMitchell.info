"use client";

import { useEffect, useRef, useState } from "react";

/**
 * CinematicEntrance
 * ─────────────────────────────────────────────────────────────────────────────
 * A ~2 s cinematic video-intro overlay for douglasmitchell.info
 *
 * Timeline (ms):
 *   0        → black frame
 *   60       → letterbox bars snap in
 *   200      → "D·M" monogram fades + scales in
 *   480      → lens-sweep light streak crosses left→right
 *   680      → "DOUGLAS MITCHELL" slide-up reveals
 *   1 050    → sub-tagline fades in
 *   1 500    → hold
 *   1 700    → full-frame white flash (simulates film cut)
 *   1 900    → overlay fades to transparent → onComplete fires
 *
 * No external dependencies beyond React.
 * Drop this into your Next.js project and swap out the existing EntranceOverlay.
 */

const TOTAL_MS = 2000;

// ─── Keyframe injection ──────────────────────────────────────────────────────
const CSS = `
  @keyframes ci-bar-top {
    from { transform: translateY(-100%); }
    to   { transform: translateY(0); }
  }
  @keyframes ci-bar-bot {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
  }
  @keyframes ci-sweep {
    0%   { left: -30%; opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 0.9; }
    100% { left: 115%; opacity: 0; }
  }
  @keyframes ci-monogram-in {
    0%   { opacity: 0; transform: scale(1.18); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes ci-name-in {
    0%   { opacity: 0; transform: translateY(22px); letter-spacing: 0.55em; }
    100% { opacity: 1; transform: translateY(0);    letter-spacing: 0.28em; }
  }
  @keyframes ci-sub-in {
    from { opacity: 0; }
    to   { opacity: 0.55; }
  }
  @keyframes ci-flash {
    0%   { opacity: 0; }
    35%  { opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes ci-fade-out {
    from { opacity: 1; }
    to   { opacity: 0; }
  }
  @keyframes ci-grain {
    0%,100% { transform: translate(0,0); }
    10%     { transform: translate(-2%,-3%); }
    20%     { transform: translate(3%,1%); }
    30%     { transform: translate(-1%,3%); }
    40%     { transform: translate(2%,-1%); }
    50%     { transform: translate(-3%,2%); }
    60%     { transform: translate(1%,-2%); }
    70%     { transform: translate(-2%,1%); }
    80%     { transform: translate(3%,-3%); }
    90%     { transform: translate(-1%,2%); }
  }
  @keyframes ci-scanline {
    from { background-position: 0 0; }
    to   { background-position: 0 100%; }
  }
  @keyframes ci-pulse-ring {
    0%   { transform: scale(0.88); opacity: 0.7; }
    60%  { transform: scale(1.08); opacity: 0.18; }
    100% { transform: scale(1.2);  opacity: 0; }
  }
`;

interface EntranceOverlayProps {
  onComplete?: () => void;
}

export function EntranceOverlay({ onComplete }: EntranceOverlayProps) {
  const [phase, setPhase] = useState<"init" | "run" | "flash" | "done">("init");
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const schedule = (fn: () => void, ms: number): void => {
    const id = setTimeout(fn, ms);
    timerRef.current.push(id);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Skip if already seen
    if (localStorage.getItem("dm-intro-v2-seen") === "true") {
      onComplete?.();
      return;
    }

    // Inject CSS once
    if (!document.getElementById("ci-styles")) {
      const s = document.createElement("style");
      s.id = "ci-styles";
      s.textContent = CSS;
      document.head.appendChild(s);
    }

    schedule(() => setPhase("run"),   60);
    schedule(() => setPhase("flash"), 1700);
    schedule(() => {
      setPhase("done");
      localStorage.setItem("dm-intro-v2-seen", "true");
      setTimeout(() => onComplete?.(), 200);
    }, TOTAL_MS);

    return () => timerRef.current.forEach(clearTimeout);
  }, [onComplete]);

  if (phase === "done") return null;

  const running = phase === "run" || phase === "flash";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000",
        overflow: "hidden",
        // Fade the whole overlay out at the flash phase
        animation: phase === "flash"
          ? "ci-fade-out 320ms ease-in forwards"
          : undefined,
      }}
    >
      {/* ── Film grain overlay ──────────────────────────────────────────────── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "-10%",
          width: "120%",
          height: "120%",
          opacity: 0.038,
          pointerEvents: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23g)'/%3E%3C/svg%3E")`,
          animation: "ci-grain 0.12s steps(1) infinite",
        }}
      />

      {/* ── Scanlines ───────────────────────────────────────────────────────── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.18) 3px, rgba(0,0,0,0.18) 4px)",
          opacity: 0.55,
        }}
      />

      {/* ── Letterbox bars ──────────────────────────────────────────────────── */}
      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "14%",
          background: "#000",
          zIndex: 10,
          transformOrigin: "top center",
          animation: running
            ? "ci-bar-top 160ms cubic-bezier(.22,1,.36,1) 60ms both"
            : undefined,
          transform: running ? undefined : "translateY(-100%)",
        }}
      />
      {/* Bottom bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: "14%",
          background: "#000",
          zIndex: 10,
          transformOrigin: "bottom center",
          animation: running
            ? "ci-bar-bot 160ms cubic-bezier(.22,1,.36,1) 60ms both"
            : undefined,
          transform: running ? undefined : "translateY(100%)",
        }}
      />

      {/* ── Main stage — confined between letterbox bars ──────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: "14% 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          // Deep warm-dark radial bg
          background:
            "radial-gradient(ellipse 120% 120% at 50% 50%, #140a02 0%, #0a0603 55%, #000000 100%)",
        }}
      >
        {/* Ambient amber glow */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 50%, rgba(217,119,6,0.14) 0%, transparent 65%)",
            pointerEvents: "none",
          }}
        />

        {/* ── Lens-sweep streak ─────────────────────────────────────────────── */}
        {running && (
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: "28%",
              pointerEvents: "none",
              animation: "ci-sweep 520ms cubic-bezier(.4,0,.2,1) 450ms both",
              background:
                "linear-gradient(105deg, transparent 0%, rgba(251,191,36,0.04) 30%, rgba(255,255,255,0.22) 50%, rgba(251,191,36,0.04) 70%, transparent 100%)",
              filter: "blur(3px)",
              zIndex: 5,
            }}
          />
        )}

        {/* ── Vignette ─────────────────────────────────────────────────────── */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 95% 95% at 50% 50%, transparent 48%, rgba(0,0,0,0.72) 100%)",
            pointerEvents: "none",
            zIndex: 2,
          }}
        />

        {/* ── Center content ────────────────────────────────────────────────── */}
        <div
          style={{
            position: "relative",
            zIndex: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
          }}
        >
          {/* — Monogram lockup — */}
          {running && (
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "ci-monogram-in 380ms cubic-bezier(.22,1,.36,1) 180ms both",
                marginBottom: 28,
              }}
            >
              {/* Pulse ring behind monogram */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  border: "1px solid rgba(251,191,36,0.45)",
                  animation: "ci-pulse-ring 1.6s ease-out 400ms infinite",
                }}
              />

              {/* Outer circle */}
              <svg
                width="96"
                height="96"
                viewBox="0 0 96 96"
                style={{ display: "block" }}
              >
                <defs>
                  <linearGradient id="ci-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%"   stopColor="rgba(180,83,9,0.7)" />
                    <stop offset="50%"  stopColor="rgba(251,191,36,0.9)" />
                    <stop offset="100%" stopColor="rgba(180,83,9,0.5)" />
                  </linearGradient>
                  <filter id="ci-glow" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="2.8" result="b" />
                    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>

                {/* Thin outer ring */}
                <circle
                  cx="48" cy="48" r="46"
                  fill="none"
                  stroke="url(#ci-ring-grad)"
                  strokeWidth="0.8"
                  opacity="0.6"
                />

                {/* Dashed tick ring */}
                <circle
                  cx="48" cy="48" r="42"
                  fill="none"
                  stroke="rgba(251,191,36,0.28)"
                  strokeWidth="0.5"
                  strokeDasharray="2 8"
                />

                {/* Filled disc */}
                <circle
                  cx="48" cy="48" r="36"
                  fill="#0d0702"
                  stroke="rgba(251,191,36,0.2)"
                  strokeWidth="0.6"
                />

                {/* Cardinal dots */}
                {[0, 90, 180, 270].map((deg, i) => {
                  const rad = (deg - 90) * (Math.PI / 180);
                  return (
                    <circle
                      key={i}
                      cx={48 + 46 * Math.cos(rad)}
                      cy={48 + 46 * Math.sin(rad)}
                      r="2.2"
                      fill="rgba(251,191,36,0.85)"
                      filter="url(#ci-glow)"
                    />
                  );
                })}

                {/* "D·M" monogram */}
                <text
                  x="48" y="54"
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.96)"
                  fontSize="22"
                  fontFamily="Georgia, 'Times New Roman', serif"
                  fontWeight="700"
                  filter="url(#ci-glow)"
                  letterSpacing="2"
                >
                  D·M
                </text>
              </svg>
            </div>
          )}

          {/* — Horizontal rule — */}
          {running && (
            <div
              style={{
                width: 220,
                height: 1,
                marginBottom: 20,
                background:
                  "linear-gradient(90deg, transparent, rgba(251,191,36,0.55) 30%, rgba(255,255,255,0.7) 50%, rgba(251,191,36,0.55) 70%, transparent)",
                animation: "ci-sub-in 280ms ease 550ms both",
              }}
            />
          )}

          {/* — Name — */}
          {running && (
            <div style={{ overflow: "hidden", paddingBottom: 6 }}>
              <p
                style={{
                  margin: 0,
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "clamp(1.05rem, 4.5vw, 1.65rem)",
                  fontWeight: 700,
                  color: "#ffffff",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  textShadow:
                    "0 0 28px rgba(251,191,36,0.35), 0 4px 24px rgba(0,0,0,0.8)",
                  animation: "ci-name-in 480ms cubic-bezier(.22,1,.36,1) 650ms both",
                }}
              >
                Douglas Mitchell
              </p>
            </div>
          )}

          {/* — Sub-tagline — */}
          {running && (
            <p
              style={{
                margin: "10px 0 0",
                fontFamily: "monospace",
                fontSize: "clamp(0.52rem, 1.6vw, 0.66rem)",
                letterSpacing: "0.44em",
                textTransform: "uppercase",
                color: "rgba(251,191,36,0.55)",
                animation: "ci-sub-in 420ms ease 1020ms both",
                opacity: 0,
              }}
            >
              Author · Storyteller · Visionary
            </p>
          )}
        </div>
      </div>

      {/* ── White flash frame (film cut) ────────────────────────────────────── */}
      {phase === "flash" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#fff",
            zIndex: 20,
            animation: "ci-flash 320ms ease-in-out forwards",
            pointerEvents: "none",
          }}
        />
      )}

      {/* ── Corner frame markers ─────────────────────────────────────────────── */}
      {running && (
        <>
          {[
            { top: "14%", left: 0,    borderTop: true,    borderLeft: true },
            { top: "14%", right: 0,   borderTop: true,    borderRight: true },
            { bottom: "14%", left: 0, borderBottom: true, borderLeft: true },
            { bottom: "14%", right: 0,borderBottom: true, borderRight: true },
          ].map((pos, i) => (
            <div
              key={i}
              aria-hidden
              style={{
                position: "absolute",
                width: 24,
                height: 24,
                zIndex: 11,
                borderTop:    pos.borderTop    ? "1px solid rgba(251,191,36,0.3)" : undefined,
                borderLeft:   pos.borderLeft   ? "1px solid rgba(251,191,36,0.3)" : undefined,
                borderRight:  pos.borderRight  ? "1px solid rgba(251,191,36,0.3)" : undefined,
                borderBottom: pos.borderBottom ? "1px solid rgba(251,191,36,0.3)" : undefined,
                top:    pos.top,
                bottom: pos.bottom,
                left:   pos.left,
                right:  pos.right,
              }}
            />
          ))}
        </>
      )}

      {/* ── Timecode / metadata strip (cinematic detail) ──────────────────── */}
      {running && (
        <div
          style={{
            position: "absolute",
            bottom: "14%",
            left: 0,
            right: 0,
            height: 0,
            zIndex: 11,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            padding: "0 18px",
            transform: "translateY(8px)",
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.48rem",
              letterSpacing: "0.2em",
              color: "rgba(251,191,36,0.28)",
              animation: "ci-sub-in 300ms ease 400ms both",
              opacity: 0,
            }}
          >
            DM·MMXXVI
          </span>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.48rem",
              letterSpacing: "0.2em",
              color: "rgba(251,191,36,0.28)",
              animation: "ci-sub-in 300ms ease 400ms both",
              opacity: 0,
            }}
          >
            HOUSTON · TX
          </span>
        </div>
      )}
    </div>
  );
}

export default EntranceOverlay;
