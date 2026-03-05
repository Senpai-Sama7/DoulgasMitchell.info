"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useMotionValue, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUp, Camera, Code, Palette, Sparkles, Zap, Eye, TrendingUp, ChevronDown, Star, Heart } from "lucide-react";
import { MainLayout } from "@/components/main-layout";
import { heroImage, galleryImages } from "@/lib/data";
import { Reactions } from "@/components/reactions";
import { ScrollReveal, Magnetic, StaggerContainer, StaggerItem } from "@/components/animations";
import { TitleVisualization } from "@/components/title-visualization";
import { EntranceOverlay } from "@/components/entrance-overlay";

// Typing animation component
function TypingAnimation({ text, delay = 0, speed = 80 }: { text: string; delay?: number; speed?: number }) {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let charIndex = 0;

    const startTyping = () => {
      timeout = setInterval(() => {
        if (charIndex < text.length) {
          setDisplayText(text.slice(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(timeout);
          setIsComplete(true);
        }
      }, speed);
    };

    const delayTimeout = setTimeout(startTyping, delay);

    return () => {
      clearTimeout(delayTimeout);
      clearInterval(timeout);
    };
  }, [text, delay, speed]);

  return (
    <span>
      {displayText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="inline-block w-0.5 h-5 ml-0.5 bg-primary/80 align-middle"
        />
      )}
    </span>
  );
}

// Mouse spotlight effect
function MouseSpotlight() {
  const spotlightX = useMotionValue(0);
  const spotlightY = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      spotlightX.set(e.clientX - rect.left);
      spotlightY.set(e.clientY - rect.top);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [spotlightX, spotlightY]);

  return (
    <motion.div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{
        background: `radial-gradient(circle 300px at var(--x, 50%) var(--y, 50%), rgba(217, 119, 6, 0.08), transparent)`,
      } as React.CSSProperties}
    >
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          x: spotlightX,
          y: spotlightY,
          translateX: "-50%",
          translateY: "-50%",
          background: "radial-gradient(circle, rgba(217, 119, 6, 0.05) 0%, transparent 70%)",
        }}
      />
    </motion.div>
  );
}

// Scroll to explore indicator
function ScrollIndicator() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY < 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-white/60 font-mono tracking-widest">SCROLL TO EXPLORE</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="flex flex-col items-center"
          >
            <ChevronDown className="w-4 h-4 text-primary/60" />
            <ChevronDown className="w-4 h-4 text-primary/40 -mt-2" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Back to top button
function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full glass-card flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow group"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowUp className="w-5 h-5 text-primary group-hover:-translate-y-0.5 transition-transform" />
          <span className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// Floating decorative elements
function FloatingDecorations() {
  const decorations = [
    { icon: Star, delay: 0, x: "10%", y: "20%", size: "sm" },
    { icon: Heart, delay: 0.5, x: "85%", y: "15%", size: "md" },
    { icon: Sparkles, delay: 1, x: "5%", y: "70%", size: "lg" },
    { icon: Zap, delay: 1.5, x: "90%", y: "65%", size: "sm" },
    { icon: Star, delay: 2, x: "15%", y: "85%", size: "md" },
    { icon: Heart, delay: 2.5, x: "80%", y: "85%", size: "sm" },
  ];

  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <>
      {decorations.map((dec, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.4, scale: 1 }}
          transition={{ delay: dec.delay + 0.5, duration: 0.5 }}
          className="absolute pointer-events-none"
          style={{ left: dec.x, top: dec.y }}
        >
          <motion.div
            animate={{
              y: [0, -15, 0],
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 4 + i * 0.5,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          >
            <dec.icon className={`${sizeMap[dec.size]} text-primary/60`} />
          </motion.div>
        </motion.div>
      ))}
    </>
  );
}

// Gallery item with hover effects
interface GalleryItemProps {
  image: {
    id: string;
    src: string;
    alt: string;
  };
  index: number;
  isLarge?: boolean;
  viewCount?: number;
  isPopular?: boolean;
}

