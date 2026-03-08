'use client';

import { useState, useEffect, useCallback, memo, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParticleCanvas } from './particle-canvas';

// ═══════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════

const C = {
  cyan:      '#00D4FF',
  cyan2:     '#7EC8E3',
  green:     '#39FF14',
  amber:     '#FFB800',
  white:     '#E8F4FF',
  dim:       'rgba(0,212,255,0.25)',
  dimFaint:  'rgba(0,212,255,0.14)',
  greenDim:  'rgba(57,255,20,0.25)',
  red:       '#FF5F57',
  yellow:    '#FEBC2E',
  greenDot:  '#28C840',
};

// ═══════════════════════════════════════════════════════════════════
// ASCII ART (ANSI Shadow font, block unicode)
// ═══════════════════════════════════════════════════════════════════

const D_LINES = [
  '██████╗  ██████╗ ██╗   ██╗ ██████╗ ██╗      █████╗ ███████╗',
  '██╔══██╗██╔═══██╗██║   ██║██╔════╝ ██║     ██╔══██╗██╔════╝',
  '██║  ██║██║   ██║██║   ██║██║  ███╗██║     ███████║███████╗',
  '██║  ██║██║   ██║██║   ██║██║   ██║██║     ██╔══██║╚════██║',
  '██████╔╝╚██████╔╝╚██████╔╝╚██████╔╝███████╗██║  ██║███████║',
  '╚═════╝  ╚═════╝  ╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝',
];

const M_LINES = [
  '███╗   ███╗██╗████████╗ ██████╗██╗  ██╗███████╗██╗     ██╗   ',
  '████╗ ████║██║╚══██╔══╝██╔════╝██║  ██║██╔════╝██║     ██║   ',
  '██╔████╔██║██║   ██║   ██║     ███████║█████╗  ██║     ██║   ',
  '██║╚██╔╝██║██║   ██║   ██║     ██╔══██║██╔══╝  ██║     ██║   ',
  '██║ ╚═╝ ██║██║   ██║   ╚██████╗██║  ██║███████╗███████╗███████╗',
  '╚═╝     ╚═╝╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝',
];

// Glitch pool — block-drawing chars
const GLYPHS = '▓▒░╬╪╫╞╡╟╢╠╣╦╩╤╧╥╨▌▐▀▄█▇▆▅▃▁╱╲╳┼┤├┴┬│─';
const rng = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

// ═══════════════════════════════════════════════════════════════════
// BOOT SEQUENCE
// ═══════════════════════════════════════════════════════════════════

const BOOT = [
  '> BIOS v4.12.7 — UEFI Secure Boot ACTIVE',
  '> CPU: AMD EPYC 9654P [192T] @ 3.7 GHz.......... OK',
  '> RAM: 256 GB DDR5-8800 ECC REGISTERED.......... OK',
  '> NVME: Encrypted volume [AES-256-XTS].......... OK',
  '> Verifying kernel integrity hash............... OK',
  '> Loading identity_matrix.ko module............. OK',
  '> Cross-referencing neural signature............ OK',
  '> Scanning biometric hash........ ████████ MATCH',
  '─────────────────────────────────────────────────────',
  '> CLEARANCE: Ω-OMEGA',
  '> IDENTITY CONFIRMED — INITIATING SEQUENCE',
];

const ROLES = [
  'Systems Architect',
  'AI Practitioner',
  'Operations Analyst',
  'Author · Builder',
  'Google AI Certified',
  'Anthropic Certified',
];

// ═══════════════════════════════════════════════════════════════════
// GRID UTILITIES
// ═══════════════════════════════════════════════════════════════════

interface Cell {
  ch: string;
  resolved: boolean;
  display: string;
}

function buildGrid(lines: string[]): Cell[][] {
  return lines.map(line =>
    [...line].map(ch => ({
      ch,
      resolved: ch === ' ',
      display: ch === ' ' ? ' ' : rng(),
    }))
  );
}

// ═══════════════════════════════════════════════════════════════════
// AUDIO VISUALIZER BARS
// ═══════════════════════════════════════════════════════════════════

