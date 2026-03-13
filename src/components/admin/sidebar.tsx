'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  Sparkles,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Operator', href: '/admin/operator', icon: Sparkles },
  { name: 'Content', href: '/admin/content', icon: FileText },
  { name: 'Media Library', href: '/admin/media', icon: ImageIcon },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Security', href: '/admin/security', icon: Shield },
];

function SidebarContent({
  pathname,
  user,
  onNavigate,
  onLogout,
  isLoggingOut,
}: {
  pathname: string;
  user: AdminSidebarProps['user'];
  onNavigate?: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
}) {
  return (
    <>
      <div className="border-b border-border px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="font-mono text-sm font-bold text-primary-foreground">
              DM
            </span>
          </div>
          <div>
            <h1 className="text-sm font-semibold">Admin Portal</h1>
            <p className="text-xs text-muted-foreground">Operator rail v5</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className={cn('h-4 w-4', isActive && 'text-primary')} />
              {item.name}
              {isActive ? (
                <motion.div
                  layoutId="admin-sidebar-indicator"
                  className="ml-auto h-4 w-1 rounded-full bg-primary"
                />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-border p-4">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4" />
          View Site
        </Link>

        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <span className="text-xs font-medium">
              {user.name.split(' ').map((segment) => segment[0]).join('')}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
          onClick={onLogout}
          disabled={isLoggingOut}
          aria-busy={isLoggingOut}
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? 'Signing Out…' : 'Sign Out'}
        </Button>
      </div>
    </>
  );
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const mobilePanelRef = useRef<HTMLElement>(null);
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await fetch('/api/admin/logout', { method: 'POST' });

      if (!response.ok) {
        throw new Error('Unable to sign out right now.');
      }

      window.location.href = '/admin/login';
    } catch (error) {
      toast({
        title: 'Sign out failed',
        description: error instanceof Error ? error.message : 'Unable to sign out right now.',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    if (!isMobileOpen) {
      document.body.style.overflow = '';
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusableElements = mobilePanelRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements?.[0];
    const lastFocusable = focusableElements?.[focusableElements.length - 1];
    firstFocusable?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileOpen(false);
        return;
      }

      if (event.key !== 'Tab' || !focusableElements?.length) {
        return;
      }

      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable?.focus();
      } else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileOpen]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen((current) => !current)}
        aria-label={isMobileOpen ? 'Close admin navigation' : 'Open admin navigation'}
        aria-controls="admin-mobile-sidebar"
        aria-expanded={isMobileOpen}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      <AnimatePresence>
        {isMobileOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setIsMobileOpen(false)}
            />

            <motion.aside
              ref={mobilePanelRef}
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'spring', damping: 24, stiffness: 260 }}
              id="admin-mobile-sidebar"
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card lg:hidden"
            >
              <SidebarContent
                pathname={pathname}
                user={user}
                onNavigate={() => setIsMobileOpen(false)}
                onLogout={handleLogout}
                isLoggingOut={isLoggingOut}
              />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
        <div className="sticky top-0 flex h-screen flex-col">
          <SidebarContent pathname={pathname} user={user} onLogout={handleLogout} isLoggingOut={isLoggingOut} />
        </div>
      </aside>
    </>
  );
}
