import { randomUUID } from 'node:crypto';
import { db } from '@/lib/db';
import { getTableColumns, hasTable, quoteIdentifier } from '@/lib/db-introspection';
import { sqlCount, sqlBool } from '@/lib/sql-helpers';

export async function createContactSubmissionRecord(input: {
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  source?: string | null;
}) {
  if (await hasTable('ContactSubmission')) {
    const now = new Date();
    const columns = await getTableColumns('ContactSubmission');
    const insertColumns = ['id', 'name', 'email', 'message'];
    const values: unknown[] = [randomUUID(), input.name, input.email, input.message];

    if (columns.has('subject')) {
      insertColumns.push('subject');
      values.push(input.subject || null);
    }

    if (columns.has('source')) {
      insertColumns.push('source');
      values.push(input.source || 'website');
    }

    if (columns.has('status')) {
      insertColumns.push('status');
      values.push('new');
    }

    if (columns.has('createdAt')) {
      insertColumns.push('createdAt');
      values.push(now);
    }

    const placeholders = insertColumns.map((_, index) => `$${index + 1}`).join(', ');
    const columnList = insertColumns.map(quoteIdentifier).join(', ');
    const rows = await db.$queryRawUnsafe<Array<{ id: string }>>(
      `INSERT INTO "ContactSubmission" (${columnList})
       VALUES (${placeholders})
       RETURNING "id"`,
      ...values
    );

    return {
      id: rows[0]?.id ?? (values[0] as string),
      storage: 'ContactSubmission' as const,
    };
  }

  if (await hasTable('ContactMessage')) {
    const now = new Date();
    const columns = await getTableColumns('ContactMessage');
    const insertColumns = ['id', 'name', 'email', 'message'];
    const values: unknown[] = [randomUUID(), input.name, input.email, input.message];

    if (columns.has('subject')) {
      insertColumns.push('subject');
      values.push(input.subject || null);
    }

    if (columns.has('read')) {
      insertColumns.push('read');
      values.push(false);
    }

    if (columns.has('createdAt')) {
      insertColumns.push('createdAt');
      values.push(now);
    }

    const placeholders = insertColumns.map((_, index) => `$${index + 1}`).join(', ');
    const columnList = insertColumns.map(quoteIdentifier).join(', ');
    const rows = await db.$queryRawUnsafe<Array<{ id: string }>>(
      `INSERT INTO "ContactMessage" (${columnList})
       VALUES (${placeholders})
       RETURNING "id"`,
      ...values
    );

    return {
      id: rows[0]?.id ?? (values[0] as string),
      storage: 'ContactMessage' as const,
    };
  }

  throw new Error('Contact storage is unavailable.');
}

export async function countContactSubmissions() {
  if (await hasTable('ContactSubmission')) {
    const rows = await db.$queryRawUnsafe<Array<{ count: bigint | number | string }>>(
      `SELECT ${sqlCount()} FROM "ContactSubmission"`
    );
    const count = Number(rows[0]?.count ?? 0);

    if (count > 0 || !(await hasTable('ContactMessage'))) {
      return count;
    }

    const legacyRows = await db.$queryRawUnsafe<Array<{ count: bigint | number | string }>>(
      `SELECT ${sqlCount()} FROM "ContactMessage"`
    );

    return Number(legacyRows[0]?.count ?? 0);
  }

  if (await hasTable('ContactMessage')) {
    const rows = await db.$queryRawUnsafe<Array<{ count: bigint | number | string }>>(
      `SELECT ${sqlCount()} FROM "ContactMessage"`
    );

    return Number(rows[0]?.count ?? 0);
  }

  return 0;
}

