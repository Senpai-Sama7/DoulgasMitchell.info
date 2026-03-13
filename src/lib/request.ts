import { createHash } from 'node:crypto';
import { isIP } from 'node:net';
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

  return normalizeOrigin(request.headers.get('referer'));
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

function buildAnonymousFingerprint(request: RequestLike) {
  const seed = [
    request.headers.get('user-agent') || 'unknown',
    request.headers.get('accept-language') || 'unknown',
    request.headers.get('host') || normalizeOrigin(request.url) || 'unknown',
  ].join('|');

  return `anonymous:${createHash('sha256').update(seed).digest('hex').slice(0, 16)}`;
}

export function getClientIp(request: RequestLike) {
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
    if (normalized && isIP(normalized)) {
      return normalized;
    }
  }

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
