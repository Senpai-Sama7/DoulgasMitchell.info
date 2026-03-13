import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function ensureAdminUserCompatibility() {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "AdminUser"
      ADD COLUMN IF NOT EXISTS "name" TEXT,
      ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'admin',
      ADD COLUMN IF NOT EXISTS "avatar" TEXT,
      ADD COLUMN IF NOT EXISTS "bio" TEXT,
      ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true
  `);

  await prisma.$executeRawUnsafe(`
    UPDATE "AdminUser"
    SET "name" = COALESCE(NULLIF("name", ''), NULLIF("username", ''), "email"),
        "role" = COALESCE(NULLIF("role", ''), 'admin'),
        "isActive" = COALESCE("isActive", true)
  `);

  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AdminUser_isActive_idx" ON "AdminUser" ("isActive")`);
}

async function ensureNewsletterCompatibility() {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Newsletter"
      ADD COLUMN IF NOT EXISTS "name" TEXT,
      ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS "confirmedAt" TIMESTAMP(3)
  `);

  await prisma.$executeRawUnsafe(`
    UPDATE "Newsletter"
    SET "isActive" = COALESCE("isActive", true),
        "confirmedAt" = COALESCE("confirmedAt", "createdAt")
  `);

  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Newsletter_isActive_idx" ON "Newsletter" ("isActive")`);
}

async function ensureContactSubmissionTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ContactSubmission" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "subject" TEXT,
      "message" TEXT NOT NULL,
      "source" TEXT,
      "status" TEXT NOT NULL DEFAULT 'new',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "ContactSubmission_status_createdAt_idx"
    ON "ContactSubmission" ("status", "createdAt")
  `);
}

async function ensureMediaTables() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Media" (
      "id" TEXT PRIMARY KEY,
      "filename" TEXT NOT NULL UNIQUE,
      "originalName" TEXT NOT NULL,
      "mimeType" TEXT NOT NULL,
      "category" TEXT NOT NULL,
      "size" INTEGER NOT NULL,
      "width" INTEGER,
      "height" INTEGER,
      "duration" INTEGER,
      "url" TEXT NOT NULL,
      "thumbnailUrl" TEXT,
      "alt" TEXT,
      "caption" TEXT,
      "description" TEXT,
      "tags" TEXT,
      "folder" TEXT NOT NULL DEFAULT 'uncategorized',
      "uploadedById" TEXT,
      "isPublic" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Media_category_idx" ON "Media" ("category")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Media_folder_idx" ON "Media" ("folder")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Media_mimeType_idx" ON "Media" ("mimeType")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Media_createdAt_idx" ON "Media" ("createdAt")`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ArticleMedia" (
      "id" TEXT PRIMARY KEY,
      "articleId" TEXT NOT NULL,
      "mediaId" TEXT NOT NULL,
      "order" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "ArticleMedia_articleId_mediaId_key"
    ON "ArticleMedia" ("articleId", "mediaId")
  `);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ArticleMedia_articleId_idx" ON "ArticleMedia" ("articleId")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ArticleMedia_mediaId_idx" ON "ArticleMedia" ("mediaId")`);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ProjectMedia" (
      "id" TEXT PRIMARY KEY,
      "projectId" TEXT NOT NULL,
      "mediaId" TEXT NOT NULL,
      "order" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "ProjectMedia_projectId_mediaId_key"
    ON "ProjectMedia" ("projectId", "mediaId")
  `);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ProjectMedia_projectId_idx" ON "ProjectMedia" ("projectId")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ProjectMedia_mediaId_idx" ON "ProjectMedia" ("mediaId")`);
}

async function ensurePageViewTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PageView" (
      "id" TEXT PRIMARY KEY,
      "path" TEXT NOT NULL,
      "referrer" TEXT,
      "userAgent" TEXT,
      "ipAddress" TEXT,
      "country" TEXT,
      "city" TEXT,
      "sessionId" TEXT NOT NULL,
      "duration" INTEGER,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PageView_path_idx" ON "PageView" ("path")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PageView_sessionId_idx" ON "PageView" ("sessionId")`);
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "PageView_createdAt_idx" ON "PageView" ("createdAt")`);
}

async function summarizeState() {
  const rows = await prisma.$queryRawUnsafe<Array<{ table_name: string }>>(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = current_schema()
      AND table_name IN ('AdminUser', 'ContactSubmission', 'Media', 'ArticleMedia', 'ProjectMedia', 'Newsletter', 'PageView')
    ORDER BY table_name
  `);

  return rows.map((row) => row.table_name);
}

async function main() {
  await ensureAdminUserCompatibility();
  await ensureNewsletterCompatibility();
  await ensureContactSubmissionTable();
  await ensureMediaTables();
  await ensurePageViewTable();

  const tables = await summarizeState();

  console.log(
    JSON.stringify(
      {
        success: true,
        ensuredTables: tables,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
