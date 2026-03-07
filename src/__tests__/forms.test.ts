import { describe, expect, it } from 'vitest';
import { contactSubmissionSchema, newsletterSubscriptionSchema } from '@/lib/forms';

describe('Form validation', () => {
  it('accepts a valid contact submission', () => {
    const result = contactSubmissionSchema.safeParse({
      name: 'Douglas Mitchell',
      email: 'douglas@example.com',
      subject: 'Advisory engagement',
      message: 'I would love to discuss a systems and automation engagement for our operations team.',
      source: 'portfolio',
      website: '',
    });

    expect(result.success).toBe(true);
  });

  it('rejects contact submissions with short messages', () => {
    const result = contactSubmissionSchema.safeParse({
      name: 'Douglas',
      email: 'douglas@example.com',
      message: 'Too short',
    });

    expect(result.success).toBe(false);
  });

  it('accepts valid newsletter subscriptions', () => {
    const result = newsletterSubscriptionSchema.safeParse({
      email: 'reader@example.com',
      name: 'Reader',
      source: 'writing-section',
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid newsletter emails', () => {
    const result = newsletterSubscriptionSchema.safeParse({
      email: 'not-an-email',
    });

    expect(result.success).toBe(false);
  });
});
