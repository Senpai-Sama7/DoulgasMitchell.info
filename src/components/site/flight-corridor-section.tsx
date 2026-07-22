'use client';

import Image from 'next/image';
import { useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Magnetic, usePinnedScene } from '@/components/immersive';
import { useImmersive } from '@/components/immersive/immersive-context';
import { easings, gsap } from '@/lib/gsap';
import { mediaManifest } from '@/lib/media-manifest';

interface CorridorPlane {
  id: string;
  kicker: string;
  title: string;
  note: string;
  /** Lateral/rotational drift while flying — keeps the corridor bending. */
  drift: { x: number; y: number; ry: number };
}

/**
 * The identity planes that fly at the viewer — the three practices behind
 * everything on this site, told in first-person selling voice. The media
 * plane (the person himself) flies between the first and second claims.
 */
const CORRIDOR_PLANES: readonly CorridorPlane[] = [
  {
    id: 'operator',
    kicker: 'The operator',
    title: 'Keeps the floor moving.',
    note: 'Live operations, real constraints — intake to receipt with nothing dropped and everything logged.',
    drift: { x: -15, y: -4, ry: 6 },
  },
  {
    id: 'practitioner',
    kicker: 'The practitioner',
    title: 'Automates with a conscience.',
    note: 'AI systems with confidence routing, human checkpoints, and receipts you can audit.',
    drift: { x: -12, y: 6, ry: 5 },
  },
  {
    id: 'author',
    kicker: 'The author',
    title: 'Wrote the manual on nerve.',
    note: 'The Confident Mind — the mental operating system behind the engineering.',
    drift: { x: 14, y: -5, ry: -6 },
  },
];

/** Media plane drift — mirrors the type planes so the corridor keeps bending. */
const MEDIA_DRIFT = { x: 13, y: 5, ry: -7 } as const;

/** Number of hairline frames streaming past for tunnel structure. */
const RIB_COUNT = 6;

/** Full scrub span of the pinned corridor (timeline time units). */
const SCENE_SPAN = 9;

/** Pinned scroll distance in px. */
const SCENE_DISTANCE = 2400;

/** Per-plane flight pacing inside the pinned scrub. */
const FLIGHT = {
  first: 0.4,
  gap: 1.7,
  approach: 1.6,
  passBy: 0.55,
} as const;

/**
 * Interlude — the flight corridor. Sits between Chapter 03 (Story) and
 * Chapter 04 (Map) on the same ink, unnumbered on purpose: it is the camera
 * move between chapters, not a chapter.
 *
 * Pinned contexts get a genuine CSS-3D corridor: a perspective world where
 * hairline rib frames stream past continuously while four planes — Operator,
 * a portrait film still, Practitioner, Author — emerge from fog at deep
 * translateZ, fly up to the camera, and blow past it. The final gate plane
 * flies in, holds at z≈0, and hands off into the Atlas.
 *
 * Touch and low-tier contexts (`onSoft`) keep the flowing editorial layout
 * but scrub a compressed cut — planes rising and settling with scale — as
 * the section rides the viewport. Reduced motion gets the flowing layout
 * fully static. Transform/opacity only throughout.
 */
