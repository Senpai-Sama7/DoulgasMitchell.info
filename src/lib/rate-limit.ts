interface RateLimitOptions {
  limit: number;
  windowMs: number;
  prefix?: string;
}

interface RateLimitState {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitState>();

function createStoreKey(identifier: string, prefix = 'global') {
  return `${prefix}:${identifier}`;
}

export function rateLimit(identifier: string, options: RateLimitOptions): RateLimitResult {
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

  return {
    allowed: true,
    remaining: Math.max(options.limit - existing.count, 0),
    resetAt: existing.resetAt,
  };
}

export function clearRateLimit(identifier: string, prefix = 'global') {
  rateLimitStore.delete(createStoreKey(identifier, prefix));
}
