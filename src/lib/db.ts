import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Apply connection-pool parameters to a Postgres DATABASE_URL so Prisma
 * can't exhaust the database's max_connections under load. SQLite is a
 * single-connection file DB and ignores these params.
 *
 *   ?connection_limit=10   max connections per Prisma instance
 *   ?connect_timeout=5     fail fast (seconds) instead of hanging the request
 *
 * Env override: DB_POOL_SIZE and DB_CONNECT_TIMEOUT.
 */
function withPoolParams(url: string): string {
  if (!url.startsWith('postgres://') && !url.startsWith('postgresql://')) {
    return url;
  }

  const poolSize = process.env.DB_POOL_SIZE ?? '10';
  const connectTimeout = process.env.DB_CONNECT_TIMEOUT ?? '5';

  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has('connection_limit')) {
      parsed.searchParams.set('connection_limit', poolSize);
    }
    if (!parsed.searchParams.has('connect_timeout')) {
      parsed.searchParams.set('connect_timeout', connectTimeout);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

if (!process.env.DATABASE_URL && !isProduction) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

if (process.env.DATABASE_URL) {
  process.env.DATABASE_URL = withPoolParams(process.env.DATABASE_URL);
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProduction ? ['error', 'warn'] : ['query', 'error', 'warn'],
  });

if (!isProduction) globalForPrisma.prisma = db;
