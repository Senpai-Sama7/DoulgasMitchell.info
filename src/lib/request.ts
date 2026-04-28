import type { NextRequest } from 'next/server';
import { env } from '@/lib/env';

type RequestLike = Request | NextRequest;

export interface TrustedOriginResult {
  allowed: boolean;
  origin: string | null;
  reason: string;
}

export class InvalidJsonBodyError extends Error {
  constructor(message = 'Request body must be valid JSON.') {
    super(message);
    this.name = 'InvalidJsonBodyError';
  }
}

function normalizeOrigin(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function getAllowedOrigins(request: RequestLike) {
  const origins = new Set<string>();

  const configuredSiteOrigin = normalizeOrigin(env.NEXT_PUBLIC_SITE_URL);
  if (configuredSiteOrigin) {
    origins.add(configuredSiteOrigin);
  }

  const requestOrigin = normalizeOrigin(request.url);
  if (requestOrigin) {
    origins.add(requestOrigin);
  }

  for (const value of env.PASSKEY_EXPECTED_ORIGINS?.split(',') ?? []) {
    const origin = normalizeOrigin(value.trim());
    if (origin) {
      origins.add(origin);
    }
  }

  if (env.NODE_ENV !== 'production') {
    origins.add('http://127.0.0.1:3000');
    origins.add('http://localhost:3000');
  }

  return origins;
}

function getOriginCandidate(request: RequestLike) {
  const origin = normalizeOrigin(request.headers.get('origin'));
  if (origin) {
    return origin;
  }

  // NOTE: Referer fallback removed. Browsers send Origin for cross-site requests.
  // Relying solely on Origin header provides stronger CSRF protection.
  return null;
}

export function validateTrustedOrigin(request: RequestLike): TrustedOriginResult {
  const allowedOrigins = getAllowedOrigins(request);
  const candidate = getOriginCandidate(request);
  const secFetchSite = request.headers.get('sec-fetch-site');

  if (candidate && allowedOrigins.has(candidate)) {
    return {
      allowed: true,
      origin: candidate,
      reason: 'Trusted request origin.',
    };
  }

  if (
    !candidate &&
    (secFetchSite === 'same-origin' || secFetchSite === 'same-site' || secFetchSite === 'none')
  ) {
    const requestOrigin = normalizeOrigin(request.url);
    if (requestOrigin && allowedOrigins.has(requestOrigin)) {
      return {
        allowed: true,
        origin: requestOrigin,
        reason: 'Trusted same-site request.',
      };
    }
  }

  if (secFetchSite === 'cross-site') {
    return {
      allowed: false,
      origin: candidate,
      reason: 'Cross-site requests are not allowed for this endpoint.',
    };
  }

  return {
    allowed: false,
    origin: candidate,
    reason: 'Untrusted request origin.',
  };
}

// Web Crypto SHA-256 — works in both Edge and Node.js runtimes.
async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Pure-JS IP validation — replaces Node.js `net.isIP()` for Edge compatibility.
function isValidIP(ip: string): boolean {
  // IPv4: four octets 0-255
  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ip);
  if (ipv4) {
    return ipv4.slice(1).every((n) => {
      const v = parseInt(n, 10);
      return v >= 0 && v <= 255;
    });
  }
  // IPv6: supports full, compressed, and loopback formats
  // Matches: 2001:db8::1, ::1, 2001:0db8:85a3:0000:0000:8a2e:0370:7334, ::ffff:192.168.1.1
  const ipv6Full = /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i.test(ip);
  const ipv6Compressed = /^([0-9a-f]{1,4}:){1,7}:$|^:([0-9a-f]{1,4}:){1,7}$/i.test(ip);
  const ipv6Mixed = /^:?(:ffff:)?(\d{1,3}\.){3}\d{1,3}$/i.test(ip);
  const ipv6Loopback = /^::1$/i.test(ip);
  const ipv6Any = /^::$/i.test(ip);
  return ipv6Full || ipv6Compressed || ipv6Mixed || ipv6Loopback || ipv6Any;
}

async function buildAnonymousFingerprint(request: RequestLike): Promise<string> {
  const seed = [
    request.headers.get('user-agent') || 'unknown',
    request.headers.get('accept-language') || 'unknown',
    request.headers.get('host') || normalizeOrigin(request.url) || 'unknown',
  ].join('|');

  const hash = await sha256Hex(seed);
  return `anonymous:${hash.slice(0, 16)}`;
}

export async function getClientIp(request: RequestLike): Promise<string> {
  const candidates = [
    request.headers.get('x-vercel-forwarded-for'),
    request.headers.get('cf-connecting-ip'),
    request.headers.get('x-real-ip'),
    request.headers.get('x-forwarded-for'),
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    const normalized = candidate.split(',')[0]?.trim();
    if (normalized && isValidIP(normalized)) {
      return normalized;
    }
  }

  return buildAnonymousFingerprint(request);
}

export async function getAnonymousFingerprint(request: RequestLike) {
  return buildAnonymousFingerprint(request);
}

export function getUserAgent(request: RequestLike) {
  return request.headers.get('user-agent') || 'unknown';
}

export async function readJsonBody<T = unknown>(request: RequestLike) {
  try {
    return (await request.json()) as T;
  } catch {
    throw new InvalidJsonBodyError();
  }
}

export function isInvalidJsonBodyError(error: unknown): error is InvalidJsonBodyError {
  return error instanceof InvalidJsonBodyError;
}
