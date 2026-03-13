import { NextRequest, NextResponse } from 'next/server';
import { getRegistrationOptions } from '@/lib/webauthn';
import { setPasskeyChallengeCookie } from '@/lib/passkey-challenge-cookie';
import { getSession } from '@/lib/auth';
import { findAdminUserById } from '@/lib/admin-compat';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await findAdminUserById(session.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const options = await getRegistrationOptions({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    await setPasskeyChallengeCookie('register', user.email, options.challenge);

    return NextResponse.json(options);
  } catch (error) {
    console.error('Passkey register options error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
