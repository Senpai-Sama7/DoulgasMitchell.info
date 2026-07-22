/**
 * Shared fetch helper for the admin portal client components.
 *
 * Centralizes the concerns every admin mutation/query needs:
 * - `credentials: 'same-origin'` so the admin session cookie always rides along
 * - JSON body serialization and response parsing that tolerates empty bodies
 * - Error normalization into `AdminApiError` (reads the `error` / `message`
 *   fields produced by `ApiHandler`)
 * - Session-expiry recovery: a 401 response triggers a redirect to the login
 *   page with a `reason` + `next` so the operator can resume where they were.
 */

export class AdminApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'AdminApiError';
    this.status = status;
    this.details = details;
  }
}

export function isAdminApiError(error: unknown): error is AdminApiError {
  return error instanceof AdminApiError;
}

export interface AdminFetchOptions extends RequestInit {
  /**
   * Skip the automatic login redirect on 401 responses. Used by flows where a
   * 401 is an expected outcome (e.g. the login form itself).
   */
  skipAuthRedirect?: boolean;
}

export const SESSION_EXPIRED_REASON = 'session-expired';

/**
 * Only allow post-login redirects back into the admin portal. Everything else
 * (protocol-relative URLs, external hosts, public routes) falls back to the
 * dashboard so the `next` param can never become an open redirect.
 */
export function sanitizeAdminNextPath(next: string | null | undefined): string {
  if (!next) return '/admin';
  if (!next.startsWith('/admin') || next.startsWith('//') || next.includes('\\')) {
    return '/admin';
  }
  return next;
}

function defaultSessionExpiredHandler() {
  if (typeof window === 'undefined') return;
  const next = `${window.location.pathname}${window.location.search}`;
  const params = new URLSearchParams({ reason: SESSION_EXPIRED_REASON, next });
  window.location.assign(`/admin/login?${params.toString()}`);
}

let sessionExpiredHandler: () => void = defaultSessionExpiredHandler;

/** Test seam + escape hatch for embedding contexts. Returns the previous handler. */
export function setSessionExpiredHandler(handler: (() => void) | null): () => void {
  const previous = sessionExpiredHandler;
  sessionExpiredHandler = handler ?? defaultSessionExpiredHandler;
  return previous;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text().catch(() => '');
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

/**
 * Extract a human-readable error message from an API payload, preferring the
 * `error` field emitted by `ApiHandler` and falling back to `message`.
 */
export function extractApiErrorMessage(payload: unknown, fallback: string): string {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    for (const key of ['error', 'message'] as const) {
      const value = record[key];
      if (typeof value === 'string' && value.trim()) {
        return value;
      }
    }
  }
  return fallback;
}

function extractApiErrorDetails(payload: unknown): unknown {
  if (payload && typeof payload === 'object' && 'details' in payload) {
    return (payload as Record<string, unknown>).details;
  }
  return undefined;
}

/**
 * Fetch an admin API endpoint and return the parsed JSON payload.
 * Throws `AdminApiError` for network failures and non-2xx responses.
 */
export async function adminFetch<T = unknown>(
  input: string,
  init: AdminFetchOptions = {}
): Promise<T> {
  const { skipAuthRedirect, ...requestInit } = init;

  let response: Response;
  try {
    response = await fetch(input, {
      credentials: 'same-origin',
      ...requestInit,
    });
  } catch {
    throw new AdminApiError(
      'Network error while contacting the admin API. Check your connection and try again.',
      0
    );
  }

  const payload = await parseResponseBody(response);

  if (response.status === 401 && !skipAuthRedirect) {
    sessionExpiredHandler();
    throw new AdminApiError(
      'Your admin session has expired. Sign in again to continue.',
      401,
      extractApiErrorDetails(payload)
    );
  }

  if (!response.ok) {
    throw new AdminApiError(
      extractApiErrorMessage(payload, `Request failed with status ${response.status}.`),
      response.status,
      extractApiErrorDetails(payload)
    );
  }

  return (payload ?? {}) as T;
}

/** JSON-body convenience wrapper around `adminFetch`. */
export async function adminJson<T = unknown>(
  input: string,
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  body?: unknown,
  options: AdminFetchOptions = {}
): Promise<T> {
  const { headers, ...rest } = options;
  return adminFetch<T>(input, {
    ...rest,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(headers ?? {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
