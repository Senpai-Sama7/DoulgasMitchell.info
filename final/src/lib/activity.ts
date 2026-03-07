import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getClientIp, getUserAgent } from '@/lib/request';

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
    await db.activityLog.create({
      data: {
        action: input.action,
        resource: input.resource,
        resourceId: input.resourceId,
        details: input.details ? JSON.stringify(input.details) : undefined,
        userId: input.userId,
        ipAddress: input.request ? getClientIp(input.request) : undefined,
        userAgent: input.request ? getUserAgent(input.request) : undefined,
      },
    });
  } catch {
    return;
  }
}
