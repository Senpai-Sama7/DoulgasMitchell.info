'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { adminJson, isAdminApiError } from '@/lib/admin-api-client';
import { getAiApiKey } from '@/lib/ai-helpers';
import { Sparkles, Database, Key, Wand2, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SetupGuideProps {
  needsSeed: boolean;
}

export function SetupGuide({ needsSeed }: SetupGuideProps) {
  const [seeding, setSeeding] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const hasAiKey = !!getAiApiKey();

  async function handleSeed() {
    setSeeding(true);
    try {
      // The seed route reports partial failures as { success: false } with a
      // 200 status, so inspect the payload rather than relying on the throw.
      const data = await adminJson<{ success: boolean; message?: string }>('/api/seed', 'POST');
      if (data.success) {
        setSeeded(true);
        toast({ title: 'Content seeded', description: 'Articles, projects, and certifications have been populated.' });
        setTimeout(() => router.refresh(), 500);
      } else {
        toast({
          title: 'Seed failed',
          description: data.message || 'Seeding did not complete.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Seed failed',
        description: isAdminApiError(error) ? error.message : 'Could not reach the seed API.',
        variant: 'destructive',
      });
    } finally {
      setSeeding(false);
    }
  }

  return (
    <Card className="border-amber-500/20 bg-amber-500/[0.03]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-amber-500" />
          Setup Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {needsSeed && (
          <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 p-3">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">No content found</p>
                <p className="text-xs text-muted-foreground">Populate articles, projects, books, and certifications.</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSeed}
              disabled={seeding || seeded}
              className="shrink-0"
            >
              {seeding ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : seeded ? <Check className="h-3 w-3 mr-1" /> : null}
              {seeded ? 'Done' : 'Populate Content'}
            </Button>
          </div>
        )}

        <div className={cn(
          'flex items-center justify-between rounded-md border p-3',
          hasAiKey ? 'border-emerald-500/20 bg-emerald-500/[0.03]' : 'border-border bg-muted/30'
        )}>
          <div className="flex items-center gap-3">
            <Key className={cn('h-5 w-5', hasAiKey ? 'text-emerald-500' : 'text-muted-foreground')} />
            <div>
              <p className="text-sm font-medium">AI Features</p>
              <p className="text-xs text-muted-foreground">
                {hasAiKey
                  ? 'Gemini API key configured — AI features available.'
                  : 'No API key configured. AI-powered features are disabled.'}
              </p>
            </div>
          </div>
          <div className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
            hasAiKey ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'
          )}>
            {hasAiKey ? 'Active' : 'Offline'}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">AI Operator Console</p>
              <p className="text-xs text-muted-foreground">Chat-based content management with AI assistance.</p>
            </div>
          </div>
          <Button size="sm" variant="ghost" onClick={() => router.push('/admin/operator')} className="shrink-0">
            Open
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
