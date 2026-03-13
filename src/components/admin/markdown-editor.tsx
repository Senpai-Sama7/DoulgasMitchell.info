'use client';

import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import { useState } from 'react';
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [showPanel, setShowPanel] = useState(false);

  async function handleOptimize() {
    if (!value || isOptimizing) return;
    setIsOptimizing(true);
    setResult(null);
    setShowPanel(true);

    try {
      const res = await fetch('/api/admin/ai/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: value, type }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      }
    } catch (error) {
      console.error('Optimization failed', error);
    } finally {
      setIsOptimizing(false);
    }
  }

  return (
    <div className="relative markdown-editor-container" style={{ minHeight }}>
      <div className="flex gap-4">
        <div className="flex-1">
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

        <AnimatePresence>
          {showPanel && (
            <motion.div
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 320 }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              className="border border-zinc-800 bg-zinc-950/50 rounded-md overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  Architect Optimizer
                </h3>
                <button 
                  onClick={() => setShowPanel(false)}
                  className="text-zinc-500 hover:text-zinc-300 text-[10px]"
                >
                  CLOSE
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {isOptimizing ? (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
                    <span className="text-[10px] uppercase animate-pulse">Analyzing content structure...</span>
                  </div>
                ) : result ? (
                  <>
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] text-zinc-500 uppercase">Editorial Score</span>
                        <span className={`text-xl font-bold ${result.score > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {result.score}/100
                        </span>
                      </div>
                      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${result.score}%` }}
                          className={`h-full ${result.score > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                        />
                      </div>
                    </div>

                    <section className="space-y-2">
                      <h4 className="text-[10px] font-bold text-zinc-400 uppercase">Suggestions</h4>
                      <ul className="space-y-1.5">
                        {result.suggestions.map((s, i) => (
                          <li key={i} className="text-[11px] text-zinc-300 flex gap-2">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section className="space-y-2">
                      <h4 className="text-[10px] font-bold text-zinc-400 uppercase">SEO Keywords</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {result.seoKeywords.map((k, i) => (
                          <span key={i} className="text-[9px] bg-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-800">
                            {k}
                          </span>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-2">
                      <h4 className="text-[10px] font-bold text-zinc-400 uppercase">Alt Titles</h4>
                      {result.alternativeTitles.map((t, i) => (
                        <div key={i} className="text-[11px] text-zinc-500 italic leading-relaxed">
                          "{t}"
                        </div>
                      ))}
                    </section>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-600 text-center gap-4">
                    <AlertCircle className="w-8 h-8 opacity-20" />
                    <p className="text-[10px] uppercase leading-relaxed max-w-[180px]">
                      Ready to refine your editorial structure? 
                    </p>
                    <button 
                      onClick={handleOptimize}
                      className="text-[10px] border border-zinc-800 px-3 py-1.5 hover:bg-zinc-900 transition-colors uppercase font-bold"
                    >
                      Run Analysis
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!showPanel && (
          <button
            onClick={handleOptimize}
            className="absolute top-2 right-2 z-10 p-2 bg-zinc-900/80 backdrop-blur rounded border border-zinc-700 text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/50 transition-all shadow-xl flex items-center gap-2 group"
            title="Optimize with Architect AI"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase overflow-hidden w-0 group-hover:w-20 transition-all">Optimize</span>
          </button>
        )}
      </div>
      <style jsx global>{`
        .rc-md-editor {
          border: 1px solid hsl(var(--border)) !important;
          background-color: transparent !important;
        }
        .rc-md-navigation {
          background-color: hsl(var(--muted) / 0.5) !important;
          border-bottom: 1px solid hsl(var(--border)) !important;
        }
        .section-container {
          background-color: transparent !important;
          color: inherit !important;
        }
        .rc-md-editor .editor-container .sec-md .input {
          background-color: transparent !important;
          color: hsl(var(--foreground)) !important;
          font-family: var(--font-jetbrains-mono), monospace !important;
        }
        .rc-md-editor .editor-container .sec-html .html-wrap {
          background-color: transparent !important;
          color: hsl(var(--foreground)) !important;
        }
        .button-type-none {
          color: hsl(var(--muted-foreground)) !important;
        }
        .button-type-none:hover {
          color: hsl(var(--foreground)) !important;
          background-color: hsl(var(--accent)) !important;
        }
      `}</style>
    </div>
  );
}
