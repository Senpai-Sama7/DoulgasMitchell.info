import 'server-only';

import { getSearchableContent } from '@/lib/content-service';
import {
  buildConfidenceSummary,
  buildDecisionRecommendation,
  type DecisionRecommendation,
} from '@/lib/decision-intelligence';
import { PUBLIC_CONTACT_HREF, PUBLIC_CONTACT_VALUE } from '@/lib/public-contact-config';
import {
  bookShowcase,
  certificationShowcase,
  heroMetrics,
  operatingPrinciples,
  siteProfile,
  socialLinks,
} from '@/lib/site-content';

export interface PublicAssistantCitation {
  label: string;
  href?: string;
}

export interface PublicAssistantUncertainty {
  epistemic: number;
  aleatoric: number;
  semanticEntropy: number;
  calibrationStatus: 'heuristic' | 'benchmarking' | 'not-evaluated';
  drivers: string[];
  missingInformation: string[];
}

export interface PublicAssistantReply {
  answer: string;
  citations: PublicAssistantCitation[];
  suggestions: string[];
  refusal: boolean;
  route: string;
  confidence: number;
  confidenceLabel: 'high' | 'moderate' | 'low';
  decision: DecisionRecommendation;
  uncertainty: PublicAssistantUncertainty;
}

interface PublicAssistantOptions {
  strictTopicMode?: boolean;
  enableDecisionIntelligence?: boolean;
  conditionalThreshold?: number;
  deferThreshold?: number;
}

interface KnowledgeEntry {
  id: string;
  kind:
    | 'profile'
    | 'principle'
    | 'metric'
    | 'project'
    | 'article'
    | 'book'
    | 'certification'
    | 'contact';
  title: string;
  summary: string;
  detail: string;
  keywords: string[];
  href?: string;
}

interface AnswerDraft {
  answer: string;
  citations: PublicAssistantCitation[];
  suggestions: string[];
  route: string;
  missingInformation: string[];
  aleatoricBase: number;
  drivers: string[];
}

type KnowledgeKind = KnowledgeEntry['kind'];

const DEFAULT_SUGGESTIONS = [
  'What kind of work does Douglas Mitchell do?',
  "What are Douglas Mitchell's main projects?",
  'Tell me about The Confident Mind.',
  'What certifications does Douglas Mitchell have?',
];

const GREETING_PATTERNS = [
  /^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|howdy)\s*$/i,
  /^(hi|hello|hey)\s*(douglas|dougie|there|ya|you)\s*$/i,
  /^(how\s*are\s*(you|u)|how\s*is\s*it\s*going)\s*\??$/i,
];

function isGreeting(question: string): boolean {
  return GREETING_PATTERNS.some((p) => p.test(question));
}

const GREETING_REPLY = [
  "Hi — I'm Douglas Mitchell's public knowledge assistant.",
  "I can tell you about his background, projects, certifications, book, and operating principles.",
  'What would you like to know?',
].join(' ');

const SENSITIVE_PATTERNS = [
  /\b(address|home address|street)\b/i,
  /\b(phone|cell|mobile|number)\b/i,
  /\bpersonal email|private email|email address\b/i,
  /\bpassword|passkey|credential|token|secret|api key\b/i,
  /\badmin|dashboard|session|login\b/i,
  /\bfamily|wife|girlfriend|children|kids|parents\b/i,
  /\bsalary|income|net worth|bank|account\b/i,
  /\bpolitics|religion|medical|health\b/i,
];

const PROMPT_INJECTION_PATTERNS = [
  /ignore (all )?(previous|prior|above) (instructions?|rules?|constraints?)/i,
  /disregard (your )?(previous|prior|above) (instructions?|rules?|system)/i,
  /forget (everything|all) (you|your) (were|have been) (told|taught|learned)/i,
  /new (instructions?|rules?|system prompt)/i,
  /override (your )?(safety|security|guidelines)/i,
  /you (are|will now act as|are now) (a|an) (different|new)/i,
  /roleplay (as|that you are)/i,
  /pretend (you are|to be)/i,
  /act as if you (are|have no)/i,
  /disable (your |the )?(safety|filter|restrictions)/i,
  /system.*:.*$/m,
  /assistant.*:/i,
  /\[SYSTEM\]/i,
  /\{\{.*\}\}/,
  /<\|.*\|>/,
];

