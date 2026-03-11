import { randomUUID } from 'crypto';
import { db } from '@/lib/db';

export type AdminAiModelStatus = 'stable' | 'preview' | 'alias';

export interface AdminAiModelCatalogEntry {
  id: string;
  label: string;
  status: AdminAiModelStatus;
  description: string;
  bestFor: string;
  inputPriceUsdPerMillion: number | null;
  outputPriceUsdPerMillion: number | null;
  inputPriceLongContextUsdPerMillion?: number | null;
  outputPriceLongContextUsdPerMillion?: number | null;
  longContextThresholdTokens?: number;
  supportsBudgetEstimate: boolean;
  note?: string;
}

export interface AdminAiSettings {
  selectedModel: string;
  customModel: string;
  monthlyBudgetUsd: number;
}

export interface AdminAiUsageEntry {
  id: string;
  timestamp: string;
  model: string;
  promptTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number | null;
  messagePreview: string;
}

export interface AdminAiUsageMonth {
  month: string;
  updatedAt: string;
  totals: {
    requests: number;
    promptTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
    requestsWithoutEstimate: number;
  };
  entries: AdminAiUsageEntry[];
}

export const CUSTOM_ADMIN_AI_MODEL_ID = 'custom';

export const ADMIN_AI_MODEL_CATALOG: AdminAiModelCatalogEntry[] = [
  {
    id: 'gemini-2.5-flash-lite',
    label: 'Gemini 2.5 Flash-Lite',
    status: 'stable',
    description: 'Fastest low-cost workhorse for high-volume admin assistance.',
    bestFor: 'Cheap drafting, summarization, classification, and routine admin chat.',
    inputPriceUsdPerMillion: 0.1,
    outputPriceUsdPerMillion: 0.4,
    supportsBudgetEstimate: true,
  },
  {
    id: 'gemini-2.5-flash',
    label: 'Gemini 2.5 Flash',
    status: 'stable',
    description: 'Balanced reasoning model with a 1M token context window.',
    bestFor: 'General admin use where cost still matters but quality must stay high.',
    inputPriceUsdPerMillion: 0.3,
    outputPriceUsdPerMillion: 2.5,
    supportsBudgetEstimate: true,
  },
  {
    id: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    status: 'stable',
    description: 'Highest quality 2.5-series reasoning model for hard coding and analysis.',
    bestFor: 'Complex reasoning, architecture, and long-context technical work.',
    inputPriceUsdPerMillion: 1.25,
    outputPriceUsdPerMillion: 10,
    inputPriceLongContextUsdPerMillion: 2.5,
    outputPriceLongContextUsdPerMillion: 15,
    longContextThresholdTokens: 200_000,
    supportsBudgetEstimate: true,
  },
  {
    id: 'gemini-3-flash-preview',
    label: 'Gemini 3 Flash Preview',
    status: 'preview',
    description: 'Latest 3-series Flash preview with stronger multimodal and agentic behavior.',
    bestFor: 'When you want newer Gemini 3 behavior at Flash pricing.',
    inputPriceUsdPerMillion: 0.5,
    outputPriceUsdPerMillion: 3,
    supportsBudgetEstimate: true,
    note: 'Preview model. Pricing and behavior may change.',
  },
  {
    id: 'gemini-3.1-flash-lite-preview',
    label: 'Gemini 3.1 Flash-Lite Preview',
    status: 'preview',
    description: 'Latest low-cost Gemini 3.1 preview tuned for agentic throughput.',
    bestFor: 'High-volume work where you still want Gemini 3-series features.',
    inputPriceUsdPerMillion: 0.25,
    outputPriceUsdPerMillion: 1.5,
    supportsBudgetEstimate: true,
    note: 'Preview model. Pricing and behavior may change.',
  },
  {
    id: 'gemini-3.1-pro-preview',
    label: 'Gemini 3.1 Pro Preview',
    status: 'preview',
    description: 'Top-end Gemini 3.1 reasoning model with advanced agentic capabilities.',
    bestFor: 'Hardest coding, reasoning, and multimodal tasks where quality dominates cost.',
    inputPriceUsdPerMillion: 2,
    outputPriceUsdPerMillion: 12,
    inputPriceLongContextUsdPerMillion: 4,
    outputPriceLongContextUsdPerMillion: 18,
    longContextThresholdTokens: 200_000,
    supportsBudgetEstimate: true,
    note: 'Preview model. There is no Gemini API free tier for this model.',
  },
  {
    id: 'gemini-flash-latest',
    label: 'Gemini Flash Latest Alias',
    status: 'alias',
    description: 'Hot-swaps to the latest release of the Flash model family.',
    bestFor: 'Trying the newest Flash release without changing code again.',
    inputPriceUsdPerMillion: null,
    outputPriceUsdPerMillion: null,
    supportsBudgetEstimate: false,
    note: 'Alias target can change with notice. Token tracking works, cost estimate does not.',
  },
];

