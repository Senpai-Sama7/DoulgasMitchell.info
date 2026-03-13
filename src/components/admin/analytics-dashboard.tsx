'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Eye, 
  Users, 
  TrendingUp, 
  MousePointer2,
  Calendar,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DailyView {
  date: string;
  views: number;
}

interface TopPage {
  path: string;
  count: number;
}

interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  topPages: TopPage[];
  dailyViews: DailyView[];
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/analytics?days=${days}`);
        const result = await response.json();
        if (result.success) {
          // Format dates for the chart
          const formattedDailyViews = result.data.dailyViews.map((v: any) => ({
            ...v,
            date: new Date(v.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          }));
          setData({ ...result.data, dailyViews: formattedDailyViews });
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [days]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-muted/30 border-none shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-medium flex items-center gap-2">
              <Eye className="h-3 w-3" /> Total Page Views
            </CardDescription>
            <CardTitle className="text-2xl font-mono tabular-nums">{data.totalViews.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="bg-muted/30 border-none shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-medium flex items-center gap-2">
              <Users className="h-3 w-3" /> Unique Visitors
            </CardDescription>
            <CardTitle className="text-2xl font-mono tabular-nums">{data.uniqueVisitors.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-muted/30 border-none shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-medium flex items-center gap-2">
              <TrendingUp className="h-3 w-3" /> Avg. Views / Day
            </CardDescription>
            <CardTitle className="text-2xl font-mono tabular-nums">
              {Math.round(data.totalViews / days).toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-muted/30 border-none shadow-none">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-medium flex items-center gap-2">
              <MousePointer2 className="h-3 w-3" /> Conversion Rate
            </CardDescription>
            <CardTitle className="text-2xl font-mono tabular-nums">
              {((data.uniqueVisitors / data.totalViews) * 100).toFixed(1)}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traffic Chart */}
        <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-muted-foreground/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-mono uppercase tracking-tight">Traffic Overview</CardTitle>
                <CardDescription>Daily page views for the last {days} days</CardDescription>
              </div>
              <div className="flex gap-2">
                {[7, 30, 90].map((d) => (
                  <Badge 
                    key={d} 
                    variant={days === d ? "default" : "outline"}
                    className="cursor-pointer font-mono"
                    onClick={() => setDays(d)}
                  >
                    {d}D
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.dailyViews}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    stroke="rgba(255,255,255,0.4)"
                  />
                  <YAxis 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    stroke="rgba(255,255,255,0.4)"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(23, 23, 23, 0.95)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontFamily: 'monospace'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2} 
                    dot={false}
                    activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card className="bg-card/50 backdrop-blur-sm border-muted-foreground/10">
          <CardHeader>
            <CardTitle className="text-base font-mono uppercase tracking-tight font-bold">Top Entry Points</CardTitle>
            <CardDescription>Most visited paths</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topPages.map((page, idx) => (
                <div key={page.path} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[10px] font-mono text-muted-foreground w-4">{idx + 1}.</span>
                    <span className="text-sm font-mono truncate text-muted-foreground group-hover:text-foreground transition-colors">
                      {page.path === '/' ? '/home' : page.path}
                    </span>
                  </div>
                  <Badge variant="secondary" className="font-mono text-[10px] ml-2 shrink-0">
                    {page.count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
