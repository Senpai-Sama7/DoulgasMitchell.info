import { describe, expect, it } from 'vitest';
import { getClientIp, validateTrustedOrigin } from '@/lib/request';

describe('request helpers', () => {
  it('accepts trusted same-origin requests', () => {
    const request = new Request('http://127.0.0.1:3000/api/contact', {
      headers: {
        origin: 'http://127.0.0.1:3000',
      },
      method: 'POST',
    });

    expect(validateTrustedOrigin(request).allowed).toBe(true);
  });

  it('rejects requests with only referer header (fallback removed for security)', () => {
    const request = new Request('http://127.0.0.1:3000/api/contact', {
      headers: {
        referer: 'http://127.0.0.1:3000/contact',
      },
      method: 'POST',
    });

    // Referer fallback was intentionally removed — only Origin header is trusted
    expect(validateTrustedOrigin(request).allowed).toBe(false);
  });

  it('rejects cross-site requests', () => {
    const request = new Request('http://127.0.0.1:3000/api/contact', {
      headers: {
        origin: 'https://evil.example',
        'sec-fetch-site': 'cross-site',
      },
      method: 'POST',
    });

    const result = validateTrustedOrigin(request);
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/cross-site/i);
  });

  it('prefers valid forwarded IP headers', async () => {
    const request = new Request('http://127.0.0.1:3000/api/contact', {
      headers: {
        'x-forwarded-for': '203.0.113.10, 10.0.0.5',
      },
    });

    expect(await getClientIp(request)).toBe('203.0.113.10');
  });

  it('falls back to an anonymous fingerprint when no valid IP is present', async () => {
    const request = new Request('http://127.0.0.1:3000/api/contact', {
      headers: {
        'x-forwarded-for': 'not-an-ip',
        'user-agent': 'Vitest',
      },
    });

    expect(await getClientIp(request)).toMatch(/^anonymous:/);
  });
});
