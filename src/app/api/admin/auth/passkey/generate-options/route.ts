import type { AuthenticatorTransport } from '@simplewebauthn/server';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticationOptions } from '@/lib/webauthn';
import { setPasskeyChallengeCookie } from '@/lib/passkey-challenge-cookie';
import { findAdminUserByEmail, getAdminPasskeysForUser } from '@/lib/admin-compat';
import { logger } from '@/lib/logger';
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
      return NextResponse.json({ error: originCheck.reason }, { status: 403 });
    }

    const body = await readJsonBody<{ email?: string }>(request);
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const limit = await rateLimit(`${getClientIp(request)}:${String(email).toLowerCase()}`, {
      limit: 10,
      windowMs: 15 * 60 * 1000,
      prefix: 'passkey-auth-options',
    });

    if (!limit.allowed) {
      return NextResponse.json({ error: 'Too many passkey attempts. Please try again later.' }, { status: 429 });
    }

    const user = await findAdminUserByEmail(email);
    const passkeys = user ? await getAdminPasskeysForUser(user.id) : [];

    if (!user || passkeys.length === 0) {
      return NextResponse.json({
        available: false,
        error: 'No passkeys found for this user',
      });
    }

    const options = await getAuthenticationOptions(passkeys.map((passkey) => ({
      id: passkey.credentialId,
      transports: passkey.transports as AuthenticatorTransport[],
    })));

    await setPasskeyChallengeCookie('auth', email, options.challenge);

    return NextResponse.json({
      available: true,
      options,
    });
  } catch (error) {
    if (isInvalidJsonBodyError(error)) {
      return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
    }

    logger.error('Passkey options error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
