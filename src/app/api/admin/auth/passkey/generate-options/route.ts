import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticationOptions } from '@/lib/webauthn';
import { setPasskeyChallenge } from '@/lib/passkey-challenges';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await db.adminUser.findUnique({
      where: { email },
      include: { passkeys: true },
    });

    if (!user || user.passkeys.length === 0) {
      return NextResponse.json({ error: 'No passkeys found for this user' }, { status: 404 });
    }

    const options = await getAuthenticationOptions(user.passkeys.map(p => ({
      id: p.credentialId,
    })));

    // Store challenge in memory/store for verification
    setPasskeyChallenge('auth', email, options.challenge);

    return NextResponse.json(options);
  } catch (error) {
    console.error('Passkey options error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