function GalleryItem({ image, index, isLarge, viewCount, isPopular }: GalleryItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href="/galleries"
      className={`relative overflow-hidden rounded-lg cursor-pointer group block ${
        isLarge ? "col-span-2 row-span-2 aspect-[4/3]" : "aspect-square"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        animate={{ scale: isHovered ? 1.08 : 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
      </motion.div>

      {/* View count badge */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 10 }}
        transition={{ duration: 0.3 }}
        className="absolute top-2 right-2 z-20 flex items-center gap-1 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm"
      >
        <Eye className="w-3 h-3 text-white/80" />
        <span className="text-xs text-white/80 font-mono">{viewCount}</span>
      </motion.div>

      {/* Popular badge */}
      {isPopular && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="absolute top-2 left-2 z-20 flex items-center gap-1 px-2 py-1 rounded-full bg-primary/80 backdrop-blur-sm"
        >
          <TrendingUp className="w-3 h-3 text-white" />
          <span className="text-xs text-white font-medium">Popular</span>
        </motion.div>
      )}

      {/* Hover overlay with title */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="p-3"
        >
          <h4 className="text-white text-sm font-medium mb-1">{image.alt}</h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60">View in gallery</span>
            <ArrowRight className="w-3 h-3 text-primary" />
          </div>
        </motion.div>
      </motion.div>

      {/* Corner accent */}
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: isHovered ? 1 : 0, rotate: isHovered ? 0 : -45 }}
        transition={{ duration: 0.3 }}
        className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-primary/80 flex items-center justify-center"
      >
        <ArrowRight className="w-3 h-3 text-white" />
      </motion.div>
    </Link>
  );
}

export default function HomePage() {
  const [showContent, setShowContent] = useState(() => {
    // Check if intro was already seen
    if (typeof window !== 'undefined') {
      return localStorage.getItem("senpai-intro-seen") === "true";
    }
    return false;
  });
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.1]);

  // Get featured images for preview with mock view counts
  const featuredImages = galleryImages.slice(0, 6).map((img, idx) => ({
    ...img,
    viewCount: Math.floor(Math.random() * 500) + 100,
    isPopular: idx === 0 || idx === 2,
  }));

  const handleIntroComplete = () => {
    setShowContent(true);
  };

  return (
    <>
      {/* Entrance Overlay */}
      <EntranceOverlay onComplete={handleIntroComplete} />

      {/* Main Content */}
      <MainLayout>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
            {/* Centered Title with Visualization Background */}
            <div className="relative min-h-[280px] md:min-h-[320px] lg:min-h-[360px] flex items-center justify-center mb-4 md:mb-6">
              {/* Full-width Visualization Background */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: showContent ? 1 : 0, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 rounded-xl overflow-hidden glass-card"
              >
                <TitleVisualization />
                <MouseSpotlight />
              </motion.div>

              {/* Floating Decorations */}
              <FloatingDecorations />

              {/* Centered Title Content */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: showContent ? 1 : 0, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative z-10 text-center"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card mb-3"
                >
                  <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                  <span className="font-mono text-xs text-muted-foreground tracking-wider">
                    WELCOME TO
                  </span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <span className="block text-5xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-white drop-shadow-lg" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
                    Senpai&apos;s
                  </span>
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="block text-5xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-primary/90 drop-shadow-lg"
                    style={{ textShadow: "0 2px 20px rgba(0,0,0,0.2)" }}
                  >
                    Isekai
                  </motion.span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-3 text-lg md:text-xl text-white/80 font-light tracking-wider"
                >
                  <TypingAnimation text="Open-Source Humanity" delay={600} speed={70} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-2 font-handwritten text-2xl md:text-3xl text-white/60"
                >
                  ~ Thee Strongest ~
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-wrap justify-center gap-3 mt-6"
                >
                  <Magnetic>
                    <Link
                      href="/galleries"
                      className="btn-premium flex items-center gap-2 text-sm py-2.5 px-5"
                    >
                      Explore Gallery
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Magnetic>
                  <Magnetic>
                    <Link
                      href="/journal"
                      className="px-5 py-2.5 rounded-lg border border-white/30 hover:bg-white/10 transition-colors duration-300 text-sm text-white/80 hover:text-white"
                    >
                      Read Journal
                    </Link>
                  </Magnetic>
                </motion.div>
              </motion.div>

              {/* Floating accent elements */}
              <motion.div
                animate={{ y: [0, -6, 0], rotate: [0, 3, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute top-4 right-4 w-10 h-10 rounded-lg glass-card flex items-center justify-center"
              >
                <Zap className="w-5 h-5 text-primary" />
              </motion.div>

              <motion.div
                animate={{ y: [0, 6, 0], rotate: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-4 left-4 w-8 h-8 rounded-full glass-card flex items-center justify-center"
              >
                <Sparkles className="w-4 h-4 text-primary" />
              </motion.div>
            </div>

            {/* Featured Photo with Parallax */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: showContent ? 1 : 0, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
              className="relative aspect-[21/9] md:aspect-[21/8] rounded-xl overflow-hidden shadow-lg"
            >
              <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0">
                <Image
                  src={heroImage.src}
                  alt={heroImage.alt}
                  fill
                  className="object-cover"
                  priority
                  sizes="100vw"
                />
              </motion.div>

              {/* Glassmorphism Caption */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent"
              >
                <p className="text-white/90 text-sm">
                  {heroImage.caption}
                </p>
              </motion.div>

              {/* Scroll Indicator */}
              <ScrollIndicator />
            </motion.div>
          </div>
        </section>

        {/* Quick Navigation Cards */}
        <section className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-3" staggerDelay={0.1}>
            <StaggerItem>
              <Link href="/galleries" className="group block h-full">
                <motion.div
                  whileHover={{ y: -3, boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}
                  className="glass-card p-3.5 h-full relative overflow-hidden"
                >
                  <div className="flex items-start gap-2.5">
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0"
                    >
                      <Camera className="w-4.5 h-4.5" />
                    </motion.div>
                    <div>
                      <h3 className="font-serif text-base font-semibold mb-0.5 group-hover:text-primary transition-colors">
                        Recent Post
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        Architecture and light photography
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </StaggerItem>

            <StaggerItem>
              <Link href="/galleries?series=tech-deck" className="group block h-full">
                <motion.div
                  whileHover={{ y: -3, boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}
                  className="glass-card p-3.5 h-full relative overflow-hidden"
                >
                  <div className="flex items-start gap-2.5">
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0"
                    >
                      <Code className="w-4.5 h-4.5" />
                    </motion.div>
                    <div>
                      <h3 className="font-serif text-base font-semibold mb-0.5 group-hover:text-primary transition-colors">
                        Tech Deck
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        Development workspace photography
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </StaggerItem>

            <StaggerItem>
              <Link href="/galleries?series=project" className="group block h-full">
                <motion.div
                  whileHover={{ y: -3, boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}
                  className="glass-card p-3.5 h-full relative overflow-hidden"
                >
                  <div className="flex items-start gap-2.5">
                    <motion.div
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0"
                    >
                      <Palette className="w-4.5 h-4.5" />
                    </motion.div>
                    <div>
                      <h3 className="font-serif text-base font-semibold mb-0.5 group-hover:text-primary transition-colors">
                        Project
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        Creative project documentation
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </StaggerItem>
          </StaggerContainer>
        </section>

        {/* Featured Gallery Preview */}
        <section className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <ScrollReveal>
            <div className="flex items-center justify-between mb-4">
              <div>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="font-serif text-xl md:text-2xl"
                >
                  Featured Works
                </motion.h2>
              </div>
              <Link
                href="/galleries"
                className="text-primary hover:underline text-xs flex items-center gap-1 group"
              >
                View All 
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>

          {/* Compact Grid with Enhanced Items */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
            {featuredImages.map((image, index) => (
              <ScrollReveal
                key={image.id}
                delay={index * 0.08}
                direction={index % 2 === 0 ? "up" : "scale"}
              >
                <GalleryItem
                  image={image}
                  index={index}
                  isLarge={index === 0}
                  viewCount={image.viewCount}
                  isPopular={image.isPopular}
                />
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Quote & CTA Combined */}
        <section className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-3" staggerDelay={0.15}>
            <StaggerItem>
              <div className="glass-card p-4 relative overflow-hidden group">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 0.1 }}
                  viewport={{ once: true }}
                  className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-primary/20 blur-2xl"
                />
                <blockquote className="font-handwritten text-lg md:text-xl text-muted-foreground leading-relaxed relative z-10">
                  &ldquo;In the interplay of light and shadow, I find the stories waiting to be told.&rdquo;
                </blockquote>
                <div className="mt-3">
                  <Reactions itemId="home-quote" />
                </div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="glass-card p-4 flex flex-col justify-center relative overflow-hidden">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 0.1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-primary/20 blur-2xl"
                />
                <h3 className="font-serif text-lg mb-1 relative z-10">Let&apos;s Connect</h3>
                <p className="text-xs text-muted-foreground mb-3 relative z-10">
                  Have a project in mind? I&apos;d love to hear from you.
                </p>
                <Magnetic>
                  <Link
                    href="/contact"
                    className="btn-premium inline-flex items-center gap-2 w-fit text-xs py-2 relative z-10"
                  >
                    Get in Touch
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Magnetic>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </section>
      </MainLayout>

      {/* Back to Top Button */}
      <BackToTop />
    </>
  );
}
