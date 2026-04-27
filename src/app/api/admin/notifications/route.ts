import { NextResponse, type NextRequest } from 'next/server';
import { ApiHandler } from '@/lib/api-response';
import { getSession } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { validateTrustedOrigin } from '@/lib/request';
import { NotificationService } from '@/lib/notifications';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return ApiHandler.error('Unauthorized', 401);
    }

    if (!validateTrustedOrigin(request).allowed) {
      return ApiHandler.error('Untrusted origin', 403);
    }

    const notifications = await NotificationService.getLatest(20);

    return ApiHandler.success({
      notifications,
      count: notifications.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to fetch notifications:', error);
    return ApiHandler.error('Internal server error', 500);
  }
}
