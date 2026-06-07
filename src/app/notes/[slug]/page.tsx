'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';
import { ContentRenderer } from '@/components/site/content-renderer';
import { SecondaryPageShell } from '@/components/templates/secondary-page-shell';
import { ScrollReveal } from '@/components/immersive/scroll-reveal';

interface Note {
  id: string;
  slug: string;
  title: string;
  content: string;
  category: string;
  updatedAt: string;
}

export default function NoteDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    fetch('/api/admin/notes')
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          setMissing(true);
          setLoading(false);
          return;
        }
        const found = (data.notes as Note[]).find((n) => n.slug === slug);
        if (!found) {
          setMissing(true);
        } else {
          setNote(found);
        }
        setLoading(false);
      })
      .catch(() => {
        setMissing(true);
        setLoading(false);
      });
  }, [slug]);

  return (
    <SecondaryPageShell trackPageView={false}>
      <div className="editorial-container pb-20">
        <ScrollReveal>
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to garden
          </Link>
        </ScrollReveal>

        {loading ? (
          <p className="mt-10 text-sm text-muted-foreground">Loading note…</p>
        ) : missing ? (
          <div className="glass-panel mt-10 p-8 text-sm text-muted-foreground">
            Note not found.
          </div>
        ) : note ? (
          <article className="content-container mx-auto mt-10 max-w-[42rem]">
            <p className="immersive-kicker mb-4">
              {note.category || 'Fragment'} ·{' '}
              {new Date(note.updatedAt).toLocaleDateString()}
            </p>
            <h1 className="editorial-title">{note.title}</h1>
            <div className="reading-content mt-10">
              <ContentRenderer content={note.content} />
            </div>
          </article>
        ) : null}
      </div>
    </SecondaryPageShell>
  );
}
