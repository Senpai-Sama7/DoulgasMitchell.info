import { NextResponse } from 'next/server';
import { getMetricsSnapshot, startTime } from '@/lib/metrics';

export const dynamic = 'force-dynamic';

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
  const counters = await getMetricsSnapshot();

  const requestsPerSecond = uptimeSeconds > 0 ? counters.requests / uptimeSeconds : 0;
  const errorRate = counters.requests > 0 ? counters.errors / counters.requests : 0;

  const metrics: MetricSample[] = [
    { name: 'process_uptime_seconds', value: uptimeSeconds, timestamp: new Date().toISOString() },
    { name: 'process_memory_heap_bytes', value: memUsage?.heapUsed ?? 0, timestamp: new Date().toISOString() },
    { name: 'process_memory_rss_bytes', value: memUsage?.rss ?? 0, timestamp: new Date().toISOString() },
    { name: 'process_memory_external_bytes', value: memUsage?.external ?? 0, timestamp: new Date().toISOString() },
    { name: 'process_cpu_user_microseconds', value: cpuUsage?.user ?? 0, timestamp: new Date().toISOString() },
    { name: 'process_cpu_system_microseconds', value: cpuUsage?.system ?? 0, timestamp: new Date().toISOString() },
    { name: 'http_requests_total', value: counters.requests, timestamp: new Date().toISOString() },
    { name: 'http_errors_total', value: counters.errors, timestamp: new Date().toISOString() },
    { name: 'http_requests_per_second', value: requestsPerSecond, timestamp: new Date().toISOString() },
    { name: 'http_error_rate', value: errorRate, timestamp: new Date().toISOString() },
    { name: 'rate_limit_hits_total', value: counters.rateLimits, timestamp: new Date().toISOString() },
    { name: 'ai_requests_total', value: counters.aiRequests, timestamp: new Date().toISOString() },
  ];

  const response: MetricsResponse = {
    timestamp: new Date().toISOString(),
    uptime_seconds: uptimeSeconds,
    metrics,
  };

  return NextResponse.json(response);
}
