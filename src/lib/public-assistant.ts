import 'server-only';

import { getSearchableContent } from '@/lib/content-service';
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

export interface PublicAssistantReply {
  answer: string;
  citations: PublicAssistantCitation[];
  suggestions: string[];
  refusal: boolean;
}

interface PublicAssistantOptions {
  strictTopicMode?: boolean;
}

interface KnowledgeEntry {
  id: string;
  kind: 'profile' | 'principle' | 'metric' | 'project' | 'article' | 'book' | 'certification' | 'contact';
  title: string;
  summary: string;
  detail: string;
  keywords: string[];
  href?: string;
}

type KnowledgeKind = KnowledgeEntry['kind'];

const DEFAULT_SUGGESTIONS = [
  'What kind of work does Douglas Mitchell do?',
  'What are Douglas Mitchell’s main projects?',
  'Tell me about The Confident Mind.',
  'What certifications does Douglas Mitchell have?',
];

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

function buildStaticKnowledge(): KnowledgeEntry[] {
  const profileEntry: KnowledgeEntry = {
    id: 'profile',
    kind: 'profile',
    title: siteProfile.name,
    summary: siteProfile.headline,
    detail: `${siteProfile.summary} Douglas Mitchell is based in ${siteProfile.location}.`,
    keywords: ['douglas', 'mitchell', 'who', 'about', 'background', 'location', 'houston', 'analyst', 'author', 'ai'],
  };

  const principleEntries = operatingPrinciples.map<KnowledgeEntry>((principle) => ({
    id: `principle-${principle.title}`,
    kind: 'principle',
    title: principle.title,
    summary: principle.description,
    detail: principle.description,
    keywords: tokenize(`${principle.title} ${principle.description} philosophy principles operating philosophy`),
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
    keywords: tokenize(`${certification.title} ${certification.issuer} ${certification.description} ${certification.skills.join(' ')}`),
    href: certification.credentialUrl,
  }));

  const bookEntry: KnowledgeEntry = {
    id: 'book',
    kind: 'book',
    title: bookShowcase.title,
    summary: bookShowcase.subtitle,
    detail: `${bookShowcase.description} Publisher: ${bookShowcase.publisher ?? 'independent release'}.`,
    keywords: tokenize(`${bookShowcase.title} ${bookShowcase.subtitle} ${bookShowcase.description} book confident mind`),
    href: bookShowcase.amazonUrl,
  };

  const contactEntry: KnowledgeEntry = {
    id: 'contact',
    kind: 'contact',
    title: 'Contact',
    summary: PUBLIC_CONTACT_VALUE,
    detail: `Douglas Mitchell keeps direct contact private. Use the secure contact form on the site instead.`,
    keywords: ['contact', 'reach', 'email', 'message', 'hire', 'connect'],
    href: PUBLIC_CONTACT_HREF,
  };

  return [profileEntry, bookEntry, contactEntry, ...principleEntries, ...metricEntries, ...certificationEntries];
}

