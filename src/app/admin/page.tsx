import Link from 'next/link';
import {
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Mail,
  Eye,
  Shield,
  Plus,
  ArrowUpRight,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAdminDashboardData } from '@/lib/content-service';
import { AdminAIAgent } from '@/components/admin/ai/ai-agent';

export const revalidate = 60; // Refresh dashboard data every 60 seconds

export default async function AdminDashboard() {
  const { stats, recentActivity } = await getAdminDashboardData();

  const statCards = [
    {
      title: 'Articles',
      value: stats.articles,
      icon: FileText,
      helper: 'Published and draft long-form content',
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      title: 'Projects',
      value: stats.projects,
      icon: FolderOpen,
      helper: 'Case studies and showcase entries',
      color: 'bg-emerald-500/10 text-emerald-500',
    },
    {
      title: 'Media Files',
      value: stats.media,
      icon: ImageIcon,
      helper: 'Assets available for the editorial system',
      color: 'bg-purple-500/10 text-purple-500',
    },
    {
      title: 'Contacts',
      value: stats.contacts,
      icon: Mail,
      helper: 'Messages captured from the live site',
      color: 'bg-orange-500/10 text-orange-500',
    },
    {
      title: 'Total Views',
      value: stats.pageViews.toLocaleString(),
      icon: Eye,
      helper: 'Tracked portfolio page views',
      color: 'bg-pink-500/10 text-pink-500',
    },
    {
      title: 'Subscribers',
      value: stats.subscribers,
      icon: Users,
      helper: 'Newsletter audience captured from the site',
      color: 'bg-cyan-500/10 text-cyan-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Live operating view for content, audience, and platform activity.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/" target="_blank">
            <Eye className="h-4 w-4 mr-2" />
            Preview Site
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/content">
            <Plus className="h-4 w-4 mr-2" />
            Manage Content
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="mt-2 text-xs text-muted-foreground">{stat.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/admin/analytics">
                    View analytics
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                    Activity will populate as visitors engage with the site and admins publish updates.
                  </div>
                ) : recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium">
                        {activity.actor[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.action}</span>{' '}
                        <span className="text-muted-foreground">{activity.resource}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.relativeTime} • {activity.actor}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & System Status */}
        <div className="space-y-6">
          {/* AI Agent */}
          <AdminAIAgent />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-between" asChild>
                <Link href="/admin/content">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Content library
                </span>
                <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-between" asChild>
                <Link href="/admin/media">
                <span className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Upload Media
                </span>
                <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-between" asChild>
                <Link href="/admin/security">
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security posture
                </span>
                <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* System Snapshot */}
          <Card>
            <CardHeader>
              <CardTitle>System Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Audience capture</span>
                <span className="font-medium text-foreground">{stats.contacts + stats.subscribers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Content depth</span>
                <span className="font-medium text-foreground">{stats.articles + stats.projects} items</span>
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <span>Visibility tracking</span>
                <span className="font-medium text-foreground">{stats.pageViews} page views</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
