"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Copy, Check } from "lucide-react";
import { JournalEntry as JournalEntryType } from "@/lib/data";
import { Reactions } from "./reactions";
import { cn } from "@/lib/utils";

interface JournalEntryProps {
  entry: JournalEntryType;
  index: number;
}

export function JournalEntry({ entry, index }: JournalEntryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedQuote, setCopiedQuote] = useState(false);

  const copyQuote = async () => {
    if (entry.quote) {
      await navigator.clipboard.writeText(entry.quote);
      setCopiedQuote(true);
      setTimeout(() => setCopiedQuote(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, x: -15 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="journal-entry group"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex gap-3">
        {/* Image */}
        <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden">
          <Image
            src={entry.image}
            alt={entry.imageAlt}
            fill
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-serif text-base md:text-lg font-semibold group-hover:text-primary transition-colors">
                {entry.title}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <time className="font-mono text-xs text-muted-foreground">
                  {formatDate(entry.date)}
                </time>
                {entry.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 text-[10px] rounded bg-accent text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0"
            >
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </motion.div>
          </div>

          {/* Preview Text */}
          <p className={cn(
            "mt-2 text-sm text-muted-foreground line-clamp-2 transition-all duration-200",
            isExpanded && "line-clamp-none"
          )}>
            {entry.content}
          </p>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-border/50">
              {/* Quote */}
              {entry.quote && (
                <div className="relative mb-3">
                  <blockquote className="quote-block text-base py-2">
                    {entry.quote}
                  </blockquote>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyQuote();
                    }}
                    className="absolute top-0 right-0 p-1.5 rounded-full hover:bg-accent transition-colors"
                    aria-label="Copy quote"
                  >
                    {copiedQuote ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              )}

              {/* Reactions */}
              <div className="pt-2">
                <Reactions itemId={entry.id} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
