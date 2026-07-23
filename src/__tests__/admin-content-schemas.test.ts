import { describe, it, expect } from 'vitest';
import {
  contentTypeSchema,
  parseEditableContentFields,
} from '@/lib/admin-content';

describe('admin content editor schemas', () => {
  describe('contentTypeSchema', () => {
    it('accepts the four editable content types', () => {
      for (const type of ['article', 'project', 'certification', 'book']) {
        expect(contentTypeSchema.safeParse(type).success).toBe(true);
      }
    });

    it('rejects unknown types', () => {
      expect(contentTypeSchema.safeParse('page').success).toBe(false);
      expect(contentTypeSchema.safeParse('').success).toBe(false);
      expect(contentTypeSchema.safeParse(undefined).success).toBe(false);
    });
  });

  describe('parseEditableContentFields', () => {
    it('parses a valid article payload', () => {
      const parsed = parseEditableContentFields('article', {
        title: 'Title',
        slug: 'title',
        excerpt: 'Short summary',
        category: 'Research',
        featured: true,
        status: 'published',
        content: '# Body',
      });

      expect(parsed).toMatchObject({ title: 'Title', status: 'published' });
    });

    it('rejects an article with an invalid status', () => {
      expect(() =>
        parseEditableContentFields('article', {
          title: 'Title',
          slug: 'title',
          excerpt: 'Short summary',
          category: 'Research',
          featured: true,
          status: 'archived', // not valid for articles
          content: '# Body',
        })
      ).toThrow();
    });

    it('rejects empty required strings after trimming', () => {
      expect(() =>
        parseEditableContentFields('article', {
          title: '   ',
          slug: 'title',
          excerpt: 'Short summary',
          category: 'Research',
          featured: true,
          status: 'draft',
          content: '# Body',
        })
      ).toThrow();
    });

    it('parses a valid project payload and allows optional longDescription', () => {
      const parsed = parseEditableContentFields('project', {
        title: 'Project',
        slug: 'project',
        description: 'What it does',
        category: 'Work',
        featured: false,
        status: 'in-progress',
        techStackText: 'Next.js, Prisma',
      });

      expect(parsed).toMatchObject({ status: 'in-progress' });
    });

    it('rejects a project without a tech stack', () => {
      expect(() =>
        parseEditableContentFields('project', {
          title: 'Project',
          slug: 'project',
          description: 'What it does',
          category: 'Work',
          featured: false,
          status: 'completed',
          techStackText: '',
        })
      ).toThrow();
    });

    it('parses certification and book payloads with optional fields omitted', () => {
      expect(
        parseEditableContentFields('certification', {
          title: 'Cert',
          issuer: 'Issuer',
          featured: false,
        })
      ).toMatchObject({ issuer: 'Issuer' });

      expect(
        parseEditableContentFields('book', {
          title: 'Book',
          description: 'About the book',
          featured: true,
        })
      ).toMatchObject({ title: 'Book' });
    });

    it('rejects unexpected value types instead of coercing them', () => {
      expect(() =>
        parseEditableContentFields('book', {
          title: 'Book',
          description: 'About the book',
          featured: 'yes', // must be a boolean
        })
      ).toThrow();
    });
  });
});
