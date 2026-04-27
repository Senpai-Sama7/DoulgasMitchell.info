import { db } from '@/lib/db';
import { isSqlite, quoteTableName, quoteIdentifier, qualifiedColumn } from '@/lib/sql-helpers';

export { quoteIdentifier, qualifiedColumn };

const tableColumnsCache = new Map<string, Promise<Set<string>>>();

// All Prisma schema model names that can be introspected
const ALLOWED_TABLES = new Set([
  'ActivityLog', 'AdminUser', 'Article', 'ArticleBlock', 'ArticleMedia',
  'Book', 'Certification', 'Comment', 'ContactSubmission', 'LayoutBlock',
  'Media', 'Newsletter', 'Note', 'PageView', 'PasskeyCredential',
  'Project', 'ProjectMedia', 'Reaction', 'Session', 'Setting', 'SiteConfig',
  // Legacy table names used by compat layer
  'AdminSession', 'AdminPasskey', 'NewsletterSubscriber', 'ContactMessage',
]);

export async function getTableColumns(tableName: string) {
  if (!ALLOWED_TABLES.has(tableName)) {
    return new Set<string>();
  }

  const cached = tableColumnsCache.get(tableName);
  if (cached) {
    return cached;
  }

  const query = isSqlite()
    ? db
        .$queryRawUnsafe<Array<{ name: string }>>(
          `PRAGMA table_info(${quoteTableName(tableName)})`
        )
        .then((rows) => new Set(rows.map((row) => row.name)))
        .catch(() => new Set<string>())
    : db
        .$queryRawUnsafe<Array<{ column_name: string }>>(
          `SELECT column_name
           FROM information_schema.columns
           WHERE table_schema = current_schema()
             AND table_name = $1
           ORDER BY ordinal_position`,
          tableName
        )
        .then((rows) => new Set(rows.map((row) => row.column_name)))
        .catch(() => new Set<string>());

  tableColumnsCache.set(tableName, query);
  return query;
}

export async function hasTable(tableName: string) {
  return (await getTableColumns(tableName)).size > 0;
}

export async function hasColumns(tableName: string, columns: string[]) {
  const available = await getTableColumns(tableName);
  return columns.every((column) => available.has(column));
}
