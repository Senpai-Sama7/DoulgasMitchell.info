'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { Magnetic, usePinnedScene } from '@/components/immersive';
import { ScrollReveal } from '@/components/immersive/scroll-reveal';
import { easings, gsap, ScrollTrigger } from '@/lib/gsap';
import { bookShowcase } from '@/lib/site-content';
import { mediaManifest } from '@/lib/media-manifest';

/**
 * Chapter 09 — The book. A pinned product reveal: the cover is a real CSS 3D
 * object (front board, spine, back board inside a perspective stage) whose
 * rotateY scrubs from a spine-forward recline to a near-frontal product shot,
 * while the title unmasks word by word and the highlights wipe in as
 * sequential clip-path unmasks. The Magnetic CTA lands last. A breathing
 * teal halo (pure CSS) sits behind the object on every tier, and fine
 * pointers get a light cursor tilt on top of the scrub. Touch and low-tier
 * contexts play a compressed soft scrub of the same turn as the section
 * scrolls through; reduced motion reads the resting editorial state.
 */
export function ImmersiveBookSection() {
  const titleWords = bookShowcase.title.split(' ');
  const highlights = bookShowcase.highlights.slice(0, 4);
  const testimonial = bookShowcase.testimonials[0];
  const tiltRef = useRef<HTMLDivElement>(null);

  // Fine-pointer garnish: a light cursor tilt on a wrapper AROUND the 3D
  // object, so it composes with (never fights) the scrub-driven rotation.
  useGSAP(
    () => {
      const el = tiltRef.current;
      if (!el) return;
      if (!window.matchMedia('(pointer: fine)').matches) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const toRotX = gsap.quickTo(el, 'rotationX', { duration: 0.55, ease: 'power3.out' });
      const toRotY = gsap.quickTo(el, 'rotationY', { duration: 0.55, ease: 'power3.out' });

      const handleMove = (event: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        const nx = (event.clientX - rect.left) / rect.width - 0.5;
        const ny = (event.clientY - rect.top) / rect.height - 0.5;
        toRotY(nx * 8);
        toRotX(ny * -6);
      };
      const handleLeave = () => {
        toRotX(0);
        toRotY(0);
      };

      el.addEventListener('pointermove', handleMove);
      el.addEventListener('pointerleave', handleLeave);
      return () => {
        el.removeEventListener('pointermove', handleMove);
        el.removeEventListener('pointerleave', handleLeave);
      };
    },
    { scope: tiltRef }
  );

  const stageRef = usePinnedScene<HTMLDivElement>(
    ({ timeline, root }) => {
      root.dataset.motion = 'pinned';

      const book = root.querySelector<HTMLElement>('.book-object');
      const sheen = root.querySelector<HTMLElement>('.book-sheen');
      const shadow = root.querySelector<HTMLElement>('.book-shadow');
      const words = gsap.utils.toArray<HTMLElement>('.artifact-title-line', root);
      const metaItems = gsap.utils.toArray<HTMLElement>('.artifact-meta-item', root);
      const unmasks = gsap.utils.toArray<HTMLElement>('.artifact-unmask', root);
      const cta = root.querySelector<HTMLElement>('.artifact-cta');

      // Wider rotation arc with a slight vertical recline that settles flat —
      // the object reads as picked up spine-first and set down facing you.
      if (book) {
        timeline.fromTo(
          book,
          { rotationY: 78, rotationX: 7, scale: 0.86 },
          { rotationY: 12, rotationX: 0, scale: 1, duration: 3.1, ease: 'none' },
          0
        );
      }
      // Specular band sweeps the cover once across the scrub — the light
      // moves because the object is turning.
      if (sheen) {
        timeline.fromTo(
          sheen,
          { xPercent: -170 },
          { xPercent: 170, duration: 3.1, ease: 'none' },
          0
        );
      }
      // Contact shadow tightens and darkens as the book squares up.
      if (shadow) {
        timeline.fromTo(
          shadow,
          { opacity: 0.35, scaleX: 1.18 },
          { opacity: 0.85, scaleX: 0.94, duration: 3.1, ease: 'none' },
          0
        );
      }
      if (words.length) {
        timeline.fromTo(
          words,
          { yPercent: 112 },
          { yPercent: 0, duration: 0.6, ease: easings.power4, stagger: 0.16 },
          0.1
        );
      }
      if (metaItems.length) {
        timeline.fromTo(
          metaItems,
          { opacity: 0, y: 26 },
          { opacity: 1, y: 0, duration: 0.45, ease: easings.power4, stagger: 0.12 },
          0.9
        );
      }
      if (unmasks.length) {
        timeline.fromTo(
          unmasks,
          { clipPath: 'inset(0 100% 0 0)', opacity: 0.2 },
          { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: 0.55, ease: 'none', stagger: 0.38 },
          1.5
        );
      }
      if (cta) {
        timeline.fromTo(
          cta,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.45, ease: easings.power4 },
          3.15
        );
      }

      // The stage locks to the viewport above — re-measure the pin spacer
      // once the new geometry has settled.
      requestAnimationFrame(() => ScrollTrigger.refresh());
    },
    {
      distance: 1600,
      onStatic: (root) => {
        root.dataset.motion = 'static';
      },
      // Soft path (touch / low tier, motion allowed): a compressed cut of the
      // pinned turn — the cover swings toward you, the sheen sweeps once, and
      // the copy reveals — scrubbed while the section rides the viewport.
      onSoft: ({ timeline, root }) => {
        const book = root.querySelector<HTMLElement>('.book-object');
        const sheen = root.querySelector<HTMLElement>('.book-sheen');
        const shadow = root.querySelector<HTMLElement>('.book-shadow');
        const words = gsap.utils.toArray<HTMLElement>('.artifact-title-line', root);
        const metaItems = gsap.utils.toArray<HTMLElement>('.artifact-meta-item', root);
        const unmasks = gsap.utils.toArray<HTMLElement>('.artifact-unmask', root);
        const cta = root.querySelector<HTMLElement>('.artifact-cta');

        if (book) {
          timeline.fromTo(
            book,
            { rotationY: 52, rotationX: 5, scale: 0.9 },
            { rotationY: 10, rotationX: 0, scale: 1, duration: 2.2, ease: 'none' },
            0
          );
        }
        if (sheen) {
          timeline.fromTo(
            sheen,
            { xPercent: -170 },
            { xPercent: 170, duration: 2.4, ease: 'none' },
            0.2
          );
        }
        if (shadow) {
          timeline.fromTo(
            shadow,
            { opacity: 0.4, scaleX: 1.14 },
            { opacity: 0.85, scaleX: 0.94, duration: 2.2, ease: 'none' },
            0
          );
        }
        if (words.length) {
          timeline.fromTo(
            words,
            { yPercent: 112 },
            { yPercent: 0, duration: 0.5, ease: easings.power4, stagger: 0.12 },
            0.15
          );
        }
        if (metaItems.length) {
          timeline.fromTo(
            metaItems,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, ease: easings.power4, stagger: 0.1 },
            0.5
          );
        }
        if (unmasks.length) {
          timeline.fromTo(
            unmasks,
            { clipPath: 'inset(0 100% 0 0)', opacity: 0.2 },
            { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: 0.5, ease: 'none', stagger: 0.3 },
            1.1
          );
        }
        if (cta) {
          timeline.fromTo(
            cta,
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.4, ease: easings.power4 },
            2.3
          );
        }
      },
    }
  );

  return (
    <section id="book">
      <div ref={stageRef} className="artifact-stage">
        <div className="editorial-container w-full">
          <div className="artifact-grid">
            {/* CSS 3D product stage */}
            <div className="book-stage-3d">
              <div className="relative">
                {/* Breathing halo — CSS-animated, still under reduced motion */}
                <div className="book-glow" aria-hidden />
                <a
                  href={bookShowcase.amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${bookShowcase.title} on Amazon`}
                  data-cursor="media"
                  className="block"
                >
                  <div ref={tiltRef} className="book-tilt">
                    <div className="book-object">
                      <div className="book-face-back" aria-hidden />
                      <div className="book-spine" aria-hidden>
                        <span className="book-spine-label">{bookShowcase.title}</span>
                      </div>
                      <div className="book-face-front">
                        <Image
                          src={mediaManifest.book.cover}
                          alt={bookShowcase.title}
                          width={368}
                          height={704}
                          className="block h-auto w-full object-cover"
                        />
                        {/* Scrub-driven specular sweep — parked off-cover for
                            static/reduced-motion tiers */}
                        <span className="book-sheen" aria-hidden />
                      </div>
                    </div>
                  </div>
                </a>
                <div className="book-shadow" aria-hidden />
              </div>
            </div>

            {/* Kinetic copy column */}
            <div>
              <p className="artifact-meta-item chapter-label mb-6">
                Chapter 09 · The book
                {bookShowcase.publishDate ? (
                  <>
                    <span className="text-muted-foreground/50" aria-hidden>
                      ·
                    </span>
                    {bookShowcase.publishDate}
                  </>
                ) : null}
              </p>

              <h2 className="artifact-title" aria-label={bookShowcase.title}>
                {titleWords.map((word, index) => (
                  <span key={`${word}-${index}`} className="kinetic-line" aria-hidden>
                    <span className="kinetic-line-inner artifact-title-line">{word}</span>
                  </span>
                ))}
              </h2>

              <p className="artifact-meta-item mt-5 max-w-lg text-lg font-light text-muted-foreground">
                {bookShowcase.subtitle}
              </p>

              <p className="artifact-meta-item mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
                {bookShowcase.description}
              </p>

              {/* Sequential unmasks — no glass cards */}
              {highlights.length > 0 ? (
                <ol className="mt-9 border-t border-border/60">
                  {highlights.map((highlight, index) => (
                    <li key={highlight} className="artifact-unmask">
                      <span
                        className="font-mono text-[0.65rem] tracking-[0.22em] text-brand-accent"
                        aria-hidden
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                        {highlight}
                      </p>
                    </li>
                  ))}
                </ol>
              ) : null}

              <div className="artifact-cta mt-9 flex flex-wrap items-center gap-5">
                <Magnetic>
                  <a
                    href={bookShowcase.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="immersive-button"
                  >
                    Get the book
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </a>
                </Magnetic>
                {bookShowcase.publisher ? (
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                    {bookShowcase.publisher}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter coda — one field report, not a testimonial wall */}
      {testimonial ? (
        <div className="editorial-container pb-[var(--section-gap)]">
          <ScrollReveal>
            <figure className="max-w-2xl border-l-2 border-brand-accent/50 pl-6">
              <blockquote className="font-display text-xl leading-snug tracking-tight text-foreground/85 md:text-2xl">
                &ldquo;{testimonial.text}&rdquo;
              </blockquote>
              <figcaption className="mt-4 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                {testimonial.author}
              </figcaption>
            </figure>
          </ScrollReveal>
        </div>
      ) : null}
    </section>
  );
}
