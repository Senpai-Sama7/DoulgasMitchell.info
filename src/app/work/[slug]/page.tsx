import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ContentRenderer } from '@/components/site/content-renderer';
import { ArrowLeft, ArrowUpRight, Github } from 'lucide-react';
import { PageViewTracker } from '@/components/site/page-view-tracker';
import { SiteFooter, SiteHeader } from '@/components/site';
import { getProjectBySlug } from '@/lib/content-service';
import { featuredProjects } from '@/lib/site-content';

interface ProjectPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return featuredProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return {
      title: 'Project not found',
    };
  }

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      type: 'website',
      url: `https://douglasmitchell.info/work/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description,
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <>
      <PageViewTracker />
      <SiteHeader />
      <main className="flex-1 pt-24">
        <div className="editorial-container pb-16">
          <Link href="/#work" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to work
          </Link>

          <section className="mt-8 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-border bg-muted/30 p-8 md:p-10">
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-[0.25em] text-muted-foreground">
                <span>{project.category}</span>
                <span>•</span>
                <span>{project.timeline}</span>
                <span>•</span>
                <span>{project.status}</span>
              </div>

              <h1 className="mt-6 editorial-title">{project.title}</h1>
              <p className="mt-4 editorial-subtitle">{project.description}</p>

              <div className="mt-6 max-w-3xl">
                <ContentRenderer content={project.longDescription} />
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                {project.githubUrl && (
                  <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="cta-button">
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                )}
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="ghost-button">
                    <ArrowUpRight className="h-4 w-4" />
                    Live experience
                  </a>
                )}
              </div>
            </div>

            <aside className="rounded-3xl border border-border bg-background p-6">
              <div className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">Project metrics</div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                {project.metrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-border bg-muted/30 p-4">
                    <div className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
                      {metric.label}
                    </div>
                    <div className="mt-2 text-2xl font-semibold">{metric.value}</div>
                  </div>
                ))}
              </div>
            </aside>
          </section>

          <section className="mt-10 grid gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background p-6 xl:col-span-1">
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Challenge</div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{project.challenge}</p>
            </div>

            <div className="rounded-2xl border border-border bg-background p-6 xl:col-span-1">
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Solution</div>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                {project.solution.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-primary">◆</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-background p-6 xl:col-span-1">
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-primary">Outcomes</div>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                {project.outcomes.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-primary">◆</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mt-10 rounded-3xl border border-border bg-muted/30 p-8">
            <div className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">Stack</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.techStack.map((technology) => (
                <span key={technology} className="rounded-full border border-border bg-background px-3 py-1 text-sm font-mono text-muted-foreground">
                  {technology}
                </span>
              ))}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
