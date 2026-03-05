import { z } from 'zod';

const journalTagNameSchema = z
  .string()
  .trim()
  .min(1, 'Tag is required')
  .max(50, 'Tag is too long');

// Auth validation schemas
export const loginSchema = z.object({
  password: z
    .string()
    .min(1, 'Password is required')
    .max(100, 'Password is too long'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Gallery validation schemas
export const gallerySeriesSchema = z.enum(['recent-post', 'tech-deck', 'project']);

export const createGalleryImageSchema = z.object({
  src: z.string().url('Invalid image URL').or(z.string().startsWith('/images/', 'Invalid image path')),
  alt: z.string().min(1, 'Alt text is required').max(200, 'Alt text is too long'),
  caption: z.string().min(1, 'Caption is required').max(500, 'Caption is too long'),
  series: gallerySeriesSchema,
  width: z.number().int().positive().default(1344),
  height: z.number().int().positive().default(768),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  blurDataUrl: z.string().optional(),
});

export const updateGalleryImageSchema = createGalleryImageSchema.partial();

export type CreateGalleryImageInput = z.infer<typeof createGalleryImageSchema>;
export type UpdateGalleryImageInput = z.infer<typeof updateGalleryImageSchema>;

// Journal validation schemas
export const createJournalEntrySchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  content: z.string().min(1, 'Content is required'),
  quote: z.string().max(500, 'Quote is too long').optional(),
  image: z.string().url('Invalid image URL').or(z.string().startsWith('/images/', 'Invalid image path')),
  imageAlt: z.string().min(1, 'Image alt text is required').max(200, 'Image alt text is too long'),
  tags: z.array(journalTagNameSchema).default([]),
});

export const updateJournalEntrySchema = createJournalEntrySchema.partial();
export const updateJournalEntryRequestSchema = updateJournalEntrySchema.extend({
  id: z.string().min(1, 'Entry ID is required'),
});

export type CreateJournalEntryInput = z.infer<typeof createJournalEntrySchema>;
export type UpdateJournalEntryInput = z.infer<typeof updateJournalEntrySchema>;
export type UpdateJournalEntryRequestInput = z.infer<typeof updateJournalEntryRequestSchema>;

// Settings validation schema
export const settingsSchema = z.object({
  siteTitle: z.string().min(1, 'Site title is required').max(100, 'Site title is too long'),
  siteDescription: z.string().min(1, 'Site description is required').max(500, 'Site description is too long'),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  telegram: z.string().max(100, 'Telegram handle is too long').optional().or(z.literal('')),
  whatsapp: z.string().max(100, 'WhatsApp number is too long').optional().or(z.literal('')),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

// Contact form validation schema
export const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
  message: z.string().min(1, 'Message is required').max(2000, 'Message is too long'),
  preferredContact: z.enum(['email', 'phone', 'video']).default('email'),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

// Batch operations schema
export const batchMoveSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one item is required'),
  series: gallerySeriesSchema,
});

export const batchDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one item is required'),
});

export type BatchMoveInput = z.infer<typeof batchMoveSchema>;
export type BatchDeleteInput = z.infer<typeof batchDeleteSchema>;

// Reorder schema
export const reorderSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    order: z.number().int().nonnegative(),
  })),
});

export type ReorderInput = z.infer<typeof reorderSchema>;

// Search and filter schemas
export const galleryFilterSchema = z.object({
  series: gallerySeriesSchema.optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['date', 'createdAt']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
});

export const journalFilterSchema = z.object({
  search: z.string().max(100).optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  tag: z.string().max(50).optional(),
  sortBy: z.enum(['date', 'createdAt']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().int().positive().max(100).default(20),
  offset: z.number().int().nonnegative().default(0),
});

export type GalleryFilterInput = z.infer<typeof galleryFilterSchema>;
export type JournalFilterInput = z.infer<typeof journalFilterSchema>;

// Activity query schemas
export const activityQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(200).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
  resource: z.string().trim().min(1, 'Resource cannot be empty').max(100).optional(),
});

export const activityDeleteSchema = z.object({
  before: z
    .string()
    .trim()
    .min(1)
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid before date')
    .optional(),
});

// Export/Import schema
const importGalleryImageSchema = createGalleryImageSchema
  .extend({
    id: z.string().optional(),
    order: z.number().int().nonnegative().optional(),
  });

const importJournalEntrySchema = createJournalEntrySchema
  .extend({
    id: z.string().optional(),
    order: z.number().int().nonnegative().optional(),
  });

const importDataPayloadSchema = z.object({
  gallery: z.array(importGalleryImageSchema).optional(),
  galleryImages: z.array(importGalleryImageSchema).optional(),
  journal: z.array(importJournalEntrySchema).optional(),
  journalEntries: z.array(importJournalEntrySchema).optional(),
  settings: settingsSchema.optional(),
});

export const importDataSchema = z.object({
  data: importDataPayloadSchema.optional(),
  gallery: z.array(importGalleryImageSchema).optional(),
  galleryImages: z.array(importGalleryImageSchema).optional(),
  journal: z.array(importJournalEntrySchema).optional(),
  journalEntries: z.array(importJournalEntrySchema).optional(),
  settings: settingsSchema.optional(),
  mode: z.enum(['merge', 'replace']).default('merge'),
});

export type ImportDataInput = z.infer<typeof importDataSchema>;

// ID parameter validation
export const idParamSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

// Generic response schemas
export const errorResponseSchema = z.object({
  error: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
});

export const successResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
  data: z.unknown().optional(),
});
