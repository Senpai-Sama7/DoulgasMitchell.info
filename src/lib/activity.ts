import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getClientIp, getUserAgent } from '@/lib/request';
import { getTableColumns, quoteIdentifier } from '@/lib/db-introspection';
import { NotificationService } from '@/lib/notifications';

interface LogActivityInput {
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  userId?: string;
  request?: NextRequest;
}

export async function logActivity(input: LogActivityInput) {
  try {
    const columns = await getTableColumns('ActivityLog');
    if (columns.size === 0) {
      return;
    }

    const insertColumns = ['id', 'action', 'resource'];
    const values: unknown[] = [crypto.randomUUID(), input.action, input.resource];

    // Define allowed dynamic columns for audit logging
    const ALLOWED_ACTIVITY_COLUMNS = new Set([
      'resourceId', 'details', 'userId', 'ipAddress', 'userAgent', 'createdAt'
    ]);

    if (input.resourceId && columns.has('resourceId') && ALLOWED_ACTIVITY_COLUMNS.has('resourceId')) {
      insertColumns.push('resourceId');
      values.push(input.resourceId);
    }

    if (input.details && columns.has('details') && ALLOWED_ACTIVITY_COLUMNS.has('details')) {
      insertColumns.push('details');
      values.push(JSON.stringify(input.details));
    }

    if (input.userId && columns.has('userId') && ALLOWED_ACTIVITY_COLUMNS.has('userId')) {
      insertColumns.push('userId');
      values.push(input.userId);
    }

    if (input.request && columns.has('ipAddress') && ALLOWED_ACTIVITY_COLUMNS.has('ipAddress')) {
      insertColumns.push('ipAddress');
      values.push(getClientIp(input.request));
    }

    if (input.request && columns.has('userAgent') && ALLOWED_ACTIVITY_COLUMNS.has('userAgent')) {
      insertColumns.push('userAgent');
      values.push(getUserAgent(input.request));
    }

    if (columns.has('createdAt') && ALLOWED_ACTIVITY_COLUMNS.has('createdAt')) {
      insertColumns.push('createdAt');
      values.push(new Date());
    }

    const placeholders = insertColumns.map((_, index) => `$${index + 1}`).join(', ');
    const columnList = insertColumns.map(quoteIdentifier).join(', ');

    await db.$executeRawUnsafe(
      `INSERT INTO "ActivityLog" (${columnList}) VALUES (${placeholders})`,
      ...values
    );

    // Auto-notify on critical administrative actions
    const criticalActions = ['DELETE', 'UPDATE', 'CREATE', 'SETUP', 'SECURITY'];
    if (criticalActions.some(ca => input.action.toUpperCase().includes(ca))) {
      await NotificationService.notify({
        type: 'info',
        title: `Activity: ${input.action}`,
        message: `${input.resource} was ${input.action.toLowerCase()}${input.resourceId ? ` (ID: ${input.resourceId})` : ''}`,
        metadata: {
          action: input.action,
          resource: input.resource,
          resourceId: input.resourceId,
          ...input.details
        }
      });
    }
  } catch {
    return;
  }
}
