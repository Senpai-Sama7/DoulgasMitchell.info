import { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { ApiHandler } from '@/lib/api-response';
import { validateTrustedOrigin, readJsonBody } from '@/lib/request';
import { generateCaseStudy } from '@/lib/portfolio-intelligence';

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
    const body = await readJsonBody(request);
    const { title, description, metrics, technologies, role, context } = body as any;

    if (!title || !description) {
      return ApiHandler.error('Title and description are required for case study generation.', 400);
    }

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
    console.error('Case study generation API error:', error);
    return ApiHandler.internalServerError('Failed to process case study generation', error);
  }
}
