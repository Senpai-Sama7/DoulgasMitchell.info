import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { ApiHandler } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { validateTrustedOrigin, readJsonBody } from '@/lib/request';
import { generateCaseStudy } from '@/lib/portfolio-intelligence';

const caseStudySchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  metrics: z.array(z.object({
    label: z.string().trim().min(1),
    value: z.string().trim().min(1),
  })).optional(),
  technologies: z.array(z.string().trim().min(1)).optional(),
  role: z.string().trim().optional(),
  context: z.string().trim().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return ApiHandler.unauthorized();
  }

  const originCheck = validateTrustedOrigin(request);
  if (!originCheck.allowed) {
    return ApiHandler.forbidden(originCheck.reason);
  }

  try {
    const raw = await readJsonBody(request);
    const parsed = caseStudySchema.safeParse(raw);
    if (!parsed.success) {
      return ApiHandler.error('Invalid case study input.', 400, parsed.error.flatten());
    }

    const { title, description, metrics, technologies, role, context } = parsed.data;

    const draft = await generateCaseStudy({
      title,
      description,
      metrics,
      technologies,
      role,
      context
    });

    if (!draft) {
      return ApiHandler.error('Failed to generate case study draft.', 500);
    }

    return ApiHandler.success({ draft });
  } catch (error) {
    logger.error('Case study generation API error:', error);
    return ApiHandler.internalServerError('Failed to process case study generation', error);
  }
}
