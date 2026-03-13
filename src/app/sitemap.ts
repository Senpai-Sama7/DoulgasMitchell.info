import type { MetadataRoute } from 'next';
import { featuredArticles, featuredProjects } from '@/lib/site-content';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://douglasmitchell.info';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const articleRoutes: MetadataRoute.Sitemap = featuredArticles.map((article) => ({
    url: `${baseUrl}/writing/${article.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: article.featured ? 0.8 : 0.6,
  }));

  const projectRoutes: MetadataRoute.Sitemap = featuredProjects.map((project) => ({
    url: `${baseUrl}/work/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: project.featured ? 0.8 : 0.6,
  }));

  return [...staticRoutes, ...articleRoutes, ...projectRoutes];
}
