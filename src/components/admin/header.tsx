'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Command, Search } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdminHeaderProps {
  user: {
    name: string;
    email: string;
  };
}

const adminDestinations = [
  { href: '/admin', label: 'Dashboard', description: 'Live portfolio, content, and audience overview.' },
  { href: '/admin/operator', label: 'Operator', description: 'Run audits, site changes, and AI control actions.' },
  { href: '/admin/content', label: 'Content', description: 'Review and edit live articles, projects, books, and certifications.' },
  { href: '/admin/media', label: 'Media Library', description: 'Inspect uploads and media availability.' },
  { href: '/admin/analytics', label: 'Analytics', description: 'Review audience and page-view reporting.' },
  { href: '/admin/security', label: 'Security', description: 'Manage sessions, passkeys, and admin hardening.' },
];

export function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const titles: Record<string, string> = {
    '/admin': 'Dashboard',
    '/admin/operator': 'Operator',
    '/admin/content': 'Content',
    '/admin/media': 'Media Library',
    '/admin/analytics': 'Analytics',
    '/admin/security': 'Security',
  };

  const currentTitle = titles[pathname] || 'Admin';

  const filteredDestinations = useMemo(() => {
    const normalized = searchValue.trim().toLowerCase();

    if (!normalized) {
      return adminDestinations;
    }

    return adminDestinations.filter((destination) =>
      `${destination.label} ${destination.description} ${destination.href}`.toLowerCase().includes(normalized)
    );
  }, [searchValue]);

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

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const navigateTo = (href: string) => {
    router.push(href);
    setSearchValue('');
    setIsSearchOpen(false);
  };

  const handleSearchBlur = () => {
    blurTimeoutRef.current = setTimeout(() => setIsSearchOpen(false), 120);
  };

  const handleSearchFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    setIsSearchOpen(true);
  };

  const handleSearchSubmit = () => {
    const [firstResult] = filteredDestinations;
    if (firstResult) {
      navigateTo(firstResult.href);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/50 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <h2 className="font-semibold text-lg">{currentTitle}</h2>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm text-muted-foreground">Welcome back, {user.name.split(' ')[0]}</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Jump to an admin surface..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleSearchSubmit();
              }
              if (event.key === 'Escape') {
                setSearchValue('');
                setIsSearchOpen(false);
                searchInputRef.current?.blur();
              }
            }}
            className="w-72 bg-muted/50 pl-9 pr-20"
            aria-label="Search and jump to an admin destination"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 text-xs text-muted-foreground lg:inline-flex">
            <span className="rounded bg-muted px-1">⌘</span>
            <span>K</span>
          </kbd>

          {isSearchOpen ? (
            <div className="absolute right-0 top-[calc(100%+0.5rem)] w-80 rounded-xl border border-border bg-card p-2 shadow-xl">
              <p className="px-2 pb-2 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                Admin quick jump
              </p>
              <div className="space-y-1">
                {filteredDestinations.length > 0 ? (
                  filteredDestinations.map((destination) => (
                    <button
                      key={destination.href}
                      type="button"
                      className="flex w-full items-start rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => navigateTo(destination.href)}
                    >
                      <div>
                        <div className="text-sm font-medium">{destination.label}</div>
                        <div className="text-xs text-muted-foreground">{destination.description}</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-lg px-3 py-2 text-sm text-muted-foreground">
                    No admin destination matches "{searchValue.trim()}".
                  </div>
                )}
              </div>
            </div>
          ) : null}
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
          aria-label="Notifications are not wired in this admin shell yet"
          title="Notifications are not wired in this admin shell yet."
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-muted-foreground/40" />
        </Button>
      </div>
    </header>
  );
}
