"use client";

import * as React from "react";

// Types
interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: number;
  type: "gallery" | "journal" | "general";
  resultCount?: number;
}

interface RecentViewItem {
  id: string;
  type: "gallery" | "journal" | "page";
  title: string;
  image?: string;
  url: string;
  timestamp: number;
}

// Storage keys
const SEARCH_HISTORY_KEY = "search_history";
const RECENT_VIEWS_KEY = "recent_views";
const MAX_HISTORY_ITEMS = 50;
const MAX_RECENT_ITEMS = 20;

// Search History Hook
export function useSearchHistory() {
  const [history, setHistory] = React.useState<SearchHistoryItem[]>([]);

  // Load from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load search history:", error);
    }
  }, []);

  // Save to localStorage
  const saveHistory = React.useCallback((items: SearchHistoryItem[]) => {
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Failed to save search history:", error);
    }
  }, []);

  // Add search to history
  const addSearch = React.useCallback(
    (query: string, type: SearchHistoryItem["type"] = "general", resultCount?: number) => {
      if (!query.trim()) return;

      const newItem: SearchHistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        query: query.trim(),
        timestamp: Date.now(),
        type,
        resultCount,
      };

      setHistory((prev) => {
        // Remove duplicate queries
        const filtered = prev.filter((item) => item.query.toLowerCase() !== query.toLowerCase());
        const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
        saveHistory(updated);
        return updated;
      });
    },
    [saveHistory]
  );

  // Remove search from history
  const removeSearch = React.useCallback(
    (id: string) => {
      setHistory((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        saveHistory(updated);
        return updated;
      });
    },
    [saveHistory]
  );

  // Clear all history
  const clearHistory = React.useCallback(() => {
    setHistory([]);
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  }, []);

  // Get unique queries for autocomplete
  const getUniqueQueries = React.useCallback(() => {
    const seen = new Set<string>();
    return history
      .filter((item) => {
        const lower = item.query.toLowerCase();
        if (seen.has(lower)) return false;
        seen.add(lower);
        return true;
      })
      .map((item) => item.query);
  }, [history]);

  // Get recent searches by type
  const getSearchesByType = React.useCallback(
    (type: SearchHistoryItem["type"]) => history.filter((item) => item.type === type),
    [history]
  );

  return {
    history,
    addSearch,
    removeSearch,
    clearHistory,
    getUniqueQueries,
    getSearchesByType,
  };
}

// Recent Views Hook
export function useRecentViews() {
  const [recentViews, setRecentViews] = React.useState<RecentViewItem[]>([]);

  // Load from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_VIEWS_KEY);
      if (stored) {
        setRecentViews(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load recent views:", error);
    }
  }, []);

  // Save to localStorage
  const saveRecentViews = React.useCallback((items: RecentViewItem[]) => {
    try {
      localStorage.setItem(RECENT_VIEWS_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Failed to save recent views:", error);
    }
  }, []);

  // Add view
  const addView = React.useCallback(
    (item: Omit<RecentViewItem, "id" | "timestamp">) => {
      const newItem: RecentViewItem = {
        ...item,
        id: `${item.type}-${item.url}`,
        timestamp: Date.now(),
      };

      setRecentViews((prev) => {
        // Remove existing item with same URL
        const filtered = prev.filter((v) => v.url !== item.url);
        const updated = [newItem, ...filtered].slice(0, MAX_RECENT_ITEMS);
        saveRecentViews(updated);
        return updated;
      });
    },
    [saveRecentViews]
  );

  // Remove view
  const removeView = React.useCallback(
    (id: string) => {
      setRecentViews((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        saveRecentViews(updated);
        return updated;
      });
    },
    [saveRecentViews]
  );

  // Clear all views
  const clearViews = React.useCallback(() => {
    setRecentViews([]);
    localStorage.removeItem(RECENT_VIEWS_KEY);
  }, []);

  // Get views by type
  const getViewsByType = React.useCallback(
    (type: RecentViewItem["type"]) => recentViews.filter((item) => item.type === type),
    [recentViews]
  );

  // Get recent views (last N hours)
  const getRecentByTime = React.useCallback(
    (hours: number) => {
      const cutoff = Date.now() - hours * 60 * 60 * 1000;
      return recentViews.filter((item) => item.timestamp > cutoff);
    },
    [recentViews]
  );

  return {
    recentViews,
    addView,
    removeView,
    clearViews,
    getViewsByType,
    getRecentByTime,
  };
}

// Combined hook for search with history
interface UseSearchWithHistoryOptions {
  type?: SearchHistoryItem["type"];
  maxSuggestions?: number;
}

export function useSearchWithHistory(options: UseSearchWithHistoryOptions = {}) {
  const { type = "general", maxSuggestions = 5 } = options;
  const { history, addSearch, getUniqueQueries } = useSearchHistory();
  const [query, setQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);

  // Get suggestions based on current query
  const suggestions = React.useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return getUniqueQueries()
      .filter((q) => q.toLowerCase().includes(lowerQuery) && q.toLowerCase() !== lowerQuery)
      .slice(0, maxSuggestions);
  }, [query, getUniqueQueries, maxSuggestions]);

  // Perform search
  const search = React.useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) return;
      
      setIsSearching(true);
      try {
        // Add to history
        addSearch(searchQuery, type);
        setQuery(searchQuery);
        return searchQuery;
      } finally {
        setIsSearching(false);
      }
    },
    [addSearch, type]
  );

  // Clear search
  const clearSearch = React.useCallback(() => {
    setQuery("");
  }, []);

  return {
    query,
    setQuery,
    search,
    clearSearch,
    isSearching,
    suggestions,
    history,
  };
}

// Search history component
import { motion, AnimatePresence } from "framer-motion";
import { Clock, X, Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchHistoryListProps {
  history: SearchHistoryItem[];
  onSelect: (query: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  className?: string;
}

export function SearchHistoryList({
  history,
  onSelect,
  onRemove,
  onClear,
  className,
}: SearchHistoryListProps) {
  if (history.length === 0) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No recent searches</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">Recent Searches</span>
        <button
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear all
        </button>
      </div>
      <ul className="space-y-1">
        <AnimatePresence>
          {history.slice(0, 10).map((item) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-2 group"
            >
              <button
                onClick={() => onSelect(item.query)}
                className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left"
              >
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="flex-1 truncate">{item.query}</span>
                {item.resultCount !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    {item.resultCount} results
                  </span>
                )}
              </button>
              <button
                onClick={() => onRemove(item.id)}
                className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-accent transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

// Recent views component
interface RecentViewsListProps {
  views: RecentViewItem[];
  onSelect: (view: RecentViewItem) => void;
  onRemove: (id: string) => void;
  className?: string;
}

export function RecentViewsList({
  views,
  onSelect,
  onRemove,
  className,
}: RecentViewsListProps) {
  if (views.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <span className="text-sm font-medium text-muted-foreground mb-2 block">
        Recently Viewed
      </span>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        <AnimatePresence>
          {views.slice(0, 8).map((view) => (
            <motion.div
              key={view.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative"
            >
              <button
                onClick={() => onSelect(view)}
                className="w-full aspect-square rounded-lg overflow-hidden bg-muted relative"
              >
                {view.image ? (
                  <img
                    src={view.image}
                    alt={view.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl">{view.type === "gallery" ? "🖼️" : view.type === "journal" ? "📝" : "📄"}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-white text-xs truncate">{view.title}</p>
                  </div>
                </div>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(view.id);
                }}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}