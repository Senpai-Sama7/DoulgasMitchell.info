"use client";

import { useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// EntranceOverlay — Signal / Decode
//
// Motion concept: a vertical scan line sweeps top→bottom, triggering a
// per-character glyph scramble on the name as it passes. Each character
// cycles pseudorandom glyphs and simultaneously renders chromatic aberration
// via dual-offset text-shadow (R +X, B -X). Aberration magnitude decays as
// resolved/total → 1 — the visual "decoding" is literally encoded in the
// physics. When the last char locks: bloom pulse → amber rule draws → tagline
// fades → white flash film cut → onComplete fires.
//
// Aesthetic contract: all tokens pulled verbatim from existing system —
//   background  : #1c0e04 → #060402
//   accent      : rgba(251,191,36, ·)
//   display font: var(--font-fraunces, Georgia, serif)
//   mono font   : var(--font-ibm-plex, monospace)
//   handwritten : var(--font-caveat, cursive)
//
// Architecture: zero React state during the 2 s animation window.
// All transitions are direct style mutations on stable DOM refs so the
// React reconciler never touches the component after mount. This eliminates
// reconciler overhead on animation-critical frames and avoids the
// animation-fill-mode/iframe sandbox pathologies of the previous iteration.
// ─────────────────────────────────────────────────────────────────────────────

interface EntranceOverlayProps {
  onComplete?: () => void;
}

// ── Scramble constants ────────────────────────────────────────────────────────
const TARGET  = "Senpai's Isekai";
const GLYPHS  = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@%?!·×";
const GLYPH_N = GLYPHS.length;
// ── Mulberry32 — lightweight seeded PRNG ──────────────────────────────────────
// 32-bit xorshift-multiply with strong avalanche characteristics.
// Deterministic seed guarantees identical particle layout across replays,
// eliminating the visual pop that would occur if Math.random() were used
// at spawn time. O(1) per invocation, zero external state.
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return (): number => {
    s  = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Global CSS — injected once into <head> ────────────────────────────────────
// Keyframes live here rather than in inline style props because:
// 1. CSS @keyframes cannot be expressed as inline styles in React
// 2. A single <style> tag is cheaper than per-element animation strings
// 3. The dm-grain animation must run on a pseudo-element-like div whose
//    transform-origin is outside the box — easier to express in a class rule
const GLOBAL_CSS = `
  @keyframes si-sweep {
    0%   { transform: translateY(-2px); opacity: 1; }
    85%  { opacity: 0.5; }
    100% { transform: translateY(105vh); opacity: 0; }
  }
  @keyframes si-flash {
    0%   { opacity: 0; }
    22%  { opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes si-grain {
    0%,100%{ transform: translate(0,0); }
    20%    { transform: translate(-2%,1.5%); }
    40%    { transform: translate(1.5%,-2%); }
    60%    { transform: translate(-1%,2%); }
    80%    { transform: translate(2%,-1%); }
  }
  @keyframes si-pulse-ring {
    0%   { transform: scale(0.85); opacity: 0.7; }
    65%  { transform: scale(1.14); opacity: 0.1; }
    100% { transform: scale(1.26); opacity: 0; }
  }
`;

// ── Particle shape ────────────────────────────────────────────────────────────
interface Particle {
  x: number; y: number;
  r: number;
  vx: number; vy: number;
  a: number;
}

// ── ScrambleChar state ────────────────────────────────────────────────────────
interface ScrambleChar {
  resolved: boolean;
  resolveAt: number; // ms from scramble start
  glyph: string;
}

// ─────────────────────────────────────────────────────────────────────────────
export function EntranceOverlay({ onComplete }: EntranceOverlayProps) {

  // ── DOM refs — the entire animation is driven by direct style mutations
  const wrapperRef  = useRef<HTMLDivElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const sweepRef    = useRef<HTMLDivElement>(null);
  const eyebrowRef  = useRef<HTMLParagraphElement>(null);
  const nameRef     = useRef<HTMLSpanElement>(null);
  const ruleRef     = useRef<HTMLDivElement>(null);
  const tagRef      = useRef<HTMLParagraphElement>(null);
  const subTagRef   = useRef<HTMLParagraphElement>(null);
  const flashRef    = useRef<HTMLDivElement>(null);

  // ── Mutable imperative state — not React state, intentionally
  const timersRef  = useRef<ReturnType<typeof setTimeout>[]>([]);
  const ptxRafRef  = useRef<number>(0);
  const sRafRef    = useRef<number>(0);

  // ── Particle field ────────────────────────────────────────────────────────
  // 55 dim amber-tinted particles drifting slowly across the dark bg.
  // Amber tint (251,191,36) at very low opacity coheres with the accent
  // system without competing with the name during decode.
  const spawnParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width  = window.innerWidth;
    const H = canvas.height = window.innerHeight;

    const rng = mulberry32(0xF3ABCD12);
    const particles: Particle[] = Array.from({ length: 55 }, () => ({
      x:  rng() * W,
      y:  rng() * H,
      r:  rng() * 1.2 + 0.2,
      vx: (rng() - 0.5) * 0.18,
      vy: (rng() - 0.5) * 0.18,
      a:  rng() * 0.08 + 0.018,
    }));

    const tick = (): void => {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        // Amber-tinted particles — coheres with existing accent system
        ctx.fillStyle = `rgba(251,191,36,${p.a})`;
        ctx.fill();
      }
      ptxRafRef.current = requestAnimationFrame(tick);
    };
    ptxRafRef.current = requestAnimationFrame(tick);
  }, []);

  // ── Scramble engine ───────────────────────────────────────────────────────
  // Per-character resolve schedule: linear stagger with bounded jitter
  // (±35 ms) ensures left-to-right directionality reads clearly while
  // feeling organic rather than mechanical.
  //
  // Chromatic aberration is modeled as two offset text-shadow entries:
  //   R channel: +offset px on X axis, rgba(255,24,72,alpha)
  //   B channel: -offset px on X axis, rgba(0,215,255,alpha)
  // Both magnitude and alpha decay linearly with resolve ratio, so the
  // effect self-extinguishes exactly when the last character locks in.
  // Single DOM write per frame: one textContent + one textShadow assignment.
  const runScramble = useCallback((
    duration: number,
    onDone?: () => void
  ): void => {
    cancelAnimationFrame(sRafRef.current);
    const el = nameRef.current;
    if (!el) return;

    const chars = TARGET.split("");
    const n     = chars.length;

    const states: ScrambleChar[] = chars.map((c, i) => ({
      resolved:  c === " " || c === "'",
      resolveAt: (c === " " || c === "'")
        ? 0
        : (i / (n - 1)) * duration * 0.84 + (Math.random() * 70 - 35),
      glyph: (c === " " || c === "'")
        ? c
        : GLYPHS[(Math.random() * GLYPH_N) | 0],
    }));

    const start = performance.now();

    const tick = (now: number): void => {
      const elapsed  = now - start;
      let   resolved = 0;

      const out = states.map((s, i): string => {
        const c = chars[i];
        if (c === " " || c === "'") { resolved++; return c; }
        if (s.resolved)             { resolved++; return c; }
        if (elapsed >= s.resolveAt) { s.resolved = true; resolved++; return c; }
        if (Math.random() > 0.38)   s.glyph = GLYPHS[(Math.random() * GLYPH_N) | 0];
        return s.glyph;
      }).join("");

      el.textContent = out;

      // Chromatic aberration decay
      const ratio  = resolved / n;
      const offset = (1 - ratio) * 7;
      const alpha  = (1 - ratio) * 0.85;

      el.style.textShadow = offset > 0.3
        ? `${offset}px 0 rgba(255,24,72,${alpha.toFixed(3)}), -${offset}px 0 rgba(0,215,255,${alpha.toFixed(3)})`
        : "0 0 40px rgba(251,191,36,0.18)"; // amber glow once resolved

      if (resolved < n) {
        sRafRef.current = requestAnimationFrame(tick);
      } else {
        onDone?.();
      }
    };

    sRafRef.current = requestAnimationFrame(tick);
  }, []);

  // ── Orchestration ─────────────────────────────────────────────────────────
  const play = useCallback((): void => {
    // Cancel all in-flight work
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    cancelAnimationFrame(sRafRef.current);
    cancelAnimationFrame(ptxRafRef.current);

    spawnParticles();

    const T  = (fn: () => void, ms: number) =>
      timersRef.current.push(setTimeout(fn, ms));

    const reflow = (el: HTMLElement): void => { void el.offsetWidth; };

    const css = (
      el: HTMLElement | null,
      props: Partial<CSSStyleDeclaration>
    ): void => {
      if (!el) return;
      Object.assign(el.style, props);
    };

    // ── Synchronous hard reset — disable all transitions/animations,
    //    snap every element to its initial invisible state before the
    //    first scheduled timer fires.
    const managed = [
      wrapperRef, sweepRef, eyebrowRef,
      nameRef, ruleRef, tagRef, subTagRef, flashRef,
    ];
    managed.forEach(r => {
      if (!r.current) return;
      r.current.style.transition = "none";
      r.current.style.animation  = "none";
    });
    reflow(wrapperRef.current!);

    css(wrapperRef.current,  { opacity: "1" });
    css(sweepRef.current,    { opacity: "0", transform: "translateY(-2px)", animation: "none" });
    css(eyebrowRef.current,  { opacity: "0" });
    css(nameRef.current,     { opacity: "0", textShadow: "none" });
    if (nameRef.current) nameRef.current.textContent = TARGET;
    css(ruleRef.current,     { transform: "scaleX(0)", opacity: "0" });
    css(tagRef.current,      { opacity: "0" });
    css(subTagRef.current,   { opacity: "0" });
    css(flashRef.current,    { opacity: "0", animation: "none" });

    const spring = "cubic-bezier(.22,1,.36,1)";

    // 45ms — eyebrow fades in
    T(() => {
      css(eyebrowRef.current, {
        transition: "opacity 500ms ease",
        opacity: "1",
      });
    }, 45);

    // 80ms — scan sweep fires
    T(() => {
      const s = sweepRef.current;
      if (!s) return;
      css(s, { animation: "none", opacity: "1" });
      reflow(s);
      s.style.animation = "si-sweep 500ms cubic-bezier(.38,0,.76,1) forwards";
    }, 80);

    // 320ms — name becomes visible, scramble begins
    // (sweep's vertical midpoint hits name region ~290ms in)
    T(() => {
      css(nameRef.current, { opacity: "1" });
      runScramble(820, () => {
        // Last char locked — bloom pulse then settle to amber glow
        const el = nameRef.current;
        if (!el) return;
        el.style.transition  = "text-shadow 120ms ease-out";
        el.style.textShadow  = "0 0 90px rgba(251,191,36,0.6)";
        setTimeout(() => {
          if (!el) return;
          el.style.transition = "text-shadow 400ms ease";
          el.style.textShadow = "0 0 40px rgba(251,191,36,0.18)";
        }, 120);
      });
    }, 320);

    // 1210ms — amber rule draws left→right, width matched to name
    T(() => {
      const w = nameRef.current?.offsetWidth ?? 0;
      if (w > 40 && ruleRef.current) {
        ruleRef.current.style.width = `${w}px`;
      }
      css(ruleRef.current, {
        transition: `transform 440ms ${spring}, opacity 220ms ease`,
        transform:  "scaleX(1)",
        opacity:    "1",
      });
    }, 1210);

    // 1360ms — tagline
    T(() => {
      css(tagRef.current, { transition: "opacity 380ms ease", opacity: "1" });
    }, 1360);

    // 1520ms — handwritten sub-tag (Caveat)
    T(() => {
      css(subTagRef.current, { transition: "opacity 380ms ease", opacity: "1" });
    }, 1520);

    // 1760ms — white flash (film cut)
    T(() => {
      const f = flashRef.current;
      if (!f) return;
      css(f, { animation: "none" });
      reflow(f);
      f.style.animation = "si-flash 320ms ease-in-out forwards";
    }, 1760);

    // 1960ms — wrapper fades to black → onComplete
    T(() => {
      css(wrapperRef.current, {
        transition: "opacity 280ms ease-in",
        opacity:    "0",
      });
    }, 1960);

    T(() => {
      onComplete?.();
    }, 2260);

  }, [spawnParticles, runScramble, onComplete]);

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Inject keyframes once
    if (!document.getElementById("si-global-css")) {
      const s = document.createElement("style");
      s.id = "si-global-css";
      s.textContent = GLOBAL_CSS;
      document.head.appendChild(s);
    }

    play();

    return () => {
      timersRef.current.forEach(clearTimeout);
      cancelAnimationFrame(ptxRafRef.current);
      cancelAnimationFrame(sRafRef.current);
    };
  }, [play, onComplete]);

  // ── Render ─────────────────────────────────────────────────────────────────
  // JSX is a static structural skeleton — zero dynamic expressions that
  // would trigger reconciler diffing during the animation window.
  return (
    <div
      ref={wrapperRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        overflow: "hidden",
        userSelect: "none",
        // Warm dark radial bg — matches existing system exactly
        background:
          "radial-gradient(ellipse 110% 80% at 50% 55%, #1c0e04 0%, #0d0805 45%, #000000 100%)",
      }}
    >
      {/* Ambient amber glow orbs — inherited from existing overlay */}
      <div
        aria-hidden
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 34% 40%, rgba(217,119,6,0.12) 0%, transparent 55%), " +
            "radial-gradient(circle at 68% 62%, rgba(180,83,9,0.08) 0%, transparent 50%)",
        }}
      />

      {/* Film grain */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "-10%",
          width: "120%",
          height: "120%",
          pointerEvents: "none",
          opacity: 0.04,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "300px 300px",
          animation: "si-grain 0.13s steps(1) infinite",
        }}
      />

      {/* Scanlines */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 3px)",
          opacity: 0.45,
        }}
      />

      {/* Particle canvas — amber dust field */}
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Vertical scan sweep line */}
      <div
        ref={sweepRef}
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 1,
          top: 0,
          transform: "translateY(-2px)",
          opacity: 0,
          zIndex: 8,
          pointerEvents: "none",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(251,191,36,0.06) 8%, rgba(251,191,36,0.95) 50%, rgba(251,191,36,0.06) 92%, transparent 100%)",
          boxShadow:
            "0 0 8px rgba(251,191,36,0.6), 0 0 24px rgba(217,119,6,0.22), 0 0 48px rgba(217,119,6,0.08)",
        }}
      />

      {/* Signature corner brackets */}
      <div style={{ position: "absolute", top: 28, left: 28, width: 52, height: 52, borderTop: "1px solid rgba(251,191,36,0.32)", borderLeft: "1px solid rgba(251,191,36,0.32)" }} />
      <div style={{ position: "absolute", top: 28, right: 28, width: 52, height: 52, borderTop: "1px solid rgba(251,191,36,0.32)", borderRight: "1px solid rgba(251,191,36,0.32)" }} />
      <div style={{ position: "absolute", bottom: 28, left: 28, width: 52, height: 52, borderBottom: "1px solid rgba(251,191,36,0.32)", borderLeft: "1px solid rgba(251,191,36,0.32)" }} />
      <div style={{ position: "absolute", bottom: 28, right: 28, width: 52, height: 52, borderBottom: "1px solid rgba(251,191,36,0.32)", borderRight: "1px solid rgba(251,191,36,0.32)" }} />

      {/* ── Content center ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 24px",
        }}
      >
        {/* Eyebrow */}
        <p
          ref={eyebrowRef}
          style={{
            fontFamily: "var(--font-ibm-plex, monospace)",
            fontSize: "0.58rem",
            letterSpacing: "0.44em",
            textTransform: "uppercase",
            color: "rgba(251,191,36,0.55)",
            marginBottom: 28,
            opacity: 0,
          }}
        >
          Welcome to
        </p>

        {/* Name — Fraunces display, dominant hero element */}
        <div style={{ overflow: "hidden", paddingBottom: 4 }}>
          <span
            ref={nameRef}
            style={{
              display: "block",
              fontFamily: "var(--font-fraunces, Georgia, serif)",
              fontSize: "clamp(2.6rem, 9vw, 5.4rem)",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
              lineHeight: 1.05,
              opacity: 0,
            }}
          >
            {TARGET}
          </span>
        </div>

        {/* Amber rule — draws left → right after last char locks */}
        <div
          ref={ruleRef}
          style={{
            height: 1,
            width: "100%",
            marginTop: 16,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(180,83,9,0.5) 16%, rgba(251,191,36,1.0) 50%, rgba(180,83,9,0.5) 84%, transparent 100%)",
            transformOrigin: "left center",
            transform: "scaleX(0)",
            opacity: 0,
          }}
        />

        {/* Tagline — IBM Plex mono, spaced caps */}
        <p
          ref={tagRef}
          style={{
            fontFamily: "var(--font-ibm-plex, monospace)",
            fontSize: "clamp(0.44rem, 1.2vw, 0.6rem)",
            letterSpacing: "0.38em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.65)",
            marginTop: 14,
            opacity: 0,
          }}
        >
          Open-Source Humanity
        </p>

        {/* Handwritten sub-tag — Caveat */}
        <p
          ref={subTagRef}
          style={{
            fontFamily: "var(--font-caveat, cursive)",
            fontSize: "clamp(1.05rem, 3vw, 1.45rem)",
            color: "rgba(251,191,36,0.5)",
            marginTop: 6,
            opacity: 0,
          }}
        >
          ~ Thee Strongest ~
        </p>
      </div>

      {/* White flash — film cut at end of sequence */}
      <div
        ref={flashRef}
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 15,
          background: "#fff",
          opacity: 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export default EntranceOverlay;
