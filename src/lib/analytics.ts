import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getClientIp, getUserAgent, getAnonymousFingerprint } from '@/lib/request';
import { getTableColumns, quoteIdentifier } from '@/lib/db-introspection';

interface PageViewInput {
  path: string;
  referrer?: string;
  request: NextRequest;
  duration?: number;
}

/**
 * Logs a page view to the database with anonymity preservation.
 */
export async function logPageView(input: PageViewInput) {
  try {
    const columns = await getTableColumns('PageView');
    if (columns.size === 0) {
      // Table might not exist yet or DB is unavailable
      return;
    }

    const id = crypto.randomUUID();
    const sessionId = getAnonymousFingerprint(input.request);
    const ipAddress = getClientIp(input.request);
    const userAgent = getUserAgent(input.request);
    
    const insertColumns = ['id', 'path', 'sessionId', 'createdAt'];
    const values: unknown[] = [id, input.path, sessionId, new Date()];

    // Map of optional columns to their values
    const optionalFields: Record<string, unknown> = {
      referrer: input.referrer || null,
      userAgent,
      ipAddress,
      duration: input.duration || null,
    };

    // Only include columns that actually exist in the DB schema
    for (const [col, val] of Object.entries(optionalFields)) {
      if (columns.has(col) && val !== undefined) {
        insertColumns.push(col);
        values.push(val);
      }
    }

    const placeholders = insertColumns.map((_, index) => `$${index + 1}`).join(', ');
    const columnList = insertColumns.map(quoteIdentifier).join(', ');

    // Use $executeRawUnsafe with manual escaping for identifiers and parameterized values
    await db.$executeRawUnsafe(
      `INSERT INTO "PageView" (${columnList}) VALUES (${placeholders})`,
      ...values
    );
  } catch (error) {
    // Silently fail to avoid breaking the main request flow
    console.error('Failed to log page view:', error);
  }
}

/**
 * Retrieves aggregate analytics for the dashboard.
 */
export async function getAnalyticsSummary(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const [totalViews, uniqueVisitors, topPages] = await Promise.all([
      db.pageView.count({
        where: { createdAt: { gte: startDate } }
      }),
      db.pageView.groupBy({
        by: ['sessionId'],
        where: { createdAt: { gte: startDate } },
        _count: true
      }).then(groups => groups.length),
      db.pageView.groupBy({
        by: ['path'],
        where: { createdAt: { gte: startDate } },
        _count: { path: true },
        orderBy: { _count: { path: 'desc' } },
        take: 10
      })
    ]);

    // Get daily views for the chart
    const dailyViews = await db.$queryRaw`
      SELECT 
        DATE("createdAt") as date, 
        COUNT(*) as views
      FROM "PageView"
      WHERE "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    return {
      totalViews,
      uniqueVisitors,
      topPages: topPages.map(p => ({ path: p.path, count: p._count.path })),
      dailyViews
    };
  } catch (error) {
    console.error('Failed to retrieve analytics:', error);
    return null;
  }
}
