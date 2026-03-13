import { GoogleGenerativeAI } from '@google/generative-ai';
import { getAdminAiSettings, resolveAdminAiModel } from '@/lib/admin-ai';

export interface ContentOptimizationResult {
  score: number;
  suggestions: string[];
  seoKeywords: string[];
  alternativeTitles: string[];
  crossLinkSuggestions: string[];
  probabilityOfLift: number;
  confidence: number;
  calibrationStatus: 'heuristic' | 'not-evaluated';
  decision: {
    action: 'ship' | 'revise' | 'defer';
    rationale: string;
  };
  experiments: string[];
  uncertainty: {
    epistemic: number;
    aleatoric: number;
  };
}

function clamp(value: unknown, fallback: number, min: number, max: number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, numeric));
}

function normalizeStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];
}

function normalizeAction(value: unknown): ContentOptimizationResult['decision']['action'] {
  if (value === 'ship' || value === 'revise' || value === 'defer') {
    return value;
  }

  return 'revise';
}

function normalizeOptimizationResult(raw: unknown): ContentOptimizationResult {
  const record = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const decision =
    record.decision && typeof record.decision === 'object'
      ? (record.decision as Record<string, unknown>)
      : {};
  const uncertainty =
    record.uncertainty && typeof record.uncertainty === 'object'
      ? (record.uncertainty as Record<string, unknown>)
      : {};
  const calibrationStatus =
    record.calibrationStatus === 'heuristic' ? 'heuristic' : 'not-evaluated';

  return {
    score: Math.round(clamp(record.score, 70, 0, 100)),
    suggestions: normalizeStringArray(record.suggestions),
    seoKeywords: normalizeStringArray(record.seoKeywords),
    alternativeTitles: normalizeStringArray(record.alternativeTitles),
    crossLinkSuggestions: normalizeStringArray(record.crossLinkSuggestions),
    probabilityOfLift: clamp(record.probabilityOfLift, 0.55, 0, 1),
    confidence: clamp(record.confidence, 0.58, 0, 1),
    calibrationStatus,
    decision: {
      action: normalizeAction(decision.action),
      rationale:
        typeof decision.rationale === 'string' && decision.rationale.trim().length > 0
          ? decision.rationale.trim()
          : 'Revise the draft before publishing because the optimizer does not yet have enough confidence to recommend an immediate ship decision.',
    },
    experiments: normalizeStringArray(record.experiments),
    uncertainty: {
      epistemic: clamp(uncertainty.epistemic, 0.35, 0, 1),
      aleatoric: clamp(uncertainty.aleatoric, 0.2, 0, 1),
    },
  };
}

export async function analyzeContent(
  content: string,
  type: 'Article' | 'Project' | 'Note'
): Promise<ContentOptimizationResult | null> {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const settings = await getAdminAiSettings();
  const activeModel = resolveAdminAiModel(settings);
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: activeModel,
    systemInstruction: `You are the "Architect" AI Content Optimizer. Analyze the provided ${type} draft for editorial clarity, SEO, engagement quality, and decision readiness.
Return valid JSON only using this schema:
{
  "score": number,
  "suggestions": string[],
  "seoKeywords": string[],
  "alternativeTitles": string[],
  "crossLinkSuggestions": string[],
  "probabilityOfLift": number,
  "confidence": number,
  "calibrationStatus": "heuristic" | "not-evaluated",
  "decision": {
    "action": "ship" | "revise" | "defer",
    "rationale": string
  },
  "experiments": string[],
  "uncertainty": {
    "epistemic": number,
    "aleatoric": number
  }
}
Rules:
- Probability and confidence must be on a 0..1 scale.
- If calibration has not been measured, use "not-evaluated".
- Prefer "revise" or "defer" over false certainty.
- Maintain an editorial-architectural perspective: precise, minimal, and high-impact.`,
  });

  try {
    const result = await model.generateContent(`Analyze this ${type} content:\n\n${content}`);
    const text = result.response.text();
    const cleaned = text.replace(/```json|```/g, '').trim();
    return normalizeOptimizationResult(JSON.parse(cleaned));
  } catch (error) {
    console.error('Content optimization failed:', error);
    return null;
  }
}
