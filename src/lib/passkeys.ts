import type { AuthenticatorTransportFuture } from '@simplewebauthn/server';
import { isoBase64URL } from '@simplewebauthn/server/helpers';
import type { NextRequest } from 'next/server';

export const PASSKEY_AUTH_CHALLENGE_COOKIE = 'admin-passkey-auth-challenge';
export const PASSKEY_REGISTRATION_CHALLENGE_COOKIE = 'admin-passkey-register-challenge';

const validTransports: Set<AuthenticatorTransportFuture> = new Set([
  'ble',
  'cable',
  'hybrid',
  'internal',
  'nfc',
  'smart-card',
  'usb',
]);

function normalizeTransport(value: unknown): AuthenticatorTransportFuture | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim() as AuthenticatorTransportFuture;
  return validTransports.has(normalized) ? normalized : null;
}

function getRequestHost(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host');
  if (forwardedHost) {
    return forwardedHost.split(',')[0].trim();
  }

  return request.headers.get('host') ?? request.nextUrl.host;
}

function getConfiguredCanonicalHost(): string {
  const canonical = process.env.CANONICAL_HOST?.trim();
  return canonical || 'douglasmitchell.info';
}

function getRequestProtocol(request: NextRequest): 'http' | 'https' {
  const forwardedProto = request.headers.get('x-forwarded-proto');
  if (forwardedProto) {
    const firstProto = forwardedProto.split(',')[0].trim();
    if (firstProto === 'http' || firstProto === 'https') {
      return firstProto;
    }
  }

  const urlProtocol = request.nextUrl.protocol.replace(':', '');
  if (urlProtocol === 'http' || urlProtocol === 'https') {
    return urlProtocol;
  }

  return process.env.NODE_ENV === 'production' ? 'https' : 'http';
}

function getConfiguredExpectedOrigins(): string[] {
  return (
    process.env.PASSKEY_EXPECTED_ORIGINS
      ?.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean) ?? []
  );
}

function assertPasskeyConfig(): void {
  if (process.env.NODE_ENV !== 'production') return;

  const configuredRPID = process.env.PASSKEY_RP_ID?.trim();
  const configuredOrigins = getConfiguredExpectedOrigins();

  if (!configuredRPID || configuredOrigins.length === 0) {
    console.warn(
      "[passkeys] PASSKEY_RP_ID / PASSKEY_EXPECTED_ORIGINS not set. Falling back to request host/origin. Configure these env vars for strict WebAuthn validation."
    );
  }
}

export function getPasskeyRPID(request: NextRequest): string {
  assertPasskeyConfig();

  const configuredRPID = process.env.PASSKEY_RP_ID?.trim();
  if (configuredRPID) {
    return configuredRPID;
  }

  const canonicalHost = getConfiguredCanonicalHost();
  if (process.env.NODE_ENV === 'production') {
    return canonicalHost.replace(/^www\./, '');
  }

  const hostname = getRequestHost(request).split(':')[0].trim();
  if (hostname === '127.0.0.1') {
    return 'localhost';
  }

  return hostname.replace(/^www\./, '');
}

export function getPasskeyExpectedOrigins(request: NextRequest): string[] {
  assertPasskeyConfig();
  const configuredOrigins = getConfiguredExpectedOrigins();

  if (configuredOrigins.length > 0) {
    return configuredOrigins;
  }

  const host = getRequestHost(request).split(':')[0].trim();
  const protocol = getRequestProtocol(request);
  const canonicalHost = getConfiguredCanonicalHost();

  const baseHost = canonicalHost.replace(/^www\./, '');
  const hostNoWww = host.replace(/^www\./, '');
  const origin = `${protocol}://${hostNoWww}`;

  const origins = new Set<string>([
    origin,
    `${protocol}://www.${hostNoWww}`,
    `${protocol}://${baseHost}`,
    `${protocol}://www.${baseHost}`,
  ]);

  if (host.includes('127.0.0.1')) {
    origins.add(origin.replace('127.0.0.1', 'localhost'));
  }

  if (host.includes('localhost')) {
    origins.add(origin.replace('localhost', '127.0.0.1'));
  }

  return [...origins];
}

export function getPasskeyRPName(): string {
  return process.env.PASSKEY_RP_NAME?.trim() || 'DouglasMitchell Admin';
}

export function getPasskeyChallengeCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 60 * 5,
  };
}

export function serializeTransports(
  transports?: readonly string[] | readonly AuthenticatorTransportFuture[]
): string | null {
  if (!transports || transports.length === 0) {
    return null;
  }

  const normalizedTransports = transports
    .map((transport) => normalizeTransport(transport))
    .filter((transport): transport is AuthenticatorTransportFuture => transport !== null);

  if (normalizedTransports.length === 0) {
    return null;
  }

  return JSON.stringify(normalizedTransports);
}

export function parseStoredTransports(
  transports: string | null | undefined
): AuthenticatorTransportFuture[] | undefined {
  if (!transports) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(transports) as unknown;

    if (!Array.isArray(parsed)) {
      return undefined;
    }

    const normalized = parsed
      .map((transport) => normalizeTransport(transport))
      .filter((transport): transport is AuthenticatorTransportFuture => transport !== null);

    return normalized.length > 0 ? normalized : undefined;
  } catch {
    return undefined;
  }
}

export function toBase64URL(data: Uint8Array<ArrayBufferLike>): string {
  return isoBase64URL.fromBuffer(data as unknown as Uint8Array<ArrayBuffer>);
}

export function fromBase64URL(data: string): Uint8Array<ArrayBufferLike> {
  return isoBase64URL.toBuffer(data);
}
