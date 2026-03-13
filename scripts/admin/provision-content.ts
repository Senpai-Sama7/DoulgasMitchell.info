import { PrismaClient } from '@prisma/client';
import {
  bookShowcase,
  certificationShowcase,
  featuredArticles,
  featuredProjects,
} from '../../src/lib/site-content';

const prisma = new PrismaClient();

function toSlugValue(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseReadingTime(value: string) {
  const match = value.match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : 5;
}

function parseYear(value: string | undefined, fallbackYear: number) {
  const match = value?.match(/\d{4}/);
  return new Date(`${match?.[0] ?? fallbackYear}-01-01T00:00:00.000Z`);
}

async function ensureContentTables() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Article" (
      "id" TEXT PRIMARY KEY,
      "slug" TEXT NOT NULL UNIQUE,
      "title" TEXT NOT NULL,
      "subtitle" TEXT,
      "excerpt" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "coverImage" TEXT,
      "category" TEXT NOT NULL,
      "tags" TEXT NOT NULL DEFAULT '[]',
      "featured" BOOLEAN NOT NULL DEFAULT false,
      "published" BOOLEAN NOT NULL DEFAULT false,
      "publishedAt" TIMESTAMP(3),
      "readingTime" INTEGER NOT NULL DEFAULT 5,
      "order" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Project" (
      "id" TEXT PRIMARY KEY,
      "slug" TEXT NOT NULL UNIQUE,
      "title" TEXT NOT NULL,
      "subtitle" TEXT,
      "description" TEXT NOT NULL,
      "longDescription" TEXT,
      "coverImage" TEXT,
      "githubUrl" TEXT,
      "liveUrl" TEXT,
      "techStack" TEXT NOT NULL DEFAULT '[]',
      "category" TEXT NOT NULL,
      "featured" BOOLEAN NOT NULL DEFAULT false,
      "status" TEXT NOT NULL DEFAULT 'completed',
      "order" INTEGER NOT NULL DEFAULT 0,
      "startDate" TIMESTAMP(3),
      "endDate" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Certification" (
      "id" TEXT PRIMARY KEY,
      "title" TEXT NOT NULL,
      "issuer" TEXT NOT NULL,
      "issuerLogo" TEXT,
      "credentialUrl" TEXT,
      "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "expiryDate" TIMESTAMP(3),
      "credentialId" TEXT,
      "description" TEXT,
      "skills" TEXT NOT NULL DEFAULT '[]',
      "featured" BOOLEAN NOT NULL DEFAULT false,
      "order" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Book" (
      "id" TEXT PRIMARY KEY,
      "title" TEXT NOT NULL,
      "subtitle" TEXT,
      "description" TEXT NOT NULL,
      "coverImage" TEXT,
      "amazonUrl" TEXT,
      "publisher" TEXT,
      "publishDate" TIMESTAMP(3),
      "isbn" TEXT,
      "pages" INTEGER,
      "featured" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SiteConfig" (
      "id" TEXT PRIMARY KEY,
      "key" TEXT NOT NULL UNIQUE,
      "value" TEXT NOT NULL,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function ensureOperationalTables() {
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

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Newsletter" (
      "id" TEXT PRIMARY KEY,
      "email" TEXT NOT NULL UNIQUE,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Newsletter"
    ADD COLUMN IF NOT EXISTS "name" TEXT
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Newsletter"
    ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Newsletter"
    ADD COLUMN IF NOT EXISTS "confirmedAt" TIMESTAMP(3)
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Newsletter_isActive_idx"
    ON "Newsletter" ("isActive")
  `);

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

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Media_category_idx"
    ON "Media" ("category")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Media_folder_idx"
    ON "Media" ("folder")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "Media_createdAt_idx"
    ON "Media" ("createdAt")
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ArticleMedia" (
      "id" TEXT PRIMARY KEY,
      "articleId" TEXT NOT NULL,
      "mediaId" TEXT NOT NULL,
      "order" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "ArticleMedia_articleId_mediaId_key" UNIQUE ("articleId", "mediaId")
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "ArticleMedia_articleId_idx"
    ON "ArticleMedia" ("articleId")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "ArticleMedia_mediaId_idx"
    ON "ArticleMedia" ("mediaId")
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ProjectMedia" (
      "id" TEXT PRIMARY KEY,
      "projectId" TEXT NOT NULL,
      "mediaId" TEXT NOT NULL,
      "order" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "ProjectMedia_projectId_mediaId_key" UNIQUE ("projectId", "mediaId")
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "ProjectMedia_projectId_idx"
    ON "ProjectMedia" ("projectId")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "ProjectMedia_mediaId_idx"
    ON "ProjectMedia" ("mediaId")
  `);

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
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "PageView_path_idx"
    ON "PageView" ("path")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "PageView_sessionId_idx"
    ON "PageView" ("sessionId")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "PageView_createdAt_idx"
    ON "PageView" ("createdAt")
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ActivityLog" (
      "id" TEXT PRIMARY KEY,
      "action" TEXT NOT NULL,
      "resource" TEXT NOT NULL,
      "resourceId" TEXT,
      "details" TEXT,
      "ipAddress" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "ActivityLog"
    ADD COLUMN IF NOT EXISTS "userId" TEXT
  `);
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "ActivityLog"
    ADD COLUMN IF NOT EXISTS "userAgent" TEXT
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "ActivityLog_userId_idx"
    ON "ActivityLog" ("userId")
  `);
}

