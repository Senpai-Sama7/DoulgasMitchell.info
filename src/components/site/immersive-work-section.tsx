'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Magnetic, usePinnedScene } from '@/components/immersive';
import { ScrollTrigger } from '@/lib/gsap';
import { siteProfile, type ProjectShowcase } from '@/lib/site-content';

interface ImmersiveWorkSectionProps {
  projects: ProjectShowcase[];
}

/**
 * Chapter 07 — Proof. The section pins for 1800px of scroll while the inner
 * track translates X by (track.scrollWidth − viewport), turning vertical
 * scroll into a horizontal traversal of oversized editorial case-study
 * panels. The default markup is a vertical editorial stack — mobile, touch,
 * reduced-motion, and low motion tiers never get the horizontal hijack; the
 * pinned build only elevates the layout via [data-motion='pinned'].
 * The category filter is intentionally dropped for cinematic purity — each
 * panel carries its category as a first-class editorial credit instead.
 */
export function ImmersiveWorkSection({ projects }: ImmersiveWorkSectionProps) {
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

      const fill = root.querySelector<HTMLElement>('.proof-progress-fill');
      if (fill) {
        timeline.fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'none' }, 0);
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
            {/* Oversized intro slide */}
            <article className="proof-panel proof-panel-intro">
              <div>
                <p className="chapter-label mb-6">Chapter 07 · Proof</p>
                <h2 className="proof-intro-title font-display">
                  Proof
                  <br />
                  <span className="text-muted-foreground">architecture.</span>
                </h2>
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
                >
                  <div className="flex w-full flex-wrap items-baseline justify-between gap-4">
                    <span className="proof-panel-index font-display" aria-hidden>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <p className="flex flex-wrap items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                      <span
                        className="inline-block h-1.5 w-1.5"
                        style={{ backgroundColor: project.color }}
                        aria-hidden
                      />
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
                  </div>

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
                    <span className="inline-flex h-11 w-11 items-center justify-center border border-border/70 text-muted-foreground transition-colors group-hover:border-foreground/50 group-hover:text-foreground">
                      <ArrowUpRight
                        className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </span>
                  </span>
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
