import bcrypt from 'bcrypt';
import { randomBytes, randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { isIP } from 'net';
import { NextRequest } from 'next/server';
import { db } from './db';

// Configuration
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '5', 10);
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);
export const SESSION_MAX_AGE_SECONDS = parseInt(process.env.SESSION_MAX_AGE || '86400', 10);
const TRUST_PROXY_HEADERS = process.env.TRUST_PROXY_HEADERS === 'true';
const IS_VERCEL_RUNTIME = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
const IS_CLOUDFLARE_RUNTIME =
  process.env.CF_PAGES === '1' ||
  process.env.CF_PAGES === 'true' ||
  Boolean(process.env.CF_PAGES_URL);

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }
  return secret;
}

// Types
export interface JwtPayload {
  userId: string;
  username: string;
  jti: string;
  iat: number;
  exp: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT utilities
function generateJwtId(): string {
  if (typeof randomUUID === 'function') {
    return randomUUID();
  }
  return randomBytes(16).toString('hex');
}

export function generateToken(payload: { userId: string; username: string }): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: SESSION_MAX_AGE_SECONDS,
    jwtid: generateJwtId(),
  });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JwtPayload;
  } catch {
    return null;
  }
}

export function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as JwtPayload | null;
    if (decoded?.exp) {
      return new Date(decoded.exp * 1000);
    }
    return null;
  } catch {
    return null;
  }
}

// Rate limiting (in-memory for simplicity, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // Clean up expired entries
  if (record && now > record.resetAt) {
    rateLimitStore.delete(identifier);
  }

  const currentRecord = rateLimitStore.get(identifier);
  const resetAt = now + RATE_LIMIT_WINDOW_MS;

  if (!currentRecord) {
    rateLimitStore.set(identifier, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX - 1,
      resetAt: new Date(resetAt),
    };
  }

  if (currentRecord.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(currentRecord.resetAt),
    };
  }

  currentRecord.count += 1;
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX - currentRecord.count,
    resetAt: new Date(currentRecord.resetAt),
  };
}

export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

// Clean up expired rate limit entries periodically
const rateLimitCleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

rateLimitCleanupTimer.unref?.();

// IP extraction
function parseIpCandidate(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim().replace(/^"(.*)"$/, '$1');
  if (!trimmed) {
    return null;
  }

  const bracketedMatch = trimmed.match(/^\[([^\]]+)\](?::\d+)?$/);
  if (bracketedMatch && isIP(bracketedMatch[1]) !== 0) {
    return bracketedMatch[1];
  }

  if (isIP(trimmed) !== 0) {
    return trimmed;
  }

  const ipv4WithPortMatch = trimmed.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/);
  if (ipv4WithPortMatch && isIP(ipv4WithPortMatch[1]) === 4) {
    return ipv4WithPortMatch[1];
  }

  return null;
}

function getForwardedForIp(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (!forwarded) {
    return null;
  }

  for (const candidate of forwarded.split(',')) {
    const parsedIp = parseIpCandidate(candidate);
    if (parsedIp) {
      return parsedIp;
    }
  }

  return null;
}

export function getClientIp(request: NextRequest): string {
  if (TRUST_PROXY_HEADERS) {
    const forwardedIp = getForwardedForIp(request);
    if (forwardedIp) {
      return forwardedIp;
    }

    const realIp = parseIpCandidate(request.headers.get('x-real-ip'));
    if (realIp) {
      return realIp;
    }
  }

  if (IS_VERCEL_RUNTIME) {
    const vercelIp = parseIpCandidate(request.headers.get('x-vercel-ip'));
    if (vercelIp) {
      return vercelIp;
    }
  }

  if (IS_CLOUDFLARE_RUNTIME) {
    const cloudflareIp = parseIpCandidate(request.headers.get('cf-connecting-ip'));
    if (cloudflareIp) {
      return cloudflareIp;
    }
  }

  return 'unknown';
}

// User agent extraction
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}

// Session management
export async function createSession(
  userId: string,
  token: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await db.session.create({
    data: {
      token,
      adminUserId: userId,
      expiresAt,
      ipAddress,
      userAgent,
    },
  });
}

export async function validateSession(token: string): Promise<{ valid: boolean; userId?: string }> {
  try {
    // First verify JWT
    const payload = verifyToken(token);
    if (!payload) {
      return { valid: false };
    }

    // Check if session exists in database
    const session = await db.session.findUnique({
      where: { token },
      include: { adminUser: true },
    });

    if (!session) {
      return { valid: false };
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      await db.session.delete({ where: { token } });
      return { valid: false };
    }

    return { valid: true, userId: session.adminUserId };
  } catch {
    return { valid: false };
  }
}

export async function invalidateSession(token: string): Promise<void> {
  try {
    await db.session.delete({ where: { token } });
  } catch {
    // Session may not exist, ignore error
  }
}

export async function cleanupExpiredSessions(): Promise<number> {
  const result = await db.session.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
  return result.count;
}

// Login attempt tracking
export async function recordLoginAttempt(
  ipAddress: string,
  success: boolean
): Promise<void> {
  await db.loginAttempt.create({
    data: {
      ipAddress,
      success,
    },
  });
}

export async function getRecentFailedAttempts(ipAddress: string): Promise<number> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);

  const count = await db.loginAttempt.count({
    where: {
      ipAddress,
      success: false,
      createdAt: { gte: windowStart },
    },
  });

  return count;
}

// CORS headers
export function getCorsHeaders(origin?: string): Record<string, string> {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.ALLOWED_ORIGIN,
  ].filter(Boolean);

  const defaultHeaders: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };

  if (origin && allowedOrigins.includes(origin)) {
    defaultHeaders['Access-Control-Allow-Origin'] = origin;
  } else {
    defaultHeaders['Access-Control-Allow-Origin'] = allowedOrigins[0] || 'http://localhost:3000';
  }

  return defaultHeaders;
}

// Request logging
export async function logRequest(
  method: string,
  path: string,
  statusCode: number,
  duration: number,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    await db.requestLog.create({
      data: {
        method,
        path,
        statusCode,
        duration,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2021') {
      return;
    }
    // Log failure shouldn't break the request
    console.error('Failed to log request');
  }
}

// Admin user initialization
export async function initializeAdminUser(): Promise<void> {
  const existingAdmin = await db.adminUser.findUnique({
    where: { username: 'admin' },
  });

  if (existingAdmin) {
    return;
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error('ADMIN_PASSWORD is required to initialize the admin user');
  }

  const passwordHash = await hashPassword(adminPassword);

  try {
    await db.adminUser.create({
      data: {
        username: 'admin',
        passwordHash,
        email: 'admin@douglasmitchell.info',
      },
    });
    console.log('Admin user created successfully');
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      return;
    }

    throw error;
  }
}
