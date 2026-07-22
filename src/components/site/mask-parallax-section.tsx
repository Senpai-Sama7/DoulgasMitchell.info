'use client';

import { useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Magnetic, usePinnedScene } from '@/components/immersive';
import { useImmersive } from '@/components/immersive/immersive-context';
import { easings, gsap } from '@/lib/gsap';

/** Kinetic statement, unmasked line-by-line by the scrub. */
const STATEMENT_LINES = ['Systems that', 'survive contact', 'with reality.'] as const;

interface CinemaPanel {
  id: 'atlas' | 'telemetry' | 'instrument' | 'proof';
  /** Chapter number the panel points at (post-Cinema numbering). */
  chapter: string;
  figure: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
}

/**
 * Fore-layer destinations. Deliberately asymmetric — each panel has its own
 * size, offset, and editorial label; they are wayfinding plates, not a
 * marketing card row.
 */
const CINEMA_PANELS: readonly CinemaPanel[] = [
  {
    id: 'atlas',
    chapter: '04',
    figure: 'FIG 03–A',
    eyebrow: 'Operating graph',
    title: 'Atlas',
    description:
      'The live map — decision paths, automation boundaries, and proof surfaces wired as one graph.',
    href: '#atlas',
    cta: 'Open the atlas',
  },
  {
    id: 'telemetry',
    chapter: '05',
    figure: 'FIG 03–B',
    eyebrow: 'Doctrine',
    title: 'Telemetry',
    description: 'Signal, latency, and the human checkpoint — inspected together.',
    href: '#telemetry',
    cta: 'Read the signals',
  },
  {
    id: 'instrument',
    chapter: '07',
    figure: 'FIG 03–C',
    eyebrow: 'Decision gate',
    title: 'Instrument',
    description:
      'A working console for autonomy thresholds under uncertainty — run it, do not take my word.',
    href: '#simulator',
    cta: 'Run the instrument',
  },
  {
    id: 'proof',
    chapter: '08',
    figure: 'FIG 03–D',
    eyebrow: 'Receipts',
    title: 'Proof',
    description: 'Shipped systems with inspectable outcomes.',
    href: '#work',
    cta: 'Inspect the work',
  },
];

/** Full scrub span of the pinned scene (timeline time units). */
const SCENE_SPAN = 5;

/**
 * Chapter 03 — Cinema. A ~1800px pinned depth study in three planes:
 *
 * - BACK  `.cinema-mask-field` / `.cinema-mask-scan` — grain + gradient field
 *   behind a composite (radial ∩ linear) CSS mask, drifting slower than the
 *   content on the scrub.
 * - MID   `.cinema-statement` — the kinetic claim, unmasked line-by-line via
 *   clip-path, counter-drifting against the field, then receding (scale /
 *   opacity / blur) as the fore plane arrives.
 * - FORE  `.cinema-deck` — four CSS-3D plates under a perspective parent that
 *   scrub from rotateX(18°) translateZ(-80px) to upright, staggered, each a
 *   Magnetic link into a later chapter.
 *
 * A progress hairline at the bottom of the pin tracks the whole scrub.
 * Touch, reduced-motion, and low-tier contexts skip the pin entirely and get
 * the final upright composition as a normal flowing chapter.
 */