const AudioViz = memo(({ active }: { active: boolean }) => {
  const [bars, setBars] = useState<number[]>(Array(24).fill(0));

  useEffect(() => {
    if (!active) return;
    const iv = setInterval(() => {
      setBars(prev => prev.map((_, i) => {
        const center = prev.length / 2;
        const distFromCenter = Math.abs(i - center) / center;
        const base = (1 - distFromCenter * 0.6) * 0.5;
        return base + Math.random() * (1 - distFromCenter) * 0.5;
      }));
    }, 80);
    return () => clearInterval(iv);
  }, [active]);

  if (!active) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: 2,
      height: 28,
      marginTop: 12,
      marginBottom: 4,
    }}>
      {bars.map((val, i) => {
        const h = Math.max(2, val * 26);
        const hue = 180 + (i / bars.length) * 40; // cyan to teal gradient
        return (
          <div
            key={i}
            style={{
              width: 3,
              height: h,
              borderRadius: 1,
              background: `hsla(${hue}, 90%, 60%, ${0.4 + val * 0.5})`,
              boxShadow: val > 0.6 ? `0 0 6px hsla(${hue}, 90%, 60%, 0.4)` : 'none',
              transition: 'height 0.06s linear',
            }}
          />
        );
      })}
    </div>
  );
});

AudioViz.displayName = 'AudioViz';

// ═══════════════════════════════════════════════════════════════════
// ASCII GRID RENDERER (memoized)
// ═══════════════════════════════════════════════════════════════════

interface AsciiGridProps {
  grid: Cell[][];
  resolvedColor: string;
  glowColor: string;
  scanCol: number;
  chromatic: boolean;
}

const AsciiGrid = memo(({ grid, resolvedColor, glowColor, scanCol, chromatic }: AsciiGridProps) => (
  <pre
    style={{
      fontFamily: 'var(--font-jetbrains-mono), "Courier New", Courier, monospace',
      fontSize: 'clamp(5px, 1.4vw, 10.5px)',
      lineHeight: '1.48',
      letterSpacing: '-0.01em',
      margin: 0,
      padding: 0,
      whiteSpace: 'pre',
      userSelect: 'none',
      display: 'block',
    }}
  >
    {grid.map((row, ri) => (
      <div key={ri} style={{ display: 'block' }}>
        {row.map((cell, ci) => {
          const isEdge     = ci === scanCol || ci === scanCol + 1;
          const isResolved = cell.resolved;
          const isEmpty    = cell.ch === ' ';

          let color: string;
          let textShadow: string;

          if (isEmpty) {
            color = 'transparent';
            textShadow = 'none';
          } else if (isResolved && isEdge) {
            color = '#fff';
            textShadow = `0 0 30px #fff, 0 0 50px ${glowColor}, 0 0 80px ${glowColor}`;
          } else if (isResolved && chromatic) {
            color = resolvedColor;
            textShadow = `-2px 0 rgba(255,0,80,0.35), 2px 0 rgba(0,255,255,0.35), 0 0 8px ${glowColor}`;
          } else if (isResolved) {
            color = resolvedColor;
            textShadow = `0 0 6px ${glowColor}, 0 0 16px ${glowColor}88`;
          } else {
            color = C.green;
            textShadow = `0 0 5px ${C.greenDim}`;
          }

          return (
            <span
              key={ci}
              style={{
                color,
                textShadow,
                transition: isResolved ? 'color 0.06s, text-shadow 0.15s' : 'none',
              }}
            >
              {isEmpty ? '\u00A0' : cell.display}
            </span>
          );
        })}
      </div>
    ))}
  </pre>
));

AsciiGrid.displayName = 'AsciiGrid';

// ═══════════════════════════════════════════════════════════════════
// CORNER BRACKETS (HUD style)
// ═══════════════════════════════════════════════════════════════════

