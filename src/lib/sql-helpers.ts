/**
 * Database-agnostic SQL helpers for raw queries that must work on both
 * PostgreSQL (production) and SQLite (development).
 */

function isSqlite(): boolean {
  const url = process.env.DATABASE_URL ?? '';
  return (
    url.startsWith('file:') ||
    url.startsWith('sqlite:') ||
    url.endsWith('.db')
  );
}

/** SQL literal for current timestamp */
export function sqlNow(): string {
  return isSqlite() ? "datetime('now')" : 'NOW()';
}

/** Cast-free NULL alias for a column, works on both engines */
export function sqlNull(alias: string): string {
  return `NULL AS ${quoteIdentifier(alias)}`;
}

/** Boolean literal that works on both engines */
export function sqlBool(value: boolean): string {
  return isSqlite() ? (value ? '1' : '0') : (value ? 'TRUE' : 'FALSE');
}

/** Safe COUNT(*) without PostgreSQL-only ::bigint cast */
export function sqlCount(): string {
  return 'COUNT(*) AS count';
}

/** Quote an identifier for safe SQL interpolation */
export function quoteIdentifier(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`;
}

/** Qualified column reference: "Table"."column" */
export function qualifiedColumn(tableName: string, columnName: string): string {
  return `${quoteIdentifier(tableName)}.${quoteIdentifier(columnName)}`;
}

/** Quote a table name */
export function quoteTableName(tableName: string): string {
  return `"${tableName.replace(/"/g, '""')}"`;
}
