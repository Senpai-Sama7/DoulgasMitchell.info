/**
 * Next.js Edge Proxy — security perimeter for Douglas Mitchell Platform.
 *
 * This thin wrapper imports the proxy handler from `./proxy-handler` and
 * exports it as the `proxy` function that Next.js 16 expects.
 */
export { proxy } from './proxy-handler';

export const config = {
  matcher: [
    // Apply proxy to all routes except static assets
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
