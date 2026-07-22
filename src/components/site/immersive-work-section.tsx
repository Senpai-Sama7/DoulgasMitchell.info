'use client';

import { useCallback, type CSSProperties, type PointerEvent } from 'react';
import Link from 'next/link';
import { useReducedMotion } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Magnetic, usePinnedScene } from '@/components/immersive';
import { ScrollTrigger } from '@/lib/gsap';
import { siteProfile, type ProjectShowcase } from '@/lib/site-content';

interface ImmersiveWorkSectionProps {
  projects: ProjectShowcase[];
}

/** Max tilt in degrees — kept shallow so panels read as planes, not cards. */
const TILT_X_MAX = 3.2;
const TILT_Y_MAX = 4.4;

/**
 * Chapter 07 — Proof. The section pins for 1800px of scroll while the inner
 * track translates X by (track.scrollWidth − viewport), turning vertical
 * scroll into a horizontal traversal of oversized editorial case-study
 * panels. The default markup is a vertical editorial stack — mobile, touch,
 * reduced-motion, and low motion tiers never get the horizontal hijack; the
 * pinned build only elevates the layout via [data-motion='pinned'].
 *
 * Cinematic grammar of the pinned rail:
 * - the intro reads as a film title card: huge serif, a scrubbing hairline
 *   that tracks rail progress in place;
 * - each case panel carries an oversized outlined index numeral and a
 *   full-bleed signal plane cut from project.color (clip-path widens on
 *   hover) instead of a tiny category dot;
 * - fine pointers get a shallow CSS 3D tilt driven by custom properties;
 * - the primary "read" affordance is magnetic.
 */
export function ImmersiveWorkSection({ projects }: ImmersiveWorkSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  // Shallow 3D tilt — mouse (fine pointer) only, never under reduced motion.
  // Writes CSS custom properties; the transform itself only exists in the
  // pinned stylesheet, so touch/static tiers stay untouched.
  const handleTilt = useCallback(
    (event: PointerEvent<HTMLAnchorElement>) => {
      if (prefersReducedMotion || event.pointerType !== 'mouse') return;
      const card = event.currentTarget;
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty('--tilt-x', `${(-py * TILT_X_MAX).toFixed(2)}deg`);
      card.style.setProperty('--tilt-y', `${(px * TILT_Y_MAX).toFixed(2)}deg`);
    },
    [prefersReducedMotion]
  );

  const resetTilt = useCallback((event: PointerEvent<HTMLAnchorElement>) => {
    const card = event.currentTarget;
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
  }, []);

  const stageRef = usePinnedScene<HTMLDivElement>(
    ({ timeline, root }) => {
      root.dataset.motion = 'pinned';

      const track = root.querySelector<HTMLElement>('.proof-track');
      if (!track) return;

      // Horizontal distance derives from real track geometry; the function
      // value re-evaluates on every ScrollTrigger refresh (resize, fonts).
      timeline.to(
        track,
        {
          x: () => -Math.max(0, track.scrollWidth - root.clientWidth),
          duration: 1,
          ease: 'none',
        },
        0
      );

      // Both hairlines scrub in lockstep with the rail: the title-card line
      // inside the intro panel and the fixed strip along the viewport bottom.
      const fills = root.querySelectorAll<HTMLElement>(
        '.proof-progress-fill, .proof-intro-hairline-fill'
      );
      if (fills.length) {
        timeline.fromTo(fills, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'none' }, 0);
      }

      // The layout flips from static stack to horizontal rail above —
      // re-measure the pin spacer once the new geometry has settled.
      requestAnimationFrame(() => ScrollTrigger.refresh());
    },
    {
      distance: 1800,
      dependencies: [projects.length],
      onStatic: (root) => {
        root.dataset.motion = 'static';
      },
    }
  );

  return (
    <section id="work">
      <div ref={stageRef} className="proof-stage">
        <div className="proof-viewport">
          <div className="proof-track scrollbar-hidden" data-cursor="drag">
            {/* Title card — huge type plus a hairline that scrubs with the rail */}
            <article className="proof-panel proof-panel-intro">
              <div>
                <p className="chapter-label mb-6">Chapter 07 · Proof</p>
                <h2 className="proof-intro-title font-display">
                  Proof
                  <br />
                  <span className="text-muted-foreground">architecture.</span>
                </h2>
                <div className="proof-intro-hairline" aria-hidden>
                  <span className="proof-intro-hairline-fill" />
                </div>
                <p className="mt-6 max-w-md text-muted-foreground md:text-lg">
                  Case studies written as decision logs: challenge, constraint, path taken, outcome.
                </p>
              </div>
              <p className="proof-scroll-hint mt-10 items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                Keep scrolling — the strip drives sideways
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </p>
            </article>

            {/* Case-study panels */}
            {projects.map((project, index) => (
              <article key={project.slug} className="proof-panel">
                <Link
                  href={`/work/${project.slug}`}
                  className="proof-panel-link group"
                  data-cursor="interactive"
                  style={{ '--plane': project.color } as CSSProperties}
                  onPointerMove={handleTilt}
                  onPointerLeave={resetTilt}
                >
                  {/* Full-bleed signal plane cut from project.color */}
                  <span className="proof-panel-plane" aria-hidden />

                  {/* Oversized outlined numeral — ghost layer behind the copy */}
                  <span className="proof-panel-index font-display" aria-hidden>
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <div className="proof-panel-body">
                    <p className="flex flex-wrap items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                      {project.category}
                      <span className="text-muted-foreground/40" aria-hidden>
                        ·
                      </span>
                      {project.timeline}
                      <span className="text-muted-foreground/40" aria-hidden>
                        ·
                      </span>
                      {project.status}
                    </p>

                    <h3 className="proof-panel-title font-display transition-colors group-hover:text-foreground">
                      {project.title}
                    </h3>

                    <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                      {project.description}
                    </p>

                    <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground/80">
                      {project.techStack.map((tech) => (
                        <li key={tech}>{tech}</li>
                      ))}
                    </ul>

                    <span className="mt-8 inline-flex items-center gap-3 text-sm font-medium">
                      Read the decision log
                      <Magnetic strength={0.28} radius={80}>
                        <span className="inline-flex h-11 w-11 items-center justify-center border border-border/70 text-muted-foreground transition-colors group-hover:border-foreground/50 group-hover:text-foreground">
                          <ArrowUpRight
                            className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            aria-hidden
                          />
                        </span>
                      </Magnetic>
                    </span>
                  </div>
                </Link>
              </article>
            ))}

            {/* Outro slide — the archive */}
            <article className="proof-panel proof-panel-outro">
              <div>
                <p className="immersive-kicker mb-5">Continue</p>
                <h3 className="font-display text-3xl tracking-tight md:text-4xl">
                  The archive runs deeper.
                </h3>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground md:text-base">
                  85+ public experiments and field tests live on GitHub — the unedited lab, receipts
                  included.
                </p>
              </div>
              <div className="mt-8">
                <Magnetic>
                  <a
                    href={siteProfile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="immersive-button"
                  >
                    Browse the archive
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </a>
                </Magnetic>
              </div>
            </article>
          </div>

          <div className="proof-progress" aria-hidden>
            <span className="proof-progress-fill" />
          </div>
        </div>
      </div>
    </section>
  );
}
