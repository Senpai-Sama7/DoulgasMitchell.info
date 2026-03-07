'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Code, Brain, BookOpen, Award } from 'lucide-react';

const roles = [
  {
    icon: Code,
    title: 'Operations Analyst',
    description: 'Optimizing business processes through data analysis and technology. Passionate about operational efficiency, workflow automation, and data-driven decision making.',
  },
  {
    icon: Brain,
    title: 'AI Professional',
    description: "Google AI & Anthropic certified professional leveraging artificial intelligence to create intelligent, adaptive systems and workflows that amplify human potential.",
  },
  {
    icon: BookOpen,
    title: 'Author',
    description: 'Writer of The Confident Mind, exploring practical paths to authentic confidence through psychology-backed frameworks and actionable exercises.',
  },
  {
    icon: Award,
    title: 'The Architect',
    description: 'Systems thinker building coherent solutions across technology, operations, and human development. 85+ repositories of public proof.',
  },
];

const skills = {
  frontend: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Vue.js'],
  backend: ['Node.js', 'Python', 'PostgreSQL', 'GraphQL', 'REST APIs'],
  cloud: ['AWS', 'Docker', 'CI/CD', 'Git', 'Vercel'],
  ai: ['Google AI', 'LLM Integration', 'System Design', 'Web3'],
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function AboutSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="about" className="section-spacing bg-muted/30">
      <div className="editorial-container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="ascii-marker mb-4 justify-center">
            <span>About</span>
          </div>
          <h2 className="editorial-title mb-4">
            Philosophy & Approach
          </h2>
          <p className="editorial-subtitle max-w-2xl mx-auto">
            I believe in the power of technology to amplify human potential. 
            Whether architecting complex systems, integrating AI capabilities, 
            or writing about personal development, my work centers on creating meaningful impact.
          </p>
        </motion.div>

        {/* Roles Grid */}
        <motion.div
          variants={shouldReduceMotion ? {} : containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
        >
          {roles.map((role) => (
            <motion.div
              key={role.title}
              variants={shouldReduceMotion ? {} : itemVariants}
              className="proof-card group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <role.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{role.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {role.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Technical Expertise */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="border border-border rounded-lg p-6 md:p-8 bg-background"
        >
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-6">
            Technical Expertise
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(skills).map(([category, items]) => (
              <div key={category}>
                <h4 className="text-xs font-medium text-muted-foreground mb-3 capitalize">
                  {category}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((skill) => (
                    <span
                      key={skill}
                      className="px-2 py-1 text-xs bg-muted rounded text-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
