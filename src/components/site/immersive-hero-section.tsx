'use client';

import { useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import {
  Magnetic,
  SignatureScene,
  useFilmPlayback,
  useImmersive,
  usePinnedScene,
} from '@/components/immersive';
import { emitHeroSceneProgress } from '@/components/immersive/scene-progress';
import { easings, gsap } from '@/lib/gsap';
import { mediaManifest } from '@/lib/media-manifest';
import { methodLadder, siteProfile } from '@/lib/site-content';

const NAME_LINES = ['Douglas', 'Mitchell'] as const;

/** Doctrine title cards for the pinned film — the methodLadder, uppercased. */
const DOCTRINE_WORDS = methodLadder.map((step) => step.title.toUpperCase());

/**
 * The hero carries exactly one supporting sentence. The full summary is two;
 * the second ("holds under load") already lives in the headline, so take the
 * first sentence from the canonical source.
 */
const SUPPORT_LINE = (() => {
  const cut = siteProfile.summary.indexOf('. ');
  return cut === -1 ? siteProfile.summary : siteProfile.summary.slice(0, cut + 1);
})();

/**
 * Doctrine film pacing in progress units (total pinned timeline = 1).
 * Each word owns a slot: masked rise in, hold, masked exit up — a scrubbed
 * title-card sequence rather than a crossfade.
 */
const FILM = {
  firstWord: 0.3,
  slot: 0.14,
  wordIn: 0.06,
  wordHold: 0.085,
  wordOut: 0.06,
} as const;

/**
 * Chapter 0 — "Arrival". A product-film opening in two movements:
 *
 * Entrance (time-based, ~3s): masked letter cascade for the brand name, then
 * headline → sentence → CTAs in reading order.
 *
 * Pinned scrub (1500px), three beats:
 *   A (0–0.25)    hold the composition; scroll cue fades, backdrop pushes in.
 *   B (0.25–0.55) copy compresses through a closing clip mask; the doctrine
 *                 film takes the frame — CLARIFY → CONSTRAIN → AUTOMATE →
 *                 MEASURE, one large title card at a time.
 *   C (0.55–1)    final cards exit, vignette deepens, world dims — handoff
 *                 into 02 · Identity.
 *
 * Static contexts (reduced motion / touch / low tier) get the resting first
 * viewport with no pin and never see the film layer (hidden via CSS).
 */
export function ImmersiveHeroSection() {
  const { scrollTo } = useImmersive();
  // Film plate playback — in-view autoplay with iOS muted/playsinline
  // re-assertion. Decorative layer, so no play affordance: if playback is
  // refused the poster frame stands in as a still portrait plate.
  const { videoRef: plateRef } = useFilmPlayback({ threshold: 0.1 });

  const sectionRef = usePinnedScene<HTMLElement>(
    ({ timeline }) => {
      // Publish scrub progress so the WebGL world can respond in kind.
      timeline.eventCallback('onUpdate', () => {
        emitHeroSceneProgress(timeline.progress());
      });

      // Beat A — hold. Only the cue and a slow backdrop push move; the film
      // plate counter-drifts so the world reads as parallax depth, not a still.
      timeline
        .to('.hero-backdrop', { scale: 1.1, duration: 1 }, 0)
        .to('.hero-plate', { yPercent: -7, duration: 1 }, 0)
        .to('.hero-cue', { autoAlpha: 0, duration: 0.08 }, 0.02);

      // Beat B — the copy lifts and compresses through a closing mask.
      timeline
        .to('.hero-layer-tail', { yPercent: -22, duration: 0.2 }, 0.25)
        .to('.hero-layer-name', { yPercent: -10, duration: 0.22 }, 0.26)
        .to(
          '.hero-plate',
          { autoAlpha: 0, scale: 0.96, filter: 'blur(6px)', duration: 0.18 },
          0.26
        )
        .to(
          '.hero-copy',
          {
            clipPath: 'inset(0% 0% 100% 0%)',
            autoAlpha: 0,
            filter: 'blur(10px)',
            duration: 0.18,
          },
          0.26
        )
        .to('.hero-film', { autoAlpha: 1, duration: 0.05 }, 0.28)
        .fromTo(
          '.hero-film-frame',
          { scale: 1.05 },
          { scale: 0.985, duration: 0.62 },
          0.28
        );

      // Doctrine title cards — one word at a time, masked in from below,
      // out above, with a slight crossover between cards.
      DOCTRINE_WORDS.forEach((_, index) => {
        const at = FILM.firstWord + index * FILM.slot;
        const card = `.hero-film-word[data-index="${index}"]`;
        const title = `${card} .hero-film-title`;

        timeline
          .to(card, { autoAlpha: 1, duration: 0.04 }, at)
          .fromTo(title, { yPercent: 120 }, { yPercent: 0, duration: FILM.wordIn }, at)
          .to(title, { yPercent: -120, duration: FILM.wordOut }, at + FILM.wordHold)
          .to(card, { autoAlpha: 0, duration: 0.04 }, at + FILM.wordHold + 0.015);
      });

      // Beat C — vignette deepens, the world dims, handoff to Identity.
      timeline
        .to('.hero-backdrop', { autoAlpha: 0.3, duration: 0.4 }, 0.6)
        .to('.hero-vignette', { autoAlpha: 1, duration: 0.35 }, 0.62)
        .to('.hero-film', { autoAlpha: 0, duration: 0.08 }, 0.9);
    },
    {
      distance: 1500,
      scrub: 1,
      onStatic: (root) => {
        // Resting state: everything legible, world at rest, no scrub residue.
        // The film layer stays hidden via its own CSS resting state.
        emitHeroSceneProgress(0);
        gsap.set(
          root.querySelectorAll(
            '.hero-backdrop, .hero-plate, .hero-copy, .hero-layer-name, .hero-layer-tail, .hero-cue, .hero-vignette'
          ),
          { clearProps: 'opacity,visibility,transform,filter,clipPath' }
        );
      },
    }
  );

  // Entrance: masked letter cascade for the name, then the supporting copy
  // arrives in reading order. CSS holds the pre-hydration hidden state (see
  // .hero-arrival rules); reduced motion never enters this branch.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap
          .timeline({ defaults: { ease: easings.expo } })
          .fromTo(
            '.hero-letter',
            { yPercent: 120 },
            { yPercent: 0, duration: 1.15, stagger: { each: 0.032, from: 'start' } },
            0.18
          )
          // The film plate mask-reveals out of its own letterbox slit while
          // the film inside settles back — a product-film opening beat.
          .fromTo(
            '.hero-plate',
            { autoAlpha: 0, clipPath: 'inset(42% 8% 42% 8%)' },
            { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 1.35 },
            0.45
          )
          .fromTo(
            '.hero-plate-video',
            { scale: 1.24 },
            { scale: 1, duration: 2.1, ease: 'power2.out' },
            0.45
          )
          .fromTo(
            '[data-arrive]',
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1 },
            0.65
          );
      });

      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  const handleAnchor = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, target: string) => {
      event.preventDefault();
      scrollTo(target);
    },
    [scrollTo]
  );

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="hero-arrival relative min-h-[100svh] overflow-hidden"
    >
      <div className="hero-backdrop absolute inset-0 -z-10 will-change-transform">
        <SignatureScene className="absolute inset-0 h-full w-full" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(80% 60% at 70% 40%, transparent 0%, color-mix(in oklch, var(--background), transparent 35%) 70%, var(--background) 100%)',
          }}
          aria-hidden
        />

        {/* Cinematic film plate — the product-film object inside the Arrival
            world. Desktop: a letterboxed portrait plate with grain and teal
            edge hairlines floating in the WebGL field. Mobile: the dominant
            full-bleed visual behind the copy (see .hero-plate media query).
            Decorative — the story is carried by the copy. */}
        <div className="hero-plate" aria-hidden>
          <div className="hero-plate-frame">
            <video
              ref={plateRef}
              className="hero-plate-video"
              src={mediaManifest.hero.videoLoop}
              poster={mediaManifest.hero.videoPoster}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              disablePictureInPicture
              tabIndex={-1}
            />
            <span className="hero-plate-grain" />
            <span className="hero-plate-scrim" />
            <span className="hero-plate-edge hero-plate-edge-top" />
            <span className="hero-plate-edge hero-plate-edge-bottom" />
            <span className="hero-plate-meta hero-plate-meta-top">
              <span>Reel 01 — Arrival</span>
              <span>Loop</span>
            </span>
            <span className="hero-plate-meta hero-plate-meta-bottom">
              <span>Field print · Houston</span>
              <span>29°45′ N</span>
            </span>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-48 bg-gradient-to-t from-background via-background/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-background/55 to-transparent" />

      {/* Beat C vignette — deepens as the film hands off into Identity. */}
      <div
        className="hero-vignette pointer-events-none absolute inset-0 z-30 opacity-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 46%, transparent 26%, color-mix(in oklch, var(--background), transparent 55%) 62%, var(--background) 97%)',
        }}
        aria-hidden
      />

      {/* Without JS the entrance timeline never runs — restore the resting state. */}
      <noscript>
        <style>{`.hero-arrival [data-arrive]{opacity:1!important}.hero-arrival .hero-letter{transform:none!important}.hero-arrival .hero-plate{opacity:1!important}`}</style>
      </noscript>

      {/* Doctrine film — pinned title cards. Decorative: the methodLadder is
          read properly in chapter 04, so this layer stays aria-hidden. */}
      <div className="hero-film pointer-events-none absolute inset-0 z-20" aria-hidden>
        <div className="hero-film-scrim absolute inset-0" />
        <div className="hero-film-frame absolute inset-0 will-change-transform">
          {DOCTRINE_WORDS.map((word, index) => (
            <div key={word} data-index={index} className="hero-film-word">
              <span className="hero-film-index">
                {String(index + 1).padStart(2, '0')}
                <span> / {String(DOCTRINE_WORDS.length).padStart(2, '0')}</span>
              </span>
              <span className="hero-film-mask">
                <span className="hero-film-title">{word}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-copy clip-mask editorial-container relative z-20 flex min-h-[100svh] flex-col justify-end pb-14 pt-28 md:pb-20 md:pt-36">
        {/* Hero budget: brand signal · one headline · one sentence · CTAs · cue */}
        <div className="hero-layer-name will-change-transform">
          <p className="chapter-label mb-8" data-arrive>
            01 · Arrival
            <span className="normal-case tracking-[0.08em] text-muted-foreground/70">
              {siteProfile.location}
            </span>
          </p>

          <h1 className="display-title" aria-label="Douglas Mitchell">
            {NAME_LINES.map((line, lineIndex) => (
              <span
                key={line}
                className="kinetic-line"
                aria-hidden
                style={
                  lineIndex === 1
                    ? {
                        color: 'color-mix(in oklch, var(--foreground), transparent 38%)',
                        marginTop: '-0.04em',
                      }
                    : undefined
                }
              >
                {line.split('').map((letter, letterIndex) => (
                  <span
                    key={`${line}-${letterIndex}`}
                    className="hero-letter inline-block will-change-transform"
                  >
                    {letter}
                  </span>
                ))}
              </span>
            ))}
          </h1>
        </div>

        <div className="hero-layer-tail will-change-transform">
          <div className="mt-10 grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-end">
            <div>
              <p
                className="max-w-xl text-[1.35rem] font-medium leading-snug tracking-tight text-foreground/90 md:text-[1.7rem]"
                data-arrive
              >
                Decision systems that hold under load.
              </p>
              <p
                className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg"
                data-arrive
              >
                {SUPPORT_LINE}
              </p>
            </div>

            <div
              className="flex flex-col gap-3 sm:flex-row sm:items-center md:justify-end"
              data-arrive
            >
              <Magnetic>
                <a
                  href="#atlas"
                  onClick={(event) => handleAnchor(event, '#atlas')}
                  className="immersive-button w-fit"
                >
                  Enter the system
                  <ArrowDown className="h-4 w-4" />
                </a>
              </Magnetic>
              <Magnetic strength={0.26}>
                <a
                  href="#simulator"
                  onClick={(event) => handleAnchor(event, '#simulator')}
                  className="immersive-button-ghost w-fit"
                >
                  Run the gate
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Magnetic>
            </div>
          </div>

          <div className="hero-cue scroll-cue mt-14" data-arrive aria-hidden>
            <span className="scroll-cue-track" />
            <span className="immersive-kicker">Scroll — 02 · Identity</span>
          </div>
        </div>
      </div>
    </section>
  );
}
