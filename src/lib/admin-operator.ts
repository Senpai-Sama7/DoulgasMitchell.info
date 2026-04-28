import 'server-only';

import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { hasTable } from '@/lib/db-introspection';

export type OperatorProviderId =
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

export interface OperatorProviderCatalogEntry {
  id: OperatorProviderId;
  label: string;
  mode: 'native' | 'openai-compatible';
  defaultModel: string;
  logo: string;
  description: string;
  recommended: boolean;
  apiKeyEnv: string;
  baseUrlEnv?: string;
  baseURL?: string;
  freeTierFriendly: boolean;
  modelPlaceholder: string;
}

export interface OperatorProviderStatus extends OperatorProviderCatalogEntry {
  configured: boolean;
  effectiveBaseURL: string | null;
}

export interface AdminOperatorSettings {
  primaryProvider: OperatorProviderId;
  fallbackProviders: OperatorProviderId[];
  modelOverrides: Partial<Record<OperatorProviderId, string>>;
  maxToolSteps: number;
  temperature: number;
  freeTierOnly: boolean;
  showReasoning: boolean;
}

export interface PublicAssistantSettings {
  enabled: boolean;
  maxQuestionsPerIp: number;
  strictTopicMode: boolean;
  enableDecisionIntelligence: boolean;
  conditionalThreshold: number;
  deferThreshold: number;
  welcomeMessage: string;
  refusalMessage: string;
}

const ADMIN_OPERATOR_SETTINGS_KEY = 'admin-operator-settings';
const PUBLIC_ASSISTANT_SETTINGS_KEY = 'public-assistant-settings';

export const ADMIN_OPERATOR_PROVIDER_CATALOG: OperatorProviderCatalogEntry[] = [
  {
    id: 'google',
    label: 'Google Gemini',
    mode: 'native',
    defaultModel: 'gemini-2.5-flash',
    logo: 'google',
    description: 'Best native tool-calling path when a Gemini key is healthy.',
    recommended: true,
    apiKeyEnv: 'GOOGLE_GEMINI_API_KEY',
    freeTierFriendly: true,
    modelPlaceholder: 'gemini-2.5-flash',
  },
  {
    id: 'groq',
    label: 'Groq',
    mode: 'openai-compatible',
    defaultModel: 'llama-3.3-70b-versatile',
    logo: 'groq',
    description: 'Fast OpenAI-compatible inference with tool-ready chat semantics.',
    recommended: true,
    apiKeyEnv: 'GROQ_API_KEY',
    baseURL: 'https://api.groq.com/openai/v1',
    freeTierFriendly: true,
    modelPlaceholder: 'llama-3.3-70b-versatile',
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    mode: 'openai-compatible',
    defaultModel: 'google/gemma-3-27b-it:free',
    logo: 'openrouter',
    description: 'Best flexible fallback when you want free-tier compatible routing.',
    recommended: true,
    apiKeyEnv: 'OPENROUTER_API_KEY',
    baseURL: 'https://openrouter.ai/api/v1',
    freeTierFriendly: true,
    modelPlaceholder: 'google/gemma-3-27b-it:free',
  },
  {
    id: 'sambanova',
    label: 'SambaNova',
    mode: 'openai-compatible',
    defaultModel: 'Meta-Llama-3.3-70B-Instruct',
    logo: 'openai',
    description: 'Compatible provider rail for large open-weight instruct models.',
    recommended: false,
    apiKeyEnv: 'SAMBANOVA_API_KEY',
    baseURL: 'https://api.sambanova.ai/v1',
    freeTierFriendly: true,
    modelPlaceholder: 'Meta-Llama-3.3-70B-Instruct',
  },
  {
    id: 'cerebras',
    label: 'Cerebras',
    mode: 'openai-compatible',
    defaultModel: 'gpt-oss-120b',
    logo: 'cerebras',
    description: 'High-throughput compatible provider for open models.',
    recommended: false,
    apiKeyEnv: 'CEREBRAS_API_KEY',
    baseURL: 'https://api.cerebras.ai/v1',
    freeTierFriendly: true,
    modelPlaceholder: 'gpt-oss-120b',
  },
  {
    id: 'mistral',
    label: 'Mistral',
    mode: 'openai-compatible',
    defaultModel: 'open-mistral-nemo',
    logo: 'mistral',
    description: 'Compact European model rail with tool-call semantics.',
    recommended: false,
    apiKeyEnv: 'MISTRAL_API_KEY',
    baseURL: 'https://api.mistral.ai/v1',
    freeTierFriendly: true,
    modelPlaceholder: 'open-mistral-nemo',
  },
  {
    id: 'minimax',
    label: 'MiniMax',
    mode: 'openai-compatible',
    defaultModel: 'MiniMax-M1',
    logo: 'openai',
    description: 'Compatible route for MiniMax if you want another fallback rail.',
    recommended: false,
    apiKeyEnv: 'MINIMAX_API_KEY',
    baseURL: 'https://api.minimax.chat/v1',
    freeTierFriendly: true,
    modelPlaceholder: 'MiniMax-M1',
  },
  {
    id: 'ollama-cloud',
    label: 'Ollama Cloud',
    mode: 'openai-compatible',
    defaultModel: 'qwen3:32b',
    logo: 'lmstudio',
    description: 'Configurable compatible endpoint for Ollama-hosted inference.',
    recommended: false,
    apiKeyEnv: 'OLLAMA_CLOUD_API_KEY',
    baseUrlEnv: 'OLLAMA_CLOUD_BASE_URL',
    freeTierFriendly: true,
    modelPlaceholder: 'qwen3:32b',
  },
  {
    id: 'opencode-zen',
    label: 'OpenCode Zen',
    mode: 'openai-compatible',
    defaultModel: 'kimi-k2-instruct',
    logo: 'opencode',
    description: 'Configurable compatible endpoint for your OpenCode Zen rail.',
    recommended: false,
    apiKeyEnv: 'OPENCODE_ZEN_API_KEY',
    baseUrlEnv: 'OPENCODE_ZEN_BASE_URL',
    freeTierFriendly: true,
    modelPlaceholder: 'kimi-k2-instruct',
  },
  {
    id: 'openai',
    label: 'OpenAI',
    mode: 'openai-compatible',
    defaultModel: 'gpt-4o-mini',
    logo: 'openai',
    description: 'Last-resort compatible fallback. Useful, but not the cost-first default.',
    recommended: false,
    apiKeyEnv: 'OPENAI_API_KEY',
    baseURL: 'https://api.openai.com/v1',
    freeTierFriendly: false,
    modelPlaceholder: 'gpt-4o-mini',
  },
];

