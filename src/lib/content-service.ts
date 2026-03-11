import { cache } from 'react';
import { formatDistanceToNowStrict } from 'date-fns';
import { db } from '@/lib/db';
import {
  type ArticleShowcase,
  type BookShowcase,
  type CertificationShowcase,
  type ProjectShowcase,
  bookShowcase,
  certificationShowcase,
  featuredArticles,
  featuredProjects,
} from '@/lib/site-content';

const tableAvailability = new Map<string, Promise<boolean>>();

async function hasTables(tableNames: string[]) {
  const key = [...tableNames].sort().join(',');
  const cached = tableAvailability.get(key);
  if (cached) return cached;

  const availabilityPromise = db
    .$queryRawUnsafe<Array<{ name: string }>>(`SELECT name FROM sqlite_master WHERE type='table'`)
    .then((rows) => {
      const availableTables = new Set(rows.map((row) => row.name));
      return tableNames.every((tableName) => availableTables.has(tableName));
    })
    .catch(() => false);

  tableAvailability.set(key, availabilityPromise);
  return availabilityPromise;
}

function parseStringArray(input: string | null | undefined, fallback: string[] = []) {
  if (!input) return fallback;

  try {
    const parsed = JSON.parse(input) as unknown;
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : fallback;
  } catch {
    return fallback;
  }
}

