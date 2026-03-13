import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticationOptions } from '@/lib/webauthn';
import { setPasskeyChallengeCookie } from '@/lib/passkey-challenge-cookie';
import { findAdminUserByEmail, getAdminPasskeysForUser } from '@/lib/admin-compat';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
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
      transports: passkey.transports,
    })));

    await setPasskeyChallengeCookie('auth', email, options.challenge);

    return NextResponse.json({
      available: true,
      options,
    });
  } catch (error) {
    console.error('Passkey options error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