async function buildDynamicKnowledge() {
  const searchable = await getSearchableContent();

  const projectEntries = searchable.projects.map<KnowledgeEntry>((project) => ({
    id: `project-${project.slug}`,
    kind: 'project',
    title: project.title,
    summary: project.description,
    detail: `${project.title} is a ${project.category} project with status ${project.status}. Tech stack: ${project.techStack.join(', ')}. ${project.description}`,
    keywords: tokenize(`${project.title} ${project.description} ${project.category} ${project.status} ${project.techStack.join(' ')}`),
    href: `/work/${project.slug}`,
  }));

  const articleEntries = searchable.articles.map<KnowledgeEntry>((article) => ({
    id: `article-${article.slug}`,
    kind: 'article',
    title: article.title,
    summary: article.excerpt,
    detail: `${article.title} is a ${article.category} article. ${article.excerpt} Tags: ${article.tags.join(', ')}.`,
    keywords: tokenize(`${article.title} ${article.excerpt} ${article.category} ${article.tags.join(' ')}`),
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

  for (const [kind, synonyms] of Object.entries(KIND_SYNONYMS) as Array<[KnowledgeKind, string[]]>) {
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

function scoreEntry(queryTokens: string[], requestedKinds: Set<KnowledgeKind>, entry: KnowledgeEntry, rawQuery: string) {
  let score = 0;
  const normalizedTitle = normalizeText(entry.title);
  const normalizedSummary = normalizeText(entry.summary);
  const normalizedDetail = normalizeText(entry.detail);
  const normalizedQuery = normalizeText(rawQuery);

  // 1. Kind Relevance (Strong Signal)
  if (requestedKinds.size > 0) {
    if (requestedKinds.has(entry.kind)) {
      score += 12;
    } else {
      score -= 3; // Penalty for mismatching the requested kind
    }
  }

  // 2. Exact Phrase Match (Highest Precision)
  if (normalizedQuery.length > 3) {
    if (normalizedTitle.includes(normalizedQuery)) score += 20;
    else if (normalizedSummary.includes(normalizedQuery)) score += 10;
    else if (normalizedDetail.includes(normalizedQuery)) score += 5;
  }

  // 3. Individual Token Matching
  for (const token of queryTokens) {
    // Title match (High Weight)
    if (normalizedTitle.includes(token)) score += 8;
    
    // Keyword match (Medium-High Weight)
    if (entry.keywords.some((keyword) => normalizeText(keyword) === token)) {
      score += 6;
    } else if (entry.keywords.some((keyword) => normalizeText(keyword).includes(token))) {
      score += 3;
    }
    
    // Summary/Detail matches (Lower Weight)
    if (normalizedSummary.includes(token)) score += 2;
    if (normalizedDetail.includes(token)) score += 1;
  }

  // 4. Proximity Boost (Boost if multiple tokens appear close together in title/summary)
  if (queryTokens.length > 1) {
    const allText = `${normalizedTitle} ${normalizedSummary}`.split(' ');
    let matchesFound = 0;
    for (const token of queryTokens) {
      if (allText.includes(token)) matchesFound++;
    }
    if (matchesFound === queryTokens.length) {
      score += 15; // All query tokens found in title/summary
    } else if (matchesFound > 1) {
      score += matchesFound * 2;
    }
  }

  // 5. Kind-specific Boosts
  if (entry.kind === 'profile' && queryTokens.includes('who')) score += 5;
  if (entry.kind === 'contact' && (queryTokens.includes('hire') || queryTokens.includes('email'))) score += 5;
  if (entry.kind === 'book' && (queryTokens.includes('book') || queryTokens.includes('read'))) score += 5;

  return score;
}

function buildCollectionAnswer(kind: KnowledgeKind, entries: KnowledgeEntry[]) {
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
    suggestions: uniqueSuggestions([
      DEFAULT_SUGGESTIONS[0],
      DEFAULT_SUGGESTIONS[1],
      DEFAULT_SUGGESTIONS[2],
      DEFAULT_SUGGESTIONS[3],
    ]),
  };
}

function buildAnswer(topEntries: KnowledgeEntry[]) {
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
        first.kind === 'project' ? 'What other projects are featured?' : 'What else has Douglas Mitchell published?',
      ]),
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
  };
}

export async function answerPublicQuestion(
  question: string,
  options: PublicAssistantOptions = {}
): Promise<PublicAssistantReply> {
  const trimmedQuestion = question.trim();

  if (!trimmedQuestion) {
    return {
      answer:
        'Ask about Douglas Mitchell’s public work, writing, certifications, projects, or book.',
      citations: [],
      suggestions: DEFAULT_SUGGESTIONS,
      refusal: false,
    };
  }

  if (isSensitiveQuestion(trimmedQuestion)) {
    return {
      answer:
        'I only answer public, non-sensitive questions. For outreach, use the secure contact form on the site.',
      citations: [{ label: 'Secure contact form', href: PUBLIC_CONTACT_HREF }],
      suggestions: DEFAULT_SUGGESTIONS,
      refusal: true,
    };
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

  if (collectionKind) {
    const collectionEntries = rankedEntries.filter((entry) => entry.kind === collectionKind);
    if (collectionEntries.length > 0) {
      return {
        ...buildCollectionAnswer(collectionKind, collectionEntries),
        refusal: false,
      };
    }
  }

  const topEntries = rankedEntries.slice(0, 3);
  const isStrictTopicMode = options.strictTopicMode ?? true;
  const topScore = rankedResults[0]?.score ?? 0;

  if (isStrictTopicMode && (topEntries.length === 0 || topScore < 6)) {
    return {
      answer:
        'I only answer public questions about Douglas Mitchell’s published work, writing, projects, certifications, book, and operating philosophy.',
      citations: [{ label: 'Secure contact form', href: PUBLIC_CONTACT_HREF }],
      suggestions: DEFAULT_SUGGESTIONS,
      refusal: true,
    };
  }

  const answer = buildAnswer(topEntries);

  return {
    ...answer,
    refusal: false,
  };
}