export const DEFAULT_ADMIN_OPERATOR_SETTINGS: AdminOperatorSettings = {
  primaryProvider: 'google',
  fallbackProviders: ['cerebras', 'mistral', 'groq', 'openrouter'],
  modelOverrides: {},
  maxToolSteps: 6,
  temperature: 0.3,
  freeTierOnly: true,
  showReasoning: false,
};

export const DEFAULT_PUBLIC_ASSISTANT_SETTINGS: PublicAssistantSettings = {
  enabled: true,
  maxQuestionsPerIp: 20,
  strictTopicMode: true,
  enableDecisionIntelligence: true,
  conditionalThreshold: 0.58,
  deferThreshold: 0.38,
  welcomeMessage:
    'Ask about Douglas Mitchell’s public work, projects, writing, certifications, and operating philosophy.',
  refusalMessage:
    'I only answer public, non-sensitive questions about Douglas Mitchell’s published work, background, and portfolio.',
};

function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(numeric * 100) / 100));
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
  if (!(await hasTable('SiteConfig'))) {
    return fallback;
  }

  const record = await db.siteConfig.findUnique({
    where: { key },
    select: { value: true },
  });

  return parseJson(record?.value, fallback);
}

async function setSiteConfigValue<T>(key: string, value: T): Promise<void> {
  if (!(await hasTable('SiteConfig'))) {
    return;
  }

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

function normalizeProviderId(value: unknown): OperatorProviderId | null {
  if (typeof value !== 'string') {
    return null;
  }

  return ADMIN_OPERATOR_PROVIDER_CATALOG.find((provider) => provider.id === value)?.id ?? null;
}

function uniqueProviderList(value: unknown, fallback: OperatorProviderId[]) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const seen = new Set<OperatorProviderId>();
  const items: OperatorProviderId[] = [];

  for (const candidate of value) {
    const normalized = normalizeProviderId(candidate);
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      items.push(normalized);
    }
  }

  return items.length > 0 ? items : fallback;
}

function normalizeModelOverrides(
  value: unknown
): Partial<Record<OperatorProviderId, string>> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value).reduce<Partial<Record<OperatorProviderId, string>>>(
    (accumulator, [key, model]) => {
      const provider = normalizeProviderId(key);
      if (!provider || typeof model !== 'string' || !model.trim()) {
        return accumulator;
      }

      accumulator[provider] = model.trim();
      return accumulator;
    },
    {}
  );
}

