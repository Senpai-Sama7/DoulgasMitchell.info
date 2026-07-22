'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, ArrowUpRight, CheckCircle, Send } from 'lucide-react';
import { Magnetic } from '@/components/immersive/magnetic';
import { ScrollReveal } from '@/components/immersive/scroll-reveal';
import { contactMethods } from '@/lib/site-content';
import { cn } from '@/lib/utils';

const inquiryStarters = [
  {
    label: 'Project scope',
    subject: 'project_scope',
    message:
      "Hello Douglas, I'd like to discuss a project and scope what the next steps could look like.",
  },
  {
    label: 'AI workflow',
    subject: 'ai_workflow',
    message:
      "Hello Douglas, I'm exploring an AI workflow and want help evaluating the right operating model.",
  },
  {
    label: 'Systems consulting',
    subject: 'systems_consulting',
    message:
      "Hello Douglas, I'd like to talk through a systems challenge and the highest-leverage way to improve it.",
  },
] as const;

const fieldClass =
  'w-full border-0 border-b border-border/70 bg-transparent px-0 py-3 text-base text-foreground outline-none transition-colors duration-300 placeholder:text-muted-foreground/45 focus:border-foreground';

const labelClass =
  'block font-mono text-[0.65rem] font-medium uppercase tracking-[0.2em] text-muted-foreground';

/**
 * Chapter 8 — "Invitation". The closing chapter reads as a ceremony, not a
 * form dump: large display type, magnetic CTAs, direct lines as editorial
 * rows, and a calm underlined form that still submits to /api/contact with
 * the honeypot, validation, and status states intact.
 */
