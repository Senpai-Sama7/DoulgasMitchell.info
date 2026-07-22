import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AdminApiError,
  adminFetch,
  adminJson,
  extractApiErrorMessage,
  isAdminApiError,
  sanitizeAdminNextPath,
  setSessionExpiredHandler,
  triggerSessionExpiredRedirect,
} from '@/lib/admin-api-client';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('admin-api-client', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    setSessionExpiredHandler(null);
  });

  describe('adminFetch', () => {
    it('returns the parsed payload for a successful response', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ success: true, items: [1, 2] }));

      const data = await adminFetch<{ items: number[] }>('/api/admin/content');
      expect(data.items).toEqual([1, 2]);
    });

    it('sends same-origin credentials by default', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ success: true }));

      await adminFetch('/api/admin/content');
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/admin/content',
        expect.objectContaining({ credentials: 'same-origin' })
      );
    });

    it('returns an empty object for empty response bodies', async () => {
      fetchMock.mockResolvedValue(new Response('', { status: 200 }));

      const data = await adminFetch('/api/admin/logout');
      expect(data).toEqual({});
    });

    it('throws AdminApiError with the ApiHandler error field on failure', async () => {
      // A Response body is single-use, so mint a fresh one per fetch call.
      fetchMock.mockImplementation(async () =>
        jsonResponse({ success: false, error: 'Invalid content update payload.' }, 400)
      );

      await expect(adminFetch('/api/admin/content')).rejects.toBeInstanceOf(AdminApiError);
      await expect(adminFetch('/api/admin/content')).rejects.toMatchObject({
        message: 'Invalid content update payload.',
        status: 400,
      });
    });

    it('falls back to the message field when error is absent', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ message: 'Slow down.' }, 429));

      await expect(adminFetch('/api/admin/content')).rejects.toMatchObject({
        message: 'Slow down.',
        status: 429,
      });
    });

    it('uses a generic status message for unparseable error bodies', async () => {
      fetchMock.mockResolvedValue(new Response('<html>Bad Gateway</html>', { status: 502 }));

      await expect(adminFetch('/api/admin/content')).rejects.toMatchObject({
        message: 'Request failed with status 502.',
        status: 502,
      });
    });

    it('surfaces details from structured error payloads', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse(
          { success: false, error: 'Invalid', details: { fieldErrors: { title: ['Required'] } } },
          400
        )
      );

      try {
        await adminFetch('/api/admin/content');
        expect.unreachable('should have thrown');
      } catch (error) {
        expect(isAdminApiError(error)).toBe(true);
        expect((error as AdminApiError).details).toEqual({ fieldErrors: { title: ['Required'] } });
      }
    });

    it('normalizes network failures into AdminApiError with status 0', async () => {
      fetchMock.mockRejectedValue(new TypeError('fetch failed'));

      await expect(adminFetch('/api/admin/content')).rejects.toMatchObject({
        name: 'AdminApiError',
        status: 0,
      });
    });

    it('invokes the session-expired handler on 401 responses', async () => {
      const handler = vi.fn();
      setSessionExpiredHandler(handler);
      fetchMock.mockResolvedValue(jsonResponse({ success: false, error: 'Unauthorized' }, 401));

      await expect(adminFetch('/api/admin/content')).rejects.toMatchObject({ status: 401 });
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('skips the session-expired handler when skipAuthRedirect is set', async () => {
      const handler = vi.fn();
      setSessionExpiredHandler(handler);
      fetchMock.mockResolvedValue(jsonResponse({ success: false, error: 'Invalid credentials' }, 401));

      await expect(
        adminFetch('/api/admin/auth', { skipAuthRedirect: true })
      ).rejects.toMatchObject({
        status: 401,
        message: 'Invalid credentials',
      });
      expect(handler).not.toHaveBeenCalled();
    });

    it('exposes triggerSessionExpiredRedirect for non-fetch callers', () => {
      const handler = vi.fn();
      setSessionExpiredHandler(handler);

      triggerSessionExpiredRedirect();
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('adminJson', () => {
    it('serializes the body and sets the JSON content type', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ success: true }));

      await adminJson('/api/admin/content', 'PATCH', { type: 'article', id: '1' });

      const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(init.method).toBe('PATCH');
      expect(init.body).toBe(JSON.stringify({ type: 'article', id: '1' }));
      expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
    });

    it('omits the body when none is provided', async () => {
      fetchMock.mockResolvedValue(jsonResponse({ success: true }));

      await adminJson('/api/admin/passkeys', 'POST');

      const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(init.body).toBeUndefined();
    });
  });

  describe('extractApiErrorMessage', () => {
    it('prefers the error field over message', () => {
      expect(extractApiErrorMessage({ error: 'A', message: 'B' }, 'fallback')).toBe('A');
    });

    it('ignores blank strings', () => {
      expect(extractApiErrorMessage({ error: '  ', message: 'B' }, 'fallback')).toBe('B');
    });

    it('returns the fallback for non-object payloads', () => {
      expect(extractApiErrorMessage(null, 'fallback')).toBe('fallback');
      expect(extractApiErrorMessage('oops', 'fallback')).toBe('fallback');
    });
  });

  describe('sanitizeAdminNextPath', () => {
    it('accepts admin-internal paths', () => {
      expect(sanitizeAdminNextPath('/admin/content')).toBe('/admin/content');
      expect(sanitizeAdminNextPath('/admin/media?folder=x')).toBe('/admin/media?folder=x');
    });

    it('rejects external and non-admin destinations', () => {
      expect(sanitizeAdminNextPath('https://evil.example')).toBe('/admin');
      expect(sanitizeAdminNextPath('//evil.example/admin')).toBe('/admin');
      expect(sanitizeAdminNextPath('/settings')).toBe('/admin');
      expect(sanitizeAdminNextPath('/admin\\..\\escape')).toBe('/admin');
      expect(sanitizeAdminNextPath(null)).toBe('/admin');
      expect(sanitizeAdminNextPath(undefined)).toBe('/admin');
      expect(sanitizeAdminNextPath('')).toBe('/admin');
    });
  });
});
