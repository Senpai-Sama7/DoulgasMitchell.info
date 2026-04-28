'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Home, 
  User, 
  Briefcase, 
  BookOpen, 
  Mail,
  FileText,
  Award,
  Moon,
  Sun,
  Command,
  CornerDownLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  label: string;
  shortcut?: string;
  icon: React.ElementType;
  action: () => void;
  category: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (href: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function CommandPalette({ isOpen, onClose, onNavigate, isDark, onToggleTheme }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    {
      id: 'home',
      label: 'Go to Home',
      icon: Home,
      action: () => { onNavigate('#'); onClose(); },
      category: 'Navigation',
    },
    {
      id: 'about',
      label: 'Go to About',
      icon: User,
      action: () => { onNavigate('#about'); onClose(); },
      category: 'Navigation',
    },
    {
      id: 'work',
      label: 'Go to Work',
      icon: Briefcase,
      action: () => { onNavigate('#work'); onClose(); },
      category: 'Navigation',
    },
    {
      id: 'writing',
      label: 'Go to Writing',
      icon: FileText,
      action: () => { onNavigate('#writing'); onClose(); },
      category: 'Navigation',
    },
    {
      id: 'book',
      label: 'View The Confident Mind',
      icon: BookOpen,
      action: () => { onNavigate('#book'); onClose(); },
      category: 'Navigation',
    },
    {
      id: 'certifications',
      label: 'View Certifications',
      icon: Award,
      action: () => { onNavigate('#certifications'); onClose(); },
      category: 'Navigation',
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: Mail,
      action: () => { onNavigate('#contact'); onClose(); },
      category: 'Navigation',
    },
    {
      id: 'theme',
      label: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      icon: isDark ? Sun : Moon,
      action: () => { onToggleTheme(); onClose(); },
      category: 'Preferences',
      shortcut: '⇧D',
    },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  // Reset state when opening - using requestAnimationFrame to avoid cascading renders
  useEffect(() => {
    if (isOpen) {
      const frame = requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
        setSearch('');
        setSelectedIndex(0);
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // This would need to be triggered from parent
        }
      }

      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, filteredCommands, selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[20%] -translate-x-1/2 z-[101] w-full max-w-lg"
          >
            <div className="bg-background border border-border rounded-xl shadow-2xl overflow-hidden">
              {/* ASCII Corner */}
              <div className="absolute top-2 left-3 font-mono text-[10px] text-muted-foreground opacity-50">
                ╭──────────────╮
              </div>

              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-border">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSelectedIndex(0);
                  }}
                  placeholder="Search commands..."
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono bg-muted rounded text-muted-foreground">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto p-2">
                {filteredCommands.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <p className="font-mono text-sm">No commands found</p>
                  </div>
                ) : (
                  filteredCommands.map((cmd, index) => (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left',
                        index === selectedIndex
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      )}
                    >
                      <cmd.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1">{cmd.label}</span>
                      {cmd.shortcut && (
                        <kbd className={cn(
                          'text-xs font-mono px-1.5 py-0.5 rounded',
                          index === selectedIndex
                            ? 'bg-primary-foreground/20'
                            : 'bg-muted'
                        )}>
                          {cmd.shortcut}
                        </kbd>
                      )}
                      {index === selectedIndex && (
                        <CornerDownLeft className="h-3 w-3 opacity-50" />
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-3 border-t border-border text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded font-mono">↑↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded font-mono">↵</kbd>
                    Select
                  </span>
                </div>
                <span className="font-mono">{filteredCommands.length} commands</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Command K trigger component
export function CommandKTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-6 sm:left-auto sm:right-6 z-50 flex items-center gap-2 px-3 py-2 bg-background/80 backdrop-blur-sm border border-border rounded-full shadow-lg hover:bg-muted transition-colors group"
      aria-label="Open command palette"
    >
      <Command className="h-4 w-4" />
      <span className="hidden sm:inline text-sm">Command</span>
      <kbd className="hidden sm:inline-flex items-center gap-0.5 text-xs font-mono">
        <span className="px-1 py-0.5 bg-muted rounded">⌘</span>
        <span>K</span>
      </kbd>
    </button>
  );
}
