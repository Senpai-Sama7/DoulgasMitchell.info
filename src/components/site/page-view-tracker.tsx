'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const SESSION_STORAGE_KEY = 'douglas-mitchell-session-id';
const ANALYTICS_ENDPOINT = '/api/analytics/page-view';

function getSessionId() {
  try {
    const existing = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;

    const created = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, created);
    return created;
  } catch {
    return crypto.randomUUID();
  }
}

function sendPageView(payload: { path: string; sessionId: string; referrer: string }) {
  const body = JSON.stringify(payload);
  const canUseBeacon = typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function';

  if (canUseBeacon) {
    const sent = navigator.sendBeacon(ANALYTICS_ENDPOINT, new Blob([body], { type: 'application/json' }));
    if (sent) return;
  }

  void fetch(ANALYTICS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    keepalive: true,
    body,
  }).catch(() => undefined);
}

export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;

    const sessionId = getSessionId();
    const query = searchParams?.toString();
    sendPageView({
      path: query ? `${pathname}?${query}` : pathname,
      sessionId,
      referrer: document.referrer,
    });
  }, [pathname, searchParams]);

  return null;
}
