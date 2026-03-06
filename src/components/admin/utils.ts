// Utility functions for admin components

import type { GalleryImage, JournalEntry } from "./types";

export function normalizeApiItems<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "items" in data &&
    Array.isArray((data as { items?: unknown }).items)
  ) {
    return (data as { items: T[] }).items;
  }

  return [];
}

export function extractApiErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload !== "object" || payload === null) {
    return fallback;
  }

  const response = payload as {
    error?: unknown;
    details?: unknown;
  };

  if (typeof response.error === "string" && response.error.trim().length > 0) {
    if (response.error !== "Validation failed" && response.error !== "Internal server error") {
      return response.error;
    }
  }

  if (
    typeof response.details === "object" &&
    response.details !== null &&
    "errors" in response.details
  ) {
    const errors = (response.details as { errors?: unknown }).errors;
    if (Array.isArray(errors)) {
      const firstError = errors.find(
        (item): item is { message: string } =>
          typeof item === "object" &&
          item !== null &&
          "message" in item &&
          typeof (item as { message?: unknown }).message === "string"
      );

      if (firstError?.message) {
        return firstError.message;
      }
    }
  }

  if (typeof response.error === "string" && response.error.trim().length > 0) {
    return response.error;
  }

  return fallback;
}

export function extractImportPayload(input: unknown): Record<string, unknown> {
  if (typeof input !== "object" || input === null) {
    return {};
  }

  const hasImportKeys = (value: unknown): value is Record<string, unknown> => {
    if (typeof value !== "object" || value === null) {
      return false;
    }

    const candidate = value as Record<string, unknown>;
    return (
      "gallery" in candidate ||
      "galleryImages" in candidate ||
      "journal" in candidate ||
      "journalEntries" in candidate ||
      "settings" in candidate
    );
  };

  const root = input as Record<string, unknown>;
  const firstData = root.data;
  const secondData =
    typeof firstData === "object" && firstData !== null
      ? (firstData as Record<string, unknown>).data
      : undefined;

  const candidates: unknown[] = [root, firstData, secondData];
  const payload = candidates.find(hasImportKeys);
  return payload ?? {};
}

export function containsCjkText(value: string): boolean {
  return /[\u3400-\u9fff]/.test(value);
}

export function normalizeGalleryItem(item: unknown): GalleryImage | null {
  if (typeof item !== "object" || item === null) {
    return null;
  }

  const obj = item as Record<string, unknown>;
  const series = obj.series;

  if (series !== "recent-post" && series !== "tech-deck" && series !== "project") {
    return null;
  }

  return {
    id: typeof obj.id === "string" ? obj.id : "",
    src: typeof obj.src === "string" ? obj.src : "",
    alt: typeof obj.alt === "string" ? obj.alt : "Untitled image",
    caption: typeof obj.caption === "string" ? obj.caption : "",
    width: typeof obj.width === "number" ? obj.width : 1,
    height: typeof obj.height === "number" ? obj.height : 1,
    date:
      typeof obj.date === "string" && obj.date.length > 0
        ? obj.date
        : new Date().toISOString().split("T")[0],
    order: typeof obj.order === "number" ? obj.order : 0,
    series,
    blurDataUrl: typeof obj.blurDataUrl === "string" ? obj.blurDataUrl : undefined,
  };
}

export function normalizeJournalEntry(
  entry: Record<string, unknown>,
  fallbackLookup: Map<string, JournalEntry>
): JournalEntry {
  const safeTags = Array.isArray(entry.tags)
    ? entry.tags.filter((tag): tag is string => typeof tag === "string")
    : [];

  const safeTitle = typeof entry.title === "string" ? entry.title : "Untitled entry";
  const safeContent = typeof entry.content === "string" ? entry.content : "";
  const safeDate =
    typeof entry.date === "string" && entry.date.length > 0
      ? entry.date
      : new Date().toISOString().split("T")[0];
  const safeImage =
    typeof entry.image === "string" && entry.image.length > 0
      ? entry.image
      : "/images/journal/jr-1.png";
  const safeImageAlt =
    typeof entry.imageAlt === "string" && entry.imageAlt.length > 0
      ? entry.imageAlt
      : "Journal image";

  const fallback =
    typeof entry.id === "string" ? fallbackLookup.get(entry.id) : undefined;

  const shouldApplyFallback =
    Boolean(fallback) &&
    (containsCjkText(safeTitle) ||
      containsCjkText(safeContent) ||
      safeTags.some((tag) => containsCjkText(tag)));

  return {
    id: typeof entry.id === "string" ? entry.id : "",
    title: shouldApplyFallback ? fallback!.title : safeTitle,
    content: shouldApplyFallback ? fallback!.content : safeContent,
    date: shouldApplyFallback ? fallback!.date : safeDate,
    image: shouldApplyFallback ? fallback!.image : safeImage,
    imageAlt: shouldApplyFallback ? fallback!.imageAlt : safeImageAlt,
    quote:
      shouldApplyFallback
        ? fallback!.quote
        : typeof entry.quote === "string"
          ? entry.quote
          : undefined,
    tags: shouldApplyFallback ? fallback!.tags : safeTags,
    order: typeof entry.order === "number" ? entry.order : 0,
  };
}