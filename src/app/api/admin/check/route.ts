import { NextResponse, type NextRequest } from 'next/server';
import { ApiHandler } from '@/lib/api-response';
import { getSession } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIp, validateTrustedOrigin } from '@/lib/request';
import { countAdminUsers } from '@/lib/admin-compat';

export async function GET(request: NextRequest) {
  try {
    const originCheck = validateTrustedOrigin(request);
    if (!originCheck.allowed) {
      return ApiHandler.forbidden(originCheck.reason);
    }

    const clientIp = await getClientIp(request);
    const limit = await rateLimit(clientIp, {
      limit: 10,
      windowMs: 60 * 1000,
      prefix: 'admin-check',
    });

    if (!limit.allowed) {
      return ApiHandler.error('Rate limit exceeded.', 429);
    }

    const count = await countAdminUsers();
    return ApiHandler.success({ isInitialized: count > 0 });
  } catch {
    return ApiHandler.internalServerError('Failed to check admin status');
  }
}
