"use client";

import { motion } from "framer-motion";
import { MainLayout } from "@/components/main-layout";
import { JournalEntry } from "@/components/journal-entry";
import { journalEntries } from "@/lib/data";

export default function JournalPage() {
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4">
        {/* Page Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-6 md:py-8"
        >
          <h1 className="font-serif text-3xl md:text-4xl mb-2">
            Journal
          </h1>
          <p className="text-sm text-muted-foreground">
            Daily musings and the quiet poetry of everyday life.
          </p>
        </motion.header>

        {/* Journal Entries */}
        <div className="space-y-3">
          {journalEntries.map((entry, index) => (
            <JournalEntry key={entry.id} entry={entry} index={index} />
          ))}
        </div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 py-6 border-t border-border"
        >
          <blockquote className="quote-block text-center border-none pl-0">
            <p className="text-lg md:text-xl">
              &ldquo;The best camera is the one you have with you. The best moment is the one you&apos;re living now.&rdquo;
            </p>
          </blockquote>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center gap-6 py-4 text-center border-t border-border"
        >
          <div>
            <p className="font-serif text-xl font-bold text-primary">
              {journalEntries.length}
            </p>
            <p className="text-xs text-muted-foreground">Entries</p>
          </div>
          <div className="w-px bg-border" />
          <div>
            <p className="font-serif text-xl font-bold text-primary">
              {new Set(journalEntries.flatMap((e) => e.tags)).size}
            </p>
            <p className="text-xs text-muted-foreground">Topics</p>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