function containsPromptInjection(input: string): boolean {
  return PROMPT_INJECTION_PATTERNS.some(pattern => pattern.test(input));
}

const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'about',
  'do',
  'does',
  'for',
  'here',
  'i',
  'in',
  'is',
  'me',
  'of',
  'on',
  'site',
  'tell',
  'that',
  'the',
  'this',
  'to',
  'what',
]);

const KIND_SYNONYMS: Record<KnowledgeKind, string[]> = {
  article: ['article', 'articles', 'essay', 'essays', 'post', 'posts', 'writing'],
  book: ['book', 'confident mind'],
  certification: ['badge', 'badges', 'certification', 'certifications', 'credential', 'credentials'],
  contact: ['connect', 'contact', 'email', 'hire', 'reach'],
  metric: ['metric', 'metrics', 'number', 'numbers', 'stats'],
  principle: ['approach', 'philosophy', 'principle', 'principles'],
  profile: ['about', 'background', 'bio', 'douglas', 'mitchell', 'who'],
  project: ['case study', 'case studies', 'project', 'projects'],
};

const COLLECTION_PROMPTS: Partial<Record<KnowledgeKind, RegExp>> = {
  article: /\b(all|articles|essays|list|published|writing)\b/i,
  certification: /\b(all|badges|certifications|credentials|featured|list)\b/i,
  project: /\b(all|featured|list|main|projects|standout)\b/i,
};

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeToken(value: string) {
  const token = normalizeText(value);
  if (token.endsWith('ies') && token.length > 4) {
    return `${token.slice(0, -3)}y`;
  }

  if (token.endsWith('s') && token.length > 4 && !token.endsWith('ss')) {
    return token.slice(0, -1);
  }

  return token;
}

function tokenize(value: string) {
  return normalizeText(value)
    .split(' ')
    .map((token) => normalizeToken(token.trim()))
    .filter((token) => token.length > 2 || token === 'ai' || token === 'ui' || token === 'ux')
    .filter((token) => !STOPWORDS.has(token));
}

function uniqueSuggestions(items: string[]) {
  return Array.from(new Set(items)).slice(0, 4);
}

