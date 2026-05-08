// Service Worker for Douglas Mitchell Portfolio
// Provides offline caching and performance optimization

const CACHE_NAME = 'douglasmitchell-v2';
const OFFLINE_URL = '/offline';

// Only precache routes that actually exist
const PRECACHE_ASSETS = [
  '/',
  '/chat',
  '/notes',
  '/search',
  '/offline',
  '/manifest.json',
];

// Cache strategies
const CACHE_STRATEGIES = {
  cacheFirst: [
    /\.(?:png|jpg|jpeg|svg|gif|webp|ico|avif)$/,
    /\.(?:woff|woff2|ttf|otf|eot)$/,
  ],
  networkFirst: [
    /\/api\//,
  ],
  staleWhileRevalidate: [
    /\.(?:js|css)$/,
  ],
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  const strategy = getStrategy(request, url);
  event.respondWith(handleRequest(request, strategy));
});

function getStrategy(request, url) {
  if (CACHE_STRATEGIES.cacheFirst.some((p) => p.test(url.pathname))) return 'cacheFirst';
  if (CACHE_STRATEGIES.networkFirst.some((p) => p.test(url.pathname))) return 'networkFirst';
  if (CACHE_STRATEGIES.staleWhileRevalidate.some((p) => p.test(url.pathname))) return 'staleWhileRevalidate';
  if (request.mode === 'navigate') return 'networkFirst';
  return 'staleWhileRevalidate';
}

async function handleRequest(request, strategy) {
  switch (strategy) {
    case 'cacheFirst': return cacheFirst(request);
    case 'networkFirst': return networkFirst(request);
    default: return staleWhileRevalidate(request);
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    if (request.destination === 'image') {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#1a1a2e" width="200" height="200"/><text x="50%" y="50%" fill="#666" text-anchor="middle" dy=".3em">Offline</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    if (request.mode === 'navigate') {
      const offline = await caches.match(OFFLINE_URL);
      if (offline) return offline;
    }
    return new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fetched = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached || fetched;
}

self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason);
});