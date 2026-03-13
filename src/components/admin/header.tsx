'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Command, Search, Sparkles, FileText, BarChart3, Shield, ImageIcon, LayoutDashboard, Key, Lock, Settings, MessageSquare, PlusSquare } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AdminHeaderProps {
  user: {
    name: string;
    email: string;
  };
}

type SearchableAdminItem = {
  href: string;
  label: string;
  description?: string;
  tags: string[];
};

const adminDestinations = [
  { href: '/admin', label: 'Dashboard', description: 'Live portfolio, content, and audience overview.', icon: LayoutDashboard, tags: ['home', 'main', 'status'] },
  { href: '/admin/operator', label: 'Operator', description: 'Run audits, site changes, and AI control actions.', icon: Sparkles, tags: ['ai', 'chat', 'agent', 'bot', 'gpt', 'gemini'] },
  { href: '/admin/content', label: 'Content', description: 'Review and edit live articles, projects, books, and certifications.', icon: FileText, tags: ['posts', 'articles', 'writing', 'work', 'projects', 'edit', 'add', 'create'] },
  { href: '/admin/media', label: 'Media Library', description: 'Inspect uploads and media availability.', icon: ImageIcon, tags: ['images', 'files', 'uploads', 'assets', 'video', 'photos'] },
  { href: '/admin/analytics', label: 'Analytics', description: 'Review audience and page-view reporting.', icon: BarChart3, tags: ['traffic', 'views', 'stats', 'telemetry', 'data', 'metrics'] },
  { href: '/admin/security', label: 'Security', description: 'Manage sessions, passkeys, and admin hardening.', icon: Shield, tags: ['password', 'auth', 'keys', 'sessions', 'security', 'login'] },
];

const settingsShortcuts = [
  { label: 'AI Settings', href: '/admin/operator', icon: Settings, tags: ['ai', 'provider', 'model', 'budget'] },
  { label: 'Passkeys', href: '/admin/security', icon: Key, tags: ['auth', 'security', 'mfa', 'webauthn'] },
  { label: 'Admin Password', href: '/admin/security', icon: Lock, tags: ['auth', 'reset', 'password'] },
  { label: 'Public Chat', href: '/admin/operator', icon: MessageSquare, tags: ['assistant', 'public', 'knowledge'] },
  { label: 'Add New Post', href: '/admin/content', icon: PlusSquare, tags: ['create', 'new', 'article', 'project'] },
];

