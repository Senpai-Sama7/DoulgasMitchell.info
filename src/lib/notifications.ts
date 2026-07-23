import { db } from '@/lib/db';
import { logger } from './logger';
import { logActivity } from '@/lib/activity';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Administrative Notification Service
 * Handles the creation and management of system-wide alerts for administrators.
 */
export const NotificationService = {
  /**
   * Create a new administrative notification.
   * Persistent storage is currently the ActivityLog with a 'notification' flag.
   */
  async notify(input: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const notification: Notification = {
      ...input,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
    };

    // Log the notification as an activity for persistence and audit
    await logActivity({
      action: 'ADMIN_NOTIFICATION',
      resource: 'System',
      resourceId: notification.id,
      details: {
        type: notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        ...notification.metadata
      }
    });

    return notification;
  },

  /**
   * Retrieve the latest notifications for the admin dashboard.
   */
  async getLatest(limit = 10): Promise<Notification[]> {
    try {
      // Fetch notifications from the ActivityLog
      const logs = await db.activityLog.findMany({
        where: {
          action: 'ADMIN_NOTIFICATION'
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      });

      return logs.map(log => {
        // Parse per-row so one malformed record cannot drop the whole list.
        const details = parseNotificationDetails(log.details);

        return {
          id: log.resourceId || log.id,
          type: normalizeNotificationType(details.type),
          title: typeof details.title === 'string' && details.title ? details.title : 'System Notification',
          message: typeof details.message === 'string' ? details.message : '',
          timestamp: log.createdAt,
          read: Boolean(details.read),
          link: typeof details.link === 'string' ? details.link : undefined,
          metadata: details
        };
      });
    } catch (error) {
      logger.error('Failed to fetch notifications:', error);
      return [];
    }
  }
};

function parseNotificationDetails(details: unknown): Record<string, unknown> {
  if (typeof details === 'string') {
    try {
      const parsed = JSON.parse(details) as unknown;
      return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  return details && typeof details === 'object' ? (details as Record<string, unknown>) : {};
}

function normalizeNotificationType(type: unknown): Notification['type'] {
  return type === 'success' || type === 'warning' || type === 'error' ? type : 'info';
}
