import { describe, expect, it } from 'vitest';
import {
  certificationShowcase,
  featuredArticles,
  featuredProjects,
  methodGates,
  methodLadder,
  methodPatterns,
} from '@/lib/site-content';

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
    expect(
      certificationShowcase.every((certification) =>
        certification.credentialUrl.startsWith('https://')
      )
    ).toBe(true);
  });

  it('ships a complete operator method playbook', () => {
    expect(methodLadder).toHaveLength(4);
    expect(methodGates).toHaveLength(4);
    expect(methodPatterns.length).toBeGreaterThanOrEqual(4);
    expect(new Set(methodLadder.map((step) => step.id)).size).toBe(methodLadder.length);
    expect(new Set(methodGates.map((gate) => gate.id)).size).toBe(methodGates.length);
  });
});
