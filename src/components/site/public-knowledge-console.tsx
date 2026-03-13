'use client';

import { FormEvent, useEffect, useState } from 'react';
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
import { Input } from '@/components/ui/input';

type PublicAssistantSettings = {
  enabled: boolean;
  maxQuestionsPerIp: number;
  welcomeMessage: string;
};

type PublicAssistantMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  citations?: Array<{ label: string; href?: string }>;
  refusal?: boolean;
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
        console.error('Failed to parse chat history', e);
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

  if (!settings.enabled) {
    return null;
  }

  return (
    <section className="relative overflow-hidden py-24 w-full max-w-[100vw]">
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
                  Deterministic answers
                </Badge>
                <Badge variant="outline" className="shrink-0">{settings.maxQuestionsPerIp} questions / IP / day</Badge>
              </div>
              <p className="text-xs text-muted-foreground break-words">
                Ask about projects, articles, the book, certifications, or operating principles. Sensitive topics and private contact details are refused automatically.
              </p>
              {remaining !== null ? (
                <p className="text-xs font-mono uppercase tracking-[0.22em] text-muted-foreground">
                  Remaining today: {remaining}
                </p>
              ) : null}
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
                      {message.role === 'assistant' && message.citations?.length ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {message.citations.map((citation) =>
                            citation.href ? (
                              <a
                                key={`${message.id}-${citation.label}`}
                                href={citation.href}
                                className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                              >
                                {citation.label}
                              </a>
                            ) : (
                              <span
                                key={`${message.id}-${citation.label}`}
                                className="rounded-full border border-border/70 px-3 py-1 text-xs text-muted-foreground"
                              >
                                {citation.label}
                              </span>
                            )
                          )}
                        </div>
                      ) : null}
                    </MessageContent>
                  </Message>
                ))}

                {isThinking ? (
                  <div className="flex flex-col gap-2 p-4 rounded-2xl border border-border/70 bg-background/40 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-primary">
                      <BrainCircuit className="h-3.5 w-3.5 animate-pulse" />
                      {thinkingStep === 0 && "Analyzing query parameters..."}
                      {thinkingStep === 1 && "Scanning public knowledge archive..."}
                      {thinkingStep === 2 && "Synthesizing deterministic response..."}
                    </div>
                    <div className="flex gap-1">
                      <div className="h-1 w-8 rounded-full bg-primary/20 overflow-hidden">
                        <div className="h-full bg-primary animate-progress" />
                      </div>
                      <div className="h-1 w-8 rounded-full bg-muted overflow-hidden">
                        {thinkingStep >= 1 && <div className="h-full bg-primary animate-progress" />}
                      </div>
                      <div className="h-1 w-8 rounded-full bg-muted overflow-hidden">
                        {thinkingStep >= 2 && <div className="h-full bg-primary animate-progress" />}
                      </div>
                    </div>
                  </div>
                ) : null}

                {isLoading && !isThinking ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground ml-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Finalizing response...
                  </div>
                ) : null}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>

            <div className="border-t border-border/70 p-4">
              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about Douglas Mitchell’s public work..."
                  aria-label="Ask the public archive about Douglas Mitchell"
                  disabled={isLoading}
                />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    Public, non-sensitive questions only.
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Clear chat history?')) {
                          const welcome = {
                            id: 'public-assistant-welcome',
                            role: 'assistant' as const,
                            text: settings.welcomeMessage,
                          };
                          setMessages([welcome]);
                          localStorage.removeItem('public_assistant_history');
                        }
                      }}
                      className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground"
                      disabled={isLoading || messages.length <= 1}
                    >
                      Clear
                    </Button>
                    <Button type="submit" disabled={isLoading || !input.trim()}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      Ask
                    </Button>
                  </div>
                </div>
                {error ? <p className="text-xs text-destructive">{error}</p> : null}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
