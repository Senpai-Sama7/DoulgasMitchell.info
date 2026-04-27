#!/usr/bin/env node
/**
 * Data retention cleanup — run as a cron job (e.g., daily) to prune expired data.
 *
 * Usage:
 *   bun scripts/cleanup-retention.ts        # one-shot cleanup
 *   bun scripts/cleanup-retention.ts --dry-run  # preview counts only
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const dryRun = process.argv.includes('--dry-run');

const RETENTION = {
  // Expired sessions are deleted immediately
  expiredSessions: 'immediate',
  // Activity logs older than 90 days are pruned
  activityLogDays: 90,
  // Page views older than 180 days are pruned
  pageViewDays: 180,
  // Contact submissions older than 365 days are pruned
  contactSubmissionDays: 365,
};

async function cleanup() {
  const results: Record<string, number> = {};

  // 1. Delete expired sessions
  const expiredSessionsCount = await prisma.session.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  results.expiredSessionsDeleted = expiredSessionsCount.count;

  // 2. Prune old activity logs
  const activityCutoff = new Date(Date.now() - RETENTION.activityLogDays * 24 * 60 * 60 * 1000);
  if (dryRun) {
    results.activityLogsOlderThan90Days = await prisma.activityLog.count({
      where: { createdAt: { lt: activityCutoff } },
    });
  } else {
    const deleted = await prisma.activityLog.deleteMany({
      where: { createdAt: { lt: activityCutoff } },
    });
    results.activityLogsDeleted = deleted.count;
  }

  // 3. Prune old page views
  const pageViewCutoff = new Date(Date.now() - RETENTION.pageViewDays * 24 * 60 * 60 * 1000);
  if (dryRun) {
    results.pageViewsOlderThan180Days = await prisma.pageView.count({
      where: { createdAt: { lt: pageViewCutoff } },
    });
  } else {
    const deleted = await prisma.pageView.deleteMany({
      where: { createdAt: { lt: pageViewCutoff } },
    });
    results.pageViewsDeleted = deleted.count;
  }

  // 4. Prune old contact submissions
  const contactCutoff = new Date(
    Date.now() - RETENTION.contactSubmissionDays * 24 * 60 * 60 * 1000
  );
  if (dryRun) {
    results.contactsOlderThan365Days = await prisma.contactSubmission.count({
      where: { createdAt: { lt: contactCutoff } },
    });
  } else {
    const deleted = await prisma.contactSubmission.deleteMany({
      where: { createdAt: { lt: contactCutoff } },
    });
    results.contactsDeleted = deleted.count;
  }

  return results;
}

cleanup()
  .then((results) => {
    console.log('Retention cleanup complete:');
    console.table(results);
  })
  .catch((err) => {
    console.error('Retention cleanup failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