const ADMIN_AI_SETTINGS_KEY = 'admin-ai-settings';
const DEFAULT_MONTHLY_BUDGET_USD = 25;
const MAX_USAGE_ENTRIES = 40;

export const DEFAULT_ADMIN_AI_SETTINGS: AdminAiSettings = {
  selectedModel: 'gemini-2.5-flash',
  customModel: '',
  monthlyBudgetUsd: DEFAULT_MONTHLY_BUDGET_USD,
};

function getUsageKey(month: string) {
  return `admin-ai-usage:${month}`;
}

function getCurrentMonthKey(date = new Date()) {
  return date.toISOString().slice(0, 7);
}

function clampBudget(value: unknown) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return DEFAULT_MONTHLY_BUDGET_USD;
  }

  return Math.round(numeric * 100) / 100;
}

export function getModelCatalogEntry(model: string) {
  return ADMIN_AI_MODEL_CATALOG.find((entry) => entry.id === model) || null;
}

export function isAdminAiCatalogModel(model: string) {
  return Boolean(getModelCatalogEntry(model));
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

async function getSiteConfigValue<T>(key: string, fallback: T): Promise<T> {
  const record = await db.siteConfig.findUnique({
    where: { key },
    select: { value: true },
  });

  return parseJson(record?.value, fallback);
}

async function setSiteConfigValue<T>(key: string, value: T): Promise<void> {
  await db.siteConfig.upsert({
    where: { key },
    create: {
      key,
      value: JSON.stringify(value),
    },
    update: {
      value: JSON.stringify(value),
    },
  });
}

export async function getAdminAiSettings(): Promise<AdminAiSettings> {
  const saved = await getSiteConfigValue<Partial<AdminAiSettings>>(ADMIN_AI_SETTINGS_KEY, {});
  const savedModel =
    typeof saved.selectedModel === 'string' && saved.selectedModel.trim()
      ? saved.selectedModel.trim()
      : DEFAULT_ADMIN_AI_SETTINGS.selectedModel;

  return {
    selectedModel:
      savedModel === CUSTOM_ADMIN_AI_MODEL_ID || isAdminAiCatalogModel(savedModel)
        ? savedModel
        : DEFAULT_ADMIN_AI_SETTINGS.selectedModel,
    customModel:
      typeof saved.customModel === 'string'
        ? saved.customModel.trim()
        : DEFAULT_ADMIN_AI_SETTINGS.customModel,
    monthlyBudgetUsd: clampBudget(saved.monthlyBudgetUsd),
  };
}

export async function saveAdminAiSettings(next: Partial<AdminAiSettings>) {
  const current = await getAdminAiSettings();
  const requestedModel =
    typeof next.selectedModel === 'string' && next.selectedModel.trim()
      ? next.selectedModel.trim()
      : current.selectedModel;
  const merged: AdminAiSettings = {
    selectedModel:
      requestedModel === CUSTOM_ADMIN_AI_MODEL_ID || isAdminAiCatalogModel(requestedModel)
        ? requestedModel
        : current.selectedModel,
    customModel:
      typeof next.customModel === 'string'
        ? next.customModel.trim()
        : current.customModel,
    monthlyBudgetUsd:
      next.monthlyBudgetUsd === undefined
        ? current.monthlyBudgetUsd
        : clampBudget(next.monthlyBudgetUsd),
  };

  await setSiteConfigValue(ADMIN_AI_SETTINGS_KEY, merged);
  return merged;
}

export function resolveAdminAiModel(settings: AdminAiSettings) {
  if (settings.selectedModel === CUSTOM_ADMIN_AI_MODEL_ID && settings.customModel) {
    return settings.customModel;
  }

  if (isAdminAiCatalogModel(settings.selectedModel)) {
    return settings.selectedModel;
  }

  return DEFAULT_ADMIN_AI_SETTINGS.selectedModel;
}

export function estimateAdminAiCost(
  model: string,
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
  }
) {
  if (!usageMetadata) {
    return null;
  }

  const pricing = getModelCatalogEntry(model);
  if (!pricing || !pricing.supportsBudgetEstimate || pricing.inputPriceUsdPerMillion === null || pricing.outputPriceUsdPerMillion === null) {
    return null;
  }

  const promptTokens = usageMetadata.promptTokenCount ?? 0;
  const outputTokens = usageMetadata.candidatesTokenCount ?? 0;
  const overLongContext =
    pricing.longContextThresholdTokens !== undefined &&
    promptTokens > pricing.longContextThresholdTokens;

  const inputRate =
    overLongContext && pricing.inputPriceLongContextUsdPerMillion !== undefined && pricing.inputPriceLongContextUsdPerMillion !== null
      ? pricing.inputPriceLongContextUsdPerMillion
      : pricing.inputPriceUsdPerMillion;
  const outputRate =
    overLongContext && pricing.outputPriceLongContextUsdPerMillion !== undefined && pricing.outputPriceLongContextUsdPerMillion !== null
      ? pricing.outputPriceLongContextUsdPerMillion
      : pricing.outputPriceUsdPerMillion;

  const estimated =
    (promptTokens / 1_000_000) * inputRate +
    (outputTokens / 1_000_000) * outputRate;

  return Math.round(estimated * 1_000_000) / 1_000_000;
}

