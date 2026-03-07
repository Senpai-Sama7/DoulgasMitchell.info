import { Activity, Mail, Newspaper, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsChart } from '@/components/admin/analytics-chart';
import { getAdminAnalyticsData } from '@/lib/content-service';

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const analytics = await getAdminAnalyticsData();

  const summaryCards = [
    { label: 'Page views', value: analytics.totalPageViews, icon: Activity },
    { label: 'Unique sessions', value: analytics.uniqueSessions, icon: Users },
    { label: 'Contacts', value: analytics.contactSubmissions, icon: Mail },
    { label: 'Subscribers', value: analytics.newsletterSubscribers, icon: Newspaper },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Visibility, audience capture, and the strongest-performing paths.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Page views over time</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.pageViewSeries.length > 0 ? (
              <AnalyticsChart data={analytics.pageViewSeries} />
            ) : (
              <p className="text-sm text-muted-foreground">No analytics data yet. Views will appear once the tracker records traffic.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top pages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.topPages.length > 0 ? (
              analytics.topPages.map((page) => (
                <div key={page.path} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
                  <span className="font-mono text-sm text-muted-foreground">{page.path}</span>
                  <span className="text-sm font-medium">{page.views}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No ranked pages yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
