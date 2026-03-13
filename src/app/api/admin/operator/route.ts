import { NextRequest } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import {
  convertToModelMessages,
  generateText,
  stepCountIs,
  streamText,
  tool,
  type UIMessage,
} from 'ai';
import { z } from 'zod/v3';
import { getSession } from '@/lib/auth';
import {
  createContentEditorItem,
  deleteContentEditorItem,
  getContentEditorItem,
  updateContentEditorItem,
} from '@/lib/admin-content';
import {
  getAdminOperatorSettings,
  getOperatorProviderModel,
  getOperatorProviderStatuses,
  getOrderedConfiguredProviders,
  getPublicAssistantSettings,
  OPERATOR_SUGGESTIONS,
  saveAdminOperatorSettings,
  savePublicAssistantSettings,
  type AdminOperatorSettings,
  type OperatorProviderStatus,
} from '@/lib/admin-operator';
import { ApiHandler } from '@/lib/api-response';
import { logActivity } from '@/lib/activity';
import { getAdminContentSnapshot, getAdminDashboardData } from '@/lib/content-service';
import {
  isInvalidJsonBodyError,
  readJsonBody,
  validateTrustedOrigin,
} from '@/lib/request';

export const maxDuration = 30;
const PROVIDER_VALIDATION_TTL_MS = 5 * 60 * 1000;
const providerValidationCache = new Map<
  string,
  {
    checkedAt: number;
    error: string | null;
    valid: boolean;
  }
>();

const providerIdSchema = z.enum([
  'google',
  'groq',
  'openrouter',
  'sambanova',
  'cerebras',
  'mistral',
  'minimax',
  'ollama-cloud',
  'opencode-zen',
  'openai',
]);

const toolContentTypeSchema = z.enum(['article', 'project', 'certification', 'book']);

const toolArticleFieldsSchema = z.object({
  title: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  excerpt: z.string().trim().min(1),
  category: z.string().trim().min(1),
  featured: z.boolean(),
  status: z.enum(['published', 'draft']),
  content: z.string().trim().min(1),
});

const toolProjectFieldsSchema = z.object({
  title: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  description: z.string().trim().min(1),
  longDescription: z.string().trim().optional(),
  category: z.string().trim().min(1),
  featured: z.boolean(),
  status: z.enum(['completed', 'in-progress', 'archived']),
  techStackText: z.string().trim().min(1),
});

const toolCertificationFieldsSchema = z.object({
  title: z.string().trim().min(1),
  issuer: z.string().trim().min(1),
  description: z.string().trim().optional(),
  credentialUrl: z.string().trim().optional(),
  featured: z.boolean(),
  skillsText: z.string().trim().optional(),
});

const toolBookFieldsSchema = z.object({
  title: z.string().trim().min(1),
  subtitle: z.string().trim().optional(),
  description: z.string().trim().min(1),
  amazonUrl: z.string().trim().optional(),
  publisher: z.string().trim().optional(),
  featured: z.boolean(),
});

const operatorSettingsSchema = z.object({
  primaryProvider: providerIdSchema.optional(),
  fallbackProviders: z.array(providerIdSchema).optional(),
  modelOverrides: z.record(z.string(), z.string()).optional(),
  maxToolSteps: z.number().min(2).max(10).optional(),
  temperature: z.number().min(0).max(1).optional(),
  freeTierOnly: z.boolean().optional(),
  showReasoning: z.boolean().optional(),
});

const publicAssistantSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  maxQuestionsPerIp: z.number().min(1).max(100).optional(),
  strictTopicMode: z.boolean().optional(),
  welcomeMessage: z.string().trim().min(1).optional(),
  refusalMessage: z.string().trim().min(1).optional(),
});

async function requireAdminSession() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return null;
  }

  return session;
}

function getProviderApiKey(provider: OperatorProviderStatus) {
  if (provider.id === 'google') {
    return process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
  }

  return process.env[provider.apiKeyEnv] || '';
}

