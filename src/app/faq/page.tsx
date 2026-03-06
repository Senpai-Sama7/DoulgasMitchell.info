import { MainLayout } from "@/components/main-layout";
import { Metadata } from "next";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/animations";
import { HelpCircle, BookOpen, Code, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ | Douglas Mitchell",
  description: "Frequently asked questions about Douglas Mitchell's work as a software architect, AI professional, author of The Confident Mind, and creative portfolio.",
  keywords: ["Douglas Mitchell", "FAQ", "software architect", "AI professional", "The Confident Mind", "photography", "portfolio"],
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "Frequently Asked Questions | Douglas Mitchell",
    description: "Common questions about Douglas Mitchell's work in technology, AI, and creative expression.",
    url: "https://www.douglasmitchell.info/faq",
    type: "website",
  },
};

/**
 * FAQPage Schema for AI Citation Optimization
 * 
 * Best Practices Implemented (per SEO/GEO research):
 * - FAQPage schema provides ~40% higher AI citation rate
 * - Answer-First format: Direct answer in first 50 words
 * - 2-4 sentence paragraphs (60-120 words) for RAG chunking
 * - Content-schema parity: Visible text matches JSON-LD exactly
 * - Grouped by category for better UX and topical authority
 */

interface FAQCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  questions: {
    question: string;
    answer: string;
  }[];
}

const faqCategories: FAQCategory[] = [
  {
    id: "about",
    title: "About Douglas Mitchell",
    icon: <HelpCircle className="w-5 h-5" />,
    questions: [
      {
        question: "Who is Douglas Mitchell?",
        answer: "Douglas Mitchell is a software architect, Google AI certified professional, and author based in the United States. He specializes in building exceptional digital experiences with modern technologies while exploring the intersection of technology and human potential through his photography and writing. Douglas holds a Google AI Professional Certificate and is the author of 'The Confident Mind: A Practical Guide to Authentic Confidence.'"
      },
      {
        question: "What is Douglas Mitchell's professional background?",
        answer: "Douglas Mitchell has extensive experience in software architecture and full-stack development, with expertise in React, Next.js, TypeScript, Python, and cloud technologies. He is Google AI certified with comprehensive training in AI fundamentals, app building, content creation, data analysis, and research methodologies. Douglas combines technical excellence with creative expression through photography and authorship."
      },
      {
        question: "Where is Douglas Mitchell based?",
        answer: "Douglas Mitchell operates from the United States, serving clients and readers globally. His work spans software development, AI consulting, photography, and writing. For specific project inquiries or collaboration opportunities, the best way to connect is through the contact page on this website."
      }
    ]
  },
  {
    id: "technology",
    title: "Technology & AI",
    icon: <Code className="w-5 h-5" />,
    questions: [
      {
        question: "What technologies does Douglas Mitchell specialize in?",
        answer: "Douglas Mitchell specializes in modern web technologies including React, Next.js, TypeScript, Tailwind CSS, Node.js, Python, PostgreSQL, and GraphQL. For cloud and DevOps, he works with AWS, Docker, CI/CD pipelines, and Vercel. In the AI space, Douglas is Google AI certified with expertise in LLM integration, system design, and building intelligent applications."
      },
      {
        question: "Is Douglas Mitchell available for software development projects?",
        answer: "Yes, Douglas Mitchell is open to software architecture and development collaborations. He focuses on projects that leverage modern technologies, AI integration, and thoughtful design. For project inquiries, please use the contact form on this website with details about your project scope, timeline, and requirements. Response time is typically within 48 hours."
      },
      {
        question: "What is Douglas Mitchell's approach to AI integration?",
        answer: "Douglas Mitchell approaches AI integration with a focus on practical, human-centered applications. As a Google AI certified professional, he leverages artificial intelligence to create intelligent, adaptive systems that amplify human potential. His methodology combines technical expertise with deep understanding of user needs, ensuring AI implementations are both powerful and accessible."
      }
    ]
  },
  {
    id: "book",
    title: "The Confident Mind Book",
    icon: <BookOpen className="w-5 h-5" />,
    questions: [
      {
        question: "What is 'The Confident Mind' about?",
        answer: "'The Confident Mind: A Practical Guide to Authentic Confidence' is a book by Douglas Mitchell that provides actionable strategies for building genuine, lasting confidence. Drawing from psychological research and personal experience, the book offers practical exercises and real-world stories to help readers rewire self-doubt, break fear loops, and develop authentic self-belief in work, relationships, and life."
      },
      {
        question: "Where can I buy 'The Confident Mind'?",
        answer: "'The Confident Mind' is available on Amazon in ebook format. You can purchase it directly from Amazon's website. The book is accessible worldwide through Amazon's international marketplaces. For the most current availability and pricing, visit the Amazon link from the About page on this website."
      },
      {
        question: "Who should read 'The Confident Mind'?",
        answer: "'The Confident Mind' is designed for anyone seeking to build authentic, lasting confidence. It is particularly valuable for professionals facing career transitions, individuals struggling with self-doubt, and anyone interested in personal growth. The book combines research-backed strategies with practical exercises, making it accessible to readers at any stage of their confidence journey."
      }
    ]
  },
  {
    id: "creative",
    title: "Photography & Creative Work",
    icon: <Sparkles className="w-5 h-5" />,
    questions: [
      {
        question: "What type of photography does Douglas Mitchell create?",
        answer: "Douglas Mitchell specializes in architecture and light photography, capturing the interplay between built environments and natural illumination. His work explores themes of structure, shadow, and the stories hidden within urban landscapes. The portfolio includes collections organized into Recent Post, Tech Deck, and Project series, each with distinct artistic focus."
      },
      {
        question: "Can I view Douglas Mitchell's photography portfolio?",
        answer: "Yes, Douglas Mitchell's complete photography portfolio is available in the Galleries section of this website. The gallery features curated collections including Recent Post (architecture and light photography), Tech Deck (development workspace photography), and Project (creative project documentation). All images are available for viewing and licensed use inquiries can be submitted through the contact page."
      },
      {
        question: "Does Douglas Mitchell license his photography for commercial use?",
        answer: "Yes, commercial licensing is available for select photographs from Douglas Mitchell's portfolio. For licensing inquiries, please use the contact form with specific details about the image(s) you're interested in, intended use, duration, and distribution. Response time for licensing requests is typically 2-3 business days."
      }
    ]
  }
];

