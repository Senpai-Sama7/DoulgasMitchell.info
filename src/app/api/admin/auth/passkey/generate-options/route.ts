import type { AuthenticatorTransport } from '@simplewebauthn/server';
import { NextRequest } from 'next/server';
import { getAuthenticationOptions } from '@/lib/webauthn';
import { setPasskeyChallengeCookie } from '@/lib/passkey-challenge-cookie';
import { findAdminUserByEmail, getAdminPasskeysForUser } from '@/lib/admin-compat';
import { ApiHandler } from '@/lib/api-response';
import {
  getClientIp,
  isInvalidJsonBodyError,
  readJsonBody,
  validateTrustedOrigin,
} from '@/lib/request';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const originCheck = validateTrustedOrigin(request);
    if (!originCheck.allowed) {
      return ApiHandler.forbidden(originCheck.reason);
    }

    const body = await readJsonBody<{ email?: string }>(request);
    const { email } = body;

    if (!email) {
      return ApiHandler.error('Email is required', 400);
    }

    const limit = await rateLimit(`${await getClientIp(request)}:${String(email).toLowerCase()}`, {
      limit: 10,
      windowMs: 15 * 60 * 1000,
      prefix: 'passkey-auth-options',
    });

    if (!limit.allowed) {
      return ApiHandler.error('Too many passkey attempts. Please try again later.', 429);
    }

    const user = await findAdminUserByEmail(email);
    const passkeys = user ? await getAdminPasskeysForUser(user.id) : [];

    // Deliberately a 200 without options — the login page uses `available` to
    // suggest password sign-in without revealing whether the account exists.
    if (!user || passkeys.length === 0) {
      return ApiHandler.success({ available: false });
    }

    const options = await getAuthenticationOptions(passkeys.map((passkey) => ({
      id: passkey.credentialId,
      transports: passkey.transports as AuthenticatorTransport[],
    })));

    await setPasskeyChallengeCookie('auth', email, options.challenge);

    return ApiHandler.success({
      available: true,
      options,
    });
  } catch (error) {
    if (isInvalidJsonBodyError(error)) {
      return ApiHandler.error('Request body must be valid JSON.', 400);
    }

    return ApiHandler.internalServerError('Passkey options error', error);
  }
}
