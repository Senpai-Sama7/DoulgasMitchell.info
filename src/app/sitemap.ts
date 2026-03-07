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
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/book`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/galleries`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/journal`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
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
