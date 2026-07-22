'use client';

import { FormEvent, KeyboardEvent, useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { MessageResponse } from '@/components/ai-elements/message';
import { Textarea } from '@/components/ui/textarea';
import { logger } from '@/lib/logger';

type PublicAssistantSettings = {
  enabled: boolean;
  maxQuestionsPerIp: number;
  welcomeMessage: string;
  enableDecisionIntelligence: boolean;
};

type PublicAssistantMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  citations?: Array<{ label: string; href?: string }>;
  refusal?: boolean;
  route?: string;
  confidence?: number;
  confidenceLabel?: 'high' | 'moderate' | 'low';
  decision?: {
    action: 'proceed' | 'conditional' | 'defer' | 'refuse';
    label: string;
    rationale: string;
    requiredEvidence: string[];
  };
  uncertainty?: {
    epistemic: number;
    aleatoric: number;
    semanticEntropy: number;
    calibrationStatus: 'heuristic' | 'benchmarking' | 'not-evaluated';
    drivers: string[];
    missingInformation: string[];
  };
};

const DEFAULT_SUGGESTIONS = [
  'What kind of work does Douglas Mitchell do?',
  'What are the standout projects on this site?',
  'Tell me about The Confident Mind.',
  'What certifications are featured here?',
];

const THINKING_READOUTS = [
  'Scanning the public knowledge base',
  'Weighing evidence and confidence',
  'Composing the answer',
] as const;

const specRowClass = 'grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-4 py-3';
const specLabelClass = 'font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground';

/**
 * Interlude beat — the public archive rendered as a console instrument in the
 * same ink + teal precision grammar as the Four-Gate decision check: spec
 * rows instead of badge pills, ledger entries instead of chat bubbles, a
 * status lamp instead of a spinner. All assistant behaviour (history, rate
 * budget, decision intelligence, reset confirm) is unchanged.
 */
