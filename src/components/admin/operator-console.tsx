'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import {
  Bot,
  BrainCircuit,
  Loader2,
  RefreshCw,
  Save,
  Settings2,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorName,
  ModelSelectorTrigger,
} from '@/components/ai-elements/model-selector';
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning';
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion';
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from '@/components/ai-elements/tool';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type OperatorProviderId =
  | 'google'
  | 'groq'
  | 'openrouter'
  | 'sambanova'
  | 'cerebras'
  | 'mistral'
  | 'minimax'
  | 'ollama-cloud'
  | 'opencode-zen'
  | 'openai';

type OperatorProviderStatus = {
  id: OperatorProviderId;
  label: string;
  logo: string;
  description: string;
  defaultModel: string;
  configured: boolean;
  recommended: boolean;
  freeTierFriendly: boolean;
  effectiveBaseURL: string | null;
};

type AdminOperatorSettings = {
  primaryProvider: OperatorProviderId;
  fallbackProviders: OperatorProviderId[];
  modelOverrides: Partial<Record<OperatorProviderId, string>>;
  maxToolSteps: number;
  temperature: number;
  freeTierOnly: boolean;
  showReasoning: boolean;
};

type PublicAssistantSettings = {
  enabled: boolean;
  maxQuestionsPerIp: number;
  strictTopicMode: boolean;
  welcomeMessage: string;
  refusalMessage: string;
};

type DashboardData = {
  stats: {
    articles: number;
    projects: number;
    media: number;
    contacts: number;
    subscribers: number;
    pageViews: number;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    resource: string;
    relativeTime: string;
    actor: string;
  }>;
};

type ContentSnapshot = {
  editable: boolean;
  source: 'database' | 'fallback';
  warning: string | null;
  articles: Array<{ id: string; title: string; slug: string; status: string }>;
  projects: Array<{ id: string; title: string; slug: string; status: string }>;
  certifications: Array<{ id: string; title: string; slug: string; status: string }>;
  books: Array<{ id: string; title: string; slug: string; status: string }>;
};

type OperatorBootstrap = {
  settings: AdminOperatorSettings;
  providers: OperatorProviderStatus[];
  publicAssistant: PublicAssistantSettings;
  dashboard: DashboardData;
  content: ContentSnapshot;
  suggestions: string[];
};

const INITIAL_MESSAGES: UIMessage[] = [
  {
    id: 'operator-welcome',
    role: 'assistant',
    parts: [
      {
        type: 'text',
        text:
          'Operator online. I can inspect live site state, search the content inventory, update existing content entries, and tune the public knowledge assistant. Use the right rail to choose the provider rail and guardrails, or issue a direct instruction here.',
      },
    ],
  },
];

const PROVIDER_TONES: Record<OperatorProviderId, string> = {
  google: 'bg-blue-500/10 text-blue-700 dark:text-blue-200',
  groq: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-200',
  openrouter: 'bg-violet-500/10 text-violet-700 dark:text-violet-200',
  sambanova: 'bg-orange-500/10 text-orange-700 dark:text-orange-200',
  cerebras: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-200',
  mistral: 'bg-amber-500/10 text-amber-700 dark:text-amber-200',
  minimax: 'bg-rose-500/10 text-rose-700 dark:text-rose-200',
  'ollama-cloud': 'bg-slate-500/10 text-slate-700 dark:text-slate-200',
  'opencode-zen': 'bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-200',
  openai: 'bg-teal-500/10 text-teal-700 dark:text-teal-200',
};

