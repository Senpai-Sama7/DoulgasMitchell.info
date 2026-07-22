'use client';

import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import type { CertificationShowcase } from '@/lib/site-content';
import { mediaManifest } from '@/lib/media-manifest';
import {
  ScrollReveal,
  ScrollRevealItem,
  ScrollRevealStagger,
} from '@/components/immersive/scroll-reveal';

const certImages: Record<string, string> = {
  'google-ai-professional-certificate': mediaManifest.certs.googleAi,
  'anthropic-ai-safety': mediaManifest.certs.anthropic,
};

interface ImmersiveCertificationsSectionProps {
  items: CertificationShowcase[];
}

export function ImmersiveCertificationsSection({ items }: ImmersiveCertificationsSectionProps) {
  return (
    <section id="certifications" className="section-spacing">
      <div className="editorial-container">
        <ScrollReveal className="mb-12 grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-end">
          <div>
            <p className="immersive-kicker mb-4">Credentials</p>
            <h2 className="editorial-title">Verified practice</h2>
          </div>
          <p className="max-w-md text-muted-foreground">
            Credentials matter when they change how work ships. These are applied to delivery
            systems, not listed as decoration.
          </p>
        </ScrollReveal>

        <ScrollRevealStagger className="divide-y divide-border/55 border-y border-border/55">
          {items.map((cert) => (
            <ScrollRevealItem key={cert.id}>
              <article className="group/row flex flex-col gap-5 py-7 transition-colors duration-300 hover:bg-brand-accent/[0.03] sm:flex-row sm:items-start">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden border border-border/70 bg-muted">
                  {certImages[cert.id] ? (
                    <Image
                      src={certImages[cert.id]}
                      alt=""
                      fill
                      className="object-cover grayscale-[0.6] transition-[filter] duration-500 group-hover/row:grayscale-0"
                      sizes="56px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      {cert.issuer.slice(0, 2)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-medium tracking-tight">{cert.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {cert.issuer}
                    <span className="text-muted-foreground/40"> · </span>
                    {cert.issueDate}
                  </p>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {cert.description}
                  </p>
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor="interactive"
                    className="lux-underline mt-4 inline-flex items-center gap-1.5 text-sm font-medium"
                  >
                    Verify credential
                    <ExternalLink className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover/row:-translate-y-0.5 group-hover/row:translate-x-0.5" />
                  </a>
                </div>
              </article>
            </ScrollRevealItem>
          ))}
        </ScrollRevealStagger>
      </div>
    </section>
  );
}
