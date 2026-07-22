/**
 * Central media paths with documented fallbacks for immersive UI.
 * Replace placeholders in public/ when production assets are ready.
 */

const cdnBase = process.env.NEXT_PUBLIC_MEDIA_CDN?.replace(/\/$/, '') ?? '';

function resolve(path: string): string {
  if (path.startsWith('http')) return path;
  return cdnBase ? `${cdnBase}${path}` : path;
}

export const mediaManifest = {
  hero: {
    videoLoop: resolve('/media/breathing-dm-loop.mp4'),
    videoLoopAlt: resolve('/media/dougie-loop-v2.mp4'),
    videoPoster: resolve('/media/breathing-dm-poster.webp'),
    videoPosterAlt: resolve('/media/dougie-frame-poster.webp'),
    poster: resolve('/images/hero-poster.svg'),
  },
  book: {
    /** Real cover art — 736×1408 portrait scan of The Confident Mind. */
    cover: resolve('/images/book-cover.jpg'),
    coverFallback: resolve('/images/the-confident-mind.jpg'),
    coverHiRes: resolve('/images/book-cover.jpg'),
  },
  certs: {
    googleAi: resolve('/images/certs/google-ai-professional-certificate.svg'),
    anthropic: resolve('/images/certs/AI-Fluency-Anthropic.svg'),
  },
  webgl: {
    poster: resolve('/images/webgl-hero-poster.svg'),
  },
  icons: {
    favicon32: '/icons/favicon-32x32.png',
    favicon192: '/icons/favicon-192x192.png',
    appleTouch: '/icons/apple-touch-icon.png',
  },
} as const;

export type MediaManifest = typeof mediaManifest;