// Generate FAQPage Schema for AI Citation Optimization
function generateFAQSchema() {
  const allQuestions = faqCategories.flatMap(cat => cat.questions);
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://www.douglasmitchell.info/faq#faqpage",
    "mainEntity": allQuestions.map((faq, index) => ({
      "@type": "Question",
      "@id": `https://www.douglasmitchell.info/faq#question-${index + 1}`,
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "@id": `https://www.douglasmitchell.info/faq#answer-${index + 1}`,
        "text": faq.answer
      }
    }))
  };
}

// Additional structured data for the page
function generateWebPageSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://www.douglasmitchell.info/faq#webpage",
        "url": "https://www.douglasmitchell.info/faq",
        "name": "Frequently Asked Questions | Douglas Mitchell",
        "description": "Frequently asked questions about Douglas Mitchell's work as a software architect, AI professional, and author.",
        "isPartOf": {
          "@id": "https://www.douglasmitchell.info/#website"
        },
        "about": {
          "@id": "https://www.douglasmitchell.info/#organization"
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://www.douglasmitchell.info/faq#breadcrumb",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.douglasmitchell.info/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "FAQ",
            "item": "https://www.douglasmitchell.info/faq"
          }
        ]
      }
    ]
  };
}

export default function FAQPage() {
  const faqSchema = generateFAQSchema();
  const webPageSchema = generateWebPageSchema();

  return (
    <MainLayout>
      {/* Schema Markup for SEO/GEO Optimization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />

      <div className="min-h-screen py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Header Section */}
          <ScrollReveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                <HelpCircle className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground tracking-wide">HELP CENTER</span>
              </div>
              
              <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">
                Frequently Asked Questions
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Common questions about Douglas Mitchell&apos;s work in software architecture, 
                AI, photography, and authorship.
              </p>
            </div>
          </ScrollReveal>

          {/* FAQ Categories */}
          <StaggerContainer staggerDelay={0.1}>
            {faqCategories.map((category) => (
              <StaggerItem key={category.id}>
                <section className="mb-12 last:mb-0">
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      {category.icon}
                    </div>
                    <h2 className="font-serif text-xl md:text-2xl font-semibold">
                      {category.title}
                    </h2>
                  </div>

                  {/* Questions Grid */}
                  <div className="space-y-4">
                    {category.questions.map((faq, index) => (
                      <div 
                        key={index}
                        className="glass-card p-6 hover:bg-accent/5 transition-colors group"
                      >
                        <h3 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors">
                          {faq.question}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Contact CTA */}
          <ScrollReveal>
            <div className="mt-16 glass-card p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10 text-center">
                <h2 className="font-serif text-2xl font-bold mb-3">
                  Still Have Questions?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                  Can&apos;t find what you&apos;re looking for? Feel free to reach out directly. 
                  I try to respond to all inquiries personally within 48 hours.
                </p>
                <a 
                  href="/contact" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Get in Touch
                </a>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </MainLayout>
  );
}
