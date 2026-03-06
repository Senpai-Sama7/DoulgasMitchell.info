import type { MetadataRoute } from 'next';

const siteUrl = process.env.SITE_URL || 'https://www.douglasmitchell.info';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
