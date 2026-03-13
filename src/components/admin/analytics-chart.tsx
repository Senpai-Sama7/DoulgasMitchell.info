'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ForecastPoint } from '@/lib/decision-intelligence';

interface AnalyticsChartProps {
  data: ForecastPoint[];
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  const chartData = data.map((point) => ({
    date: point.date,
    observed: point.projected ? null : point.actual,
    projected: point.projected ? point.prediction : null,
    intervalBase: point.projected ? point.lowerBound : 0,
    intervalSize: point.projected ? point.upperBound - point.lowerBound : 0,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="forecastBand" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity={0.24} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="intervalBase"
            stackId="forecast"
            stroke="transparent"
            fill="transparent"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="intervalSize"
            stackId="forecast"
            stroke="transparent"
            fill="url(#forecastBand)"
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="observed"
            stroke="currentColor"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="projected"
            stroke="currentColor"
            strokeWidth={2}
            dot={false}
            strokeDasharray="6 6"
            opacity={0.8}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
