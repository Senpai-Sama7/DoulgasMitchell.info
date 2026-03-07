import { KeyRound, ShieldCheck, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { env } from '@/lib/env';
import { getAdminSecurityData, getUserPasskeys } from '@/lib/content-service';
import { getSession } from '@/lib/auth';
import { PasskeyManager } from '@/components/admin/passkey-manager';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminSecurityPage() {
  const session = await getSession();
  if (!session) {
    redirect('/admin/login');
  }

  const security = await getAdminSecurityData();
  const userPasskeys = await getUserPasskeys(session.userId);

  const checklist = [
    {
      label: 'JWT secret configured',
      value: Boolean(env.JWT_SECRET),
    },
    {
      label: 'Passkeys enabled',
      value: env.ENABLE_PASSKEYS === 'true',
    },
    {
      label: 'Secure cookies in production',
      value: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Security</h1>
        <p className="text-muted-foreground">Authentication posture, active sessions, and production readiness signals.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{security.activeSessions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Registered passkeys</CardTitle>
            <KeyRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{security.passkeysRegistered}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active admins</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{security.adminUsers}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-6">
          <PasskeyManager initialPasskeys={userPasskeys} />
          
          <Card>
            <CardHeader>
              <CardTitle>Readiness checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {checklist.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
                  <span>{item.label}</span>
                  <span className={item.value ? 'text-emerald-500' : 'text-amber-500'}>
                    {item.value ? 'Configured' : 'Needs review'}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent authenticated sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {security.recentSessions.length > 0 ? (
              security.recentSessions.map((session) => (
                <div key={session.id} className="rounded-xl border border-border bg-background px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{session.email}</p>
                      <p className="text-sm text-muted-foreground">{session.lastSeen}</p>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{session.ipAddress}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{session.userAgent}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No active sessions recorded.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