export function MaskParallaxSection() {
  const { scrollTo } = useImmersive();
  const prefersReducedMotion = useReducedMotion();

  const handlePanelNavigate = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      event.preventDefault();
      scrollTo(href, { immediate: prefersReducedMotion === true });
    },
    [prefersReducedMotion, scrollTo]
  );

  const stageRef = usePinnedScene<HTMLDivElement>(
    ({ timeline, root }) => {
      root.dataset.motion = 'pinned';

      const maskField = root.querySelector<HTMLElement>('.cinema-mask-field');
      const maskScan = root.querySelector<HTMLElement>('.cinema-mask-scan');
      const opening = root.querySelector<HTMLElement>('.cinema-opening');
      const statement = root.querySelector<HTMLElement>('.cinema-statement');
      const lines = gsap.utils.toArray<HTMLElement>('.cinema-line', root);
      const cards = gsap.utils.toArray<HTMLElement>('.cinema-card-3d', root);
      const exit = root.querySelector<HTMLElement>('.cinema-exit');
      const progress = root.querySelector<HTMLElement>('.cinema-progress-fill');

      // ── Parallax spine: three planes, three speeds, whole scrub ────────
      if (maskField) {
        timeline.fromTo(
          maskField,
          { yPercent: -4.5 },
          { yPercent: 4.5, duration: SCENE_SPAN, ease: 'none' },
          0
        );
      }
      if (maskScan) {
        timeline.fromTo(
          maskScan,
          { yPercent: -8 },
          { yPercent: 8, duration: SCENE_SPAN, ease: 'none' },
          0
        );
      }
      if (statement) {
        // Counter-drift against the field sells the depth between planes.
        timeline.fromTo(
          statement,
          { yPercent: 4 },
          { yPercent: -6, duration: SCENE_SPAN, ease: 'none' },
          0
        );
      }
      if (progress) {
        timeline.fromTo(
          progress,
          { scaleX: 0 },
          { scaleX: 1, duration: SCENE_SPAN, ease: 'none' },
          0
        );
      }

      // ── Movement I: chapter slate, then the claim unmasks line-by-line ─
      if (opening) {
        timeline.fromTo(
          opening,
          { autoAlpha: 0, y: 26 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: easings.power4 },
          0.05
        );
      }

      lines.forEach((line, index) => {
        timeline.fromTo(
          line,
          { clipPath: 'inset(-12% 100% -14% 0%)', yPercent: 14 },
          {
            clipPath: 'inset(-12% 0% -14% 0%)',
            yPercent: 0,
            duration: 0.75,
            ease: easings.power4,
          },
          0.35 + index * 0.5
        );
      });

      // ── Movement II: the claim recedes into the field… ─────────────────
      if (statement) {
        timeline.to(
          statement,
          {
            scale: 0.94,
            autoAlpha: 0.2,
            filter: 'blur(7px)',
            transformOrigin: '50% 42%',
            duration: 1,
            ease: 'power2.inOut',
          },
          2.45
        );
      }

      // ── …and the fore plane stands up: tilted plates scrub upright ─────
      cards.forEach((card, index) => {
        const at = 2.55 + index * 0.3;

        timeline.fromTo(
          card,
          { autoAlpha: 0, yPercent: 16, rotateX: 18, z: -80 },
          {
            autoAlpha: 1,
            yPercent: 0,
            rotateX: 0,
            z: 0,
            duration: 0.95,
            ease: easings.power4,
          },
          at
        );

        const rule = card.querySelector<HTMLElement>('.cinema-card-rule');
        if (rule) {
          timeline.fromTo(
            rule,
            { scaleX: 0 },
            { scaleX: 1, duration: 0.5, ease: easings.cubic },
            at + 0.4
          );
        }
      });

      if (exit) {
        timeline.fromTo(
          exit,
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.45, ease: easings.power4 },
          4.4
        );
      }
    },
    {
      distance: 1800,
      scrub: 1,
      onStatic: (root) => {
        // Static path: final upright composition, no pin trap.
        root.dataset.motion = 'static';
        gsap.set(
          root.querySelectorAll(
            '.cinema-mask-field, .cinema-mask-scan, .cinema-opening, .cinema-statement, .cinema-line, .cinema-card-3d, .cinema-card-rule, .cinema-exit, .cinema-progress-fill'
          ),
          { clearProps: 'all' }
        );
      },
    }
  );

  return (
    <section id="cinema" className="cinema-section" aria-labelledby="cinema-title">
      <div ref={stageRef} className="cinema-stage">
        {/* BACK plane — masked grain/gradient field + structural scan rules */}
        <div className="cinema-mask-field cinema-mask-composite" aria-hidden />
        <div className="cinema-mask-scan cinema-mask-frame" aria-hidden />

        <div className="cinema-shell">
          <header className="cinema-opening">
            <p className="cinema-chapter">Chapter 03 · Cinema</p>
            <p className="cinema-kicker">Depth / the operating field in three planes</p>
          </header>

          {/* MID plane — kinetic claim */}
          <h2 id="cinema-title" className="cinema-statement">
            {STATEMENT_LINES.map((line, index) => (
              <span
                key={line}
                className={index === STATEMENT_LINES.length - 1 ? 'cinema-line cinema-line-em' : 'cinema-line'}
              >
                {line}
              </span>
            ))}
          </h2>

          {/* FORE plane — CSS-3D wayfinding plates */}
          <div className="cinema-deck">
            <ul className="cinema-deck-grid" aria-label="Chapter destinations">
              {CINEMA_PANELS.map((panel) => (
                <li key={panel.id} className="cinema-card-3d" data-panel={panel.id}>
                  <p className="cinema-card-figure">
                    <span>{panel.figure}</span>
                    <span>CH {panel.chapter}</span>
                  </p>
                  <h3 className="cinema-card-title">{panel.title}</h3>
                  <p className="cinema-card-eyebrow">{panel.eyebrow}</p>
                  <p className="cinema-card-desc">{panel.description}</p>
                  <span className="cinema-card-rule" aria-hidden />
                  <Magnetic className="cinema-card-cta" strength={0.22} radius={90}>
                    <a
                      href={panel.href}
                      data-cursor="interactive"
                      className="cinema-card-link"
                      onClick={(event) => handlePanelNavigate(event, panel.href)}
                    >
                      {panel.cta} <span aria-hidden>→</span>
                    </a>
                  </Magnetic>
                </li>
              ))}
            </ul>
            <p className="cinema-exit">Three planes, one field — pick where to land.</p>
          </div>

          {/* Progress hairline — bottom of the pin */}
          <div className="cinema-progress" aria-hidden>
            <span className="cinema-progress-fill" />
          </div>
        </div>
      </div>
    </section>
  );
}
