import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { sanitizeAdminNextPath } from '@/lib/admin-api-client';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIp, validateTrustedOrigin } from '@/lib/request';
import { logger } from '@/lib/logger';

// Helper to get secret for Edge runtime
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
}

const JWT_ISSUER = 'douglasmitchell.info';
const JWT_AUDIENCE = 'admin-portal';

// Routes that don't require authentication under /admin.
// NOTE: '/api/admin/auth' also covers the passkey login flows under
// '/api/admin/auth/passkey/*'; the register flows there still enforce a
// session inside their handlers.
const publicAdminRoutes = [
  '/admin/login',
  '/api/admin/auth',
  '/api/admin/setup',
  '/api/admin/check',
];

/** Build the login redirect, preserving the admin deep link for post-login resume. */
function buildLoginRedirect(request: NextRequest, sessionExpired: boolean) {
  const loginUrl = new URL('/admin/login', request.url);
  if (sessionExpired) {
    loginUrl.searchParams.set('reason', 'session-expired');
  }
  const rawNext = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  const nextPath = sanitizeAdminNextPath(rawNext);
  if (nextPath !== '/admin') {
    loginUrl.searchParams.set('next', nextPath);
  }
  return loginUrl;
}

function isPublicAdminRoute(pathname: string): boolean {
  return publicAdminRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Combined Proxy/Middleware for Douglas Mitchell Platform
 * Implements:
 * 1. Global Rate Limiting (DoS Mitigation)
 * 2. Trusted Origin Validation (CSRF/CORS Protection)
 * 3. Admin Authentication & Route Protection
 */
export async function proxy(request: NextRequest) {
  // Security headers — defined at function scope so both success and error
  // responses include them consistently.
  const securityHeaders = {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  };

  try {
    const { pathname } = request.nextUrl;
    const clientIp = await getClientIp(request);

    // 1. Skip middleware for static assets and internal Next.js paths
    if (
      pathname.startsWith('/_next') ||
      pathname.includes('.')
    ) {
      return NextResponse.next();
    }

    // 2. Rate Limiting
    const { allowed, remaining, resetAt } = await rateLimit(clientIp, {
      limit: 600,
      windowMs: 60 * 1000,
      prefix: 'global',
    });

    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...securityHeaders, 'Retry-After': Math.ceil(Math.max(0, resetAt - Date.now()) / 1000).toString() } }
      );
    }

    // 3. Trusted Origin Validation
    const originCheck = validateTrustedOrigin(request);
    if (!originCheck.allowed) {
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({ error: originCheck.reason }),
          { status: 403, headers: securityHeaders }
        );
      }
    }

    // 4. Admin Authentication Protection
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
      // Check if it's a public route (exact match or nested under the allowlisted prefix)
      if (!isPublicAdminRoute(pathname)) {
        // Check for the admin session token
        const token = request.cookies.get('admin-session')?.value;

        if (!token) {
          // Redirect to login for pages, return 401 for APIs
          if (pathname.startsWith('/api/')) {
            return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: securityHeaders });
          }
          return NextResponse.redirect(buildLoginRedirect(request, false));
        }

        // Verify the JWT token
        try {
          await jwtVerify(token, getJwtSecret(), {
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE,
          });
        } catch (error) {
          logger.error('Middleware token verification failed:', error);
          // Invalid token
          if (pathname.startsWith('/api/')) {
            return new NextResponse(JSON.stringify({ error: 'Unauthorized - Invalid Token' }), { status: 401, headers: securityHeaders });
          }
          
          // Redirect to login and clear cookie
          const response = NextResponse.redirect(buildLoginRedirect(request, true));
          response.cookies.delete('admin-session');
          return response;
        }
      }
    }

    // 5. Continue with request and append rate limit headers
    const response = NextResponse.next();
    
    response.headers.set('X-RateLimit-Limit', '600');
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', resetAt.toString());

    return response;
  } catch (error) {
    logger.error('Middleware unexpected error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: securityHeaders }
    );
  }
}

export const config = {
  matcher: [
    // Apply middleware to all routes except static assets
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
