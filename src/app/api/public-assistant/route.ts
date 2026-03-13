import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApiHandler } from '@/lib/api-response';
import { getPublicAssistantSettings } from '@/lib/admin-operator';
import { answerPublicQuestion } from '@/lib/public-assistant';
import { rateLimit } from '@/lib/rate-limit';
import {
  getClientIp,
  isInvalidJsonBodyError,
  readJsonBody,
  validateTrustedOrigin,
} from '@/lib/request';

const publicAssistantSchema = z.object({
  question: z.string().trim().min(1).max(500),
});

export async function POST(request: NextRequest) {
  try {
    const originCheck = validateTrustedOrigin(request);
    if (!originCheck.allowed) {
      return ApiHandler.forbidden(originCheck.reason);
    }

    const settings = await getPublicAssistantSettings();
    if (!settings.enabled) {
      return ApiHandler.forbidden('Public knowledge assistant is disabled.');
    }

    const payload = publicAssistantSchema.safeParse(await readJsonBody(request));
    if (!payload.success) {
      return ApiHandler.error('A valid question is required.', 400, payload.error.flatten());
    }

    const clientIp = getClientIp(request);
    const limit = await rateLimit(clientIp, {
      limit: settings.maxQuestionsPerIp,
      windowMs: 24 * 60 * 60 * 1000,
      prefix: 'public-assistant',
    });

    if (!limit.allowed) {
      return ApiHandler.error('Daily question limit reached for this IP.', 429, {
        remaining: limit.remaining,
        resetAt: limit.resetAt,
      });
    }

    const reply = await answerPublicQuestion(payload.data.question, {
      strictTopicMode: settings.strictTopicMode,
    });

    return ApiHandler.success({
      answer: reply.refusal ? settings.refusalMessage : reply.answer,
      citations: reply.citations,
      suggestions: reply.suggestions,
      refusal: reply.refusal,
      remaining: limit.remaining,
      resetAt: limit.resetAt,
    });
  } catch (error) {
    if (isInvalidJsonBodyError(error)) {
      return ApiHandler.error('Request body must be valid JSON.', 400);
    }

    return ApiHandler.internalServerError('Failed to answer public question.', error);
  }
}
