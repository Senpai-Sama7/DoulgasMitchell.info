'use client';

import { type KeyboardEvent, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  Cpu,
  Gauge,
  RefreshCw,
  Save,
  Send,
  Sparkles,
  User,
  Wallet,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Message = {
  role: 'ai' | 'user';
  text: string;
};

type AdminAiModelStatus = 'stable' | 'preview' | 'alias';

type AdminAiModelCatalogEntry = {
  id: string;
  label: string;
  status: AdminAiModelStatus;
  description: string;
  bestFor: string;
  inputPriceUsdPerMillion: number | null;
  outputPriceUsdPerMillion: number | null;
  note?: string;
};

type AdminAiSettings = {
  selectedModel: string;
  customModel: string;
  monthlyBudgetUsd: number;
};

type AdminAiUsageEntry = {
  id: string;
  timestamp: string;
  model: string;
  totalTokens: number;
  estimatedCostUsd: number | null;
  messagePreview: string;
};

type AdminAiUsageMonth = {
  month: string;
  totals: {
    requests: number;
    totalTokens: number;
    estimatedCostUsd: number;
    requestsWithoutEstimate: number;
  };
  entries: AdminAiUsageEntry[];
};

type AdminAiBudgetSummary = {
  budgetUsd: number;
  usedUsd: number;
  remainingUsd: number;
  percentUsed: number;
  overBudget: boolean;
  estimateCoverageComplete: boolean;
};

const DEFAULT_SETTINGS: AdminAiSettings = {
  selectedModel: 'gemini-2.5-flash',
  customModel: '',
  monthlyBudgetUsd: 25,
};

const CUSTOM_MODEL_ID = 'custom';
const INITIAL_MESSAGE =
  'Hello, Douglas. I am your system architect AI. Adjust the model rail if you want the newest Gemini tier, then issue instructions here.';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 4,
});

function formatUsd(value: number) {
  return currencyFormatter.format(value);
}

function formatRelativeTimestamp(value: string) {
  const date = new Date(value);
  const deltaMs = Date.now() - date.getTime();
  const deltaMinutes = Math.max(1, Math.round(deltaMs / 60_000));

  if (deltaMinutes < 60) {
    return `${deltaMinutes}m ago`;
  }

  const deltaHours = Math.round(deltaMinutes / 60);
  if (deltaHours < 24) {
    return `${deltaHours}h ago`;
  }

  const deltaDays = Math.round(deltaHours / 24);
  return `${deltaDays}d ago`;
}

function getStatusVariant(status: AdminAiModelStatus) {
  switch (status) {
    case 'preview':
      return 'default';
    case 'alias':
      return 'outline';
    default:
      return 'secondary';
  }
}

function getModelLabel(modelCatalog: AdminAiModelCatalogEntry[], modelId: string) {
  return modelCatalog.find((entry) => entry.id === modelId)?.label || modelId;
}

function getModelEntry(modelCatalog: AdminAiModelCatalogEntry[], modelId: string) {
  return modelCatalog.find((entry) => entry.id === modelId) || null;
}

