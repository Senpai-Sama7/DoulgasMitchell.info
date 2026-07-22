import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// In-memory stand-in for the Next.js request cookie store.
const cookieJar = new Map<string, string>();

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) =>
      cookieJar.has(name) ? { name, value: cookieJar.get(name) as string } : undefined,
    set: (name: string, value: string) => {
      cookieJar.set(name, value);
    },
    delete: (name: string) => {
      cookieJar.delete(name);
    },
  }),
}));

import {
  setPasskeyChallengeCookie,
  consumePasskeyChallengeCookie,
} from '@/lib/passkey-challenge-cookie';

describe('passkey challenge cookie', () => {
  beforeEach(() => {
    cookieJar.clear();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('round-trips a challenge for the same flow and email', async () => {
    await setPasskeyChallengeCookie('auth', 'Admin@Example.com', 'challenge-123');
    const challenge = await consumePasskeyChallengeCookie('auth', 'admin@example.com');
    expect(challenge).toBe('challenge-123');
  });

  it('consuming deletes the cookie so a challenge cannot be replayed', async () => {
    await setPasskeyChallengeCookie('auth', 'admin@example.com', 'challenge-123');
    expect(await consumePasskeyChallengeCookie('auth', 'admin@example.com')).toBe('challenge-123');
    expect(await consumePasskeyChallengeCookie('auth', 'admin@example.com')).toBeNull();
  });

  it('rejects a challenge bound to a different email', async () => {
    await setPasskeyChallengeCookie('auth', 'admin@example.com', 'challenge-123');
    expect(await consumePasskeyChallengeCookie('auth', 'other@example.com')).toBeNull();
  });

  it('keeps auth and register flows isolated', async () => {
    await setPasskeyChallengeCookie('register', 'admin@example.com', 'register-challenge');
    expect(await consumePasskeyChallengeCookie('auth', 'admin@example.com')).toBeNull();
  });

  it('rejects expired challenges', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    await setPasskeyChallengeCookie('auth', 'admin@example.com', 'challenge-123');

    vi.setSystemTime(new Date('2026-01-01T00:06:00Z')); // TTL is 5 minutes
    expect(await consumePasskeyChallengeCookie('auth', 'admin@example.com')).toBeNull();
  });

  it('rejects tampered cookie payloads', async () => {
    cookieJar.set('admin-passkey-auth-challenge', 'not-json-at-all');
    expect(await consumePasskeyChallengeCookie('auth', 'admin@example.com')).toBeNull();
  });
});