export function ImmersiveContactSection() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    website: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const emailHref = contactMethods.find((method) => method.label === 'Email')?.href;

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && !isSubmitting) {
        const form = document.getElementById('contact-form') as HTMLFormElement | null;
        const activeElement = document.activeElement;

        if (form && activeElement instanceof HTMLElement && form.contains(activeElement)) {
          form.requestSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isSubmitting]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formState.name.trim()) newErrors.name = 'Name is required';
    if (!formState.email.trim() || !/^\S+@\S+\.\S+$/.test(formState.email)) {
      newErrors.email = 'Valid email is required';
    }
    if (!formState.message.trim()) newErrors.message = 'Message is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstInvalidField = Object.keys(newErrors)[0];
      window.requestAnimationFrame(() => {
        document.getElementById(`contact-${firstInvalidField}`)?.focus();
      });
      return;
    }

    setErrors({});
    setSubmitStatus('idle');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formState,
          source: 'portfolio-contact-form',
        }),
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      setSubmitStatus('success');
      setFormState({ name: '', email: '', subject: '', message: '', website: '' });
    } catch {
      setSubmitStatus('error');
      // Auto-clear errors so the form can be retried; keep success visible.
      window.setTimeout(() => {
        setSubmitStatus((current) => (current === 'error' ? 'idle' : current));
      }, 8000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden border-t border-border/50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,color-mix(in_oklch,var(--brand-accent),transparent_93%),transparent_60%)]" />

      <div className="editorial-container section-spacing relative z-10">
        {/* ── Ceremonial opener ─────────────────────────────────────────── */}
        <ScrollReveal className="mb-16 lg:mb-24">
          <p className="chapter-label mb-8">08 · Invitation</p>
          <h2 className="max-w-4xl font-display text-[clamp(2.75rem,7vw,5.75rem)] leading-[0.95] tracking-[-0.03em]">
            Let&apos;s build something
            <br />
            <span className="text-muted-foreground">that holds.</span>
          </h2>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Bring the ambiguous problem — a project, an AI workflow, a system that keeps slipping.
            A short brief, the current constraint, and the desired outcome is enough to start.
          </p>
          {emailHref ? (
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <Magnetic>
                <a href={emailHref} className="immersive-button">
                  Start the conversation
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Magnetic>
              <span className="text-sm text-muted-foreground">
                or write below — same inbox, same person.
              </span>
            </div>
          ) : null}
        </ScrollReveal>

        <div className="grid gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          {/* ── Direct lines ──────────────────────────────────────────── */}
          <ScrollReveal>
            <p className="immersive-kicker mb-6">Direct lines</p>
            <div className="divide-y divide-border/55 border-y border-border/55">
              {contactMethods.map((method) => {
                const row = (
                  <>
                    <span className={labelClass}>{method.label}</span>
                    <span
                      className={cn(
                        'min-w-0 truncate text-sm font-medium',
                        method.href ? 'lux-underline' : 'text-muted-foreground'
                      )}
                    >
                      {method.value}
                    </span>
                    {method.href?.startsWith('http') ? (
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    ) : null}
                  </>
                );

                return method.href ? (
                  <a
                    key={method.label}
                    href={method.href}
                    target={method.href.startsWith('http') ? '_blank' : undefined}
                    rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    data-cursor="interactive"
                    className="group grid grid-cols-[6rem_1fr_auto] items-baseline gap-4 py-4"
                  >
                    {row}
                  </a>
                ) : (
                  <div
                    key={method.label}
                    className="grid grid-cols-[6rem_1fr_auto] items-baseline gap-4 py-4"
                  >
                    {row}
                  </div>
                );
              })}
            </div>

            <p className="immersive-kicker mb-4 mt-12">Openers</p>
            <div className="flex flex-wrap gap-2">
              {inquiryStarters.map((starter) => (
                <button
                  key={starter.label}
                  type="button"
                  onClick={() => {
                    setFormState((current) => ({
                      ...current,
                      subject: starter.subject,
                      message: starter.message,
                    }));
                    setSubmitStatus('idle');
                  }}
                  className="min-h-11 border border-border/70 px-4 text-sm transition-colors duration-300 hover:border-brand-accent/50 hover:bg-brand-accent/5"
                >
                  {starter.label}
                </button>
              ))}
            </div>

            <p className="mt-12 max-w-sm border-l-2 border-brand-accent/50 pl-4 text-sm leading-relaxed text-muted-foreground">
              Best fit: workflow design, AI-enabled operations, systems thinking, and premium
              digital experiences. Clear context earns a faster reply.
            </p>
          </ScrollReveal>

          {/* ── The form — calm, underlined, fully functional ─────────── */}
          <ScrollReveal delay={0.1}>
            <form
              id="contact-form"
              onSubmit={handleSubmit}
              className="space-y-8"
              aria-describedby="contact-form-meta contact-form-status"
            >
              <div className="grid gap-8 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className={labelClass}>
                    Name *
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    value={formState.name}
                    onChange={(event) => {
                      setFormState({ ...formState, name: event.target.value });
                      if (errors.name) setErrors({ ...errors, name: '' });
                    }}
                    required
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    className={cn(fieldClass, errors.name && 'border-destructive')}
                    placeholder="Your name"
                  />
                  {errors.name ? (
                    <span id="name-error" className="mt-2 block text-xs text-destructive">
                      {errors.name}
                    </span>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="contact-email" className={labelClass}>
                    Email *
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={(event) => {
                      setFormState({ ...formState, email: event.target.value });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    required
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    className={cn(fieldClass, errors.email && 'border-destructive')}
                    placeholder="you@company.com"
                  />
                  {errors.email ? (
                    <span id="email-error" className="mt-2 block text-xs text-destructive">
                      {errors.email}
                    </span>
                  ) : null}
                </div>
              </div>

              <div>
                <label htmlFor="contact-subject" className={labelClass}>
                  Subject
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  value={formState.subject}
                  onChange={(event) => setFormState({ ...formState, subject: event.target.value })}
                  className={fieldClass}
                  placeholder="What is this about?"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className={labelClass}>
                  Message *
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={formState.message}
                  onChange={(event) => {
                    setFormState({ ...formState, message: event.target.value });
                    if (errors.message) setErrors({ ...errors, message: '' });
                  }}
                  required
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? 'message-error' : undefined}
                  rows={6}
                  className={cn(fieldClass, 'resize-none', errors.message && 'border-destructive')}
                  placeholder="The brief, the constraint, the outcome you want."
                />
                {errors.message ? (
                  <span id="message-error" className="mt-2 block text-xs text-destructive">
                    {errors.message}
                  </span>
                ) : null}
              </div>

              {/* Honeypot — humans never see it, bots fill it */}
              <input
                type="text"
                name="website"
                value={formState.website}
                onChange={(event) => setFormState({ ...formState, website: event.target.value })}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              <p
                id="contact-form-meta"
                className="flex flex-wrap items-center justify-between gap-2 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground/70"
              >
                <span>* Required</span>
                <span>Cmd/Ctrl + Enter to send</span>
              </p>

              <Magnetic className="block sm:inline-block">
                <button type="submit" disabled={isSubmitting} className="immersive-button w-full">
                  {isSubmitting ? 'Sending…' : 'Send message'}
                  <Send className="h-4 w-4" />
                </button>
              </Magnetic>

              <div id="contact-form-status" aria-live="polite" aria-atomic="true">
                {submitStatus === 'success' ? (
                  <p className="flex items-center gap-2 border-l-2 border-brand-accent pl-4 text-sm text-foreground">
                    <CheckCircle className="h-4 w-4 text-brand-accent" />
                    Received — thank you. I&apos;ll reply soon.
                  </p>
                ) : null}

                {submitStatus === 'error' ? (
                  <p className="flex items-center gap-2 border-l-2 border-destructive pl-4 text-sm text-foreground">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    Something went wrong. Please try again or email directly.
                  </p>
                ) : null}
              </div>
            </form>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
