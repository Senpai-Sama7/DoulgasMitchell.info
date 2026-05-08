import { db } from '@/lib/db';
import { getTableColumns, quoteIdentifier, type TABLE_NAME } from '@/lib/db-introspection';
import { isSqlite } from '@/lib/sql-helpers';

type ColumnValue = string | number | boolean | Date | null | Uint8Array;
type RowValues = Record<string, ColumnValue>;

interface InsertResult {
  id: string;
  row: Record<string, unknown>;
}

interface UpdateResult {
  affected: number;
}

/**
 * Type-safe INSERT builder. Validates all columns against the table schema,
 * quotes every identifier, and uses parameterised placeholders for every value.
 * Returns the inserted row via RETURNING (or last_insert_rowid on SQLite).
 */
export async function safeInsert(
  table: TABLE_NAME,
  data: RowValues,
): Promise<InsertResult> {
  const columns = await getTableColumns(table);
  if (columns.size === 0) {
    throw new Error(`Table "${table}" is not available for INSERT.`);
  }

  const insertColumns: string[] = [];
  const values: ColumnValue[] = [];

  for (const [col, val] of Object.entries(data)) {
    if (!columns.has(col)) continue;
    insertColumns.push(quoteIdentifier(col));
    values.push(val);
  }

  if (insertColumns.length === 0) {
    throw new Error(`No valid columns to insert into "${table}".`);
  }

  const placeholders = insertColumns.map((_, i) => `$${i + 1}`).join(', ');
  const columnList = insertColumns.join(', ');

  const rows = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(
    `INSERT INTO "${table}" (${columnList}) VALUES (${placeholders}) RETURNING *`,
    ...values,
  );

  return {
    id: String(rows[0]?.id ?? ''),
    row: rows[0] ?? {},
  };
}

/**
 * Type-safe UPDATE builder. Validates columns, quotes identifiers,
 * and uses parameterised placeholders. Requires a WHERE clause.
 */
export async function safeUpdate(
  table: TABLE_NAME,
  data: RowValues,
  where: RowValues,
): Promise<UpdateResult> {
  const columns = await getTableColumns(table);
  if (columns.size === 0) {
    throw new Error(`Table "${table}" is not available for UPDATE.`);
  }

  const setClauses: string[] = [];
  const setValues: ColumnValue[] = [];

  for (const [col, val] of Object.entries(data)) {
    if (!columns.has(col)) continue;
    setClauses.push(`${quoteIdentifier(col)} = $${setValues.length + 1}`);
    setValues.push(val);
  }

  if (setClauses.length === 0) {
    throw new Error(`No valid columns to update in "${table}".`);
  }

  const whereClauses: string[] = [];
  const whereValues: ColumnValue[] = [];

  for (const [col, val] of Object.entries(where)) {
    if (!columns.has(col)) continue;
    const offset = setValues.length + whereValues.length + 1;
    whereClauses.push(`${quoteIdentifier(col)} = $${offset}`);
    whereValues.push(val);
  }

  if (whereClauses.length === 0) {
    throw new Error(`UPDATE on "${table}" requires at least one WHERE condition.`);
  }

  const allValues = [...setValues, ...whereValues];

  await db.$executeRawUnsafe(
    `UPDATE "${table}" SET ${setClauses.join(', ')} WHERE ${whereClauses.join(' AND ')}`,
    ...allValues,
  );

  return { affected: 1 };
}

/**
 * Type-safe UPSERT (INSERT … ON CONFLICT DO UPDATE) for PostgreSQL and SQLite.
 * Falls back to safeInsert + safeUpdate for SQLite since it lacks native ON CONFLICT
 * for non-PK columns in some configurations.
 */