export function PublicKnowledgeConsole({ settings }: { settings: PublicAssistantSettings }) {
  const [messages, setMessages] = useState<PublicAssistantMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const [resetPending, setResetPending] = useState(false);

  // Initialize and load chat history
  useEffect(() => {
    const saved = localStorage.getItem('public_assistant_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          return;
        }
      } catch (e) {
        logger.error('Failed to parse chat history', e);
      }
    }

    // Default welcome message if no history
    setMessages([
      {
        id: 'public-assistant-welcome',
        role: 'assistant',
        text: settings.welcomeMessage,
      },
    ]);
  }, [settings.welcomeMessage]);

  // Persist history on change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('public_assistant_history', JSON.stringify(messages));
    }
  }, [messages]);

  async function submitQuestion(question: string) {
    const trimmed = question.trim();
    if (!trimmed || isLoading) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        text: trimmed,
      },
    ]);
    setInput('');
    setError(null);
    setIsLoading(true);
    setIsThinking(true);
    setThinkingStep(0);

    const thinkingInterval = setInterval(() => {
      setThinkingStep((prev) => (prev + 1) % 3);
    }, 1200);

    try {
      const response = await fetch('/api/public-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Public assistant failed to answer.');
      }

      // Artificial delay to show "thinking" steps for a better AI experience
      await new Promise((resolve) => setTimeout(resolve, 1800));
      clearInterval(thinkingInterval);
      setIsThinking(false);

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: payload.answer,
          citations: payload.citations,
          refusal: payload.refusal,
          route: payload.route,
          confidence: payload.confidence,
          confidenceLabel: payload.confidenceLabel,
          decision: payload.decision,
          uncertainty: payload.uncertainty,
        },
      ]);
      setRemaining(typeof payload.remaining === 'number' ? payload.remaining : null);
      if (Array.isArray(payload.suggestions) && payload.suggestions.length > 0) {
        setSuggestions(payload.suggestions);
      }
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Public assistant failed to answer.';
      setError(message);
      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          text:
            message === 'Daily question limit reached for this IP.'
              ? 'This IP has reached the daily question limit for the public assistant.'
              : 'I could not answer that just now. Try again with a question about public portfolio content.',
          refusal: true,
        },
      ]);
    } finally {
      clearInterval(thinkingInterval);
      setIsLoading(false);
      setIsThinking(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitQuestion(input);
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void submitQuestion(input);
    }
  }

  function clearConversation() {
    const welcome = {
      id: 'public-assistant-welcome',
      role: 'assistant' as const,
      text: settings.welcomeMessage,
    };
    setMessages([welcome]);
    setSuggestions(DEFAULT_SUGGESTIONS);
    setRemaining(null);
    setError(null);
    setResetPending(false);
    localStorage.removeItem('public_assistant_history');
  }

  if (!settings.enabled) {
    return null;
  }

  return (
    <section
      id="public-assistant"
      className="relative w-full max-w-[100vw] overflow-hidden border-t border-border/50 bg-muted/20"
    >
      <div className="editorial-container section-spacing relative">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          {/* ── Editorial brief ─────────────────────────────────────────── */}
          <div className="min-w-0">
            <p className="chapter-label mb-8">Interlude · Console</p>
            <h2 className="editorial-title">
              Query the
              <br />
              <span className="text-muted-foreground">public record.</span>
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {settings.welcomeMessage}
            </p>

            {/* Operating protocol — spec rows, not badge pills */}
            <dl className="mt-10 divide-y divide-border/55 border-y border-border/55">
              <div className={specRowClass}>
                <dt className={specLabelClass}>Scope</dt>
                <dd className="text-sm leading-relaxed text-foreground/85">
                  Public portfolio record only. Sensitive topics and private contact details are
                  refused automatically.
                </dd>
              </div>
              <div className={specRowClass}>
                <dt className={specLabelClass}>Mode</dt>
                <dd className="text-sm leading-relaxed text-foreground/85">
                  {settings.enableDecisionIntelligence
                    ? 'Confidence-weighted answers with decision rationale.'
                    : 'Deterministic answers from the published archive.'}
                </dd>
              </div>
              <div className={specRowClass}>
                <dt className={specLabelClass}>Budget</dt>
                <dd className="text-sm tabular-nums text-foreground/85">
                  {settings.maxQuestionsPerIp} questions · IP · day
                </dd>
              </div>
              <div className={specRowClass}>
                <dt className={specLabelClass}>Remaining</dt>
                <dd className="font-mono text-sm tabular-nums text-foreground/85">
                  {remaining !== null ? remaining : '—'}
                </dd>
              </div>
            </dl>
            <div aria-live="polite" className="sr-only">
              {remaining !== null ? `${remaining} public archive questions remaining today.` : ''}
            </div>

            {/* Sample queries — an index, not a pill farm */}
            <p className="immersive-kicker mb-1 mt-10">Sample queries</p>
            <div className="divide-y divide-border/50">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  type="button"
                  data-cursor="interactive"
                  disabled={isLoading}
                  onClick={() => {
                    void submitQuestion(suggestion);
                  }}
                  className="group flex w-full items-baseline gap-4 py-3 text-left disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span
                    className="font-mono text-[0.6rem] tabular-nums tracking-[0.2em] text-muted-foreground/60"
                    aria-hidden
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="lux-underline min-w-0 text-sm text-foreground/85 transition-colors group-hover:text-foreground">
                    {suggestion}
                  </span>
                  <ArrowUpRight
                    className="ml-auto h-3 w-3 shrink-0 self-center text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden
                  />
                </button>
              ))}
            </div>
          </div>

          {/* ── The instrument ──────────────────────────────────────────── */}
          <div className="console-instrument min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border/60 px-4 py-3 md:px-6">
              <div className="flex items-center gap-2.5">
                <span className="console-lamp" data-state={isLoading ? 'busy' : 'idle'} aria-hidden />
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                  Archive console
                </span>
              </div>
              <div className="flex items-center gap-5">
                {remaining !== null ? (
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] tabular-nums text-muted-foreground">
                    {remaining} remaining
                  </span>
                ) : null}
                <button
                  type="button"
                  data-cursor="interactive"
                  onClick={() => {
                    if (resetPending) {
                      clearConversation();
                      return;
                    }
                    setResetPending(true);
                    window.setTimeout(() => setResetPending(false), 2500);
                  }}
                  disabled={isLoading || messages.length <= 1}
                  className="min-h-11 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {resetPending ? 'Confirm reset' : 'Reset'}
                </button>
              </div>
            </div>

            <Conversation className="h-[26rem] w-full md:h-[32rem]">
              <ConversationContent className="w-full gap-7 p-4 md:p-6">
                {messages.map((message) =>
                  message.role === 'user' ? (
                    <div key={message.id} className="console-entry w-full" data-role="user">
                      <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                        Query
                      </p>
                      <p className="mt-1.5 break-words text-sm font-medium leading-relaxed">
                        {message.text}
                      </p>
                    </div>
                  ) : (
                    <div
                      key={message.id}
                      className="console-entry w-full"
                      data-role={message.refusal ? 'refusal' : 'assistant'}
                    >
                      <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                        {message.refusal ? 'Archive · Refused' : 'Archive'}
                      </p>
                      <MessageResponse className="mt-2 break-words text-sm leading-relaxed">
                        {message.text}
                      </MessageResponse>

                      {settings.enableDecisionIntelligence && message.decision ? (
                        <div className="mt-4 space-y-3 border-t border-border/50 pt-4">
                          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 font-mono text-[0.6rem] uppercase tracking-[0.18em]">
                            <span
                              className={
                                message.decision.action === 'proceed'
                                  ? 'text-brand-accent'
                                  : 'text-foreground'
                              }
                            >
                              {message.decision.label}
                            </span>
                            {typeof message.confidence === 'number' ? (
                              <span className="tabular-nums text-muted-foreground">
                                {Math.round(message.confidence * 100)}% confidence
                              </span>
                            ) : null}
                          </div>

                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {message.decision.rationale}
                          </p>

                          {message.uncertainty ? (
                            <dl className="grid divide-y divide-border/60 border border-border/60 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                              <div className="px-3 py-2">
                                <dt className="font-mono text-[0.55rem] uppercase tracking-[0.16em] text-muted-foreground">
                                  Epistemic
                                </dt>
                                <dd className="mt-1 text-sm font-medium tabular-nums">
                                  {Math.round(message.uncertainty.epistemic * 100)}%
                                </dd>
                              </div>
                              <div className="px-3 py-2">
                                <dt className="font-mono text-[0.55rem] uppercase tracking-[0.16em] text-muted-foreground">
                                  Aleatoric
                                </dt>
                                <dd className="mt-1 text-sm font-medium tabular-nums">
                                  {Math.round(message.uncertainty.aleatoric * 100)}%
                                </dd>
                              </div>
                              <div className="px-3 py-2">
                                <dt className="font-mono text-[0.55rem] uppercase tracking-[0.16em] text-muted-foreground">
                                  Calibration
                                </dt>
                                <dd className="mt-1 text-sm font-medium">
                                  {message.uncertainty.calibrationStatus.replace(/-/g, ' ')}
                                </dd>
                              </div>
                            </dl>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  )
                )}

                {isThinking ? (
                  <div className="console-entry w-full" data-role="assistant">
                    <p className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                      Archive · Working
                    </p>
                    <p className="mt-2 flex items-center gap-2 font-mono text-xs text-muted-foreground">
                      {THINKING_READOUTS[thinkingStep] ?? THINKING_READOUTS[0]}
                      <span className="console-caret" aria-hidden />
                    </p>
                  </div>
                ) : null}
                <ConversationScrollButton />
              </ConversationContent>
            </Conversation>

            {/* Composer — a prompt line, not a chat box */}
            <form onSubmit={handleSubmit} className="border-t border-border/60">
              <div className="flex items-start gap-3 px-4 pt-4 md:px-6">
                <span
                  className="select-none pt-1 font-mono text-sm leading-none text-brand-accent"
                  aria-hidden
                >
                  &gt;
                </span>
                <Textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  placeholder="Query the public archive…"
                  aria-label="Ask the public archive about Douglas Mitchell"
                  disabled={isLoading}
                  rows={2}
                  className="min-h-16 resize-none rounded-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-4 pt-3 md:px-6">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground/70">
                  Enter to ask · Shift+Enter for a new line
                </p>
                <button
                  type="submit"
                  data-cursor="interactive"
                  disabled={isLoading || !input.trim()}
                  className="inline-flex min-h-10 items-center gap-2 border border-foreground bg-foreground px-5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  {isLoading ? 'Working' : 'Ask'}
                </button>
              </div>
              <div aria-live="polite" aria-atomic="true">
                {resetPending ? (
                  <p className="px-4 pb-4 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground md:px-6">
                    Press reset again to clear this session.
                  </p>
                ) : null}
                {error ? (
                  <p className="px-4 pb-4 text-xs text-destructive md:px-6">{error}</p>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
