import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getSearchableContent } = vi.hoisted(() => ({
  getSearchableContent: vi.fn(),
}));

vi.mock('@/lib/content-service', () => ({
  getSearchableContent,
}));

import { answerPublicQuestion } from '@/lib/public-assistant';

describe('public assistant', () => {
  beforeEach(() => {
    getSearchableContent.mockReset();
    getSearchableContent.mockResolvedValue({
      projects: [
        {
          slug: 'systems-architecture-toolkit',
          title: 'Systems Architecture Toolkit',
          description:
            'A reusable toolkit for building maintainable systems with better boundaries and observability.',
          category: 'System Design',
          status: 'Published',
          techStack: ['TypeScript', 'Docker', 'AWS'],
        },
        {
          slug: 'ai-workflow-automation',
          title: 'AI Workflow Automation',
          description:
            'A decision-support automation layer for structured, auditable workflow execution.',
          category: 'AI Automation',
          status: 'Published',
          techStack: ['Python', 'Redis', 'n8n'],
        },
      ],
      articles: [
        {
          slug: 'rizz-prompting-attractor-based-style-steering',
          title: 'Rizz Prompting: Attractor-Based Style Steering in LLMs',
          excerpt:
            'An editorial adaptation of the working paper on style steering and prompt design.',
          category: 'Research',
          tags: ['Prompting', 'LLMs'],
        },
      ],
    });
  });

  it('refuses sensitive questions', async () => {
    const reply = await answerPublicQuestion('What is Douglas Mitchell home address?');

    expect(reply.refusal).toBe(true);
    expect(reply.answer).toMatch(/public, non-sensitive/i);
    expect(reply.citations[0]?.label).toBe('Secure contact form');
  });

  it('returns a collection answer for project list questions', async () => {
    const reply = await answerPublicQuestion('What are the standout projects on this site?');

    expect(reply.refusal).toBe(false);
    expect(reply.answer).toMatch(/featured projects/i);
    expect(reply.answer).toMatch(/Systems Architecture Toolkit/);
    expect(reply.answer).toMatch(/AI Workflow Automation/);
    expect(reply.citations.map((citation) => citation.label)).toContain('Systems Architecture Toolkit');
  });

  it('returns article detail for writing questions', async () => {
    const reply = await answerPublicQuestion('Tell me about the rizz prompting article.');

    expect(reply.refusal).toBe(false);
    expect(reply.answer).toMatch(/Rizz Prompting/i);
    expect(reply.citations[0]?.href).toBe('/writing/rizz-prompting-attractor-based-style-steering');
  });

  it('refuses unrelated prompts when strict topic mode is enabled', async () => {
    const reply = await answerPublicQuestion('What is the weather in Chicago today?', {
      strictTopicMode: true,
    });

    expect(reply.refusal).toBe(true);
    expect(reply.answer).toMatch(/only answer public questions/i);
  });

  it('correctly scores an entry using proximity boost', async () => {
    // Testing specific project title tokens to trigger the proximity boost
    const reply = await answerPublicQuestion('Tell me about the systems architecture toolkit.');

    expect(reply.refusal).toBe(false);
    expect(reply.answer).toMatch(/Systems Architecture Toolkit/);
    expect(reply.citations[0]?.label).toBe('Systems Architecture Toolkit');
  });

  it('provides a detailed response for an exact match', async () => {
    const reply = await answerPublicQuestion('Systems Architecture Toolkit');

    expect(reply.refusal).toBe(false);
    expect(reply.answer).toMatch(/Systems Architecture Toolkit is a System Design project/i);
    expect(reply.citations[0]?.label).toBe('Systems Architecture Toolkit');
  });
});
