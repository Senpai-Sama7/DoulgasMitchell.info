'use client';

import { useEffect, useState } from 'react';
import { Activity, Compass, Loader2, Mail, Search, Users } from 'lucide-react';
import { AnalyticsChart } from '@/components/admin/analytics-chart';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPercent, type ForecastPoint } from '@/lib/decision-intelligence';

interface AnalyticsData {
  totalViews: number;
  uniqueVisitors: number;
  contactSubmissions: number;
  topPages: Array<{ path: string; views: number; uniqueVisitors: number }>;
  pageViewSeries: ForecastPoint[];
  forecast: {
    expectedTotal: number;
    lowerBound: number;
    upperBound: number;
    confidence: number;
  } | null;
  calibration: {
    coverage: number;
    targetCoverage: number;
    ece: number;
  } | null;
  contactRatePosterior: {
    mean: number;
  } | null;
  decision: {
    label: string;
    action: 'proceed' | 'conditional' | 'defer' | 'refuse';
    rationale: string;
  } | null;
}

function decisionTone(action: 'proceed' | 'conditional' | 'defer' | 'refuse' | undefined) {
  switch (action) {
    case 'proceed':
      return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-200';
    case 'conditional':
      return 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-200';
    case 'defer':
    case 'refuse':
      return 'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-200';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
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
          setData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    void fetchAnalytics();
  }, [days]);

  if (loading && !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const summaryCards = [
    {
      label: 'Page views',
      value: data.totalViews.toLocaleString(),
      icon: Activity,
      description: `Windowed traffic for the last ${days} days.`,
    },
    {
      label: 'Unique sessions',
      value: data.uniqueVisitors.toLocaleString(),
      icon: Users,
      description: 'Distinct anonymous sessions in the active window.',
    },
    {
      label: 'Forecast next 7d',
      value: data.forecast ? data.forecast.expectedTotal.toLocaleString() : 'n/a',
      icon: Compass,
      description: data.forecast
        ? `${data.forecast.lowerBound.toLocaleString()} to ${data.forecast.upperBound.toLocaleString()} views`
        : 'Need more history before forecasting.',
    },
    {
      label: 'Contact posterior',
      value: data.contactRatePosterior ? formatPercent(data.contactRatePosterior.mean, 2) : 'n/a',
      icon: Mail,
      description: 'Posterior mean contact rate per page view.',
    },
  ];

  return (
    <div className="space-y-6 @container">
      <div className="grid grid-cols-1 gap-4 @sm:grid-cols-2 @2xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="bg-muted/30 border-none shadow-none">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider">
                <card.icon className="h-3 w-3" /> {card.label}
              </CardDescription>
              <CardTitle className="text-2xl font-mono tabular-nums">{card.value}</CardTitle>
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {card.description}
              </p>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 @xl:grid-cols-3">
        <Card className="@xl:col-span-2 bg-card/50 backdrop-blur-sm border-muted-foreground/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-mono uppercase tracking-tight">
                  Forecast Surface
                </CardTitle>
                <CardDescription>
                  Observed traffic with projected extension and interval band.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {[7, 30, 90].map((window) => (
                  <Badge
                    key={window}
                    variant={days === window ? 'default' : 'outline'}
                    className="cursor-pointer font-mono"
                    onClick={() => setDays(window)}
                  >
                    {window}D
                  </Badge>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AnalyticsChart data={data.pageViewSeries} />
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-muted-foreground/10">
          <CardHeader>
            <CardTitle className="text-base font-mono uppercase tracking-tight font-bold">
              Decision Posture
            </CardTitle>
            <CardDescription>Calibration and recommendation tier for the current telemetry window.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.decision ? (
              <>
                <Badge className={decisionTone(data.decision.action)} variant="outline">
                  {data.decision.label}
                </Badge>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {data.decision.rationale}
                </p>
              </>
            ) : null}

            {data.calibration ? (
              <div className="space-y-3">
                <div className="rounded-2xl border border-border/60 p-3">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Coverage vs target
                  </div>
                  <div className="mt-2 text-2xl font-semibold">
                    {formatPercent(data.calibration.coverage)}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Target {formatPercent(data.calibration.targetCoverage)}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 p-3">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    ECE-style error
                  </div>
                  <div className="mt-2 text-2xl font-semibold">
                    {data.calibration.ece.toFixed(3)}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                More history is needed before calibration can be estimated.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm border-muted-foreground/10">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-mono uppercase tracking-tight font-bold">
              Top Entry Points
            </CardTitle>
          </div>
          <CardDescription>Most visited paths in the active window.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topPages.map((page, index) => (
              <div key={page.path} className="flex items-center justify-between group">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-4 text-[10px] font-mono text-muted-foreground">
                    {index + 1}.
                  </span>
                  <span className="truncate text-sm font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                    {page.path === '/' ? '/home' : page.path}
                  </span>
                </div>
                <Badge variant="secondary" className="ml-2 shrink-0 font-mono text-[10px]">
                  {page.views}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
