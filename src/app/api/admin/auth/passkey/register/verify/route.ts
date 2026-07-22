import { NextRequest } from 'next/server';
import { verifyRegistration } from '@/lib/webauthn';
import { consumePasskeyChallengeCookie } from '@/lib/passkey-challenge-cookie';
import { getSession } from '@/lib/auth';
import { logActivity } from '@/lib/activity';
import { createPasskeyRecord, findAdminUserById } from '@/lib/admin-compat';
import { ApiHandler } from '@/lib/api-response';
import {
  isInvalidJsonBodyError,
  readJsonBody,
  validateTrustedOrigin,
} from '@/lib/request';

interface RegistrationResponseLike {
  id?: unknown;
  response?: {
    attestationObject?: unknown;
    clientDataJSON?: unknown;
    transports?: unknown;
  };
}

export async function POST(request: NextRequest) {
  try {
    const originCheck = validateTrustedOrigin(request);
    if (!originCheck.allowed) {
      return ApiHandler.forbidden(originCheck.reason);
    }

    const session = await getSession();
    if (!session) {
      return ApiHandler.unauthorized();
    }

    const body = await readJsonBody<{
      response?: unknown;
      deviceName?: string;
    }>(request);
    const { response, deviceName } = body;

    if (!response || typeof response !== 'object') {
      return ApiHandler.error('Registration response is required', 400);
    }

    // WebAuthn nests the attestation payload under `response.response`.
    const registrationResponse = response as RegistrationResponseLike;
    if (
      typeof registrationResponse.id !== 'string' ||
      typeof registrationResponse.response?.attestationObject !== 'string' ||
      typeof registrationResponse.response?.clientDataJSON !== 'string'
    ) {
      return ApiHandler.error('Invalid registration response structure', 400);
    }

    const user = await findAdminUserById(session.userId);

    if (!user) {
      return ApiHandler.notFound('User not found');
    }

    const expectedChallenge = await consumePasskeyChallengeCookie('register', user.email);
    if (!expectedChallenge) {
      return ApiHandler.error('Invalid or expired challenge. Start the registration again.', 400);
    }

    const verification = await verifyRegistration(response, expectedChallenge);

    if (verification.verified && verification.registrationInfo) {
      const { credential } = verification.registrationInfo;

      await createPasskeyRecord({
        userId: user.id,
        credentialId: credential.id,
        publicKey: credential.publicKey,
        counter: credential.counter,
        deviceName: deviceName?.trim() || 'New Device',
        transports: credential.transports ?? [],
      });

      await logActivity({
        action: 'create',
        resource: 'passkey',
        resourceId: credential.id,
        userId: user.id,
        request,
        details: {
          deviceName,
        },
      });

      return ApiHandler.success(undefined, 'Passkey registered.');
    }

    return ApiHandler.error('Registration verification failed', 400);
  } catch (error) {
    if (isInvalidJsonBodyError(error)) {
      return ApiHandler.error('Request body must be valid JSON.', 400);
    }

    return ApiHandler.internalServerError('Passkey register verify error', error);
  }
}
