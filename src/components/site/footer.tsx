import { Github, Linkedin, Mail, BookOpen } from 'lucide-react';
import { siteProfile } from '@/lib/site-content';
import { PUBLIC_CONTACT_HREF } from '@/lib/public-contact-config';

const footerLinks = {
  navigation: [
    { href: '/#about', label: 'About' },
    { href: '/#work', label: 'Work' },
    { href: '/#writing', label: 'Writing' },
    { href: '/#contact', label: 'Contact' },
  ],
  external: [
    { href: siteProfile.githubUrl, label: 'GitHub', icon: Github },
    { href: siteProfile.linkedinUrl, label: 'LinkedIn', icon: Linkedin },
    { href: siteProfile.bookUrl, label: 'The Confident Mind on Amazon', icon: BookOpen },
  ],
};

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="editorial-container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="font-mono text-xs text-muted-foreground">{'//'}</span>
              <span className="font-semibold">{siteProfile.name}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {siteProfile.headline}
            </p>
          </div>

          {/* Navigation Column */}
          {/* Fix: h4 skipped heading levels (page h2/h3 -> h4 jump). Footer columns use h2
              as they are top-level landmarks within <footer>. */}
          <div>
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
              Navigation
            </h2>
            <ul className="space-y-2">
              {footerLinks.navigation.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect Column */}
          <div>
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">
              Connect
            </h2>
            <ul className="space-y-2">
              {footerLinks.external.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                  >
                    <link.icon className="h-4 w-4" aria-hidden="true" />
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                {/* Fix: descriptive link text for SEO audit */}
                <a
                  href={PUBLIC_CONTACT_HREF}
                  className="inline-flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Email Douglas Mitchell
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="ascii-divider mb-8">
          {'─'.repeat(3)}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>
            © {currentYear} Douglas Mitchell. All rights reserved.
          </p>
          <p className="font-mono">
            Built with precision. Designed with{' '}
            <a href="/admin" className="hover:text-foreground transition-colors cursor-default">intent.</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
