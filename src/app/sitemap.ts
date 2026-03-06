import type { MetadataRoute } from 'next';

const siteUrl = process.env.SITE_URL || 'https://www.douglasmitchell.info';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/about', '/galleries', '/journal', '/contact', '/faq', '/events', '/press-kit', '/samples'];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
  }));
}
