import { Redis } from '@upstash/redis';
import { env } from './env';

// Only initialize Redis if environment variables are provided
export const redis = env.UPSTASH_REDIS_URL && env.UPSTASH_REDIS_TOKEN
  ? new Redis({
      url: env.UPSTASH_REDIS_URL,
      token: env.UPSTASH_REDIS_TOKEN,
    })
  : null;

/**
 * Utility to check if Redis is active
 */
export const isRedisActive = (): boolean => !!redis;
