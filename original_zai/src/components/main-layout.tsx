"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Navigation } from "./navigation";
import { Footer } from "./footer";
import { ReadingProgress } from "./reading-progress";
import { ParticleField } from "./particles";
import { CustomCursor } from "./cursor";

interface MainLayoutProps {
  children: ReactNode;
  showParticles?: boolean;
  showCustomCursor?: boolean;
}

export function MainLayout({ 
  children, 
  showParticles = true, 
  showCustomCursor = true 
}: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Effects */}
      {showParticles && <ParticleField />}
      {showCustomCursor && <CustomCursor />}
      
      {/* Reading Progress */}
      <ReadingProgress />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 pt-20 pb-4 relative z-10"
      >
        {children}
      </motion.main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