export function AdminAIAgent() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: INITIAL_MESSAGE },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<AdminAiSettings>(DEFAULT_SETTINGS);
  const [draftSettings, setDraftSettings] = useState<AdminAiSettings>(DEFAULT_SETTINGS);
  const [budgetInput, setBudgetInput] = useState(String(DEFAULT_SETTINGS.monthlyBudgetUsd));
  const [modelCatalog, setModelCatalog] = useState<AdminAiModelCatalogEntry[]>([]);
  const [activeModel, setActiveModel] = useState(DEFAULT_SETTINGS.selectedModel);
  const [usage, setUsage] = useState<AdminAiUsageMonth | null>(null);
  const [budget, setBudget] = useState<AdminAiBudgetSummary | null>(null);

  const parsedBudgetInput = useMemo(() => {
    const value = Number(budgetInput);
    if (!Number.isFinite(value) || value < 0) {
      return null;
    }

    return Math.round(value * 100) / 100;
  }, [budgetInput]);

  const activeModelEntry = useMemo(
    () => getModelEntry(modelCatalog, activeModel),
    [activeModel, modelCatalog]
  );
  const selectedModelEntry = useMemo(
    () => getModelEntry(modelCatalog, draftSettings.selectedModel),
    [draftSettings.selectedModel, modelCatalog]
  );

  const hasUnsavedChanges = useMemo(() => {
    return (
      settings.selectedModel !== draftSettings.selectedModel ||
      settings.customModel !== draftSettings.customModel ||
      parsedBudgetInput === null ||
      settings.monthlyBudgetUsd !== parsedBudgetInput
    );
  }, [draftSettings.customModel, draftSettings.selectedModel, parsedBudgetInput, settings]);

  async function loadConfiguration(showToast = false) {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/ai', { cache: 'no-store' });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Failed to load AI controls.');
      }

      setSettings(payload.settings);
      setDraftSettings(payload.settings);
      setBudgetInput(String(payload.settings.monthlyBudgetUsd));
      setModelCatalog(payload.modelCatalog || []);
      setActiveModel(payload.activeModel || payload.settings.selectedModel);
      setUsage(payload.usage || null);
      setBudget(payload.budget || null);

      if (showToast) {
        toast({
          title: 'AI control surface refreshed',
          description: 'Latest model catalog and budget data loaded.',
        });
      }
    } catch (error) {
      toast({
        title: 'AI controls unavailable',
        description:
          error instanceof Error ? error.message : 'Failed to load AI settings.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadConfiguration();
    // eslint-disable-next-line react-hooks/exhaustive-deps  --  intentionally mount-only
  }, []);

  async function saveConfiguration(showToast = true) {
    if (draftSettings.selectedModel === CUSTOM_MODEL_ID && !draftSettings.customModel.trim()) {
      toast({
        title: 'Custom model required',
        description: 'Enter a Gemini model ID before saving.',
        variant: 'destructive',
      });
      return false;
    }

    if (parsedBudgetInput === null) {
      toast({
        title: 'Invalid budget',
        description: 'Monthly budget must be a non-negative USD amount.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/admin/ai', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedModel: draftSettings.selectedModel,
          customModel: draftSettings.customModel.trim(),
          monthlyBudgetUsd: parsedBudgetInput,
        }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Failed to save AI settings.');
      }

      setSettings(payload.settings);
      setDraftSettings(payload.settings);
      setBudgetInput(String(payload.settings.monthlyBudgetUsd));
      setActiveModel(payload.activeModel || payload.settings.selectedModel);
      setBudget(payload.budget || null);

      if (showToast) {
        toast({
          title: 'AI settings saved',
          description: `Model routing updated to ${payload.activeModel}.`,
        });
      }

      return true;
    } catch (error) {
      toast({
        title: 'Save failed',
        description:
          error instanceof Error ? error.message : 'Could not update AI settings.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSend() {
    const userMessage = input.trim();
    if (!userMessage || isSending) {
      return;
    }

    if (hasUnsavedChanges) {
      const saved = await saveConfiguration(false);
      if (!saved) {
        return;
      }
    }

    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsSending(true);

    try {
      const response = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'AI failed to respond.');
      }

      setMessages((prev) => [...prev, { role: 'ai', text: payload.reply }]);
      setActiveModel(payload.activeModel || activeModel);
      setUsage(payload.usage || null);
      setBudget(payload.budget || null);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text:
            error instanceof Error
              ? `Error: ${error.message}`
              : 'Error: Connection to the Gemini backend failed.',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  }

  return (
    <Card className="relative flex h-[760px] flex-col overflow-hidden border-border/20 shadow-xl">
      <div className="pointer-events-none absolute inset-0 bg-grid-white/[0.02]" />
      <CardHeader className="border-b border-border/10 bg-muted/20 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm font-mono">
              <Sparkles className="h-4 w-4 text-primary" />
              SYSTEM ARCHITECT AI [LIVE]
            </CardTitle>
            <CardDescription className="mt-2 text-xs font-mono">
              Live Gemini routing, cost guardrails, and admin chat in one rail.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => void loadConfiguration(true)}
            disabled={isLoading || isSaving || isSending}
            aria-label="Refresh AI settings"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-border/50 bg-background/70 p-3">
            <div className="flex items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
              <span className="flex items-center gap-2">
                <Cpu className="h-3.5 w-3.5" />
                Active Model
              </span>
              {activeModelEntry ? (
                <Badge variant={getStatusVariant(activeModelEntry.status)}>
                  {activeModelEntry.status}
                </Badge>
              ) : (
                <Badge variant="outline">custom</Badge>
              )}
            </div>
            <p className="mt-3 text-sm font-semibold tracking-tight">
              {activeModelEntry?.label || activeModel}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {activeModelEntry?.description || 'Custom Gemini model ID currently active.'}
            </p>
          </div>

          <div className="rounded-xl border border-border/50 bg-background/70 p-3">
            <div className="flex items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
              <span className="flex items-center gap-2">
                <Wallet className="h-3.5 w-3.5" />
                Monthly Spend
              </span>
              <span>{usage?.totals.requests || 0} req</span>
            </div>
            <div className="mt-3 flex items-end justify-between gap-3">
              <div>
                <p className="text-lg font-semibold tracking-tight">
                  {formatUsd(budget?.usedUsd || 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  of {formatUsd(budget?.budgetUsd || parsedBudgetInput || DEFAULT_SETTINGS.monthlyBudgetUsd)}
                </p>
              </div>
              <p className="text-right text-xs text-muted-foreground">
                {budget?.overBudget
                  ? 'Budget ceiling exceeded'
                  : `${formatUsd(budget?.remainingUsd || 0)} remaining`}
              </p>
            </div>
            <Progress className="mt-3 h-2" value={budget?.percentUsed || 0} />
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-background/50 p-3">
          <div className="grid gap-3">
            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                Model Routing
              </label>
              <Select
                value={draftSettings.selectedModel}
                onValueChange={(value) =>
                  setDraftSettings((prev) => ({ ...prev, selectedModel: value }))
                }
              >
                <SelectTrigger className="bg-background/80 font-mono text-xs">
                  <SelectValue placeholder="Choose a Gemini model" />
                </SelectTrigger>
                <SelectContent>
                  {modelCatalog.map((entry) => (
                    <SelectItem key={entry.id} value={entry.id} className="font-mono text-xs">
                      {entry.label}
                    </SelectItem>
                  ))}
                  <SelectItem value={CUSTOM_MODEL_ID} className="font-mono text-xs">
                    Custom model ID
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {selectedModelEntry?.bestFor ||
                  'Use a custom model ID when Google releases a newer tier before the catalog is updated.'}
              </p>
            </div>

            {draftSettings.selectedModel === CUSTOM_MODEL_ID && (
              <div className="space-y-2">
                <label className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                  Custom Model ID
                </label>
                <Input
                  value={draftSettings.customModel}
                  onChange={(event) =>
                    setDraftSettings((prev) => ({
                      ...prev,
                      customModel: event.target.value,
                    }))
                  }
                  placeholder="gemini-3.1-pro-preview"
                  className="bg-background/80 font-mono text-xs"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                Monthly Budget (USD)
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={budgetInput}
                onChange={(event) => setBudgetInput(event.target.value)}
                className="bg-background/80 font-mono text-xs"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>
                  {budget?.estimateCoverageComplete
                    ? 'Cost estimates cover all tracked requests this month.'
                    : 'Some requests used alias or custom models, so total spend is a lower-bound estimate.'}
                </p>
                {(selectedModelEntry?.note || activeModelEntry?.note) && (
                  <p>{selectedModelEntry?.note || activeModelEntry?.note}</p>
                )}
              </div>
              <Button
                size="sm"
                variant={hasUnsavedChanges ? 'default' : 'outline'}
                onClick={() => void saveConfiguration(true)}
                disabled={isLoading || isSaving || isSending}
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-4">
        <div className="rounded-xl border border-border/50 bg-background/40 p-3">
          <div className="flex items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
            <span className="flex items-center gap-2">
              <Gauge className="h-3.5 w-3.5" />
              Budget Telemetry
            </span>
            <span>{usage?.month || 'Current month'}</span>
          </div>
          <div className="mt-3 space-y-2">
            {usage?.entries.length ? (
              usage.entries.slice(0, 3).map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-lg border border-border/40 bg-background/70 p-2"
                >
                  <div className="flex items-center justify-between gap-3 text-[11px] font-mono text-muted-foreground">
                    <span>{getModelLabel(modelCatalog, entry.model)}</span>
                    <span>
                      {entry.estimatedCostUsd === null
                        ? 'estimate n/a'
                        : formatUsd(entry.estimatedCostUsd)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs">{entry.messagePreview}</p>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{entry.totalTokens.toLocaleString()} tokens</span>
                    <span>{formatRelativeTimestamp(entry.timestamp)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-border/50 p-3 text-xs text-muted-foreground">
                First requests this month will populate estimated spend and token usage here.
              </div>
            )}
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'ai' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary/20 border border-primary/30">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}

              <div
                className={cn(
                  'max-w-[84%] rounded-lg p-3 text-sm',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border/50 bg-muted font-mono text-xs leading-relaxed text-foreground'
                )}
              >
                {message.text}
              </div>

              {message.role === 'user' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted border border-border/30">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}

          {isSending && (
            <div className="flex gap-3 justify-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary/20 border border-primary/30">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted p-3">
                <span
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/50"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/50"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary/50"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <div className="border-t border-border/10 bg-muted/20 p-4">
        <div className="space-y-3">
          {budget && !budget.estimateCoverageComplete && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500 dark:text-amber-300" />
              <span>
                Alias and custom models still track tokens, but spend estimates remain approximate until Google posts stable pricing.
              </span>
            </div>
          )}

          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder="Instruct the Architect..."
            className="min-h-[88px] bg-background font-mono text-xs"
            disabled={isSending || isLoading}
          />

          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
              Enter sends. Shift+Enter inserts a new line.
            </p>
            <Button
              onClick={() => void handleSend()}
              disabled={isSending || isLoading || !input.trim()}
            >
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