function createLanguageModel(provider: OperatorProviderStatus, settings: AdminOperatorSettings) {
  const modelId = getOperatorProviderModel(settings, provider.id);

  if (!modelId) {
    return null;
  }

  const apiKey = getProviderApiKey(provider);
  if (!apiKey) {
    return null;
  }

  if (provider.id === 'google') {
    const google = createGoogleGenerativeAI({ apiKey });
    return google(modelId);
  }

  if (!provider.effectiveBaseURL) {
    return null;
  }

  const compatible = createOpenAICompatible({
    name: provider.id,
    apiKey,
    baseURL: provider.effectiveBaseURL,
    includeUsage: true,
  });

  return compatible(modelId);
}

async function validateOperationalProvider(
  provider: OperatorProviderStatus,
  settings: AdminOperatorSettings
) {
  const modelId = getOperatorProviderModel(settings, provider.id);
  const cacheKey = `${provider.id}:${modelId ?? 'unknown'}`;
  const cached = providerValidationCache.get(cacheKey);

  if (cached && Date.now() - cached.checkedAt < PROVIDER_VALIDATION_TTL_MS) {
    if (!cached.valid) {
      return {
        error: cached.error ?? 'Provider validation failed.',
        model: null,
        valid: false,
      };
    }

    return {
      error: null,
      model: createLanguageModel(provider, settings),
      valid: true,
    };
  }

  const model = createLanguageModel(provider, settings);
  if (!model) {
    const error = 'Provider configuration is incomplete.';
    providerValidationCache.set(cacheKey, {
      checkedAt: Date.now(),
      error,
      valid: false,
    });

    return { error, model: null, valid: false };
  }

  try {
    await generateText({
      model,
      prompt: 'ping',
      maxOutputTokens: 1,
      temperature: 0,
    });

    providerValidationCache.set(cacheKey, {
      checkedAt: Date.now(),
      error: null,
      valid: true,
    });

    return { error: null, model, valid: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Provider validation failed.';
    providerValidationCache.set(cacheKey, {
      checkedAt: Date.now(),
      error: message,
      valid: false,
    });

    return { error: message, model: null, valid: false };
  }
}

async function selectOperationalProvider(settings: AdminOperatorSettings) {
  const providers = getOrderedConfiguredProviders(settings);
  const failures: string[] = [];

  for (const provider of providers) {
    const validation = await validateOperationalProvider(provider, settings);
    if (!validation.valid || !validation.model) {
      failures.push(`${provider.label}: ${validation.error ?? 'validation failed'}`);
      continue;
    }

    return {
      failures,
      model: validation.model,
      provider,
    };
  }

  return {
    failures,
    model: null,
    provider: null,
  };
}

function buildToolSystemPrompt(provider: OperatorProviderStatus | undefined) {
  const activeRail = provider ? `${provider.label} (${provider.defaultModel})` : 'offline';

  return [
    'You are Operator, Douglas Mitchell’s privileged website control agent.',
    'You behave like a senior editorial systems operator: direct, precise, and action-oriented.',
    'The only trusted source of current site state is tool output. Use tools whenever the request depends on live state or requires a mutation.',
    'If the user requests a content change, inspect the item first when details are ambiguous, then apply the smallest correct update.',
    'Never claim a change happened unless the tool reported success.',
    'Current live control surface includes: dashboard/site snapshot, content inventory search, article/project/certification/book editing, and public assistant settings.',
    'If a request exceeds current tool coverage, state the limit plainly and recommend the closest supported action.',
    'Editorial Protocol: When drafting content, prioritize architectural precision, monospaced aesthetics in examples, and OKLCH-aware color descriptions if applicable. Ensure all slugs are kebab-case and SEO-optimized.',
    'SEO Protocol: For every article or project update, consider if the excerpt and title are optimized for clarity and high-signal search intent.',
    `Current provider rail: ${activeRail}.`,
  ].join(' ');
}

async function resolveContentMatches(query: string) {
  const snapshot = await getAdminContentSnapshot();
  const search = query.trim().toLowerCase();

  if (!search) {
    return [];
  }

  const collections = [
    ...snapshot.articles.map((item) => ({ ...item, type: 'article' as const })),
    ...snapshot.projects.map((item) => ({ ...item, type: 'project' as const })),
    ...snapshot.certifications.map((item) => ({ ...item, type: 'certification' as const })),
    ...snapshot.books.map((item) => ({ ...item, type: 'book' as const })),
  ];

  return collections
    .map((item) => {
      const haystack = `${item.title} ${item.slug}`.toLowerCase();
      let score = 0;
      if (haystack.includes(search)) score += 6;
      for (const token of search.split(/\s+/).filter(Boolean)) {
        if (haystack.includes(token)) score += 2;
      }

      return { item, score };
    })
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 8)
    .map(({ item }) => item);
}

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return ApiHandler.unauthorized();
  }

  try {
    const [settings, providers, publicAssistant, dashboard, content] = await Promise.all([
      getAdminOperatorSettings(),
      Promise.resolve(getOperatorProviderStatuses()),
      getPublicAssistantSettings(),
      getAdminDashboardData(),
      getAdminContentSnapshot(),
    ]);

    return ApiHandler.success({
      settings,
      providers,
      publicAssistant,
      dashboard,
      content,
      suggestions: OPERATOR_SUGGESTIONS,
    });
  } catch (error) {
    return ApiHandler.internalServerError('Failed to load operator control plane.', error);
  }
}

