'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Note {
  id: string;
  slug: string;
  title: string;
  content: string;
  category: string;
  updatedAt: string;
}

export default function DigitalGarden() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/notes')
      .then(res => res.json())
      .then(data => {
        if (data.success) setNotes(data.notes || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 font-mono text-zinc-500">Cultivating garden...</div>;

  return (
    <main className="min-h-screen pt-24 pb-12 px-6 max-w-4xl mx-auto font-mono">
      <header className="mb-12 border-b border-zinc-800 pb-8">
        <h1 className="text-3xl font-bold mb-2 uppercase tracking-tighter">Digital Garden</h1>
        <p className="text-zinc-500 text-sm max-w-xl">
          A collection of raw thoughts, ongoing research, and archival fragments. 
          Unlike formal writing, these notes are evergreen and subject to change.
        </p>
      </header>

      <div className="grid gap-6">
        {notes.length === 0 ? (
          <p className="text-zinc-600 italic">The garden is currently empty.</p>
        ) : (
          notes.map((note, i) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group border border-zinc-900 hover:border-zinc-700 p-4 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] bg-zinc-900 text-zinc-500 px-1.5 py-0.5 uppercase">
                  {note.category || 'Fragment'}
                </span>
                <span className="text-[10px] text-zinc-600">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <Link href={`/notes/${note.slug}`} className="block">
                <h2 className="text-lg font-bold group-hover:text-zinc-300 transition-colors">
                  {note.title}
                </h2>
                <p className="text-zinc-500 text-xs line-clamp-2 mt-1">
                  {note.content.replace(/[#*`]/g, '')}
                </p>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </main>
  );
}
