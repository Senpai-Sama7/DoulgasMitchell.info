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

function createStoreKey(identifier: string, prefix = 'global') {
  return `${prefix}:${identifier}`;
}

// Simple garbage collection to prevent memory leaks from sustained DoS
function cleanupStore() {
  const now = Date.now();
  for (const [key, state] of rateLimitStore.entries()) {
    if (now > state.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

export function rateLimit(identifier: string, options: RateLimitOptions): RateLimitResult {
  cleanupStore(); // Clear expired entries to prevent memory exhaustion
  
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

export function clearRateLimit(identifier: string, prefix = 'global') {
  rateLimitStore.delete(createStoreKey(identifier, prefix));
}
