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
  headline: 'Operations Analyst, AI Practitioner, Systems Architect, and Author.',
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
      'An editorial adaptation of the working paper arguing that great prompting is less about commanding a model and more about arranging the conditions it naturally wants to continue.',
    category: 'Research',
    readTime: '18 min',
    date: 'Feb 2026',
    featured: true,
    trending: true,
    tags: ['prompt engineering', 'ai research', 'human-ai interaction', 'style steering'],
    insight: 'The strongest prompts do not force a model into a style. They stack contextual, lexical, structural, and persona cues until the desired response becomes statistically natural.',
    content: `# Rizz Prompting: A Scientific Framework for Attractor-Based Style Steering

This post is a web adaptation of my February 2026 working paper on Rizz Prompting. The paper argues that effective prompting is not best understood as issuing better commands. It is better understood as shaping the probability landscape an LLM is about to continue.

In other words: the best prompt often does not say "do this." It creates the conditions under which the desired response feels like the most natural next move.

## The Abstract in Plain English

Rizz Prompting names a family of prompt engineering techniques that steer a model toward a target voice, register, or rhetorical persona by attraction rather than explicit command. Instead of ordering the model to "sound academic" or "write like an expert," the prompt places the model inside a context where academic or expert language becomes statistically natural.

That is the paper's central claim: prompting is not only instruction. It is environment design.

> The most effective prompts do not demand compliance. They configure the linguistic landscape so that the desired style becomes the path of least resistance.

## Three Ways People Actually Prompt

The paper distinguishes three paradigms of LLM interaction:

1. **Command prompting**  
   The user gives direct instructions and hopes the model interprets them correctly.

2. **Vibe coding**  
   The user iterates by feel, nudging the model until the output "sounds right."

3. **Rizz prompting**  
   The user deliberately engineers the prompt so the right answer style is the easiest continuation for the model to produce.

Command prompting is explicit but often brittle. Vibe coding can work, but it is hard to teach or reproduce. Rizz Prompting is the attempt to formalize what skilled practitioners are already doing intuitively.

## Why the Attractor Metaphor Matters

The paper borrows the language of attractors from dynamical systems, not to claim LLMs literally are bowls with marbles inside them, but to describe something mechanically useful: some prompt configurations pull model outputs toward very narrow regions of style and structure with surprising consistency.

Each token in a prompt changes the conditional probabilities of what comes next. Word choice, syntax, social framing, persona cues, and genre scaffolding all shift the model's internal expectations. Rizz Prompting treats those shifts as designable.

The key question becomes:

**What set of cues moves the model closest to the response manifold I actually want?**

## The Six Attractor Classes

The paper proposes a six-part taxonomy. This is the core framework.

### 1. Contextual Framing

Contextual framing tells the model what world it is in.

If you say, "In the context of an IPCC-style technical briefing," you are not just naming a topic. You are activating a domain, a seriousness level, a vocabulary range, and a style of evidence handling.

Think of this as selecting the station before the music starts.

### 2. Lexical and Semantic Loading

This is deliberate word choice that carries the model into a specific semantic neighborhood.

"Investigate" does not land the same way as "look at."  
"Calibration," "ablation," and "distribution shift" do not activate the same region as "testing," "changes," and "accuracy."

Small lexical substitutions can produce nonlinear shifts in output quality because they move the model into different representational neighborhoods.

### 3. Syntactic Architecture

The shape of a prompt changes the shape of the answer.

Formal prompts, code-like prompts, peer-review prompts, and tutorial prompts each imply different completion structures. The paper argues that syntax itself is an attractor because models learn form-content pairings from their training distributions.

If you want a peer review, it helps to write like someone opening a peer review.

### 4. Schematic Activation

Schemas are higher-level scripts: expert review, medical consultation, policy briefing, Socratic dialogue, methods section, and so on.

Once a schema is activated, the model inherits expected behavior: what counts as relevant, what comes first, what kind of reasoning is normal, what kinds of caution are appropriate.

This is not just vocabulary. It is behavioral scaffolding.

### 5. Temporal Anchoring

Temporal anchoring places the output inside a historical or intellectual lineage.

Prompting "in the tradition of Feynman-style technical exposition" or "with the clarity of late 20th-century analytic philosophy" invokes conventions larger than any single persona.

The paper is explicit that this class is theoretically motivated but empirically under-tested compared to the others.

### 6. Persona Assignment

Persona is the apex attractor.

A well-specified persona implicitly bundles context, vocabulary, syntax, schematic expectations, and often temporal anchoring. "You are an expert" is weak. "You are a senior climate scientist with two decades of Arctic ice-core work contributing to IPCC-style assessment language" is strong.

The paper's argument is simple: specificity matters because specificity narrows the output basin.

## The Three Design Principles

The framework is not just taxonomy. It also proposes a practical prompting discipline.

### Compositionality

Attractors stack.

You do not have to choose between context, vocabulary, and persona. The strongest prompts often combine multiple classes so that each one narrows what remains possible.

### The Minimality Principle

More cues are not always better.

If you overload a prompt with stylistic markers, you can crowd out the actual informational task. The recommendation is to use the smallest stack that reliably induces the desired output.

The question is not "how many cues can I add?"  
It is "what is still unconstrained that needs to be constrained?"

### Reasoning Retention

This is the most important practical warning in the paper.

A polished answer can still be wrong. Persona-rich prompting can create outputs that feel authoritative without increasing correctness. So style and reasoning have to be handled on separate axes.

The paper recommends explicit correctness constraints, clearly separated from style cues:

\`\`\`text
You must be correct and check your work.
State assumptions explicitly.
If uncertain, identify what evidence would resolve the uncertainty.
Do not allow stylistic confidence to substitute for epistemic confidence.
\`\`\`

That separation is one of the strongest ideas in the entire paper.

## Attractor Refresh Scheduling

Long outputs drift.

Early cues fade as the generated text grows and fills the context window. A model that started in a crisp academic register can slowly slide back toward a generic internet-explainer voice.

The paper's solution is Attractor Refresh Scheduling: reinsert short lexical and schematic reminders at major section breaks to keep the generation anchored.

This is especially useful for:

- long essays,
- multi-section reports,
- generated documentation,
- brand-sensitive copy systems.

## The Attractor Density Hypothesis

One of the original contributions of the paper is the Attractor Density Hypothesis, or ADH.

The conjecture is that output quantization -- how tightly the model stays inside the intended response region -- increases with the number and specificity of active attractor classes. The paper goes further and suggests the effect may be superadditive: each new attractor class could narrow the remaining space multiplicatively rather than additively.

That claim is explicitly presented as a hypothesis, not a proven law.

This distinction matters. The paper is careful here: the evidence supports strong independent effects for different attractor classes, but the exact stacking behavior still needs direct empirical validation.

## What the Evidence Currently Supports

The paper synthesizes eight published studies spanning twelve benchmarks and multiple NLP task types. The main empirical story is not that every attractor has been independently proven in perfect isolation. It is that a substantial body of scattered prompt research already points in the same direction.

Highlights from the paper include:

- **Persona assignment**: role-play prompting produced very large gains in some reasoning tasks, including a reported 60.4 percentage-point improvement on the Last Letter task and a 10.3-point gain on AQuA in Kong et al. (2024).
- **Contextual framing**: emotionally framed prompts improved performance, truthfulness, and responsibility metrics across many tasks in Li et al. (2023).
- **Lexical effects**: small wording changes can produce nonlinear output changes, consistent with attractor-style steering.
- **Syntactic effects**: reformulating prompts into different structural forms, including code-like syntax, can materially improve reasoning performance.
- **Schematic prompting**: structured output scaffolds improve task adherence and reasoning organization.

The one major empirical gap the paper names directly is **Temporal Anchoring**, which still needs clean benchmark validation.

## A Practical Checklist for Real Use

One of the best parts of the paper is that it does not stop at theory. It turns the framework into a usable workflow:

1. Specify the target register precisely.  
   Not "formal," but "technical writing in the style of a methods section."

2. Choose the attractor classes that matter most.  
   Persona and schema often do the most work early.

3. Specify each attractor minimally but clearly.  
   Precision beats excess.

4. Add correctness constraints separately.  
   Do not let polish impersonate truth.

5. Generate and inspect.  
   Look for drift, verbosity, or schema mismatch.

6. Ablate to diagnose.  
   Remove one attractor class at a time and see what breaks.

7. Refresh attractors in long outputs.  
   Re-anchor the register at section boundaries.

8. Document the stack.  
   If it works, turn it into reusable organizational knowledge.

## Four Reusable Prompt Patterns

The paper includes a practical template suite. In blog form, the most useful version is:

- **Academic exposition** for technical explainers and literature-style summaries.
- **Brand voice stacks** for consistent messaging across teams and channels.
- **Expert peer review** for critical evaluation and argument testing.
- **Reasoning-safe Rizz** for tasks where both style and factual reliability matter.

That last one is probably the most important for real-world use. It acknowledges the temptation to chase polished outputs while reminding practitioners that polished outputs are often the exact place models can become dangerously convincing.

## Why This Matters Beyond Prompt Nerds

The paper closes with implications for four areas.

### AI literacy

Many users still think prompt quality is a mysterious talent. The framework argues that prompting skill can be decomposed, named, taught, and improved systematically.

### Alignment and safety

If attractor structures reliably steer output regions, then beneficial and adversarial prompt structures can both be studied more rigorously. The same mechanism that helps a user obtain a better policy memo could also be exploited to bypass safety boundaries.

### Interface design

Most AI interfaces leave prompt construction entirely to the user. The paper suggests a better interface pattern: help users build attractor-rich prompts deliberately through scaffolds, missing-class hints, and reusable prompt structures.

### Human-AI interaction research

The six-class framework is testable. It creates actual experimental questions instead of vague prompt folklore.

## Limitations the Paper Admits

The paper is strong partly because it does not oversell itself. Its key limitations are named directly:

- the Attractor Density Hypothesis is still a hypothesis,
- the framework is not yet grounded in mechanistic interpretability evidence,
- Temporal Anchoring lacks direct benchmark validation,
- the framework is currently English-first and text-first,
- different model families may respond differently to the same stacks,
- beneficial attractors and adversarial attractors are mirror problems.

That intellectual honesty makes the framework more credible, not less.

## Final Take

Rizz Prompting gives a name to something skilled practitioners already sense: language does not just request outcomes from a model, it prepares the terrain those outcomes emerge from.

That is why a mediocre prompt and a great prompt can ask for almost the same thing and still land in completely different worlds.

The practitioner with rizz does not merely hope the words land. They understand which structures move probability, which signals activate a register, and which combinations collapse ambiguity into a stable response basin.

That is the practical contribution of the paper: a vocabulary, a mechanism, a methodology, and a research program for one of the most important human-AI skills now emerging.

## Selected References

- Brown et al. (2020), *Language Models are Few-Shot Learners*
- Kong et al. (2024), *Better Zero-Shot Reasoning with Role-Play Prompting*
- Li et al. (2023), *Large Language Models Understand and Can Be Enhanced by Emotional Stimuli*
- Liu et al. (2026), *A Comprehensive Taxonomy of Prompt Engineering Techniques for Large Language Models*
- Puerto et al. (2024), *Code Prompting Elicits Conditional Reasoning Abilities in Text+Code LLMs*
- Sahoo et al. (2024), *A Systematic Survey of Prompt Engineering in Large Language Models*
- Salinas and Morstatter (2024), *The Butterfly Effect of Altering Prompts*
- Shanahan, McDonell, and Reynolds (2023), *Role Play with Large Language Models*
- Wang et al. (2024), *Chain-of-Table*
- Xu et al. (2023), *ExpertPrompting*

---

*Adapted from the working paper "RIZZ PROMPTING: A Scientific Framework for Attractor-Based Style Steering in Large Language Models" by Douglas D. Mitchell, February 2026, arXiv preprint / working paper edition.*`,
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
    title: 'Systems Architect',
    description:
      'Connects product thinking, technical execution, and operational discipline into coherent systems.',
    stats: '85+ repositories of public proof',
  },
];
