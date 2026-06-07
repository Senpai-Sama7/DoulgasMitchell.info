'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { SecondaryPageShell } from '@/components/templates/secondary-page-shell';

interface Note {
  id: string;
  slug: string;
  title: string;
  content: string;
  category: string;
  updatedAt: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/notes')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setNotes(data.notes || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <SecondaryPageShell
      kicker="Digital garden"
      title="Evergreen notes"
      description="Raw thoughts, ongoing research, and archival fragments — updated as understanding evolves."
      trackPageView
    >
      <div className="editorial-container pb-20">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading notes…</p>
        ) : notes.length === 0 ? (
          <div className="glass-panel p-8 text-sm text-muted-foreground">
            The garden is empty. Notes will appear here when published from admin.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {notes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Link href={`/notes/${note.slug}`} className="group block h-full">
                  <article className="bento-card flex h-full flex-col p-6">
                    <div className="mb-4 flex items-center justify-between gap-2">
                      <span className="immersive-kicker">
                        {note.category || 'Fragment'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h2 className="text-lg font-medium group-hover:underline">
                      {note.title}
                    </h2>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {note.content.replace(/[#*`]/g, '')}
                    </p>
                  </article>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </SecondaryPageShell>
  );
}
