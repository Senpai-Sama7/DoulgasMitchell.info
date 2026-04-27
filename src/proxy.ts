import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { logger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';
import { getClientIp, validateTrustedOrigin } from '@/lib/request';

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

// Routes that don't require authentication under /admin
const publicAdminRoutes = [
  '/admin/login',
  '/api/admin/auth',
  '/api/admin/webauthn',
  '/api/admin/setup',
  '/api/admin/check',
];

/**
 * Combined Proxy/Middleware for Douglas Mitchell Platform
 * Implements:
 * 1. Global Rate Limiting (DoS Mitigation)
 * 2. Trusted Origin Validation (CSRF/CORS Protection)
 * 3. Admin Authentication & Route Protection
 */
export async function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const clientIp = getClientIp(request);

    // 1. Skip middleware for static assets and internal Next.js paths
    if (
      pathname.startsWith('/_next') ||
      pathname.includes('.')
    ) {
      return NextResponse.next();
    }

    // Security headers applied to all proxy error responses
    const securityHeaders = {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    };

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
      // Check if it's a public route
      const isPublicRoute = publicAdminRoutes.some(route => pathname.startsWith(route));
      if (!isPublicRoute) {
        // Check for the admin session token
        const token = request.cookies.get('admin-session')?.value;

        if (!token) {
          // Redirect to login for pages, return 401 for APIs
          if (pathname.startsWith('/api/')) {
            return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: securityHeaders });
          }
          return NextResponse.redirect(new URL('/admin/login', request.url));
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
          const response = NextResponse.redirect(new URL('/admin/login', request.url));
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
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export const config = {
  matcher: [
    // Apply middleware to all routes except static assets
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
