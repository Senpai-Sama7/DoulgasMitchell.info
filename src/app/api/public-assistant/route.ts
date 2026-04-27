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
import { incrementRequests, incrementErrors, incrementRateLimitHits, incrementAiRequests } from '@/app/api/metrics/route';
import { logger } from '@/lib/logger';

const publicAssistantSchema = z.object({
  question: z.string().trim().min(1).max(500),
});

// Circuit breaker — fail-fast when AI provider is consistently down
let consecutiveFailures = 0;
const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_RESET_MS = 60 * 1000;
let circuitOpenAt: number | null = null;

function isCircuitOpen(): boolean {
  if (circuitOpenAt !== null && Date.now() - circuitOpenAt > CIRCUIT_RESET_MS) {
    circuitOpenAt = null;
    consecutiveFailures = 0;
    return false;
  }
  return circuitOpenAt !== null;
}

function recordFailure() {
  consecutiveFailures++;
  if (consecutiveFailures >= CIRCUIT_BREAKER_THRESHOLD) {
    circuitOpenAt = Date.now();
    logger.warn('Public assistant circuit breaker opened', { consecutiveFailures });
  }
}

function recordSuccess() {
  consecutiveFailures = 0;
  circuitOpenAt = null;
}

// Timeout wrapper — aborts slow AI provider responses
async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number = 15_000
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('AI provider timeout after ' + timeoutMs + 'ms')), timeoutMs);
  });
  try {
    return await Promise.race([fn(), timeoutPromise]);
  } finally {
    clearTimeout(timer!);
  }
}

export async function POST(request: NextRequest) {
  incrementRequests();
  try {
    // Circuit breaker check
    if (isCircuitOpen()) {
      return ApiHandler.error(
        'Service temporarily unavailable. Please try again shortly.',
        503
      );
    }

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
      incrementRateLimitHits();
      return ApiHandler.error('Daily question limit reached for this IP.', 429, {
        remaining: limit.remaining,
        resetAt: limit.resetAt,
      });
    }

    incrementAiRequests();
    const reply = await withTimeout(() =>
      answerPublicQuestion(payload.data.question, {
        strictTopicMode: settings.strictTopicMode,
        enableDecisionIntelligence: settings.enableDecisionIntelligence,
        conditionalThreshold: settings.conditionalThreshold,
        deferThreshold: settings.deferThreshold,
      })
    );

    recordSuccess();
    return ApiHandler.success({
      answer: reply.refusal ? settings.refusalMessage : reply.answer,
      citations: reply.citations,
      suggestions: reply.suggestions,
      refusal: reply.refusal,
      route: reply.route,
      confidence: reply.confidence,
      confidenceLabel: reply.confidenceLabel,
      decision: reply.decision,
      uncertainty: reply.uncertainty,
      remaining: limit.remaining,
      resetAt: limit.resetAt,
    });
  } catch (error) {
    incrementErrors();
    recordFailure();
    if (isInvalidJsonBodyError(error)) {
      return ApiHandler.error('Request body must be valid JSON.', 400);
    }
    return ApiHandler.internalServerError('Failed to answer public question.', error);
  }
}
