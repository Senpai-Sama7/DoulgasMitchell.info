import { getSession } from '@/lib/auth';
import { ApiHandler } from '@/lib/api-response';
import { getAnalyticsSummary } from '@/lib/analytics';
import { validateTrustedOrigin } from '@/lib/request';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return ApiHandler.unauthorized();
  }

  const originCheck = validateTrustedOrigin(req);
  if (!originCheck.allowed) {
    return ApiHandler.forbidden(originCheck.reason);
  }

  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30', 10);
    
    const summary = await getAnalyticsSummary(days);
    
    if (!summary) {
      return ApiHandler.error('Failed to retrieve analytics summary', 500);
    }

    return ApiHandler.success({ data: summary });
  } catch (error) {
    return ApiHandler.internalServerError('Analytics retrieval failed', error);
  }
}
