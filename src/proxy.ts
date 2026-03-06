import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CANONICAL_HOST = (
  process.env.CANONICAL_HOST || "www.douglasmitchell.info"
).toLowerCase();

function buildCspHeader(): string {
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' https://fonts.gstatic.com data:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "connect-src 'self' https:",
    "object-src 'none'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; ');
}

function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('Content-Security-Policy', buildCspHeader());
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return response;
}

function shouldRedirectToCanonicalHost(host: string): boolean {
  const normalizedHost = host.toLowerCase();
  const canonicalVariant = CANONICAL_HOST.startsWith("www.")
    ? CANONICAL_HOST.replace(/^www\./, "")
    : `www.${CANONICAL_HOST}`;

  if (normalizedHost === CANONICAL_HOST) {
    return false;
  }

  if (normalizedHost === "localhost:3000" || normalizedHost === "127.0.0.1:3000") {
    return false;
  }

  if (normalizedHost === canonicalVariant) {
    return true;
  }

  return normalizedHost.endsWith(".vercel.app");
}

export function proxy(request: NextRequest): NextResponse {
  if (process.env.NODE_ENV !== "production") {
    return withSecurityHeaders(NextResponse.next());
  }

  const host = request.headers.get("host");
  if (!host || !shouldRedirectToCanonicalHost(host)) {
    return withSecurityHeaders(NextResponse.next());
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.protocol = "https";
  redirectUrl.host = CANONICAL_HOST;

  return withSecurityHeaders(NextResponse.redirect(redirectUrl, 308));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
