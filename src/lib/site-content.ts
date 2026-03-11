export interface HeroMetric {
  label: string;
  value: string;
  detail: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface OperatingPrinciple {
  title: string;
  description: string;
}

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface ProjectShowcase {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  category: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  stars: number;
  forks: number;
  color: string;
  timeline: string;
  status: string;
  challenge: string;
  solution: string[];
  outcomes: string[];
  metrics: ProjectMetric[];
}

export interface ArticleShowcase {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  featured: boolean;
  trending: boolean;
  tags: string[];
  insight: string;
  content: string;
}

export interface BookShowcase {
  title: string;
  subtitle: string;
  description: string;
  amazonUrl: string;
  publisher?: string;
  publishDate?: string;
  highlights: string[];
  chapters: string[];
  testimonials: Array<{
    text: string;
    author: string;
  }>;
}

export interface CertificationShowcase {
  id: string;
  title: string;
  issuer: string;
  description: string;
  credentialUrl: string;
  issueDate: string;
  skills: string[];
  featured: boolean;
  imageUrl?: string;
}

export interface ContactMethod {
  label: string;
  value: string;
  href?: string;
  color: string;
}

export const siteProfile = {
  name: 'Douglas Mitchell',
  headline: 'Operations Analyst, AI Practitioner, Systems Strategist, and Author.',
  summary:
    'I design resilient systems that blend operational rigor, AI fluency, and human-centered execution. The result is proof-driven work that looks premium and performs in the real world.',
  location: 'Houston, TX',
  email: 'contact@douglasmitchell.info',
  githubUrl: 'https://github.com/Senpai-Sama7',
  linkedinUrl: 'https://www.linkedin.com/in/douglas-mitchell-the-architect/',
  bookUrl:
    'https://www.amazon.com/Confident-Mind-Practical-Authentic-Confidence-ebook/dp/B0FPJPPPC9',
};

export const heroMetrics: HeroMetric[] = [
  {
    label: 'Proof of Work',
    value: '85+',
    detail: 'public repositories and experiments across systems, AI, and product execution.',
  },
  {
    label: 'Operating Focus',
    value: '3x',
    detail: 'discipline across operations, automation, and human performance architecture.',
  },
  {
    label: 'Credential Signal',
    value: '2',
    detail: 'verified AI credentials from Google and Anthropic with practical delivery focus.',
  },
];

export const socialLinks: SocialLink[] = [
  { label: 'GitHub', href: siteProfile.githubUrl },
  { label: 'LinkedIn', href: siteProfile.linkedinUrl },
  { label: 'Book', href: siteProfile.bookUrl },
  { label: 'Email', href: `mailto:${siteProfile.email}` },
];

export const operatingPrinciples: OperatingPrinciple[] = [
  {
    title: 'Operational Clarity',
    description:
      'Every system should reduce ambiguity, compress decision time, and create leverage for the people running it.',
  },
  {
    title: 'Human-First Automation',
    description:
      'Automation is only premium when it preserves judgment, trust, and quality instead of adding brittle complexity.',
  },
  {
    title: 'Proof Over Posturing',
    description:
      'A polished brand matters, but the real differentiator is shipping systems that can survive contact with reality.',
  },
];

export const featuredProjects: ProjectShowcase[] = [
  {
    slug: 'ai-workflow-automation',
    title: 'AI Workflow Automation',
    description:
      'A decision-support automation layer that turns noisy operational handoffs into structured, auditable workflow execution.',
    longDescription:
      'Built to eliminate repetitive triage and context switching, this system combines intake normalization, model-assisted classification, and human approval loops. It is designed for environments where accuracy matters as much as speed.',
    category: 'AI Automation',
    techStack: ['Python', 'LangChain', 'OpenAI', 'n8n', 'Redis'],
    githubUrl: siteProfile.githubUrl,
    liveUrl: undefined,
    featured: true,
    stars: 42,
    forks: 12,
    color: 'from-emerald-500/10 to-teal-500/10',
    timeline: '2024 → Present',
    status: 'Production-minded',
    challenge:
      'Ops teams were spending too much time translating semi-structured requests into downstream actions, which created latency, inconsistency, and weak auditability.',
    solution: [
      'Introduced structured intake pipelines with validation before the model is invoked.',
      'Added confidence-based routing so ambiguous requests are escalated instead of auto-executed.',
      'Created a human approval checkpoint with decision traces and action receipts.',
    ],
    outcomes: [
      'Reduced repetitive manual triage work.',
      'Improved consistency of downstream task formatting.',
      'Created a clearer record for post-incident analysis and optimization.',
    ],
    metrics: [
      { label: 'Automation candidates mapped', value: '40+' },
      { label: 'Decision states supported', value: '8' },
      { label: 'Traceability coverage', value: '100%' },
    ],
  },
  {
    slug: 'confident-mind-platform',
    title: 'The Confident Mind Platform',
    description:
      'A premium digital companion for the book with guided exercises, reflection prompts, and progress-oriented follow-through.',
    longDescription:
      'This product direction extends the book into a living digital experience. It organizes reflection loops, micro-actions, and user-specific practice in a way that feels editorially elegant while staying operationally useful.',
    category: 'Web Development',
    techStack: ['Next.js', 'TypeScript', 'Prisma', 'Tailwind CSS', 'Framer Motion'],
    githubUrl: siteProfile.githubUrl,
    liveUrl: undefined,
    featured: true,
    stars: 38,
    forks: 8,
    color: 'from-violet-500/10 to-purple-500/10',
    timeline: '2024 → Present',
    status: 'Experience system',
    challenge:
      'The book creates momentum, but readers still need a system that helps them turn insight into repeatable behavior and measurable progress.',
    solution: [
      'Designed a high-trust editorial interface that feels calm, premium, and structured.',
      'Modeled guided practice flows that mirror the book’s progression instead of generic self-help gimmicks.',
      'Planned for measurable checkpoints, recurring reflections, and supportive follow-up content.',
    ],
    outcomes: [
      'Created a stronger bridge between content and action.',
      'Raised the perceived quality of the overall book ecosystem.',
      'Established a foundation for future subscriber and community features.',
    ],
    metrics: [
      { label: 'Core journeys defined', value: '5' },
      { label: 'Interface states designed', value: '20+' },
      { label: 'Editorial consistency', value: 'High' },
    ],
  },
  {
    slug: 'systems-architecture-toolkit',
    title: 'Systems Architecture Toolkit',
    description:
      'A reusable toolkit for building maintainable systems with better boundaries, observability, and delivery discipline.',
    longDescription:
      'Part reference library and part field manual, this toolkit captures the patterns, defaults, and decision frameworks needed to keep systems understandable as they grow.',
    category: 'System Design',
    techStack: ['TypeScript', 'Node.js', 'Docker', 'AWS', 'CI/CD'],
    githubUrl: siteProfile.githubUrl,
    liveUrl: undefined,
    featured: true,
    stars: 56,
    forks: 15,
    color: 'from-amber-500/10 to-orange-500/10',
    timeline: '2023 → Present',
    status: 'Reusable foundation',
    challenge:
      'Teams often scale implementation faster than architecture, leaving behind undocumented decisions, fragile conventions, and repeated avoidable mistakes.',
    solution: [
      'Codified repeatable patterns for system boundaries, deployment hygiene, and interface clarity.',
      'Packaged architectural defaults that reduce decision fatigue during implementation.',
      'Embedded delivery discipline with observability, security, and rollback awareness.',
    ],
    outcomes: [
      'Accelerated solution design for new initiatives.',
      'Made architecture conversations more concrete and less abstract.',
      'Improved maintainability by documenting practical constraints and tradeoffs.',
    ],
    metrics: [
      { label: 'Reference patterns', value: '25+' },
      { label: 'Deployment paths documented', value: '6' },
      { label: 'Reuse potential', value: 'Enterprise' },
    ],
  },
];

export const featuredArticles: ArticleShowcase[] = [
  {
    slug: 'rizz-prompting-attractor-based-style-steering',
    title: 'Rizz Prompting: Attractor-Based Style Steering in LLMs',
    excerpt:
      'A scientific framework for steering Large Language Models toward target registers and personas using attractor dynamics instead of explicit commands.',
    category: 'Research',
    readTime: '15 min',
    date: 'Feb 2026',
    featured: true,
    trending: true,
    tags: ['prompt engineering', 'ai research', 'semantic steering', 'llm dynamics'],
    insight: 'The most effective prompts do not demand compliance; they configure the linguistic landscape so that the desired output becomes the path of least resistance.',
    content: `# Rizz Prompting: A Scientific Framework for Attractor-Based Style Steering

"Rizz prompting" (RP) is an informal name for a family of prompt engineering techniques that steer a large language model (LLM) toward a target register, voice, or rhetorical persona by attraction rather than explicit command -- placing high-leverage linguistic cues in-context so that the desired style becomes the path of least resistance in the model's next-token distribution.

## 1. Introduction

In the sociology of charisma, rizz names a particular quality: effortless interpersonal magnetism. The person with rizz does not demand compliance -- they configure the social context so that a specific response becomes the path of least resistance. 

This paper argues that the same principle applies, with mechanical precision, to interactions with large language models (LLMs). When a human communicates with an LLM, they are not simply sending a message -- they are reconfiguring a high-dimensional probability landscape. Every word choice, syntactic structure, emotional tone, contextual signal, and persona cue shifts the distribution of plausible outputs.

### Three Paradigms of LLM Interaction:

1.  **Command Prompting (instruction framing):** The user issues explicit directives. The model attempts to follow them. Results are highly sensitive to instruction quality.
2.  **Vibe Coding (iterative feeling):** The user tries prompts, responds to what emerges, and gradually converges toward a satisfactory result through feel and intuition.
3.  **Rizz Prompting (attractor engineering):** The user deliberately constructs a prompt context that makes the desired style, register, and structure statistically natural -- the path of least resistance for the model's next-token prediction.

## 2. The Mathematical Foundation

We model attractors as structured feature bundles extracted from text. Rizz Prompting aims to set the prompt close to the feature region that typically precedes the target register in the model's training distribution. 

Certain prompt configurations concentrate probability mass so heavily toward specific output regions that, across repeated sampling, the model will almost always produce outputs from those regions. The output space has structure, carved by training data statistics, and certain prompts exploit that structure to channel the model toward predictable destinations.

## 3. A Six-Category Attractor Taxonomy

We propose a six-category attractor taxonomy, organized hierarchically by level of abstraction:

### Class 1: Contextual Framing (CF)
**Definition:** Establishes the domain, situation, and purpose within which the model believes it is operating.
**In plain terms:** Think of it as dialing a radio to a specific station.
**Example:** "In the context of an IPCC-style technical policy briefing..."

### Class 2: Lexical / Semantic Loading (LA)
**Definition:** Deliberate selection of words whose distributional statistics carry the practitioner's intent into the model's representational space.
**In plain terms:** "Investigate" and "look at" are semantically similar but statistically different.
**Example:** Using "ablation," "distribution shift," or "calibration" to activate an ML-research register.

### Class 3: Syntactic Architecture (SA)
**Definition:** Grammatical structure, sentence complexity, and organizational form that signals the register and formality.
**In plain terms:** The shape of a sentence tells the model what shape of answer is expected.

### Class 4: Schematic Activation (ScA)
**Definition:** Activating a cognitive template for a type of situation or event (e.g., "Medical consultation," "Socratic dialogue").
**Mechanism:** Schematic cues activate learned behavioral clusters associated with specific situation types.

### Class 5: Temporal Anchoring (TA)
**Definition:** Situating the prompt within a specific historical era, intellectual tradition, or canonical lineage.
**Example:** "In the tradition of Feynman-style technical exposition..."

### Class 6: Persona Assignment (PA)
**Definition:** Assigns the model a specific identity. Persona is the **apex attractor**: it simultaneously activates all five lower-level attractor classes as a composite bundle.

## 4. Design Principles

### 4.1 Compositionality (Attractor Stacking)
Attractor classes are designed to be deployed simultaneously. The power of Rizz Prompting emerges from their compound effect: multiple probability-narrowing forces operating in concert.

### 4.2 The Minimality Principle
Use the smallest set of attractors that reliably induces the target style. Excess attractor cues can overfit to a genre and crowd out actual information content.

### 4.3 Reasoning Retention
Style steering should not degrade correctness. The mitigation is structural: pair stylistic attractors with explicit correctness constraints that operate on a separate axis from style.

## 5. The Attractor Density Hypothesis (ADH)

The ADH conjectures that the degree of output quantization -- how reliably a prompt steers the model -- is a function of the number and specificity of simultaneous attractor features. We hypothesize that their effects are **superadditive**: each additional attractor class narrows the remaining degrees of freedom multiplicatively rather than additively.

## 6. Conclusion

The practitioner with rizz does not hope their words land -- they know how they land and why. Rizz Prompting names the competency in human-AI interaction of knowing which linguistic structures activate which probability basins, and deploying them with confident intentionality.

---
*Based on the research paper "RIZZ PROMPTING: A Scientific Framework for Attractor-Based Style Steering in Large Language Models" (February 2026).*`,
  },
  {
    slug: 'building-ai-powered-workflows',
    title: 'Building AI-Powered Workflows That Actually Work',
    excerpt:
      'A field guide to designing AI automation with human checkpoints, measurable quality, and operational discipline.',
    category: 'Technical',
    readTime: '8 min',
    date: 'Jan 2025',
    featured: true,
    trending: true,
    tags: ['automation', 'ops design', 'ai systems'],
    insight: 'The best AI workflow is not the one with the most model calls. It is the one your team can trust at 4:47 PM on a chaotic Thursday.',
    content: `# Building AI-Powered Workflows That Actually Work

AI workflows fail for the same reason many software initiatives fail: the implementation is optimized for the demo instead of the operating environment.

In real teams, workflows are judged by whether they reduce ambiguity, preserve quality, and create confidence under pressure. A beautiful flowchart means very little if the people running the process cannot explain why the system made a decision.

## Start With Friction, Not Fantasy

The strongest automation opportunities usually hide inside repetitive handoffs, slow classification steps, or decisions that depend on scattered context. Instead of asking _"where can we use AI?"_ ask _"where are people paying a tax in attention, repetition, or uncertainty?"_

That framing changes the design. You stop looking for flashy prompts and start designing around the shape of operational pain.

## Put Guardrails Before Intelligence

The premium move is not model sophistication. It is structured intake.

Before a model does anything useful, the system should normalize the request, validate required fields, and make the failure modes explicit. When teams skip this step, the model inherits ambiguity and turns it into probabilistic confusion.

Structured inputs create higher quality outcomes than prompt engineering alone. They also make the workflow easier to measure and improve.

## Design for Confidence Thresholds

Not every task should be automated to completion. Some should be auto-drafted. Others should be routed for approval. A few should be blocked entirely unless a human provides context.

That is why confidence thresholds matter. They create a practical contract between the model and the team:

- high confidence can trigger a recommended action,
- medium confidence can produce a review-ready draft,
- low confidence should produce escalation rather than improvisation.

This is how you keep speed without sacrificing trust.

## Make Every Decision Auditable

If the system takes action, there should be a visible trail for why it happened. Inputs, model decisions, overrides, and outcomes should be inspectable. This is not just for compliance. It is essential for learning.

When a workflow fails, you need to know whether the problem came from bad context, weak prompts, missing policy, or a flawed human handoff. Auditability turns the system into something you can refine instead of fear.

## Ship Smaller Than Your Ambition

Most teams try to automate an entire lane too early. A stronger pattern is to automate a narrow slice, measure it, and expand only after the operating logic proves itself.

The win is not launching a giant AI platform. The win is creating a workflow that reliably saves time and preserves judgment. Once that trust exists, scale becomes much easier.

## The Real Standard

An AI workflow is successful when people stop talking about the AI and start talking about the clarity, quality, and speed of the work itself.

That is the bar worth building toward.`,
  },
  {
    slug: 'architecture-of-confidence',
    title: 'The Architecture of Confidence',
    excerpt:
      'Confidence becomes more durable when it is designed like a system instead of chased like a mood.',
    category: 'Insight',
    readTime: '6 min',
    date: 'Dec 2024',
    featured: true,
    trending: false,
    tags: ['mindset', 'systems thinking', 'personal growth'],
    insight: 'Confidence is not noise, swagger, or theater. It is the quiet stability that comes from having internal evidence.',
    content: `# The Architecture of Confidence

People often treat confidence like a personality trait. I think it behaves more like a system.

When confidence is built on unstable inputs such as praise, comparison, or temporary momentum, it collapses as soon as the environment changes. But when it is built on repeated evidence, clear standards, and honest self-trust, it becomes much harder to shake.

## Confidence Needs Structure

Systems shape behavior because they reduce randomness. The same is true with confidence. If your life only produces evidence of capability by accident, your inner state will always be fragile.

Confidence grows when you create environments that produce proof:

- promises kept,
- skills practiced,
- discomfort entered voluntarily,
- integrity preserved when nobody is watching.

This is less glamorous than motivational advice, but far more durable.

## Internal Evidence Beats External Volume

Loudness is often mistaken for certainty. But volume is not the same as grounding.

Grounded confidence comes from knowing you can face reality without collapsing. It does not require domination or performance. It requires contact with truth.

That means admitting what is weak, improving what is weak, and refusing to create an identity around avoidance.

## Design Practices That Reinforce Trust

If I were designing a confidence system, I would include three recurring loops:

1. **Reflection** — honest review of what happened and why.
2. **Action** — a concrete step that builds capability or courage.
3. **Recovery** — a way to reset without turning setbacks into identity crises.

These loops create repeatable proof. Over time, proof changes self-perception.

## Confidence as an Ethical Practice

There is also a moral dimension to confidence. People trust confident individuals when their confidence feels clean. That usually means competence, humility, and consistency are present together.

Without humility, confidence turns into arrogance. Without competence, it turns into theater. Without consistency, it turns into branding.

## A Better Goal

Do not aim to feel confident all the time. Aim to become the kind of person who can recover, recalibrate, and continue.

That kind of confidence is not fragile because it is not pretending to be invincible. It is built to withstand reality.`,
  },
  {
    slug: 'operations-to-ai-transition',
    title: 'From Operations to AI: A Career Transition Guide',
    excerpt:
      'A practical roadmap for operators who want to become valuable in AI without abandoning the strengths that made them effective.',
    category: 'Essay',
    readTime: '10 min',
    date: 'Nov 2024',
    featured: false,
    trending: true,
    tags: ['career', 'operations', 'ai adoption'],
    insight: 'The best operators already think in systems. AI simply gives them a new layer of leverage if they learn how to frame the work correctly.',
    content: `# From Operations to AI: A Career Transition Guide

Many people assume moving from operations into AI means leaving your past behind. I think the opposite is true.

Operations experience is often the hidden advantage because AI systems only create value when they are tied to real process constraints, messy data, and human decision loops. Operators already understand those realities.

## Your Existing Edge

If you come from operations, you likely already know how to:

- identify bottlenecks,
- document process dependencies,
- manage exceptions,
- work across teams,
- improve quality under constraints.

Those are not secondary skills in AI adoption. They are the foundation.

## Learn the Right Layer First

You do not need to become a research scientist to become dangerous in this space. Start with the layer where decisions meet workflows.

Learn how models are used, where they fail, what good prompting looks like, and how to structure reliable human-in-the-loop systems. That knowledge compounds quickly because it is directly applicable.

## Build Translation Ability

The most valuable people in applied AI are often translators. They can move between stakeholders, technical teams, and operators without losing the substance of the problem.

If you can describe a workflow clearly, define the failure modes, and articulate the quality standard, you become extremely useful even before you master every implementation detail.

## Build Public Proof

A transition becomes real when there is evidence.

Create small artifacts:

- a workflow redesign,
- an automation prototype,
- a dashboard that exposes process friction,
- a short write-up of an AI experiment and what it taught you.

Public proof compresses trust. It shows how you think, not just what you claim.

## Stay Grounded in Outcomes

The market does not reward people for simply knowing AI vocabulary. It rewards people who can improve throughput, reduce waste, support better decisions, or create new capacity.

That is why operators can win here. They already think in outcomes.

## Final Thought

Do not frame the transition as becoming someone else. Frame it as extending the systems mindset you already have into a more leveraged era of work.

That shift is not cosmetic. It is strategic.`,
  },
  {
    slug: 'system-design-for-solo-founders',
    title: 'System Design for Solo Founders',
    excerpt:
      'How to design products, workflows, and delivery habits that scale without turning your solo operation into chaos.',
    category: 'Technical',
    readTime: '12 min',
    date: 'Oct 2024',
    featured: false,
    trending: false,
    tags: ['founders', 'systems', 'execution'],
    insight: 'Solo founders do not need enterprise complexity. They need leverage, defaults, and enough structure to stay fast without becoming sloppy.',
    content: `# System Design for Solo Founders

Solo founders usually face a strange trap: they need systems early, but not enterprise complexity.

The answer is not to ignore architecture. It is to design for leverage with appropriate weight.

## What Good Solo Systems Do

A strong solo-founder system should do three things:

1. reduce cognitive overhead,
2. preserve delivery speed,
3. make future complexity easier to absorb.

If a process adds ceremony without leverage, it is probably too heavy.

## Create Default Paths

The easiest way to stay fast is to remove unnecessary decisions.

Choose defaults for naming, release flow, bug triage, customer follow-up, and product feedback intake. Small defaults save enormous energy over time.

## Protect the Feedback Loop

Founders often overbuild before they have enough signal. Good system design keeps the path from user behavior to product decision as short as possible.

That means lightweight analytics, visible metrics, and recurring review habits. A system that hides the truth is not helping.

## Design for Recovery

Things will break. Pages will regress. Customers will misunderstand what you meant. Build in recovery mechanisms:

- simple rollback options,
- obvious logging,
- issue capture templates,
- a short list of critical checks before shipping.

Reliability is not just about prevention. It is about graceful response.

## Conclusion

The goal is not to imitate a larger company. The goal is to build an operating system that lets one capable person move with unusual clarity.

That is often enough to outperform much larger teams.`,
  },
];

export const bookShowcase: BookShowcase = {
  title: 'The Confident Mind',
  subtitle: 'A Practical Manual to Repair, Build & Sustain Authentic Confidence',
  description:
    'A grounded, psychology-aware framework for rebuilding confidence without self-help theater. The book turns reflection into action and action into internal evidence.',
  amazonUrl: siteProfile.bookUrl,
  publisher: 'Independent Release',
  publishDate: '2024',
  highlights: [
    'Psychology-informed framework for authentic confidence',
    'Practical exercises that move insight into action',
    'A non-performative alternative to hype-driven self-help',
    'Designed to support sustainable internal change',
  ],
  chapters: [
    'Understanding Confidence',
    'The Confidence Gap',
    'Building Internal Evidence',
    'Practical Application',
    'Sustaining Growth',
  ],
  testimonials: [
    {
      text: 'A refreshingly honest approach to confidence that feels practical, structured, and usable in real life.',
      author: 'Reader feedback',
    },
    {
      text: 'The exercises helped me move from vague motivation to repeatable action.',
      author: 'Amazon reviewer',
    },
  ],
};

export const certificationShowcase: CertificationShowcase[] = [
  {
    id: 'google-ai-professional-certificate',
    title: 'Google AI Professional Certificate',
    issuer: 'Google',
    description:
      'Applied AI credential covering practical machine learning workflows, model fundamentals, and responsible AI implementation.',
    credentialUrl: 'https://www.credly.com/users/douglas-mitchell.887417ae/badges',
    issueDate: '2024',
    skills: ['Machine Learning', 'AI Development', 'Responsible AI', 'Workflow Design'],
    featured: true,
    imageUrl: '/images/certs/google-ai-professional-certificate.png',
  },
  {
    id: 'anthropic-ai-safety',
    title: 'Anthropic AI Safety',
    issuer: 'Anthropic',
    description:
      'Credential focused on safe deployment, model behavior, and building AI systems that preserve trust under real-world usage.',
    credentialUrl: 'https://verify.skilljar.com/c/kcmc2byhr4ay',
    issueDate: '2024',
    skills: ['AI Safety', 'Evaluation', 'Prompt Discipline', 'Responsible Deployment'],
    featured: true,
    imageUrl: '/images/certs/AI-Fluency-Anthropic.jpg',
  },
];

export const contactMethods: ContactMethod[] = [
  {
    label: 'Email',
    value: siteProfile.email,
    href: `mailto:${siteProfile.email}`,
    color: 'hover:text-blue-500',
  },
  {
    label: 'GitHub',
    value: '@Senpai-Sama7',
    href: siteProfile.githubUrl,
    color: 'hover:text-purple-500',
  },
  {
    label: 'LinkedIn',
    value: 'douglas-mitchell-the-architect',
    href: siteProfile.linkedinUrl,
    color: 'hover:text-blue-600',
  },
  {
    label: 'Location',
    value: siteProfile.location,
    color: 'hover:text-red-500',
  },
];

export const expertiseByCategory = {
  frontend: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'UI Systems'],
  backend: ['Node.js', 'Python', 'Prisma', 'REST APIs', 'Automation Pipelines'],
  infrastructure: ['Docker', 'CI/CD', 'Observability', 'Deployment Hygiene', 'System Design'],
  ai: ['Applied AI', 'Prompt Engineering', 'Human-in-the-loop Systems', 'Evaluation', 'Workflow Automation'],
};

export const aboutRoles = [
  {
    title: 'Operations Analyst',
    description:
      'Improves clarity, throughput, and execution by redesigning the way work moves through a system.',
    stats: 'Process-first thinking',
  },
  {
    title: 'AI Practitioner',
    description:
      'Applies AI where it creates leverage, not noise, with emphasis on trust, quality, and useful automation.',
    stats: 'Google AI + Anthropic credentials',
  },
  {
    title: 'Author',
    description:
      'Builds frameworks that help people create durable confidence through honesty, repetition, and evidence.',
    stats: 'Published book + companion ecosystem',
  },
  {
    title: 'Operations Analyst',
    description:
      'Connects product thinking, technical execution, and operational discipline into measurable operating outcomes.',
    stats: 'Systems-level execution',
  },
];
