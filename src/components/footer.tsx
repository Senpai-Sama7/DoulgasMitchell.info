"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail } from "lucide-react";
import { socialLinks } from "@/lib/data";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3"
          >
            <h3 className="font-sans text-sm md:text-base font-semibold tracking-[0.12em] uppercase">
              Douglas Mitchell
            </h3>
            <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.2em]">
              Photography & Creative Work
            </span>
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex gap-2"
          >
            <a
              href={socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-accent transition-all duration-300 hover:scale-110"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-accent transition-all duration-300 hover:scale-110"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <Link
              href="/contact"
              className="p-2 rounded-full hover:bg-accent transition-all duration-300 hover:scale-110"
              aria-label="Contact"
            >
              <Mail className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Copyright */}
          <p className="text-[10px] text-muted-foreground font-mono w-full text-center md:w-auto md:text-right">
            © {new Date().getFullYear()} Douglas Mitchell
          </p>
        </div>
      </div>
    </footer>
  );
}
