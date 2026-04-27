/**
 * Next.js Edge Middleware — security perimeter for Douglas Mitchell Platform.
 *
 * This thin wrapper imports the proxy handler from `./proxy-handler` and
 * exports it as the `middleware` function that Next.js expects.
 */
export { proxy as middleware } from './proxy-handler';

export const config = {
  matcher: [
    // Apply middleware to all routes except static assets
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
