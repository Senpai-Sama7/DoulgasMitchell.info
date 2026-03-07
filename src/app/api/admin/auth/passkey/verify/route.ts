import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAuthentication } from '@/lib/webauthn';
import { consumePasskeyChallenge } from '@/lib/passkey-challenges';
import { createSession, setSessionCookie, clearRateLimit } from '@/lib/auth';
import { getClientIp, getUserAgent } from '@/lib/request';
import { logActivity } from '@/lib/activity';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, response } = body;

    if (!email || !response) {
      return NextResponse.json({ error: 'Email and response are required' }, { status: 400 });
    }

    const expectedChallenge = consumePasskeyChallenge('auth', email);
    if (!expectedChallenge) {
      return NextResponse.json({ error: 'Invalid or expired challenge' }, { status: 400 });
    }

    const user = await db.adminUser.findUnique({
      where: { email },
      include: { passkeys: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const passkey = user.passkeys.find(p => p.credentialId === response.id);
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
      await db.passkeyCredential.update({
        where: { id: passkey.id },
        data: { 
          counter: newCounter,
          lastUsedAt: new Date(),
        },
      });

      // Update user last login
      await db.adminUser.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Create session
      const clientIp = getClientIp(request);
      const token = await createSession(user.id, user.email, user.name || 'Admin', {
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
    console.error('Passkey verify error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
