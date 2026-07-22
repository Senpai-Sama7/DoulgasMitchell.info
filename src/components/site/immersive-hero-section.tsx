'use client';

import { useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import {
  Magnetic,
  SignatureScene,
  useImmersive,
  usePinnedScene,
} from '@/components/immersive';
import { easings, gsap } from '@/lib/gsap';
import { siteProfile } from '@/lib/site-content';

const NAME_LINES = ['Douglas', 'Mitchell'] as const;

/**
 * Chapter 0 — "Arrival". Full-viewport cinematic opener: kinetic letter
 * reveal for the brand name, one headline, one supporting sentence, magnetic
 * CTAs, and a brief pinned scrub (1300px) where the copy parallaxes away from
 * the dimming SignatureScene backdrop before handing off to Identity.
 */
export function ImmersiveHeroSection() {
  const { scrollTo } = useImmersive();

  // Pinned departure: backdrop recedes and dims, copy layers lift at
  // staggered rates, then the whole composition fades into the next chapter.
  const sectionRef = usePinnedScene<HTMLElement>(
    ({ timeline }) => {
      timeline
        .to('.hero-backdrop', { scale: 1.12, autoAlpha: 0.35, duration: 1 }, 0)
        .to('.hero-layer-name', { yPercent: -12, duration: 1 }, 0)
        .to('.hero-layer-tail', { yPercent: -26, duration: 1 }, 0)
        .to('.hero-cue', { autoAlpha: 0, duration: 0.12 }, 0.02)
        .to('.hero-copy', { autoAlpha: 0, filter: 'blur(8px)', duration: 0.3 }, 0.7);
    },
    {
      distance: 1300,
      scrub: 1,
      onStatic: (root) => {
        // Resting state: everything legible, no residual scrub styles.
        gsap.set(
          root.querySelectorAll('.hero-backdrop, .hero-copy, .hero-layer-name, .hero-layer-tail, .hero-cue'),
          { clearProps: 'opacity,visibility,transform,filter' }
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
            { yPercent: 115 },
            { yPercent: 0, duration: 1.1, stagger: 0.035 },
            0.15
          )
          .fromTo(
            '[data-arrive]',
            { autoAlpha: 0, y: 22 },
            { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.09 },
            0.6
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
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-48 bg-gradient-to-t from-background via-background/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-background/55 to-transparent" />

      {/* Without JS the entrance timeline never runs — restore the resting state. */}
      <noscript>
        <style>{`.hero-arrival [data-arrive]{opacity:1!important}.hero-arrival .hero-letter{transform:none!important}`}</style>
      </noscript>

      <div className="hero-copy editorial-container relative z-20 flex min-h-[100svh] flex-col justify-end pb-14 pt-28 md:pb-20 md:pt-36">
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
                {siteProfile.summary}
              </p>
            </div>

            <div
              className="flex flex-col gap-3 sm:flex-row sm:items-center md:justify-end"
              data-arrive
            >
              <Magnetic>
                <a
                  href="#about"
                  onClick={(event) => handleAnchor(event, '#about')}
                  className="immersive-button w-fit"
                >
                  Enter the story
                  <ArrowDown className="h-4 w-4" />
                </a>
              </Magnetic>
              <Magnetic strength={0.26}>
                <a
                  href="#work"
                  onClick={(event) => handleAnchor(event, '#work')}
                  className="immersive-button-ghost w-fit"
                >
                  Proof of work
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
