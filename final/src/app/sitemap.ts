import type { MetadataRoute } from 'next';
import { featuredArticles, featuredProjects } from '@/lib/site-content';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://douglasmitchell.info';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];

  const articleRoutes: MetadataRoute.Sitemap = featuredArticles.map((article) => ({
    url: `${baseUrl}/writing/${article.slug}`,
    changeFrequency: 'monthly',
    priority: article.featured ? 0.8 : 0.6,
  }));

  const projectRoutes: MetadataRoute.Sitemap = featuredProjects.map((project) => ({
    url: `${baseUrl}/work/${project.slug}`,
    changeFrequency: 'monthly',
    priority: project.featured ? 0.8 : 0.6,
  }));

  return [...staticRoutes, ...articleRoutes, ...projectRoutes];
}
