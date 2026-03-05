"use client";

import { useState, useMemo, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { MainLayout } from "@/components/main-layout";
import { Reactions } from "@/components/reactions";
import type { JournalEntry as JournalEntryType } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Share2,
  Printer,
  Minus,
  Plus,
  List,
  X,
  CalendarIcon,
  Clock,
  Loader2,
  Twitter,
  Facebook,
  Linkedin,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { enUS } from "date-fns/locale";

// Calculate reading time using mixed character and word density.
function calculateReadingTime(content: string): number {
  const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
  const totalMinutes = (chineseChars / 200) + (englishWords / 200);
  return Math.max(1, Math.ceil(totalMinutes));
}

function normalizeJournalEntries(payload: unknown): JournalEntryType[] {
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
    const tags = Array.isArray(candidate.tags)
      ? candidate.tags.filter((tag): tag is string => typeof tag === "string")
      : [];

    if (
      typeof candidate.id !== "string" ||
      typeof candidate.title !== "string" ||
      typeof candidate.date !== "string" ||
      typeof candidate.content !== "string" ||
      typeof candidate.image !== "string"
    ) {
      return [];
    }

    return [{
      id: candidate.id,
      title: candidate.title,
      date: candidate.date,
      tags,
      content: candidate.content,
      quote: typeof candidate.quote === "string" ? candidate.quote : undefined,
      image: candidate.image,
      imageAlt:
        typeof candidate.imageAlt === "string" && candidate.imageAlt.length > 0
          ? candidate.imageAlt
          : candidate.title,
    }];
  });
}

// Enhanced Journal Entry Component
interface JournalEntryProps {
  entry: JournalEntryType;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  fontSize: number;
  showReadingProgress: boolean;
  onShare: (entry: JournalEntryType) => void;
}

