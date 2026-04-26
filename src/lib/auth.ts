import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { env } from './env';
import { clearRateLimit as clearScopedRateLimit, rateLimit } from './rate-limit';
import {
  createAdminSessionRecord,
  deleteAdminSessionByToken,
  findAdminSessionByToken,
} from './admin-compat';
import { hasTable } from './db-introspection';

function getJwtSecret() {
  const secret = env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      'JWT_SECRET must be set in environment variables. ' +
      'Generate one with: node -e "console.log(require("crypto").randomBytes(32).toString("hex"))"'
    );
  }

  return new TextEncoder().encode(secret);
}

const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days
const JWT_ISSUER = 'douglasmitchell.info';
const JWT_AUDIENCE = 'admin-portal';

export interface Session {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: 'admin' | 'editor';
  expiresAt: Date;
}

// Hash password with bcrypt
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Create JWT token
export async function createToken(payload: object): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret());
}

// Verify JWT token
export async function verifyToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    return payload as unknown as Session;
  } catch {
    return null;
  }
}

// Create session
export async function createSession(
  userId: string,
  email: string,
  name: string,
  options?: {
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<string> {
  const token = await createToken({
    userId,
    email,
    name,
    role: 'admin',
    expiresAt: new Date(Date.now() + SESSION_DURATION_SECONDS * 1000),
  });

  await createAdminSessionRecord({
    token,
    userId,
    expiresAt: new Date(Date.now() + SESSION_DURATION_SECONDS * 1000),
    ipAddress: options?.ipAddress,
    userAgent: options?.userAgent,
  });

  return token;
}

// Get current session from cookies
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-session')?.value;
  
  if (!token) return null;
  
  const session = await verifyToken(token);
  if (!session) return null;

  const persistedSession = await findAdminSessionByToken(token);

  if (!persistedSession) {
    if (!(await hasTable('Session'))) {
      // DB unreachable — force re-authentication rather than trusting JWT alone.
      // Without DB verification we cannot confirm the session hasn't been revoked
      // or that the role hasn't changed.
      await deleteSession(token);
      return null;
    }
    
    await deleteSession(token);
    return null;
  }

  if (!persistedSession.isActive) {
    await deleteSession(token);
    return null;
  }
  
  // Check if session is expired
  if (new Date() > new Date(session.expiresAt) || new Date() > persistedSession.expiresAt) {
    await deleteSession(token);
    return null;
  }
  
  return {
    id: persistedSession.id,
    userId: persistedSession.userId,
    email: persistedSession.email,
    name: persistedSession.name || session.name,
    role: persistedSession.role as Session['role'],
    expiresAt: persistedSession.expiresAt,
  };
}

// Delete session
export async function deleteSession(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('admin-session');
  
  try {
    await deleteAdminSessionByToken(token);
  } catch {
    // Session might not exist in DB
  }
}

// Set session cookie
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('admin-session', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: SESSION_DURATION_SECONDS,
    path: '/',
  });
}

// Rate limiting for login attempts
export async function checkRateLimit(identifier: string): Promise<boolean> {
  const result = await rateLimit(identifier, {
    limit: 5,
    windowMs: 15 * 60 * 1000,
    prefix: 'login',
  });

  return result.allowed;
}

// Clear rate limit
export function clearRateLimit(identifier: string): void {
  clearScopedRateLimit(identifier, 'login');
}

// Generate secure random token
export function generateSecureToken(byteLength: number = 32): string {
  return randomBytes(byteLength).toString('hex');
}
