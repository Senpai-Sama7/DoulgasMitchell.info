import { getSession } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ApiHandler } from '@/lib/api-response';
import {
  ADMIN_AI_MODEL_CATALOG,
  buildAdminAiBudgetSummary,
  CUSTOM_ADMIN_AI_MODEL_ID,
  estimateAdminAiCost,
  getAdminAiSettings,
  getAdminAiUsage,
  isAdminAiCatalogModel,
  recordAdminAiUsage,
  resolveAdminAiModel,
  saveAdminAiSettings,
} from '@/lib/admin-ai';
import {
  isInvalidJsonBodyError,
  readJsonBody,
  validateTrustedOrigin,
} from '@/lib/request';

async function requireAdminSession() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return null;
  }

  return session;
}

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return ApiHandler.unauthorized();
  }

  try {
    const settings = await getAdminAiSettings();
    const usage = await getAdminAiUsage();

    return ApiHandler.success({
      settings,
      activeModel: resolveAdminAiModel(settings),
      modelCatalog: ADMIN_AI_MODEL_CATALOG,
      usage,
      budget: buildAdminAiBudgetSummary(settings, usage),
    });
  } catch (error) {
    return ApiHandler.internalServerError('Failed to load AI settings', error);
  }
}

export async function PUT(req: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return ApiHandler.unauthorized();
  }

  const originCheck = validateTrustedOrigin(req);
  if (!originCheck.allowed) {
    return ApiHandler.forbidden(originCheck.reason);
  }

  try {
    const body = await readJsonBody<Record<string, unknown>>(req);
    const selectedModel =
      typeof body.selectedModel === 'string' && body.selectedModel.trim()
        ? body.selectedModel.trim()
        : undefined;
    const customModel =
      typeof body.customModel === 'string'
        ? body.customModel.trim()
        : undefined;
    const monthlyBudgetUsd =
      typeof body.monthlyBudgetUsd === 'number' && Number.isFinite(body.monthlyBudgetUsd)
        ? body.monthlyBudgetUsd
        : undefined;

    if (selectedModel && selectedModel !== CUSTOM_ADMIN_AI_MODEL_ID && !isAdminAiCatalogModel(selectedModel)) {
      return ApiHandler.error('Unsupported model selection.');
    }

    if (selectedModel === CUSTOM_ADMIN_AI_MODEL_ID && !customModel) {
      return ApiHandler.error('Custom model ID is required when using the custom model option.');
    }

    const settings = await saveAdminAiSettings({
      selectedModel,
      customModel,
      monthlyBudgetUsd,
    });
    const usage = await getAdminAiUsage();

    return ApiHandler.success({
      settings,
      activeModel: resolveAdminAiModel(settings),
      budget: buildAdminAiBudgetSummary(settings, usage),
    });
  } catch (error) {
    if (isInvalidJsonBodyError(error)) {
      return ApiHandler.error('Request body must be valid JSON.', 400);
    }

    return ApiHandler.internalServerError('Failed to save AI settings', error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return ApiHandler.unauthorized();
    }

    const originCheck = validateTrustedOrigin(req);
    if (!originCheck.allowed) {
      return ApiHandler.forbidden(originCheck.reason);
    }

    const { message } = await readJsonBody<{ message?: string }>(req);
    if (!message) {
      return ApiHandler.error('Message is required');
    }

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return ApiHandler.error(
        'Google Gemini is not configured. Add `GEMINI_API_KEY` or `GOOGLE_GEMINI_API_KEY` to enable admin chat.',
        503
      );
    }

    const settings = await getAdminAiSettings();
    const activeModel = resolveAdminAiModel(settings);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: activeModel,
      systemInstruction: 'You are the "Architect" AI for Douglas Mitchell\'s portfolio platform. Your purpose is to assist the administrator in managing content, analyzing site performance, and providing technical guidance. Maintain a precise, professional, and slightly futuristic tone. Responses should be formatted in clean markdown. Always assume you are speaking to the owner/architect, Douglas Mitchell. When the request involves forecasts, experiments, rankings, or uncertain outcomes, expose uncertainty explicitly, use probabilistic language, and recommend a decision tier instead of pretending certainty.',
    });

    const result = await model.generateContent(message);
    const response = await result.response;
    const reply = response.text();
    const estimatedCostUsd = estimateAdminAiCost(activeModel, response.usageMetadata);
    const usage = await recordAdminAiUsage({
      model: activeModel,
      message,
      usageMetadata: response.usageMetadata,
      estimatedCostUsd,
    });

    return ApiHandler.success({
      reply,
      activeModel,
      usageMetadata: response.usageMetadata,
      estimatedCostUsd,
      budget: buildAdminAiBudgetSummary(settings, usage),
      usage,
    });
  } catch (error: unknown) {
    if (isInvalidJsonBodyError(error)) {
      return ApiHandler.error('Request body must be valid JSON.', 400);
    }

    console.error('AI Route Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown AI provider failure.';
    if (/API key not valid|API_KEY_INVALID/i.test(message)) {
      return ApiHandler.error('Gemini API key is invalid. Update `GEMINI_API_KEY` or `GOOGLE_GEMINI_API_KEY` in the environment.', 502);
    }

    return ApiHandler.error('AI request failed because the provider did not return a usable response.', 502);
  }
}
