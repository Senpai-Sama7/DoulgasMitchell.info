import { PrismaClient, type Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function resolveDatabaseUrl(): string | undefined {
  const candidates = [
    process.env.POSTGRES_PRISMA_URL,
    process.env.DATABASE_URL,
    process.env.DATABASE_URL_UNPOOLED,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_URL_NON_POOLING,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate;
    }
  }

  return undefined;
}

const resolvedDatabaseUrl = resolveDatabaseUrl();
const prismaOptions: Prisma.PrismaClientOptions = {
  log:
    process.env.NODE_ENV === 'development' && process.env.PRISMA_LOG_QUERIES === 'true'
      ? ['query', 'error', 'warn']
      : ['error', 'warn'],
};

if (resolvedDatabaseUrl) {
  prismaOptions.datasources = {
    db: {
      url: resolvedDatabaseUrl,
    },
  };
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient(prismaOptions)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
