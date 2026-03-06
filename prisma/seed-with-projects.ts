/**
 * Seed script to populate gallery and journal with actual projects
 * Run with: bunx tsx prisma/seed-with-projects.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Project data based on GitHub repos and websites
const projects = {
  github: [
    {
      name: 'SuperNova',
      repo: 'https://github.com/Senpai-Sama7/SuperNova',
      description: 'A local-first AI assistant with multi-agent orchestration, 4-type persistent memory (semantic, episodic, procedural, working), 3D memory visualization, and granular approval system. 100% local-first — your data never leaves your machine.',
      tech: ['Python', 'FastAPI', 'Docker', 'Multi-Agent System', 'Vector DB'],
      category: 'tech-deck',
      highlights: [
        'Multi-agent orchestration (plan, execute, critique)',
        '4-type persistent memory system',
        '3D memory visualization',
        'Real-time cost tracking',
        '100% local-first architecture'
      ]
    },
    {
      name: 'BackupIQ',
      repo: 'https://github.com/Senpai-Sama7/BackupIQ',
      description: 'Enterprise-grade backup solution with semantic file organization and AI-powered knowledge graph construction. Features circuit breakers, exponential backoff, multi-cloud support, and production-grade observability.',
      tech: ['Python', 'Docker', 'Kubernetes', 'Neo4j', 'Prometheus'],
      category: 'project',
      highlights: [
        'Semantic file organization with AI classification',
        'Knowledge graph construction',
        'Multi-cloud support (iCloud, Google Drive, AWS S3)',
        'Circuit breakers and exponential backoff',
        'Enterprise monitoring with Prometheus'
      ]
    },
    {
      name: 'DocuMancer',
      repo: 'https://github.com/Senpai-Sama7/DocuMancer',
      description: 'Modern Electron application for document conversion and management. Built with a hardened Python converter backend and Electron frontend. Supports multiple document formats with secure local processing.',
      tech: ['Electron', 'Node.js', 'Python', 'FastAPI', 'Docker'],
      category: 'project',
      highlights: [
        'Cross-platform desktop application',
        'Secure document conversion',
        'Hardened Python backend',
        'Modern Electron frontend',
        'Local-first processing'
      ]
    },
    {
      name: 'check-please',
      repo: 'https://github.com/Senpai-Sama7/check-please',
      description: 'AI agent credential management with scoped permissions. Features 16+ provider support, usage tracking, RPM rate limiting, and multiple interfaces (CLI, TUI, Web, Desktop, API, MCP).',
      tech: ['Python', 'FastAPI', 'GTK', 'MCP', 'Encryption'],
      category: 'tech-deck',
      highlights: [
        'Scoped permissions for AI agents',
        '16+ provider support (OpenAI, Anthropic, etc.)',
        'Multiple interfaces (CLI, TUI, Web, Desktop)',
        'MCP server for Claude/Copilot integration',
        'PBKDF2 200K encrypted vault'
      ]
    }
  ],
  websites: [
    {
      name: 'ReliantAI.org',
      url: 'https://ReliantAI.org',
      description: 'Primary business website for Reliant AI — a software architecture and AI consulting practice. Features modern design, interactive elements, and comprehensive service information.',
      tech: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Vercel'],
      category: 'recent-post',
      highlights: [
        'Modern responsive design',
        'Interactive UI components',
        'Service showcase',
        'Contact and consultation booking'
      ]
    },
    {
      name: 'Clear-Desk-Ten',
      url: 'https://Clear-Desk-Ten.vercel.app',
      description: 'A productivity and workspace organization application. Helps users maintain clean, efficient digital workspaces with smart organization tools.',
      tech: ['Next.js', 'React', 'Vercel', 'TypeScript'],
      category: 'recent-post',
      highlights: [
        'Workspace organization',
        'Productivity tools',
        'Clean UI design',
        'Real-time collaboration'
      ]
    },
    {
      name: 'Gen-H',
      url: 'https://Gen-H.vercel.app',
      description: 'An AI-powered generation platform for creative content. Built with modern web technologies and designed for scalability and performance.',
      tech: ['Next.js', 'AI Integration', 'Vercel', 'TypeScript'],
      category: 'recent-post',
      highlights: [
        'AI-powered content generation',
        'Modern React architecture',
        'Scalable cloud deployment',
        'Responsive design'
      ]
    }
  ]
};

// Gallery entries - using existing images with project-focused captions and links
const galleryEntries = [
  // Tech Deck - Development projects
  {
    id: 'supernova-1',
    src: '/images/gallery/tech-deck/td-1.png',
    alt: 'SuperNova Multi-Agent AI System',
    caption: 'SuperNova: Local-first AI assistant with multi-agent orchestration, 4-type persistent memory, and 3D visualization. Built with Python, FastAPI, and Docker.',
    series: 'tech-deck',
    width: 1344,
    height: 768,
    date: '2025-02-15',
    link: 'https://github.com/Senpai-Sama7/SuperNova',
  },
  {
    id: 'checkplease-1',
    src: '/images/gallery/tech-deck/td-2.png',
    alt: 'check-please Credential Manager',
    caption: 'check-please: AI agent credential management with scoped permissions, 16+ provider support, and MCP server integration for Claude and Copilot.',
    series: 'tech-deck',
    width: 1024,
    height: 1024,
    date: '2025-01-28',
    link: 'https://github.com/Senpai-Sama7/check-please',
  },
  
  // Project Series - Full applications
  {
    id: 'backupiq-1',
    src: '/images/gallery/project/pj-1.png',
    alt: 'BackupIQ Enterprise Backup System',
    caption: 'BackupIQ: Enterprise-grade backup with semantic file organization, AI-powered knowledge graphs, and multi-cloud support. Python, Kubernetes, Neo4j.',
    series: 'project',
    width: 1344,
    height: 768,
    date: '2025-01-20',
    link: 'https://github.com/Senpai-Sama7/BackupIQ',
  },
  {
    id: 'documancer-1',
    src: '/images/gallery/project/pj-2.png',
    alt: 'DocuMancer Document Converter',
    caption: 'DocuMancer: Modern Electron application for document conversion with hardened Python backend. Cross-platform desktop app with secure local processing.',
    series: 'project',
    width: 1344,
    height: 768,
    date: '2024-12-15',
    link: 'https://github.com/Senpai-Sama7/DocuMancer',
  },
  
  // Recent Post - Websites
  {
    id: 'reliantai-1',
    src: '/images/gallery/recent-post/rp-1.png',
    alt: 'ReliantAI.org Website',
    caption: 'ReliantAI.org: Primary business website for software architecture and AI consulting. Next.js, TypeScript, Tailwind CSS, deployed on Vercel.',
    series: 'recent-post',
    width: 1344,
    height: 768,
    date: '2025-03-01',
    link: 'https://ReliantAI.org',
  },
  {
    id: 'cleardesk-1',
    src: '/images/gallery/recent-post/rp-3.png',
    alt: 'Clear-Desk-Ten Productivity App',
    caption: 'Clear-Desk-Ten: Productivity and workspace organization application. Next.js, React, Vercel. Helps users maintain efficient digital workspaces.',
    series: 'recent-post',
    width: 1344,
    height: 768,
    date: '2025-02-10',
    link: 'https://Clear-Desk-Ten.vercel.app',
  },
  {
    id: 'genh-1',
    src: '/images/gallery/recent-post/rp-5.png',
    alt: 'Gen-H AI Generation Platform',
    caption: 'Gen-H: AI-powered generation platform for creative content. Next.js with AI integration, deployed on Vercel for scalability and performance.',
    series: 'recent-post',
    width: 768,
    height: 1344,
    date: '2025-02-01',
    link: 'https://Gen-H.vercel.app',
  },
];

// Journal entries about projects
const journalEntries = [
  {
    title: 'Building SuperNova: A Local-First AI Assistant with Multi-Agent Architecture',
    date: '2025-02-15',
    content: `SuperNova represents a fundamental shift in how we interact with AI — moving from cloud-dependent assistants to fully local, privacy-preserving systems.

The core innovation is the multi-agent orchestration layer. Rather than a single model handling everything, SuperNova distributes tasks across specialized agents: planners that break down complex requests, executors that carry out actions, and critics that validate results. This mirrors how human teams operate, with each member contributing their expertise.

The memory system is equally sophisticated. Most AI assistants have no persistent memory or limited context windows. SuperNova implements four distinct memory types: semantic (facts and concepts), episodic (specific interactions), procedural (how-to knowledge), and working (temporary task state). This allows the system to build genuine understanding over time.

The 3D memory visualization was particularly challenging to implement. Using WebGL and Three.js, we created an interactive space where users can literally explore what the AI knows. Concepts cluster together based on semantic similarity, and users can zoom into specific memory nodes to see their content and relationships.

From a technical standpoint, the stack includes:
- Python/FastAPI for the core API
- Docker for containerization
- Vector databases for semantic search
- WebSockets for real-time communication
- Three.js for 3D visualization

The local-first architecture means all processing happens on the user's machine. No data leaves, no API calls to external services (unless explicitly configured), complete privacy. This required optimizing models to run efficiently on consumer hardware, using quantization and efficient architectures.

What surprised me most was how users engage with the memory visualization. It's not just a debugging tool — people genuinely enjoy exploring their AI's "mind," discovering connections they didn't explicitly teach it.`,
    quote: 'Your AI runs on your machine. Your data stays on your machine. Period.',
    image: '/images/gallery/tech-deck/td-1.png',
    imageAlt: 'SuperNova AI System Architecture',
    tags: ['AI', 'Python', 'Multi-Agent', 'Local-First', 'Privacy']
  },
  {
    title: 'BackupIQ: When Backups Meet Knowledge Graphs',
    date: '2025-01-20',
    content: `Traditional backup solutions treat files as opaque blobs of data. BackupIQ takes a different approach — understanding what you're backing up and how it relates to everything else.

The semantic organization layer uses AI to classify files as they're backed up. A document isn't just "document.pdf" — it's a "2024 tax return, financial, personal, important." This classification feeds into a knowledge graph built with Neo4j, where files connect through shared concepts, projects, and time periods.

This enables powerful queries: "Show me all financial documents from 2024" or "What files are related to Project X?" Traditional backups can't answer these questions without manual tagging.

The enterprise features were driven by real operational needs:
- Circuit breakers prevent cascade failures when a storage backend goes down
- Exponential backoff handles rate limits gracefully
- Resource monitoring ensures backups don't overwhelm the system
- Structured logging with correlation IDs makes debugging tractable

The multi-cloud architecture uses a plugin system. Each provider (iCloud, Google Drive, AWS S3, Azure Blob) implements a common interface, making it straightforward to add new backends. The system can even stripe backups across multiple providers for redundancy.

Testing was extensive — unit tests at 95%+ coverage, integration tests against actual cloud APIs, and chaos engineering to verify resilience. The circuit breaker implementation alone required simulating dozens of failure modes.

The knowledge graph visualization reveals interesting patterns. Users can see how their digital life clusters — work projects in one area, personal photos in another, with occasional bridges (a vacation photo used in a presentation, for instance). It's a map of digital existence.`,
    quote: 'Enterprise-grade reliability meets AI-powered intelligence.',
    image: '/images/gallery/project/pj-1.png',
    imageAlt: 'BackupIQ Knowledge Graph Visualization',
    tags: ['Backup', 'Knowledge Graph', 'Neo4j', 'Enterprise', 'Python']
  },
  {
    title: 'check-please: Securing AI Agent Credentials',
    date: '2025-01-28',
    content: `As AI agents become more capable, they need access to credentials — API keys, tokens, passwords. But giving an agent unrestricted access to your .env file is a security nightmare waiting to happen.

check-please solves this with scoped permissions. Instead of "here's everything," you specify exactly what each agent can access, for how long, and how many times.

The permission system supports:
- Per-credential max uses (e.g., "GITHUB_TOKEN can only be used 10 times")
- Time-based expiry (e.g., "expires in 30 minutes")
- RPM rate limiting (e.g., "max 60 requests per minute")
- Per-agent usage tracking

The interface options surprised me. I built this primarily as a CLI tool, but users wanted more:
- TUI (Terminal User Interface) for interactive management
- Web UI for browser-based workflows
- Desktop app (GTK) for system tray presence
- HTTP API for service integration
- MCP server for Claude/Copilot direct integration

The MCP (Model Context Protocol) integration is particularly powerful. Claude can request credentials directly through the protocol, and check-please handles the approval flow — logging every request, enforcing limits, and revoking access automatically when conditions are met.

Encryption uses PBKDF2 with 200,000 iterations and AES-256-GCM. The vault never stores the master password, only a derived key. Even if someone gains access to the vault file, cracking it would require enormous computational resources.

The 16+ provider support includes all major AI services (OpenAI, Anthropic, Google, Azure) plus infrastructure providers (AWS, GCP, Azure), development platforms (GitHub, GitLab), and communication tools (Slack, Discord).

Alerts integrate with Slack and Discord webhooks, notifying when thresholds are exceeded. This gives security teams visibility into agent behavior without impeding productivity.

The philosophy is simple: agents should have exactly the access they need, for exactly as long as they need it, with full audit trails. No more, no less.`,
    quote: 'Scoped permissions — because "Allow All" is not a security model.',
    image: '/images/gallery/tech-deck/td-2.png',
    imageAlt: 'check-please Credential Management Interface',
    tags: ['Security', 'AI Agents', 'Credentials', 'MCP', 'Encryption']
  },
  {
    title: 'DocuMancer: Document Conversion Meets Desktop UX',
    date: '2024-12-15',
    content: `DocuMancer bridges the gap between powerful document conversion backends and user-friendly desktop applications. The challenge was making complex document processing feel simple.

The architecture separates concerns cleanly:
- Electron frontend handles the UI and system integration
- Python backend performs the heavy lifting of document conversion
- FastAPI provides structured endpoints for conversion operations
- Local-first processing keeps sensitive documents on the user's machine

The conversion pipeline supports dozens of formats: PDF, Word, Excel, PowerPoint, images, markdown, and more. The key insight was that users don't care about formats — they care about "make this document usable in my workflow."

Security was paramount. The Electron preload script carefully exposes only necessary APIs to the renderer, following security best practices. The Python backend runs as a subprocess with limited privileges, and all inter-process communication is validated.

Packaging was an adventure. Electron Builder handles Windows (.exe), macOS (.dmg), and Linux (.AppImage, .deb) from a single configuration. The challenge was bundling the Python runtime and dependencies without bloating the installer to hundreds of megabytes.

The solution uses a hybrid approach:
- Core application in the main package
- Python environment downloaded on first run (if not present)
- Graceful degradation if the backend is unavailable

The UI design emphasizes clarity over features. Users see a simple drop zone, format selection, and progress indication. Advanced options are available but not in the way.

Error handling required particular attention. Document conversion can fail in countless ways — corrupted files, unsupported features, memory limits. Each failure mode needed graceful handling with actionable error messages.

Testing across platforms revealed subtle differences. macOS Gatekeeper, Windows Defender, and Linux permissions each presented unique challenges. Code signing was essential for a smooth user experience on macOS and Windows.

The result is a tool that feels native on every platform while leveraging the best of both JavaScript (UI) and Python (document processing) ecosystems.`,
    quote: 'Complex document processing, simplified.',
    image: '/images/gallery/project/pj-2.png',
    imageAlt: 'DocuMancer Document Converter Interface',
    tags: ['Electron', 'Python', 'Document Processing', 'Desktop App', 'Cross-Platform']
  },
  {
    title: 'The ReliantAI.org Redesign: Lessons in Modern Web Architecture',
    date: '2025-03-01',
    content: `ReliantAI.org serves as the primary digital presence for my software architecture practice. The recent redesign focused on performance, accessibility, and clear communication of complex technical capabilities.

The technical stack reflects modern best practices:
- Next.js 15 with App Router for server-side rendering and static generation
- TypeScript for type safety across the codebase
- Tailwind CSS for utility-first styling
- Framer Motion for sophisticated animations
- Vercel for edge deployment and CDN distribution

Performance was a key metric. The previous site scored 72 on Lighthouse. The new version achieves 98+ across all categories. Critical optimizations included:
- Image optimization with next/image and WebP format
- Code splitting and lazy loading
- Font optimization with next/font
- Minimal JavaScript on initial load

The content strategy shifted from "what I do" to "what you get." Instead of listing technologies, the site focuses on outcomes: faster time-to-market, reduced technical debt, scalable architectures. This resonates better with potential clients who care about results more than implementation details.

The project showcase uses a custom carousel implementation with touch support, keyboard navigation, and reduced-motion preferences. Each project card includes:
- Clear problem statement
- Solution approach
- Technologies used
- Measurable outcomes

SEO/GEO optimization was extensive. Given the research into how AI systems discover and recommend services, the site implements:
- Comprehensive JSON-LD structured data
- FAQ schema for common questions
- Article schema for blog content
- Entity graph with @id references
- llms.txt for AI crawler guidance

The confidence terminal on the About page was an experiment in interactive content. It demonstrates technical capability while providing genuine value — a mini confidence-building game based on principles from my book. Engagement metrics show visitors spend 3x longer on that page than the previous static version.

Accessibility testing revealed several issues in early iterations. Color contrast, keyboard navigation, and screen reader support needed careful attention. The final result passes WCAG 2.1 AA standards.

The deployment pipeline uses GitHub Actions for CI/CD, with automated Lighthouse testing on every pull request. This prevents performance regressions and ensures quality gates are met before production deployment.`,
    quote: 'Technology should amplify human potential, not complicate it.',
    image: '/images/gallery/recent-post/rp-1.png',
    imageAlt: 'ReliantAI.org Website Design',
    tags: ['Next.js', 'Web Design', 'Performance', 'SEO', 'TypeScript']
  },
  {
    title: 'Portfolio as Code: Managing Multiple Web Properties',
    date: '2025-02-20',
    content: `Maintaining multiple web properties — ReliantAI.org, Clear-Desk-Ten, Gen-H, and this portfolio — requires disciplined architecture and reusable patterns. Here's how I approach it.

The monorepo vs. separate repos decision wasn't straightforward. I initially kept everything in one repository, but deployment pipelines became complex and changes to one site risked affecting others. The current approach uses separate repositories with shared component libraries.

The shared library includes:
- UI components (Button, Card, Modal, etc.)
- Animation primitives (Fade, Slide, Stagger)
- Utility functions (date formatting, validation)
- Tailwind configurations
- TypeScript type definitions

Versioning uses semantic-release for automatic changelog generation and version bumping. When a component library updates, dependent projects receive automated PRs via Dependabot.

The deployment strategy varies by project:
- ReliantAI.org: Vercel with static generation, ISR for blog posts
- Clear-Desk-Ten: Vercel with serverless functions for real-time features
- Gen-H: Vercel with Edge Functions for AI API proxying
- This portfolio: Similar to ReliantAI with added API routes for dynamic content

Environment management uses a hierarchy:
- .env.local for machine-specific overrides (never committed)
- .env.development for shared dev settings
- .env.production for production secrets (injected by CI/CD)

Analytics across all properties use Amplitude with custom event tracking. This provides a unified view of user behavior while respecting privacy (GDPR-compliant, no third-party cookies).

The content workflow differs by site:
- ReliantAI.org: Markdown files in Git, processed at build time
- This portfolio: Admin interface for gallery/journal, stored in PostgreSQL
- Clear-Desk-Ten and Gen-H: Hybrid approach with CMS for marketing content, code for features

Monitoring uses a combination of:
- Vercel Analytics for Core Web Vitals
- Sentry for error tracking
- UptimeRobot for availability monitoring
- Custom health check endpoints for API services

The lesson: Consistency in tooling allows diversity in implementation. Shared components don't constrain creativity — they free you to focus on what makes each project unique.`,
    quote: 'Consistency in tooling, diversity in implementation.',
    image: '/images/gallery/recent-post/rp-4.png',
    imageAlt: 'Multiple Web Properties Dashboard',
    tags: ['Web Development', 'DevOps', 'Architecture', 'Vercel', 'TypeScript']
  }
];

async function main() {
  console.log('🌱 Seeding database with project content...\n');

  try {
    // Clear existing gallery and journal entries (optional - comment out if you want to keep existing)
    console.log('Clearing existing content...');
    await prisma.galleryImage.deleteMany({});
    await prisma.journalEntry.deleteMany({});
    await prisma.tag.deleteMany({});
    console.log('✓ Cleared existing content\n');

    // Seed gallery images
    console.log('Seeding gallery images...');
    for (const entry of galleryEntries) {
      await prisma.galleryImage.create({
        data: {
          id: entry.id,
          src: entry.src,
          alt: entry.alt,
          caption: entry.caption,
          series: entry.series as any,
          width: entry.width,
          height: entry.height,
          date: entry.date,
          order: 0,
        },
      });
      console.log(`  ✓ Gallery: ${entry.alt}`);
    }
    console.log(`✓ Seeded ${galleryEntries.length} gallery images\n`);

    // Seed journal entries
    console.log('Seeding journal entries...');
    for (const entry of journalEntries) {
      // Create tags
      const tagRecords = await Promise.all(
        entry.tags.map(async (tagName) => {
          return await prisma.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName },
          });
        })
      );

      // Create journal entry
      await prisma.journalEntry.create({
        data: {
          title: entry.title,
          date: entry.date,
          content: entry.content,
          quote: entry.quote,
          image: entry.image,
          imageAlt: entry.imageAlt,
          order: 0,
          tags: {
            create: tagRecords.map((tag) => ({
              tag: {
                connect: { id: tag.id },
              },
            })),
          },
        },
      });
      console.log(`  ✓ Journal: ${entry.title}`);
    }
    console.log(`✓ Seeded ${journalEntries.length} journal entries\n`);

    console.log('🎉 Seeding complete!');
    console.log('\nSummary:');
    console.log(`  • Gallery images: ${galleryEntries.length}`);
    console.log(`  • Journal entries: ${journalEntries.length}`);
    console.log(`  • Tags created: ${journalEntries.reduce((acc, e) => acc + e.tags.length, 0)}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
