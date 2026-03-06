import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "Content-Security-Policy": [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self' data: blob: https:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "connect-src 'self' https:",
  ].join('; '),
};

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(header, value);
  }

  return response;
}

const CANONICAL_HOST = (
  process.env.CANONICAL_HOST || "www.douglasmitchell.info"
).toLowerCase();

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
    return applySecurityHeaders(NextResponse.next());
  }

  const host = request.headers.get("host");
  if (!host || !shouldRedirectToCanonicalHost(host)) {
    return applySecurityHeaders(NextResponse.next());
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.protocol = "https";
  redirectUrl.host = CANONICAL_HOST;

  return applySecurityHeaders(NextResponse.redirect(redirectUrl, 308));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
