import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import {
  checkRateLimit,
  getClientIp,
  getUserAgent,
  verifyPassword,
  generateToken,
  createSession,
  validateSession,
  invalidateSession,
  recordLoginAttempt,
  initializeAdminUser,
  SESSION_MAX_AGE_SECONDS,
} from '@/lib/security';
import {
  withMiddleware,
  successResponse,
  RateLimitError,
  AuthenticationError,
  ServiceUnavailableError,
  ValidationError,
} from '@/lib/middleware';
import { loginSchema } from '@/lib/validations';

// Initialize admin user on first load
let initialized = false;

async function ensureAdminInitialized() {
  if (!initialized) {
    await initializeAdminUser();
    initialized = true;
  }
}

// POST - Login
async function handleLogin(request: NextRequest): Promise<NextResponse> {
  const ipAddress = getClientIp(request);
  const userAgent = getUserAgent(request);
  try {
    await ensureAdminInitialized();

    // Check rate limit
    const rateLimitResult = checkRateLimit(ipAddress);
    if (!rateLimitResult.allowed) {
      throw new RateLimitError(
        Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000)
      );
    }

    // Parse and validate input
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ValidationError('Invalid JSON body');
    }

    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      throw new ValidationError('Invalid input', {
        errors: validation.error.issues.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    const { password } = validation.data;

    // Find admin user
    const adminUser = await db.adminUser.findUnique({
      where: { username: 'admin' },
    });

    if (!adminUser) {
      await recordLoginAttempt(ipAddress, false);
      throw new AuthenticationError('Invalid credentials');
    }

    // Verify password
    const isValid = await verifyPassword(password, adminUser.passwordHash);
    if (!isValid) {
      await recordLoginAttempt(ipAddress, false);
      throw new AuthenticationError('Invalid credentials');
    }

    // Generate JWT token
    const token = generateToken({
      userId: adminUser.id,
      username: adminUser.username,
    });

    // Create session in database
    await createSession(adminUser.id, token, ipAddress, userAgent);

    // Record successful login
    await recordLoginAttempt(ipAddress, true);

    // Update last login time
    await db.adminUser.update({
      where: { id: adminUser.id },
      data: { lastLoginAt: new Date() },
    });

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'login',
        resource: 'auth',
        resourceId: adminUser.id,
        ipAddress,
      },
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('admin-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_MAX_AGE_SECONDS,
      path: '/',
    });

    return successResponse({ authenticated: true }, 'Login successful');
  } catch (error) {
    if (
      error instanceof RateLimitError ||
      error instanceof ValidationError ||
      error instanceof AuthenticationError
    ) {
      throw error;
    }

    throw new ServiceUnavailableError('Authentication service is currently unavailable. Please try again.');
  }
}

// GET - Check authentication status
async function handleCheckAuth(request: NextRequest): Promise<NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-session')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false });
  }

  const sessionResult = await validateSession(token);

  if (!sessionResult.valid) {
    // Clear invalid cookie
    cookieStore.delete('admin-session');
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({ authenticated: true });
}

// DELETE - Logout
async function handleLogout(request: NextRequest): Promise<NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-session')?.value;
  const ipAddress = getClientIp(request);

  if (token) {
    // Get userId before invalidating
    const sessionResult = await validateSession(token);
    
    // Invalidate session in database
    await invalidateSession(token);

    // Log activity
    if (sessionResult.valid) {
      await db.activityLog.create({
        data: {
          action: 'logout',
          resource: 'auth',
          resourceId: sessionResult.userId,
          ipAddress,
        },
      });
    }
  }

  // Clear cookie
  cookieStore.delete('admin-session');

  return successResponse(undefined, 'Logged out successfully');
}

// Route handlers with middleware
export const POST = withMiddleware(handleLogin);
export const GET = withMiddleware(handleCheckAuth);
export const DELETE = withMiddleware(handleLogout);