export async function getAdminOperatorSettings(): Promise<AdminOperatorSettings> {
  const saved = await getSiteConfigValue<Partial<AdminOperatorSettings>>(ADMIN_OPERATOR_SETTINGS_KEY, {});
  const primaryProvider = normalizeProviderId(saved.primaryProvider) ?? DEFAULT_ADMIN_OPERATOR_SETTINGS.primaryProvider;
  const fallbackProviders = uniqueProviderList(
    saved.fallbackProviders,
    DEFAULT_ADMIN_OPERATOR_SETTINGS.fallbackProviders
  ).filter((provider) => provider !== primaryProvider);

  return {
    primaryProvider,
    fallbackProviders,
    modelOverrides: normalizeModelOverrides(saved.modelOverrides),
    maxToolSteps: clampNumber(saved.maxToolSteps, DEFAULT_ADMIN_OPERATOR_SETTINGS.maxToolSteps, 2, 10),
    temperature: clampNumber(saved.temperature, DEFAULT_ADMIN_OPERATOR_SETTINGS.temperature, 0, 1),
    freeTierOnly:
      typeof saved.freeTierOnly === 'boolean'
        ? saved.freeTierOnly
        : DEFAULT_ADMIN_OPERATOR_SETTINGS.freeTierOnly,
    showReasoning:
      typeof saved.showReasoning === 'boolean'
        ? saved.showReasoning
        : DEFAULT_ADMIN_OPERATOR_SETTINGS.showReasoning,
  };
}

export async function saveAdminOperatorSettings(
  next: Partial<AdminOperatorSettings>
): Promise<AdminOperatorSettings> {
  const current = await getAdminOperatorSettings();
  const primaryProvider = normalizeProviderId(next.primaryProvider) ?? current.primaryProvider;
  const fallbackProviders = uniqueProviderList(
    next.fallbackProviders,
    current.fallbackProviders
  ).filter((provider) => provider !== primaryProvider);

  const merged: AdminOperatorSettings = {
    primaryProvider,
    fallbackProviders,
    modelOverrides:
      next.modelOverrides === undefined
        ? current.modelOverrides
        : normalizeModelOverrides(next.modelOverrides),
    maxToolSteps:
      next.maxToolSteps === undefined
        ? current.maxToolSteps
        : clampNumber(next.maxToolSteps, current.maxToolSteps, 2, 10),
    temperature:
      next.temperature === undefined
        ? current.temperature
        : clampNumber(next.temperature, current.temperature, 0, 1),
    freeTierOnly:
      typeof next.freeTierOnly === 'boolean'
        ? next.freeTierOnly
        : current.freeTierOnly,
    showReasoning:
      typeof next.showReasoning === 'boolean'
        ? next.showReasoning
        : current.showReasoning,
  };

  await setSiteConfigValue(ADMIN_OPERATOR_SETTINGS_KEY, merged);
  return merged;
}

export async function getPublicAssistantSettings(): Promise<PublicAssistantSettings> {
  const saved = await getSiteConfigValue<Partial<PublicAssistantSettings>>(PUBLIC_ASSISTANT_SETTINGS_KEY, {});
  const conditionalThreshold = clampNumber(
    saved.conditionalThreshold,
    DEFAULT_PUBLIC_ASSISTANT_SETTINGS.conditionalThreshold,
    0.3,
    0.95
  );
  const deferThreshold = clampNumber(
    saved.deferThreshold,
    DEFAULT_PUBLIC_ASSISTANT_SETTINGS.deferThreshold,
    0.05,
    conditionalThreshold - 0.05
  );

  return {
    enabled:
      typeof saved.enabled === 'boolean'
        ? saved.enabled
        : DEFAULT_PUBLIC_ASSISTANT_SETTINGS.enabled,
    maxQuestionsPerIp: clampNumber(
      saved.maxQuestionsPerIp,
      DEFAULT_PUBLIC_ASSISTANT_SETTINGS.maxQuestionsPerIp,
      1,
      100
    ),
    strictTopicMode:
      typeof saved.strictTopicMode === 'boolean'
        ? saved.strictTopicMode
        : DEFAULT_PUBLIC_ASSISTANT_SETTINGS.strictTopicMode,
    enableDecisionIntelligence:
      typeof saved.enableDecisionIntelligence === 'boolean'
        ? saved.enableDecisionIntelligence
        : DEFAULT_PUBLIC_ASSISTANT_SETTINGS.enableDecisionIntelligence,
    conditionalThreshold,
    deferThreshold,
    welcomeMessage:
      typeof saved.welcomeMessage === 'string' && saved.welcomeMessage.trim()
        ? saved.welcomeMessage.trim()
        : DEFAULT_PUBLIC_ASSISTANT_SETTINGS.welcomeMessage,
    refusalMessage:
      typeof saved.refusalMessage === 'string' && saved.refusalMessage.trim()
        ? saved.refusalMessage.trim()
        : DEFAULT_PUBLIC_ASSISTANT_SETTINGS.refusalMessage,
  };
}

