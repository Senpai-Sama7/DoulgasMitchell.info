'use client';

import { Bell, Search, Command } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface AdminHeaderProps {
  user: {
    name: string;
    email: string;
  };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const pathname = usePathname();
  const [searchValue, setSearchValue] = useState('');

  const titles: Record<string, string> = {
    '/admin': 'Dashboard',
    '/admin/content': 'Content',
    '/admin/media': 'Media Library',
    '/admin/analytics': 'Analytics',
    '/admin/security': 'Security',
  };

  const currentTitle = titles[pathname] || 'Admin';

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Breadcrumb / Title */}
      <div className="flex items-center gap-4">
        <h2 className="font-semibold text-lg">{currentTitle}</h2>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm text-muted-foreground">Welcome back, {user.name.split(' ')[0]}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="w-64 pl-9 bg-muted/50"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none hidden lg:inline-flex items-center gap-1">
            <span className="px-1 bg-muted rounded">⌘</span>
            <span>K</span>
          </kbd>
        </div>

        {/* Command Palette Trigger */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex"
          onClick={() => setSearchValue('')}
        >
          <Command className="h-4 w-4" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button>
      </div>
    </header>
  );
}
