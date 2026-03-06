import { MainLayout } from "@/components/main-layout";
import { Metadata } from "next";
import Image from "next/image";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/animations";
import { ConfidenceTerminal } from "@/components/confidence-terminal";
import { 
  Code, 
  BookOpen, 
  Award, 
  Sparkles, 
  Lightbulb, 
  ExternalLink,
  Github,
  Linkedin
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Douglas Mitchell | Software Architect & Author",
  description: "Software architect, Google AI certified professional, and author of 'The Confident Mind'. Exploring the intersection of technology and human potential.",
};

const skills = [
  { category: "Frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Vue.js"] },
  { category: "Backend", items: ["Node.js", "Python", "PostgreSQL", "GraphQL", "REST APIs"] },
  { category: "Cloud & DevOps", items: ["AWS", "Docker", "CI/CD", "Git", "Vercel"] },
  { category: "AI & Emerging", items: ["Google AI", "LLM Integration", "System Design", "Web3"] },
];

const certifications = [
  {
    name: "Google AI Professional Certificate",
    image: "/images/certs/google-ai-professional-certificate.png",
    description: "Comprehensive AI professional certification",
    featured: true,
  },
  {
    name: "AI Fundamentals",
    image: "/images/certs/ai-fundamentals.png",
    description: "Core AI concepts and applications",
  },
  {
    name: "AI for App Building",
    image: "/images/certs/ai-for-app-building.png",
    description: "Building intelligent applications",
  },
  {
    name: "AI for Content Creation",
    image: "/images/certs/ai-for-content-creation.png",
    description: "Creative AI workflows",
  },
  {
    name: "AI for Data Analysis",
    image: "/images/certs/ai-for-data-analysis.png",
    description: "Data-driven decision making",
  },
  {
    name: "AI for Research",
    image: "/images/certs/ai-for-research-and-insights.png",
    description: "Research and insights with AI",
  },
  {
    name: "AI for Writing",
    image: "/images/certs/ai-for-writing-and-communicating.png",
    description: "Enhanced communication",
  },
  {
    name: "AI for Brainstorming",
    image: "/images/certs/ai-for-brainstorming-and-planning.png",
    description: "Strategic planning with AI",
  },
];

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="min-h-screen py-16 md:py-24 px-4">
        <div className="max-w-5xl mx-auto">
          
          {/* Hero Section */}
          <ScrollReveal>
            <div className="text-center mb-16 md:mb-24">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground tracking-wide">ABOUT</span>
              </div>
              
              <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
                Douglas Mitchell
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Software Architect, AI Practitioner, and Author crafting digital experiences 
                at the intersection of technology and human potential.
              </p>
            </div>
          </ScrollReveal>

          {/* Core Identity Cards */}
          <StaggerContainer className="grid md:grid-cols-3 gap-4 mb-20" staggerDelay={0.1}>
            <StaggerItem>
              <div className="glass-card p-6 h-full group hover:bg-accent/5 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Code className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif text-lg font-semibold mb-2">Software Architect</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Building exceptional digital experiences with modern technologies. 
                  Passionate about clean code, thoughtful design, and scalable solutions.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="glass-card p-6 h-full group hover:bg-accent/5 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Lightbulb className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif text-lg font-semibold mb-2">AI Professional</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Google AI certified professional leveraging artificial intelligence 
                  to create intelligent, adaptive systems and workflows.
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="glass-card p-6 h-full group hover:bg-accent/5 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif text-lg font-semibold mb-2">Author</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Writer of <em>The Confident Mind</em>, exploring practical paths to 
                  authentic confidence and personal growth.
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>

          {/* Bio & Interactive Terminal Section */}
          <ScrollReveal>
            <div className="grid lg:grid-cols-2 gap-12 mb-20 items-start">
              {/* Bio */}
              <div className="space-y-6">
                <h2 className="font-serif text-2xl md:text-3xl font-bold">Philosophy & Approach</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    I believe in the power of technology to amplify human potential. 
                    Whether architecting complex systems, integrating AI capabilities, 
                    or writing about personal development, my work centers on creating 
                    meaningful impact.
                  </p>
                  <p>
                    With a foundation in software engineering and a certification in 
                    Google AI technologies, I bridge the gap between cutting-edge 
                    technology and practical application.
                  </p>
                  <p>
                    As an author, I explore the internal landscape of confidence and 
                    growth, bringing the same analytical rigor from my technical work 
                    to understanding human behavior and potential.
                  </p>
                </div>

                <div className="pt-4">
                  <h3 className="text-sm font-medium text-primary mb-3">Technical Expertise</h3>
                  <div className="space-y-3">
                    {skills.map((skillGroup) => (
                      <div key={skillGroup.category}>
                        <span className="text-xs text-muted-foreground">{skillGroup.category}</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {skillGroup.items.map((skill) => (
                            <span 
                              key={skill}
                              className="px-2 py-0.5 text-xs rounded-full bg-accent/10 text-muted-foreground"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interactive Confidence Terminal */}
              <div className="lg:sticky lg:top-24">
                <div className="mb-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs mb-2">
                    <Award className="w-3 h-3" />
                    Featured: The Confident Mind
                  </div>
                  <h3 className="font-serif text-xl font-semibold">Interactive Confidence Terminal</h3>
                  <p className="text-sm text-muted-foreground">
                    Based on principles from my book — build confidence through small wins
                  </p>
                </div>
                <ConfidenceTerminal />
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    A Practical Guide to Authentic Confidence
                  </p>
                  <a 
                    href="https://www.amazon.com/Confident-Mind-Practical-Authentic-Confidence-ebook/dp/B0FPJPPPC9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-primary hover:underline text-xs"
                  >
                    View on Amazon
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Certifications - Subtle Grid */}
          <ScrollReveal>
            <div className="mb-8">
              <h2 className="font-serif text-2xl md:text-3xl font-bold mb-2">Certifications</h2>
              <p className="text-muted-foreground">
                Continuous learning in emerging technologies
              </p>
            </div>
          </ScrollReveal>

          {/* Featured Certificate */}
          <ScrollReveal>
            <div className="glass-card p-6 md:p-8 mb-6 flex flex-col md:flex-row items-center gap-6">
              <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
                <Image
                  src={certifications[0].image}
                  alt={certifications[0].name}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs mb-2">
                  <Award className="w-3 h-3" />
                  Professional Certification
                </div>
                <h3 className="font-serif text-xl font-semibold mb-1">{certifications[0].name}</h3>
                <p className="text-sm text-muted-foreground">{certifications[0].description}</p>
              </div>
            </div>
          </ScrollReveal>

          {/* Course Certificates - Compact Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {certifications.slice(1).map((cert, index) => (
              <ScrollReveal key={cert.name} delay={index * 0.05}>
                <div className="glass-card p-4 group">
                  <div className="relative w-full aspect-square mb-3">
                    <Image
                      src={cert.image}
                      alt={cert.name}
                      fill
                      className="object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <h4 className="text-xs font-medium text-center line-clamp-1">{cert.name}</h4>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Connect Links */}
          <ScrollReveal>
            <div className="mt-20 pt-12 border-t border-border">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="font-serif text-xl font-semibold mb-1">Let&apos;s Connect</h3>
                  <p className="text-sm text-muted-foreground">
                    Open to collaborations and interesting projects
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <a 
                    href="https://github.com/Senpai-Sama7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card hover:bg-accent/10 transition-colors text-sm"
                  >
                    <Github className="w-4 h-4" />
                    GitHub
                  </a>
                  <a 
                    href="https://www.linkedin.com/in/douglas-mitchell-the-architect/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card hover:bg-accent/10 transition-colors text-sm"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </MainLayout>
  );
}
