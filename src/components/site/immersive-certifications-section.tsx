'use client';

import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import type { CertificationShowcase } from '@/lib/site-content';
import { mediaManifest } from '@/lib/media-manifest';
import { ScrollReveal, ScrollRevealItem, ScrollRevealStagger } from '@/components/immersive/scroll-reveal';

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
        <ScrollReveal className="mb-12">
          <p className="immersive-kicker mb-4">Credentials</p>
          <h2 className="editorial-title">Verified expertise</h2>
        </ScrollReveal>

        <ScrollRevealStagger className="grid gap-4 md:grid-cols-2">
          {items.map((cert) => (
            <ScrollRevealItem key={cert.id}>
              <article className="glass-panel flex gap-5 p-6">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {certImages[cert.id] ? (
                    <Image
                      src={certImages[cert.id]}
                      alt={cert.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      {cert.issuer.slice(0, 2)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium">{cert.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{cert.issuer}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {cert.description}
                  </p>
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium hover:underline"
                  >
                    Verify credential
                    <ExternalLink className="h-3.5 w-3.5" />
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