function formatMonthYear(value: Date | null | undefined, fallback: string) {
  if (!value) return fallback;
  return value.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function titleCaseCategory(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function articleFallbackBySlug(slug: string) {
  return featuredArticles.find((item) => item.slug === slug);
}

function projectFallbackBySlug(slug: string) {
  return featuredProjects.find((item) => item.slug === slug);
}

function mapDbArticleToShowcase(article: {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingTime: number;
  featured: boolean;
  publishedAt: Date | null;
  updatedAt: Date;
  tags: string;
  content: string;
}) {
  const fallback = articleFallbackBySlug(article.slug);

  const mapped: ArticleShowcase = {
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    category: titleCaseCategory(article.category),
    readTime: `${article.readingTime} min`,
    date: formatMonthYear(article.publishedAt ?? article.updatedAt, fallback?.date ?? 'Recently updated'),
    featured: article.featured,
    trending: fallback?.trending ?? false,
    tags: parseStringArray(article.tags, fallback?.tags ?? []),
    insight: fallback?.insight ?? article.excerpt,
    content: article.content || fallback?.content || article.excerpt,
  };

  return mapped;
}

function mapDbProjectToShowcase(project: {
  slug: string;
  title: string;
  description: string;
  longDescription: string | null;
  category: string;
  techStack: string;
  githubUrl: string | null;
  liveUrl: string | null;
  featured: boolean;
  startDate: Date | null;
  endDate: Date | null;
  status: string;
}) {
  const fallback = projectFallbackBySlug(project.slug);

  const mapped: ProjectShowcase = {
    slug: project.slug,
    title: project.title,
    description: project.description,
    longDescription: project.longDescription || fallback?.longDescription || project.description,
    category: titleCaseCategory(project.category),
    techStack: parseStringArray(project.techStack, fallback?.techStack ?? []),
    githubUrl: project.githubUrl ?? fallback?.githubUrl,
    liveUrl: project.liveUrl ?? fallback?.liveUrl,
    featured: project.featured,
    stars: fallback?.stars ?? 0,
    forks: fallback?.forks ?? 0,
    color: fallback?.color ?? 'from-primary/10 to-primary/5',
    timeline:
      project.startDate || project.endDate
        ? `${project.startDate?.getFullYear() ?? 'Start'} → ${project.endDate?.getFullYear() ?? 'Present'}`
        : fallback?.timeline ?? 'Active',
    status: titleCaseCategory(project.status),
    challenge: fallback?.challenge ?? 'Challenge details available on request.',
    solution: fallback?.solution ?? ['Architecture and implementation details available on request.'],
    outcomes: fallback?.outcomes ?? ['A working system with measurable delivery potential.'],
    metrics: fallback?.metrics ?? [],
  };

  return mapped;
}

function mapDbCertificationToShowcase(certification: {
  id: string;
  title: string;
  issuer: string;
  description: string | null;
  credentialUrl: string | null;
  issueDate: Date;
  skills: string;
  featured: boolean;
}) {
  const fallback = certificationShowcase.find((item) => item.title === certification.title);

  const mapped: CertificationShowcase = {
    id: certification.id,
    title: certification.title,
    issuer: certification.issuer,
    description: certification.description || fallback?.description || '',
    credentialUrl: certification.credentialUrl || fallback?.credentialUrl || '#',
    issueDate: certification.issueDate.getFullYear().toString(),
    skills: parseStringArray(certification.skills, fallback?.skills ?? []),
    featured: certification.featured,
    imageUrl: fallback?.imageUrl,
  };

  return mapped;
}

function mapDbBookToShowcase(book: {
  title: string;
  subtitle: string | null;
  description: string;
  amazonUrl: string | null;
  publisher: string | null;
  publishDate: Date | null;
}) {
  const mapped: BookShowcase = {
    title: book.title,
    subtitle: book.subtitle || bookShowcase.subtitle,
    description: book.description,
    amazonUrl: book.amazonUrl || bookShowcase.amazonUrl,
    publisher: book.publisher || bookShowcase.publisher,
    publishDate: book.publishDate ? book.publishDate.getFullYear().toString() : bookShowcase.publishDate,
    highlights: bookShowcase.highlights,
    chapters: bookShowcase.chapters,
    testimonials: bookShowcase.testimonials,
  };

  return mapped;
}

async function withFallback<T>(query: () => Promise<T>, fallback: T) {
  try {
    return await query();
  } catch {
    return fallback;
  }
}

export const getLandingPageData = cache(async () => {
  const canUseContentTables = await hasTables(['Article', 'Project', 'Certification', 'Book']);

  if (!canUseContentTables) {
    return {
      projects: featuredProjects,
      articles: featuredArticles,
      certifications: certificationShowcase,
      book: bookShowcase,
    };
  }

  const [projects, articles, certifications, book] = await Promise.all([
    withFallback(async () => {
      const rows = await db.project.findMany({
        where: { featured: true },
        orderBy: { updatedAt: 'desc' },
        take: 3,
      });

      return rows.length > 0 ? rows.map(mapDbProjectToShowcase) : featuredProjects;
    }, featuredProjects),
    withFallback(async () => {
      const rows = await db.article.findMany({
        where: { published: true },
        orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }, { updatedAt: 'desc' }],
        take: 4,
      });

      return rows.length > 0 ? rows.map(mapDbArticleToShowcase) : featuredArticles;
    }, featuredArticles),
    withFallback(async () => {
      const rows = await db.certification.findMany({
        where: { featured: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      });

      return rows.length > 0 ? rows.map(mapDbCertificationToShowcase) : certificationShowcase;
    }, certificationShowcase),
    withFallback(async () => {
      const row = await db.book.findFirst({
        where: { featured: true },
        orderBy: { updatedAt: 'desc' },
      });

      return row ? mapDbBookToShowcase(row) : bookShowcase;
    }, bookShowcase),
  ]);

  return {
    projects,
    articles,
    certifications,
    book,
  };
});

export const getArticleBySlug = cache(async (slug: string) => {
  const fallback = articleFallbackBySlug(slug) || null;

  if (!(await hasTables(['Article']))) {
    return fallback;
  }

  return withFallback(async () => {
    const article = await db.article.findUnique({
      where: { slug },
    });

    if (!article) return fallback;

    return mapDbArticleToShowcase(article);
  }, fallback);
});

export const getProjectBySlug = cache(async (slug: string) => {
  const fallback = projectFallbackBySlug(slug) || null;

  if (!(await hasTables(['Project']))) {
    return fallback;
  }

  return withFallback(async () => {
    const project = await db.project.findUnique({
      where: { slug },
    });

    if (!project) return fallback;

    return mapDbProjectToShowcase(project);
  }, fallback);
});

export const getAdminDashboardData = cache(async () => {
  const canUseAdminTables = await hasTables([
    'ActivityLog',
    'Article',
    'ContactSubmission',
    'Media',
    'Newsletter',
    'PageView',
    'Project',
  ]);

  if (!canUseAdminTables) {
    return {
      stats: {
        articles: featuredArticles.length,
        projects: featuredProjects.length,
        media: 0,
        contacts: 0,
        subscribers: 0,
        pageViews: 0,
      },
      recentActivity: [],
    };
  }

  return withFallback(async () => {
    const [articles, projects, media, contacts, subscribers, pageViews, recentActivity] = await Promise.all([
      db.article.count(),
      db.project.count(),
      db.media.count(),
      db.contactSubmission.count(),
      db.newsletter.count({ where: { isActive: true } }),
      db.pageView.count(),
      db.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return {
      stats: {
        articles,
        projects,
        media,
        contacts,
        subscribers,
        pageViews,
      },
      recentActivity: recentActivity.map((entry) => ({
        id: entry.id,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        relativeTime: formatDistanceToNowStrict(entry.createdAt, { addSuffix: true }),
        actor: entry.user?.name || entry.user?.email || 'System',
      })),
    };
  }, {
    stats: {
      articles: featuredArticles.length,
      projects: featuredProjects.length,
      media: 0,
      contacts: 0,
      subscribers: 0,
      pageViews: 0,
    },
    recentActivity: [],
  });
});

export const getAdminContentSnapshot = cache(async () => {
  if (!(await hasTables(['Article', 'Book', 'Certification', 'Project']))) {
    return {
      articles: featuredArticles.map((article) => ({
        id: article.slug,
        title: article.title,
        slug: article.slug,
        status: 'published',
        featured: article.featured,
        updatedAt: new Date().toISOString(),
        href: `/writing/${article.slug}`,
      })),
      projects: featuredProjects.map((project) => ({
        id: project.slug,
        title: project.title,
        slug: project.slug,
        status: 'published',
        featured: project.featured,
        updatedAt: new Date().toISOString(),
        href: `/work/${project.slug}`,
      })),
      certifications: certificationShowcase.map((certification) => ({
        id: certification.id,
        title: certification.title,
        slug: certification.id,
        status: 'published',
        featured: certification.featured,
        updatedAt: new Date().toISOString(),
        href: certification.credentialUrl,
      })),
      books: [
        {
          id: 'book',
          title: bookShowcase.title,
          slug: 'book',
          status: 'published',
          featured: true,
          updatedAt: new Date().toISOString(),
          href: bookShowcase.amazonUrl,
        },
      ],
    };
  }

  return withFallback(async () => {
    const [articles, projects, certifications, books] = await Promise.all([
      db.article.findMany({
        orderBy: [{ featured: 'desc' }, { order: 'asc' }, { updatedAt: 'desc' }],
        select: {
          id: true,
          title: true,
          slug: true,
          published: true,
          featured: true,
          order: true,
          updatedAt: true,
        },
      }),
      db.project.findMany({
        orderBy: [{ featured: 'desc' }, { order: 'asc' }, { updatedAt: 'desc' }],
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          featured: true,
          order: true,
          updatedAt: true,
        },
      }),
      db.certification.findMany({
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          title: true,
          featured: true,
          createdAt: true,
          credentialUrl: true,
        },
      }),
      db.book.findMany({
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          title: true,
          featured: true,
          updatedAt: true,
          amazonUrl: true,
        },
      }),
    ]);

    return {
      articles: articles.map((article) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        status: article.published ? 'published' : 'draft',
        featured: article.featured,
        order: article.order,
        updatedAt: article.updatedAt.toISOString(),
        href: `/writing/${article.slug}`,
      })),
      projects: projects.map((project) => ({
        id: project.id,
        title: project.title,
        slug: project.slug,
        status: project.status,
        featured: project.featured,
        order: project.order,
        updatedAt: project.updatedAt.toISOString(),
        href: `/work/${project.slug}`,
      })),
      certifications: certifications.map((certification) => ({
        id: certification.id,
        title: certification.title,
        slug: certification.id,
        status: 'published',
        featured: certification.featured,
        updatedAt: certification.createdAt.toISOString(),
        href: certification.credentialUrl || '#',
      })),
      books: books.map((book) => ({
        id: book.id,
        title: book.title,
        slug: book.id,
        status: 'published',
        featured: book.featured,
        updatedAt: book.updatedAt.toISOString(),
        href: book.amazonUrl || '#',
      })),
    };
  }, {
    articles: featuredArticles.map((article) => ({
      id: article.slug,
      title: article.title,
      slug: article.slug,
      status: 'published',
      featured: article.featured,
      updatedAt: new Date().toISOString(),
      href: `/writing/${article.slug}`,
    })),
    projects: featuredProjects.map((project) => ({
      id: project.slug,
      title: project.title,
      slug: project.slug,
      status: 'published',
      featured: project.featured,
      updatedAt: new Date().toISOString(),
      href: `/work/${project.slug}`,
    })),
    certifications: certificationShowcase.map((certification) => ({
      id: certification.id,
      title: certification.title,
      slug: certification.id,
      status: 'published',
      featured: certification.featured,
      updatedAt: new Date().toISOString(),
      href: certification.credentialUrl,
    })),
    books: [
      {
        id: 'book',
        title: bookShowcase.title,
        slug: 'book',
        status: 'published',
        featured: true,
        updatedAt: new Date().toISOString(),
        href: bookShowcase.amazonUrl,
      },
    ],
  });
});

