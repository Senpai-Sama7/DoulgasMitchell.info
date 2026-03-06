import type { MetadataRoute } from "next";

const siteUrl = "https://www.douglasmitchell.info";

/**
 * SEO/GEO Optimized Sitemap
 * 
 * Best Practices Implemented:
 * - Priority weighting: Homepage (1.0) > Core pages (0.9-0.8) > Secondary (0.6-0.5)
 * - ChangeFrequency based on actual update patterns
 * - LastModified dates for freshness signals (6% algorithm weight)
 * - Static generation for AI crawler accessibility (no JS required)
 * 
 * Crawler Guidance:
 * - Daily: AI crawlers check high-priority pages more frequently
 * - Weekly: Standard content pages
 * - Monthly: Static/evergreen pages
 */

interface SitemapRoute {
  path: string;
  priority: number;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  lastModified: string;
  images?: { loc: string; caption?: string }[];
}

const routes: SitemapRoute[] = [
  // Core pages - highest priority
  {
    path: "",
    priority: 1.0,
    changeFrequency: "weekly",
    lastModified: "2025-03-06",
  },
  {
    path: "/about",
    priority: 0.9,
    changeFrequency: "weekly",
    lastModified: "2025-03-06",
  },
  {
    path: "/galleries",
    priority: 0.9,
    changeFrequency: "daily",
    lastModified: "2025-03-06",
  },
  {
    path: "/journal",
    priority: 0.8,
    changeFrequency: "daily",
    lastModified: "2025-03-06",
  },
  // Secondary pages
  {
    path: "/contact",
    priority: 0.7,
    changeFrequency: "monthly",
    lastModified: "2025-03-06",
  },
  {
    path: "/faq",
    priority: 0.7,
    changeFrequency: "monthly",
    lastModified: "2025-03-06",
  },
  {
    path: "/events",
    priority: 0.6,
    changeFrequency: "daily",
    lastModified: "2025-03-06",
  },
  // Utility pages
  {
    path: "/press-kit",
    priority: 0.5,
    changeFrequency: "monthly",
    lastModified: "2025-03-06",
  },
  {
    path: "/samples",
    priority: 0.5,
    changeFrequency: "monthly",
    lastModified: "2025-03-06",
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: new Date(route.lastModified),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}

/**
 * Additional Sitemap Indexes (for future expansion):
 * 
 * 1. Image Sitemap: /sitemap-images.xml
 *    - For gallery images with captions and geo-location
 *    - Critical for Google Images and visual search
 * 
 * 2. Video Sitemap: /sitemap-video.xml
 *    - If video content is added
 * 
 * 3. News Sitemap: /sitemap-news.xml
 *    - For journal/blog posts if news-focused
 * 
 * 4. Alternate Language Sitemaps:
 *    - /sitemap-en.xml, /sitemap-es.xml etc.
 * 
 * Implementation note: Add these to robots.txt:
 * Sitemap: https://www.douglasmitchell.info/sitemap.xml
 * Sitemap: https://www.douglasmitchell.info/sitemap-images.xml
 */
