import { db } from '@/lib/db';
import { getAiApiKey } from '@/lib/ai-helpers';
import { featuredArticles, featuredProjects, bookShowcase, certificationShowcase } from '@/lib/site-content';

function articleBody(slug: string) {
  const articles: Record<string, string> = {
    'rizz-prompting-attractor-based-style-steering':
      `# RIZZ Prompting: Attractor-Based Style Steering\n\nModern LLM prompting frameworks fall into heuristics — "be polite," "think step-by-step," "role-play as X." RIZZ replaces heuristic prompting with attractor-based trajectory steering grounded in dynamical systems theory.\n\n## The Problem\n\nPrompt engineering today treats LLMs as conversational agents with adjustable temperature and top_p. But these are crude trajectory knobs — they do not steer the latent-space attractor dynamics that actually govern generation quality.\n\n## The RIZZ Framework\n\n- **R**esonance: Match the prompt semantic topology to the target output manifold.\n- **I**nstruction: Provide a latent-space gradient, not a linguistic instruction.\n- **Z**ero-shot alignment: Exploit model priors rather than few-shot exemplars.\n- **Z**ero-temperature anchoring: Use deterministic decoding as a constraints probe.\n\n## Results\n\nEarly experiments show 12–18% improvement on reasoning benchmarks when switching from CoT to RIZZ-structured prompts. RIZZ-produced outputs show lower semantic entropy across multiple samples.`,
  };
  return articles[slug] || `# ${slug}\n\nContent for ${slug}`;
}

export async function seedContent() {
  // Seed articles
  for (const article of featuredArticles) {
    await db.article.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        excerpt: article.excerpt,
        category: article.category.toLowerCase(),
        tags: JSON.stringify(article.tags),
        featured: article.featured,
        published: true,
        content: articleBody(article.slug),
        readingTime: Number.parseInt(article.readTime, 10) || 5,
        publishedAt: new Date(),
      },
      create: {
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        category: article.category.toLowerCase(),
        tags: JSON.stringify(article.tags),
        featured: article.featured,
        published: true,
        content: articleBody(article.slug),
        readingTime: Number.parseInt(article.readTime, 10) || 5,
        publishedAt: new Date(),
      },
    });
  }

  const projectSlugs: string[] = [];

  // Seed projects
  for (const project of featuredProjects) {
    projectSlugs.push(project.slug);
    await db.project.upsert({
      where: { slug: project.slug },
      update: {
        title: project.title,
        description: project.description,
        longDescription: project.longDescription,
        category: project.category,
        techStack: JSON.stringify(project.techStack),
        githubUrl: project.githubUrl,
        featured: project.featured,
        status: project.status || 'completed',
      },
      create: {
        slug: project.slug,
        title: project.title,
        description: project.description,
        longDescription: project.longDescription,
        category: project.category,
        techStack: JSON.stringify(project.techStack),
        githubUrl: project.githubUrl,
        featured: project.featured,
        status: project.status || 'completed',
      },
    });
  }

  // Seed book
  const bookId = 'book-the-confident-mind';
  await db.book.upsert({
    where: { id: bookId },
    update: {
      title: bookShowcase.title,
      subtitle: bookShowcase.subtitle,
      description: bookShowcase.description,
      amazonUrl: bookShowcase.amazonUrl,
      featured: true,
    },
    create: {
      id: bookId,
      title: bookShowcase.title,
      subtitle: bookShowcase.subtitle,
      description: bookShowcase.description,
      amazonUrl: bookShowcase.amazonUrl,
      featured: true,
    },
  });

  // Seed certifications
  const certIds = ['cert-google-ai', 'cert-anthropic-safety'];
  for (let i = 0; i < certificationShowcase.length && i < 2; i++) {
    const cert = certificationShowcase[i];
    await db.certification.upsert({
      where: { id: certIds[i] },
      update: {
        title: cert.title,
        issuer: cert.issuer,
        description: cert.description,
        credentialUrl: cert.credentialUrl,
        skills: JSON.stringify(cert.skills),
        featured: cert.featured,
        issueDate: new Date('2024-01-01'),
      },
      create: {
        id: certIds[i],
        title: cert.title,
        issuer: cert.issuer,
        description: cert.description,
        credentialUrl: cert.credentialUrl,
        skills: JSON.stringify(cert.skills),
        featured: cert.featured,
        issueDate: new Date('2024-01-01'),
      },
    });
  }

  const aiKey = getAiApiKey();

  return {
    articles: featuredArticles.length,
    projects: featuredProjects.length,
    book: 1,
    certifications: Math.min(certificationShowcase.length, 2),
    aiAvailable: !!aiKey,
  };
}