export const getAdminAnalyticsData = cache(async () => {
  const fallback = {
    totalPageViews: 0,
    uniqueSessions: 0,
    contactSubmissions: 0,
    newsletterSubscribers: 0,
    topPages: [] as Array<{ path: string; views: number }>,
    pageViewSeries: [] as Array<{ date: string; views: number }>,
  };

  if (!(await hasTables(['ContactSubmission', 'Newsletter', 'PageView']))) {
    return fallback;
  }

  return withFallback(async () => {
    const [totalPageViews, uniqueSessions, contactSubmissions, newsletterSubscribers, pageViews] = await Promise.all([
      db.pageView.count(),
      db.pageView.groupBy({ by: ['sessionId'] }),
      db.contactSubmission.count(),
      db.newsletter.count({ where: { isActive: true } }),
      db.pageView.findMany({
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
    ]);

    const topPages = (Object.entries(
      pageViews.reduce<Record<string, number>>((acc, pageView) => {
        acc[pageView.path] = (acc[pageView.path] || 0) + 1;
        return acc;
      }, {})
    ) as Array<[string, number]>)
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    const pageViewSeries = (Object.entries(
      pageViews.reduce<Record<string, number>>((acc, pageView) => {
        const key = pageView.createdAt.toISOString().slice(0, 10);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    ) as Array<[string, number]>)
      .map(([date, views]) => ({ date, views }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14);

    return {
      totalPageViews,
      uniqueSessions: uniqueSessions.length,
      contactSubmissions,
      newsletterSubscribers,
      topPages,
      pageViewSeries,
    };
  }, fallback);
});

export const getAdminSecurityData = cache(async () => {
  const fallback = {
    activeSessions: 0,
    passkeysRegistered: 0,
    adminUsers: 0,
    recentSessions: [] as Array<{
      id: string;
      email: string;
      lastSeen: string;
      ipAddress: string;
      userAgent: string;
    }>,
  };

  if (!(await hasTables(['AdminUser', 'PasskeyCredential', 'Session']))) {
    return fallback;
  }

  return withFallback(async () => {
    const [activeSessions, passkeysRegistered, adminUsers, recentSessions] = await Promise.all([
      db.session.count({ where: { expiresAt: { gt: new Date() } } }),
      db.passkeyCredential.count(),
      db.adminUser.count({ where: { isActive: true } }),
      db.session.findMany({
        where: { expiresAt: { gt: new Date() } },
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: {
          user: {
            select: {
              email: true,
            },
          },
        },
      }),
    ]);

    return {
      activeSessions,
      passkeysRegistered,
      adminUsers,
      recentSessions: recentSessions.map((session) => ({
        id: session.id,
        email: session.user.email,
        lastSeen: formatDistanceToNowStrict(session.createdAt, { addSuffix: true }),
        ipAddress: session.ipAddress || 'unknown',
        userAgent: session.userAgent || 'unknown',
      })),
    };
  }, fallback);
});

export const getUserPasskeys = cache(async (userId: string) => {
  if (!(await hasTables(['PasskeyCredential']))) {
    return [];
  }

  return withFallback(async () => {
    return await db.passkeyCredential.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        credentialId: true,
        deviceName: true,
        createdAt: true,
        lastUsedAt: true,
      },
    });
  }, []);
});
