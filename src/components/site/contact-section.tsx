'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, MapPin, Github, Linkedin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PUBLIC_CONTACT_HREF, PUBLIC_CONTACT_VALUE } from '@/lib/public-contact-config';

const contactMethods = [
  {
    icon: Mail,
    label: 'Email',
    value: PUBLIC_CONTACT_VALUE,
    href: PUBLIC_CONTACT_HREF,
  },
  {
    icon: Github,
    label: 'GitHub',
    value: '@Senpai-Sama7',
    href: 'https://github.com/Senpai-Sama7',
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    value: 'douglas-mitchell-the-architect',
    href: 'https://www.linkedin.com/in/douglas-mitchell-the-architect/',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Houston, TX',
    href: null,
  },
];

export function ContactSection() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formState.name,
          email: formState.email,
          message: formState.message,
          website: '',
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormState({ name: '', email: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  return (
    <section id="contact" className="section-spacing bg-muted/30">
      <div className="editorial-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="ascii-marker mb-4 justify-center">
            <span>Contact</span>
          </div>
          <h2 className="editorial-title mb-4">
            Let's Build Something
          </h2>
          <p className="editorial-subtitle max-w-2xl mx-auto">
            Whether you have a project in mind, want to discuss AI automation, 
            or just want to connect — I'm always open to meaningful conversations.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Methods */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-6">
              Connect Directly
            </h3>
            <div className="space-y-4">
              {contactMethods.map((method) => (
                <div
                  key={method.label}
                  className="flex items-center gap-4 p-4 border border-border rounded-lg bg-background hover:border-primary/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <method.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <span className="font-mono text-xs text-muted-foreground">
                      {method.label}
                    </span>
                    {method.href ? (
                      <a
                        href={method.href}
                        target={method.href.startsWith('http') ? '_blank' : undefined}
                        rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="block text-sm font-medium hover:text-primary transition-colors"
                      >
                        {method.value}
                      </a>
                    ) : (
                      <span className="block text-sm font-medium">
                        {method.value}
                      </span>
                    )}
                  </div>
                  {method.href && method.href.startsWith('http') && (
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-6">
              Send a Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="sr-only">
                  Name
                </label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  required
                  className="bg-background"
                />
              </div>
              <div>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  required
                  className="bg-background"
                />
              </div>
              <div>
                <label htmlFor="message" className="sr-only">
                  Message
                </label>
                <Textarea
                  id="message"
                  placeholder="Your message..."
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  required
                  rows={5}
                  className="bg-background resize-none"
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full cta-button"
              >
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
              {submitStatus === 'success' && (
                <p className="text-sm text-green-600 dark:text-green-400 text-center">
                  Message sent successfully! I'll get back to you soon.
                </p>
              )}
              {submitStatus === 'error' && (
                <p className="text-sm text-red-600 dark:text-red-400 text-center">
                  Something went wrong. Please try again or email directly.
                </p>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
