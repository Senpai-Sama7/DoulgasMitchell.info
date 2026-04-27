import { cookies } from 'next/headers';
import { env } from '@/lib/env';

type PasskeyFlow = 'auth' | 'register';

interface PasskeyChallengePayload {
  challenge: string;
  email: string;
  expiresAt: number;
}

const PASSKEY_CHALLENGE_COOKIE_NAMES: Record<PasskeyFlow, string> = {
  auth: 'admin-passkey-auth-challenge',
  register: 'admin-passkey-register-challenge',
};

const PASSKEY_CHALLENGE_TTL_SECONDS = 5 * 60;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function serializeChallenge(payload: PasskeyChallengePayload) {
  return encodeURIComponent(JSON.stringify(payload));
}

function parseChallenge(raw: string | undefined) {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(raw)) as PasskeyChallengePayload;
  } catch {
    return null;
  }
}

export async function setPasskeyChallengeCookie(
  flow: PasskeyFlow,
  email: string,
  challenge: string
) {
  const cookieStore = await cookies();
  cookieStore.set(PASSKEY_CHALLENGE_COOKIE_NAMES[flow], serializeChallenge({
    challenge,
    email: normalizeEmail(email),
    expiresAt: Date.now() + PASSKEY_CHALLENGE_TTL_SECONDS * 1000,
  }), {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: PASSKEY_CHALLENGE_TTL_SECONDS,
    path: '/',
  });
}

export async function consumePasskeyChallengeCookie(flow: PasskeyFlow, email: string) {
  const cookieStore = await cookies();
  const cookieName = PASSKEY_CHALLENGE_COOKIE_NAMES[flow];
  const payload = parseChallenge(cookieStore.get(cookieName)?.value);
  cookieStore.delete(cookieName);

  if (!payload) {
    return null;
  }

  if (payload.email !== normalizeEmail(email)) {
    return null;
  }

  if (Date.now() > payload.expiresAt) {
    return null;
  }

  return payload.challenge;
}
