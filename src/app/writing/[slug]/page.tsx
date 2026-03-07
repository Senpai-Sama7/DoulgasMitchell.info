import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Clock, Sparkles } from 'lucide-react';
import { PageViewTracker } from '@/components/site/page-view-tracker';
import { SiteFooter, SiteHeader } from '@/components/site';
import { getArticleBySlug } from '@/lib/content-service';
import { featuredArticles } from '@/lib/site-content';

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
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <>
      <PageViewTracker />
      <SiteHeader />
      <main className="flex-1 pt-24">
        <div className="content-container pb-16">
          <Link href="/#writing" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to writing
          </Link>

          <div className="mt-8 rounded-3xl border border-border bg-muted/30 p-8 md:p-10">
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-[0.25em] text-muted-foreground">
              <span>{article.category}</span>
              <span>•</span>
              <span>{article.date}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {article.readTime}
              </span>
            </div>

            <h1 className="mt-6 editorial-title">{article.title}</h1>
            <p className="mt-4 editorial-subtitle">{article.excerpt}</p>

            <div className="mt-6 rounded-2xl border border-border bg-background/80 p-5">
              <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                <Sparkles className="h-4 w-4" />
                Key insight
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{article.insight}</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-mono text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <article className="reading-content mx-auto mt-10">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
