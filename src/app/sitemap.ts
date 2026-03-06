import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.douglasmitchell.info";

const routes = [
  "",
  "/about",
  "/contact",
  "/events",
  "/faq",
  "/galleries",
  "/journal",
  "/press-kit",
  "/samples",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.douglasmitchell.info";
  const lastModified = new Date();

  return staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
