import { NextRequest, NextResponse } from 'next/server';
import { verifyRegistration } from '@/lib/webauthn';
import { consumePasskeyChallengeCookie } from '@/lib/passkey-challenge-cookie';
import { getSession } from '@/lib/auth';
import { logActivity } from '@/lib/activity';
import { createPasskeyRecord, findAdminUserById } from '@/lib/admin-compat';
import { logger } from '@/lib/logger';
import {
  isInvalidJsonBodyError,
  readJsonBody,
  validateTrustedOrigin,
} from '@/lib/request';

export async function POST(request: NextRequest) {
  try {
    const originCheck = validateTrustedOrigin(request);
    if (!originCheck.allowed) {
      return NextResponse.json({ error: originCheck.reason }, { status: 403 });
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await readJsonBody<{
      response?: unknown;
      deviceName?: string;
    }>(request);
    const { response, deviceName } = body;

    if (!response || typeof response !== 'object') {
      return NextResponse.json({ error: 'Registration response is required' }, { status: 400 });
    }

    const registrationResponse = response as Record<string, unknown>;
    if (
      typeof registrationResponse.attestationObject !== 'string' ||
      typeof registrationResponse.clientDataJSON !== 'string'
    ) {
      return NextResponse.json({ error: 'Invalid registration response structure' }, { status: 400 });
    }

    const user = await findAdminUserById(session.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const expectedChallenge = await consumePasskeyChallengeCookie('register', user.email);
    if (!expectedChallenge) {
      return NextResponse.json({ error: 'Invalid or expired challenge' }, { status: 400 });
    }

    const verification = await verifyRegistration(response, expectedChallenge);

    if (verification.verified && verification.registrationInfo) {
      const { credential } = verification.registrationInfo;
      const { id: credentialID, publicKey: credentialPublicKey, counter } = credential;

      // Save the new passkey to the database
      await createPasskeyRecord({
        userId: user.id,
        credentialId: credentialID,
        publicKey: credentialPublicKey,
        counter,
        deviceName: deviceName || 'New Device',
      });

      await logActivity({
        action: 'create',
        resource: 'passkey',
        resourceId: credentialID,
        userId: user.id,
        request,
        details: {
          deviceName,
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Registration failed' }, { status: 400 });
  } catch (error) {
    if (isInvalidJsonBodyError(error)) {
      return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
    }

    logger.error('Passkey register verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
