"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MainLayout } from "@/components/main-layout";
import { ImageCard } from "@/components/image-card";
import { Lightbox } from "@/components/lightbox";
import { galleryImages as fallbackGalleryImages, type GalleryImage } from "@/lib/data";
import { useLightboxStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Search, ArrowUpDown, Grid3X3, Loader2, Image as ImageIcon, Calendar, Layers } from "lucide-react";

type SeriesKey = "recent-post" | "tech-deck" | "project";
type SortOrder = "newest" | "oldest";

const ITEMS_PER_PAGE = 9;

function normalizeGalleryItems(payload: unknown): GalleryImage[] {
  if (typeof payload !== "object" || payload === null) {
    return [];
  }

  const data = (payload as { data?: unknown }).data;
  const items =
    Array.isArray(data)
      ? data
      : typeof data === "object" && data !== null && Array.isArray((data as { items?: unknown }).items)
        ? (data as { items: unknown[] }).items
        : [];

  return items.flatMap((item) => {
    if (typeof item !== "object" || item === null) {
      return [];
    }

    const candidate = item as Record<string, unknown>;
    const series = candidate.series;
    if (series !== "recent-post" && series !== "tech-deck" && series !== "project") {
      return [];
    }

    if (
      typeof candidate.id !== "string" ||
      typeof candidate.src !== "string" ||
      typeof candidate.alt !== "string" ||
      typeof candidate.caption !== "string" ||
      typeof candidate.width !== "number" ||
      typeof candidate.height !== "number" ||
      typeof candidate.date !== "string"
    ) {
      return [];
    }

    return [{
      id: candidate.id,
      src: candidate.src,
      alt: candidate.alt,
      caption: candidate.caption,
      series,
      width: candidate.width,
      height: candidate.height,
      date: candidate.date,
      blurDataUrl: typeof candidate.blurDataUrl === "string" ? candidate.blurDataUrl : undefined,
    }];
  });
}

