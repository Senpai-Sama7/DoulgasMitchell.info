import { isRedisActive, redis } from '@/lib/redis';

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
  prefix?: string;
}

export interface RateLimitState {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitState>();
let cleanupCounter = 0;
const CLEANUP_INTERVAL = 100;

function createStoreKey(identifier: string, prefix = 'global') {
  return `${prefix}:${identifier}`;
}

function cleanupStore() {
  const now = Date.now();
  for (const [key, state] of rateLimitStore.entries()) {
    if (now > state.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

function rateLimitInMemory(identifier: string, options: RateLimitOptions): RateLimitResult {
  cleanupCounter++;
  if (cleanupCounter >= CLEANUP_INTERVAL) {
    cleanupStore();
    cleanupCounter = 0;
  }
  
  const now = Date.now();
  const storeKey = createStoreKey(identifier, options.prefix);
  const existing = rateLimitStore.get(storeKey);

  if (!existing || now > existing.resetAt) {
    rateLimitStore.set(storeKey, {
      count: 1,
      resetAt: now + options.windowMs,
    });

    return {
      allowed: true,
      remaining: Math.max(options.limit - 1, 0),
      resetAt: now + options.windowMs,
    };
  }

  if (existing.count >= options.limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;
  rateLimitStore.set(storeKey, existing);

  return {
    allowed: true,
    remaining: Math.max(options.limit - existing.count, 0),
    resetAt: existing.resetAt,
  };
}

async function rateLimitInRedis(identifier: string, options: RateLimitOptions): Promise<RateLimitResult> {
  const now = Date.now();
  const storeKey = createStoreKey(identifier, options.prefix);
  const r = redis;
  if (!r) throw new Error('Redis not available');

  const count = await r.incr(storeKey);

  if (count === 1) {
    await r.pexpire(storeKey, options.windowMs);
  }

  let ttl = await r.pttl(storeKey);
  if (ttl < 0) {
    await r.pexpire(storeKey, options.windowMs);
    ttl = options.windowMs;
  }

  const resetAt = now + ttl;
  const allowed = count <= options.limit;

  return {
    allowed,
    remaining: allowed ? Math.max(options.limit - count, 0) : 0,
    resetAt,
  };
}

export async function rateLimit(identifier: string, options: RateLimitOptions): Promise<RateLimitResult> {
  if (!isRedisActive()) {
    return rateLimitInMemory(identifier, options);
  }

  try {
    return await rateLimitInRedis(identifier, options);
  } catch (error) {
    // Log Redis failures for operational visibility — in-memory fallback is not
    // shared across instances, so degraded rate limiting may go unnoticed.
    console.error('[rate-limit] Redis error, falling back to in-memory:', error instanceof Error ? error.message : error);
    return rateLimitInMemory(identifier, options);
  }
}

export function clearRateLimit(identifier: string, prefix = 'global') {
  rateLimitStore.delete(createStoreKey(identifier, prefix));
}
