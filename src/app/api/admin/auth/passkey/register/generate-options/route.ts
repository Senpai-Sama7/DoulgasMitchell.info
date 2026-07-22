import type { AuthenticatorTransport } from '@simplewebauthn/server';
import { NextRequest } from 'next/server';
import { getRegistrationOptions } from '@/lib/webauthn';
import { setPasskeyChallengeCookie } from '@/lib/passkey-challenge-cookie';
import { getSession } from '@/lib/auth';
import { findAdminUserById, getAdminPasskeysForUser } from '@/lib/admin-compat';
import { ApiHandler } from '@/lib/api-response';
import { validateTrustedOrigin } from '@/lib/request';

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

    const user = await findAdminUserById(session.userId);

    if (!user) {
      return ApiHandler.notFound('User not found');
    }

    const existingPasskeys = await getAdminPasskeysForUser(user.id);

    const options = await getRegistrationOptions(
      {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      existingPasskeys.map((passkey) => ({
        id: passkey.credentialId,
        transports: passkey.transports as AuthenticatorTransport[],
      }))
    );

    await setPasskeyChallengeCookie('register', user.email, options.challenge);

    return ApiHandler.success({ options });
  } catch (error) {
    return ApiHandler.internalServerError('Passkey register options error', error);
  }
}