function JournalEntryComponent({
  entry,
  index,
  isExpanded,
  onToggle,
  fontSize,
  showReadingProgress,
  onShare,
}: JournalEntryProps) {
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Compute display progress - show 0 when not expanded or progress disabled
  const displayProgress = (isExpanded && showReadingProgress) ? scrollProgress : 0;

  // Reading progress tracking - only when expanded and progress enabled
  useEffect(() => {
    if (!isExpanded || !showReadingProgress) {
      return;
    }

    let animationFrameId: number;

    const handleScroll = () => {
      if (!contentRef.current) return;
      
      const entryEl = contentRef.current;
      const rect = entryEl.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      if (rect.top < windowHeight && rect.bottom > 0) {
        const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
        const totalHeight = rect.height;
        const progress = Math.min(100, Math.max(0, (visibleHeight / totalHeight) * 100));
        
        // Batch update via animation frame
        cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(() => {
          setScrollProgress(progress);
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isExpanded, showReadingProgress]);

  const copyQuote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (entry.quote) {
      await navigator.clipboard.writeText(entry.quote);
      setCopiedQuote(true);
      setTimeout(() => setCopiedQuote(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "MMM d", { locale: enUS });
  };

  const readingTime = calculateReadingTime(entry.content);
  const expandedContentId = `entry-content-${entry.id}`;

  const handleToggleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onToggle();
    }
  };

  return (
    <motion.article
      id={`entry-${entry.id}`}
      ref={contentRef}
      initial={{ opacity: 0, x: -15 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={cn(
        "journal-entry group relative",
        isExpanded && "bg-accent/30"
      )}
    >
      {/* Reading Progress Bar */}
      {isExpanded && showReadingProgress && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className="absolute top-0 left-0 right-0 h-1 bg-primary/20 origin-left"
        >
          <div
            className="h-full bg-primary transition-all duration-150"
            style={{ width: `${displayProgress}%` }}
          />
        </motion.div>
      )}

      <div
        className="flex gap-3"
        onClick={onToggle}
        onKeyDown={handleToggleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-controls={expandedContentId}
      >
        {/* Image */}
        <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden">
          <Image
            src={entry.image}
            alt={entry.imageAlt}
            fill
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-serif text-base md:text-lg font-semibold group-hover:text-primary transition-colors">
                {entry.title}
              </h2>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <time className="font-mono text-xs text-muted-foreground">
                  {formatDate(entry.date)}
                </time>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {readingTime} min
                </span>
                {entry.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 text-[10px] rounded bg-accent text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0"
            >
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </motion.div>
          </div>

          {/* Preview Text */}
          <p
            className={cn(
              "mt-2 text-muted-foreground line-clamp-2 transition-all duration-200",
              isExpanded && "hidden"
            )}
            style={{ fontSize: `${fontSize}px` }}
          >
            {entry.content}
          </p>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id={expandedContentId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-border/50">
              {/* Markdown Content */}
              <div
                className="prose prose-sm dark:prose-invert max-w-none mb-4"
                style={{ fontSize: `${fontSize}px` }}
              >
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="text-muted-foreground leading-relaxed mb-2">
                        {children}
                      </p>
                    ),
                    strong: ({ children }) => (
                      <strong className="text-foreground font-semibold">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic">{children}</em>
                    ),
                    code: ({ children }) => (
                      <code className="bg-accent px-1.5 py-0.5 rounded text-xs font-mono">
                        {children}
                      </code>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside mb-2 text-muted-foreground">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside mb-2 text-muted-foreground">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="mb-1">{children}</li>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-primary/50 pl-3 my-2 text-muted-foreground italic">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {entry.content}
                </ReactMarkdown>
              </div>

              {/* Quote */}
              {entry.quote && (
                <div className="relative mb-3">
                  <blockquote className="quote-block text-base py-2 pr-10">
                    {entry.quote}
                  </blockquote>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={copyQuote}
                        className="absolute top-0 right-0 p-1.5 rounded-full hover:bg-accent transition-colors"
                        aria-label="Copy quote"
                      >
                        {copiedQuote ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {copiedQuote ? "Copied!" : "Copy quote"}
                    </TooltipContent>
                  </Tooltip>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <Reactions itemId={entry.id} />
                
                {/* Share Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onShare(entry);
                      }}
                      className="h-8 px-2"
                      aria-label="Share entry"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share entry</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

// Table of Contents Component
interface TableOfContentsProps {
  entries: JournalEntryType[];
  activeEntryId: string | null;
  onEntryClick: (id: string) => void;
}

function TableOfContents({ entries, activeEntryId, onEntryClick }: TableOfContentsProps) {
  return (
    <div className="hidden lg:block sticky top-24 w-64 flex-shrink-0">
      <div className="bg-card/50 backdrop-blur-sm rounded-lg border border-border/50 p-4">
        <h2 className="font-serif text-sm font-semibold mb-3 flex items-center gap-2">
          <List className="w-4 h-4" />
          Table of Contents
        </h2>
        <ScrollArea className="h-[calc(100vh-200px)]">
          <nav className="space-y-1">
            {entries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => onEntryClick(entry.id)}
                className={cn(
                  "w-full text-left text-sm py-2 px-3 rounded-md transition-colors hover:bg-accent",
                  activeEntryId === entry.id && "bg-accent text-primary font-medium"
                )}
              >
                <span className="line-clamp-1">{entry.title}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {format(parseISO(entry.date), "MMM d")}
                </span>
              </button>
            ))}
          </nav>
        </ScrollArea>
      </div>
    </div>
  );
}

// Share Dialog Component
interface ShareDialogProps {
  entry: JournalEntryType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ShareDialog({ entry, open, onOpenChange }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const shareUrl = typeof window !== "undefined" && entry
    ? `${window.location.origin}/journal#entry-${entry.id}`
    : "";
  const shareText = entry ? `"${entry.title}" - ${entry.content.slice(0, 100)}...` : "";
  const dialogTitleId = entry ? `share-dialog-title-${entry.id}` : "share-dialog-title";
  const dialogDescriptionId = entry ? `share-dialog-description-${entry.id}` : "share-dialog-description";

  useEffect(() => {
    if (!open || !entry) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    dialogRef.current?.focus();

    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange, entry]);

  if (!entry) return null;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareActions = [
    {
      name: "Copy Link",
      icon: copied ? Check : Link2,
      onClick: handleCopyLink,
    },
    {
      name: "Twitter",
      icon: Twitter,
      onClick: () => window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        "_blank"
      ),
    },
    {
      name: "Facebook",
      icon: Facebook,
      onClick: () => window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        "_blank"
      ),
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      onClick: () => window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        "_blank"
      ),
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
          />
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-card rounded-lg border border-border p-6 shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            aria-describedby={dialogDescriptionId}
            tabIndex={-1}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id={dialogTitleId} className="font-serif text-lg font-semibold">
                Share Entry
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8"
                aria-label="Close share dialog"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <p id={dialogDescriptionId} className="text-sm text-muted-foreground mb-4">
              Share &ldquo;{entry.title}&rdquo; with others
            </p>

            <div className="grid grid-cols-4 gap-2">
              {shareActions.map((action) => (
                <Tooltip key={action.name}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={action.onClick}
                      className="h-12 w-12"
                      aria-label={action.name}
                    >
                      <action.icon className="w-5 h-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{action.name}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Main Journal Page
export default function JournalPage() {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [fontSize, setFontSize] = useState(14);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [shareEntry, setShareEntry] = useState<JournalEntryType | null>(null);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [showReadingProgress, setShowReadingProgress] = useState(true);
  const [journalEntries, setJournalEntries] = useState<JournalEntryType[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
  const [entriesLoadError, setEntriesLoadError] = useState("");

  // Refs
  const entriesContainerRef = useRef<HTMLDivElement>(null);
  const initialHashHandledRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const loadEntries = async () => {
      try {
        setIsLoadingEntries(true);
        setEntriesLoadError("");

        const response = await fetch("/api/journal?limit=200&sortBy=date&sortOrder=desc", {
          cache: "no-store",
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          const message =
            typeof payload?.error === "string"
              ? payload.error
              : "Unable to load journal entries.";
          throw new Error(message);
        }

        const normalized = normalizeJournalEntries(payload);
        if (isMounted) {
          setJournalEntries(normalized);
        }
      } catch (error) {
        if (isMounted) {
          setJournalEntries([]);
          setEntriesLoadError(
            error instanceof Error ? error.message : "Unable to load journal entries."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingEntries(false);
        }
      }
    };

    loadEntries();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return journalEntries.filter((entry) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = entry.title.toLowerCase().includes(query);
        const matchesContent = entry.content.toLowerCase().includes(query);
        const matchesTags = entry.tags.some((tag) => tag.toLowerCase().includes(query));
        if (!matchesTitle && !matchesContent && !matchesTags) {
          return false;
        }
      }

      // Date range filter
      if (dateRange.from || dateRange.to) {
        const entryDate = parseISO(entry.date);
        if (dateRange.from && dateRange.to) {
          if (
            !isWithinInterval(entryDate, {
              start: startOfDay(dateRange.from),
              end: endOfDay(dateRange.to),
            })
          ) {
            return false;
          }
        } else if (dateRange.from && entryDate < startOfDay(dateRange.from)) {
          return false;
        } else if (dateRange.to && entryDate > endOfDay(dateRange.to)) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, dateRange]);

  // Toggle entry expansion
  const toggleEntry = useCallback((id: string) => {
    setExpandedEntries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Expand all entries
  const expandAll = useCallback(() => {
    setExpandedEntries(new Set(filteredEntries.map((e) => e.id)));
  }, [filteredEntries]);

  // Collapse all entries
  const collapseAll = useCallback(() => {
    setExpandedEntries(new Set());
  }, []);

  // Scroll to entry
  const scrollToEntry = useCallback((id: string) => {
    const element = document.getElementById(`entry-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setExpandedEntries((prev) => new Set([...prev, id]));
    }
  }, []);

  // Handle hash on mount using layout effect to prevent flickering
  useLayoutEffect(() => {
    if (initialHashHandledRef.current) return;
    initialHashHandledRef.current = true;
    
    if (window.location.hash) {
      const id = window.location.hash.replace("#entry-", "");
      // Use a small timeout to ensure DOM is ready
      setTimeout(() => {
        const element = document.getElementById(`entry-${id}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
          setExpandedEntries((prev) => new Set([...prev, id]));
        }
      }, 100);
    }
  }, []);

  // Track active entry on scroll
  useEffect(() => {
    const handleScroll = () => {
      const entries = document.querySelectorAll("[id^='entry-']");
      let closestEntry: string | null = null;
      let minDistance = Infinity;

      entries.forEach((entry) => {
        const rect = entry.getBoundingClientRect();
        const distance = Math.abs(rect.top - 100);
        if (distance < minDistance && rect.top < window.innerHeight) {
          minDistance = distance;
          closestEntry = entry.id.replace("entry-", "");
        }
      });

      if (closestEntry) {
        setActiveEntryId(closestEntry);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Print handler
  const handlePrint = useCallback(() => {
    setIsPrintMode(true);
    expandAll();
    setTimeout(() => {
      window.print();
      setIsPrintMode(false);
    }, 100);
  }, [expandAll]);

  // Clear date filter
  const clearDateFilter = useCallback(() => {
    setDateRange({ from: undefined, to: undefined });
  }, []);

  return (
    <MainLayout>
      <div className={cn("max-w-3xl mx-auto px-4", isPrintMode && "print:max-w-none print:px-0")}>
        {/* Page Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-6 md:py-8"
        >
          <h1 className="font-serif text-3xl md:text-4xl mb-2">
            Journal
          </h1>
          <p className="text-sm text-muted-foreground">
            Daily musings and the quiet poetry of everyday life.
          </p>
        </motion.header>

        {/* Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-card/50 backdrop-blur-sm rounded-lg border border-border/50"
        >
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {/* Date Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <CalendarIcon className="w-4 h-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM d")
                  )
                ) : (
                  "Date"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range) => {
                  setDateRange({
                    from: range?.from,
                    to: range?.to,
                  });
                }}
                numberOfMonths={2}
              />
              {dateRange.from && (
                <div className="p-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearDateFilter}
                    className="w-full"
                  >
                    Clear date filter
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Expand/Collapse */}
          <div className="flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={expandAll}
                  className="h-9 px-2"
                  aria-label="Expand all journal entries"
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Expand all</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={collapseAll}
                  className="h-9 px-2"
                  aria-label="Collapse all journal entries"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Collapse all</TooltipContent>
            </Tooltip>
          </div>

          {/* Font Size */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <span className="text-sm font-medium">Aa</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-4" align="end">
              <div className="space-y-3">
                <label className="text-sm font-medium">Font Size</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setFontSize((s) => Math.max(12, s - 1))}
                    aria-label="Decrease journal font size"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Slider
                    value={[fontSize]}
                    onValueChange={([value]) => setFontSize(value)}
                    min={12}
                    max={20}
                    step={1}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setFontSize((s) => Math.min(20, s + 1))}
                    aria-label="Increase journal font size"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  {fontSize}px
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Print */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="h-9 px-2"
                aria-label="Print journal entries"
              >
                <Printer className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Print entries</TooltipContent>
          </Tooltip>

          {/* Reading Progress Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={showReadingProgress ? "default" : "outline"}
                size="sm"
                onClick={() => setShowReadingProgress(!showReadingProgress)}
                className="h-9 px-2"
                aria-label={showReadingProgress ? "Hide reading progress" : "Show reading progress"}
              >
                <Clock className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {showReadingProgress ? "Hide progress" : "Show reading progress"}
            </TooltipContent>
          </Tooltip>
        </motion.div>

        {/* Results info */}
        {(searchQuery || dateRange.from) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 text-sm text-muted-foreground"
          >
            Showing {filteredEntries.length} of {journalEntries.length} entries
            {searchQuery && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="ml-2 h-auto p-0"
              >
                Clear search
              </Button>
            )}
          </motion.div>
        )}

        {entriesLoadError && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {entriesLoadError}
          </div>
        )}

        {/* Main Content with Sidebar */}
        <div className="flex gap-8">
          {/* Table of Contents Sidebar */}
          <TableOfContents
            entries={filteredEntries}
            activeEntryId={activeEntryId}
            onEntryClick={scrollToEntry}
          />

          {/* Journal Entries */}
          <div ref={entriesContainerRef} className="flex-1 space-y-3">
            {isLoadingEntries ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading journal entries...
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>
                  {searchQuery || dateRange.from
                    ? "No entries found matching your criteria."
                    : "No journal entries published yet."}
                </p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery("");
                    clearDateFilter();
                  }}
                  className="mt-2"
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              filteredEntries.map((entry, index) => (
                <JournalEntryComponent
                  key={entry.id}
                  entry={entry}
                  index={index}
                  isExpanded={expandedEntries.has(entry.id)}
                  onToggle={() => toggleEntry(entry.id)}
                  fontSize={fontSize}
                  showReadingProgress={showReadingProgress}
                  onShare={setShareEntry}
                />
              ))
            )}
          </div>
        </div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 py-6 border-t border-border"
        >
          <blockquote className="quote-block text-center border-none pl-0">
            <p className="text-lg md:text-xl">
              &ldquo;The best camera is the one you have with you. The best moment is the one you&apos;re living now.&rdquo;
            </p>
          </blockquote>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center gap-6 py-4 text-center border-t border-border"
        >
          <div>
            <p className="font-serif text-xl font-bold text-primary">
              {journalEntries.length}
            </p>
            <p className="text-xs text-muted-foreground">Entries</p>
          </div>
          <div className="w-px bg-border" />
          <div>
            <p className="font-serif text-xl font-bold text-primary">
              {new Set(journalEntries.flatMap((e) => e.tags)).size}
            </p>
            <p className="text-xs text-muted-foreground">Topics</p>
          </div>
        </motion.div>
      </div>

      {/* Share Dialog */}
      <ShareDialog
        entry={shareEntry}
        open={!!shareEntry}
        onOpenChange={(open) => !open && setShareEntry(null)}
      />

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:max-w-none,
          .print\\:max-w-none * {
            visibility: visible;
          }
          .print\\:max-w-none {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .journal-entry {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </MainLayout>
  );
}