function clampThreshold(value: number, fallback: number, min: number, max: number) {
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

function normalizeThresholds(options: PublicAssistantOptions) {
  const conditionalThreshold = clampThreshold(options.conditionalThreshold ?? 0.58, 0.58, 0.3, 0.95);
  const deferThreshold = clampThreshold(options.deferThreshold ?? 0.38, 0.38, 0.05, conditionalThreshold - 0.05);

  return {
    conditionalThreshold,
    deferThreshold,
  };
}

function buildStaticKnowledge(): KnowledgeEntry[] {
  const profileEntry: KnowledgeEntry = {
    id: 'profile',
    kind: 'profile',
    title: siteProfile.name,
    summary: siteProfile.headline,
    detail: `${siteProfile.summary} Douglas Mitchell is based in ${siteProfile.location}.`,
    keywords: [
      'douglas',
      'mitchell',
      'who',
      'about',
      'background',
      'location',
      'houston',
      'analyst',
      'author',
      'ai',
    ],
  };

  const principleEntries = operatingPrinciples.map<KnowledgeEntry>((principle) => ({
    id: `principle-${principle.title}`,
    kind: 'principle',
    title: principle.title,
    summary: principle.description,
    detail: principle.description,
    keywords: tokenize(
      `${principle.title} ${principle.description} philosophy principles operating philosophy`
    ),
  }));

  const metricEntries = heroMetrics.map<KnowledgeEntry>((metric) => ({
    id: `metric-${metric.label}`,
    kind: 'metric',
    title: metric.label,
    summary: metric.detail,
    detail: `${metric.label}: ${metric.value}. ${metric.detail}`,
    keywords: tokenize(`${metric.label} ${metric.value} ${metric.detail}`),
  }));

  const certificationEntries = certificationShowcase.map<KnowledgeEntry>((certification) => ({
    id: certification.id,
    kind: 'certification',
    title: certification.title,
    summary: `${certification.issuer} certification issued ${certification.issueDate}.`,
    detail: `${certification.title} from ${certification.issuer}. ${certification.description}`,
    keywords: tokenize(
      `${certification.title} ${certification.issuer} ${certification.description} ${certification.skills.join(' ')}`
    ),
    href: certification.credentialUrl,
  }));

  const bookEntry: KnowledgeEntry = {
    id: 'book',
    kind: 'book',
    title: bookShowcase.title,
    summary: bookShowcase.subtitle,
    detail: `${bookShowcase.description} Publisher: ${bookShowcase.publisher ?? 'independent release'}.`,
    keywords: tokenize(
      `${bookShowcase.title} ${bookShowcase.subtitle} ${bookShowcase.description} book confident mind`
    ),
    href: bookShowcase.amazonUrl,
  };

  const contactEntry: KnowledgeEntry = {
    id: 'contact',
    kind: 'contact',
    title: 'Contact',
    summary: PUBLIC_CONTACT_VALUE,
    detail: 'Douglas Mitchell keeps direct contact private. Use the secure contact form on the site instead.',
    keywords: ['contact', 'reach', 'email', 'message', 'hire', 'connect'],
    href: PUBLIC_CONTACT_HREF,
  };

  return [
    profileEntry,
    bookEntry,
    contactEntry,
    ...principleEntries,
    ...metricEntries,
    ...certificationEntries,
  ];
}

async function buildDynamicKnowledge() {
  const searchable = await getSearchableContent();

  const projectEntries = searchable.projects.map<KnowledgeEntry>((project) => ({
    id: `project-${project.slug}`,
    kind: 'project',
    title: project.title,
    summary: project.description,
    detail: `${project.title} is a ${project.category} project with status ${project.status}. Tech stack: ${project.techStack.join(', ')}. ${project.description}`,
    keywords: tokenize(
      `${project.title} ${project.description} ${project.category} ${project.status} ${project.techStack.join(' ')}`
    ),
    href: `/work/${project.slug}`,
  }));

  const articleEntries = searchable.articles.map<KnowledgeEntry>((article) => ({
    id: `article-${article.slug}`,
    kind: 'article',
    title: article.title,
    summary: article.excerpt,
    detail: `${article.title} is a ${article.category} article. ${article.excerpt} Tags: ${article.tags.join(', ')}.`,
    keywords: tokenize(
      `${article.title} ${article.excerpt} ${article.category} ${article.tags.join(' ')}`
    ),
    href: `/writing/${article.slug}`,
  }));

  return [...projectEntries, ...articleEntries];
}

function isSensitiveQuestion(query: string) {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(query));
}

function detectRequestedKinds(question: string, queryTokens: string[]) {
  const normalizedQuestion = normalizeText(question);
  const requested = new Set<KnowledgeKind>();

  for (const [kind, synonyms] of Object.entries(KIND_SYNONYMS) as Array<
    [KnowledgeKind, string[]]
  >) {
    if (
      synonyms.some((synonym) => normalizedQuestion.includes(normalizeText(synonym))) ||
      synonyms.some((synonym) => queryTokens.includes(normalizeToken(synonym)))
    ) {
      requested.add(kind);
    }
  }

  return requested;
}

function wantsCollectionAnswer(question: string, kind: KnowledgeKind) {
  const matcher = COLLECTION_PROMPTS[kind];
  return matcher ? matcher.test(question) : false;
}

function scoreEntry(
  queryTokens: string[],
  requestedKinds: Set<KnowledgeKind>,
  entry: KnowledgeEntry,
  rawQuery: string
) {
  let score = 0;
  const normalizedTitle = normalizeText(entry.title);
  const normalizedSummary = normalizeText(entry.summary);
  const normalizedDetail = normalizeText(entry.detail);
  const normalizedQuery = normalizeText(rawQuery);

  if (requestedKinds.size > 0) {
    if (requestedKinds.has(entry.kind)) {
      score += 12;
    } else {
      score -= 3;
    }
  }

  if (normalizedQuery.length > 3) {
    if (normalizedTitle.includes(normalizedQuery)) score += 20;
    else if (normalizedSummary.includes(normalizedQuery)) score += 10;
    else if (normalizedDetail.includes(normalizedQuery)) score += 5;
  }

  for (const token of queryTokens) {
    if (normalizedTitle.includes(token)) score += 8;

    if (entry.keywords.some((keyword) => normalizeText(keyword) === token)) {
      score += 6;
    } else if (entry.keywords.some((keyword) => normalizeText(keyword).includes(token))) {
      score += 3;
    }

    if (normalizedSummary.includes(token)) score += 2;
    if (normalizedDetail.includes(token)) score += 1;
  }

  if (queryTokens.length > 1) {
    const allText = `${normalizedTitle} ${normalizedSummary}`.split(' ');
    let matchesFound = 0;
    for (const token of queryTokens) {
      if (allText.includes(token)) matchesFound += 1;
    }
    if (matchesFound === queryTokens.length) {
      score += 15;
    } else if (matchesFound > 1) {
      score += matchesFound * 2;
    }
  }

  if (entry.kind === 'profile' && queryTokens.includes('who')) score += 5;
  if (entry.kind === 'contact' && (queryTokens.includes('hire') || queryTokens.includes('email'))) score += 5;
  if (entry.kind === 'book' && (queryTokens.includes('book') || queryTokens.includes('read'))) score += 5;

  return score;
}

