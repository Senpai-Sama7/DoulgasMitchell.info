"use client";

import * as React from "react";

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
  group?: string;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true, preventDefault = true } = options;

  React.useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      
      // Allow some shortcuts even in inputs (like Escape)
      const allowInInput = ["Escape", "Enter"].includes(event.key);

      if (isInput && !allowInInput) return;

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          if (shortcut.preventDefault ?? preventDefault) {
            event.preventDefault();
          }
          if (shortcut.stopPropagation) {
            event.stopPropagation();
          }
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts, enabled, preventDefault]);
}

// Common keyboard shortcuts helper
export function useCommonShortcuts(handlers: {
  onSearch?: () => void;
  onSave?: () => void;
  onEscape?: () => void;
  onHelp?: () => void;
  onNavigate?: (direction: "up" | "down" | "left" | "right") => void;
}) {
  const shortcuts: KeyboardShortcut[] = React.useMemo(() => {
    const result: KeyboardShortcut[] = [];

    if (handlers.onSearch) {
      result.push({
        key: "k",
        ctrl: true,
        description: "Open search",
        action: handlers.onSearch,
        group: "Navigation",
      });
    }

    if (handlers.onSave) {
      result.push({
        key: "s",
        ctrl: true,
        description: "Save",
        action: handlers.onSave,
        group: "Actions",
      });
    }

    if (handlers.onEscape) {
      result.push({
        key: "Escape",
        description: "Close/Cancel",
        action: handlers.onEscape,
        group: "Navigation",
      });
    }

    if (handlers.onHelp) {
      result.push({
        key: "?",
        shift: true,
        description: "Show keyboard shortcuts",
        action: handlers.onHelp,
        group: "Help",
      });
    }

    if (handlers.onNavigate) {
      result.push(
        {
          key: "ArrowUp",
          description: "Navigate up",
          action: () => handlers.onNavigate?.("up"),
          group: "Navigation",
        },
        {
          key: "ArrowDown",
          description: "Navigate down",
          action: () => handlers.onNavigate?.("down"),
          group: "Navigation",
        },
        {
          key: "ArrowLeft",
          description: "Navigate left",
          action: () => handlers.onNavigate?.("left"),
          group: "Navigation",
        },
        {
          key: "ArrowRight",
          description: "Navigate right",
          action: () => handlers.onNavigate?.("right"),
          group: "Navigation",
        }
      );
    }

    return result;
  }, [handlers]);

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
}

// Keyboard shortcuts help modal component
interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[];
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsHelp({ shortcuts, isOpen, onClose }: KeyboardShortcutsHelpProps) {
  // Group shortcuts by category
  const groupedShortcuts = React.useMemo(() => {
    const groups: Record<string, KeyboardShortcut[]> = {};
    for (const shortcut of shortcuts) {
      const group = shortcut.group || "General";
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(shortcut);
    }
    return groups;
  }, [shortcuts]);

  // Close on Escape
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-accent transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 overflow-auto max-h-[60vh]">
          {Object.entries(groupedShortcuts).map(([group, groupShortcuts]) => (
            <div key={group} className="mb-4 last:mb-0">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">{group}</h3>
              <div className="space-y-1">
                {groupShortcuts.map((shortcut, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.ctrl && (
                        <kbd className="px-1.5 py-0.5 text-xs rounded bg-muted border border-border">
                          {navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}
                        </kbd>
                      )}
                      {shortcut.shift && (
                        <kbd className="px-1.5 py-0.5 text-xs rounded bg-muted border border-border">
                          ⇧
                        </kbd>
                      )}
                      {shortcut.alt && (
                        <kbd className="px-1.5 py-0.5 text-xs rounded bg-muted border border-border">
                          ⌥
                        </kbd>
                      )}
                      <kbd className="px-1.5 py-0.5 text-xs rounded bg-muted border border-border min-w-[24px] text-center">
                        {shortcut.key === "Escape" ? "Esc" : shortcut.key === "ArrowUp" ? "↑" : shortcut.key === "ArrowDown" ? "↓" : shortcut.key === "ArrowLeft" ? "←" : shortcut.key === "ArrowRight" ? "→" : shortcut.key}
                      </kbd>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Hook to show shortcuts help
export function useShortcutsHelp(shortcuts: KeyboardShortcut[]) {
  const [showHelp, setShowHelp] = React.useState(false);

  // Add help shortcut to show the modal
  const allShortcuts = React.useMemo(() => [
    ...shortcuts,
    {
      key: "?",
      shift: true,
      description: "Show keyboard shortcuts",
      action: () => setShowHelp(true),
      group: "Help",
    },
  ], [shortcuts]);

  useKeyboardShortcuts(allShortcuts);

  const HelpModal = React.useCallback(() => (
    <KeyboardShortcutsHelp
      shortcuts={shortcuts}
      isOpen={showHelp}
      onClose={() => setShowHelp(false)}
    />
  ), [shortcuts, showHelp]);

  return { showHelp, setShowHelp, HelpModal };
}