async function backfillLegacyOperationalData() {
  const legacyRows = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(
    `SELECT EXISTS (
       SELECT 1
       FROM information_schema.tables
       WHERE table_schema = current_schema()
         AND table_name = 'ContactMessage'
     ) AS exists`
  );

  if (!legacyRows[0]?.exists) {
    return;
  }

  await prisma.$executeRawUnsafe(`
    INSERT INTO "ContactSubmission" ("id", "name", "email", "subject", "message", "status", "createdAt")
    SELECT
      cm."id",
      cm."name",
      cm."email",
      cm."subject",
      cm."message",
      CASE WHEN COALESCE(cm."read", false) THEN 'read' ELSE 'new' END,
      COALESCE(cm."createdAt", CURRENT_TIMESTAMP)
    FROM "ContactMessage" cm
    ON CONFLICT ("id") DO NOTHING
  `);
}

async function seedArticles() {
  for (const [index, article] of featuredArticles.entries()) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      create: {
        id: `article-${article.slug}`,
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        category: toSlugValue(article.category),
        tags: JSON.stringify(article.tags),
        featured: article.featured,
        published: true,
        publishedAt: new Date(),
        readingTime: parseReadingTime(article.readTime),
        order: index,
      },
      update: {
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        category: toSlugValue(article.category),
        tags: JSON.stringify(article.tags),
        featured: article.featured,
        published: true,
        readingTime: parseReadingTime(article.readTime),
        order: index,
      },
    });
  }
}

async function seedProjects() {
  for (const [index, project] of featuredProjects.entries()) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      create: {
        id: `project-${project.slug}`,
        slug: project.slug,
        title: project.title,
        description: project.description,
        longDescription: project.longDescription,
        githubUrl: project.githubUrl,
        liveUrl: project.liveUrl,
        techStack: JSON.stringify(project.techStack),
        category: toSlugValue(project.category),
        featured: project.featured,
        status: project.timeline.includes('Present') ? 'in-progress' : 'completed',
        order: index,
      },
      update: {
        title: project.title,
        description: project.description,
        longDescription: project.longDescription,
        githubUrl: project.githubUrl,
        liveUrl: project.liveUrl,
        techStack: JSON.stringify(project.techStack),
        category: toSlugValue(project.category),
        featured: project.featured,
        status: project.timeline.includes('Present') ? 'in-progress' : 'completed',
        order: index,
      },
    });
  }
}

async function seedCertifications() {
  for (const [index, certification] of certificationShowcase.entries()) {
    await prisma.certification.upsert({
      where: { id: certification.id },
      create: {
        id: certification.id,
        title: certification.title,
        issuer: certification.issuer,
        credentialUrl: certification.credentialUrl,
        issueDate: parseYear(certification.issueDate, new Date().getUTCFullYear()),
        description: certification.description,
        skills: JSON.stringify(certification.skills),
        featured: certification.featured,
        order: index,
      },
      update: {
        title: certification.title,
        issuer: certification.issuer,
        credentialUrl: certification.credentialUrl,
        issueDate: parseYear(certification.issueDate, new Date().getUTCFullYear()),
        description: certification.description,
        skills: JSON.stringify(certification.skills),
        featured: certification.featured,
        order: index,
      },
    });
  }
}

async function seedBook() {
  await prisma.book.upsert({
    where: { id: 'featured-book' },
    create: {
      id: 'featured-book',
      title: bookShowcase.title,
      subtitle: bookShowcase.subtitle,
      description: bookShowcase.description,
      amazonUrl: bookShowcase.amazonUrl,
      publisher: bookShowcase.publisher,
      publishDate: parseYear(bookShowcase.publishDate, new Date().getUTCFullYear()),
      featured: true,
    },
    update: {
      title: bookShowcase.title,
      subtitle: bookShowcase.subtitle,
      description: bookShowcase.description,
      amazonUrl: bookShowcase.amazonUrl,
      publisher: bookShowcase.publisher,
      publishDate: parseYear(bookShowcase.publishDate, new Date().getUTCFullYear()),
      featured: true,
    },
  });
}

async function main() {
  await ensureContentTables();
  await ensureOperationalTables();
  await backfillLegacyOperationalData();
  await seedArticles();
  await seedProjects();
  await seedCertifications();
  await seedBook();

  const [articles, projects, certifications, books, contacts, newsletter, media, pageViews] = await Promise.all([
    prisma.article.count(),
    prisma.project.count(),
    prisma.certification.count(),
    prisma.book.count(),
    prisma.$queryRawUnsafe<Array<{ count: bigint | number | string }>>(
      'SELECT COUNT(*)::bigint AS count FROM "ContactSubmission"'
    ).then((rows) => Number(rows[0]?.count ?? 0)),
    prisma.$queryRawUnsafe<Array<{ count: bigint | number | string }>>(
      'SELECT COUNT(*)::bigint AS count FROM "Newsletter"'
    ).then((rows) => Number(rows[0]?.count ?? 0)),
    prisma.$queryRawUnsafe<Array<{ count: bigint | number | string }>>(
      'SELECT COUNT(*)::bigint AS count FROM "Media"'
    ).then((rows) => Number(rows[0]?.count ?? 0)),
    prisma.$queryRawUnsafe<Array<{ count: bigint | number | string }>>(
      'SELECT COUNT(*)::bigint AS count FROM "PageView"'
    ).then((rows) => Number(rows[0]?.count ?? 0)),
  ]);

  console.log(
    JSON.stringify(
      {
        success: true,
        counts: { articles, projects, certifications, books, contacts, newsletter, media, pageViews },
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error('Failed to provision content tables:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
