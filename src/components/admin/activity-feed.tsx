'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Clock, 
  X,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Notification } from '@/lib/notifications';
import { logger } from '@/lib/logger';

interface ActivityFeedProps {
  initialNotifications?: Notification[];
  className?: string;
}

export function ActivityFeed({ initialNotifications = [], className }: ActivityFeedProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [loading, setLoading] = useState(!initialNotifications.length);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/admin/notifications');
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
        }
      } catch (error) {
        logger.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!initialNotifications.length) {
      fetchNotifications();
    }
  }, [initialNotifications]);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-zinc-400" />
          <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-300">Activity Feed</h3>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">LIVE_AUDIT_STREAM</span>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 w-full animate-pulse bg-zinc-900/50 border border-zinc-800 rounded-sm" />
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <AnimatePresence initial={false}>
            {notifications.map((notification) => (
              <motion.div
                key={notification.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "p-3 rounded-sm border border-zinc-800 bg-zinc-900/30 transition-colors group",
                  !notification.read && "border-zinc-700 bg-zinc-900/50"
                )}
              >
                <div className="flex gap-3">
                  <div className="mt-0.5 shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium text-zinc-200 truncate leading-tight">
                        {notification.title}
                      </p>
                      <time className="text-[10px] text-zinc-500 font-mono whitespace-nowrap flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                      </time>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {notification.message}
                    </p>
                    {notification.link && (
                      <a 
                        href={notification.link}
                        className="mt-2 inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-white transition-colors uppercase tracking-widest font-mono group"
                      >
                        Details <ExternalLink className="w-2.5 h-2.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="py-8 text-center border border-dashed border-zinc-800 rounded-sm">
            <p className="text-xs text-zinc-500 font-mono">NO_RECENT_ACTIVITY</p>
          </div>
        )}
      </div>
    </div>
  );
}
