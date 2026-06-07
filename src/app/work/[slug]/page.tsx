import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CaseStudyTemplate } from '@/components/templates/case-study-template';
import { SecondaryPageShell } from '@/components/templates/secondary-page-shell';
import { getProjectBySlug } from '@/lib/content-service';
import { featuredProjects } from '@/lib/site-content';

export const revalidate = 3600;
export const dynamicParams = true;

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

  const currentIndex = featuredProjects.findIndex((p) => p.slug === slug);
  const nextProject =
    currentIndex >= 0 && currentIndex < featuredProjects.length - 1
      ? featuredProjects[currentIndex + 1]
      : null;

  return (
    <SecondaryPageShell trackPageView>
      <CaseStudyTemplate project={project} nextProject={nextProject} />
    </SecondaryPageShell>
  );
}
