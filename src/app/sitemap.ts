import type { MetadataRoute } from "next";

const siteUrl = "https://www.douglasmitchell.info";

const publicRoutes = [
  { path: "", priority: 1.0 },
  { path: "/about", priority: 0.8 },
  { path: "/galleries", priority: 0.9 },
  { path: "/journal", priority: 0.8 },
  { path: "/contact", priority: 0.7 },
  { path: "/faq", priority: 0.6 },
  { path: "/events", priority: 0.6 },
  { path: "/press-kit", priority: 0.5 },
  { path: "/samples", priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route.priority,
  }));
}
