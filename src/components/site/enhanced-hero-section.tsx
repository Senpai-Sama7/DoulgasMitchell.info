'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ArrowRight, ChevronRight, MapPin, Sparkles } from 'lucide-react';
import { heroMetrics, siteProfile, socialLinks } from '@/lib/site-content';
import { ParticleTitle } from '@/components/effects/particle-title';
import { HeroEnergyPlot } from '@/components/effects/hero-energy-plot';

const roleSignals = [
  {
    title: 'Operations Analyst',
    description: 'I tighten handoffs, reduce ambiguity, and turn messy operational flow into measurable execution.',
    detail: 'Best for workflow design, decision routing, reporting cadence, and process hardening.',
  },
  {
    title: 'AI Practitioner',
    description: 'I use AI where it creates leverage, not noise. The goal is durable systems, not novelty theater.',
    detail: 'Best for automation architecture, human-in-the-loop workflows, and confidence-aware tooling.',
  },
  {
    title: 'Systems Strategist',
    description: 'I work at the boundary between product, operations, and architecture so strategy survives contact with reality.',
    detail: 'Best for operating models, platform direction, and resilient implementation plans.',
  },
  {
    title: 'Author',
    description: 'I write to make complex ideas feel actionable, editorially strong, and worth returning to.',
    detail: 'Best for readers exploring confidence, human performance, and practical systems thinking.',
  },
] as const;

const quickRoutes = [
  {
    href: '#work',
    label: 'Case studies',
    detail: 'See shipped systems and the decision logic behind them.',
    kicker: '01',
  },
  {
    href: '#writing',
    label: 'Writing archive',
    detail: 'Read essays on operations, AI, and human performance.',
    kicker: '02',
  },
  {
    href: '#contact',
    label: 'Start a conversation',
    detail: 'Reach out when there is a real project or a real question.',
    kicker: '03',
  },
] as const;

