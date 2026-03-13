import {
  Activity,
  BrainCircuit,
  Compass,
  FlaskConical,
  Globe,
  Mail,
  Search,
  Users,
} from 'lucide-react';
import { AnalyticsChart } from '@/components/admin/analytics-chart';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPercent } from '@/lib/decision-intelligence';
import { getAdminAnalyticsData } from '@/lib/content-service';
import { runPublicAssistantBenchmark } from '@/lib/public-assistant-benchmark';

export const dynamic = 'force-dynamic';

function decisionTone(action: string | undefined) {
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

export default async function AdminAnalyticsPage() {
  const [analytics, benchmark] = await Promise.all([
    getAdminAnalyticsData(),
    runPublicAssistantBenchmark(),
  ]);

  const summaryCards = [
    {
      label: 'Window page views',
      value: analytics.totalPageViews.toLocaleString(),
      icon: Activity,
      description: 'Last 30 days of page-view telemetry.',
    },
    {
      label: 'Unique sessions',
      value: analytics.uniqueSessions.toLocaleString(),
      icon: Users,
      description: 'Distinct anonymous visitor fingerprints in-window.',
    },
    {
      label: 'Forecast next 7d',
      value: analytics.forecast ? analytics.forecast.expectedTotal.toLocaleString() : 'n/a',
      icon: Compass,
      description: analytics.forecast
        ? `${analytics.forecast.lowerBound.toLocaleString()} to ${analytics.forecast.upperBound.toLocaleString()} views`
        : 'Need more history before forecasting.',
    },
    {
      label: 'Contact posterior',
      value: analytics.contactRatePosterior
        ? formatPercent(analytics.contactRatePosterior.mean, 2)
        : 'n/a',
      icon: Mail,
      description: analytics.contactRatePosterior
        ? `${formatPercent(analytics.contactRatePosterior.lowerBound, 2)} to ${formatPercent(analytics.contactRatePosterior.upperBound, 2)} per page view`
        : 'Need page-view and contact history to estimate conversion.',
    },
  ];

  return (
    <div className="space-y-8 p-1">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Decision Intelligence</h1>
        <p className="text-muted-foreground">
          Forecast, calibrate, decide, and queue causal experiments from the same telemetry surface.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="overflow-hidden border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {card.label}
              </CardTitle>
              <card.icon className="h-4 w-4 text-primary/70" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
              <p className="mt-1 text-[10px] uppercase tracking-tight text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2 border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Traffic + Forecast Band</CardTitle>
                <CardDescription>
                  Observed views with a 7-day projected extension and uncertainty band.
                </CardDescription>
              </div>
              {analytics.forecast ? (
                <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-[0.16em]">
                  {Math.round(analytics.forecast.confidence * 100)}% forecast confidence
                </Badge>
              ) : null}
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

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle>Decision Posture</CardTitle>
            <CardDescription>
              Use calibration and forecast confidence before changing the site.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.decision ? (
              <>
                <Badge className={decisionTone(analytics.decision.action)} variant="outline">
                  {analytics.decision.label}
                </Badge>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {analytics.decision.rationale}
                </p>
                <div className="grid gap-3">
                  <div className="rounded-2xl border border-border/60 p-3">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      Empirical coverage
                    </div>
                    <div className="mt-2 text-2xl font-semibold">
                      {analytics.calibration ? formatPercent(analytics.calibration.coverage) : 'n/a'}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Target {analytics.calibration ? formatPercent(analytics.calibration.targetCoverage) : 'n/a'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/60 p-3">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      Calibration error
                    </div>
                    <div className="mt-2 text-2xl font-semibold">
                      {analytics.calibration ? analytics.calibration.ece.toFixed(3) : 'n/a'}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Lower is better. This is the gap between forecast confidence and observed correctness.
                    </p>
                  </div>
                </div>
                {analytics.decision.requiredEvidence.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      What tightens confidence
                    </div>
                    {analytics.decision.requiredEvidence.map((item) => (
                      <p key={item} className="text-xs leading-relaxed text-muted-foreground">
                        {item}
                      </p>
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                More telemetry is needed before the dashboard can recommend a decision tier.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              <CardTitle>Top Acquisition Paths</CardTitle>
            </div>
            <CardDescription>Most frequented entry points in the active window.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.topPages.length > 0 ? (
              analytics.topPages.map((page, index) => (
                <div
                  key={page.path}
                  className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/10 px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                      0{index + 1}
                    </div>
                    <div className="truncate font-mono text-sm">{page.path}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{page.views}</div>
                    <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {page.uniqueVisitors} uniq
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No path data available.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-primary" />
              <CardTitle>Assistant Benchmark</CardTitle>
            </div>
            <CardDescription>
              Internal prompt set used to validate confidence and refusal behavior.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 p-3">
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Accuracy
                </div>
                <div className="mt-2 text-2xl font-semibold">
                  {formatPercent(benchmark.summary.accuracy)}
                </div>
              </div>
              <div className="rounded-2xl border border-border/60 p-3">
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  ECE-style error
                </div>
                <div className="mt-2 text-2xl font-semibold">
                  {benchmark.summary.ece.toFixed(3)}
                </div>
              </div>
              <div className="rounded-2xl border border-border/60 p-3">
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Mean confidence
                </div>
                <div className="mt-2 text-2xl font-semibold">
                  {formatPercent(benchmark.summary.meanConfidence)}
                </div>
              </div>
              <div className="rounded-2xl border border-border/60 p-3">
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Deferral rate
                </div>
                <div className="mt-2 text-2xl font-semibold">
                  {formatPercent(benchmark.summary.deferralRate)}
                </div>
              </div>
            </div>

            {benchmark.cases.slice(0, 4).map((benchmarkCase) => (
              <div key={benchmarkCase.id} className="rounded-2xl border border-border/60 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{benchmarkCase.query}</div>
                    <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      route {benchmarkCase.route}
                    </div>
                  </div>
                  <Badge variant="outline" className={decisionTone(benchmarkCase.correct ? 'proceed' : 'defer')}>
                    {benchmarkCase.correct ? 'pass' : 'watch'}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <CardTitle>Environment Analysis</CardTitle>
            </div>
            <CardDescription>Browser and device composition of the recent window.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Browsers
              </div>
              {analytics.browserBreakdown.map((item) => (
                <div key={item.browser} className="flex items-center justify-between text-sm">
                  <span>{item.browser}</span>
                  <span className="font-mono text-muted-foreground">{item.count}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Devices
              </div>
              {analytics.deviceBreakdown.map((item) => (
                <div key={item.device} className="flex items-center justify-between text-sm">
                  <span>{item.device}</span>
                  <span className="font-mono text-muted-foreground">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-primary" />
            <CardTitle>Causal Experiment Queue</CardTitle>
          </div>
          <CardDescription>
            Proposed interventions stated as estimands instead of correlation guesses.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 xl:grid-cols-3">
          {analytics.experiments.length > 0 ? (
            analytics.experiments.map((experiment) => (
              <div key={experiment.title} className="rounded-2xl border border-border/60 p-4">
                <h3 className="text-base font-semibold">{experiment.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {experiment.whyNow}
                </p>
                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">Intervention:</span> {experiment.intervention}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Estimand:</span> {experiment.estimand}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Primary metric:</span> {experiment.primaryMetric}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Guardrail:</span> {experiment.guardrailMetric}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              More telemetry is needed before the dashboard can prioritize experiment candidates.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
