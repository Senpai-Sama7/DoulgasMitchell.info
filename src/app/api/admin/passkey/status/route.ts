import { Prisma } from '@prisma/client';
import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  AuthenticationError,
  ServiceUnavailableError,
  successResponse,
  withMiddleware,
} from '@/lib/middleware';
import { validateSession } from '@/lib/security';

function isMissingPasskeyStorage(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2021'
  );
}

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

  let passkeyCount = 0;
  try {
    passkeyCount = await db.passkeyCredential.count({
      where: { adminUserId: sessionResult.userId },
    });
  } catch (error) {
    if (isMissingPasskeyStorage(error)) {
      throw new ServiceUnavailableError(
        'Passkey storage is not ready. Run database schema sync for passkeys.'
      );
    }
    throw error;
  }

  return successResponse({
    hasPasskey: passkeyCount > 0,
    passkeyCount,
  });
}

export const GET = withMiddleware(handlePasskeyStatus);
