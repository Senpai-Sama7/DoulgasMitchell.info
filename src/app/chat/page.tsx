'use client';

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Sparkles, Shield, Zap } from 'lucide-react';
import { useCallback, useState } from 'react';

type ChatStatus = 'ready' | 'submitted' | 'error';

type Citation = {
  title: string;
  source?: string;
  kind?: string;
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  confidence?: number;
  confidenceLabel?: string;
};

const DEFAULT_SUGGESTIONS = [
  "What's your professional background?",
  'What are your core engineering principles?',
  'Tell me about your certifications.',
  'What technologies do you work with?',
];

function cid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>('ready');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (msg: PromptInputMessage) => {
      const question = msg.text.trim();
      if (!question || status !== 'ready') return;

      const userMessage: ChatMessage = {
        id: cid(),
        role: 'user',
        content: question,
      };

      setMessages((prev) => [...prev, userMessage]);
      setStatus('submitted');
      setError(null);

      try {
        const response = await fetch('/api/public-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(
            data?.error || data?.message || `Request failed (${response.status})`
          );
        }

        const data = await response.json();

        const assistantMessage: ChatMessage = {
          id: cid(),
          role: 'assistant',
          content: data.answer ?? 'I apologize, I could not find a relevant answer.',
          citations: data.citations ?? [],
          confidence: data.confidence,
          confidenceLabel: data.confidenceLabel,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setStatus('ready');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Something went wrong. Please try again.';
        setError(message);
        setStatus('error');

        const errorMessage: ChatMessage = {
          id: cid(),
          role: 'assistant',
          content: `I'm having trouble right now — ${message}`,
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    },
    [status]
  );

  const handleSuggestionClick = useCallback(
    (text: string) => {
      handleSubmit({ text, files: [] });
    },
    [handleSubmit]
  );

  return (
    <div className="flex h-[calc(100vh-1px)] flex-col bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 border-b px-4 py-3 sm:px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-semibold">Douglas Mitchell — AI Assistant</h1>
          <p className="text-xs text-muted-foreground">
            Ask about experience, principles, certifications, or tech stack.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Knowledge-based answers</span>
          <Zap className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">No LLM hallucination</span>
        </div>
      </header>

      {/* Conversation Area */}
      <Conversation className="flex-1">
        {messages.length === 0 ? (
          <ConversationEmptyState
            title="Ask me anything about Douglas Mitchell"
            description="This assistant draws from verified public knowledge — articles, projects, certifications, and documented principles."
          >
            <div className="grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
              {DEFAULT_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSuggestionClick(s)}
                  className="rounded-lg border border-border/60 px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-muted/50 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </ConversationEmptyState>
        ) : (
          <ConversationContent>
            {messages.map((msg) => (
              <Message key={msg.id} from={msg.role}>
                <MessageContent>
                  {msg.role === 'user' ? (
                    <p className="text-sm">{msg.content}</p>
                  ) : (
                    <MessageResponse>{msg.content}</MessageResponse>
                  )}
                </MessageContent>

                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {msg.citations.map((c, i) => (
                      <Card
                        key={i}
                        className="rounded-md border-border/40 bg-muted/30 px-2 py-1 text-xs text-muted-foreground"
                      >
                        {c.title}
                        {c.kind && (
                          <span className="ml-1 text-[10px] uppercase opacity-60">
                            ({c.kind})
                          </span>
                        )}
                      </Card>
                    ))}
                  </div>
                )}

                {msg.confidenceLabel && (
                  <div className="mt-1">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
                        msg.confidenceLabel === 'High' && 'bg-emerald-500/10 text-emerald-600',
                        msg.confidenceLabel === 'Medium' && 'bg-amber-500/10 text-amber-600',
                        msg.confidenceLabel === 'Low' && 'bg-red-500/10 text-red-600',
                        !['High', 'Medium', 'Low'].includes(msg.confidenceLabel) &&
                          'bg-muted text-muted-foreground'
                      )}
                    >
                      Confidence: {msg.confidenceLabel}
                      {msg.confidence != null && ` (${(msg.confidence * 100).toFixed(0)}%)`}
                    </span>
                  </div>
                )}
              </Message>
            ))}
          </ConversationContent>
        )}
        <ConversationScrollButton />
      </Conversation>

      {/* Error Banner */}
      {error && (
        <div className="border-t border-red-500/20 bg-red-500/5 px-4 py-2 text-center text-xs text-red-500 sm:px-6">
          {error}
          <button
            type="button"
            onClick={() => {
              setError(null);
              setStatus('ready');
            }}
            className="ml-2 underline hover:text-red-400"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-3xl p-4">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputTextarea placeholder="What would you like to know?" />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputSubmit
                status={status === 'submitted' ? 'submitted' : status === 'error' ? 'error' : undefined}
                onStop={() => setStatus('ready')}
              />
            </PromptInputFooter>
          </PromptInput>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            AI responses are based on verified public knowledge. Always double-check critical information.
          </p>
        </div>
      </div>
    </div>
  );
}
