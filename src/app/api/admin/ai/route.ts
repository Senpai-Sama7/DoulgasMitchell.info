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

  try {
    const body = await req.json();
    const selectedModel =
      typeof body.selectedModel === 'string' && body.selectedModel.trim()
        ? body.selectedModel.trim()
        : undefined;
    const customModel =
      typeof body.customModel === 'string'
        ? body.customModel.trim()
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
      monthlyBudgetUsd: body.monthlyBudgetUsd,
    });
    const usage = await getAdminAiUsage();

    return ApiHandler.success({
      settings,
      activeModel: resolveAdminAiModel(settings),
      budget: buildAdminAiBudgetSummary(settings, usage),
    });
  } catch (error) {
    return ApiHandler.internalServerError('Failed to save AI settings', error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdminSession();
    if (!session) {
      return ApiHandler.unauthorized();
    }

    const { message } = await req.json();
    if (!message) {
      return ApiHandler.error('Message is required');
    }

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return ApiHandler.success({
        reply: '[SYSTEM ERROR] Missing Google Gemini API key in environment.',
      });
    }

    const settings = await getAdminAiSettings();
    const activeModel = resolveAdminAiModel(settings);
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: activeModel,
      systemInstruction: 'You are the "Architect" AI for Douglas Mitchell\'s portfolio platform. Your purpose is to assist the administrator in managing content, analyzing site performance, and providing technical guidance. Maintain a precise, professional, and slightly futuristic tone. Responses should be formatted in clean markdown. Always assume you are speaking to the owner/architect, Douglas Mitchell.',
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
    console.error('AI Route Error:', error);
    return ApiHandler.error('[SYSTEM ERROR] Neural Net connection dropped.', 500);
  }
}