export default function GalleriesPage() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(fallbackGalleryImages);
  const [isLoadingGallery, setIsLoadingGallery] = useState(true);
  const [galleryLoadError, setGalleryLoadError] = useState("");
  const [activeSeries, setActiveSeries] = useState<SeriesKey | "all">("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
  const { open, setCurrentIndex } = useLightboxStore();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let isMounted = true;

    const loadGallery = async () => {
      try {
        setIsLoadingGallery(true);
        setGalleryLoadError("");

        const response = await fetch("/api/gallery?limit=500&sortBy=date&sortOrder=desc", {
          cache: "no-store",
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          const message =
            typeof payload?.error === "string"
              ? payload.error
              : "Unable to load gallery images.";
          throw new Error(message);
        }

        const normalized = normalizeGalleryItems(payload);
        if (isMounted) {
          setGalleryImages(normalized.length > 0 ? normalized : []);
        }
      } catch (error) {
        if (isMounted) {
          setGalleryImages([]);
          setGalleryLoadError(
            error instanceof Error ? error.message : "Unable to load gallery images."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingGallery(false);
        }
      }
    };

    loadGallery();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter and sort images
  const filteredImages = useMemo(() => {
    let result = [...galleryImages];

    // Filter by series
    if (activeSeries !== "all") {
      result = result.filter((img) => img.series === activeSeries);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (img) =>
          img.alt.toLowerCase().includes(query) ||
          img.caption.toLowerCase().includes(query)
      );
    }

    // Sort by date
    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [activeSeries, sortOrder, searchQuery]);

  // Paginated images
  const displayedImages = useMemo(() => {
    return filteredImages.slice(0, displayCount);
  }, [filteredImages, displayCount]);

  // Calculate statistics
  const stats = useMemo(() => {
    const seriesCounts = {
      "recent-post": galleryImages.filter((img) => img.series === "recent-post").length,
      "tech-deck": galleryImages.filter((img) => img.series === "tech-deck").length,
      "project": galleryImages.filter((img) => img.series === "project").length,
    };

    // Get date range
    const timestamps = galleryImages.map((img) => new Date(img.date).getTime());
    const oldestDate = new Date(Math.min(...timestamps));
    const newestDate = new Date(Math.max(...timestamps));
    
    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    };

    return {
      total: galleryImages.length,
      seriesCounts,
      dateRange: `${formatDate(oldestDate)} - ${formatDate(newestDate)}`,
      showingCount: displayedImages.length,
      filteredTotal: filteredImages.length,
    };
  }, [filteredImages, displayedImages]);

  const hasMore = displayedImages.length < filteredImages.length;

  const handleImageClick = useCallback((index: number) => {
    setCurrentIndex(index);
    open(index);
  }, [setCurrentIndex, open]);

  const handleLoadMore = useCallback(() => {
    setDisplayCount((prev) => prev + ITEMS_PER_PAGE);
  }, []);

  const handleSeriesChange = useCallback((series: SeriesKey | "all") => {
    setActiveSeries(series);
    setDisplayCount(ITEMS_PER_PAGE);
  }, []);

  const handleSortToggle = useCallback(() => {
    setSortOrder((prev) => {
      const newOrder = prev === "newest" ? "oldest" : "newest";
      setDisplayCount(ITEMS_PER_PAGE);
      return newOrder;
    });
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setDisplayCount(ITEMS_PER_PAGE);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const seriesTabs: { key: SeriesKey | "all"; label: string; count: number }[] = [
    { key: "all", label: "All", count: galleryImages.length },
    { key: "recent-post", label: "Recent", count: stats.seriesCounts["recent-post"] },
    { key: "tech-deck", label: "Tech", count: stats.seriesCounts["tech-deck"] },
    { key: "project", label: "Projects", count: stats.seriesCounts["project"] },
  ];

  const filterKey = `${activeSeries}-${sortOrder}-${searchQuery}`;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4">
        {/* Page Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-6 md:py-8"
        >
          <h1 className="font-serif text-3xl md:text-4xl mb-2">
            Galleries
          </h1>
          <p className="text-sm text-muted-foreground">
            Visual narratives at the intersection of architecture, technology, and creative expression.
          </p>
        </motion.header>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="flex flex-wrap items-center gap-4 mb-6 p-4 rounded-xl bg-accent/50"
        >
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary" />
            <span className="text-sm">
              <span className="font-semibold">{stats.total}</span> works
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-sm">
              <span className="font-semibold">3</span> series
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm">{stats.dateRange}</span>
          </div>
          {searchQuery && (
            <div className="ml-auto text-sm text-muted-foreground">
              Showing {stats.showingCount} of {stats.filteredTotal} results
            </div>
          )}
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-4 mb-6"
        >
          {/* Search and Sort Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <label htmlFor="galleries-search" className="sr-only">
                Search galleries
              </label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="galleries-search"
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search images..."
                className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-[10px] text-muted-foreground font-mono">
                ⌘K
              </kbd>
            </div>

            {/* Sort Toggle */}
            <button
              onClick={handleSortToggle}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-background border border-border text-sm hover:bg-accent transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span>{sortOrder === "newest" ? "Newest First" : "Oldest First"}</span>
            </button>
          </div>

          {/* Series Tabs */}
          <div className="flex flex-wrap gap-2">
            {seriesTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleSeriesChange(tab.key)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300",
                  activeSeries === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent hover:bg-accent/80"
                )}
              >
                <span>{tab.label}</span>
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full",
                  activeSeries === tab.key
                    ? "bg-primary-foreground/20"
                    : "bg-background/50"
                )}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {galleryLoadError && (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {galleryLoadError}
          </div>
        )}

        {/* Gallery Masonry Grid */}
        <AnimatePresence mode="wait">
          {isLoadingGallery ? (
            <motion.div
              key="gallery-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-16 text-muted-foreground"
            >
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading gallery...
            </motion.div>
          ) : displayedImages.length > 0 ? (
            <motion.div
              key={filterKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="masonry-grid"
            >
              {displayedImages.map((image, index) => (
                <ImageCard
                  key={image.id}
                  image={image}
                  index={index}
                  onImageClick={handleImageClick}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <Grid3X3 className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <h2 className="font-serif text-xl mb-2">No images found</h2>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Load More Button */}
        {hasMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center mt-8"
          >
            <button
              onClick={handleLoadMore}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              <Loader2 className="w-4 h-4" />
              Load More ({filteredImages.length - displayedImages.length} remaining)
            </button>
          </motion.div>
        )}

        {/* Stats Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 py-6 border-t border-border"
        >
          <div className="text-center p-4 rounded-xl bg-accent/30">
            <p className="font-serif text-2xl md:text-3xl font-bold text-primary">
              {stats.total}
            </p>
            <p className="text-xs text-muted-foreground">Total Works</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-accent/30">
            <p className="font-serif text-2xl md:text-3xl font-bold text-primary">3</p>
            <p className="text-xs text-muted-foreground">Series</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-accent/30">
            <p className="font-serif text-2xl md:text-3xl font-bold text-primary">
              {stats.seriesCounts["recent-post"]}
            </p>
            <p className="text-xs text-muted-foreground">Recent Posts</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-accent/30">
            <p className="font-serif text-2xl md:text-3xl font-bold text-primary">
              {stats.seriesCounts["tech-deck"] + stats.seriesCounts["project"]}
            </p>
            <p className="text-xs text-muted-foreground">Tech & Projects</p>
          </div>
        </motion.div>
      </div>

      {/* Lightbox */}
      <Lightbox images={filteredImages} />
    </MainLayout>
  );
}