export async function getAdminAiUsage(month = getCurrentMonthKey()) {
  const empty: AdminAiUsageMonth = {
    month,
    updatedAt: new Date(0).toISOString(),
    totals: {
      requests: 0,
      promptTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      estimatedCostUsd: 0,
      requestsWithoutEstimate: 0,
    },
    entries: [],
  };

  const usage = await getSiteConfigValue<AdminAiUsageMonth>(getUsageKey(month), empty);

  return {
    ...empty,
    ...usage,
    month,
    totals: {
      ...empty.totals,
      ...(usage?.totals || {}),
      estimatedCostUsd: Math.round(((usage?.totals?.estimatedCostUsd || 0) + Number.EPSILON) * 1_000_000) / 1_000_000,
    },
    entries: Array.isArray(usage?.entries) ? usage.entries.slice(0, MAX_USAGE_ENTRIES) : [],
  };
}

export async function recordAdminAiUsage(input: {
  model: string;
  message: string;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
  estimatedCostUsd: number | null;
}) {
  const month = getCurrentMonthKey();
  const current = await getAdminAiUsage(month);
  const promptTokens = input.usageMetadata?.promptTokenCount ?? 0;
  const outputTokens = input.usageMetadata?.candidatesTokenCount ?? 0;
  const totalTokens = input.usageMetadata?.totalTokenCount ?? promptTokens + outputTokens;

  const entry: AdminAiUsageEntry = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    model: input.model,
    promptTokens,
    outputTokens,
    totalTokens,
    estimatedCostUsd: input.estimatedCostUsd,
    messagePreview: input.message.trim().replace(/\s+/g, ' ').slice(0, 120),
  };

  const next: AdminAiUsageMonth = {
    month,
    updatedAt: new Date().toISOString(),
    totals: {
      requests: current.totals.requests + 1,
      promptTokens: current.totals.promptTokens + promptTokens,
      outputTokens: current.totals.outputTokens + outputTokens,
      totalTokens: current.totals.totalTokens + totalTokens,
      estimatedCostUsd:
        Math.round(
          ((current.totals.estimatedCostUsd || 0) + (input.estimatedCostUsd || 0) + Number.EPSILON) * 1_000_000
        ) / 1_000_000,
      requestsWithoutEstimate:
        current.totals.requestsWithoutEstimate + (input.estimatedCostUsd === null ? 1 : 0),
    },
    entries: [entry, ...current.entries].slice(0, MAX_USAGE_ENTRIES),
  };

  await setSiteConfigValue(getUsageKey(month), next);
  return next;
}

export function buildAdminAiBudgetSummary(settings: AdminAiSettings, usage: AdminAiUsageMonth) {
  const budget = settings.monthlyBudgetUsd;
  const used = usage.totals.estimatedCostUsd;
  const remaining = Math.max(0, budget - used);
  const percentUsed = budget > 0 ? Math.min(100, (used / budget) * 100) : 0;

  return {
    budgetUsd: budget,
    usedUsd: used,
    remainingUsd: remaining,
    percentUsed: Math.round(percentUsed * 100) / 100,
    overBudget: budget > 0 && used > budget,
    estimateCoverageComplete: usage.totals.requestsWithoutEstimate === 0,
  };
}
