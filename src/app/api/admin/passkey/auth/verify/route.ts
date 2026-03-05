import {
  verifyAuthenticationResponse,
  type AuthenticationResponseJSON,
} from '@simplewebauthn/server';
import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  AuthenticationError,
  RateLimitError,
  ValidationError,
  successResponse,
  withMiddleware,
} from '@/lib/middleware';
import {
  fromBase64URL,
  getPasskeyExpectedOrigins,
  getPasskeyRPID,
  parseStoredTransports,
  PASSKEY_AUTH_CHALLENGE_COOKIE,
} from '@/lib/passkeys';
import {
  checkRateLimit,
  createSession,
  generateToken,
  getClientIp,
  getUserAgent,
  recordLoginAttempt,
} from '@/lib/security';

function isAuthenticationResponseJSON(value: unknown): value is AuthenticationResponseJSON {
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

async function handlePasskeyAuthVerify(request: NextRequest): Promise<NextResponse> {
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);
  const rateLimitResult = checkRateLimit(ipAddress);

  if (!rateLimitResult.allowed) {
    throw new RateLimitError(
      Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000)
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw new ValidationError('Invalid JSON body');
  }

  const authenticationResponse = (body as { response?: unknown }).response;

  if (!isAuthenticationResponseJSON(authenticationResponse)) {
    throw new ValidationError('Invalid passkey authentication payload');
  }

  const cookieStore = await cookies();
  const expectedChallenge = cookieStore.get(PASSKEY_AUTH_CHALLENGE_COOKIE)?.value;

  if (!expectedChallenge) {
    throw new AuthenticationError('Passkey challenge is missing or expired. Please try again.');
  }

  const credential = await db.passkeyCredential.findUnique({
    where: { credentialID: authenticationResponse.id },
    include: { adminUser: true },
  });

  if (!credential) {
    await recordLoginAttempt(ipAddress, false);
    throw new AuthenticationError('Invalid passkey credential');
  }

  try {
    const verification = await verifyAuthenticationResponse({
      response: authenticationResponse,
      expectedChallenge,
      expectedOrigin: getPasskeyExpectedOrigins(request),
      expectedRPID: getPasskeyRPID(request),
      credential: {
        id: credential.credentialID,
        publicKey: fromBase64URL(credential.publicKey) as unknown as Uint8Array<ArrayBuffer>,
        counter: credential.counter,
        transports: parseStoredTransports(credential.transports),
      },
      requireUserVerification: true,
    });

    if (!verification.verified) {
      throw new AuthenticationError('Passkey verification failed');
    }

    await db.passkeyCredential.update({
      where: { id: credential.id },
      data: {
        counter: verification.authenticationInfo.newCounter,
        deviceType: verification.authenticationInfo.credentialDeviceType,
        backedUp: verification.authenticationInfo.credentialBackedUp,
      },
    });

    const token = generateToken({
      userId: credential.adminUser.id,
      username: credential.adminUser.username,
    });

    await createSession(credential.adminUser.id, token, ipAddress, userAgent);
    await recordLoginAttempt(ipAddress, true);

    await db.adminUser.update({
      where: { id: credential.adminUser.id },
      data: { lastLoginAt: new Date() },
    });

    await db.activityLog.create({
      data: {
        action: 'login',
        resource: 'auth',
        resourceId: credential.adminUser.id,
        details: JSON.stringify({ method: 'passkey' }),
        ipAddress,
      },
    });

    cookieStore.delete(PASSKEY_AUTH_CHALLENGE_COOKIE);
    cookieStore.set('admin-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return successResponse({ authenticated: true }, 'Passkey login successful');
  } catch (error) {
    await recordLoginAttempt(ipAddress, false);

    if (error instanceof AuthenticationError) {
      throw error;
    }

    throw new AuthenticationError('Passkey verification failed');
  }
}

export const POST = withMiddleware(handlePasskeyAuthVerify);
