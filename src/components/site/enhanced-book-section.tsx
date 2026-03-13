'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  BookOpen,
  BrainCircuit,
  ExternalLink,
  MessageSquare,
  NotebookTabs,
} from 'lucide-react';
import { PUBLIC_CONTACT_HREF } from '@/lib/public-contact-config';
import { bookShowcase, siteProfile } from '@/lib/site-content';

const engagementPaths = [
  {
    title: 'Read the book',
    description: 'Go straight to the book and get the full framework in its intended sequence.',
    href: bookShowcase.amazonUrl,
    icon: BookOpen,
    external: true,
  },
  {
    title: 'Ask the archive',
    description: 'Use the public knowledge console if you want the short version before committing.',
    href: '#public-assistant',
    icon: BrainCircuit,
    external: false,
  },
  {
    title: 'Start a conversation',
    description: 'If you want to turn the ideas into a product, workflow, or collaboration, reach out directly.',
    href: '#contact',
    icon: MessageSquare,
    external: false,
  },
] as const;

export function EnhancedBookSection() {
  return (
    <section id="book" className="section-spacing bg-muted/30 relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        aria-hidden="true"
      >
        <div className="absolute inset-y-12 left-[8%] w-px bg-gradient-to-b from-transparent via-border to-transparent" />
        <div className="absolute inset-y-24 right-[10%] w-px bg-gradient-to-b from-transparent via-border to-transparent" />
        <div className="absolute left-0 top-16 h-px w-48 bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute bottom-20 right-0 h-px w-56 bg-gradient-to-l from-transparent via-border to-transparent" />
      </div>

      <div className="editorial-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs text-muted-foreground">{'// 04'}</span>
            <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="ascii-marker">Book System</div>
              <h2 className="editorial-title mt-4 max-w-3xl">A practical manual, not motivational wallpaper.</h2>
              <p className="editorial-subtitle mt-4 max-w-2xl">
                <em>{bookShowcase.title}</em> is the confidence framework behind the broader portfolio:
                structured, psychologically grounded, and designed to convert reflection into action.
              </p>
            </div>

            <div className="rounded-3xl border border-border/70 bg-background/80 p-5 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur">
              <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Why it matters here
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                The same operating style shows up in the systems work: evidence over performance, repeatable
                practice over vague ambition, and design choices that help people act with more clarity.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[2rem] border border-border/70 bg-background/90 p-5 shadow-[0_28px_90px_-60px_rgba(15,23,42,0.55)]"
          >
            <div className="grid gap-6 md:grid-cols-[220px_1fr]">
              <div className="relative mx-auto w-full max-w-[220px]">
                <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/14 via-transparent to-primary/6 blur-2xl" />
                <div className="relative overflow-hidden rounded-[1.5rem] border border-border/70 bg-muted/40">
                  <Image
                    src="/images/the-confident-mind.jpg"
                    alt="Cover of The Confident Mind by Douglas Mitchell"
                    width={640}
                    height={960}
                    className="h-auto w-full object-cover"
                    sizes="(max-width: 768px) 220px, 280px"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-border/70 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                    {bookShowcase.publishDate}
                  </span>
                  <span className="rounded-full border border-border/70 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                    {bookShowcase.publisher}
                  </span>
                </div>

                <h3 className="mt-4 text-3xl font-semibold leading-tight">{bookShowcase.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">{bookShowcase.subtitle}</p>
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{bookShowcase.description}</p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {bookShowcase.highlights.map((highlight) => (
                    <div
                      key={highlight}
                      className="rounded-2xl border border-border/60 bg-muted/35 px-4 py-3 text-sm leading-relaxed text-muted-foreground"
                    >
                      <span className="font-mono text-xs uppercase tracking-[0.18em] text-primary">Signal</span>
                      <p className="mt-2">{highlight}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={bookShowcase.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-button"
                  >
                    <BookOpen className="h-4 w-4" />
                    Read on Amazon
                  </a>
                  <a href="#contact" className="ghost-button">
                    <MessageSquare className="h-4 w-4" />
                    Bring it into a project
                  </a>
                </div>
              </div>
            </div>
          </motion.article>

          <div className="grid gap-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="rounded-[2rem] border border-border/70 bg-background/80 p-6"
            >
              <div className="flex items-center gap-3">
                <NotebookTabs className="h-5 w-5 text-primary" />
                <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Inside the manual
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                {bookShowcase.chapters.map((chapter, index) => (
                  <div
                    key={chapter}
                    className="flex items-start gap-4 rounded-2xl border border-border/60 bg-muted/30 px-4 py-3"
                  >
                    <span className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <div className="text-sm font-medium">{chapter}</div>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        Structured to move from diagnosis to internal evidence to sustainable follow-through.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="grid gap-6 lg:grid-cols-[1fr_0.95fr]"
            >
              <div className="rounded-[2rem] border border-border/70 bg-background/80 p-6">
                <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Reader response
                </div>
                <div className="mt-5 space-y-4">
                  {bookShowcase.testimonials.map((testimonial) => (
                    <blockquote
                      key={testimonial.author}
                      className="rounded-2xl border border-border/60 bg-muted/30 px-4 py-4 text-sm leading-relaxed text-muted-foreground"
                    >
                      <p>“{testimonial.text}”</p>
                      <footer className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                        {testimonial.author}
                      </footer>
                    </blockquote>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-border/70 bg-background/80 p-6">
                <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  Choose your next move
                </div>
                <div className="mt-5 grid gap-3">
                  {engagementPaths.map((path) => (
                    <a
                      key={path.title}
                      href={path.href}
                      target={path.external ? '_blank' : undefined}
                      rel={path.external ? 'noopener noreferrer' : undefined}
                      className="group rounded-2xl border border-border/60 bg-muted/30 px-4 py-4 transition-colors hover:border-primary/35 hover:bg-muted/55"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl border border-border/60 bg-background/80 p-2">
                          <path.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-medium">{path.title}</div>
                            {path.external ? (
                              <ExternalLink className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            )}
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{path.description}</p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-dashed border-border/70 px-4 py-3 text-sm text-muted-foreground">
                  Direct contact also works if you already know the direction.
                  {' '}
                  <a href={PUBLIC_CONTACT_HREF} className="font-medium text-foreground underline underline-offset-4">
                    Email {siteProfile.name.split(' ')[0]}
                  </a>
                  .
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