export async function upsertNewsletterSubscriber(input: {
  email: string;
  name?: string | null;
}) {
  if (!(await hasTable('Newsletter'))) {
    throw new Error('Newsletter storage is unavailable.');
  }

  const now = new Date();
  const columns = await getTableColumns('Newsletter');
  if (!columns.has('email')) {
    throw new Error('Newsletter storage is misconfigured.');
  }

  const insertColumns = ['id', 'email'];
  const values: unknown[] = [randomUUID(), input.email];

  if (columns.has('name')) {
    insertColumns.push('name');
    values.push(input.name?.trim() || null);
  }

  if (columns.has('isActive')) {
    insertColumns.push('isActive');
    values.push(true);
  }

  if (columns.has('confirmedAt')) {
    insertColumns.push('confirmedAt');
    values.push(now);
  }

  if (columns.has('createdAt')) {
    insertColumns.push('createdAt');
    values.push(now);
  }

  const placeholders = insertColumns.map((_, index) => `$${index + 1}`).join(', ');
  const columnList = insertColumns.map(quoteIdentifier).join(', ');
  const updates: string[] = [];

  if (columns.has('name')) {
    updates.push(`"name" = COALESCE(EXCLUDED."name", "Newsletter"."name")`);
  }

  if (columns.has('isActive')) {
    updates.push(`"isActive" = TRUE`);
  }

  if (columns.has('confirmedAt')) {
    updates.push(`"confirmedAt" = COALESCE("Newsletter"."confirmedAt", EXCLUDED."confirmedAt")`);
  }

  if (updates.length === 0) {
    updates.push(`"email" = EXCLUDED."email"`);
  }

  const rows = await db.$queryRawUnsafe<Array<{ id: string; email: string }>>(
    `INSERT INTO "Newsletter" (${columnList})
     VALUES (${placeholders})
     ON CONFLICT ("email") DO UPDATE
     SET ${updates.join(', ')}
     RETURNING "id", "email"`,
    ...values
  );

  return rows[0] ?? { id: values[0] as string, email: input.email };
}

export async function countNewsletterSubscribers() {
  if (!(await hasTable('Newsletter'))) {
    return 0;
  }

  const columns = await getTableColumns('Newsletter');
  const query = columns.has('isActive')
    ? `SELECT ${sqlCount()} FROM "Newsletter" WHERE "isActive" = ${sqlBool(true)}`
    : `SELECT ${sqlCount()} FROM "Newsletter"`;
  const rows = await db.$queryRawUnsafe<Array<{ count: bigint | number | string }>>(query);

  return Number(rows[0]?.count ?? 0);
}

export async function countMediaRecords() {
  if (!(await hasTable('Media'))) {
    return 0;
  }

  const rows = await db.$queryRawUnsafe<Array<{ count: bigint | number | string }>>(
    `SELECT ${sqlCount()} FROM "Media"`
  );

  return Number(rows[0]?.count ?? 0);
}

export async function getRecentActivityEntries(limit: number) {
  if (!(await hasTable('ActivityLog'))) {
    return [];
  }

  const activityColumns = await getTableColumns('ActivityLog');
  const canJoinUser =
    activityColumns.has('userId') &&
    (await hasTable('AdminUser')) &&
    (await getTableColumns('AdminUser')).has('id');
  const values: unknown[] = [limit];

  const rows = await db.$queryRawUnsafe<
    Array<{
      id: string;
      action: string;
      resource: string;
      resourceId: string | null;
      createdAt: Date;
      actor: string | null;
    }>
  >(
    canJoinUser
      ? `SELECT a."id",
                a."action",
                a."resource",
                a."resourceId",
                a."createdAt",
                COALESCE(u."name", u."email") AS actor
         FROM "ActivityLog" a
         LEFT JOIN "AdminUser" u
           ON u."id" = a."userId"
         ORDER BY a."createdAt" DESC
         LIMIT $1`
      : `SELECT "id",
                "action",
                "resource",
                "resourceId",
                "createdAt",
                NULL::text AS actor
         FROM "ActivityLog"
         ORDER BY "createdAt" DESC
         LIMIT $1`,
    ...values
  );

  return rows;
}
