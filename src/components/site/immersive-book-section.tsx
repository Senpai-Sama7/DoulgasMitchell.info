'use client';

import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { Magnetic, usePinnedScene } from '@/components/immersive';
import { ScrollReveal } from '@/components/immersive/scroll-reveal';
import { easings, gsap, ScrollTrigger } from '@/lib/gsap';
import { bookShowcase } from '@/lib/site-content';
import { mediaManifest } from '@/lib/media-manifest';

/**
 * Chapter 08 — Artifact. A pinned product reveal: the book is a real CSS 3D
 * object (front board, spine, back board inside a perspective stage) whose
 * rotateY scrubs from a spine-forward recline to a near-frontal product shot,
 * while the title unmasks word by word and the highlights wipe in as
 * sequential clip-path unmasks. The Magnetic CTA lands last. The default
 * markup is the fully revealed static state — reduced-motion, touch, and low
 * motion tiers read it as a normal editorial section with a lightly angled
 * product shot.
 */
export function ImmersiveBookSection() {
  const titleWords = bookShowcase.title.split(' ');
  const highlights = bookShowcase.highlights.slice(0, 4);
  const testimonial = bookShowcase.testimonials[0];

  const stageRef = usePinnedScene<HTMLDivElement>(
    ({ timeline, root }) => {
      root.dataset.motion = 'pinned';

      const book = root.querySelector<HTMLElement>('.book-object');
      const words = gsap.utils.toArray<HTMLElement>('.artifact-title-line', root);
      const metaItems = gsap.utils.toArray<HTMLElement>('.artifact-meta-item', root);
      const unmasks = gsap.utils.toArray<HTMLElement>('.artifact-unmask', root);
      const cta = root.querySelector<HTMLElement>('.artifact-cta');

      if (book) {
        timeline.fromTo(
          book,
          { rotationY: 64, scale: 0.9 },
          { rotationY: 16, scale: 1, duration: 3.1, ease: 'none' },
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
                <a
                  href={bookShowcase.amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${bookShowcase.title} on Amazon`}
                  data-cursor="media"
                  className="block"
                >
                  <div className="book-object">
                    <div className="book-face-back" aria-hidden />
                    <div className="book-spine" aria-hidden>
                      <span className="book-spine-label">{bookShowcase.title}</span>
                    </div>
                    <div className="book-face-front">
                      <Image
                        src={mediaManifest.book.cover}
                        alt={bookShowcase.title}
                        width={400}
                        height={533}
                        className="block h-auto w-full object-cover"
                      />
                    </div>
                  </div>
                </a>
                <div className="book-shadow" aria-hidden />
              </div>
            </div>

            {/* Kinetic copy column */}
            <div>
              <p className="artifact-meta-item chapter-label mb-6">
                Chapter 08 · Artifact
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
