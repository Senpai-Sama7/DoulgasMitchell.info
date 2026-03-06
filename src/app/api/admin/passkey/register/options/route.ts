import { generateRegistrationOptions } from '@simplewebauthn/server';
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
import {
  getPasskeyChallengeCookieOptions,
  getPasskeyRPID,
  getPasskeyRPName,
  parseStoredTransports,
  PASSKEY_REGISTRATION_CHALLENGE_COOKIE,
} from '@/lib/passkeys';
import { validateSession } from '@/lib/security';

function isMissingPasskeyStorage(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2021'
  );
}

async function getAuthenticatedAdmin(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-session')?.value;

  if (!token) {
    throw new AuthenticationError();
  }

  const sessionResult = await validateSession(token);

  if (!sessionResult.valid || !sessionResult.userId) {
    throw new AuthenticationError();
  }

  const adminUser = await db.adminUser.findUnique({
    where: { id: sessionResult.userId },
  });

  if (!adminUser) {
    throw new AuthenticationError();
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

  return { adminUser, passkeys };
}

async function handlePasskeyRegisterOptions(request: NextRequest): Promise<NextResponse> {
  const { adminUser, passkeys } = await getAuthenticatedAdmin(request);

  const userID = new TextEncoder().encode(adminUser.id);

  const options = await generateRegistrationOptions({
    rpName: getPasskeyRPName(),
    rpID: getPasskeyRPID(request),
    userID,
    userName: adminUser.username,
    userDisplayName: adminUser.username,
    timeout: 60_000,
    attestationType: 'none',
    excludeCredentials: passkeys.map((passkey) => ({
      id: passkey.credentialID,
      transports: parseStoredTransports(passkey.transports),
    })),
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      residentKey: 'preferred',
      userVerification: 'required',
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(
    PASSKEY_REGISTRATION_CHALLENGE_COOKIE,
    options.challenge,
    getPasskeyChallengeCookieOptions()
  );

  return successResponse({
    options,
    hasPasskey: passkeys.length > 0,
    passkeyCount: passkeys.length,
  });
}

export const POST = withMiddleware(handlePasskeyRegisterOptions);
