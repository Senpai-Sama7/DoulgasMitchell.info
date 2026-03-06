"use client";

import { useRef, useCallback, useMemo } from "react";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
} from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your content in markdown...",
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = useCallback(
    (before: string, after: string = "") => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);

      const newText =
        value.substring(0, start) +
        before +
        selectedText +
        after +
        value.substring(end);

      onChange(newText);

      // Reset cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + before.length,
          start + before.length + selectedText.length
        );
      }, 0);
    },
    [value, onChange]
  );

  const tools = useMemo(
    () => [
      { icon: Bold, before: "**", after: "**", title: "Bold" },
      { icon: Italic, before: "*", after: "*", title: "Italic" },
      { icon: Heading1, before: "# ", after: "", title: "Heading 1" },
      { icon: Heading2, before: "## ", after: "", title: "Heading 2" },
      { icon: List, before: "- ", after: "", title: "Bullet List" },
      { icon: ListOrdered, before: "1. ", after: "", title: "Numbered List" },
      { icon: Quote, before: "> ", after: "", title: "Quote" },
      { icon: Code, before: "`", after: "`", title: "Code" },
      { icon: Link, before: "[", after: "](url)", title: "Link" },
    ],
    []
  );

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div
        className="flex items-center gap-1 p-2 border-b border-border bg-accent/30"
        role="toolbar"
        aria-label="Markdown formatting"
      >
        {tools.map((tool, i) => (
          <button
            key={i}
            onClick={() => insertText(tool.before, tool.after)}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            title={tool.title}
            type="button"
            aria-label={tool.title}
          >
            <tool.icon className="w-4 h-4" aria-hidden="true" />
          </button>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-48 p-4 bg-transparent resize-none focus:outline-none font-mono text-sm"
        aria-label="Markdown content"
      />
    </div>
  );
}