import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  AuthenticationError,
  successResponse,
  withMiddleware,
} from '@/lib/middleware';
import { validateSession } from '@/lib/security';

async function handlePasskeyStatus(_request: NextRequest): Promise<NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-session')?.value;

  if (!token) {
    throw new AuthenticationError();
  }

  const sessionResult = await validateSession(token);

  if (!sessionResult.valid || !sessionResult.userId) {
    throw new AuthenticationError();
  }

  const passkeyCount = await db.passkeyCredential.count({
    where: { adminUserId: sessionResult.userId },
  });

  return successResponse({
    hasPasskey: passkeyCount > 0,
    passkeyCount,
  });
}

export const GET = withMiddleware(handlePasskeyStatus);