export function FlightCorridorSection() {
  const { scrollTo } = useImmersive();
  const prefersReducedMotion = useReducedMotion();

  const handleGateNavigate = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      scrollTo('#atlas', { immediate: prefersReducedMotion === true });
    },
    [prefersReducedMotion, scrollTo]
  );

  const stageRef = usePinnedScene<HTMLDivElement>(
    ({ timeline, root }) => {
      root.dataset.motion = 'pinned';

      const space = root.querySelector<HTMLElement>('.corridor-space');
      const slate = root.querySelector<HTMLElement>('.corridor-slate');
      const ribs = gsap.utils.toArray<HTMLElement>('.corridor-rib', root);
      const planes = gsap.utils.toArray<HTMLElement>('.corridor-plane[data-flight]', root);
      const gate = root.querySelector<HTMLElement>('.corridor-gate');
      const gateRule = root.querySelector<HTMLElement>('.corridor-gate-rule');
      const progress = root.querySelector<HTMLElement>('.corridor-progress-fill');

      // ── Camera breath — the whole 3D space banks a few degrees across the
      //    take so the corridor reads as flown, not played back. ───────────
      if (space) {
        timeline.fromTo(
          space,
          { rotateY: -2, rotateX: 1.2 },
          { rotateY: 2, rotateX: -1.2, duration: SCENE_SPAN, ease: 'none' },
          0
        );
      }

      if (slate) {
        timeline.fromTo(
          slate,
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: easings.power4 },
          0.05
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

      // ── Rib frames — hairline rectangles streaming past for structure ───
      ribs.forEach((rib, index) => {
        const at = index * 1.15;
        timeline
          .fromTo(
            rib,
            { xPercent: -50, yPercent: -50, z: -1650 },
            { z: 520, duration: 3.1, ease: 'none' },
            at
          )
          .fromTo(rib, { autoAlpha: 0 }, { autoAlpha: 0.4, duration: 0.5, ease: 'power1.out' }, at)
          .to(rib, { autoAlpha: 0, duration: 0.6, ease: 'power1.in' }, at + 2.5);
      });

      // ── The identity planes — emerge from fog, fly to camera, blow past ─
      planes.forEach((plane, index) => {
        const at = FLIGHT.first + index * FLIGHT.gap;
        const drift =
          plane.dataset.flight === 'media'
            ? MEDIA_DRIFT
            : CORRIDOR_PLANES.find((entry) => entry.id === plane.dataset.flight)?.drift ?? {
                x: 0,
                y: 0,
                ry: 0,
              };

        timeline
          .fromTo(
            plane,
            {
              z: -1450,
              xPercent: -50 + drift.x,
              yPercent: -50 + drift.y,
              rotateY: drift.ry,
              rotateX: 2,
            },
            {
              z: -40,
              xPercent: -50,
              yPercent: -50,
              rotateY: 0,
              rotateX: 0,
              duration: FLIGHT.approach,
              ease: 'none',
            },
            at
          )
          .fromTo(
            plane,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.55, ease: 'power1.out' },
            at
          )
          // Past the camera — the plane scales beyond the frame and dissolves.
          .to(
            plane,
            { z: 430, autoAlpha: 0, duration: FLIGHT.passBy, ease: 'power1.in' },
            at + FLIGHT.approach
          );
      });

      // ── The gate — flies in, holds at the camera, hands off to Atlas ────
      if (gate) {
        timeline
          .fromTo(
            gate,
            { z: -1250, xPercent: -50, yPercent: -50, rotateX: 3 },
            {
              z: 0,
              xPercent: -50,
              yPercent: -50,
              rotateX: 0,
              duration: 1.5,
              ease: 'power1.out',
            },
            6.9
          )
          .fromTo(gate, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: 'power1.out' }, 7.0);
      }
      if (gateRule) {
        timeline.fromTo(
          gateRule,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.6, ease: easings.cubic },
          8.0
        );
      }
    },
    {
      distance: SCENE_DISTANCE,
      scrub: 1,
      onStatic: (root) => {
        root.dataset.motion = 'static';
        gsap.set(
          root.querySelectorAll(
            '.corridor-space, .corridor-slate, .corridor-rib, .corridor-plane, .corridor-gate, .corridor-gate-rule, .corridor-media-img, .corridor-progress-fill'
          ),
          { clearProps: 'all' }
        );
      },
      // Compressed cut for touch / low tier: the flowing layout stays, and
      // planes rise out of depth (scale + y) as the section rides the
      // viewport — the same story without the pin.
      onSoft: ({ timeline, root }) => {
        const slate = root.querySelector<HTMLElement>('.corridor-slate');
        const planes = gsap.utils.toArray<HTMLElement>(
          '.corridor-plane, .corridor-gate',
          root
        );

        if (slate) {
          timeline.fromTo(
            slate,
            { autoAlpha: 0, y: 22 },
            { autoAlpha: 1, y: 0, duration: 0.7, ease: easings.power4 },
            0.1
          );
        }

        planes.forEach((plane, index) => {
          const at = 0.5 + index * 1.05;
          timeline.fromTo(
            plane,
            { autoAlpha: 0, y: 48, scale: 0.94 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 1.15, ease: easings.power4 },
            at
          );

          const media = plane.querySelector<HTMLElement>('.corridor-media-img');
          if (media) {
            timeline.fromTo(
              media,
              { scale: 1.14 },
              { scale: 1, duration: 1.6, ease: 'power1.out' },
              at
            );
          }

          const rule = plane.querySelector<HTMLElement>('.corridor-gate-rule');
          if (rule) {
            timeline.fromTo(
              rule,
              { scaleX: 0 },
              { scaleX: 1, duration: 0.6, ease: easings.cubic },
              at + 0.5
            );
          }
        });
      },
    }
  );

  return (
    <section
      id="corridor"
      className="corridor-section"
      aria-label="Interlude — a flight through the three practices"
    >
      <div ref={stageRef} className="corridor-stage">
        {/* Depth fog — the far end of the corridor */}
        <div className="corridor-fog" aria-hidden />

        <div className="corridor-shell">
          <header className="corridor-slate">
            <p className="corridor-label">Interlude · Flythrough</p>
            <h2 className="corridor-heading">Three practices. One person.</h2>
          </header>

          <div className="corridor-world">
            <div className="corridor-space">
              {/* Tunnel ribs — pinned corridor only (hidden in flowing layout) */}
              {Array.from({ length: RIB_COUNT }, (_, index) => (
                <span key={index} className="corridor-rib" data-rib={index} aria-hidden />
              ))}

              <article className="corridor-plane corridor-plane-type" data-flight="operator">
                <p className="corridor-plane-kicker">{CORRIDOR_PLANES[0].kicker}</p>
                <h3 className="corridor-plane-title">{CORRIDOR_PLANES[0].title}</h3>
                <p className="corridor-plane-note">{CORRIDOR_PLANES[0].note}</p>
              </article>

              {/* The person himself flies through between the claims */}
              <figure className="corridor-plane corridor-plane-media" data-flight="media">
                <span className="corridor-media-frame">
                  <Image
                    src={mediaManifest.hero.videoPosterAlt}
                    alt="Douglas Mitchell — field portrait, Houston"
                    fill
                    sizes="(max-width: 48rem) 72vw, 24vw"
                    className="corridor-media-img"
                  />
                </span>
                <figcaption className="corridor-media-caption">
                  <span>Douglas Mitchell</span>
                  <span>Houston, TX</span>
                </figcaption>
              </figure>

              <article className="corridor-plane corridor-plane-type" data-flight="practitioner">
                <p className="corridor-plane-kicker">{CORRIDOR_PLANES[1].kicker}</p>
                <h3 className="corridor-plane-title">{CORRIDOR_PLANES[1].title}</h3>
                <p className="corridor-plane-note">{CORRIDOR_PLANES[1].note}</p>
              </article>

              <article className="corridor-plane corridor-plane-type" data-flight="author">
                <p className="corridor-plane-kicker">{CORRIDOR_PLANES[2].kicker}</p>
                <h3 className="corridor-plane-title">{CORRIDOR_PLANES[2].title}</h3>
                <p className="corridor-plane-note">{CORRIDOR_PLANES[2].note}</p>
              </article>

              {/* The gate — holds at the camera and hands off into the Atlas */}
              <div className="corridor-gate">
                <p className="corridor-plane-kicker">Where this lands</p>
                <p className="corridor-gate-title">All three run on one operating map.</p>
                <span className="corridor-gate-rule" aria-hidden />
                <Magnetic strength={0.2} radius={110}>
                  <a
                    href="#atlas"
                    className="corridor-gate-link"
                    data-cursor="interactive"
                    onClick={handleGateNavigate}
                  >
                    Enter the atlas
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </a>
                </Magnetic>
              </div>
            </div>
          </div>

          {/* Progress hairline — pinned corridor only */}
          <div className="corridor-progress" aria-hidden>
            <span className="corridor-progress-fill" />
          </div>
        </div>
      </div>
    </section>
  );
}
