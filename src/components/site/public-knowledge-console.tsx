'use client';

import { FormEvent, useState } from 'react';
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
  const [messages, setMessages] = useState<PublicAssistantMessage[]>([
    {
      id: 'public-assistant-welcome',
      role: 'assistant',
      text: settings.welcomeMessage,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);

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
    <section className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.08),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_35%)]" />
      <div className="editorial-container relative">
        <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-6">
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

            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  Portfolio-only
                </Badge>
                <Badge variant="secondary" className="gap-1.5">
                  <BrainCircuit className="h-3.5 w-3.5" />
                  Deterministic answers
                </Badge>
                <Badge variant="outline">{settings.maxQuestionsPerIp} questions / IP / day</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
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

          <div className="rounded-[32px] border border-border/70 bg-card/80 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur overflow-hidden">
            <Conversation className="h-[28rem] md:h-[34rem] rounded-[32px]">
              <ConversationContent className="gap-5 p-6">
                {messages.map((message) => (
                  <Message key={message.id} from={message.role === 'assistant' ? 'assistant' : 'user'}>
                    <MessageContent
                      className={message.role === 'assistant' ? 'rounded-2xl border border-border/70 bg-background/60 px-4 py-4' : undefined}
                    >
                      <MessageResponse>{message.text}</MessageResponse>
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

                {isLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching the public archive...
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
                  <Button type="submit" disabled={isLoading || !input.trim()}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Ask
                  </Button>
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
