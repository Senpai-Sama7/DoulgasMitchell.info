"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Clock, Image, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useSearchHistory } from "@/hooks/use-search-history";
import { useRouter } from "next/navigation";

interface GlobalSearchProps {
  className?: string;
  placeholder?: string;
}

export function GlobalSearch({ className, placeholder = "Search..." }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { history, addSearch, removeSearch, clearHistory } = useSearchHistory();

  // Keyboard shortcut to open search
  useKeyboardShortcuts([
    {
      key: "k",
      ctrl: true,
      description: "Open search",
      action: () => setIsOpen(true),
      group: "Navigation",
    },
  ]);

  // Close on escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Focus input when opened
  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    addSearch(searchQuery, "general");
    setQuery("");
    setIsOpen(false);
    
    // Navigate to search results page
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(query);
    }
  };

  // Filter history based on current query
  const filteredHistory = React.useMemo(() => {
    if (!query.trim()) return history.slice(0, 5);
    const lowerQuery = query.toLowerCase();
    return history
      .filter((item) => item.query.toLowerCase().includes(lowerQuery))
      .slice(0, 5);
  }, [history, query]);

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg",
          "bg-secondary/50 hover:bg-secondary",
          "text-muted-foreground hover:text-foreground",
          "transition-colors",
          className
        )}
        aria-label="Open search"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline text-sm">Search</span>
        <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded bg-muted">
          ⌘K
        </kbd>
      </button>

      {/* Search modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50 px-4"
            >
              <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
                {/* Search input */}
                <div className="flex items-center gap-3 p-4 border-b border-border">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                    autoFocus
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="p-1 rounded hover:bg-accent transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Search history */}
                {filteredHistory.length > 0 && (
                  <div className="p-2">
                    <div className="flex items-center justify-between px-2 py-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Recent Searches
                      </span>
                      <button
                        onClick={clearHistory}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Clear all
                      </button>
                    </div>
                    <ul className="space-y-1">
                      {filteredHistory.map((item) => (
                        <li key={item.id}>
                          <button
                            onClick={() => handleSearch(item.query)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left group"
                          >
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="flex-1 truncate">{item.query}</span>
                            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Quick links */}
                <div className="p-2 border-t border-border">
                  <div className="px-2 py-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      Quick Links
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        router.push("/galleries");
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left"
                    >
                      <Image className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Galleries</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        router.push("/journal");
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-left"
                    >
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Journal</span>
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-4 py-2 border-t border-border bg-muted/30">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-muted">↵</kbd>
                      to search
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-muted">esc</kbd>
                      to close
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Search command palette for more advanced use
interface Command {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  action: () => void;
  group?: string;
}

interface CommandPaletteProps {
  commands: Command[];
  className?: string;
}

export function CommandPalette({ commands, className }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Group commands
  const groupedCommands = React.useMemo(() => {
    const groups: Record<string, Command[]> = {};
    for (const command of commands) {
      const group = command.group || "General";
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(command);
    }
    return groups;
  }, [commands]);

  // Filter commands
  const filteredCommands = React.useMemo(() => {
    if (!query.trim()) return commands;
    const lowerQuery = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(lowerQuery) ||
        cmd.description?.toLowerCase().includes(lowerQuery)
    );
  }, [commands, query]);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "k",
      ctrl: true,
      description: "Open command palette",
      action: () => setIsOpen(true),
      group: "Navigation",
    },
  ]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filteredCommands.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + filteredCommands.length) % filteredCommands.length);
        break;
      case "Enter":
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          setIsOpen(false);
          setQuery("");
        }
        break;
      case "Escape":
        setIsOpen(false);
        setQuery("");
        break;
    }
  };

  // Reset selection when filtered results change
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg",
          "bg-secondary/50 hover:bg-secondary",
          "text-muted-foreground hover:text-foreground",
          "transition-colors",
          className
        )}
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline text-sm">Commands</span>
        <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded bg-muted">
          ⌘K
        </kbd>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50 px-4"
            >
              <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
                {/* Input */}
                <div className="flex items-center gap-3 p-4 border-b border-border">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a command or search..."
                    className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                    autoFocus
                  />
                </div>

                {/* Commands */}
                <div className="max-h-80 overflow-auto p-2">
                  {Object.entries(groupedCommands).map(([group, cmds]) => (
                    <div key={group} className="mb-2">
                      <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                        {group}
                      </div>
                      <ul className="space-y-1">
                        {cmds
                          .filter((cmd) => filteredCommands.includes(cmd))
                          .map((cmd, index) => {
                            const globalIndex = filteredCommands.indexOf(cmd);
                            return (
                              <li key={cmd.id}>
                                <button
                                  onClick={() => {
                                    cmd.action();
                                    setIsOpen(false);
                                    setQuery("");
                                  }}
                                  className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
                                    globalIndex === selectedIndex
                                      ? "bg-accent"
                                      : "hover:bg-accent/50"
                                  )}
                                >
                                  {cmd.icon && (
                                    <span className="text-muted-foreground">
                                      {cmd.icon}
                                    </span>
                                  )}
                                  <div className="flex-1">
                                    <div className="text-sm font-medium">
                                      {cmd.title}
                                    </div>
                                    {cmd.description && (
                                      <div className="text-xs text-muted-foreground">
                                        {cmd.description}
                                      </div>
                                    )}
                                  </div>
                                  {cmd.shortcut && (
                                    <kbd className="px-1.5 py-0.5 text-xs rounded bg-muted">
                                      {cmd.shortcut}
                                    </kbd>
                                  )}
                                </button>
                              </li>
                            );
                          })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}