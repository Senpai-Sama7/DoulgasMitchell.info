import { randomUUID } from 'crypto';

// ---------------------------------------------------------------------------
// Correlation IDs — use AsyncLocalStorage in Node.js, Map fallback in Edge
// ---------------------------------------------------------------------------
let AsyncLocalStorage: typeof import('async_hooks').AsyncLocalStorage | null = null;
try {
  // Dynamic import for Edge compatibility
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ah = require('async_hooks');
  AsyncLocalStorage = ah.AsyncLocalStorage;
} catch {
  // Edge runtime — no AsyncLocalStorage
}

const correlationStorage = AsyncLocalStorage ? new AsyncLocalStorage<Map<string, string>>() : null;

export function withCorrelation<T>(fn: () => T, overrides?: Record<string, string>): T {
  const ctx = new Map<string, string>(Object.entries(overrides ?? {}));
  if (!ctx.has('correlationId')) {
    ctx.set('correlationId', randomUUID());
  }
  if (correlationStorage) {
    return correlationStorage.run(ctx, fn);
  }
  // Edge fallback: just run the function
  return fn();
}

export function getCorrelationId(): string | undefined {
  return correlationStorage?.getStore()?.get('correlationId');
}

export function setCorrelationValue(key: string, value: string): void {
  correlationStorage?.getStore()?.set(key, value);
}

// ---------------------------------------------------------------------------
// Log levels
// ---------------------------------------------------------------------------
const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 } as const;
type LogLevel = keyof typeof LOG_LEVELS;

const CURRENT_LEVEL: LogLevel =
  process.env.NODE_ENV === 'production' ? 'info' : 'debug';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LEVEL];
}

// ---------------------------------------------------------------------------
// PII redaction — strip common sensitive keys from logged objects
// ---------------------------------------------------------------------------
const SENSITIVE_KEYS = new Set([
  'authorization', 'cookie', 'x-api-key', 'apikey', 'api_key',
  'token', 'accessToken', 'refreshToken', 'password', 'secret',
  'jwt', 'jwt_secret', 'database_url', 'secret_key',
]);

function redactSensitive(value: unknown): unknown {
  if (typeof value !== 'object' || value === null) return value;
  if (value instanceof Error) return { message: value.message, stack: value.stack };
  if (Array.isArray(value)) return value.map(redactSensitive);

  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value)) {
    result[k] = SENSITIVE_KEYS.has(k.toLowerCase()) ? '[REDACTED]' : redactSensitive(v);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Structured output (JSON in production) or human-readable (dev)
// ---------------------------------------------------------------------------
const USE_STRUCTURED = process.env.LOG_FORMAT === 'json' || process.env.NODE_ENV === 'production';

function serializeMeta(meta: unknown): Record<string, unknown> | string {
  if (meta === undefined || meta === null) return '';
  if (meta instanceof Error) {
    return USE_STRUCTURED
      ? { message: meta.message, name: meta.name, stack: meta.stack }
      : ` ${meta.stack || meta.message}`;
  }
  const clean = redactSensitive(meta);
  if (USE_STRUCTURED) return clean as Record<string, unknown>;
  try {
    return ` ${JSON.stringify(clean)}`;
  } catch {
    return ' [unserializable metadata]';
  }
}

function formatMessage(level: LogLevel, message: string, meta?: unknown): string | object {
  const timestamp = new Date().toISOString();
  const correlationId = getCorrelationId();
  const metaResult = serializeMeta(meta);

  if (USE_STRUCTURED) {
    return {
      timestamp,
      level,
      message,
      correlationId,
      ...(typeof metaResult === 'object' ? metaResult : {}),
    };
  }

  const metaStr = typeof metaResult === 'string' ? metaResult : '';
  const corrStr = correlationId ? ` [${correlationId.slice(0, 8)}]` : '';
  return `[${timestamp}] [${level.toUpperCase()}]${corrStr} ${message}${metaStr}`;
}

function log(level: LogLevel, message: string, meta?: unknown): void {
  if (!shouldLog(level)) return;

  const formatted = formatMessage(level, message, meta);

  if (USE_STRUCTURED && typeof formatted === 'object') {
    const str = JSON.stringify(formatted);
    switch (level) {
      case 'debug': console.debug(str); break;
      case 'info': console.info(str); break;
      case 'warn': console.warn(str); break;
      case 'error': console.error(str); break;
    }
    return;
  }

  switch (level) {
    case 'debug': console.debug(formatted); break;
    case 'info': console.info(formatted); break;
    case 'warn': console.warn(formatted); break;
    case 'error': console.error(formatted); break;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export const logger = {
  debug(message: string, meta?: unknown): void { log('debug', message, meta); },
  info(message: string, meta?: unknown): void { log('info', message, meta); },
  warn(message: string, meta?: unknown): void { log('warn', message, meta); },
  error(message: string, meta?: unknown): void { log('error', message, meta); },
  withCorrelation,
  getCorrelationId,
  setCorrelationValue,
};