function CornerBrackets() {
  const bracketStyle = (pos: string): CSSProperties => {
    const size = 20;
    const base: CSSProperties = {
      position: 'absolute',
      width: size,
      height: size,
      pointerEvents: 'none',
      zIndex: 15,
    };

    const borderColor = 'rgba(0,212,255,0.2)';
    const borderWidth = '1px';

    switch (pos) {
      case 'tl':
        return { ...base, top: 16, left: 16, borderTop: `${borderWidth} solid ${borderColor}`, borderLeft: `${borderWidth} solid ${borderColor}` };
      case 'tr':
        return { ...base, top: 16, right: 16, borderTop: `${borderWidth} solid ${borderColor}`, borderRight: `${borderWidth} solid ${borderColor}` };
      case 'bl':
        return { ...base, bottom: 16, left: 16, borderBottom: `${borderWidth} solid ${borderColor}`, borderLeft: `${borderWidth} solid ${borderColor}` };
      case 'br':
        return { ...base, bottom: 16, right: 16, borderBottom: `${borderWidth} solid ${borderColor}`, borderRight: `${borderWidth} solid ${borderColor}` };
      default:
        return base;
    }
  };

  return (
    <>
      <div style={bracketStyle('tl')} />
      <div style={bracketStyle('tr')} />
      <div style={bracketStyle('bl')} />
      <div style={bracketStyle('br')} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// STATUS BAR (bottom HUD)
// ═══════════════════════════════════════════════════════════════════

function StatusBar({ phase }: { phase: string }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setTime(d.toLocaleTimeString('en-US', { hour12: false }));
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      bottom: 8,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 24px',
      fontSize: '9px',
      fontFamily: 'var(--font-jetbrains-mono), monospace',
      letterSpacing: '0.1em',
      color: 'rgba(0,212,255,0.15)',
      zIndex: 15,
      pointerEvents: 'none',
    }}>
      <span>LAT 29.7604° N · LON 95.3698° W</span>
      <span>{time} UTC</span>
      <span>
        CPU {phase === 'decode' ? '87' : phase === 'hold' ? '42' : '12'}% ·
        MEM {phase === 'decode' ? '61' : '34'}%
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

interface SplashOverlayProps {
  onComplete?: () => void;
  minDisplayTime?: number;
}

type Phase = 'boot' | 'decode' | 'hold' | 'exit';

export function SplashOverlay({ onComplete, minDisplayTime = 4000 }: SplashOverlayProps) {
  const [phase, setPhase]         = useState<Phase>('boot');
  const [visible, setVisible]     = useState(true);

  // Boot
  const [bootIdx, setBootIdx]     = useState(0);

  // Decode state
  const [dGrid, setDGrid]         = useState<Cell[][]>(() => buildGrid(D_LINES));
  const [mGrid, setMGrid]         = useState<Cell[][]>(() => buildGrid(M_LINES));
  const [mVisible, setMVisible]   = useState(false);
  const [dDone, setDDone]         = useState(false);
  const [mDone, setMDone]         = useState(false);
  const [scanCol, setScanCol]     = useState(-1);
  const [chromatic, setChromatic] = useState(false);

  // Hold
  const [progress, setProgress]   = useState(0);
  const [roleIdx, setRoleIdx]     = useState(0);

  // FX
  const [glitching, setGlitching] = useState(false);
  const [systemOnline, setSystemOnline] = useState(false);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ── BOOT ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'boot') return;
    if (bootIdx < BOOT.length) {
      const delay = bootIdx < 8 ? 85 : 120;
      const t = setTimeout(() => setBootIdx(i => i + 1), delay);
      return () => clearTimeout(t);
    }
    // Multi-frame glitch transition
    const seq: [number, () => void][] = [
      [300,  () => setGlitching(true)],
      [380,  () => setGlitching(false)],
      [430,  () => setGlitching(true)],
      [490,  () => setGlitching(false)],
      [540,  () => setGlitching(true)],
      [580,  () => { setGlitching(false); setSystemOnline(true); }],
      [900,  () => setSystemOnline(false)],
      [950,  () => setPhase('decode')],
    ];
    const timers = seq.map(([ms, fn]) => setTimeout(fn, ms));
    return () => timers.forEach(clearTimeout);
  }, [phase, bootIdx]);

  // ── COLUMN-SWEEP DECODE ───────────────────────────────────────────
  const startDecode = useCallback((
    lines: string[],
    setGrid: React.Dispatch<React.SetStateAction<Cell[][]>>,
    onDone: () => void,
  ) => {
    const maxLen = Math.max(...lines.map(l => l.length));
    let col = 0;

    // Glitch unresolved chars
    const glitchTick = setInterval(() => {
      setGrid(prev => prev.map(row => row.map(cell =>
        cell.resolved ? cell : { ...cell, display: rng() }
      )));
    }, 55);

    // Column sweep — left to right
    const sweepTick = setInterval(() => {
      if (col >= maxLen) {
        clearInterval(sweepTick);
        clearInterval(glitchTick);
        setScanCol(-1);
        // Brief chromatic pulse on completion
        setChromatic(true);
        setTimeout(() => setChromatic(false), 400);
        onDone();
        return;
      }
      const c = col;
      setScanCol(c);
      setGrid(prev => {
        const next = prev.map(row => row.map(cell => ({ ...cell })));
        prev.forEach((_row, r) => {
          if (next[r]?.[c] && next[r][c].ch !== ' ') {
            next[r][c].resolved = true;
            next[r][c].display = next[r][c].ch;
          }
        });
        return next;
      });
      col++;
    }, 16); // ~60 fps column resolution

    return () => { clearInterval(glitchTick); clearInterval(sweepTick); };
  }, []);

  useEffect(() => {
    if (phase !== 'decode' || dDone) return;
    return startDecode(D_LINES, setDGrid, () => {
      setDDone(true);
      setTimeout(() => setMVisible(true), 250);
    });
  }, [phase, dDone, startDecode]);

  useEffect(() => {
    if (!mVisible || mDone) return;
    return startDecode(M_LINES, setMGrid, () => {
      setMDone(true);
      setTimeout(() => setPhase('hold'), 400);
    });
  }, [mVisible, mDone, startDecode]);

  // ── HOLD ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'hold') return;
    const start = Date.now();
    const DUR = Math.max(minDisplayTime, 2800);
    const pi = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / DUR) * 100);
      setProgress(p);
      if (p >= 100) { clearInterval(pi); setPhase('exit'); }
    }, 40);
    const ri = setInterval(() => setRoleIdx(p => (p + 1) % ROLES.length), 720);
    return () => { clearInterval(pi); clearInterval(ri); };
  }, [phase, minDisplayTime]);

  // ── EXIT ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'exit') return;
    const t = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 900);
    return () => clearTimeout(t);
  }, [phase, onComplete]);

  // ── SKIP ──────────────────────────────────────────────────────────
  const skip = useCallback(() => { setVisible(false); onComplete?.(); }, [onComplete]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') skip();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [skip]);

  if (!visible) return null;

  const inDecodeOrLater = phase === 'decode' || phase === 'hold' || phase === 'exit';

  return (
    <div
      onClick={skip}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        cursor: 'pointer',
        height: '100dvh',
        opacity: phase === 'exit' ? 0 : 1,
        transition: phase === 'exit' ? 'opacity 0.9s ease' : 'none',
        animation: glitching ? 'glitch 0.4s steps(1) forwards' : 'none',
        fontFamily: 'var(--font-jetbrains-mono), "Courier New", Courier, monospace',
      }}
    >
      {/* ── PARTICLE FIELD ────────────────────────────────────── */}
      <ParticleCanvas />

      {/* ── CRT SCANLINES ─────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.09) 3px,rgba(0,0,0,0.09) 4px)',
        pointerEvents: 'none', zIndex: 20,
        animation: 'crtFlicker 4s infinite',
      }} />

      {/* ── HORIZONTAL SCAN LINE ──────────────────────────────── */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: '1px',
        background: `linear-gradient(90deg, transparent, rgba(0,212,255,0.15), transparent)`,
        animation: 'horizScan 4s linear infinite',
        pointerEvents: 'none', zIndex: 18,
      }} />

      {/* ── VIGNETTE ──────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 35%, rgba(0,0,0,0.92) 100%)',
        pointerEvents: 'none', zIndex: 20,
      }} />

      {/* ── DOT-GRID BACKGROUND ───────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(0,212,255,0.06) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
        pointerEvents: 'none', zIndex: 1,
        animation: 'gridPulse 4s ease-in-out infinite',
      }} />

      {/* ── AMBIENT GLOW CENTER ───────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: phase === 'hold'
          ? 'radial-gradient(ellipse 60% 55% at 50% 50%, rgba(0,40,80,0.4) 0%, transparent 70%)'
          : 'radial-gradient(ellipse 60% 55% at 50% 50%, rgba(0,30,60,0.35) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 1,
        transition: 'background 1s ease',
      }} />

      {/* ── CORNER BRACKETS ───────────────────────────────────── */}
      <CornerBrackets />

      {/* ── DECODE SCAN BEAM ──────────────────────────────────── */}
      {phase === 'decode' && (
        <div style={{
          position: 'absolute', left: 0, right: 0, height: '2px',
          background: `linear-gradient(90deg, transparent 5%, ${C.cyan} 50%, transparent 95%)`,
          animation: 'scanBeam 1.6s linear infinite',
          opacity: 0.35,
          pointerEvents: 'none', zIndex: 15,
        }} />
      )}

      {/* ── SYSTEM ONLINE FLASH ───────────────────────────────── */}
      {systemOnline && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 25, pointerEvents: 'none',
          background: 'rgba(0,212,255,0.04)',
        }}>
          <span style={{
            fontSize: 'clamp(14px, 3vw, 24px)',
            letterSpacing: '0.5em',
            color: C.cyan,
            textShadow: `0 0 20px ${C.cyan}, 0 0 60px ${C.cyan}`,
            animation: 'pulse-custom 0.3s ease-out',
            fontFamily: 'var(--font-jetbrains-mono), monospace',
          }}>
            SYSTEM ONLINE
          </span>
        </div>
      )}

      {/* ── STATUS BAR ────────────────────────────────────────── */}
      <StatusBar phase={phase} />

      {/* ── CONTENT PANEL ─────────────────────────────────────── */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: '720px',
        padding: '16px 20px',
      }}>
        {/* Terminal window chrome */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '8px 14px',
          border: `1px solid ${C.dimFaint}`,
          borderBottom: 'none',
          borderRadius: '8px 8px 0 0',
          background: 'rgba(0,10,22,0.9)',
          backdropFilter: 'blur(12px)',
        }}>
          {([
            [C.red, C.red + 'aa'],
            [C.yellow, C.yellow + 'aa'],
            [C.greenDot, C.greenDot + 'aa'],
          ] as [string, string][]).map(([col, glow], i) => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: '50%',
              background: col, boxShadow: `0 0 6px ${glow}`,
            }} />
          ))}
          <span style={{
            marginLeft: 10, color: C.dim,
            fontSize: '10px', letterSpacing: '0.14em',
          }}>
            identity_matrix.sh — omega@nexus:~ — 80×24
          </span>
          <span style={{
            marginLeft: 'auto', color: C.dimFaint,
            fontSize: '9px', letterSpacing: '0.08em',
          }}>
            CLEARANCE: Ω
          </span>
        </div>

        {/* Terminal body */}
        <div style={{
          padding: '18px 18px 16px',
          border: `1px solid ${C.dimFaint}`,
          borderTop: `1px solid rgba(0,212,255,0.08)`,
          borderRadius: '0 0 8px 8px',
          background: 'rgba(0,4,10,0.97)',
          backdropFilter: 'blur(8px)',
          minHeight: '260px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Inner ambient line top */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
            background: `linear-gradient(90deg, transparent, ${C.cyan}22, transparent)`,
          }} />

          {/* ── BOOT PHASE ────────────────────────────────── */}
          {phase === 'boot' && (
            <div>
              {BOOT.slice(0, bootIdx).map((line, i) => {
                const isOk = line.includes('OK') || line.includes('MATCH');
                const isImportant = line.includes('CLEARANCE') || line.includes('CONFIRMED');
                return (
                  <div key={i} style={{
                    fontSize: 'clamp(9px, 1.5vw, 11px)',
                    lineHeight: '1.9',
                    color: isImportant
                      ? C.cyan
                      : i === bootIdx - 1
                        ? C.cyan
                        : isOk
                          ? 'rgba(0,212,255,0.35)'
                          : C.dim,
                    letterSpacing: '0.05em',
                    transition: 'color 0.2s',
                    animation: i === bootIdx - 1 ? 'fadeInUp-custom 0.15s ease-out' : 'none',
                  }}>
                    {line}
                    {i === bootIdx - 1 && (
                      <span style={{ animation: 'blink-cursor 0.5s step-end infinite', color: C.cyan }}>
                        █
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── DECODE / HOLD / EXIT ──────────────────────── */}
          {inDecodeOrLater && (
            <div>
              {/* Frame: top */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 6, color: C.dimFaint, fontSize: 'clamp(8px, 1.3vw, 11px)',
              }}>
                <span>╔══ IDENTITY MATRIX v2.1 ═</span>
                <span style={{
                  fontSize: '9px', letterSpacing: '0.2em', color: C.dimFaint,
                  animation: dDone && mDone ? 'none' : 'subtlePulse 1s ease-in-out infinite',
                }}>
                  {dDone && mDone ? '✓ VERIFIED' : '◌ DECODING...'}
                </span>
                <span>═══╗</span>
              </div>

              {/* DOUGLAS ASCII */}
              <div style={{
                filter: dDone && mDone
                  ? `drop-shadow(0 0 10px rgba(0,212,255,0.7)) drop-shadow(0 0 28px rgba(0,212,255,0.3))`
                  : dDone
                    ? `drop-shadow(0 0 6px rgba(0,212,255,0.5))`
                    : 'none',
                transition: 'filter 0.6s',
                marginBottom: 2,
                animation: dDone && mDone ? 'flicker-custom 6s infinite' : 'none',
              }}>
                <AsciiGrid
                  grid={dGrid}
                  resolvedColor={C.cyan}
                  glowColor={C.cyan}
                  scanCol={dDone ? -1 : scanCol}
                  chromatic={dDone && mDone && chromatic}
                />
              </div>

              {/* MITCHELL ASCII */}
              <div style={{
                opacity: mVisible ? 1 : 0,
                filter: mDone
                  ? `drop-shadow(0 0 10px rgba(126,200,227,0.6)) drop-shadow(0 0 24px rgba(126,200,227,0.25))`
                  : 'none',
                transition: 'filter 0.6s, opacity 0.2s',
                animation: dDone && mDone ? 'flicker-custom 6s 0.5s infinite' : 'none',
              }}>
                {mVisible && (
                  <AsciiGrid
                    grid={mGrid}
                    resolvedColor={C.cyan2}
                    glowColor={C.cyan2}
                    scanCol={dDone ? scanCol : -1}
                    chromatic={mDone && chromatic}
                  />
                )}
              </div>

              {/* Frame: bottom */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                marginTop: 6, color: C.dimFaint, fontSize: 'clamp(8px, 1.3vw, 11px)',
              }}>
                <span>╚══════════════════════</span>
                <span>═════════════╝</span>
              </div>

              {/* ── HOLD PHASE DETAILS ──────────────────── */}
              {(phase === 'hold' || phase === 'exit') && (
                <div style={{
                  marginTop: 16,
                  animation: 'fadeInUp-custom 0.4s ease-out',
                }}>
                  {/* Divider */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    marginBottom: 12,
                  }}>
                    <div style={{
                      flex: 1, height: 1,
                      background: `linear-gradient(90deg, transparent, ${C.dimFaint}, transparent)`,
                    }} />
                    <span style={{
                      fontSize: 'clamp(9px, 1.2vw, 11px)',
                      letterSpacing: '0.3em',
                      color: 'rgba(0,212,255,0.4)',
                      animation: 'textGlow 3s ease-in-out infinite',
                    }}>
                      ◄ THE ARCHITECT ►
                    </span>
                    <div style={{
                      flex: 1, height: 1,
                      background: `linear-gradient(90deg, transparent, ${C.dimFaint}, transparent)`,
                    }} />
                  </div>

                  {/* Audio Visualizer */}
                  <AudioViz active={phase === 'hold'} />

                  {/* Role rotator */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: '12px', letterSpacing: '0.14em',
                    marginBottom: 16, minHeight: 22,
                    justifyContent: 'center',
                  }}>
                    <span style={{ color: 'rgba(0,212,255,0.4)' }}>$ </span>
                    <span
                      key={roleIdx}
                      style={{
                        color: C.green,
                        textShadow: `0 0 8px ${C.greenDim}`,
                        animation: 'roleSlideIn 0.25s ease-out',
                      }}
                    >
                      {ROLES[roleIdx]}
                    </span>
                    <span style={{
                      animation: 'blink-cursor 0.7s step-end infinite',
                      color: C.green,
                    }}>
                      ▊
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ fontSize: '10px', letterSpacing: '0.1em' }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      color: C.dim, marginBottom: 5,
                    }}>
                      <span>LOADING INTERFACE...</span>
                      <span style={{ color: C.cyan }}>{Math.round(progress)}%</span>
                    </div>
                    <div style={{
                      height: 2, borderRadius: 2, overflow: 'hidden',
                      background: 'rgba(0,212,255,0.07)',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: `linear-gradient(90deg, ${C.cyan}, rgba(0,212,255,0.65))`,
                        boxShadow: `0 0 10px rgba(0,212,255,0.9)`,
                        transition: 'width 0.04s linear',
                        borderRadius: 2,
                      }} />
                    </div>
                    {/* Sub-bar segments */}
                    <div style={{
                      display: 'flex', gap: 2, marginTop: 4, opacity: 0.35,
                    }}>
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} style={{
                          flex: 1, height: 1,
                          background: (i / 20) * 100 <= progress ? C.cyan : 'rgba(0,212,255,0.15)',
                          transition: 'background 0.1s',
                        }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Skip hint */}
        <div style={{
          textAlign: 'center', marginTop: 10,
          fontSize: '10px', letterSpacing: '0.12em',
          color: 'rgba(0,212,255,0.16)',
        }}>
          <kbd style={{
            padding: '1px 5px', borderRadius: 3,
            border: '1px solid rgba(0,212,255,0.15)',
            background: 'rgba(0,212,255,0.04)',
            color: 'rgba(0,212,255,0.3)',
            fontSize: '9px',
          }}>ESC</kbd>
          {' '}· CLICK TO SKIP
        </div>
      </div>
    </div>
  );
}
