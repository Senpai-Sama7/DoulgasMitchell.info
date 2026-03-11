import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Helper to get secret for Edge runtime
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
}

// Routes that don't require authentication under /admin
const publicAdminRoutes = [
  '/admin/login',
  '/api/admin/auth',
  '/api/admin/webauthn',
  '/api/admin/setup'
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin and /api/admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    
    // Check if it's a public route
    const isPublicRoute = publicAdminRoutes.some(route => pathname.startsWith(route));
    if (isPublicRoute) {
      return NextResponse.next();
    }

    // Check for the admin session token
    const token = request.cookies.get('admin-session')?.value;

    if (!token) {
      // Redirect to login for pages, return 401 for APIs
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Verify the JWT token
    try {
      await jwtVerify(token, getJwtSecret());
      return NextResponse.next();
    } catch (error) {
      console.error('Middleware token verification failed:', error);
      // Invalid token
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized - Invalid Token' }, { status: 401 });
      }
      
      // Redirect to login and clear cookie
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('admin-session');
      return response;
    }
  }

  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Apply middleware to all admin and api/admin routes
    '/admin/:path*',
    '/api/admin/:path*'
  ],
};