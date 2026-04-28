import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthentication } from '@/lib/webauthn';
import { consumePasskeyChallengeCookie } from '@/lib/passkey-challenge-cookie';
import { createSession, setSessionCookie, clearRateLimit } from '@/lib/auth';
import {
  getClientIp,
  getUserAgent,
  isInvalidJsonBodyError,
  readJsonBody,
  validateTrustedOrigin,
} from '@/lib/request';
import { logActivity } from '@/lib/activity';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';
import {
  findAdminUserByEmail,
  getAdminPasskeysForUser,
  updateAdminLastLogin,
  updatePasskeyCounter,
} from '@/lib/admin-compat';

export async function POST(request: NextRequest) {
  try {
    const originCheck = validateTrustedOrigin(request);
    if (!originCheck.allowed) {
      return NextResponse.json({ error: originCheck.reason }, { status: 403 });
    }

    const body = await readJsonBody<{
      email?: string;
      response?: { id?: string };
    }>(request);
    const { email, response } = body;

    if (!email || !response) {
      return NextResponse.json({ error: 'Email and response are required' }, { status: 400 });
    }

    const clientIp = await getClientIp(request);
    const limit = await rateLimit(`${clientIp}:${String(email).toLowerCase()}`, {
      limit: 10,
      windowMs: 15 * 60 * 1000,
      prefix: 'passkey-auth-verify',
    });

    if (!limit.allowed) {
      return NextResponse.json({ error: 'Too many passkey attempts. Please try again later.' }, { status: 429 });
    }

    const expectedChallenge = await consumePasskeyChallengeCookie('auth', email);
    if (!expectedChallenge) {
      return NextResponse.json({ error: 'Invalid or expired challenge' }, { status: 400 });
    }

    const user = await findAdminUserByEmail(email);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const passkeys = await getAdminPasskeysForUser(user.id);
    const passkey = passkeys.find((item) => item.credentialId === response.id);
    if (!passkey) {
      return NextResponse.json({ error: 'Passkey not recognized' }, { status: 401 });
    }

    const verification = await verifyAuthentication(response, expectedChallenge, {
      id: passkey.credentialId,
      publicKey: passkey.publicKey,
      counter: passkey.counter,
    });

    if (verification.verified && verification.authenticationInfo) {
      const { newCounter } = verification.authenticationInfo;

      // Update passkey counter
      await updatePasskeyCounter({ id: passkey.id, counter: newCounter });

      // Update user last login
      await updateAdminLastLogin(user.id);

      // Create session
      const token = await createSession(user.id, user.email, user.name || 'Admin', user.role || 'admin', {
        ipAddress: clientIp,
        userAgent: getUserAgent(request),
      });
      await setSessionCookie(token);
      clearRateLimit(clientIp);

      await logActivity({
        action: 'login',
        resource: 'admin-session',
        resourceId: user.id,
        userId: user.id,
        request,
        details: {
          method: 'passkey',
        },
      });

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    }

    return NextResponse.json({ error: 'Verification failed' }, { status: 401 });
  } catch (error) {
    if (isInvalidJsonBodyError(error)) {
      return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
    }

    logger.error('Passkey verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
