'use client';

import { useCallback, useState } from 'react';
import { Bell, Loader2, RefreshCw } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { adminFetch } from '@/lib/admin-api-client';
import { cn } from '@/lib/utils';

interface AdminNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

interface NotificationsResponse {
  notifications: AdminNotification[];
}

const typeDotClass: Record<AdminNotification['type'], string> = {
  info: 'bg-blue-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
};

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return formatDistanceToNowStrict(date, { addSuffix: true });
}

export function NotificationsBell() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch<NotificationsResponse>('/api/admin/notifications');
      setNotifications(data.notifications ?? []);
      setHasLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpenChange = (open: boolean) => {
    if (open && !loading) {
      void loadNotifications();
    }
  };

  const hasUnread = notifications.some((notification) => !notification.read);

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {hasUnread ? (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
            Notifications
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(event) => {
              event.preventDefault();
              void loadNotifications();
            }}
            disabled={loading}
            aria-label="Refresh notifications"
          >
            <RefreshCw className={cn('h-3 w-3', loading && 'animate-spin')} />
          </Button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading && !hasLoaded ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading notifications...
            </div>
          ) : error ? (
            <div className="space-y-3 px-4 py-6 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={() => void loadNotifications()}>
                Retry
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No notifications yet. System events and content changes will appear here.
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start gap-3 border-b border-border/50 px-3 py-3 last:border-b-0 hover:bg-muted/40"
              >
                <span
                  className={cn(
                    'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                    typeDotClass[notification.type] ?? typeDotClass.info
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{notification.title}</p>
                  {notification.message ? (
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {notification.message}
                    </p>
                  ) : null}
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground/70">
                    {formatTimestamp(notification.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
