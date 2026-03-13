import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getClientIp, getUserAgent } from '@/lib/request';
import { getTableColumns, quoteIdentifier } from '@/lib/db-introspection';

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

    if (input.resourceId && columns.has('resourceId')) {
      insertColumns.push('resourceId');
      values.push(input.resourceId);
    }

    if (input.details && columns.has('details')) {
      insertColumns.push('details');
      values.push(JSON.stringify(input.details));
    }

    if (input.userId && columns.has('userId')) {
      insertColumns.push('userId');
      values.push(input.userId);
    }

    if (input.request && columns.has('ipAddress')) {
      insertColumns.push('ipAddress');
      values.push(getClientIp(input.request));
    }

    if (input.request && columns.has('userAgent')) {
      insertColumns.push('userAgent');
      values.push(getUserAgent(input.request));
    }

    if (columns.has('createdAt')) {
      insertColumns.push('createdAt');
      values.push(new Date());
    }

    const placeholders = insertColumns.map((_, index) => `$${index + 1}`).join(', ');
    const columnList = insertColumns.map(quoteIdentifier).join(', ');

    await db.$executeRawUnsafe(
      `INSERT INTO "ActivityLog" (${columnList}) VALUES (${placeholders})`,
      ...values
    );
  } catch {
    return;
  }
}
