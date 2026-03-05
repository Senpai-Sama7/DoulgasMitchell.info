import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { Prisma } from '@prisma/client';
import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  AuthenticationError,
  RateLimitError,
  ServiceUnavailableError,
  successResponse,
  withMiddleware,
} from '@/lib/middleware';
import {
  getPasskeyChallengeCookieOptions,
  getPasskeyExpectedOrigins,
  getPasskeyRPID,
  parseStoredTransports,
  PASSKEY_AUTH_CHALLENGE_COOKIE,
} from '@/lib/passkeys';
import { checkRateLimit, getClientIp, initializeAdminUser } from '@/lib/security';

let initialized = false;

function isMissingPasskeyStorage(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2021'
  );
}

async function ensureAdminInitialized() {
  if (!initialized) {
    await initializeAdminUser();
    initialized = true;
  }
}

async function handlePasskeyAuthOptions(request: NextRequest): Promise<NextResponse> {
  await ensureAdminInitialized();

  const ipAddress = getClientIp(request);
  const rateLimitResult = checkRateLimit(ipAddress);

  if (!rateLimitResult.allowed) {
    throw new RateLimitError(
      Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000)
    );
  }

  const adminUser = await db.adminUser.findUnique({
    where: { username: 'admin' },
  });

  if (!adminUser) {
    throw new AuthenticationError(
      'No passkey is configured yet. Sign in with password and register a passkey first.'
    );
  }

  let passkeys: Array<{ credentialID: string; transports: string | null }> = [];
  try {
    passkeys = await db.passkeyCredential.findMany({
      where: { adminUserId: adminUser.id },
      select: {
        credentialID: true,
        transports: true,
      },
    });
  } catch (error) {
    if (isMissingPasskeyStorage(error)) {
      throw new ServiceUnavailableError(
        'Passkey storage is not ready. Run database schema sync for passkeys.'
      );
    }
    throw error;
  }

  if (passkeys.length === 0) {
    throw new AuthenticationError(
      'No passkey is configured yet. Sign in with password and register a passkey first.'
    );
  }

  let rpID: string;
  try {
    rpID = getPasskeyRPID(request);
    getPasskeyExpectedOrigins(request);
  } catch {
    throw new AuthenticationError('Passkey login is currently unavailable. Use your password.');
  }

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: passkeys.map((passkey) => ({
      id: passkey.credentialID,
      transports: parseStoredTransports(passkey.transports),
    })),
    userVerification: 'required',
    timeout: 60_000,
  });

  const cookieStore = await cookies();
  cookieStore.set(
    PASSKEY_AUTH_CHALLENGE_COOKIE,
    options.challenge,
    getPasskeyChallengeCookieOptions()
  );

  return successResponse({ options });
}

export const POST = withMiddleware(handlePasskeyAuthOptions);
