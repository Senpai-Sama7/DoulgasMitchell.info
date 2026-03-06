"use client";

import { useMemo } from "react";

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  // Simple markdown to HTML conversion
  const html = useMemo(() => {
    let result = content
      // Escape HTML
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // Headers
      .replace(/^### (.*$)/gm, '<h4 class="text-lg font-semibold mt-4 mb-2">$1</h4>')
      .replace(/^## (.*$)/gm, '<h3 class="text-xl font-serif font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^# (.*$)/gm, '<h2 class="text-2xl font-serif font-bold mt-4 mb-3">$1</h2>')
      // Bold and italic
      .replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      // Code
      .replace(
        /`(.*?)`/g,
        '<code class="px-1 py-0.5 bg-accent rounded text-sm font-mono">$1</code>'
      )
      // Links
      .replace(
        /\[(.*?)\]\((.*?)\)/g,
        '<a href="$2" class="text-primary hover:underline" target="_blank">$1</a>'
      )
      // Blockquotes
      .replace(
        /^&gt; (.*$)/gm,
        '<blockquote class="border-l-4 border-primary pl-4 my-2 text-muted-foreground">$1</blockquote>'
      )
      // Lists
      .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p class="my-2">')
      // Line breaks
      .replace(/\n/g, "<br>");

    return `<div class="prose prose-sm max-w-none"><p class="my-2">${result}</p></div>`;
  }, [content]);

  return (
    <div
      className="prose prose-sm max-w-none p-4 border border-border rounded-xl min-h-[192px]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}