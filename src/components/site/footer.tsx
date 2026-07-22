import { Github, Linkedin, Mail, BookOpen, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { siteProfile } from '@/lib/site-content';
import { PUBLIC_CONTACT_HREF } from '@/lib/public-contact-config';

const footerLinks = {
  navigation: [
    { href: '/#about', label: 'About' },
    { href: '/#method', label: 'Method' },
    { href: '/#work', label: 'Work' },
    { href: '/#writing', label: 'Writing' },
    { href: '/#book', label: 'Book' },
    { href: '/#contact', label: 'Contact' },
  ],
  external: [
    { href: siteProfile.githubUrl, label: 'GitHub', icon: Github },
    { href: siteProfile.linkedinUrl, label: 'LinkedIn', icon: Linkedin },
    { href: siteProfile.bookUrl, label: 'The Confident Mind', icon: BookOpen },
  ],
} as const;

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border/60 bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="editorial-container py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-16">
          <div className="max-w-md">
            <p className="font-display text-2xl tracking-tight">{siteProfile.name}</p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {siteProfile.headline}
            </p>
            <p className="mt-3 immersive-kicker">{siteProfile.location}</p>
          </div>

          <div>
            <h2 className="immersive-kicker mb-5">Navigate</h2>
            <ul className="space-y-3">
              {footerLinks.navigation.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-sm text-foreground/85 transition-colors hover:text-foreground"
                  >
                    <span className="h-px w-0 bg-foreground/40 transition-all group-hover:w-4" />
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  href="/chat"
                  className="group inline-flex items-center gap-2 text-sm text-foreground/85 transition-colors hover:text-foreground"
                >
                  <span className="h-px w-0 bg-foreground/40 transition-all group-hover:w-4" />
                  AI Assistant
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="immersive-kicker mb-5">Connect</h2>
            <ul className="space-y-3">
              {footerLinks.external.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 text-sm text-foreground/85 transition-colors hover:text-foreground"
                  >
                    <link.icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                    {link.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={PUBLIC_CONTACT_HREF}
                  className="group inline-flex items-center gap-2 text-sm text-foreground/85 transition-colors hover:text-foreground"
                >
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  Email Douglas Mitchell
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-border/50 pt-8 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {currentYear} Douglas Mitchell. All rights reserved.</p>
          <p className="immersive-kicker !text-[0.625rem]">
            Crafted with intent ·{' '}
            <Link href="/admin" className="transition-colors hover:text-foreground">
              Studio
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
