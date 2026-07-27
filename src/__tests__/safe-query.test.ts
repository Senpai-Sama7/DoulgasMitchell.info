import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock db to avoid the @updatedAt / @default(cuid()) pre-fill edge cases
// in safeInsert. We only care about the affected-row return contract here.
const mockExecute = vi.fn();

vi.mock('@/lib/db', () => ({
  get db() {
    return {
      $executeRawUnsafe: mockExecute,
    };
  },
}));

const mockGetTableColumns = vi.fn();
vi.mock('@/lib/db-introspection', () => ({
  getTableColumns: () => mockGetTableColumns(),
  quoteIdentifier: (id: string) => `"${id.replace(/"/g, '""')}"`,
}));

vi.mock('@/lib/sql-helpers', () => ({
  isSqlite: () => false,
}));

import { safeUpdate, safeDelete } from '@/lib/safe-query';

beforeEach(() => {
  mockExecute.mockReset();
  mockGetTableColumns.mockReset();
  mockGetTableColumns.mockResolvedValue(
    new Set(['id', 'slug', 'title', 'content', 'category', 'updatedAt'])
  );
});

describe('safeUpdate returns accurate affected count', () => {
  it('returns affected: 1 when UPDATE matches one row', async () => {
    mockExecute.mockResolvedValueOnce(1);
    const result = await safeUpdate('Article', { title: 'updated' }, { slug: 'match' });
    expect(result.affected).toBe(1);
    expect(mockExecute).toHaveBeenCalledTimes(1);
  });

  it('returns affected: 0 when UPDATE matches no rows', async () => {
    mockExecute.mockResolvedValueOnce(0);
    const result = await safeUpdate('Article', { title: 'updated' }, { slug: 'no-such-slug' });
    expect(result.affected).toBe(0);
  });

  it('returns affected: 5 when UPDATE matches many rows', async () => {
    mockExecute.mockResolvedValueOnce(5);
    const result = await safeUpdate('Article', { category: 'archived' }, { category: 'old' });
    expect(result.affected).toBe(5);
  });
});

describe('safeDelete returns accurate boolean', () => {
  it('returns true when DELETE matches at least one row', async () => {
    mockExecute.mockResolvedValueOnce(1);
    const result = await safeDelete('Article', { id: 'real-id' });
    expect(result).toBe(true);
  });

  it('returns false when DELETE matches no rows', async () => {
    mockExecute.mockResolvedValueOnce(0);
    const result = await safeDelete('Article', { id: 'no-such-id' });
    expect(result).toBe(false);
  });

  it('returns true when DELETE matches many rows', async () => {
    mockExecute.mockResolvedValueOnce(10);
    const result = await safeDelete('Article', { category: 'archived' });
    expect(result).toBe(true);
  });
});
