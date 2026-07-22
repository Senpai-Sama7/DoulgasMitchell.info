'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useImmersive } from '@/components/immersive/immersive-context';
import { cn } from '@/lib/utils';

export interface Chapter {
  /** DOM id of the target section (without '#'). */
  id: string;
  /** Editorial chapter name shown in the rail. */
  label: string;
}

/**
 * The homepage narrative arc. Section components must keep these DOM ids —
 * the rail, command palette, and anchor links all target them.
 */
export const HOME_CHAPTERS: readonly Chapter[] = [
  { id: 'hero', label: 'Arrival' },
  { id: 'about', label: 'Identity' },
  { id: 'atlas', label: 'Atlas' },
  { id: 'telemetry', label: 'Telemetry' },
  { id: 'method', label: 'Method' },
  { id: 'simulator', label: 'Instrument' },
  { id: 'work', label: 'Proof' },
  { id: 'book', label: 'Artifact' },
  { id: 'writing', label: 'Voice' },
  { id: 'contact', label: 'Invitation' },
];

/**
 * Fixed vertical chapter progress rail. Tracks the active section with an
 * IntersectionObserver band around the viewport's upper third, scrolls via
 * the shared Lenis-aware scrollTo, and collapses away below the xl breakpoint
 * (mobile gets the header nav instead). Fully keyboard operable: each chapter
 * is a real anchor with a visible focus state.
 */
export function ChapterRail({ chapters = HOME_CHAPTERS }: { chapters?: readonly Chapter[] }) {
  const { scrollTo } = useImmersive();
  const prefersReducedMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<string>(chapters[0]?.id ?? '');

  useEffect(() => {
    const sections = chapters
      .map((chapter) => document.getElementById(chapter.id))
      .filter((element): element is HTMLElement => element !== null);

    if (sections.length === 0) return;

    // A thin horizontal band ~40% down the viewport decides the active chapter.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-38% 0px -57% 0px', threshold: 0 }
    );

    for (const section of sections) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, [chapters]);

  const handleSelect = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    setActiveId(id);
    scrollTo(`#${id}`, { immediate: prefersReducedMotion === true });
  };

  return (
    <nav
      aria-label="Chapters"
      className="no-print fixed left-5 top-1/2 z-40 hidden -translate-y-1/2 xl:block"
    >
      <ol className="flex flex-col gap-4">
        {chapters.map((chapter, index) => {
          const isActive = chapter.id === activeId;
          return (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                onClick={(event) => handleSelect(event, chapter.id)}
                aria-current={isActive ? 'true' : undefined}
                data-cursor="interactive"
                className="group flex items-center gap-3 py-0.5 outline-none"
              >
                <span
                  className={cn(
                    'h-px w-8 origin-left bg-foreground transition-[transform,opacity] duration-500',
                    isActive
                      ? 'scale-x-100 opacity-90'
                      : 'scale-x-[0.4] opacity-30 group-hover:scale-x-[0.7] group-hover:opacity-60 group-focus-visible:scale-x-[0.7] group-focus-visible:opacity-60'
                  )}
                  aria-hidden
                />
                <span
                  className={cn(
                    'flex items-baseline gap-1.5 text-[10px] uppercase tracking-[0.22em] text-foreground transition-opacity duration-500',
                    isActive
                      ? 'opacity-90'
                      : 'opacity-0 group-hover:opacity-55 group-focus-visible:opacity-90'
                  )}
                >
                  <span className="tabular-nums text-foreground/50">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {chapter.label}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
