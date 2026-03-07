import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyRegistration } from '@/lib/webauthn';
import { consumePasskeyChallenge } from '@/lib/passkey-challenges';
import { getSession } from '@/lib/auth';
import { logActivity } from '@/lib/activity';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { response, deviceName } = body;

    const user = await db.adminUser.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const expectedChallenge = consumePasskeyChallenge('register', user.email);
    if (!expectedChallenge) {
      return NextResponse.json({ error: 'Invalid or expired challenge' }, { status: 400 });
    }

    const verification = await verifyRegistration(response, expectedChallenge);

    if (verification.verified && verification.registrationInfo) {
      const { credential } = verification.registrationInfo;
      const { id: credentialID, publicKey: credentialPublicKey, counter } = credential;

      // Save the new passkey to the database
      await db.passkeyCredential.create({
        data: {
          userId: user.id,
          credentialId: credentialID,
          publicKey: Buffer.from(credentialPublicKey),
          counter,
          deviceName: deviceName || 'New Device',
        },
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
    console.error('Passkey register verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
