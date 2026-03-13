import 'server-only';

import { z } from 'zod';
import { db } from '@/lib/db';
import { hasTable } from '@/lib/db-introspection';

export const contentTypeSchema = z.enum(['article', 'project', 'certification', 'book']);

export type ContentType = z.infer<typeof contentTypeSchema>;

export const articleEditorFieldsSchema = z.object({
  title: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  excerpt: z.string().trim().min(1),
  category: z.string().trim().min(1),
  featured: z.boolean(),
  status: z.enum(['published', 'draft']),
  content: z.string().trim().min(1),
});

export const projectEditorFieldsSchema = z.object({
  title: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  description: z.string().trim().min(1),
  longDescription: z.string().trim().optional(),
  category: z.string().trim().min(1),
  featured: z.boolean(),
  status: z.enum(['completed', 'in-progress', 'archived']),
  techStackText: z.string().trim().min(1),
});

export const certificationEditorFieldsSchema = z.object({
  title: z.string().trim().min(1),
  issuer: z.string().trim().min(1),
  description: z.string().trim().optional(),
  credentialUrl: z.string().trim().optional(),
  featured: z.boolean(),
  skillsText: z.string().trim().optional(),
});

export const bookEditorFieldsSchema = z.object({
  title: z.string().trim().min(1),
  subtitle: z.string().trim().optional(),
  description: z.string().trim().min(1),
  amazonUrl: z.string().trim().optional(),
  publisher: z.string().trim().optional(),
  featured: z.boolean(),
});

export type ArticleEditorFields = z.infer<typeof articleEditorFieldsSchema>;
export type ProjectEditorFields = z.infer<typeof projectEditorFieldsSchema>;
export type CertificationEditorFields = z.infer<typeof certificationEditorFieldsSchema>;
export type BookEditorFields = z.infer<typeof bookEditorFieldsSchema>;

export type EditableContentFields =
  | ArticleEditorFields
  | ProjectEditorFields
  | CertificationEditorFields
  | BookEditorFields;

export interface ArticleEditorItem {
  id: string;
  type: 'article';
  updatedAt: string;
  fields: ArticleEditorFields;
}

export interface ProjectEditorItem {
  id: string;
  type: 'project';
  updatedAt: string;
  fields: ProjectEditorFields;
}

export interface CertificationEditorItem {
  id: string;
  type: 'certification';
  updatedAt: string;
  fields: CertificationEditorFields;
}

export interface BookEditorItem {
  id: string;
  type: 'book';
  updatedAt: string;
  fields: BookEditorFields;
}

export type EditableContentItem =
  | ArticleEditorItem
  | ProjectEditorItem
  | CertificationEditorItem
  | BookEditorItem;

export interface UpdateEditableContentInput {
  id: string;
  type: ContentType;
  fields: unknown;
}

const CONTENT_TABLES: Record<ContentType, string> = {
  article: 'Article',
  project: 'Project',
  certification: 'Certification',
  book: 'Book',
};

function normalizeOptional(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function normalizeJsonList(value: string) {
  return JSON.stringify(
    value
      .split(/[\n,]+/)
      .map((entry) => entry.trim())
      .filter(Boolean)
  );
}

function safeParseJsonList(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === 'string')
      : [];
  } catch {
    return [];
  }
}

export async function ensureEditableContentStorage(type: ContentType) {
  return hasTable(CONTENT_TABLES[type]);
}

export function parseEditableContentFields(type: ContentType, fields: unknown) {
  switch (type) {
    case 'article':
      return articleEditorFieldsSchema.parse(fields);
    case 'project':
      return projectEditorFieldsSchema.parse(fields);
    case 'certification':
      return certificationEditorFieldsSchema.parse(fields);
    case 'book':
      return bookEditorFieldsSchema.parse(fields);
  }
}

export async function getContentEditorItem(type: ContentType, id: string): Promise<EditableContentItem | null> {
  switch (type) {
    case 'article': {
      const item = await db.article.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          category: true,
          featured: true,
          published: true,
          content: true,
          updatedAt: true,
        },
      });

      if (!item) {
        return null;
      }

      return {
        id: item.id,
        type,
        fields: {
          title: item.title,
          slug: item.slug,
          excerpt: item.excerpt,
          category: item.category,
          featured: item.featured,
          status: item.published ? 'published' : 'draft',
          content: item.content,
        },
        updatedAt: item.updatedAt.toISOString(),
      };
    }

    case 'project': {
      const item = await db.project.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          longDescription: true,
          category: true,
          featured: true,
          status: true,
          techStack: true,
          updatedAt: true,
        },
      });

      if (!item) {
        return null;
      }

      return {
        id: item.id,
        type,
        fields: {
          title: item.title,
          slug: item.slug,
          description: item.description,
          longDescription: item.longDescription ?? '',
          category: item.category,
          featured: item.featured,
          status: item.status as ProjectEditorFields['status'],
          techStackText: safeParseJsonList(item.techStack).join(', '),
        },
        updatedAt: item.updatedAt.toISOString(),
      };
    }

    case 'certification': {
      const item = await db.certification.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          issuer: true,
          description: true,
          credentialUrl: true,
          featured: true,
          skills: true,
          createdAt: true,
        },
      });

      if (!item) {
        return null;
      }

      return {
        id: item.id,
        type,
        fields: {
          title: item.title,
          issuer: item.issuer,
          description: item.description ?? '',
          credentialUrl: item.credentialUrl ?? '',
          featured: item.featured,
          skillsText: safeParseJsonList(item.skills).join(', '),
        },
        updatedAt: item.createdAt.toISOString(),
      };
    }

    case 'book': {
      const item = await db.book.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          subtitle: true,
          description: true,
          amazonUrl: true,
          publisher: true,
          featured: true,
          updatedAt: true,
        },
      });

      if (!item) {
        return null;
      }

      return {
        id: item.id,
        type,
        fields: {
          title: item.title,
          subtitle: item.subtitle ?? '',
          description: item.description,
          amazonUrl: item.amazonUrl ?? '',
          publisher: item.publisher ?? '',
          featured: item.featured,
        },
        updatedAt: item.updatedAt.toISOString(),
      };
    }
  }
}

