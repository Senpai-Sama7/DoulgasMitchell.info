import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// In-memory metric counters — single-instance only.
// For distributed production, wire these to Redis / Prometheus.
// ---------------------------------------------------------------------------
const startTime = Date.now();

let totalRequests = 0;
let errorRequests = 0;
let rateLimitHits = 0;
let aiRequests = 0;

export function incrementRequests() { totalRequests++; }
export function incrementErrors() { errorRequests++; }
export function incrementRateLimitHits() { rateLimitHits++; }
export function incrementAiRequests() { aiRequests++; }

// ---------------------------------------------------------------------------
// Response shape
// ---------------------------------------------------------------------------
interface MetricSample {
  name: string;
  value: number;
  timestamp: string;
}

interface MetricsResponse {
  timestamp: string;
  uptime_seconds: number;
  metrics: MetricSample[];
}

export async function GET() {
  const now = Date.now();
  const uptimeSeconds = Math.floor((now - startTime) / 1000);
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  const requestsPerSecond = uptimeSeconds > 0 ? totalRequests / uptimeSeconds : 0;
  const errorRate = totalRequests > 0 ? errorRequests / totalRequests : 0;

  const metrics: MetricSample[] = [
    { name: 'process_uptime_seconds', value: uptimeSeconds, timestamp: new Date().toISOString() },
    { name: 'process_memory_heap_bytes', value: memUsage?.heapUsed ?? 0, timestamp: new Date().toISOString() },
    { name: 'process_memory_rss_bytes', value: memUsage?.rss ?? 0, timestamp: new Date().toISOString() },
    { name: 'process_memory_external_bytes', value: memUsage?.external ?? 0, timestamp: new Date().toISOString() },
    { name: 'process_cpu_user_microseconds', value: cpuUsage?.user ?? 0, timestamp: new Date().toISOString() },
    { name: 'process_cpu_system_microseconds', value: cpuUsage?.system ?? 0, timestamp: new Date().toISOString() },
    { name: 'http_requests_total', value: totalRequests, timestamp: new Date().toISOString() },
    { name: 'http_errors_total', value: errorRequests, timestamp: new Date().toISOString() },
    { name: 'http_requests_per_second', value: requestsPerSecond, timestamp: new Date().toISOString() },
    { name: 'http_error_rate', value: errorRate, timestamp: new Date().toISOString() },
    { name: 'rate_limit_hits_total', value: rateLimitHits, timestamp: new Date().toISOString() },
    { name: 'ai_requests_total', value: aiRequests, timestamp: new Date().toISOString() },
  ];

  const response: MetricsResponse = {
    timestamp: new Date().toISOString(),
    uptime_seconds: uptimeSeconds,
    metrics,
  };

  return NextResponse.json(response);
}
