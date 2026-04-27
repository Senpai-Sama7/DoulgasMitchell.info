import { Redis } from '@upstash/redis';
import { env, features } from './env';
import { logger } from './logger';

// Redis client singleton
let redisClient: Redis | null = null;

export function getRedis(): Redis | null {
  if (!features.redis) return null;
  if (!redisClient) {
    redisClient = new Redis({
      url: env.UPSTASH_REDIS_URL!,
      token: env.UPSTASH_REDIS_TOKEN!,
    });
  }
  return redisClient;
}

// Cache configuration
const DEFAULT_TTL = 60 * 5; // 5 minutes
interface CacheOptions {
  ttl?: number;
  tags?: string[];
}

export async function getCache<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;
  
  try {
    const value = await redis.get<T>(key);
    return value;
  } catch (error) {
    logger.error('Cache get error:', error);
    return null;
  }
}

export async function setCache<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  
  const { ttl = DEFAULT_TTL, tags = [] } = options;
  
  try {
    await redis.set(key, value, { ex: ttl });
    
    // Store tags for invalidation
    if (tags.length > 0) {
      const tagKey = `tags:${key}`;
      await redis.set(tagKey, tags, { ex: ttl });
    }
  } catch (error) {
    logger.error('Cache set error:', error);
  }
}

export async function deleteCache(key: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  
  try {
    await redis.del(key);
    await redis.del(`tags:${key}`);
  } catch (error) {
    logger.error('Cache delete error:', error);
  }
}

export async function invalidateByTag(tag: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  
  try {
    // Scan all keys and delete those with matching tag
    let cursor = '0';
    do {
      const result = await redis.scan(cursor, { match: 'tags:*' });
      cursor = result[0];
      const keys = result[1];
      
      for (const tagKey of keys) {
        const tags = await redis.get<string[]>(tagKey);
        if (tags?.includes(tag)) {
          const dataKey = tagKey.replace('tags:', '');
          await redis.del(dataKey);
          await redis.del(tagKey);
        }
      }
    } while (cursor !== '0');
  } catch (error) {
    logger.error('Cache invalidation error:', error);
  }
}

// In-memory fallback for when Redis is unavailable
const memoryCache = new Map<string, { value: unknown; expires: number }>();

export function getMemoryCache<T>(key: string): T | null {
  const item = memoryCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expires) {
    memoryCache.delete(key);
    return null;
  }
  return item.value as T;
}

export function setMemoryCache<T>(
  key: string,
  value: T,
  ttl: number = DEFAULT_TTL
): void {
  memoryCache.set(key, {
    value,
    expires: Date.now() + ttl * 1000,
  });
}

// Cache wrapper for expensive operations
export async function cacheWrap<T>(
  key: string,
  fn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Try Redis first
  const redisCached = await getCache<T>(key);
  if (redisCached !== null) return redisCached;

  const memoryCached = getMemoryCache<T>(key);
  if (memoryCached !== null) return memoryCached;

  const result = await fn();
  await setCache(key, result, options);
  setMemoryCache(key, result, options.ttl);

  return result;
}

// Cache keys generator
export const cacheKeys = {
  article: (slug: string) => `article:${slug}`,
  articles: (page: number, limit: number) => `articles:${page}:${limit}`,
  projects: () => 'projects',
  certifications: () => 'certifications',
  book: () => 'book',
  siteConfig: (key: string) => `config:${key}`,
  analytics: (period: string) => `analytics:${period}`,
  media: (id: string) => `media:${id}`,
  user: (id: string) => `user:${id}`,
  session: (token: string) => `session:${token}`,
};
