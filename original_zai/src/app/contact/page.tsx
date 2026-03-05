"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle, AlertCircle, Clock, MessageSquare } from "lucide-react";
import { MainLayout } from "@/components/main-layout";
import { useState } from "react";
import { useContactStore } from "@/lib/store";
import { socialLinks, availableTimeSlots } from "@/lib/data";
import { cn } from "@/lib/utils";

interface FormData {
  name: string;
  email: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  notes?: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { drafts, addDraft } = useContactStore();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email";
    }

    if (!formData.notes.trim()) {
      newErrors.notes = "Required";
    } else if (formData.notes.trim().length < 10) {
      newErrors.notes = "Min 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    addDraft(formData);
    setIsSuccess(true);
    setIsSubmitting(false);

    setTimeout(() => {
      setFormData({ name: "", email: "", notes: "" });
      setIsSuccess(false);
    }, 2500);
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const recentDraft = drafts[0];

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-6 md:py-8"
        >
          <h1 className="font-serif text-3xl md:text-4xl mb-2">Connect</h1>
          <p className="text-sm text-muted-foreground">
            Have a project in mind? Let&apos;s create something beautiful together.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="glass-card p-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                    Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={cn(
                      "form-input py-2.5",
                      errors.name && "border-destructive"
                    )}
                    placeholder="Your name"
                  />
                  {errors.name && (
                    <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={cn(
                      "form-input py-2.5",
                      errors.email && "border-destructive"
                    )}
                    placeholder="your@email.com"
                  />
                  {errors.email && (
                    <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium mb-1.5">
                    Notes <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    rows={4}
                    className={cn(
                      "form-input resize-none py-2.5",
                      errors.notes && "border-destructive"
                    )}
                    placeholder="Tell me about your project..."
                  />
                  <div className="flex justify-between mt-1">
                    {errors.notes ? (
                      <p className="text-destructive text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.notes}
                      </p>
                    ) : (
                      <span />
                    )}
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {formData.notes.length}/10 min
                    </span>
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting || isSuccess}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={cn(
                    "btn-premium w-full flex items-center justify-center gap-2 text-sm py-2.5",
                    (isSubmitting || isSuccess) && "opacity-70"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                      />
                      Sending...
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Sent!
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-4"
          >
            {/* Social Links */}
            <div className="glass-card p-5">
              <h3 className="font-serif text-lg mb-3">Links</h3>
              <div className="space-y-2">
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">LinkedIn</p>
                    <p className="text-xs text-muted-foreground">Douglas Mitchell</p>
                  </div>
                </a>
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">GitHub</p>
                    <p className="text-xs text-muted-foreground">Senpai-Sama7</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Available Time */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-serif text-lg">Available</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {availableTimeSlots.slice(0, 4).map((slot) => (
                  <span
                    key={slot}
                    className="px-2 py-1 text-xs rounded-full bg-accent/50"
                  >
                    {slot}
                  </span>
                ))}
              </div>
            </div>

            {/* Recent Draft */}
            <AnimatePresence>
              {recentDraft && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-card p-4"
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium">Recent Request</span>
                  </div>
                  <p className="text-sm">
                    <span className="font-medium">{recentDraft.name}</span>
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {recentDraft.notes}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
