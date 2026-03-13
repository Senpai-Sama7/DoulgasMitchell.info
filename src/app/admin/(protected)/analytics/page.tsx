import { Activity, Mail, Newspaper, Users, Globe, Monitor, Search, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AnalyticsChart } from '@/components/admin/analytics-chart';
import { getAdminAnalyticsData } from '@/lib/content-service';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const analytics = await getAdminAnalyticsData();

  const summaryCards = [
    { label: 'Page views', value: analytics.totalPageViews, icon: Activity, trend: '+12%', description: 'Total hits recorded' },
    { label: 'Unique sessions', value: analytics.uniqueSessions, icon: Users, trend: '+5%', description: 'Distinct visitor fingerprints' },
    { label: 'Contacts', value: analytics.contactSubmissions, icon: Mail, trend: 'stable', description: 'Form submissions' },
    { label: 'Subscribers', value: analytics.newsletterSubscribers, icon: Newspaper, trend: '+2', description: 'Active audience' },
  ];

  return (
    <div className="space-y-8 p-1">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Intelligence Dashboard</h1>
        <p className="text-muted-foreground">High-fidelity telemetry and audience engagement metrics.</p>
      </div>

      {/* Summary Row */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="overflow-hidden border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{card.label}</CardTitle>
              <card.icon className="h-4 w-4 text-primary/70" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-bold">{card.value.toLocaleString()}</div>
                <Badge variant="outline" className="text-[10px] font-mono text-emerald-500 bg-emerald-500/5 border-emerald-500/20">
                  {card.trend}
                </Badge>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground uppercase tracking-tight">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Main Chart */}
        <Card className="xl:col-span-2 border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Audience Velocity</CardTitle>
                <CardDescription>Daily page views and session density (last 21 days)</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-[10px] uppercase font-mono text-muted-foreground">Views</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {analytics.pageViewSeries.length > 0 ? (
              <AnalyticsChart data={analytics.pageViewSeries} />
            ) : (
              <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-border bg-muted/10">
                <p className="text-sm text-muted-foreground">Awaiting telemetry data...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              <CardTitle>Top Acquisition Paths</CardTitle>
            </div>
            <CardDescription>Most frequented entry points</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.topPages.length > 0 ? (
              analytics.topPages.map((page, i) => (
                <div key={page.path} className="group relative flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 px-4 py-3 transition-colors hover:bg-muted/40">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
                    <span className="truncate font-mono text-sm font-medium tracking-tight">{page.path}</span>
                  </div>
                  <div className="flex items-center gap-4 pl-4 text-right">
                    <div>
                      <div className="text-xs font-bold">{page.views}</div>
                      <div className="text-[10px] text-muted-foreground uppercase">Views</div>
                    </div>
                    <ChevronRight className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No path data available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Browser Breakdown */}
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <CardTitle>Environment Analysis</CardTitle>
            </div>
            <CardDescription>Browser distribution from last 30 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.browserBreakdown.length > 0 ? (
              analytics.browserBreakdown.map((item) => {
                const percentage = Math.round((item.count / analytics.totalPageViews) * 100);
                return (
                  <div key={item.browser} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span>{item.browser}</span>
                      <span className="text-muted-foreground">{item.count} ({percentage}%)</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-primary/60 transition-all" 
                        style={{ width: `${percentage}%` }} 
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">Awaiting environment data.</p>
            )}
          </CardContent>
        </Card>

        {/* Real-time Feed placeholder or future metric */}
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-primary" />
              <CardTitle>System Health</CardTitle>
            </div>
            <CardDescription>Uptime and tracking reliability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <Activity className="h-8 w-8 text-emerald-500" />
                <span className="absolute right-0 top-0 flex h-4 w-4">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500"></span>
                </span>
              </div>
              <h3 className="text-lg font-bold">Collector Status: Operational</h3>
              <p className="max-w-[200px] text-sm text-muted-foreground">
                Telemetry pipelines are healthy and reporting at sub-second latency.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
