import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { verifyRegistration } from '@/lib/webauthn';
import {
  isInvalidJsonBodyError,
  readJsonBody,
  validateTrustedOrigin,
} from '@/lib/request';

export async function POST(req: Request) {
  try {
    const originCheck = validateTrustedOrigin(req);
    if (!originCheck.allowed) {
      return NextResponse.json({ error: originCheck.reason }, { status: 403 });
    }

    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await readJsonBody(req);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Registration response is required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const expectedChallenge = cookieStore.get('passkey_challenge')?.value;

    if (!expectedChallenge) {
      return NextResponse.json({ error: 'Challenge expired or missing' }, { status: 400 });
    }

    const verification = await verifyRegistration(body, expectedChallenge);
    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }

    const { credential, credentialDeviceType } = verification.registrationInfo;

    // Accept optional device name from query string (sent by client)
    const url = new URL(req.url);
    const deviceName = url.searchParams.get('name')?.trim() || null;

    await db.passkeyCredential.create({
      data: {
        credentialId: credential.id,
        publicKey: Buffer.from(credential.publicKey),
        counter: credential.counter,
        deviceType: credentialDeviceType,
        deviceName,
        userId: session.userId,
      },
    });

    cookieStore.delete('passkey_challenge');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (isInvalidJsonBodyError(error)) {
      return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
    }

    console.error('Registration Verify Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
