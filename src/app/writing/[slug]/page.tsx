import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleTemplate } from '@/components/templates/article-template';
import { SecondaryPageShell } from '@/components/templates/secondary-page-shell';
import { getArticleBySlug } from '@/lib/content-service';
import { featuredArticles } from '@/lib/site-content';

export const revalidate = 3600;
export const dynamicParams = true;

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return featuredArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Article not found',
    };
  }

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      url: `https://douglasmitchell.info/writing/${slug}`,
      publishedTime: article.date,
      authors: ['Douglas Mitchell'],
      tags: article.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const related = featuredArticles
    .filter((item) => item.slug !== slug)
    .slice(0, 2);

  return (
    <SecondaryPageShell trackPageView>
      <ArticleTemplate article={article} related={related} />
    </SecondaryPageShell>
  );
}
