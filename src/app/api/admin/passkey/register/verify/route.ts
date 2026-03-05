import {
  verifyRegistrationResponse,
  type RegistrationResponseJSON,
} from '@simplewebauthn/server';
import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  AuthenticationError,
  ValidationError,
  successResponse,
  withMiddleware,
} from '@/lib/middleware';
import {
  getPasskeyExpectedOrigins,
  getPasskeyRPID,
  PASSKEY_REGISTRATION_CHALLENGE_COOKIE,
  serializeTransports,
  toBase64URL,
} from '@/lib/passkeys';
import { getClientIp, validateSession } from '@/lib/security';

function isRegistrationResponseJSON(value: unknown): value is RegistrationResponseJSON {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const response = value as Record<string, unknown>;

  return (
    typeof response.id === 'string' &&
    typeof response.rawId === 'string' &&
    typeof response.type === 'string' &&
    typeof response.response === 'object' &&
    response.response !== null
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

  return adminUser;
}

async function handlePasskeyRegisterVerify(request: NextRequest): Promise<NextResponse> {
  const adminUser = await getAuthenticatedAdmin(request);
  const ipAddress = getClientIp(request);

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const registrationResponse = (body as { response?: unknown }).response;

  if (!isRegistrationResponseJSON(registrationResponse)) {
    throw new ValidationError('Invalid passkey registration payload');
  }

  const cookieStore = await cookies();
  const expectedChallenge = cookieStore.get(PASSKEY_REGISTRATION_CHALLENGE_COOKIE)?.value;

  if (!expectedChallenge) {
    throw new AuthenticationError('Passkey challenge is missing or expired. Please try again.');
  }

  const verification = await verifyRegistrationResponse({
    response: registrationResponse,
    expectedChallenge,
    expectedOrigin: getPasskeyExpectedOrigins(request),
    expectedRPID: getPasskeyRPID(request),
    requireUserVerification: true,
  });

  if (!verification.verified || !verification.registrationInfo) {
    throw new AuthenticationError('Passkey registration verification failed');
  }

  const credentialID = verification.registrationInfo.credential.id;
  const publicKey = toBase64URL(verification.registrationInfo.credential.publicKey);
  const transports = serializeTransports(registrationResponse.response.transports);

  const existingCredential = await db.passkeyCredential.findUnique({
    where: { credentialID },
  });

  if (existingCredential && existingCredential.adminUserId !== adminUser.id) {
    throw new AuthenticationError('Passkey is already registered to a different account');
  }

  await db.passkeyCredential.upsert({
    where: { credentialID },
    update: {
      adminUserId: adminUser.id,
      publicKey,
      counter: verification.registrationInfo.credential.counter,
      transports,
      deviceType: verification.registrationInfo.credentialDeviceType,
      backedUp: verification.registrationInfo.credentialBackedUp,
    },
    create: {
      adminUserId: adminUser.id,
      credentialID,
      publicKey,
      counter: verification.registrationInfo.credential.counter,
      transports,
      deviceType: verification.registrationInfo.credentialDeviceType,
      backedUp: verification.registrationInfo.credentialBackedUp,
    },
  });

  await db.activityLog.create({
    data: {
      action: 'create',
      resource: 'passkey',
      resourceId: adminUser.id,
      details: JSON.stringify({ credentialID }),
      ipAddress,
    },
  });

  cookieStore.delete(PASSKEY_REGISTRATION_CHALLENGE_COOKIE);

  return successResponse({ registered: true }, 'Passkey registered successfully');
}

export const POST = withMiddleware(handlePasskeyRegisterVerify);
