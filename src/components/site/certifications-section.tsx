'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Award, ExternalLink } from 'lucide-react';
import type { CertificationShowcase } from '@/lib/site-content';

interface CertificationsSectionProps {
  items: CertificationShowcase[];
}

export function CertificationsSection({ items }: CertificationsSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="certifications" className="section-spacing">
      <div className="editorial-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="ascii-marker mb-4 justify-center">
            <Award className="h-3 w-3" />
            <span>Credentials</span>
          </div>
          <h2 className="editorial-title mb-4">
            Certifications
          </h2>
          <p className="editorial-subtitle max-w-xl mx-auto">
            Continuous learning in emerging technologies. Verified credentials in AI and professional development.
          </p>
        </motion.div>

        {/* Certifications Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {items.map((cert, index) => (
            <motion.a
              key={cert.id}
              href={cert.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group block p-6 border border-border rounded-lg bg-background hover:border-primary/30 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                    {cert.issuer}
                  </span>
                  <h3 className="font-semibold mt-1 group-hover:text-primary transition-colors">
                    {cert.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {cert.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {cert.skills.map((skill) => (
                      <span key={skill} className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-mono text-muted-foreground">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {cert.imageUrl && (
                    <div className="mt-4 relative aspect-[4/3] rounded-md overflow-hidden border border-border/50 group-hover:border-primary/20 transition-colors bg-muted/20">
                      <img 
                        src={cert.imageUrl} 
                        alt={`${cert.title} certificate`}
                        className="w-full h-full object-contain p-1 group-hover:scale-[1.02] transition-transform duration-500"
                      />
                    </div>
                  )}

                  <span className="inline-flex items-center gap-1 text-xs text-primary mt-4 group-hover:translate-x-1 transition-transform">
                    View Credential
                    <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
