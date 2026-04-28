import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';
import {
  buildBeliefState,
  buildCausalExperimentRecommendations,
  buildDecisionRecommendation,
  buildForecastIntelligence,
  type BeliefState,
  type CalibrationSummary,
  type CausalExperimentRecommendation,
  type DecisionRecommendation,
  type ForecastPoint,
  type ForecastSummary,
} from '@/lib/decision-intelligence';
import { hasTable, getTableColumns, quoteIdentifier } from '@/lib/db-introspection';
import { countNewsletterSubscribers } from '@/lib/operational-compat';
import { getAnonymousFingerprint, getClientIp, getUserAgent } from '@/lib/request';

interface PageViewInput {
  path: string;
  referrer?: string;
  request: NextRequest;
  duration?: number;
}

export interface AnalyticsSummary {
  totalViews: number;
  uniqueVisitors: number;
  contactSubmissions: number;
  newsletterSubscribers: number;
  topPages: Array<{ path: string; views: number; uniqueVisitors: number }>;
  dailyViews: Array<{ date: string; views: number; sessions: number }>;
  pageViewSeries: ForecastPoint[];
  browserBreakdown: Array<{ browser: string; count: number }>;
  deviceBreakdown: Array<{ device: string; count: number }>;
  forecast: ForecastSummary | null;
  calibration: CalibrationSummary | null;
  contactRatePosterior: BeliefState | null;
  decision: DecisionRecommendation | null;
  experiments: CausalExperimentRecommendation[];
}

function detectBrowser(userAgent: string | null | undefined) {
  const ua = userAgent || 'unknown';

  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edg')) return 'Edge';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  return 'Other';
}

function detectDevice(userAgent: string | null | undefined) {
  const ua = (userAgent || '').toLowerCase();

  if (ua.includes('ipad') || ua.includes('tablet')) return 'Tablet';
  if (ua.includes('mobi') || ua.includes('iphone') || ua.includes('android')) return 'Mobile';
  return 'Desktop';
}

async function getContactCounts(startDate: Date) {
  if (await hasTable('ContactSubmission')) {
    const [totalRows, seriesRows] = await Promise.all([
      db.$queryRaw<Array<{ count: bigint | number | string }>>`
        SELECT COUNT(*)::bigint AS count
        FROM "ContactSubmission"
        WHERE "createdAt" >= ${startDate}
      `,
      db.$queryRaw<Array<{ date: string; count: bigint | number | string }>>`
        SELECT DATE("createdAt")::text AS date, COUNT(*)::bigint AS count
        FROM "ContactSubmission"
        WHERE "createdAt" >= ${startDate}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
    ]);

    return {
      total: Number(totalRows[0]?.count ?? 0),
      series: seriesRows.map((row) => ({
        date: row.date,
        count: Number(row.count ?? 0),
      })),
    };
  }

  if (await hasTable('ContactMessage')) {
    const [totalRows, seriesRows] = await Promise.all([
      db.$queryRaw<Array<{ count: bigint | number | string }>>`
        SELECT COUNT(*)::bigint AS count
        FROM "ContactMessage"
        WHERE "createdAt" >= ${startDate}
      `,
      db.$queryRaw<Array<{ date: string; count: bigint | number | string }>>`
        SELECT DATE("createdAt")::text AS date, COUNT(*)::bigint AS count
        FROM "ContactMessage"
        WHERE "createdAt" >= ${startDate}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
    ]);

    return {
      total: Number(totalRows[0]?.count ?? 0),
      series: seriesRows.map((row) => ({
        date: row.date,
        count: Number(row.count ?? 0),
      })),
    };
  }

  return {
    total: 0,
    series: [] as Array<{ date: string; count: number }>,
  };
}

export async function logPageView(input: PageViewInput) {
  try {
    const columns = await getTableColumns('PageView');
    if (columns.size === 0) {
      return;
    }

    const id = crypto.randomUUID();
    const sessionId = await getAnonymousFingerprint(input.request);
    const ipAddress = getClientIp(input.request);
    const userAgent = getUserAgent(input.request);

    const insertColumns = ['id', 'path', 'sessionId', 'createdAt'];
    const values: unknown[] = [id, input.path, sessionId, new Date()];

    const optionalFields: Record<string, unknown> = {
      referrer: input.referrer || null,
      userAgent,
      ipAddress,
      duration: input.duration || null,
    };

    for (const [column, value] of Object.entries(optionalFields)) {
      if (columns.has(column) && value !== undefined) {
        insertColumns.push(column);
        values.push(value);
      }
    }

    const placeholders = insertColumns.map((_, index) => `$${index + 1}`).join(', ');
    const columnList = insertColumns.map(quoteIdentifier).join(', ');

    await db.$executeRawUnsafe(
      `INSERT INTO "PageView" (${columnList}) VALUES (${placeholders})`,
      ...values
    );
  } catch (error) {
    logger.error('Failed to log page view:', error);
  }
}

