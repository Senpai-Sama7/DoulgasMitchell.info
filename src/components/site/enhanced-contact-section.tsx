'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Send,
  Terminal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { contactMethods } from '@/lib/site-content';

const contactIcons = {
  Email: Mail,
  GitHub: Github,
  LinkedIn: Linkedin,
  Location: MapPin,
} as const;

const asciiDecoration = `
┌─────────────────────────────────────┐
│                                     │
│    Ready to build something?       │
│                                     │
└─────────────────────────────────────┘`;

const inquiryStarters = [
  {
    label: 'Project scope',
    subject: 'project_scope',
    message: "Hello Douglas, I'd like to discuss a project and scope what the next steps could look like.",
  },
  {
    label: 'AI workflow',
    subject: 'ai_workflow',
    message: "Hello Douglas, I'm exploring an AI workflow and want help evaluating the right operating model.",
  },
  {
    label: 'Systems consulting',
    subject: 'systems_consulting',
    message: "Hello Douglas, I'd like to talk through a systems challenge and the highest-leverage way to improve it.",
  },
] as const;

export function EnhancedContactSection() {
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
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

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
    } finally {
      setIsSubmitting(false);
      window.setTimeout(() => setSubmitStatus('idle'), 5000);
    }
  };

  return (
    <section id="contact" className="section-spacing relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <pre className="whitespace-pre font-mono text-[10px] text-muted-foreground">{asciiDecoration}</pre>
      </div>

      <div className="editorial-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
          className="mb-16 text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="font-mono text-xs text-muted-foreground">{'// 06'}</span>
          </div>

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-2">
            <Terminal className="h-4 w-4 text-primary" />
            <span className="font-mono text-sm">connect()</span>
          </div>

          <h2 className="editorial-title mb-4">Let's Build Something</h2>
          <p className="editorial-subtitle mx-auto max-w-2xl">
            Whether you have a project in mind, want to discuss AI automation, or just want to connect, I’m open to conversations with clear intent.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
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
                className="rounded-full border border-border/70 bg-background/70 px-4 py-2 text-sm transition-colors hover:border-primary/30 hover:bg-muted/40"
              >
                {starter.label}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
          >
            <div className="mb-6 flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <span className="text-primary">$</span>
              cat contact_info.json
            </div>

            <div className="space-y-4">
              {contactMethods.map((method, index) => {
                const Icon = contactIcons[method.label as keyof typeof contactIcons];
                const content = (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted transition-transform group-hover:scale-110">
                      <Icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-current" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="font-mono text-xs text-muted-foreground">{method.label.toLowerCase()}</span>
                      <span className="block truncate text-sm font-medium">{method.value}</span>
                    </div>
                    {method.href?.startsWith('http') ? (
                      <ExternalLink className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    ) : null}
                  </>
                );

                return method.href ? (
                  <motion.a
                    key={method.label}
                    href={method.href}
                    target={method.href.startsWith('http') ? '_blank' : undefined}
                    rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: prefersReducedMotion ? 0 : index * 0.1 }}
                    className={`group flex items-center gap-4 rounded-2xl border border-border bg-background p-4 transition-all hover:border-primary/30 ${method.color}`}
                  >
                    {content}
                  </motion.a>
                ) : (
                  <motion.div
                    key={method.label}
                    initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: prefersReducedMotion ? 0 : index * 0.1 }}
                    className="group flex items-center gap-4 rounded-2xl border border-border bg-background p-4"
                  >
                    {content}
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">Best fit</div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Workflow design, AI-enabled operations, systems thinking, and premium digital experiences.
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">Response cadence</div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Clear context helps me reply faster. A short brief and the desired outcome is enough to start.
                </p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
              className="mt-8 rounded-lg border border-border bg-muted/30 p-4"
            >
              <pre className="font-mono text-[10px] leading-tight text-muted-foreground">
{`┌─────────────────────────────┐
│  "The best way to predict  │
│   the future is to create  │
│           it."             │
│                             │
│         — Alan Kay          │
└─────────────────────────────┘`}
              </pre>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
          >
            <div className="mb-6 flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <span className="text-primary">$</span>
              nano message.txt
            </div>

            <form id="contact-form" onSubmit={handleSubmit} className="space-y-4" aria-describedby="contact-form-meta contact-form-status">
              <div className="rounded-t-lg border border-border border-b-0 bg-muted/50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
                  </div>
                  <span className="ml-2 font-mono text-xs text-muted-foreground">new_message.txt</span>
                </div>
              </div>

              <div className="space-y-4 rounded-b-lg border border-border bg-background p-6">
                <div className="relative">
                  <label htmlFor="contact-name" className="absolute -top-2 left-3 bg-background px-1 font-mono text-xs text-muted-foreground">
                    name*
                  </label>
                  <Input
                    id="contact-name"
                    name="name"
                    value={formState.name}
                    onChange={(event) => {
                      setFormState({ ...formState, name: event.target.value });
                      if (errors.name) setErrors({ ...errors, name: '' });
                    }}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    required
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    className={`font-mono ${focusedField === 'name' ? 'border-primary' : ''} ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="your_name"
                  />
                  {errors.name ? <span id="name-error" className="mt-1 block px-1 text-xs text-red-500">{errors.name}</span> : null}
                </div>

                <div className="relative">
                  <label htmlFor="contact-email" className="absolute -top-2 left-3 bg-background px-1 font-mono text-xs text-muted-foreground">
                    email*
                  </label>
                  <Input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={(event) => {
                      setFormState({ ...formState, email: event.target.value });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    className={`font-mono ${focusedField === 'email' ? 'border-primary' : ''} ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="your@email.com"
                  />
                  {errors.email ? <span id="email-error" className="mt-1 block px-1 text-xs text-red-500">{errors.email}</span> : null}
                </div>

                <div className="relative">
                  <label htmlFor="contact-subject" className="absolute -top-2 left-3 bg-background px-1 font-mono text-xs text-muted-foreground">
                    subject
                  </label>
                  <Input
                    id="contact-subject"
                    name="subject"
                    value={formState.subject}
                    onChange={(event) => setFormState({ ...formState, subject: event.target.value })}
                    onFocus={() => setFocusedField('subject')}
                    onBlur={() => setFocusedField(null)}
                    className={`font-mono ${focusedField === 'subject' ? 'border-primary' : ''}`}
                    placeholder="project_inquiry"
                  />
                </div>

                <div className="relative">
                  <label htmlFor="contact-message" className="absolute -top-2 left-3 bg-background px-1 font-mono text-xs text-muted-foreground">
                    message*
                  </label>
                  <Textarea
                    id="contact-message"
                    name="message"
                    value={formState.message}
                    onChange={(event) => {
                      setFormState({ ...formState, message: event.target.value });
                      if (errors.message) setErrors({ ...errors, message: '' });
                    }}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    required
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                    rows={6}
                    className={`resize-none font-mono ${focusedField === 'message' ? 'border-primary' : ''} ${errors.message ? 'border-red-500' : ''}`}
                    placeholder="Hello Douglas, I'd like to discuss..."
                  />
                  {errors.message ? <span id="message-error" className="mt-1 block px-1 text-xs text-red-500">{errors.message}</span> : null}
                </div>

                <input
                  type="text"
                  value={formState.website}
                  onChange={(event) => setFormState({ ...formState, website: event.target.value })}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-muted-foreground">
                  <span>{formState.message.length} characters</span>
                  <span>* required fields</span>
                  <span className="text-[11px] uppercase tracking-[0.18em]">Cmd/Ctrl + Enter to send</span>
                </div>

                <p id="contact-form-meta" className="text-xs text-muted-foreground">
                  A short brief, current constraint, and desired outcome is enough to start.
                </p>

                <Button type="submit" disabled={isSubmitting} className="cta-button w-full">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        ◌
                      </motion.span>
                      Sending...
                    </span>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                      <span className="font-mono text-xs opacity-50">Ctrl+Enter</span>
                    </>
                  )}
                </Button>

                <div id="contact-form-status" aria-live="polite" aria-atomic="true">
                  {submitStatus === 'success' ? (
                    <motion.div
                      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-green-600 dark:text-green-400"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Message sent successfully. I’ll get back to you soon.</span>
                    </motion.div>
                  ) : null}

                  {submitStatus === 'error' ? (
                    <motion.div
                      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-red-600 dark:text-red-400"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Something went wrong. Please try again or email directly.</span>
                    </motion.div>
                  ) : null}
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
