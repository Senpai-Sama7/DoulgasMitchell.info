import { db } from '@/lib/db';

const tableColumnsCache = new Map<string, Promise<Set<string>>>();

function quoteTableName(tableName: string) {
  return `"${tableName.replace(/"/g, '""')}"`;
}

export async function getTableColumns(tableName: string) {
  const cached = tableColumnsCache.get(tableName);
  if (cached) {
    return cached;
  }

  const lookup = db
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

  tableColumnsCache.set(tableName, lookup);
  return lookup;
}

export async function hasTable(tableName: string) {
  return (await getTableColumns(tableName)).size > 0;
}

export async function hasColumns(tableName: string, columns: string[]) {
  const available = await getTableColumns(tableName);
  return columns.every((column) => available.has(column));
}

export function quoteIdentifier(identifier: string) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

export function qualifiedColumn(tableName: string, columnName: string) {
  return `${quoteTableName(tableName)}.${quoteIdentifier(columnName)}`;
}