export async function getAnalyticsSummary(days = 30): Promise<AnalyticsSummary | null> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const newsletterSubscribers = await countNewsletterSubscribers();

    if (!(await hasTable('PageView'))) {
      return {
        totalViews: 0,
        uniqueVisitors: 0,
        contactSubmissions: 0,
        newsletterSubscribers,
        topPages: [],
        dailyViews: [],
        pageViewSeries: [],
        browserBreakdown: [],
        deviceBreakdown: [],
        forecast: null,
        calibration: null,
        contactRatePosterior: null,
        decision: null,
        experiments: [],
      };
    }

    const [pageViews, uniqueVisitors, topPagesRaw, contactCounts] = await Promise.all([
      db.pageView.findMany({
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: 'asc' },
      }),
      db.pageView
        .groupBy({
          by: ['sessionId'],
          where: { createdAt: { gte: startDate } },
        })
        .then((groups) => groups.length),
      db.pageView.groupBy({
        by: ['path'],
        where: { createdAt: { gte: startDate } },
        _count: { path: true },
        orderBy: { _count: { path: 'desc' } },
        take: 10,
      }),
      getContactCounts(startDate),
    ]);

    const totalViews = pageViews.length;
    const topPages = topPagesRaw.map((page) => {
      const sessions = new Set(
        pageViews
          .filter((pageView) => pageView.path === page.path)
          .map((pageView) => pageView.sessionId)
      );

      return {
        path: page.path,
        views: page._count.path,
        uniqueVisitors: sessions.size,
      };
    });

    const seriesMap = pageViews.reduce<Record<string, { views: number; sessions: Set<string> }>>(
      (accumulator, pageView) => {
        const date = pageView.createdAt.toISOString().slice(0, 10);
        if (!accumulator[date]) {
          accumulator[date] = {
            views: 0,
            sessions: new Set<string>(),
          };
        }
        accumulator[date].views += 1;
        accumulator[date].sessions.add(pageView.sessionId);
        return accumulator;
      },
      {}
    );

    const dailyViews = Object.entries(seriesMap)
      .map(([date, data]) => ({
        date,
        views: data.views,
        sessions: data.sessions.size,
      }))
      .sort((left, right) => left.date.localeCompare(right.date));

    const forecastBundle = buildForecastIntelligence(
      dailyViews.map((day) => ({
        date: day.date,
        value: day.views,
      })),
      {
        horizonDays: 7,
        targetCoverage: 0.8,
      }
    );

    const browserBreakdown = Object.entries(
      pageViews.reduce<Record<string, number>>((accumulator, pageView) => {
        const browser = detectBrowser(pageView.userAgent);
        accumulator[browser] = (accumulator[browser] || 0) + 1;
        return accumulator;
      }, {})
    )
      .map(([browser, count]) => ({ browser, count }))
      .sort((left, right) => right.count - left.count);

    const deviceBreakdown = Object.entries(
      pageViews.reduce<Record<string, number>>((accumulator, pageView) => {
        const device = detectDevice(pageView.userAgent);
        accumulator[device] = (accumulator[device] || 0) + 1;
        return accumulator;
      }, {})
    )
      .map(([device, count]) => ({ device, count }))
      .sort((left, right) => right.count - left.count);

    const contactRatePosterior =
      totalViews > 0
        ? buildBeliefState(contactCounts.total, Math.max(0, totalViews - contactCounts.total))
        : null;
    const missingInformation: string[] = [];

    if ((forecastBundle.calibration?.coverage ?? 0) < 0.72) {
      missingInformation.push('More daily traffic history is needed to tighten the forecast coverage.');
    }
    if (contactCounts.total < 5) {
      missingInformation.push('There are too few recent contact submissions to trust conversion-rate shifts.');
    }

    const decision =
      forecastBundle.forecast && forecastBundle.calibration
        ? buildDecisionRecommendation(
            forecastBundle.forecast.confidence,
            {
              conditionalThreshold: 0.68,
              deferThreshold: 0.45,
            },
            {
              missingInformation,
              rationale:
                forecastBundle.calibration.coverage < 0.72
                  ? 'Forecast coverage is below the target band, so any intervention should be treated as conditional until more evidence accumulates.'
                  : 'Forecast coverage is holding well enough to guide prioritization while still exposing uncertainty explicitly.',
            }
          )
        : null;

    const experiments =
      forecastBundle.forecast && forecastBundle.calibration
        ? buildCausalExperimentRecommendations({
            topPaths: topPages.map((page) => ({
              path: page.path,
              views: page.views,
            })),
            contactRate: contactRatePosterior?.mean ?? 0,
            forecastConfidence: forecastBundle.forecast.confidence,
            coverage: forecastBundle.calibration.coverage,
          })
        : [];

    return {
      totalViews,
      uniqueVisitors,
      contactSubmissions: contactCounts.total,
      newsletterSubscribers,
      topPages,
      dailyViews,
      pageViewSeries: forecastBundle.points,
      browserBreakdown,
      deviceBreakdown,
      forecast: forecastBundle.forecast,
      calibration: forecastBundle.calibration,
      contactRatePosterior,
      decision,
      experiments,
    };
  } catch (error) {
    logger.error('Failed to retrieve analytics:', error);
    return null;
  }
}
