import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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
    return NextResponse.next();
  }

  const host = request.headers.get("host");
  if (!host || !shouldRedirectToCanonicalHost(host)) {
    return NextResponse.next();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.protocol = "https";
  redirectUrl.host = CANONICAL_HOST;

  return NextResponse.redirect(redirectUrl, 308);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
