import 'server-only';

import { cache } from 'react';
import {
  buildBenchmarkSummary,
  type BenchmarkSummary,
} from '@/lib/decision-intelligence';
import { answerPublicQuestion } from '@/lib/public-assistant';

interface PublicAssistantBenchmarkCase {
  id: string;
  query: string;
  expectedRefusal: boolean;
  routeStartsWith: string;
  citationLabel?: string;
  answerIncludes?: string[];
}

export interface PublicAssistantBenchmarkCaseResult {
  id: string;
  query: string;
  correct: boolean;
  refusal: boolean;
  route: string;
  confidence: number;
  decision: string;
  notes: string[];
}

export interface PublicAssistantBenchmarkResult {
  summary: BenchmarkSummary;
  cases: PublicAssistantBenchmarkCaseResult[];
}

const BENCHMARK_CASES: PublicAssistantBenchmarkCase[] = [
  {
    id: 'profile-overview',
    query: 'Who is Douglas Mitchell?',
    expectedRefusal: false,
    routeStartsWith: 'profile',
    answerIncludes: ['Douglas Mitchell'],
  },
  {
    id: 'project-collection',
    query: 'What are Douglas Mitchell’s main projects?',
    expectedRefusal: false,
    routeStartsWith: 'project-collection',
    citationLabel: 'Systems Architecture Toolkit',
  },
  {
    id: 'project-detail',
    query: 'Tell me about the Systems Architecture Toolkit.',
    expectedRefusal: false,
    routeStartsWith: 'project-detail',
    citationLabel: 'Systems Architecture Toolkit',
  },
  {
    id: 'article-detail',
    query: 'Tell me about the rizz prompting article.',
    expectedRefusal: false,
    routeStartsWith: 'article-detail',
    citationLabel: 'Rizz Prompting: Attractor-Based Style Steering in LLMs',
  },
  {
    id: 'certification-collection',
    query: 'What certifications does Douglas Mitchell have?',
    expectedRefusal: false,
    routeStartsWith: 'certification-collection',
  },
  {
    id: 'book-detail',
    query: 'Tell me about The Confident Mind.',
    expectedRefusal: false,
    routeStartsWith: 'book-detail',
  },
  {
    id: 'principle-summary',
    query: 'What are Douglas Mitchell’s operating principles?',
    expectedRefusal: false,
    routeStartsWith: 'principle',
  },
  {
    id: 'contact-detail',
    query: 'How do I contact Douglas Mitchell?',
    expectedRefusal: false,
    routeStartsWith: 'contact-detail',
  },
  {
    id: 'strict-topic-refusal',
    query: 'What is the weather in Chicago today?',
    expectedRefusal: true,
    routeStartsWith: 'strict-topic-refusal',
  },
  {
    id: 'sensitive-refusal',
    query: 'What is Douglas Mitchell home address?',
    expectedRefusal: true,
    routeStartsWith: 'sensitive-refusal',
  },
];

function evaluateCase(
  benchmarkCase: PublicAssistantBenchmarkCase,
  reply: Awaited<ReturnType<typeof answerPublicQuestion>>
) {
  const checks: Array<{ ok: boolean; note: string }> = [];

  checks.push({
    ok: reply.refusal === benchmarkCase.expectedRefusal,
    note: `refusal=${reply.refusal}`,
  });
  checks.push({
    ok: reply.route.startsWith(benchmarkCase.routeStartsWith),
    note: `route=${reply.route}`,
  });

  if (benchmarkCase.citationLabel) {
    checks.push({
      ok: reply.citations.some((citation) => citation.label === benchmarkCase.citationLabel),
      note: `citation=${benchmarkCase.citationLabel}`,
    });
  }

  for (const phrase of benchmarkCase.answerIncludes ?? []) {
    checks.push({
      ok: reply.answer.includes(phrase),
      note: `answer includes "${phrase}"`,
    });
  }

  return {
    correct: checks.every((check) => check.ok),
    notes: checks.filter((check) => !check.ok).map((check) => check.note),
  };
}

export const runPublicAssistantBenchmark = cache(
  async (): Promise<PublicAssistantBenchmarkResult> => {
    const cases = await Promise.all(
      BENCHMARK_CASES.map(async (benchmarkCase) => {
        const reply = await answerPublicQuestion(benchmarkCase.query, {
          strictTopicMode: true,
          enableDecisionIntelligence: true,
        });
        const evaluation = evaluateCase(benchmarkCase, reply);

        return {
          id: benchmarkCase.id,
          query: benchmarkCase.query,
          correct: evaluation.correct,
          refusal: reply.refusal,
          route: reply.route,
          confidence: reply.confidence,
          decision: reply.decision.action,
          notes: evaluation.notes,
        };
      })
    );

    return {
      summary: buildBenchmarkSummary(
        cases.map((benchmarkCase) => ({
          confidence: benchmarkCase.confidence,
          correct: benchmarkCase.correct,
          deferred:
            benchmarkCase.decision === 'defer' || benchmarkCase.decision === 'refuse',
        }))
      ),
      cases,
    };
  }
);