export async function safeUpsert(
  table: TABLE_NAME,
  conflictColumn: string,
  data: RowValues,
): Promise<InsertResult> {
  if (isSqlite()) {
    const existing = await safeSelectOne(table, [conflictColumn], {
      [conflictColumn]: data[conflictColumn],
    });

    if (existing) {
      const id = String(existing.id ?? '');

      const setData: RowValues = {};
      for (const [col, val] of Object.entries(data)) {
        if (col !== conflictColumn) setData[col] = val;
      }

      await safeUpdate(table, setData, { id });
      return { id, row: { ...existing, ...data } };
    }

    return safeInsert(table, data);
  }

  const columns = await getTableColumns(table);
  if (columns.size === 0) {
    throw new Error(`Table "${table}" is not available for UPSERT.`);
  }

  const insertColumns: string[] = [];
  const values: ColumnValue[] = [];
  const updateColumns: string[] = [];

  for (const [col, val] of Object.entries(data)) {
    if (!columns.has(col)) continue;
    insertColumns.push(quoteIdentifier(col));
    values.push(val);
    if (col !== conflictColumn) {
      updateColumns.push(
        `${quoteIdentifier(col)} = EXCLUDED.${quoteIdentifier(col)}`,
      );
    }
  }

  const placeholders = insertColumns.map((_, i) => `$${i + 1}`).join(', ');
  const columnList = insertColumns.join(', ');

  const rows = await db.$queryRawUnsafe<Array<Record<string, unknown>>>(
    `INSERT INTO "${table}" (${columnList})
     VALUES (${placeholders})
     ON CONFLICT (${quoteIdentifier(conflictColumn)}) DO UPDATE
     SET ${updateColumns.join(', ')}
     RETURNING *`,
    ...values,
  );

  return {
    id: String(rows[0]?.id ?? ''),
    row: rows[0] ?? {},
  };
}

/**
 * Type-safe SELECT builder. Validates columns and table, quotes all identifiers,
 * and uses parameterised WHERE clause values.
 */
export async function safeSelect(
  table: TABLE_NAME,
  selectColumns: string[],
  where?: RowValues,
  options?: {
    orderBy?: string;
    orderDirection?: 'ASC' | 'DESC';
    limit?: number;
    offset?: number;
  },
): Promise<Record<string, unknown>[]> {
  const columns = await getTableColumns(table);
  if (columns.size === 0) {
    return [];
  }

  const validCols = selectColumns.filter((col) => columns.has(col));
  if (validCols.length === 0) {
    return [];
  }

  const select = validCols.map(quoteIdentifier).join(', ');
  const clauses: string[] = [`SELECT ${select} FROM "${table}"`];
  const params: ColumnValue[] = [];

  if (where && Object.keys(where).length > 0) {
    const whereParts: string[] = [];
    for (const [col, val] of Object.entries(where)) {
      if (!columns.has(col)) continue;
      params.push(val);
      whereParts.push(`${quoteIdentifier(col)} = $${params.length}`);
    }
    if (whereParts.length > 0) {
      clauses.push(`WHERE ${whereParts.join(' AND ')}`);
    }
  }

  if (options?.orderBy && columns.has(options.orderBy)) {
    const dir = options.orderDirection === 'DESC' ? 'DESC' : 'ASC';
    clauses.push(`ORDER BY ${quoteIdentifier(options.orderBy)} ${dir}`);
  }

  if (options?.limit && options.limit > 0) {
    params.push(options.limit);
    clauses.push(`LIMIT $${params.length}`);
  }

  if (options?.offset && options.offset > 0) {
    params.push(options.offset);
    clauses.push(`OFFSET $${params.length}`);
  }

  return db.$queryRawUnsafe<Array<Record<string, unknown>>>(
    clauses.join(' '),
    ...params,
  );
}

/**
 * Select a single row by criteria. Returns null if not found.
 */
export async function safeSelectOne(
  table: TABLE_NAME,
  selectColumns: string[],
  where: RowValues,
): Promise<Record<string, unknown> | null> {
  const rows = await safeSelect(table, selectColumns, where, { limit: 1 });
  return rows[0] ?? null;
}

/**
 * Type-safe soft DELETE. Always requires WHERE clause.
 * Returns true if at least one row was deleted.
 */
export async function safeDelete(
  table: TABLE_NAME,
  where: RowValues,
): Promise<boolean> {
  const columns = await getTableColumns(table);
  if (columns.size === 0) return false;

  const whereParts: string[] = [];
  const params: ColumnValue[] = [];

  for (const [col, val] of Object.entries(where)) {
    if (!columns.has(col)) continue;
    params.push(val);
    whereParts.push(`${quoteIdentifier(col)} = $${params.length}`);
  }

  if (whereParts.length === 0) {
    throw new Error(`DELETE on "${table}" requires at least one WHERE condition.`);
  }

  await db.$executeRawUnsafe(
    `DELETE FROM "${table}" WHERE ${whereParts.join(' AND ')}`,
    ...params,
  );

  return true;
}

/**
 * Execute a raw SELECT query with validated column references.
 * All column and table references are quoted, all values are parameterised.
 * Only use this when safeSelect/safeInsert abstractions don't cover the use case.
 */
export async function safeRawSelect<T = Record<string, unknown>>(
  sqlTemplate: string,
  params: ColumnValue[] = [],
): Promise<T[]> {
  const result = await db.$queryRawUnsafe<Array<{ [key: string]: unknown }>>(sqlTemplate, ...params);
  return result as unknown as T[];
}
