'use client';

import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Gauge,
  Loader2,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const mdParser = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

interface OptimizationResult {
  score: number;
  suggestions: string[];
  seoKeywords: string[];
  alternativeTitles: string[];
  crossLinkSuggestions: string[];
  probabilityOfLift: number;
  confidence: number;
  calibrationStatus: 'heuristic' | 'not-evaluated';
  decision: {
    action: 'ship' | 'revise' | 'defer';
    rationale: string;
  };
  experiments: string[];
  uncertainty: {
    epistemic: number;
    aleatoric: number;
  };
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  minHeight?: string;
  type?: 'Article' | 'Project' | 'Note';
}

export default function MarkdownEditor({ value, onChange, minHeight = '400px', type = 'Article' }: MarkdownEditorProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [showPanel, setShowPanel] = useState(true);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const wordCount = useMemo(() => {
    const normalized = value.trim();
    return normalized ? normalized.split(/\s+/).length : 0;
  }, [value]);
  const readingMinutes = Math.max(1, Math.round(wordCount / 220) || 1);
  const characterCount = value.length;
  const hasContent = value.trim().length > 0;

  async function handleOptimize() {
    if (!hasContent || isOptimizing) {
      return;
    }

    setIsOptimizing(true);
    setAnalysisError(null);
    setShowPanel(true);

    try {
      const response = await fetch('/api/admin/ai/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: value, type }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Optimization failed.');
      }

      setResult(data.data);
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Optimization failed.');
      setResult(null);
    } finally {
      setIsOptimizing(false);
    }
  }

  return (
    <div className="markdown-editor-container space-y-3" style={{ minHeight }}>
      <div className="flex flex-col gap-3 rounded-[1.5rem] border border-border/70 bg-card/70 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
            <FileText className="h-3.5 w-3.5 text-primary" />
            Editor cockpit
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-border/70 px-3 py-1">{wordCount} words</span>
            <span className="rounded-full border border-border/70 px-3 py-1">{characterCount} characters</span>
            <span className="rounded-full border border-border/70 px-3 py-1">~{readingMinutes} min read</span>
            <span className="rounded-full border border-border/70 px-3 py-1">Type: {type}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={() => setShowPanel((current) => !current)}>
            {showPanel ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
            {showPanel ? 'Hide operator rail' : 'Show operator rail'}
          </Button>
          <Button type="button" onClick={() => void handleOptimize()} disabled={!hasContent || isOptimizing}>
            {isOptimizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Run analysis
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        <div className="min-w-0 flex-1">
          <MdEditor
            value={value}
            style={{ height: minHeight }}
            renderHTML={(text) => mdParser.render(text)}
            onChange={({ text }) => onChange(text)}
            config={{
              view: {
                menu: true,
                md: true,
                html: false,
              },
              canView: {
                menu: true,
                md: true,
                html: true,
                fullScreen: true,
                hideMenu: true,
              },
            }}
          />
        </div>

        {showPanel ? (
          <aside className="w-full shrink-0 rounded-[1.5rem] border border-border/70 bg-card/80 xl:sticky xl:top-24 xl:w-[340px]">
            <div className="flex items-center justify-between border-b border-border/70 px-4 py-4">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                  <Gauge className="h-3.5 w-3.5 text-primary" />
                  Architect optimizer
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Editorial lift, confidence, and revision guidance.</p>
              </div>
            </div>

            <div className="max-h-[min(70vh,720px)] space-y-5 overflow-y-auto p-4">
              {isOptimizing ? (
                <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p>Analyzing structure, clarity, and discoverability...</p>
                </div>
              ) : analysisError ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                  <div className="flex items-center gap-2 font-medium">
                    <AlertCircle className="h-4 w-4" />
                    Analysis failed
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{analysisError}</p>
                </div>
              ) : result ? (
                <>
                  <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">Editorial score</div>
                        <div className="mt-2 text-3xl font-semibold tracking-tight">{result.score}/100</div>
                      </div>
                      <div className="rounded-full border border-border/70 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                        {result.decision.action}
                      </div>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(4, Math.min(100, result.score))}%` }} />
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{result.decision.rationale}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-2xl border border-border/70 p-4">
                      <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">Confidence</div>
                      <div className="mt-2 text-xl font-semibold">{Math.round(result.confidence * 100)}%</div>
                    </div>
                    <div className="rounded-2xl border border-border/70 p-4">
                      <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">Lift probability</div>
                      <div className="mt-2 text-xl font-semibold">{Math.round(result.probabilityOfLift * 100)}%</div>
                    </div>
                    <div className="rounded-2xl border border-border/70 p-4">
                      <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">Calibration</div>
                      <div className="mt-2 text-sm font-medium capitalize">{result.calibrationStatus.replace('-', ' ')}</div>
                    </div>
                    <div className="rounded-2xl border border-border/70 p-4">
                      <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">Uncertainty</div>
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <div>Epistemic: {Math.round(result.uncertainty.epistemic * 100)}%</div>
                        <div>Aleatoric: {Math.round(result.uncertainty.aleatoric * 100)}%</div>
                      </div>
                    </div>
                  </div>

                  <section className="space-y-2">
                    <h4 className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">Recommendations</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {result.suggestions.map((suggestion) => (
                        <li key={suggestion} className="flex gap-2 rounded-2xl border border-border/70 bg-background/50 p-3">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {result.alternativeTitles.length > 0 ? (
                    <section className="space-y-2">
                      <h4 className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">Alternative titles</h4>
                      <div className="space-y-2">
                        {result.alternativeTitles.map((title) => (
                          <div key={title} className="rounded-2xl border border-border/70 p-3 text-sm text-muted-foreground">
                            {title}
                          </div>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {result.seoKeywords.length > 0 ? (
                    <section className="space-y-2">
                      <h4 className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">SEO keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {result.seoKeywords.map((keyword) => (
                          <span key={keyword} className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {result.crossLinkSuggestions.length > 0 ? (
                    <section className="space-y-2">
                      <h4 className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">Cross-link opportunities</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {result.crossLinkSuggestions.map((suggestion) => (
                          <div key={suggestion} className="rounded-2xl border border-border/70 p-3">{suggestion}</div>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {result.experiments.length > 0 ? (
                    <section className="space-y-2">
                      <h4 className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">Suggested experiments</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {result.experiments.map((experiment) => (
                          <div key={experiment} className="rounded-2xl border border-border/70 p-3">{experiment}</div>
                        ))}
                      </div>
                    </section>
                  ) : null}
                </>
              ) : (
                <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-background/40 p-6 text-center text-sm text-muted-foreground">
                  <Sparkles className="h-8 w-8 text-primary/50" />
                  <p>Run analysis to score the draft, surface revision opportunities, and get higher-signal publishing guidance.</p>
                </div>
              )}
            </div>
          </aside>
        ) : null}
      </div>

      <style jsx global>{`
        .markdown-editor-container .rc-md-editor {
          border: 1px solid var(--border) !important;
          background: color-mix(in oklch, var(--card), transparent 10%) !important;
          border-radius: 1.5rem !important;
          overflow: hidden;
        }

        .markdown-editor-container .rc-md-navigation {
          background: color-mix(in oklch, var(--muted), transparent 10%) !important;
          border-bottom: 1px solid var(--border) !important;
        }

        .markdown-editor-container .section-container,
        .markdown-editor-container .rc-md-editor .editor-container .sec-html .html-wrap {
          background: transparent !important;
          color: var(--foreground) !important;
        }

        .markdown-editor-container .rc-md-editor .editor-container .sec-md .input {
          background: transparent !important;
          color: var(--foreground) !important;
          font-family: var(--font-jetbrains-mono), monospace !important;
        }

        .markdown-editor-container .button-type-none {
          color: var(--muted-foreground) !important;
        }

        .markdown-editor-container .button-type-none:hover {
          color: var(--foreground) !important;
          background: var(--accent) !important;
        }
      `}</style>
    </div>
  );
}
