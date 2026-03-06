"use client";

import * as React from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Home, Image, BookOpen, Mail, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSwipeGesture } from "@/hooks/use-gestures";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
}

const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/galleries", label: "Gallery", icon: Image },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/contact", label: "Contact", icon: Mail },
];

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();

  // Close on route change
  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Prevent body scroll when menu is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Menu button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "w-14 h-14 rounded-full",
          "bg-primary text-primary-foreground",
          "shadow-lg shadow-primary/25",
          "flex items-center justify-center",
          "md:hidden",
          className
        )}
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </motion.button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Slide-out menu */}
      <AnimatePresence>
        {isOpen && (
          <MobileMenuSheet onClose={() => setIsOpen(false)} pathname={pathname} />
        )}
      </AnimatePresence>

      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-card/80 backdrop-blur-lg border-t border-border md:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-4 py-2",
                  "transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

interface MobileMenuSheetProps {
  onClose: () => void;
  pathname: string;
}

function MobileMenuSheet({ onClose, pathname }: MobileMenuSheetProps) {
  const x = useMotionValue(0);
  const backgroundOpacity = useTransform(x, [-300, 0], [0, 1]);
  const swipeRef = useSwipeGesture({
    onSwipeRight: onClose,
    threshold: 50,
  });

  return (
    <motion.div
      ref={swipeRef as React.RefObject<HTMLDivElement>}
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (info.offset.x > 100 || info.velocity.x > 500) {
          onClose();
        }
      }}
      style={{ x }}
      className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-card border-l border-border z-50 md:hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Menu</h2>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Navigation items */}
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <motion.li
                key={item.href}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-2 h-2 rounded-full bg-current"
                    />
                  )}
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">Douglas Mitchell</p>
            <p className="text-sm text-muted-foreground">Artist & Creator</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Pull to refresh indicator
interface PullToRefreshIndicatorProps {
  pullDistance: number;
  threshold: number;
  isRefreshing: boolean;
}

export function PullToRefreshIndicator({
  pullDistance,
  threshold,
  isRefreshing,
}: PullToRefreshIndicatorProps) {
  const progress = Math.min(pullDistance / threshold, 1);
  const rotation = progress * 360;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{
        opacity: pullDistance > 0 ? 1 : 0,
        y: pullDistance > 0 ? 0 : -20,
      }}
      className="absolute top-0 left-0 right-0 flex justify-center pt-4 z-50"
    >
      <motion.div
        animate={{ rotate: isRefreshing ? 360 : rotation }}
        transition={{
          rotate: isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : { duration: 0 },
        }}
        className={cn(
          "w-8 h-8 rounded-full bg-card border border-border shadow-lg",
          "flex items-center justify-center"
        )}
      >
        <svg
          className="w-4 h-4 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}

// Safe area padding for iOS devices
export function SafeAreaSpacer() {
  return (
    <div className="h-[env(safe-area-inset-bottom)]" />
  );
}