import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface MetricSample {
  name: string;
  value: number;
  timestamp: string;
}

interface MetricsResponse {
  timestamp: string;
  uptime: number;
  metrics: MetricSample[];
}

const startTime = Date.now();

export async function GET() {
  const memUsage = process.memoryUsage();
  const heapUsed = memUsage?.heapUsed ?? 0;

  const metrics: MetricSample[] = [
    {
      name: 'process_uptime_seconds',
      value: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
    },
    {
      name: 'process_memory_usage_bytes',
      value: heapUsed,
      timestamp: new Date().toISOString(),
    },
  ];

  const response: MetricsResponse = {
    timestamp: new Date().toISOString(),
    uptime: Date.now() - startTime,
    metrics,
  };

  return NextResponse.json(response);
}