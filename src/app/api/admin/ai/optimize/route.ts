import { getSession } from '@/lib/auth';
import { ApiHandler } from '@/lib/api-response';
import { analyzeContent } from '@/lib/content-optimizer';
import { validateTrustedOrigin } from '@/lib/request';

export async function POST(request: Request) {
  if (!validateTrustedOrigin(request).allowed) {
    return ApiHandler.error('Untrusted origin', 403);
  }

  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return ApiHandler.error('Unauthorized', 401);
  }

  try {
    const { content, type } = await request.json();
    if (!content) return ApiHandler.error('Content is required', 400);

    const result = await analyzeContent(content, type || 'Article');
    if (!result) return ApiHandler.error('Optimization failed', 500);

    return ApiHandler.success({ data: result });
  } catch (error) {
    return ApiHandler.internalServerError('Analysis failed', error);
  }
}
