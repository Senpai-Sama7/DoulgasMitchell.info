import { redis, isRedisActive } from './redis';

// ---------------------------------------------------------------------------
// Metric counters — Redis-backed for distributed consistency.
// Falls back to in-memory Map when Redis is unavailable (same limitation
// as the rest of the platform).
// ---------------------------------------------------------------------------
const fallbackCounters = new Map<string, number>();
const startTime = Date.now();

const COUNTER_TTL_SECONDS = 86_400; // 24 h — auto-expire to avoid bloat

function makeKey(metric: string, date: string) {
  return `metrics:${date}:${metric}`;
}

function today() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function incr(key: string) {
  if (redis) {
    void redis.incr(key).catch(() => {});
    void redis.expire(key, COUNTER_TTL_SECONDS).catch(() => {});
  }
}

function getCounter(key: string): Promise<number> {
  if (!redis) return Promise.resolve(0);
  return redis.get(key).then((v) => (v ? Number(v) : 0));
}

export function incrementRequests() {
  if (isRedisActive()) {
    incr(makeKey('requests', today()));
  } else {
    const key = `requests:${today()}`;
    fallbackCounters.set(key, (fallbackCounters.get(key) ?? 0) + 1);
  }
}

export function incrementErrors() {
  if (isRedisActive()) {
    incr(makeKey('errors', today()));
  } else {
    const key = `errors:${today()}`;
    fallbackCounters.set(key, (fallbackCounters.get(key) ?? 0) + 1);
  }
}

export function incrementRateLimitHits() {
  if (isRedisActive()) {
    incr(makeKey('rate_limits', today()));
  } else {
    const key = `rate_limits:${today()}`;
    fallbackCounters.set(key, (fallbackCounters.get(key) ?? 0) + 1);
  }
}

export function incrementAiRequests() {
  if (isRedisActive()) {
    incr(makeKey('ai_requests', today()));
  } else {
    const key = `ai_requests:${today()}`;
    fallbackCounters.set(key, (fallbackCounters.get(key) ?? 0) + 1);
  }
}

// ---------------------------------------------------------------------------
// Read helpers — used by /api/metrics GET handler
// ---------------------------------------------------------------------------
async function readCounter(metric: string): Promise<number> {
  if (isRedisActive()) {
    return getCounter(makeKey(metric, today()));
  }
  return fallbackCounters.get(`${metric}:${today()}`) ?? 0;
}

export async function getMetricsSnapshot() {
  const [requests, errors, rateLimits, aiRequests] = await Promise.all([
    readCounter('requests'),
    readCounter('errors'),
    readCounter('rate_limits'),
    readCounter('ai_requests'),
  ]);

  return { requests, errors, rateLimits, aiRequests };
}

// ---------------------------------------------------------------------------
// Circuit breaker — Redis-backed for distributed consistency.
// ---------------------------------------------------------------------------
const CB_KEY = 'metrics:circuit_breaker';
const CB_THRESHOLD = 5;
const CB_RESET_MS = 60_000; // 60 s

export async function isCircuitOpen(): Promise<boolean> {
  if (!isRedisActive() || !redis) return false;
  const raw = await redis.get(CB_KEY);
  if (!raw) return false;
  const val = JSON.parse(String(raw)) as { count: number; openedAt: number };
  if (Date.now() - val.openedAt > CB_RESET_MS) {
    void redis.del(CB_KEY).catch(() => {});
    return false;
  }
  return val.count >= CB_THRESHOLD;
}

export async function recordFailure(): Promise<void> {
  if (!isRedisActive() || !redis) return;
  const raw = await redis.get(CB_KEY);
  const current = raw
    ? (JSON.parse(String(raw)) as { count: number; openedAt: number })
    : { count: 0, openedAt: Date.now() };
  current.count += 1;
  void redis.set(CB_KEY, JSON.stringify(current), { ex: 120 }).catch(() => {});
}

export async function recordSuccess(): Promise<void> {
  if (redis && isRedisActive()) {
    void redis.del(CB_KEY).catch(() => {});
  }
}

// ---------------------------------------------------------------------------
// Legacy in-memory start time (for process-level uptime)
// ---------------------------------------------------------------------------
export { startTime };
