'use client';

import { FormEvent, KeyboardEvent, useEffect, useState } from 'react';
import { BrainCircuit, Loader2, Shield, Sparkles } from 'lucide-react';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    <section id="public-assistant" className="relative overflow-hidden py-24 w-full max-w-[100vw]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.08),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_35%)] max-w-full" />
      <div className="editorial-container relative">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-6 min-w-0">
            <div className="space-y-4">
              <Badge variant="outline" className="gap-2 rounded-full px-4 py-1 font-mono text-[11px] uppercase tracking-[0.22em]">
                <Sparkles className="h-3.5 w-3.5" />
                Public Knowledge Console
              </Badge>
              <div>
                <h2 className="editorial-title max-w-xl">Ask the public archive.</h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {settings.welcomeMessage}
                </p>
              </div>
            </div>

            <div className="space-y-3 max-w-full overflow-hidden">
              <div className="flex flex-wrap gap-2 max-w-full">
                <Badge variant="secondary" className="gap-1.5 shrink-0">
                  <Shield className="h-3.5 w-3.5" />
                  Portfolio-only
                </Badge>
                <Badge variant="secondary" className="gap-1.5 shrink-0">
                  <BrainCircuit className="h-3.5 w-3.5" />
                  {settings.enableDecisionIntelligence ? 'Confidence-aware answers' : 'Deterministic answers'}
                </Badge>
                <Badge variant="outline" className="shrink-0">{settings.maxQuestionsPerIp} questions / IP / day</Badge>
              </div>
              <p className="text-xs text-muted-foreground break-words">
                Ask about projects, articles, the book, certifications, or operating principles. Sensitive topics and private contact details are refused automatically.
              </p>
              <div className="rounded-2xl border border-border/70 bg-background/60 p-4 text-sm text-muted-foreground">
                The assistant only uses public site content. For better answers, include the topic you care about and the outcome you want.
              </div>
              {remaining !== null ? (
                <p className="text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
                  Remaining today: {remaining}
                </p>
              ) : null}
              <div aria-live="polite" className="sr-only">
                {remaining !== null ? `${remaining} public archive questions remaining today.` : ''}
              </div>
            </div>

            <Suggestions>
              {suggestions.map((suggestion) => (
                <Suggestion
                  key={suggestion}
                  suggestion={suggestion}
                  onClick={(prompt) => {
                    void submitQuestion(prompt);
                  }}
                />
              ))}
            </Suggestions>
          </div>

          <div className="rounded-[32px] border border-border/70 bg-card/80 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur overflow-hidden w-full max-w-full mx-auto">
            <Conversation className="h-[28rem] md:h-[34rem] rounded-[32px] w-full">
              <ConversationContent className="gap-5 p-4 md:p-6 w-full">
                {messages.map((message) => (
                  <Message key={message.id} from={message.role === 'assistant' ? 'assistant' : 'user'} className="w-full">
                    <MessageContent
                      className={message.role === 'assistant' ? 'rounded-2xl border border-border/70 bg-background/60 px-4 py-4 max-w-[90%] md:max-w-[85%]' : 'max-w-[90%] md:max-w-[85%] ml-auto'}
                    >
                      <MessageResponse className="break-words overflow-hidden">{message.text}</MessageResponse>
                      {message.role === 'assistant' && settings.enableDecisionIntelligence && message.decision ? (
                        <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full border border-border/70 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.16em] text-foreground">
                              {message.decision.label}
                            </span>
                            {typeof message.confidence === 'number' ? (
                              <span className="rounded-full border border-border/70 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                                {Math.round(message.confidence * 100)}% confidence
                              </span>
                            ) : null}
                          </div>

                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {message.decision.rationale}
                          </p>

                          {message.uncertainty ? (
                            <div className="grid gap-2 sm:grid-cols-3">
                              <div className="rounded-2xl border border-border/60 bg-background/50 px-3 py-2">
                                <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                                  Epistemic
                                </div>
                                <div className="mt-1 text-sm font-medium">
                                  {Math.round(message.uncertainty.epistemic * 100)}%
                                </div>
                              </div>
                              <div className="rounded-2xl border border-border/60 bg-background/50 px-3 py-2">
                                <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                                  Aleatoric
                                </div>
                                <div className="mt-1 text-sm font-medium">
                                  {Math.round(message.uncertainty.aleatoric * 100)}%
                                </div>
                              </div>
                              <div className="rounded-2xl border border-border/60 bg-background/50 px-3 py-2">
                                <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
                                  Calibration
                                </div>
                                <div className="mt-1 text-sm font-medium">
                                  {message.uncertainty.calibrationStatus.replace(/-/g, ' ')}
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </MessageContent>
                  </Message>
                ))}
                {isThinking && (
                  <Message from="assistant" className="w-full">
                    <MessageContent className="rounded-2xl border border-border/70 bg-background/60 px-4 py-4 max-w-[90%] md:max-w-[85%]">
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="font-mono text-xs text-muted-foreground">
                          {thinkingStep === 0 ? 'Analyzing public knowledge base...' : 
                           thinkingStep === 1 ? 'Evaluating evidence and confidence...' : 
                           'Synthesizing architectural response...'}
                        </span>
                      </div>
                    </MessageContent>
                  </Message>
                )}
                <ConversationScrollButton />
              </ConversationContent>
            </Conversation>

            <div className="border-t border-border/70 p-4">
              <form onSubmit={handleSubmit} className="space-y-3">
                <Textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  placeholder="Ask about Douglas Mitchell’s public work..."
                  aria-label="Ask the public archive about Douglas Mitchell"
                  disabled={isLoading}
                  rows={3}
                  className="min-h-[88px] resize-none"
                />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    Public, non-sensitive questions only. Press Enter to ask, Shift+Enter for a new line.
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (resetPending) {
                          clearConversation();
                          return;
                        }
                        setResetPending(true);
                        window.setTimeout(() => setResetPending(false), 2500);
                      }}
                      className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground"
                      disabled={isLoading || messages.length <= 1}
                    >
                      {resetPending ? 'Confirm reset' : 'Reset'}
                    </Button>
                    <Button type="submit" disabled={isLoading || !input.trim()}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      Ask
                    </Button>
                  </div>
                </div>
                <div aria-live="polite" aria-atomic="true">
                  {resetPending ? (
                    <p className="text-xs text-muted-foreground">Press reset again to clear this public archive session.</p>
                  ) : null}
                  {error ? <p className="text-xs text-destructive">{error}</p> : null}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
