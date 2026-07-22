import { NextRequest } from 'next/server';
import { verifyAuthentication } from '@/lib/webauthn';
import { consumePasskeyChallengeCookie } from '@/lib/passkey-challenge-cookie';
import { createSession, setSessionCookie, clearRateLimit } from '@/lib/auth';
import { ApiHandler } from '@/lib/api-response';
import {
  getClientIp,
  getUserAgent,
  isInvalidJsonBodyError,
  readJsonBody,
  validateTrustedOrigin,
} from '@/lib/request';
import { logActivity } from '@/lib/activity';
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
      return ApiHandler.forbidden(originCheck.reason);
    }

    const body = await readJsonBody<{
      email?: string;
      response?: { id?: string };
    }>(request);
    const { email, response } = body;

    if (!email || !response) {
      return ApiHandler.error('Email and response are required', 400);
    }

    const clientIp = await getClientIp(request);
    const limit = await rateLimit(`${clientIp}:${String(email).toLowerCase()}`, {
      limit: 10,
      windowMs: 15 * 60 * 1000,
      prefix: 'passkey-auth-verify',
    });

    if (!limit.allowed) {
      return ApiHandler.error('Too many passkey attempts. Please try again later.', 429);
    }

    const expectedChallenge = await consumePasskeyChallengeCookie('auth', email);
    if (!expectedChallenge) {
      return ApiHandler.error('Invalid or expired challenge', 400);
    }

    const user = await findAdminUserByEmail(email);

    if (!user) {
      // Same status/message as an unrecognized passkey to avoid user enumeration.
      return ApiHandler.unauthorized('Passkey not recognized');
    }

    const passkeys = await getAdminPasskeysForUser(user.id);
    const passkey = passkeys.find((item) => item.credentialId === response.id);
    if (!passkey) {
      return ApiHandler.unauthorized('Passkey not recognized');
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

      return ApiHandler.success({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    }

    return ApiHandler.unauthorized('Verification failed');
  } catch (error) {
    if (isInvalidJsonBodyError(error)) {
      return ApiHandler.error('Request body must be valid JSON.', 400);
    }

    return ApiHandler.internalServerError('Passkey verify error', error);
  }
}
