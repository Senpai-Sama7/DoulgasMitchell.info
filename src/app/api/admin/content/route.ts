import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAdminContentSnapshot } from '@/lib/content-service';
import { ApiHandler } from '@/lib/api-response';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return ApiHandler.unauthorized();
  }

  try {
    const snapshot = await getAdminContentSnapshot();
    return ApiHandler.success({ ...snapshot });
  } catch (error) {
    return ApiHandler.internalServerError('Failed to fetch content snapshot', error);
  }
}