function buildMissingInformation(
  requestedKinds: Set<KnowledgeKind>,
  topEntries: KnowledgeEntry[],
  collectionKind?: KnowledgeKind
) {
  if (collectionKind) {
    return [`Name a specific ${collectionKind} if you need a tighter answer with lower ambiguity.`];
  }

  if (topEntries.length === 0) {
    return [
      'Ask about a project, article, certification, operating principle, or the book.',
      'Using the exact public title will improve the match quality.',
    ];
  }

  const kinds = new Set(topEntries.map((entry) => entry.kind));
  if (kinds.size > 1 && requestedKinds.size === 0) {
    return [
      'Specify whether you mean a project, article, certification, principle, or the book.',
      'Using the exact item title will reduce retrieval ambiguity.',
    ];
  }

  const first = topEntries[0];
  if (!first) {
    return [];
  }

  return [`Use the exact title "${first.title}" if you want the highest-confidence lookup.`];
}

function buildCollectionAnswer(kind: KnowledgeKind, entries: KnowledgeEntry[]): AnswerDraft {
  const usableEntries = entries.slice(0, 3);
  const labels: Partial<Record<KnowledgeKind, string>> = {
    article: 'published writing',
    certification: 'featured certifications',
    project: 'featured projects',
  };
  const leadIn = labels[kind] ?? 'featured items';

  return {
    answer: `${leadIn[0]?.toUpperCase() ?? 'F'}${leadIn.slice(1)}: ${usableEntries
      .map((entry) => `${entry.title} — ${entry.summary}`)
      .join(' ')}`,
    citations: usableEntries.map((entry) => ({ label: entry.title, href: entry.href })),
    suggestions: uniqueSuggestions(DEFAULT_SUGGESTIONS),
    route: `${kind}-collection`,
    missingInformation: [`Ask for a specific ${kind} title if you want deeper detail with less ambiguity.`],
    aleatoricBase: 0.18,
    drivers: ['Collection questions summarize several public entries instead of a single exact match.'],
  };
}

function buildAnswer(topEntries: KnowledgeEntry[]): AnswerDraft {
  const [first, second, third] = topEntries;

  if (!first) {
    return {
      answer:
        'I can help with Douglas Mitchell’s public portfolio, projects, writing, certifications, book, and operating philosophy.',
      citations: socialLinks
        .filter((link) => link.label !== 'Email')
        .slice(0, 2)
        .map((link) => ({ label: link.label, href: link.href })),
      suggestions: DEFAULT_SUGGESTIONS,
      route: 'portfolio-overview',
      missingInformation: [
        'Ask about a specific project, article, certification, principle, or the book to tighten the answer.',
      ],
      aleatoricBase: 0.2,
      drivers: ['The answer is broad because the query did not anchor on a specific public artifact.'],
    };
  }

  if (!second || first.kind === 'project' || first.kind === 'article' || first.kind === 'book') {
    return {
      answer: first.detail,
      citations: [{ label: first.title, href: first.href }],
      suggestions: uniqueSuggestions([
        DEFAULT_SUGGESTIONS[0],
        DEFAULT_SUGGESTIONS[1],
        DEFAULT_SUGGESTIONS[2],
        first.kind === 'project'
          ? 'What other projects are featured?'
          : 'What else has Douglas Mitchell published?',
      ]),
      route: `${first.kind}-detail`,
      missingInformation: [`Ask for another exact title if you want a narrower comparison.`],
      aleatoricBase: 0.1,
      drivers: ['A single public artifact clearly dominates the retrieval results.'],
    };
  }

  const summary = [first, second, third]
    .filter(Boolean)
    .map((entry) => `${entry.title}: ${entry.summary}`)
    .join(' ');

  return {
    answer: summary,
    citations: [first, second, third]
      .filter(Boolean)
      .map((entry) => ({ label: entry.title, href: entry.href })),
    suggestions: uniqueSuggestions(DEFAULT_SUGGESTIONS),
    route: `${first.kind}-summary`,
    missingInformation: [
      `Use the exact title "${first.title}" if you want the dominant result rather than a blended summary.`,
    ],
    aleatoricBase: 0.16,
    drivers: ['The assistant is synthesizing multiple relevant public entries into one summary.'],
  };
}