export async function updateContentEditorItem(input: UpdateEditableContentInput): Promise<EditableContentItem | null> {
  switch (input.type) {
    case 'article': {
      const parsed = articleEditorFieldsSchema.parse(input.fields);
      const current = await db.article.findUnique({
        where: { id: input.id },
        select: { published: true, publishedAt: true },
      });

      await db.article.update({
        where: { id: input.id },
        data: {
          title: parsed.title,
          slug: parsed.slug,
          excerpt: parsed.excerpt,
          category: parsed.category,
          featured: parsed.featured,
          published: parsed.status === 'published',
          publishedAt:
            parsed.status === 'published'
              ? current?.publishedAt ?? new Date()
              : null,
          content: parsed.content,
        },
      });
      break;
    }

    case 'project': {
      const parsed = projectEditorFieldsSchema.parse(input.fields);
      await db.project.update({
        where: { id: input.id },
        data: {
          title: parsed.title,
          slug: parsed.slug,
          description: parsed.description,
          longDescription: normalizeOptional(parsed.longDescription),
          category: parsed.category,
          featured: parsed.featured,
          status: parsed.status,
          techStack: normalizeJsonList(parsed.techStackText),
        },
      });
      break;
    }

    case 'certification': {
      const parsed = certificationEditorFieldsSchema.parse(input.fields);
      await db.certification.update({
        where: { id: input.id },
        data: {
          title: parsed.title,
          issuer: parsed.issuer,
          description: normalizeOptional(parsed.description),
          credentialUrl: normalizeOptional(parsed.credentialUrl),
          featured: parsed.featured,
          skills: normalizeJsonList(parsed.skillsText ?? ''),
        },
      });
      break;
    }

    case 'book': {
      const parsed = bookEditorFieldsSchema.parse(input.fields);
      await db.book.update({
        where: { id: input.id },
        data: {
          title: parsed.title,
          subtitle: normalizeOptional(parsed.subtitle),
          description: parsed.description,
          amazonUrl: normalizeOptional(parsed.amazonUrl),
          publisher: normalizeOptional(parsed.publisher),
          featured: parsed.featured,
        },
      });
      break;
    }
  }

  return getContentEditorItem(input.type, input.id);
}

export async function createContentEditorItem(type: ContentType, fields: unknown): Promise<EditableContentItem | null> {
  const id = crypto.randomUUID();
  
  switch (type) {
    case 'article': {
      const parsed = articleEditorFieldsSchema.parse(fields);
      await db.article.create({
        data: {
          id,
          title: parsed.title,
          slug: parsed.slug,
          excerpt: parsed.excerpt,
          category: parsed.category,
          featured: parsed.featured,
          published: parsed.status === 'published',
          publishedAt: parsed.status === 'published' ? new Date() : null,
          content: parsed.content,
          tags: '[]',
        },
      });
      break;
    }

    case 'project': {
      const parsed = projectEditorFieldsSchema.parse(fields);
      await db.project.create({
        data: {
          id,
          title: parsed.title,
          slug: parsed.slug,
          description: parsed.description,
          longDescription: normalizeOptional(parsed.longDescription),
          category: parsed.category,
          featured: parsed.featured,
          status: parsed.status,
          techStack: normalizeJsonList(parsed.techStackText),
        },
      });
      break;
    }

    case 'certification': {
      const parsed = certificationEditorFieldsSchema.parse(fields);
      await db.certification.create({
        data: {
          id,
          title: parsed.title,
          issuer: parsed.issuer,
          description: normalizeOptional(parsed.description),
          credentialUrl: normalizeOptional(parsed.credentialUrl),
          featured: parsed.featured,
          skills: normalizeJsonList(parsed.skillsText ?? ''),
          issueDate: new Date(),
        },
      });
      break;
    }

    case 'book': {
      const parsed = bookEditorFieldsSchema.parse(fields);
      await db.book.create({
        data: {
          id,
          title: parsed.title,
          subtitle: normalizeOptional(parsed.subtitle),
          description: parsed.description,
          amazonUrl: normalizeOptional(parsed.amazonUrl),
          publisher: normalizeOptional(parsed.publisher),
          featured: parsed.featured,
        },
      });
      break;
    }
  }

  return getContentEditorItem(type, id);
}

export async function deleteContentEditorItem(type: ContentType, id: string): Promise<boolean> {
  try {
    switch (type) {
      case 'article':
        await db.article.delete({ where: { id } });
        break;
      case 'project':
        await db.project.delete({ where: { id } });
        break;
      case 'certification':
        await db.certification.delete({ where: { id } });
        break;
      case 'book':
        await db.book.delete({ where: { id } });
        break;
    }
    return true;
  } catch (error) {
    console.error(`Failed to delete ${type} ${id}:`, error);
    return false;
  }
}
