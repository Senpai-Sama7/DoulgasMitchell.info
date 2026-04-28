'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Code, Brain, BookOpen, Award, Zap, Target, Users, Rocket, ArrowRight, Sparkles } from 'lucide-react';
import { aboutRoles, expertiseByCategory, operatingPrinciples, bookShowcase } from '@/lib/site-content';

const roles = [
  { icon: Code, ...aboutRoles[0] },
  { icon: Brain, ...aboutRoles[1] },
  { icon: BookOpen, ...aboutRoles[2] },
  { icon: Award, ...aboutRoles[3] },
];

const values = [
  { icon: Target, label: 'Precision' },
  { icon: Zap, label: 'Efficiency' },
  { icon: Users, label: 'Human-Centric' },
  { icon: Rocket, label: 'Innovation' },
];

export function EnhancedAboutSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();
  
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.setAttribute('muted', '');
      videoRef.current.setAttribute('playsinline', '');
      videoRef.current.play().catch(err => {
        console.warn("Video autoplay failed:", err);
      });
    }
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.5, 1, 1, 0.5]);

  return (
    <section id="about" className="section-spacing bg-muted/30 relative overflow-hidden" ref={containerRef}>
      {/* Animated Background */}
      <motion.div 
        style={{ y: prefersReducedMotion ? 0 : y, opacity }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      </motion.div>

      <div className="editorial-container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-xs text-muted-foreground">{'// 01'}</span>
            <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
          </div>
          
          {/* ASCII Art Header */}
          <div className="mb-8 hidden md:block">
            <pre className="font-mono text-[10px] text-muted-foreground/40">
{`╭────────────────────────────────────────────────────────────────────────────╮
│                                                                            │
│    "Technology is best when it brings people together." — Matt Mullenweg   │
│                                                                            │
╰────────────────────────────────────────────────────────────────────────────╯`}
            </pre>
          </div>

          <h2 className="editorial-title mb-4">
            Philosophy & Approach
          </h2>
          <p className="editorial-subtitle max-w-2xl">
            I believe in the power of technology to amplify human potential. 
              Whether architecting complex systems, integrating AI capabilities,
              or writing about personal development, my work centers on creating meaningful impact.
          </p>
        </motion.div>

        {/* Video & Info & Book Trio */}
        <div className="grid lg:grid-cols-[240px_1fr_240px] gap-4 md:gap-8 mb-16 items-center">
          {/* Column 1: Video (Left) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="relative w-full aspect-[464/688] rounded-2xl overflow-hidden border border-border bg-black shadow-2xl">
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                poster="/media/dougie-frame-poster.webp"
                className="w-full h-full object-cover"
                // @ts-expect-error — fetchPriority not in video element types
                fetchPriority="high"
              >
                <source src="/media/dougie-loop-v2.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10" />
            </div>
          </motion.div>

          {/* Column 2: Book Info (Center) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex flex-col justify-center"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-mono text-sm text-muted-foreground uppercase tracking-widest">Featured Publication</span>
              </div>
              
              <h2 className="editorial-title leading-tight text-3xl">
                {bookShowcase.title}
              </h2>

              <p className="text-lg text-muted-foreground italic">
                {bookShowcase.subtitle}
              </p>

              <p className="text-muted-foreground leading-relaxed">
                {bookShowcase.description}
              </p>

              <div className="space-y-3">
                {bookShowcase.highlights.slice(0, 3).map((highlight, i) => (
                  <motion.div
                    key={highlight}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className="text-primary font-mono">◆</span>
                    <span className="text-muted-foreground">{highlight}</span>
                  </motion.div>
                ))}
              </div>

              <motion.a
                href={bookShowcase.amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-button group self-start"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <BookOpen className="h-4 w-4" />
                Learn More
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </motion.a>
            </div>
          </motion.div>

          {/* Column 3: Book Cover (Right) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-border group">
              <img 
                src="/images/the-confident-mind.jpg" 
                alt="The Confident Mind Book Cover"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </div>

        {/* Values Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center gap-8 mb-16"
        >
          {values.map((value, index) => (
            <motion.div
              key={value.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.1 }}
              className="flex flex-col items-center gap-2 group cursor-default"
            >
              <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
                <value.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="font-mono text-xs text-muted-foreground">{value.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Roles Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
        >
          {roles.map((role, index) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative proof-card bg-background"
            >
              {/* Corner Decoration */}
              <div className="absolute top-2 right-2 font-mono text-xs text-muted-foreground/30 group-hover:text-primary/50 transition-colors">
                [{String(index + 1).padStart(2, '0')}]
              </div>

              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                <role.icon className="h-6 w-6 text-primary" />
              </div>
              
              <h3 className="font-semibold mb-2">{role.title}</h3>
              
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {role.description}
              </p>
              
              <div className="font-mono text-xs text-primary/70 border-t border-border pt-3">
                {role.stats}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-16 grid gap-4 lg:grid-cols-3"
        >
          {operatingPrinciples.map((principle, index) => (
            <motion.div
              key={principle.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * index }}
              className="rounded-2xl border border-border bg-background p-5"
            >
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                {principle.title}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {principle.description}
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
          className="border border-border rounded-xl overflow-hidden bg-background"
        >
          {/* Terminal Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            </div>
            <span className="font-mono text-xs text-muted-foreground ml-2">
              technical_expertise.json
            </span>
          </div>

          {/* Skills Grid */}
          <div className="p-6 md:p-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {Object.entries(expertiseByCategory).map(([category, items], catIndex) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: catIndex * 0.1 }}
                >
                  <div className="font-mono text-xs text-muted-foreground mb-3 flex items-center gap-2">
                    <span className="text-primary">{`"${category}"`}</span>
                    <span>:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((skill, skillIndex) => (
                      <motion.span
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: catIndex * 0.1 + skillIndex * 0.05 }}
                        onHoverStart={() => setActiveSkill(skill)}
                        onHoverEnd={() => setActiveSkill(null)}
                        className={`px-3 py-1.5 text-xs font-mono rounded-lg cursor-default transition-all ${
                          activeSkill === skill 
                            ? 'bg-primary text-primary-foreground scale-105' 
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ASCII Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <pre className="font-mono text-[10px] text-muted-foreground/30 inline-block">
{`┌─────────────────────────────────────────┐
│  Continuous learning in emerging tech   │
│         ~ Always exploring ~            │
└─────────────────────────────────────────┘`}
          </pre>
        </motion.div>
      </div>
    </section>
  );
}
