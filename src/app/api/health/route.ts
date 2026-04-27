import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: Record<string, { status: 'ok' | 'warn' | 'error'; message?: string }>;
}

let startTime = Date.now();

export async function GET() {
  const checks: HealthStatus['checks'] = {};
  let overallStatus: HealthStatus['status'] = 'healthy';

  checks.environment = { status: 'ok' };

  checks.database = { status: 'ok', message: 'PostgreSQL required for production' };

  if (process.env.UPSTASH_REDIS_URL) {
    checks.redis = { status: 'ok', message: 'Redis configured' };
  } else {
    checks.redis = { status: 'warn', message: 'Redis not configured - using in-memory rate limit' };
    if (overallStatus === 'healthy') overallStatus = 'degraded';
  }

  if (process.env.DATABASE_URL?.startsWith('file:')) {
    checks.database = { status: 'warn', message: 'Using SQLite fallback' };
    if (overallStatus === 'healthy') overallStatus = 'degraded';
  }

  const health: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: Date.now() - startTime,
    version: process.env.npm_package_version || '1.0.0',
    checks,
  };

  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}