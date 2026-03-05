import { generateRegistrationOptions } from '@simplewebauthn/server';
import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  AuthenticationError,
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
    include: { passkeys: true },
  });

  if (!adminUser) {
    throw new AuthenticationError();
  }

  return adminUser;
}

async function handlePasskeyRegisterOptions(request: NextRequest): Promise<NextResponse> {
  const adminUser = await getAuthenticatedAdmin(request);

  const options = await generateRegistrationOptions({
    rpName: getPasskeyRPName(),
    rpID: getPasskeyRPID(request),
    userID: Buffer.from(adminUser.id, 'utf-8'),
    userName: adminUser.username,
    userDisplayName: adminUser.username,
    timeout: 60_000,
    attestationType: 'none',
    excludeCredentials: adminUser.passkeys.map((passkey) => ({
      id: passkey.credentialID,
      transports: parseStoredTransports(passkey.transports),
    })),
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      residentKey: 'preferred',
      userVerification: 'required',
    },
    preferredAuthenticatorType: 'localDevice',
  });

  const cookieStore = await cookies();
  cookieStore.set(
    PASSKEY_REGISTRATION_CHALLENGE_COOKIE,
    options.challenge,
    getPasskeyChallengeCookieOptions()
  );

  return successResponse({
    options,
    hasPasskey: adminUser.passkeys.length > 0,
    passkeyCount: adminUser.passkeys.length,
  });
}

export const POST = withMiddleware(handlePasskeyRegisterOptions);