export async function PUT(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return ApiHandler.unauthorized();
  }

  const originCheck = validateTrustedOrigin(request);
  if (!originCheck.allowed) {
    return ApiHandler.forbidden(originCheck.reason);
  }

  try {
    const body = await readJsonBody<Record<string, unknown>>(request);
    const operatorPayload = operatorSettingsSchema.safeParse(body.settings ?? {});
    const publicPayload = publicAssistantSettingsSchema.safeParse(body.publicAssistant ?? {});

    if (!operatorPayload.success) {
      return ApiHandler.error('Invalid operator settings payload.', 400, operatorPayload.error.flatten());
    }

    if (!publicPayload.success) {
      return ApiHandler.error('Invalid public assistant settings payload.', 400, publicPayload.error.flatten());
    }

    const [settings, publicAssistant] = await Promise.all([
      saveAdminOperatorSettings(operatorPayload.data),
      savePublicAssistantSettings(publicPayload.data),
    ]);

    await logActivity({
      action: 'update',
      resource: 'admin-operator-settings',
      resourceId: session.userId,
      userId: session.userId,
      details: {
        operatorFields: Object.keys(operatorPayload.data),
        publicAssistantFields: Object.keys(publicPayload.data),
      },
    });

    return ApiHandler.success({
      settings,
      providers: getOperatorProviderStatuses(),
      publicAssistant,
    });
  } catch (error) {
    if (isInvalidJsonBodyError(error)) {
      return ApiHandler.error('Request body must be valid JSON.', 400);
    }

    return ApiHandler.internalServerError('Failed to save operator settings.', error);
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return ApiHandler.unauthorized();
  }

  const originCheck = validateTrustedOrigin(request);
  if (!originCheck.allowed) {
    return ApiHandler.forbidden(originCheck.reason);
  }

  try {
    const body = await readJsonBody<Record<string, unknown>>(request);

    // Diagnostic branch: test provider configuration
    if (typeof body.testProvider === 'string') {
      const providerId = providerIdSchema.parse(body.testProvider);
      const settings = await getAdminOperatorSettings();
      const status = getOperatorProviderStatuses().find((p) => p.id === providerId);

      if (!status) {
        return ApiHandler.error('Provider not found in catalog.');
      }

      const validation = await validateOperationalProvider(status, settings);
      return ApiHandler.success({
        valid: validation.valid,
        error: validation.error,
        model: validation.valid ? getOperatorProviderModel(settings, providerId) : null,
      });
    }

    const messages = Array.isArray(body.messages) ? (body.messages as UIMessage[]) : null;

    if (!messages || messages.length === 0) {
      return ApiHandler.error('Messages are required.');
    }

    const settings = await getAdminOperatorSettings();
    const selection = await selectOperationalProvider(settings);
    const activeProvider = selection.provider;

    if (!activeProvider) {
      return ApiHandler.error(
        selection.failures.length > 0
          ? `No working AI provider is available for the operator. ${selection.failures.join(' | ')}`
          : 'No configured AI provider is available for the operator. Add a supported provider key in the environment and reload the operator.',
        503
      );
    }

    const model = selection.model;
    if (!model) {
      return ApiHandler.error(
        'The selected provider could not be initialized with the current configuration.',
        503
      );
    }

    const result = streamText({
      model,
      system: buildToolSystemPrompt(activeProvider),
      temperature: settings.temperature,
      stopWhen: stepCountIs(settings.maxToolSteps),
      messages: await convertToModelMessages(messages),
      tools: {
        getSystemSnapshot: tool({
          description: 'Get the current admin dashboard, provider rail status, and content inventory snapshot.',
          inputSchema: z.object({}),
          execute: async () => {
            const [dashboard, content, publicAssistant] = await Promise.all([
              getAdminDashboardData(),
              getAdminContentSnapshot(),
              getPublicAssistantSettings(),
            ]);

            return {
              dashboard,
              content,
              operator: {
                fallbackProviders: settings.fallbackProviders,
                freeTierOnly: settings.freeTierOnly,
                maxToolSteps: settings.maxToolSteps,
                primaryProvider: settings.primaryProvider,
              },
              publicAssistant,
              providers: getOperatorProviderStatuses().map((provider) => ({
                id: provider.id,
                label: provider.label,
                configured: provider.configured,
                defaultModel: provider.defaultModel,
              })),
            };
          },
        }),
        findContentMatches: tool({
          description: 'Search the editable content inventory by title or slug when the user references an item informally.',
          inputSchema: z.object({
            query: z.string().min(1),
          }),
          execute: async ({ query }) => ({
            matches: await resolveContentMatches(query),
          }),
        }),
        inspectContentItem: tool({
          description: 'Load the full editor payload for a specific content item before updating it.',
          inputSchema: z.object({
            type: toolContentTypeSchema,
            id: z.string().min(1),
          }),
          execute: async ({ type, id }) => {
            const item = await getContentEditorItem(type, id);
            if (!item) {
              throw new Error('Content item not found.');
            }

            return item;
          },
        }),
        updateArticle: tool({
          description: 'Update an article entry. Use this for publishing, drafting, copy changes, slugs, excerpts, or body content.',
          inputSchema: toolArticleFieldsSchema.extend({
            id: z.string().min(1),
          }),
          execute: async ({ id, ...fields }) => {
            const item = await updateContentEditorItem({
              type: 'article',
              id,
              fields,
            });

            await logActivity({
              action: 'update',
              resource: 'article',
              resourceId: id,
              userId: session.userId,
              request,
              details: {
                via: 'operator',
                fields: Object.keys(fields),
              },
            });

            return item;
          },
        }),
        updateProject: tool({
          description: 'Update a project entry including description, long description, category, status, and tech stack.',
          inputSchema: toolProjectFieldsSchema.extend({
            id: z.string().min(1),
          }),
          execute: async ({ id, ...fields }) => {
            const item = await updateContentEditorItem({
              type: 'project',
              id,
              fields,
            });

            await logActivity({
              action: 'update',
              resource: 'project',
              resourceId: id,
              userId: session.userId,
              request,
              details: {
                via: 'operator',
                fields: Object.keys(fields),
              },
            });

            return item;
          },
        }),
        updateCertification: tool({
          description: 'Update a certification entry including issuer, description, credential URL, and skills.',
          inputSchema: toolCertificationFieldsSchema.extend({
            id: z.string().min(1),
          }),
          execute: async ({ id, ...fields }) => {
            const item = await updateContentEditorItem({
              type: 'certification',
              id,
              fields,
            });

            await logActivity({
              action: 'update',
              resource: 'certification',
              resourceId: id,
              userId: session.userId,
              request,
              details: {
                via: 'operator',
                fields: Object.keys(fields),
              },
            });

            return item;
          },
        }),
        updateBook: tool({
          description: 'Update the featured book entry including title, subtitle, description, publisher, and destination link.',
          inputSchema: toolBookFieldsSchema.extend({
            id: z.string().min(1),
          }),
          execute: async ({ id, ...fields }) => {
            const item = await updateContentEditorItem({
              type: 'book',
              id,
              fields,
            });

            await logActivity({
              action: 'update',
              resource: 'book',
              resourceId: id,
              userId: session.userId,
              request,
              details: {
                via: 'operator',
                fields: Object.keys(fields),
              },
            });

            return item;
          },
        }),
        updatePublicAssistant: tool({
          description: 'Adjust the public assistant guardrails, welcome copy, refusal copy, or per-IP question cap.',
          inputSchema: publicAssistantSettingsSchema,
          execute: async (input) => {
            const settings = await savePublicAssistantSettings(input);

            await logActivity({
              action: 'update',
              resource: 'public-assistant-settings',
              resourceId: session.userId,
              userId: session.userId,
              request,
              details: {
                via: 'operator',
                fields: Object.keys(input),
              },
            });

            return settings;
          },
        }),
        createArticle: tool({
          description: 'Create a new article. Requires title, slug, excerpt, category, status, and content.',
          inputSchema: toolArticleFieldsSchema,
          execute: async (fields) => {
            const item = await createContentEditorItem('article', fields);
            await logActivity({
              action: 'create',
              resource: 'article',
              resourceId: item?.id,
              userId: session.userId,
              request,
              details: { via: 'operator' },
            });
            return item;
          },
        }),
        createProject: tool({
          description: 'Create a new project. Requires title, slug, description, category, status, and techStackText.',
          inputSchema: toolProjectFieldsSchema,
          execute: async (fields) => {
            const item = await createContentEditorItem('project', fields);
            await logActivity({
              action: 'create',
              resource: 'project',
              resourceId: item?.id,
              userId: session.userId,
              request,
              details: { via: 'operator' },
            });
            return item;
          },
        }),
        deleteContent: tool({
          description: 'Delete a content item by type and ID. Use with extreme caution.',
          inputSchema: z.object({
            type: toolContentTypeSchema,
            id: z.string().min(1),
          }),
          execute: async ({ type, id }) => {
            const success = await deleteContentEditorItem(type, id);
            if (success) {
              await logActivity({
                action: 'delete',
                resource: type,
                resourceId: id,
                userId: session.userId,
                request,
              });
            }
            return { success };
          },
        }),
        proposeVisualArtifact: tool({
          description: 'Propose a rich visual artifact, UI component, or layout change. Use this to show Douglas Mitchell what a JIT edit would look like.',
          inputSchema: z.object({
            title: z.string().min(1),
            description: z.string().optional(),
            type: z.enum(['ui', 'code', 'diagram', 'layout']),
            content: z.string().min(1),
          }),
          execute: async (input) => {
            return {
              ...input,
              proprosalId: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
            };
          },
        }),
      },
      onFinish: async ({ finishReason, totalUsage }) => {
        await logActivity({
          action: 'operator-chat',
          resource: activeProvider.id,
          resourceId: session.userId,
          userId: session.userId,
          request,
          details: {
            finishReason,
            provider: activeProvider.label,
            model: getOperatorProviderModel(settings, activeProvider.id),
            inputTokens: totalUsage.inputTokens ?? null,
            outputTokens: totalUsage.outputTokens ?? null,
          },
        });
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    if (isInvalidJsonBodyError(error)) {
      return ApiHandler.error('Request body must be valid JSON.', 400);
    }

    return ApiHandler.error('Operator request failed because the control plane could not complete the request.', 500);
  }
}