function ProviderGlyph({
  provider,
  className,
}: {
  provider: Pick<OperatorProviderStatus, 'id' | 'label'>;
  className?: string;
}) {
  const initials = provider.label
    .split(/\s+/)
    .map((token) => token[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      className={cn(
        'inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold tracking-[0.12em]',
        PROVIDER_TONES[provider.id],
        className
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

function OperatorToolPart({ part }: { part: any }) {
  const isDynamic = part.type === 'dynamic-tool';

  return (
    <Tool defaultOpen={part.state !== 'output-available'}>
      <ToolHeader
        type={part.type}
        state={part.state}
        toolName={isDynamic ? part.toolName : undefined}
      />
      <ToolContent>
        <ToolInput input={part.input} />
        <ToolOutput errorText={part.errorText} output={part.output} />
      </ToolContent>
    </Tool>
  );
}

function ProviderStatusBadge({ provider }: { provider: OperatorProviderStatus }) {
  return (
    <Badge variant={provider.configured ? 'secondary' : 'outline'}>
      {provider.configured ? 'Key present' : 'Missing key'}
    </Badge>
  );
}

export function AdminOperatorConsole() {
  const { toast } = useToast();
  const [bootstrap, setBootstrap] = useState<OperatorBootstrap | null>(null);
  const [draftSettings, setDraftSettings] = useState<AdminOperatorSettings | null>(null);
  const [draftPublicAssistant, setDraftPublicAssistant] = useState<PublicAssistantSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isProviderPickerOpen, setIsProviderPickerOpen] = useState(false);

  const {
    messages,
    sendMessage,
    status,
    stop,
    error,
  } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/admin/operator',
      credentials: 'same-origin',
    }),
    messages: INITIAL_MESSAGES,
  });

  const activeProvider = useMemo(() => {
    if (!bootstrap || !draftSettings) {
      return null;
    }

    return bootstrap.providers.find((provider) => provider.id === draftSettings.primaryProvider) ?? null;
  }, [bootstrap, draftSettings]);

  const configuredProviders = useMemo(
    () => bootstrap?.providers.filter((provider) => provider.configured) ?? [],
    [bootstrap]
  );

  async function loadOperatorControl(showToast = false) {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/operator', { cache: 'no-store' });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Failed to load operator control plane.');
      }

      const nextBootstrap: OperatorBootstrap = {
        settings: payload.settings,
        providers: payload.providers,
        publicAssistant: payload.publicAssistant,
        dashboard: payload.dashboard,
        content: payload.content,
        suggestions: payload.suggestions,
      };

      setBootstrap(nextBootstrap);
      setDraftSettings(nextBootstrap.settings);
      setDraftPublicAssistant(nextBootstrap.publicAssistant);

      if (showToast) {
        toast({
          title: 'Operator refreshed',
          description: 'Provider status, content inventory, and public assistant settings reloaded.',
        });
      }
    } catch (loadError) {
      toast({
        title: 'Operator unavailable',
        description:
          loadError instanceof Error ? loadError.message : 'Failed to load operator control plane.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadOperatorControl();
  }, []);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Operator error',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  async function saveSettings() {
    if (!draftSettings || !draftPublicAssistant) {
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/admin/operator', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: draftSettings,
          publicAssistant: draftPublicAssistant,
        }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Failed to save operator settings.');
      }

      setBootstrap((current) =>
        current
          ? {
              ...current,
              settings: payload.settings,
              providers: payload.providers,
              publicAssistant: payload.publicAssistant,
            }
          : current
      );
      setDraftSettings(payload.settings);
      setDraftPublicAssistant(payload.publicAssistant);

      toast({
        title: 'Operator settings saved',
        description: 'The provider rail and public assistant guardrails are now updated.',
      });
    } catch (saveError) {
      toast({
        title: 'Save failed',
        description:
          saveError instanceof Error ? saveError.message : 'Failed to save operator settings.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function submitPrompt(text: string) {
    const message = text.trim();
    if (!message) {
      return;
    }

    await sendMessage({ text: message });
  }

  if (isLoading || !bootstrap || !draftSettings || !draftPublicAssistant) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="flex items-center gap-3 rounded-full border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading operator control plane...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1 font-mono">
              <Sparkles className="h-3.5 w-3.5" />
              Operator
            </Badge>
            <Badge variant={bootstrap.content.editable ? 'secondary' : 'outline'}>
              {bootstrap.content.editable ? 'Write access online' : 'Fallback content mode'}
            </Badge>
            <Badge variant="outline">
              {configuredProviders.length} provider key{configuredProviders.length === 1 ? '' : 's'} detected
            </Badge>
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Architect Operator Console</h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Live site-control rail for content operations, provider routing, and public knowledge-assistant guardrails.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => void loadOperatorControl(true)} disabled={isLoading || isSaving}>
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            Refresh state
          </Button>
          <Button onClick={() => void saveSettings()} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save settings
          </Button>
        </div>
      </div>

      {bootstrap.content.warning ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          {bootstrap.content.warning}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]">
        <div className="space-y-6">
          <Card className="border-border/60">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Workflow className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Quick intents</CardTitle>
              </div>
              <CardDescription>
                Start with an operational prompt, then let the tool rail show what the system actually touched.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suggestions>
                {bootstrap.suggestions.map((suggestion) => (
                  <Suggestion
                    key={suggestion}
                    suggestion={suggestion}
                    onClick={(prompt) => {
                      void submitPrompt(prompt);
                    }}
                  />
                ))}
              </Suggestions>
            </CardContent>
          </Card>

          <Card className="flex min-h-[68vh] flex-col overflow-hidden border-border/60">
            <CardHeader className="border-b border-border/60 pb-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BrainCircuit className="h-4 w-4 text-primary" />
                    Live transcript
                  </CardTitle>
                  <CardDescription>
                    Streaming operator chat with tool execution traces and CMS actions.
                  </CardDescription>
                </div>
                {activeProvider ? (
                  <Badge variant="outline" className="font-mono">
                    Auto-failover rail
                  </Badge>
                ) : (
                  <Badge variant="destructive">No provider</Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-0">
              <Conversation className="min-h-0 flex-1">
                <ConversationContent className="gap-6 px-5 py-5">
                  {messages.length === 0 ? (
                    <ConversationEmptyState
                      title="Operator is idle"
                      description="Run a quick audit or issue a content update instruction."
                      icon={<Bot className="h-5 w-5" />}
                    />
                  ) : (
                    messages.map((message) => (
                      <Message key={message.id} from={message.role}>
                        <MessageContent className="w-full">
                          {message.parts.map((part, index) => {
                            if (part.type === 'text') {
                              return <MessageResponse key={`${message.id}-text-${index}`}>{part.text}</MessageResponse>;
                            }

                            if (part.type === 'reasoning' && draftSettings.showReasoning) {
                              return (
                                <Reasoning key={`${message.id}-reasoning-${index}`} defaultOpen={false}>
                                  <ReasoningTrigger />
                                  <ReasoningContent>{part.text}</ReasoningContent>
                                </Reasoning>
                              );
                            }

                            if (part.type === 'dynamic-tool' || part.type.startsWith('tool-')) {
                              return <OperatorToolPart key={`${message.id}-tool-${index}`} part={part} />;
                            }

                            if (part.type === 'step-start') {
                              return (
                                <div
                                  key={`${message.id}-step-${index}`}
                                  className="border-t border-dashed border-border/70 pt-3 text-[11px] uppercase tracking-[0.22em] text-muted-foreground"
                                >
                                  Tool step
                                </div>
                              );
                            }

                            return null;
                          })}
                        </MessageContent>
                      </Message>
                    ))
                  )}
                </ConversationContent>
                <ConversationScrollButton />
              </Conversation>

              <div className="border-t border-border/60 bg-muted/20 px-4 py-4">
                <PromptInputProvider>
                  <PromptInput
                    onSubmit={({ text }) => submitPrompt(text)}
                    className="rounded-2xl border border-border bg-background/80 p-2"
                  >
                    <PromptInputBody>
                      <PromptInputTextarea
                        placeholder="Tell Operator what to inspect, change, or optimize..."
                        disabled={!activeProvider || status === 'submitted' || status === 'streaming'}
                        className="border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
                      />
                    </PromptInputBody>
                    <PromptInputFooter>
                      <PromptInputTools>
                        <span className="px-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                          {activeProvider
                            ? `Primary ${activeProvider.label} + fallback`
                            : 'No provider ready'}
                        </span>
                      </PromptInputTools>
                      <PromptInputSubmit status={status} onStop={stop} disabled={!activeProvider} />
                    </PromptInputFooter>
                  </PromptInput>
                </PromptInputProvider>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Tabs defaultValue="settings">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="public">Public AI</TabsTrigger>
            </TabsList>

            <TabsContent value="settings">
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Settings2 className="h-4 w-4 text-primary" />
                    Provider rail
                  </CardTitle>
                  <CardDescription>
                    Choose the primary provider, adjust fallback behavior, and keep the operator on free-friendly rails. Execution automatically falls through to the next configured provider if the current rail rejects the request.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Primary provider</Label>
                    <ModelSelector open={isProviderPickerOpen} onOpenChange={setIsProviderPickerOpen}>
                      <ModelSelectorTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <span className="flex items-center gap-2">
                            {activeProvider ? (
                              <>
                                <ProviderGlyph provider={activeProvider} />
                                {activeProvider.label}
                              </>
                            ) : (
                              'Select provider'
                            )}
                          </span>
                          <Badge variant="outline">{activeProvider?.defaultModel ?? 'offline'}</Badge>
                        </Button>
                      </ModelSelectorTrigger>
                      <ModelSelectorContent>
                        <ModelSelectorInput placeholder="Search providers..." />
                        <ModelSelectorList>
                          <ModelSelectorEmpty>No provider found.</ModelSelectorEmpty>
                          <ModelSelectorGroup>
                            {bootstrap.providers.map((provider) => (
                              <ModelSelectorItem
                                key={provider.id}
                                value={provider.label}
                                onSelect={() => {
                                  setDraftSettings((current) =>
                                    current
                                      ? { ...current, primaryProvider: provider.id }
                                      : current
                                  );
                                  setIsProviderPickerOpen(false);
                                }}
                              >
                                <div className="flex w-full items-center gap-3">
                                  <ProviderGlyph provider={provider} />
                                  <div className="flex min-w-0 flex-1 items-center gap-2">
                                    <ModelSelectorName>{provider.label}</ModelSelectorName>
                                    {provider.recommended ? <Badge variant="secondary">recommended</Badge> : null}
                                    {provider.freeTierFriendly ? <Badge variant="outline">free-first</Badge> : null}
                                  </div>
                                  <ProviderStatusBadge provider={provider} />
                                </div>
                              </ModelSelectorItem>
                            ))}
                          </ModelSelectorGroup>
                        </ModelSelectorList>
                      </ModelSelectorContent>
                    </ModelSelector>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="primary-model-override">Primary model override</Label>
                    <Input
                      id="primary-model-override"
                      value={draftSettings.modelOverrides[draftSettings.primaryProvider] ?? ''}
                      placeholder={activeProvider?.defaultModel ?? 'model id'}
                      onChange={(event) =>
                        setDraftSettings((current) =>
                          current
                            ? {
                                ...current,
                                modelOverrides: {
                                  ...current.modelOverrides,
                                  [current.primaryProvider]: event.target.value,
                                },
                              }
                            : current
                        )
                      }
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="temperature">Temperature</Label>
                      <Input
                        id="temperature"
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={draftSettings.temperature}
                        onChange={(event) =>
                          setDraftSettings((current) =>
                            current
                              ? {
                                  ...current,
                                  temperature: Number(event.target.value),
                                }
                              : current
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tool-steps">Max tool steps</Label>
                      <Input
                        id="tool-steps"
                        type="number"
                        min="2"
                        max="10"
                        step="1"
                        value={draftSettings.maxToolSteps}
                        onChange={(event) =>
                          setDraftSettings((current) =>
                            current
                              ? {
                                  ...current,
                                  maxToolSteps: Number(event.target.value),
                                }
                              : current
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/70 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium">Free-tier only</p>
                        <p className="text-xs text-muted-foreground">
                          Filters the provider rail down to free-friendly defaults and avoids OpenAI unless you override it.
                        </p>
                      </div>
                      <Switch
                        checked={draftSettings.freeTierOnly}
                        onCheckedChange={(checked) =>
                          setDraftSettings((current) =>
                            current ? { ...current, freeTierOnly: checked } : current
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/70 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium">Reasoning panels</p>
                        <p className="text-xs text-muted-foreground">
                          Show reasoning parts when the selected provider emits them.
                        </p>
                      </div>
                      <Switch
                        checked={draftSettings.showReasoning}
                        onCheckedChange={(checked) =>
                          setDraftSettings((current) =>
                            current ? { ...current, showReasoning: checked } : current
                          )
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="status">
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    System snapshot
                  </CardTitle>
                  <CardDescription>
                    Live status for content, providers, and recent operator-relevant activity.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-border/70 p-3">
                      <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Articles</div>
                      <div className="mt-2 text-2xl font-semibold">{bootstrap.dashboard.stats.articles}</div>
                    </div>
                    <div className="rounded-2xl border border-border/70 p-3">
                      <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Projects</div>
                      <div className="mt-2 text-2xl font-semibold">{bootstrap.dashboard.stats.projects}</div>
                    </div>
                    <div className="rounded-2xl border border-border/70 p-3">
                      <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Contacts</div>
                      <div className="mt-2 text-2xl font-semibold">{bootstrap.dashboard.stats.contacts}</div>
                    </div>
                    <div className="rounded-2xl border border-border/70 p-3">
                      <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Views</div>
                      <div className="mt-2 text-2xl font-semibold">{bootstrap.dashboard.stats.pageViews}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Provider readiness</div>
                    {bootstrap.providers.map((provider) => (
                      <div
                        key={provider.id}
                        className="flex items-start justify-between gap-3 rounded-2xl border border-border/70 p-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <ProviderGlyph provider={provider} />
                            <p className="text-sm font-medium">{provider.label}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">{provider.description}</p>
                        </div>
                        <ProviderStatusBadge provider={provider} />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Recent activity</div>
                    {bootstrap.dashboard.recentActivity.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                        Activity will populate as the site is used and content is updated.
                      </div>
                    ) : (
                      bootstrap.dashboard.recentActivity.slice(0, 5).map((entry) => (
                        <div key={entry.id} className="rounded-2xl border border-border/70 p-3">
                          <p className="text-sm font-medium">
                            {entry.action} {entry.resource}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {entry.relativeTime} • {entry.actor}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="public">
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Public knowledge assistant
                  </CardTitle>
                  <CardDescription>
                    Zero-cost deterministic assistant for public, non-sensitive questions only.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl border border-border/70 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium">Enable public assistant</p>
                        <p className="text-xs text-muted-foreground">
                          Keeps the public chatbox live without using paid model tokens.
                        </p>
                      </div>
                      <Switch
                        checked={draftPublicAssistant.enabled}
                        onCheckedChange={(checked) =>
                          setDraftPublicAssistant((current) =>
                            current ? { ...current, enabled: checked } : current
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="questions-per-ip">Questions per IP / day</Label>
                    <Input
                      id="questions-per-ip"
                      type="number"
                      min="1"
                      max="100"
                      step="1"
                      value={draftPublicAssistant.maxQuestionsPerIp}
                      onChange={(event) =>
                        setDraftPublicAssistant((current) =>
                          current
                            ? {
                                ...current,
                                maxQuestionsPerIp: Number(event.target.value),
                              }
                            : current
                        )
                      }
                    />
                  </div>

                  <div className="rounded-2xl border border-border/70 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium">Strict topic mode</p>
                        <p className="text-xs text-muted-foreground">
                          Enforces a narrow portfolio-only answer surface and harder refusals.
                        </p>
                      </div>
                      <Switch
                        checked={draftPublicAssistant.strictTopicMode}
                        onCheckedChange={(checked) =>
                          setDraftPublicAssistant((current) =>
                            current ? { ...current, strictTopicMode: checked } : current
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="public-welcome">Welcome message</Label>
                    <Textarea
                      id="public-welcome"
                      value={draftPublicAssistant.welcomeMessage}
                      onChange={(event) =>
                        setDraftPublicAssistant((current) =>
                          current
                            ? { ...current, welcomeMessage: event.target.value }
                            : current
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="public-refusal">Refusal message</Label>
                    <Textarea
                      id="public-refusal"
                      value={draftPublicAssistant.refusalMessage}
                      onChange={(event) =>
                        setDraftPublicAssistant((current) =>
                          current
                            ? { ...current, refusalMessage: event.target.value }
                            : current
                        )
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