function buildRefusalReply(
  answer: string,
  route: string,
  missingInformation: string[] = []
): PublicAssistantReply {
  const decision = buildDecisionRecommendation(0.05, {
    conditionalThreshold: 0.58,
    deferThreshold: 0.38,
  }, {
    refusal: true,
    missingInformation,
  });

  return {
    answer,
    citations: [{ label: 'Secure contact form', href: PUBLIC_CONTACT_HREF }],
    suggestions: DEFAULT_SUGGESTIONS,
    refusal: true,
    route,
    confidence: 0.05,
    confidenceLabel: 'low',
    decision,
    uncertainty: {
      epistemic: 0.92,
      aleatoric: 0.08,
      semanticEntropy: 0,
      calibrationStatus: 'not-evaluated',
      drivers: [
        'The assistant refused because the request crossed the public knowledge boundary.',
      ],
      missingInformation,
    },
  };
}

export async function answerPublicQuestion(
  question: string,
  options: PublicAssistantOptions = {}
): Promise<PublicAssistantReply> {
  const trimmedQuestion = question.trim();
  const decisionIntelligenceEnabled = options.enableDecisionIntelligence ?? true;
  const thresholds = normalizeThresholds(options);

  if (!trimmedQuestion) {
    const decision = buildDecisionRecommendation(
      0.4,
      thresholds,
      {
        missingInformation: ['Ask a question about Douglas Mitchell\'s public work or published writing.'],
        rationale: 'The query is empty, so the assistant cannot ground an answer in public evidence.',
      }
    );

    return {
      answer: 'Ask about Douglas Mitchell\'s public work, writing, certifications, projects, or book.',
      citations: [],
      suggestions: DEFAULT_SUGGESTIONS,
      refusal: false,
      route: 'empty-query',
      confidence: 0.4,
      confidenceLabel: 'low',
      decision,
      uncertainty: {
        epistemic: 0.6,
        aleatoric: 0.2,
        semanticEntropy: 0,
        calibrationStatus: 'not-evaluated',
        drivers: ['No query tokens were provided, so there is nothing to retrieve against.'],
        missingInformation: ['Enter a concrete portfolio question to reduce uncertainty.'],
      },
    };
  }

  if (containsPromptInjection(trimmedQuestion)) {
    return buildRefusalReply(
      'I cannot process requests that attempt to modify my instructions or role.',
      'prompt-injection-refusal',
      ['Ask a genuine question about Douglas Mitchell\'s public work.']
    );
  }

if (isSensitiveQuestion(trimmedQuestion)) {
    return buildRefusalReply(
      'I only answer public, non-sensitive questions. For outreach, use the secure contact form on the site.',
      'sensitive-refusal',
      ['Keep the question inside Douglas Mitchell\u2019s public portfolio and published work surface.']
    );
  }

  const [staticKnowledge, dynamicKnowledge] = await Promise.all([
    Promise.resolve(buildStaticKnowledge()),
    buildDynamicKnowledge(),
  ]);

  const knowledge = [...staticKnowledge, ...dynamicKnowledge];
  const queryTokens = tokenize(trimmedQuestion);
  const requestedKinds = detectRequestedKinds(trimmedQuestion, queryTokens);
  const rankedResults = knowledge
    .map((entry) => ({
      entry,
      score: scoreEntry(queryTokens, requestedKinds, entry, trimmedQuestion),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);
  const rankedEntries = rankedResults.map((item) => item.entry);

  const collectionKind = Array.from(requestedKinds).find((kind) =>
    wantsCollectionAnswer(trimmedQuestion, kind)
  );

  if (options.strictTopicMode ?? true) {
    const topScore = rankedResults[0]?.score ?? 0;
    if (rankedEntries.length === 0 || topScore < 6) {
      // Handle greetings gracefully instead of refusing
      if (isGreeting(trimmedQuestion)) {
        const decision = buildDecisionRecommendation(
          0.7,
          thresholds,
          { rationale: 'Greeting acknowledged with helpful redirect to available topics.' }
        );
        return {
          answer: GREETING_REPLY,
          citations: [],
          suggestions: DEFAULT_SUGGESTIONS,
          refusal: false,
          route: 'greeting',
          confidence: 0.7,
          confidenceLabel: 'high',
          decision,
          uncertainty: {
            epistemic: 0.1,
            aleatoric: 0.05,
            semanticEntropy: 0,
            calibrationStatus: 'not-evaluated',
            drivers: ['Greeting matched — no retrieval needed.'],
            missingInformation: [],
          },
        };
      }

      return buildRefusalReply(
        "I only answer public questions about Douglas Mitchell's published work, writing, projects, certifications, book, and operating philosophy.",
        'strict-topic-refusal',
        [
          'Ask about a named public project, article, certification, the book, or Douglas Mitchell\u2019s operating principles.',
        ]
      );
    }
  }

  const draft =
    collectionKind && rankedEntries.some((entry) => entry.kind === collectionKind)
      ? buildCollectionAnswer(
          collectionKind,
          rankedEntries.filter((entry) => entry.kind === collectionKind)
        )
      : buildAnswer(rankedEntries.slice(0, 3));

  const missingInformation = buildMissingInformation(
    requestedKinds,
    rankedEntries.slice(0, 3),
    collectionKind
  );
  const confidenceSummary = buildConfidenceSummary(
    rankedResults.slice(0, 5).map((result) => result.score),
    {
      baseAleatoric: draft.aleatoricBase,
      calibrationStatus: decisionIntelligenceEnabled ? 'heuristic' : 'not-evaluated',
      drivers: draft.drivers,
    }
  );

  const initialDecision = decisionIntelligenceEnabled
    ? buildDecisionRecommendation(confidenceSummary.confidence, thresholds, {
        missingInformation,
      })
    : {
        action: 'proceed' as const,
        label: 'Deterministic response',
        rationale: 'Decision intelligence is disabled for the public assistant.',
        requiredEvidence: [],
      };
  const decision = 
    collectionKind && (initialDecision.action === 'defer' || initialDecision.action === 'conditional')
      ? {
          ...initialDecision,
          action: 'proceed' as const,
          label: 'Proceed with collection',
          rationale:
            'Collection requests are allowed when the requested content type is clear, even if individual entries have moderate confidence scores.',
        }
      : initialDecision;

  let answer = draft.answer;
  let suggestions = draft.suggestions;

  if (decision.action === 'conditional') {
    answer = `${draft.answer} Confidence is moderate because ${confidenceSummary.drivers[1]?.toLowerCase() ?? 'the retrieval surface is still a little ambiguous'}`;
  }

  if (decision.action === 'defer') {
    answer = `I need a narrower question before I can answer confidently. ${missingInformation[0] ?? 'Name the exact public project, article, certification, or book entry you want.'}`;
    suggestions = uniqueSuggestions([
      ...draft.citations.map((citation) => `Tell me about ${citation.label}.`),
      ...DEFAULT_SUGGESTIONS,
    ]);
  }

  return {
    answer,
    citations: draft.citations,
    suggestions,
    refusal: false,
    route: draft.route,
    confidence: confidenceSummary.confidence,
    confidenceLabel: confidenceSummary.confidenceLabel,
    decision,
    uncertainty: {
      epistemic: confidenceSummary.epistemic,
      aleatoric: confidenceSummary.aleatoric,
      semanticEntropy: confidenceSummary.semanticEntropy,
      calibrationStatus: confidenceSummary.calibrationStatus,
      drivers: confidenceSummary.drivers,
      missingInformation,
    },
  };
}
