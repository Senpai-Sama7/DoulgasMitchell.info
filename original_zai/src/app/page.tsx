"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Camera, Code, Palette, Sparkles, Zap } from "lucide-react";
import { MainLayout } from "@/components/main-layout";
import { heroImage, galleryImages } from "@/lib/data";
import { Reactions } from "@/components/reactions";
import { ScrollReveal, Magnetic, StaggerContainer, StaggerItem } from "@/components/animations";
import { TitleVisualization } from "@/components/title-visualization";
import { EntranceOverlay } from "@/components/entrance-overlay";

export default function HomePage() {
  const [showContent, setShowContent] = useState(false);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Get featured images for preview
  const featuredImages = galleryImages.slice(0, 6);

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
              </motion.div>

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

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-3 text-lg md:text-xl text-white/80 font-light tracking-wider"
                >
                  Open-Source Humanity
                </motion.p>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-2 font-handwritten text-2xl md:text-3xl text-white/60"
                >
                  ~ Thee Strongest ~
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
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

            {/* Featured Photo */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: showContent ? 1 : 0, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
              className="relative aspect-[21/9] md:aspect-[21/8] rounded-xl overflow-hidden shadow-lg"
            >
              <Image
                src={heroImage.src}
                alt={heroImage.alt}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />

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
            </motion.div>
          </div>
        </section>

        {/* Quick Navigation Cards */}
        <section className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <StaggerItem>
              <Link href="/galleries" className="group block h-full">
                <motion.div
                  whileHover={{ y: -3 }}
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
                  whileHover={{ y: -3 }}
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
                  whileHover={{ y: -3 }}
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
                <h2 className="font-serif text-xl md:text-2xl">Featured Works</h2>
              </div>
              <Link
                href="/galleries"
                className="text-primary hover:underline text-xs flex items-center gap-1"
              >
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </ScrollReveal>

          {/* Compact Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
            {featuredImages.map((image, index) => (
              <ScrollReveal
                key={image.id}
                delay={index * 0.03}
                direction={index % 2 === 0 ? "up" : "scale"}
              >
                <Link
                  href={`/galleries`}
                  className={`relative overflow-hidden rounded-lg cursor-pointer group block ${
                    index === 0 ? "col-span-2 row-span-2 aspect-[4/3]" : "aspect-square"
                  }`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end"
                  >
                    <div className="p-2">
                      <p className="text-white text-xs font-medium">{image.alt}</p>
                    </div>
                  </motion.div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Quote & CTA Combined */}
        <section className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Quote */}
            <ScrollReveal>
              <div className="glass-card p-4 relative overflow-hidden">
                <blockquote className="font-handwritten text-lg md:text-xl text-muted-foreground leading-relaxed">
                  &ldquo;In the interplay of light and shadow, I find the stories waiting to be told.&rdquo;
                </blockquote>
                <div className="mt-3">
                  <Reactions itemId="home-quote" />
                </div>
              </div>
            </ScrollReveal>

            {/* CTA */}
            <ScrollReveal delay={0.05}>
              <div className="glass-card p-4 flex flex-col justify-center">
                <h3 className="font-serif text-lg mb-1">Let&apos;s Connect</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  Have a project in mind? I&apos;d love to hear from you.
                </p>
                <Magnetic>
                  <Link
                    href="/contact"
                    className="btn-premium inline-flex items-center gap-2 w-fit text-xs py-2"
                  >
                    Get in Touch
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Magnetic>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </MainLayout>
    </>
  );
}
