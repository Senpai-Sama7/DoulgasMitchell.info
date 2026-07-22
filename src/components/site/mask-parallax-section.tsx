'use client';

import { useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';
import { Magnetic, usePinnedScene } from '@/components/immersive';
import { useImmersive } from '@/components/immersive/immersive-context';
import { easings, gsap } from '@/lib/gsap';
import { mediaManifest } from '@/lib/media-manifest';

/** Movement I — the claim, unmasked line-by-line, then parted like curtains. */
const STATEMENT_LINES = ['Systems that', 'survive contact', 'with reality.'] as const;

/** Movement III — kinetic overline carried on top of the full-bleed film. */
const OVERLINE_LINES = ['Built in the field,', 'proved under load.'] as const;

interface CinemaWaypoint {
  id: 'atlas' | 'telemetry' | 'instrument' | 'proof';
  /** Chapter number the strip points at (post-Cinema numbering). */
  chapter: string;
  figure: string;
  title: string;
  note: string;
  href: string;
}

/**
 * Movement IV — the waypoint corridor. Full-width editorial index strips
 * (number / title / note / arrow), not cards: each is a single Magnetic
 * anchor row separated by hairlines, standing up out of CSS-3D perspective.
 */
const CINEMA_WAYPOINTS: readonly CinemaWaypoint[] = [
  {
    id: 'atlas',
    chapter: '04',
    figure: 'FIG 03–A',
    title: 'Atlas',
    note: 'The operating graph — decision paths and proof surfaces wired as one map.',
    href: '#atlas',
  },
  {
    id: 'telemetry',
    chapter: '05',
    figure: 'FIG 03–B',
    title: 'Telemetry',
    note: 'Signal, latency, and the human checkpoint — inspected together.',
    href: '#telemetry',
  },
  {
    id: 'instrument',
    chapter: '07',
    figure: 'FIG 03–C',
    title: 'Instrument',
    note: 'A working console for autonomy thresholds — run it, do not take my word.',
    href: '#simulator',
  },
  {
    id: 'proof',
    chapter: '08',
    figure: 'FIG 03–D',
    title: 'Proof',
    note: 'Shipped systems with inspectable outcomes.',
    href: '#work',
  },
];

/** Full scrub span of the pinned scene (timeline time units). */
const SCENE_SPAN = 10;

/** Pinned scroll distance in px — a long-form chapter, not a section beat. */
const SCENE_DISTANCE = 2600;

/**
 * Chapter 03 — Cinema. A ~2600px pinned scroll-story in four movements, cut
 * like one continuous take rather than a section of cards:
 *
 *  I    SLATE — chapter slate stamps in; the claim unmasks line-by-line
 *       through clip-path while counter-drifting against the field.
 *  II   THE FILM — the statement parts like curtains (lines drift apart and
 *       soften) as a full-bleed media plane opens through it: a rounded slit
 *       (inset … round 999px) that relaxes into a hard-edged full-bleed
 *       rectangle while the film inside counter-zooms. A mono figure caption
 *       stamps the frame.
 *  III  OVERLINE — kinetic serif lines rise through masks on top of the
 *       film while it slowly pans; then the film contracts into an offset
 *       left plate, handing the frame to the corridor.
 *  IV   CORRIDOR — four editorial waypoint strips (Atlas / Telemetry /
 *       Instrument / Proof) stand up out of CSS-3D perspective, each a
 *       Magnetic full-row link into a later chapter.
 *
 * Persistent apparatus: a masked grain/gradient field + scan grid parallax
 * on the BACK plane, a scrub-driven vignette breathing over the film, a
 * rolling movement counter (01–04) top-right, and a progress hairline along
 * the bottom of the pin.
 *
 * Touch, reduced-motion, and low-tier contexts skip the pin entirely and get
 * the flowing editorial composition: slate → statement → film figure →
 * pull-line → waypoint index.
 */
export function MaskParallaxSection() {
  const { scrollTo } = useImmersive();
  const prefersReducedMotion = useReducedMotion();

  const handleWaypointNavigate = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      event.preventDefault();
      scrollTo(href, { immediate: prefersReducedMotion === true });
    },
    [prefersReducedMotion, scrollTo]
  );

  const stageRef = usePinnedScene<HTMLDivElement>(
    ({ timeline, root }) => {
      root.dataset.motion = 'pinned';

      const field = root.querySelector<HTMLElement>('.cinema-field');
      const scan = root.querySelector<HTMLElement>('.cinema-scan');
      const vignette = root.querySelector<HTMLElement>('.cinema-vignette');
      const opening = root.querySelector<HTMLElement>('.cinema-opening');
      const lines = gsap.utils.toArray<HTMLElement>('.cinema-line', root);
      const media = root.querySelector<HTMLElement>('.cinema-media');
      const mediaVideo = root.querySelector<HTMLElement>('.cinema-media-video');
      const mediaScrim = root.querySelector<HTMLElement>('.cinema-media-scrim');
      const caption = root.querySelector<HTMLElement>('.cinema-media-caption');
      const overlineTexts = gsap.utils.toArray<HTMLElement>('.cinema-overline-text', root);
      const strips = gsap.utils.toArray<HTMLElement>('.cinema-strip', root);
      const exit = root.querySelector<HTMLElement>('.cinema-exit');
      const progress = root.querySelector<HTMLElement>('.cinema-progress-fill');
      const movementTrack = root.querySelector<HTMLElement>('.cinema-movements-track');
      const movements = root.querySelector<HTMLElement>('.cinema-movements');

      // ── Parallax spine — BACK plane drifts across the whole scrub ───────
      if (field) {
        timeline.fromTo(
          field,
          { yPercent: -5 },
          { yPercent: 5, duration: SCENE_SPAN, ease: 'none' },
          0
        );
      }
      if (scan) {
        timeline.fromTo(
          scan,
          { yPercent: -9 },
          { yPercent: 9, duration: SCENE_SPAN, ease: 'none' },
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
      if (vignette) {
        timeline
          .fromTo(
            vignette,
            { autoAlpha: 0 },
            { autoAlpha: 0.7, duration: 0.9, ease: 'power1.out' },
            0
          )
          .to(vignette, { autoAlpha: 0, duration: 0.8, ease: 'power1.in' }, 9.2);
      }
      if (movements) {
        timeline.fromTo(
          movements,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.4, ease: 'power2.out' },
          0.1
        );
      }

      // ── Movement I — slate, then the claim unmasks line-by-line ─────────
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
          { clipPath: 'inset(-12% 100% -14% 0%)', yPercent: 16 },
          {
            clipPath: 'inset(-12% 0% -14% 0%)',
            yPercent: 0,
            duration: 0.7,
            ease: easings.power4,
          },
          0.3 + index * 0.42
        );
      });

      // ── Movement II — the type parts like curtains, the film opens ──────
      const partings = [
        { xPercent: -22, at: 2.2 },
        { xPercent: 16, at: 2.35 },
        { xPercent: -12, at: 2.5 },
      ] as const;
      lines.forEach((line, index) => {
        const part = partings[index] ?? partings[partings.length - 1];
        timeline.to(
          line,
          {
            xPercent: part.xPercent,
            autoAlpha: 0,
            filter: 'blur(6px)',
            duration: 0.9,
            ease: 'power2.in',
          },
          part.at
        );
      });
      if (opening) {
        timeline.to(opening, { autoAlpha: 0.35, duration: 0.6, ease: 'power1.inOut' }, 2.6);
      }

      if (media) {
        timeline
          .fromTo(
            media,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.4, ease: 'power1.out' },
            2.3
          )
          // Rounded slit → soft rectangle → hard full bleed. Keeping every
          // keyframe an `inset(… round …)` keeps the whole morph tweenable.
          .fromTo(
            media,
            { clipPath: 'inset(46% 42% 46% 42% round 999px)' },
            {
              clipPath: 'inset(14% 10% 14% 10% round 20px)',
              duration: 1.3,
              ease: 'power2.inOut',
            },
            2.4
          )
          .to(
            media,
            { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.0, ease: 'power3.inOut' },
            3.8
          );
      }
      if (mediaVideo) {
        // Counter-zoom: the frame opens while the film inside settles back.
        timeline
          .fromTo(
            mediaVideo,
            { scale: 1.35 },
            { scale: 1.12, duration: 2.4, ease: 'power2.out' },
            2.4
          )
          // Slow pan under the overline — one continuous camera move.
          .fromTo(
            mediaVideo,
            { xPercent: -1.5 },
            { xPercent: 1.5, duration: 2.2, ease: 'none' },
            4.8
          );
      }
      if (mediaScrim) {
        timeline.fromTo(
          mediaScrim,
          { autoAlpha: 0.25 },
          { autoAlpha: 0.6, duration: 0.6, ease: 'power1.inOut' },
          4.5
        );
      }
      if (caption) {
        timeline.fromTo(
          caption,
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: 0.5, ease: easings.power4 },
          4.6
        );
      }

      // ── Movement III — kinetic overline over the film, then the handoff ─
      overlineTexts.forEach((text, index) => {
        timeline
          .fromTo(
            text,
            { yPercent: 120 },
            { yPercent: 0, duration: 0.8, ease: easings.power4 },
            5.0 + index * 0.3
          )
          .to(
            text,
            { yPercent: -130, duration: 0.55, ease: 'power3.in' },
            6.5 + index * 0.12
          );
      });

      if (caption) {
        timeline.to(caption, { autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, 6.6);
      }
      if (media) {
        // The film contracts into an offset left plate — the corridor's stage.
        timeline.to(
          media,
          {
            clipPath: 'inset(12% 46% 12% 4% round 10px)',
            duration: 0.9,
            ease: 'power3.inOut',
          },
          6.8
        );
      }
      if (mediaVideo) {
        timeline.to(mediaVideo, { scale: 1.02, duration: 0.9, ease: 'power2.inOut' }, 6.8);
      }
      if (mediaScrim) {
        timeline.to(mediaScrim, { autoAlpha: 0.35, duration: 0.7, ease: 'power1.inOut' }, 6.8);
      }
      if (opening) {
        timeline.to(opening, { autoAlpha: 1, duration: 0.5, ease: 'power1.out' }, 7.0);
      }

      // ── Movement IV — waypoint strips stand up out of perspective ───────
      strips.forEach((strip, index) => {
        const at = 7.2 + index * 0.5;
        timeline.fromTo(
          strip,
          { autoAlpha: 0, yPercent: 26, rotateX: 24, z: -120 },
          {
            autoAlpha: 1,
            yPercent: 0,
            rotateX: 0,
            z: 0,
            duration: 0.85,
            ease: easings.power4,
          },
          at
        );

        const rule = strip.querySelector<HTMLElement>('.cinema-strip-rule');
        if (rule) {
          timeline.fromTo(
            rule,
            { scaleX: 0 },
            { scaleX: 1, duration: 0.5, ease: easings.cubic },
            at + 0.35
          );
        }
      });

      if (exit) {
        timeline.fromTo(
          exit,
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.4, ease: easings.power4 },
          9.5
        );
      }

      // ── Movement counter — rolls 01 → 04 at each cut ─────────────────────
      if (movementTrack) {
        timeline
          .to(movementTrack, { yPercent: -25, duration: 0.5, ease: easings.power4 }, 2.3)
          .to(movementTrack, { yPercent: -50, duration: 0.5, ease: easings.power4 }, 5.0)
          .to(movementTrack, { yPercent: -75, duration: 0.5, ease: easings.power4 }, 7.2);
      }
    },
    {
      distance: SCENE_DISTANCE,
      scrub: 1,
      onStatic: (root) => {
        // Static path: the flowing editorial composition, no pin trap.
        root.dataset.motion = 'static';
        gsap.set(
          root.querySelectorAll(
            '.cinema-field, .cinema-scan, .cinema-vignette, .cinema-opening, .cinema-line, .cinema-media, .cinema-media-video, .cinema-media-scrim, .cinema-media-caption, .cinema-overline-text, .cinema-strip, .cinema-strip-rule, .cinema-exit, .cinema-progress-fill, .cinema-movements'
          ),
          { clearProps: 'all' }
        );
      },
    }
  );

  return (
    <section id="cinema" className="cinema-section" aria-labelledby="cinema-title">
      <div ref={stageRef} className="cinema-stage">
        {/* BACK plane — masked grain/gradient field + structural scan grid */}
        <div className="cinema-field cinema-mask-composite" aria-hidden />
        <div className="cinema-scan cinema-mask-frame" aria-hidden />
        {/* Scrub-driven vignette — breathes over the film during the pin */}
        <div className="cinema-vignette" aria-hidden />

        <div className="cinema-shell">
          <header className="cinema-opening">
            <p className="cinema-chapter">Chapter 03 · Cinema</p>
            <p className="cinema-kicker">One take / the field, the film, the map</p>
          </header>

          {/* Movement I — the claim */}
          <h2 id="cinema-title" className="cinema-statement">
            {STATEMENT_LINES.map((line, index) => (
              <span
                key={line}
                className={
                  index === STATEMENT_LINES.length - 1
                    ? 'cinema-line cinema-line-em'
                    : 'cinema-line'
                }
              >
                {line}
              </span>
            ))}
          </h2>

          {/* Movement II/III — the film plane, revealed through an evolving mask */}
          <figure className="cinema-media" data-cursor="media">
            <video
              className="cinema-media-video"
              src={mediaManifest.hero.videoLoopAlt}
              poster={mediaManifest.hero.videoPosterAlt}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              disablePictureInPicture
              tabIndex={-1}
            />
            <span className="cinema-media-scrim" aria-hidden />
            <figcaption className="cinema-media-caption">
              <span>FIG 03 — Field print</span>
              <span>29°45′ N · 95°22′ W</span>
            </figcaption>
          </figure>

          {/* Movement III — kinetic overline carried on the film */}
          <p className="cinema-overline">
            {OVERLINE_LINES.map((line) => (
              <span key={line} className="cinema-overline-mask">
                <span className="cinema-overline-text">{line}</span>
              </span>
            ))}
          </p>

          {/* Movement IV — the waypoint corridor (editorial strips, not cards) */}
          <nav className="cinema-index" aria-label="Chapter destinations">
            <ol className="cinema-index-list">
              {CINEMA_WAYPOINTS.map((waypoint, index) => (
                <li key={waypoint.id} className="cinema-strip" data-strip={waypoint.id}>
                  <Magnetic className="cinema-strip-magnet" strength={0.1} radius={150}>
                    <a
                      href={waypoint.href}
                      className="cinema-strip-link"
                      data-cursor="interactive"
                      onClick={(event) => handleWaypointNavigate(event, waypoint.href)}
                    >
                      <span className="cinema-strip-no">
                        <span>{waypoint.figure}</span>
                        <span>CH {waypoint.chapter}</span>
                      </span>
                      <span className="cinema-strip-title">{waypoint.title}</span>
                      <span className="cinema-strip-note">{waypoint.note}</span>
                      <span className="cinema-strip-arrow" aria-hidden>
                        →
                      </span>
                    </a>
                  </Magnetic>
                  <span className="cinema-strip-rule" aria-hidden data-index={index} />
                </li>
              ))}
            </ol>
            <p className="cinema-exit">One continuous take — choose where to cut.</p>
          </nav>

          {/* Progress hairline — bottom of the pin */}
          <div className="cinema-progress" aria-hidden>
            <span className="cinema-progress-fill" />
          </div>

          {/* Movement counter — rolls 01 → 04 with the cuts */}
          <div className="cinema-movements" aria-hidden>
            <span className="cinema-movements-label">Mov</span>
            <span className="cinema-movements-counter">
              <span className="cinema-movements-track">
                <span>01</span>
                <span>02</span>
                <span>03</span>
                <span>04</span>
              </span>
            </span>
            <span className="cinema-movements-total">/ 04</span>
          </div>
        </div>
      </div>
    </section>
  );
}
