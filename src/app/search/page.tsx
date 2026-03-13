import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, ArrowUpRight } from 'lucide-react';
import { SiteFooter, SiteHeader } from '@/components/site';
import { PageViewTracker } from '@/components/site/page-view-tracker';
import { getSearchableContent } from '@/lib/content-service';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

type SearchResult = {
  kind: 'article' | 'project';
  href: string;
  title: string;
  summary: string;
  category: string;
  metadata: string;
  featured: boolean;
  updatedAt: string;
  keywords: string[];
};

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search writing and project case studies.',
  robots: {
    index: false,
    follow: true,
  },
};

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function scoreResult(result: SearchResult, query: string) {
  if (!query) return 0;

  const normalizedQuery = normalize(query);
  const terms = normalizedQuery.split(/\s+/).filter(Boolean);
  if (terms.length === 0) return 0;

  const title = normalize(result.title);
  const summary = normalize(result.summary);
  const category = normalize(result.category);
  const metadata = normalize(result.metadata);
  const keywords = result.keywords.map(normalize).join(' ');

  let score = 0;
  let hasTermMatch = false;

  for (const term of terms) {
    if (title.includes(term)) {
      score += 8;
      hasTermMatch = true;
    }
    if (category.includes(term)) {
      score += 6;
      hasTermMatch = true;
    }
    if (keywords.includes(term)) {
      score += 5;
      hasTermMatch = true;
    }
    if (summary.includes(term)) {
      score += 3;
      hasTermMatch = true;
    }
    if (metadata.includes(term)) {
      score += 2;
      hasTermMatch = true;
    }
  }

  if (!hasTermMatch) return 0;

  if (title.startsWith(normalizedQuery)) score += 4;
  if (result.featured) score += 1;

  return score;
}

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Recently updated';
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';
  const { articles, projects } = await getSearchableContent();

  const results: SearchResult[] = [
    ...articles.map((article) => ({
      kind: 'article' as const,
      href: `/writing/${article.slug}`,
      title: article.title,
      summary: article.excerpt,
      category: article.category,
      metadata: article.tags.join(' • '),
      featured: article.featured,
      updatedAt: article.updatedAt,
      keywords: article.tags,
    })),
    ...projects.map((project) => ({
      kind: 'project' as const,
      href: `/work/${project.slug}`,
      title: project.title,
      summary: project.description,
      category: project.category,
      metadata: `${project.status} • ${project.techStack.join(' • ')}`,
      featured: project.featured,
      updatedAt: project.updatedAt,
      keywords: project.techStack,
    })),
  ];

  const rankedResults = results
    .map((result) => ({ result, score: scoreResult(result, query) }))
    .filter(({ score }) => (query ? score > 0 : true))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.result.updatedAt.localeCompare(a.result.updatedAt);
    })
    .slice(0, 24)
    .map(({ result }) => result);

  return (
    <>
      <PageViewTracker />
      <SiteHeader />
      <main id="main-content" className="flex-1 pt-24">
        <section className="content-container pb-16">
          <div className="rounded-3xl border border-border bg-muted/30 p-8 md:p-10">
            <h1 className="editorial-title">Search</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              Find writing and project case studies by keyword, category, or stack.
            </p>

            <form action="/search" method="get" className="mt-6">
              <label htmlFor="search-query" className="sr-only">
                Search query
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  id="search-query"
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="Search by title, topic, tag, or stack..."
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
            </form>
          </div>

          <div className="mt-8 space-y-4">
            {query && (
              <p className="text-sm text-muted-foreground">
                {rankedResults.length} result{rankedResults.length === 1 ? '' : 's'} for{' '}
                <span className="font-mono text-foreground">{query}</span>
              </p>
            )}

            {!query && (
              <p className="text-sm text-muted-foreground">
                Start with a keyword like <span className="font-mono text-foreground">automation</span>,{' '}
                <span className="font-mono text-foreground">systems</span>, or{' '}
                <span className="font-mono text-foreground">prompt engineering</span>.
              </p>
            )}

            {query && rankedResults.length === 0 && (
              <div className="rounded-2xl border border-border bg-background p-6 text-sm text-muted-foreground">
                No matching results yet. Try broader keywords.
              </div>
            )}

            <div className="grid gap-4">
              {rankedResults.map((result) => (
                <Link
                  key={`${result.kind}:${result.href}`}
                  href={result.href}
                  className="group rounded-2xl border border-border bg-background p-5 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {result.kind} • {result.category}
                      </div>
                      <h2 className="mt-2 text-lg font-semibold group-hover:text-primary">
                        {result.title}
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground">{result.summary}</p>
                    </div>
                    <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    Updated {formatDate(result.updatedAt)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