export async function savePublicAssistantSettings(
  next: Partial<PublicAssistantSettings>
): Promise<PublicAssistantSettings> {
  const current = await getPublicAssistantSettings();
  const conditionalThreshold =
    next.conditionalThreshold === undefined
      ? current.conditionalThreshold
      : clampNumber(next.conditionalThreshold, current.conditionalThreshold, 0.3, 0.95);
  const deferThreshold =
    next.deferThreshold === undefined
      ? current.deferThreshold
      : clampNumber(next.deferThreshold, current.deferThreshold, 0.05, conditionalThreshold - 0.05);

  const merged: PublicAssistantSettings = {
    enabled:
      typeof next.enabled === 'boolean'
        ? next.enabled
        : current.enabled,
    maxQuestionsPerIp:
      next.maxQuestionsPerIp === undefined
        ? current.maxQuestionsPerIp
        : clampNumber(next.maxQuestionsPerIp, current.maxQuestionsPerIp, 1, 100),
    strictTopicMode:
      typeof next.strictTopicMode === 'boolean'
        ? next.strictTopicMode
        : current.strictTopicMode,
    enableDecisionIntelligence:
      typeof next.enableDecisionIntelligence === 'boolean'
        ? next.enableDecisionIntelligence
        : current.enableDecisionIntelligence,
    conditionalThreshold,
    deferThreshold,
    welcomeMessage:
      typeof next.welcomeMessage === 'string' && next.welcomeMessage.trim()
        ? next.welcomeMessage.trim()
        : current.welcomeMessage,
    refusalMessage:
      typeof next.refusalMessage === 'string' && next.refusalMessage.trim()
        ? next.refusalMessage.trim()
        : current.refusalMessage,
  };

  await setSiteConfigValue(PUBLIC_ASSISTANT_SETTINGS_KEY, merged);
  return merged;
}

export function getOperatorProviderCatalogEntry(id: OperatorProviderId) {
  return ADMIN_OPERATOR_PROVIDER_CATALOG.find((provider) => provider.id === id) ?? null;
}

export function getOperatorProviderModel(
  settings: AdminOperatorSettings,
  providerId: OperatorProviderId
) {
  const provider = getOperatorProviderCatalogEntry(providerId);
  if (!provider) {
    return null;
  }

  return settings.modelOverrides[providerId]?.trim() || provider.defaultModel;
}

export function getOperatorProviderStatuses(): OperatorProviderStatus[] {
  return ADMIN_OPERATOR_PROVIDER_CATALOG.map((provider) => {
    const apiKey =
      provider.id === 'google'
        ? env.GOOGLE_GEMINI_API_KEY || env.GEMINI_API_KEY
        : process.env[provider.apiKeyEnv];
    const effectiveBaseURL: string | null =
      provider.baseUrlEnv && process.env[provider.baseUrlEnv]
        ? (process.env[provider.baseUrlEnv] ?? null)
        : (provider.baseURL ?? null);

    return {
      ...provider,
      configured: Boolean(apiKey && (provider.mode === 'native' || effectiveBaseURL)),
      effectiveBaseURL,
    };
  });
}

export function getOrderedConfiguredProviders(settings: AdminOperatorSettings) {
  const statuses = getOperatorProviderStatuses();
  const preferredOrder = [settings.primaryProvider, ...settings.fallbackProviders];
  const order = [
    ...preferredOrder,
    ...statuses
      .map((provider) => provider.id)
      .filter((providerId) => !preferredOrder.includes(providerId)),
  ];

  return order
    .map((providerId) => statuses.find((entry) => entry.id === providerId))
    .filter((entry): entry is OperatorProviderStatus => Boolean(entry))
    .filter((entry) => entry.configured)
    .filter((entry) => !settings.freeTierOnly || entry.freeTierFriendly);
}

export const OPERATOR_SUGGESTIONS = [
  'Audit the homepage and tell me the three highest-impact improvements.',
  'List every published article and identify which one should be refreshed next.',
  'Open the featured project inventory and propose better category positioning.',
  'Update the book description so it sounds sharper and more premium.',
  'Summarize the current site state, risks, and top next actions.',
];