export function EnhancedHeroSection() {
  const [activeRole, setActiveRole] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const opacity = useTransform(scrollYProgress, [0.6, 0.9], [1, 0]);
  const scale = useTransform(scrollYProgress, [0.6, 0.9], [1, 0.98]);
  const mediaOpacity = useTransform(scrollYProgress, [0, 1], [0.22, 0.08]);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveRole((current) => (current + 1) % roleSignals.length);
    }, 4200);

    return () => window.clearInterval(interval);
  }, [prefersReducedMotion]);

  const selectedRole = roleSignals[activeRole];

  return (
    <section ref={containerRef} className="relative overflow-hidden pt-12 md:pt-16 lg:pt-20">
      <div className="absolute inset-0 z-[1] opacity-[0.03] dark:opacity-[0.06]" aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      <div className="absolute inset-0 z-[2] bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.08),transparent_46%),linear-gradient(180deg,transparent_0%,rgba(15,23,42,0.05)_100%)] dark:bg-[radial-gradient(circle_at_top,rgba(248,250,252,0.10),transparent_48%),linear-gradient(180deg,transparent_0%,rgba(248,250,252,0.03)_100%)]" />

      <div className="absolute inset-0 z-[3] flex items-center justify-center pointer-events-none" aria-hidden="true">
        <motion.div
          style={{ opacity: prefersReducedMotion ? 0.08 : mediaOpacity }}
          className="-translate-y-8 h-[280px] w-[280px] overflow-hidden rounded-full border border-primary/10 mix-blend-screen md:h-[520px] md:w-[520px]"
        >
          {prefersReducedMotion ? (
            <div
              className="h-full w-full bg-cover bg-center grayscale contrast-125"
              style={{ backgroundImage: 'url(/media/dougie-frame-poster.webp)' }}
            />
          ) : (
            <video autoPlay loop muted playsInline poster="/media/dougie-frame-poster.webp" className="h-full w-full object-cover grayscale contrast-125">
              <source src="/media/breathing-dm-loop.mp4" type="video/mp4" />
            </video>
          )}
        </motion.div>
      </div>

      <motion.div
        style={{ y: prefersReducedMotion ? 0 : y, opacity, scale }}
        className="editorial-container relative z-10 pb-20"
      >
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1.15fr)_380px] xl:items-start">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/75 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Editorial systems operator
              </div>

              <div className="space-y-5">
                <div className="flex items-center gap-4 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                  <span className="hidden sm:inline">Houston, Texas</span>
                  <span className="hidden sm:inline text-muted-foreground/40">/</span>
                  <span>{siteProfile.headline}</span>
                </div>

                <h1 className="editorial-title max-w-4xl text-balance">
                  <ParticleTitle firstName="Douglas" lastName="Mitchell" />
                </h1>

                <p className="max-w-3xl text-lg leading-8 text-foreground/90 md:text-xl">
                  I build calm, premium operating systems for work that has to hold up in the real world.
                </p>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                  {siteProfile.summary} The through-line is simple: less ambiguity, sharper execution, better human outcomes.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <a href="#work" className="cta-button justify-center sm:justify-start">
                  View proof of work
                  <ArrowDown className="h-4 w-4" />
                </a>
                <a href="#contact" className="ghost-button justify-center sm:justify-start">
                  Start a conversation
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-background/70 p-4 backdrop-blur">
                  <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    Based in
                  </div>
                  <p className="mt-3 text-sm font-medium text-foreground">{siteProfile.location}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/70 p-4 backdrop-blur">
                  <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">Current lens</div>
                  <p className="mt-3 text-sm font-medium text-foreground">{selectedRole.title}</p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/70 p-4 backdrop-blur">
                  <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">Featured book</div>
                  <p className="mt-3 text-sm font-medium text-foreground">The Confident Mind</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <aside className="space-y-5 rounded-[2rem] border border-border/70 bg-background/78 p-5 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.55)] backdrop-blur-xl">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                    Engagement brief
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold text-foreground">Choose your best starting point.</h2>
                </div>

                <div className="grid gap-2" role="list" aria-label="Role filters">
                  {roleSignals.map((role, index) => {
                    const isActive = activeRole === index;
                    return (
                      <button
                        key={role.title}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => setActiveRole(index)}
                        className={
                          isActive
                            ? 'rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-left transition-colors'
                            : 'rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-left transition-colors hover:border-primary/20 hover:bg-muted/55'
                        }
                      >
                        <div className="text-sm font-medium text-foreground">{role.title}</div>
                        <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{role.description}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-2xl border border-border/70 bg-muted/25 p-4">
                  <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-primary">Best fit right now</div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{selectedRole.detail}</p>
                </div>

                <div className="space-y-2">
                  {quickRoutes.map((route) => (
                    <a
                      key={route.href}
                      href={route.href}
                      className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-background/65 px-4 py-3 transition-colors hover:border-primary/30 hover:bg-muted/40"
                    >
                      <div>
                        <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">{route.kicker}</div>
                        <div className="mt-1 text-sm font-medium text-foreground">{route.label}</div>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{route.detail}</p>
                      </div>
                      <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </aside>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border/70 bg-[#020617]/80 p-5 shadow-[0_32px_80px_-40px_rgba(2,6,23,0.9)] backdrop-blur-3xl">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.32em] text-muted-foreground/70">
              <span>Signal field</span>
              <span className="text-foreground/60">Live energy</span>
            </div>
            <div className="relative mt-5 h-[160px] sm:h-[200px] lg:h-[180px] overflow-hidden rounded-[1.6rem] border border-border/40 bg-[#030712]/50 p-2">
              <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.45),transparent_38%)] mix-blend-screen" />
              <div className="relative h-full w-full">
                <HeroEnergyPlot />
                <div className="pointer-events-none absolute inset-0 rounded-[1.6rem] border border-dashed border-foreground/10" />
              </div>
            </div>
            <p className="mt-4 text-[11px] uppercase tracking-[0.42em] text-muted-foreground/60">
              Operational choreography · 87% experience saturation
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid gap-4 md:grid-cols-3">
              {heroMetrics.map((metric) => (
                <div key={metric.label} className="rounded-[1.6rem] border border-border/70 bg-background/68 p-5 backdrop-blur">
                  <div className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                    {metric.label}
                  </div>
                  <div className="mt-4 text-3xl font-semibold tracking-tight text-foreground">{metric.value}</div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{metric.detail}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[1.6rem] border border-border/70 bg-muted/30 p-5">
              <div className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">Network</div>
              <div className="mt-4 space-y-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/75 px-4 py-3 text-sm transition-colors hover:border-primary/30 hover:text-primary"
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
