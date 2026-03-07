import { z } from 'zod';

const trimmedString = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min)
    .max(max);

export const contactSubmissionSchema = z.object({
  name: trimmedString(2, 80),
  email: z.string().trim().email().max(120),
  subject: z.string().trim().max(120).optional().default(''),
  message: trimmedString(20, 2000),
  source: z.string().trim().max(60).optional().default('website'),
  website: z.string().trim().max(120).optional().default(''),
});

export const newsletterSubscriptionSchema = z.object({
  email: z.string().trim().email().max(120),
  name: z.string().trim().max(80).optional().default(''),
  source: z.string().trim().max(60).optional().default('website'),
});
