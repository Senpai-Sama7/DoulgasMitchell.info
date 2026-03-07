'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const SESSION_STORAGE_KEY = 'douglas-mitchell-session-id';

function getSessionId() {
  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;

  const created = crypto.randomUUID();
  window.localStorage.setItem(SESSION_STORAGE_KEY, created);
  return created;
}

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    const sessionId = getSessionId();

    void fetch('/api/analytics/page-view', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      keepalive: true,
      body: JSON.stringify({
        path: pathname,
        sessionId,
        referrer: document.referrer,
      }),
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
