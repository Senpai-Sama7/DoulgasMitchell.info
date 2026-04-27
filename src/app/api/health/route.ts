import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { db } from '@/lib/db';

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

  try {
    await db.$queryRaw`SELECT 1`;
    checks.database = { status: 'ok', message: 'Database reachable' };
  } catch {
    checks.database = { status: 'error', message: 'Database unreachable' };
    overallStatus = 'unhealthy';
  }

  if (process.env.UPSTASH_REDIS_URL) {
    checks.redis = { status: 'ok', message: 'Redis configured' };
  } else {
    checks.redis = { status: 'warn', message: 'Redis not configured - using in-memory rate limit' };
    if (overallStatus === 'healthy') overallStatus = 'degraded';
  }

  const health: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: Date.now() - startTime,
    version: process.env.npm_package_version || '1.0.0',
    checks,
  };

  const statusCode = overallStatus === 'unhealthy' ? 503 : 200;

  return NextResponse.json(health, { status: statusCode });
}