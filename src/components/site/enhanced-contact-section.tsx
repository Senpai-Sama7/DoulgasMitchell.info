'use client';

import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Mail, Send, MapPin, Github, Linkedin, ExternalLink, CheckCircle, AlertCircle, Terminal } from 'lucide-react';
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

export function EnhancedContactSection() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    website: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && !isSubmitting) {
        const form = document.getElementById('contact-form') as HTMLFormElement | null;
        form?.requestSubmit();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isSubmitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      if (response.ok) {
        setSubmitStatus('success');
        setFormState({ name: '', email: '', subject: '', message: '', website: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus('idle'), 5000);
    }
  };

  return (
    <section id="contact" className="section-spacing relative overflow-hidden">
      {/* Background ASCII */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <pre className="font-mono text-[10px] text-muted-foreground whitespace-pre">
          {asciiDecoration}
        </pre>
      </div>

      <div className="editorial-container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="font-mono text-xs text-muted-foreground">{'// 06'}</span>
          </div>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 border border-border rounded-full mb-6">
            <Terminal className="h-4 w-4 text-primary" />
            <span className="font-mono text-sm">connect()</span>
          </div>
          
          <h2 className="editorial-title mb-4">
            Let's Build Something
          </h2>
          <p className="editorial-subtitle max-w-2xl mx-auto">
            Whether you have a project in mind, want to discuss AI automation, 
            or just want to connect — I'm always open to meaningful conversations.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Methods */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="font-mono text-xs text-muted-foreground mb-6 flex items-center gap-2">
              <span className="text-primary">$</span>
              cat contact_info.json
            </div>
            
            <div className="space-y-4">
              {contactMethods.map((method, index) => (
                <motion.div
                  key={method.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  {method.href ? (
                    <a
                      href={method.href}
                      target={method.href.startsWith('http') ? '_blank' : undefined}
                      rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className={`group flex items-center gap-4 p-4 border border-border rounded-lg bg-background hover:border-primary/30 transition-all ${method.color}`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                        {(() => {
                          const Icon = contactIcons[method.label as keyof typeof contactIcons];
                          return <Icon className="h-5 w-5 text-muted-foreground group-hover:current transition-colors" />;
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-mono text-xs text-muted-foreground">
                          {method.label.toLowerCase()}
                        </span>
                        <span className="block text-sm font-medium truncate">
                          {method.value}
                        </span>
                      </div>
                      {method.href.startsWith('http') && (
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      )}
                    </a>
                  ) : (
                    <div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-background">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        {(() => {
                          const Icon = contactIcons[method.label as keyof typeof contactIcons];
                          return <Icon className="h-5 w-5 text-muted-foreground" />;
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-mono text-xs text-muted-foreground">
                          {method.label.toLowerCase()}
                        </span>
                        <span className="block text-sm font-medium truncate">
                          {method.value}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* ASCII Art */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-8 p-4 bg-muted/30 border border-border rounded-lg"
            >
              <pre className="font-mono text-[10px] text-muted-foreground leading-tight">
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

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="font-mono text-xs text-muted-foreground mb-6 flex items-center gap-2">
              <span className="text-primary">$</span>
              nano message.txt
            </div>

            <form id="contact-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Terminal Header */}
              <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border border-border rounded-t-lg border-b-0">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <span className="font-mono text-xs text-muted-foreground ml-2">
                  new_message.txt
                </span>
              </div>

              {/* Form Body */}
              <div className="p-6 border border-border rounded-b-lg bg-background space-y-4">
                {/* Name Field */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 px-1 bg-background text-xs font-mono text-muted-foreground">
                    name*
                  </label>
                  <Input
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`font-mono ${focusedField === 'name' ? 'border-primary' : ''}`}
                    placeholder="your_name"
                  />
                </div>

                {/* Email Field */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 px-1 bg-background text-xs font-mono text-muted-foreground">
                    email*
                  </label>
                  <Input
                    type="email"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                    className={`font-mono ${focusedField === 'email' ? 'border-primary' : ''}`}
                    placeholder="your@email.com"
                  />
                </div>

                {/* Subject Field */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 px-1 bg-background text-xs font-mono text-muted-foreground">
                    subject
                  </label>
                  <Input
                    value={formState.subject}
                    onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                    onFocus={() => setFocusedField('subject')}
                    onBlur={() => setFocusedField(null)}
                    className={`font-mono ${focusedField === 'subject' ? 'border-primary' : ''}`}
                    placeholder="project_inquiry"
                  />
                </div>

                {/* Message Field */}
                <div className="relative">
                  <label className="absolute -top-2 left-3 px-1 bg-background text-xs font-mono text-muted-foreground">
                    message*
                  </label>
                  <Textarea
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    onFocus={() => setFocusedField('message')}
                    onBlur={() => setFocusedField(null)}
                    required
                    rows={5}
                    className={`font-mono resize-none ${focusedField === 'message' ? 'border-primary' : ''}`}
                    placeholder="Hello Douglas, I'd like to discuss..."
                  />
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

                {/* Character Count */}
                <div className="flex justify-between items-center text-xs font-mono text-muted-foreground">
                  <span>{formState.message.length} characters</span>
                  <span>* required fields</span>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full cta-button"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
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

                {/* Status Messages */}
                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 dark:text-green-400"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Message sent successfully! I'll get back to you soon.</span>
                  </motion.div>
                )}
                
                {submitStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Something went wrong. Please try again or email directly.</span>
                  </motion.div>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
