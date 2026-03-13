'use client';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FileIcon, Play, Music, FileText, Download, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ContentRendererProps {
  content: string;
  className?: string;
}

export function ContentRenderer({ content, className }: ContentRendererProps) {
  return (
    <div className={cn('reading-content prose dark:prose-invert max-w-none', className)}>
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <div className="relative group my-6 overflow-hidden rounded-xl border border-border bg-muted/50">
                <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    {match[1]}
                  </span>
                </div>
                <SyntaxHighlighter
                  {...props}
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  className="!m-0 !bg-transparent !p-4 font-mono text-sm"
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className={cn('bg-muted px-1.5 py-0.5 rounded text-sm font-mono', className)} {...props}>
                {children}
              </code>
            );
          },
          img({ node, src, alt, ...props }: any) {
            // Check if it's a video based on extension
            const isVideo = src?.match(/\.(mp4|webm|ogg)$/i);
            const isAudio = src?.match(/\.(mp3|wav|ogg|m4a|aac)$/i);
            const isDoc = src?.match(/\.(pdf|docx|xlsx|pptx|txt)$/i);

            if (isVideo) {
              return (
                <div className="my-8 overflow-hidden rounded-2xl border border-border bg-black shadow-2xl">
                  <video 
                    src={src} 
                    controls 
                    className="w-full aspect-video"
                    poster={src.replace(/\.(mp4|webm|ogg)$/i, '-poster.jpg')}
                  >
                    Your browser does not support the video tag.
                  </video>
                  {alt && <div className="p-3 text-center text-xs text-muted-foreground font-mono">{alt}</div>}
                </div>
              );
            }

            if (isAudio) {
              return (
                <div className="my-6 flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Music className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <audio src={src} controls className="h-8 w-full" />
                    {alt && <p className="mt-1 text-[10px] text-muted-foreground uppercase font-mono">{alt}</p>}
                  </div>
                </div>
              );
            }

            if (isDoc) {
              return (
                <a 
                  href={src} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="my-6 flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/40 group no-underline"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:text-primary transition-colors">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{alt || 'View Document'}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-mono">Attachment</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              );
            }

            return (
              <div className="my-8">
                <img 
                  src={src} 
                  alt={alt} 
                  className="w-full rounded-2xl border border-border shadow-lg"
                  loading="lazy"
                  {...props} 
                />
                {alt && <p className="mt-3 text-center text-sm text-muted-foreground italic">{alt}</p>}
              </div>
            );
          },
          // Custom block for interactive artifacts placeholder
          blockquote({ children }: any) {
            return (
              <blockquote className="border-l-4 border-primary/30 pl-6 my-8 italic text-lg text-muted-foreground">
                {children}
              </blockquote>
            );
          },
          table({ children }: any) {
            return (
              <div className="my-8 overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm text-left">
                  {children}
                </table>
              </div>
            );
          },
          th({ children }: any) {
            return <th className="bg-muted/50 px-4 py-3 font-mono text-xs uppercase tracking-wider">{children}</th>;
          },
          td({ children }: any) {
            return <td className="border-t border-border px-4 py-3">{children}</td>;
          },
          a({ node, href, children, ...props }: any) {
            const isExternal = href?.startsWith('http');
            const isFile = href?.match(/\.(pdf|docx|xlsx|pptx|txt|mp4|webm|mp3|wav|json|tsx|jsx)$/i);

            if (isFile && !isExternal) {
              const extension = href.split('.').pop()?.toUpperCase();
              return (
                <a 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="my-4 flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/10 p-3 transition-colors hover:bg-muted/30 group no-underline"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-muted-foreground group-hover:text-primary transition-colors">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{children || 'Download File'}</p>
                      <p className="text-[9px] text-muted-foreground uppercase font-mono">{extension} Asset</p>
                    </div>
                  </div>
                  <Download className="h-3.5 w-3.5 text-muted-foreground" />
                </a>
              );
            }

            return (
              <a 
                href={href} 
                className="text-primary hover:underline underline-offset-4 font-medium"
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                {...props}
              >
                {children}
                {isExternal && <ExternalLink className="inline-block ml-1 h-3 w-3" />}
              </a>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
