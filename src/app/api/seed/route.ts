import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';
import { validateTrustedOrigin } from '@/lib/request';
import { featuredArticles } from '@/lib/site-content';

// Seed data for the editorial platform
function parseMonthYearLabel(value: string) {
  const parsed = new Date(value.replace(/^([A-Za-z]{3}) (\d{4})$/, '$1 1, $2'));
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

const seedArticles = featuredArticles.map((article) => ({
  slug: article.slug,
  title: article.title,
  subtitle: null,
  excerpt: article.excerpt,
  content: article.content,
  category: article.category.toLowerCase(),
  tags: JSON.stringify(article.tags),
  featured: article.featured,
  published: true,
  publishedAt: parseMonthYearLabel(article.date),
  readingTime: Number.parseInt(article.readTime, 10) || 5,
}));

const seedProjects = [
  {
    slug: 'ai-workflow-automation',
    title: 'AI Workflow Automation',
    description: 'Intelligent automation systems that streamline operations and reduce manual overhead.',
    category: 'ai-automation',
    featured: true,
    techStack: JSON.stringify(['Python', 'LangChain', 'OpenAI', 'n8n']),
    githubUrl: 'https://github.com/Senpai-Sama7',
  },
  {
    slug: 'confident-mind-platform',
    title: 'The Confident Mind Platform',
    description: 'Digital platform companion for the book, featuring interactive exercises and progress tracking.',
    category: 'web-development',
    featured: true,
    techStack: JSON.stringify(['Next.js', 'TypeScript', 'Prisma', 'Tailwind']),
    githubUrl: 'https://github.com/Senpai-Sama7',
  },
  {
    slug: 'systems-architecture-toolkit',
    title: 'Systems Architecture Toolkit',
    description: 'Collection of reusable patterns and tools for building scalable, maintainable systems.',
    category: 'system-design',
    featured: true,
    techStack: JSON.stringify(['TypeScript', 'Node.js', 'Docker', 'AWS']),
    githubUrl: 'https://github.com/Senpai-Sama7',
  },
];

const seedBook = {
  title: 'The Confident Mind',
  subtitle: 'A Practical Manual to Repair, Build & Sustain Authentic Confidence',
  description: 'Drawing from psychology, personal experience, and real-world application, this book offers a practical framework for building lasting confidence without the toxic self-help baggage.',
  amazonUrl: 'https://www.amazon.com/Confident-Mind-Practical-Authentic-Confidence-ebook/dp/B0FPJPPPC9',
  featured: true,
};

const seedCertifications = [
  {
    title: 'Google AI Professional Certificate',
    issuer: 'Google',
    credentialUrl: 'https://www.credly.com/users/douglas-mitchell.887417ae/badges',
    description: 'Comprehensive AI professional certification covering machine learning fundamentals and responsible AI practices.',
    skills: JSON.stringify(['Machine Learning', 'AI Development', 'Responsible AI', 'TensorFlow']),
    featured: true,
    order: 1,
  },
  {
    title: 'Anthropic AI Safety',
    issuer: 'Anthropic',
    credentialUrl: 'https://www.credly.com/users/douglas-mitchell.887417ae/badges',
    description: 'Certification in AI safety principles and ethical AI deployment practices.',
    skills: JSON.stringify(['AI Safety', 'Ethical AI', 'Responsible Development']),
    featured: true,
    order: 2,
  },
];

export async function GET() {
  if (env.NODE_ENV === 'production' && env.ALLOW_ADMIN_SEED_API !== 'true') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    message: 'Seed data endpoint',
    data: {
      articles: seedArticles,
      projects: seedProjects,
      book: seedBook,
      certifications: seedCertifications,
    },
  });
}

export async function POST(request: Request) {
  try {
    if (env.NODE_ENV === 'production' && env.ALLOW_ADMIN_SEED_API !== 'true') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const originCheck = validateTrustedOrigin(request);
    if (!originCheck.allowed) {
      return NextResponse.json({ error: originCheck.reason }, { status: 403 });
    }

    const { db } = await import('@/lib/db');

    // Seed articles
    for (const article of seedArticles) {
      await db.article.upsert({
        where: { slug: article.slug },
        update: article,
        create: article,
      });
    }

    // Seed projects
    for (const project of seedProjects) {
      await db.project.upsert({
        where: { slug: project.slug },
        update: project,
        create: project,
      });
    }

    // Seed book
    await db.book.upsert({
      where: { id: 'seed-book' },
      update: seedBook,
      create: {
        id: 'seed-book',
        ...seedBook,
      },
    });

    // Seed certifications
    for (const cert of seedCertifications) {
      await db.certification.upsert({
        where: { id: cert.title.toLowerCase().replace(/\s+/g, '-') },
        update: cert,
        create: {
          id: cert.title.toLowerCase().replace(/\s+/g, '-'),
          ...cert,
          issueDate: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
    });
  } catch (error) {
    logger.error('Seed error:', error);
    return NextResponse.json({
      success: false,
      message: 'Seeding completed (some items may already exist)',
    });
  }
}
