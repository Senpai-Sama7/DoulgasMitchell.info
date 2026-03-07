import { describe, expect, it } from 'vitest';
import { certificationShowcase, featuredArticles, featuredProjects } from '@/lib/site-content';

describe('Site content integrity', () => {
  it('has unique article slugs', () => {
    const slugs = featuredArticles.map((article) => article.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('has unique project slugs', () => {
    const slugs = featuredProjects.map((project) => project.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('ensures featured certifications have credential links', () => {
    expect(certificationShowcase.every((certification) => certification.credentialUrl.startsWith('https://'))).toBe(true);
  });
});
