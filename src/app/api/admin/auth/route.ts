import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { checkRateLimit, clearRateLimit, createSession, getSession, setSessionCookie, verifyPassword } from '@/lib/auth';
import { logActivity } from '@/lib/activity';
import {
  getClientIp,
  getUserAgent,
  isInvalidJsonBodyError,
  readJsonBody,
  validateTrustedOrigin,
} from '@/lib/request';
import { ApiHandler } from '@/lib/api-response';
import { findAdminUserByEmail, updateAdminLastLogin } from '@/lib/admin-compat';

// GET /api/admin/auth - Check current session
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return ApiHandler.error('Unauthorized', 401);
    }

    return ApiHandler.success({
      authenticated: true,
      user: {
        userId: session.userId,
        email: session.email,
        name: session.name,
        role: session.role,
      },
    });
  } catch (error) {
    return ApiHandler.internalServerError('Auth check error', error);
  }
}

// POST /api/admin/auth - Login
export async function POST(request: NextRequest) {
  try {
    const originCheck = validateTrustedOrigin(request);
    if (!originCheck.allowed) {
      return ApiHandler.forbidden(originCheck.reason);
    }

    const body = await readJsonBody<{ email?: string; password?: string }>(request);
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return ApiHandler.error('Email and password are required', 400);
    }

    // Rate limiting
    const clientIp = getClientIp(request);
    if (!(await checkRateLimit(clientIp))) {
      return ApiHandler.error('Too many login attempts. Please try again later.', 429);
    }

    // Find user
    const user = await findAdminUserByEmail(email);

    if (!user) {
      // Hash a dummy password to prevent timing-based user enumeration
      await bcrypt.hash('invalid-password-dummy', 12);
      return ApiHandler.unauthorized('Invalid credentials');
    }

    // Verify password
    if (!user.passwordHash) {
      return ApiHandler.forbidden('Password login is not configured for this account.');
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return ApiHandler.unauthorized('Invalid credentials');
    }

    // Update last login
    await updateAdminLastLogin(user.id);

    // Create session
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
        method: 'password',
      },
    });

    return ApiHandler.success({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    if (isInvalidJsonBodyError(error)) {
      return ApiHandler.error('Request body must be valid JSON.', 400);
    }

    return ApiHandler.internalServerError('Login error', error);
  }
}
