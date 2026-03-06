// Shared types for admin components

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  caption: string;
  series: "recent-post" | "tech-deck" | "project";
  width: number;
  height: number;
  date: string;
  blurDataUrl?: string;
  order: number;
}

export interface JournalEntry {
  id: string;
  title: string;
  date: string;
  tags: string[];
  content: string;
  quote?: string;
  image: string;
  imageAlt: string;
  order: number;
}

export interface Settings {
  id?: string;
  siteTitle: string;
  siteDescription: string;
  linkedin?: string;
  github?: string;
  telegram?: string;
  whatsapp?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  createdAt: string;
}

export interface LayoutBlock {
  id: string;
  key: string;
  label: string;
  type: "hero" | "gallery" | "journal" | "custom";
  gridX: number;
  gridY: number;
  width: number;
  height: number;
  metadata?: Record<string, unknown>;
}

export type Tab = "gallery" | "journal" | "layout" | "settings" | "activity" | "analytics" | "export";

export const seriesOptions = [
  { value: "recent-post", label: "Recent Post" },
  { value: "tech-deck", label: "Tech Deck" },
  { value: "project", label: "Project" },
] as const;

export const layoutTypeOptions = [
  { value: "hero", label: "Hero/Intro" },
  { value: "gallery", label: "Gallery" },
  { value: "journal", label: "Journal" },
  { value: "custom", label: "Custom Widget" },
] as const;