export function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listboxId = 'admin-quick-jump-results';

  const titles: Record<string, string> = {
    '/admin': 'Dashboard',
    '/admin/operator': 'Operator',
    '/admin/content': 'Content',
    '/admin/media': 'Media Library',
    '/admin/analytics': 'Analytics',
    '/admin/security': 'Security',
  };

  const currentTitle = titles[pathname] || 'Admin';

  const filteredResults = useMemo(() => {
    const normalized = searchValue.trim().toLowerCase();

    if (!normalized) {
      return { destinations: adminDestinations, shortcuts: settingsShortcuts };
    }

    const filterFn = (item: SearchableAdminItem) =>
      `${item.label} ${item.description || ''} ${item.tags.join(' ')}`.toLowerCase().includes(normalized);

    return {
      destinations: adminDestinations.filter(filterFn),
      shortcuts: settingsShortcuts.filter(filterFn)
    };
  }, [searchValue]);

  const allResults = useMemo(
    () => [...filteredResults.destinations, ...filteredResults.shortcuts],
    [filteredResults.destinations, filteredResults.shortcuts]
  );

  const totalResults = filteredResults.destinations.length + filteredResults.shortcuts.length;
  const activeIndex = totalResults === 0 ? -1 : Math.min(selectedIndex, totalResults - 1);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsSearchOpen(true);
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const navigateTo = (href: string) => {
    router.push(href);
    setSearchValue('');
    setIsSearchOpen(false);
    searchInputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (totalResults || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + (totalResults || 1)) % (totalResults || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allResults[activeIndex]) {
        navigateTo(allResults[activeIndex].href);
      }
    } else if (e.key === 'Escape') {
      setSearchValue('');
      setIsSearchOpen(false);
      searchInputRef.current?.blur();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/50 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <h2 className="font-semibold text-lg">{currentTitle}</h2>
        <span className="text-muted-foreground hidden sm:inline">/</span>
        <span className="text-sm text-muted-foreground hidden sm:inline text-nowrap truncate max-w-[150px]">
          Welcome back, {user.name.split(' ')[0]}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-1 justify-end">
        <div className="relative w-full max-w-[280px] sm:max-w-xs md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Jump to content or settings..."
            value={searchValue}
            onChange={(event) => {
              setSearchValue(event.target.value);
              setSelectedIndex(0);
            }}
            onFocus={() => {
              if (blurTimeoutRef.current) {
                clearTimeout(blurTimeoutRef.current);
              }
              setIsSearchOpen(true);
            }}
            onBlur={() => {
              blurTimeoutRef.current = setTimeout(() => setIsSearchOpen(false), 200);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-muted/50 pl-9 pr-12 text-sm"
            aria-label="Search and jump to an admin destination"
            role="combobox"
            aria-expanded={isSearchOpen}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={isSearchOpen && allResults[activeIndex] ? `admin-quick-jump-option-${activeIndex}` : undefined}
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 text-[10px] font-mono text-muted-foreground lg:inline-flex">
            <span className="rounded bg-muted px-1">⌘</span>
            <span>K</span>
          </kbd>

          {isSearchOpen && (
            <div
              id={listboxId}
              role="listbox"
              aria-label="Admin quick jump results"
              className="absolute right-0 top-[calc(100%+0.5rem)] w-full sm:w-[400px] max-h-[80vh] overflow-y-auto rounded-xl border border-border bg-card p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
            >
              {filteredResults.destinations.length > 0 && (
                <div className="mb-2">
                  <p className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground border-b border-border/40 mb-1">
                    Destinations
                  </p>
                  {filteredResults.destinations.map((dest, i) => {
                    const isActive = i === activeIndex;
                    return (
                      <button
                        key={dest.href}
                        id={`admin-quick-jump-option-${i}`}
                        role="option"
                        aria-selected={isActive}
                        type="button"
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all",
                          isActive ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-muted"
                        )}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => navigateTo(dest.href)}
                      >
                        <dest.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary-foreground" : "text-primary/70")} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium leading-none">{dest.label}</div>
                          <div className={cn("text-[11px] truncate mt-1", isActive ? "text-primary-foreground/80" : "text-muted-foreground")}>
                            {dest.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {filteredResults.shortcuts.length > 0 && (
                <div>
                  <p className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground border-b border-border/40 mb-1">
                    Related Settings
                  </p>
                  {filteredResults.shortcuts.map((shortcut, i) => {
                    const isActive = (i + filteredResults.destinations.length) === activeIndex;
                    return (
                      <button
                        key={shortcut.label}
                        id={`admin-quick-jump-option-${i + filteredResults.destinations.length}`}
                        role="option"
                        aria-selected={isActive}
                        type="button"
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all",
                          isActive ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-muted"
                        )}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => navigateTo(shortcut.href)}
                      >
                        <shortcut.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary-foreground" : "text-primary/70")} />
                        <div className="text-sm font-medium">{shortcut.label}</div>
                        <div className="ml-auto flex gap-1">
                          {shortcut.tags.slice(0, 2).map(tag => (
                            <span key={tag} className={cn("text-[9px] px-1.5 py-0.5 rounded-full border", isActive ? "border-primary-foreground/30 bg-primary-foreground/10" : "border-border bg-muted/50 text-muted-foreground")}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {totalResults === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Search className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground font-mono">No matches found for "{searchValue}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex"
          onClick={() => {
            setIsSearchOpen(true);
            searchInputRef.current?.focus();
            searchInputRef.current?.select();
          }}
          aria-label="Focus admin quick-jump search"
        >
          <Command className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          disabled
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary/40 animate-pulse" />
        </Button>
      </div>
    </header>
  );
}
