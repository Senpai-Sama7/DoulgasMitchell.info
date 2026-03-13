import { db } from '@/lib/db';
import { logActivity } from '@/lib/activity';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
  metadata?: Record<string, any>;
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
        const details = typeof log.details === 'string' 
          ? JSON.parse(log.details) 
          : (log.details as any || {});
        
        return {
          id: log.resourceId || log.id,
          type: details.type || 'info',
          title: details.title || 'System Notification',
          message: details.message || '',
          timestamp: log.createdAt,
          read: !!details.read,
          link: details.link,
          metadata: details
        };
      });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  }
};
