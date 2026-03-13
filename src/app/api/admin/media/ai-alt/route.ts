import { getSession } from '@/lib/auth';
import { ApiHandler } from '@/lib/api-response';
import { generateAltText } from '@/lib/media-ai';
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
    const { mediaId } = await request.json();
    if (!mediaId) return ApiHandler.error('Media ID is required', 400);

    const alt = await generateAltText(mediaId);
    if (!alt) return ApiHandler.error('Alt text generation failed', 500);

    return ApiHandler.success({ alt });
  } catch (error) {
    return ApiHandler.internalServerError('Alt text generation failed', error);
  }
}
