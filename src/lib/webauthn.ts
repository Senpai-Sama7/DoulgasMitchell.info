import type { AuthenticatorTransport, RegistrationResponseJSON, AuthenticationResponseJSON } from '@simplewebauthn/server';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import { env } from './env';

// Relying Party (RP) settings
export const rpID = env.PASSKEY_RP_ID || (env.NODE_ENV === 'production' ? 'douglasmitchell.info' : 'localhost');
export const rpName = env.PASSKEY_RP_NAME || 'Douglas Mitchell Portfolio';
export const origin = env.PASSKEY_EXPECTED_ORIGINS?.split(',') || [
  env.NEXT_PUBLIC_SITE_URL,
  'https://douglasmitchell.info',
  'https://www.douglasmitchell.info',
  'http://localhost:3000'
];

/**
 * Generate registration options for a new passkey
 */
export async function getRegistrationOptions(user: { id: string; email: string; name?: string | null }) {
  return generateRegistrationOptions({
    rpName,
    rpID,
    userID: Buffer.from(user.id),
    userName: user.email,
    userDisplayName: user.name || user.email,
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: 'preferred',
    },
  });
}

/**
 * Verify the registration response from the client
 */
export async function verifyRegistration(
  body: unknown,
  expectedChallenge: string
) {
  return verifyRegistrationResponse({
    response: body as RegistrationResponseJSON,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });
}

/**
 * Generate authentication options for an existing passkey
 */
export async function getAuthenticationOptions(allowCredentials?: { id: string; transports?: AuthenticatorTransport[] }[]) {
  return generateAuthenticationOptions({
    rpID,
    allowCredentials: allowCredentials?.map(cred => ({
      id: cred.id,
      transports: cred.transports,
    })),
    userVerification: 'preferred',
  });
}

/**
 * Verify the authentication response from the client
 */
export async function verifyAuthentication(
  body: unknown,
  expectedChallenge: string,
  credential: {
    id: string;
    publicKey: Uint8Array;
    counter: number;
  }
) {
  return verifyAuthenticationResponse({
    response: body as AuthenticationResponseJSON,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: credential.id,
      publicKey: new Uint8Array(credential.publicKey),
      counter: credential.counter,
    },
  });
}
