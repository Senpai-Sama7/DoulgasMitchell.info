type PasskeyFlow = 'auth' | 'register';

interface ChallengeEntry {
  challenge: string;
  expiresAt: number;
}

const challengeStore = new Map<string, ChallengeEntry>();
const DEFAULT_TTL_MS = 5 * 60 * 1000;

function createKey(flow: PasskeyFlow, email: string) {
  return `${flow}:${email.toLowerCase()}`;
}

export function setPasskeyChallenge(flow: PasskeyFlow, email: string, challenge: string) {
  challengeStore.set(createKey(flow, email), {
    challenge,
    expiresAt: Date.now() + DEFAULT_TTL_MS,
  });
}

export function consumePasskeyChallenge(flow: PasskeyFlow, email: string) {
  const key = createKey(flow, email);
  const entry = challengeStore.get(key);

  if (!entry) return null;
  challengeStore.delete(key);

  if (Date.now() > entry.expiresAt) {
    return null;
  }

  return entry.challenge;
}
