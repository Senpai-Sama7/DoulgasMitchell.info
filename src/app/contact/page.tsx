"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  MessageSquare,
  Save,
  Trash2,
  Calendar as CalendarIcon,
  MapPin,
  Phone,
  Mail,
  Linkedin,
  Github,
  Twitter,
  Instagram,
  ChevronDown,
  Sparkles,
  X,
} from "lucide-react";
import { MainLayout } from "@/components/main-layout";
import { useState, useEffect, useCallback } from "react";
import { useContactStore } from "@/lib/store";
import { socialLinks } from "@/lib/data";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Subject options
const subjectOptions = [
  { value: "general", label: "General Inquiry" },
  { value: "collaboration", label: "Collaboration Request" },
  { value: "project", label: "Project Discussion" },
  { value: "feedback", label: "Feedback & Suggestions" },
  { value: "support", label: "Technical Support" },
  { value: "other", label: "Other" },
];

// Contact methods
const contactMethods = [
  { value: "email", label: "Email", icon: Mail },
  { value: "phone", label: "Phone Call", icon: Phone },
  { value: "video", label: "Video Call", icon: MessageSquare },
];

// Time slots for scheduling
const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
];

// FAQ items
const faqItems = [
  {
    question: "What's the best way to reach you?",
    answer: "Email is my preferred method of communication. I typically respond within 24-48 hours on business days. For urgent matters, you can reach out via LinkedIn or schedule a call directly.",
  },
  {
    question: "Do you take on freelance projects?",
    answer: "Yes! I'm always open to discussing interesting projects. Whether it's a full website, UI/UX design, or technical consultation, feel free to reach out with the details and I'll get back to you with my availability.",
  },
  {
    question: "What's your typical response time?",
    answer: "I aim to respond to all inquiries within 24-48 hours. If you haven't heard back within that timeframe, please feel free to follow up or try an alternative contact method.",
  },
  {
    question: "Can we schedule a call instead?",
    answer: "Absolutely! Use the calendar picker to select a date and time that works for you. I'll confirm the meeting via email. I'm generally available Monday through Friday, 9 AM to 5 PM EST.",
  },
  {
    question: "What information should I include in my message?",
    answer: "For the quickest response, please include: your name, email, a brief description of your project or inquiry, your timeline, and any relevant links or attachments. This helps me provide a more informed response.",
  },
];

// Social media data
const socialMediaLinks = [
  {
    name: "LinkedIn",
    href: socialLinks.linkedin,
    icon: Linkedin,
    color: "hover:bg-[#0077B5]/10 hover:text-[#0077B5] dark:hover:bg-[#0077B5]/20",
    username: "Douglas Mitchell",
  },
  {
    name: "GitHub",
    href: socialLinks.github,
    icon: Github,
    color: "hover:bg-[#333]/10 hover:text-[#333] dark:hover:bg-white/10 dark:hover:text-white",
    username: "Senpai-Sama7",
  },
  {
    name: "Twitter",
    href: "#",
    icon: Twitter,
    color: "hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2]",
    username: "@senpai_isekai",
  },
  {
    name: "Instagram",
    href: "#",
    icon: Instagram,
    color: "hover:bg-[#E4405F]/10 hover:text-[#E4405F]",
    username: "@senpai.isekai",
  },
];

interface FormData {
  name: string;
  email: string;
  subject: string;
  contactMethod: string;
  message: string;
  scheduledDate?: Date;
  scheduledTime: string;
  scheduleCall: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const DRAFT_KEY = "contact-form-draft";

// Helper function to load draft from localStorage
function loadDraftFromStorage(): { data: FormData; hasDraft: boolean } {
  if (typeof window === "undefined") {
    return {
      data: {
        name: "",
        email: "",
        subject: "",
        contactMethod: "email",
        message: "",
        scheduledDate: undefined,
        scheduledTime: "",
        scheduleCall: false,
      },
      hasDraft: false,
    };
  }

  const savedDraft = localStorage.getItem(DRAFT_KEY);
  if (savedDraft) {
    try {
      const parsed = JSON.parse(savedDraft);
      return {
        data: {
          ...parsed,
          scheduledDate: parsed.scheduledDate ? new Date(parsed.scheduledDate) : undefined,
        },
        hasDraft: true,
      };
    } catch (e) {
      console.error("Failed to load draft:", e);
    }
  }
  return {
    data: {
      name: "",
      email: "",
      subject: "",
      contactMethod: "email",
      message: "",
      scheduledDate: undefined,
      scheduledTime: "",
      scheduleCall: false,
    },
    hasDraft: false,
  };
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>(() => loadDraftFromStorage().data);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [draftSaved, setDraftSaved] = useState(() => loadDraftFromStorage().hasDraft);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const { drafts, addDraft } = useContactStore();

  // Save draft to localStorage
  const saveDraft = useCallback(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  }, [formData]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (formData.name || formData.email || formData.message) {
        saveDraft();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [formData, saveDraft]);

  // Real-time validation
  const validateField = (field: string, value: string): string | undefined => {
    switch (field) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        return undefined;
      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email";
        return undefined;
      case "subject":
        if (!value) return "Please select a subject";
        return undefined;
      case "message":
        if (!value.trim()) return "Message is required";
        if (value.trim().length < 10) return "Message must be at least 10 characters";
        if (value.length > 1000) return "Message must be less than 1000 characters";
        return undefined;
      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const fields = ["name", "email", "subject", "message"] as const;

    fields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    addDraft({
      name: formData.name,
      email: formData.email,
      notes: formData.message,
    });

    setIsSubmitting(false);
    setIsSuccess(true);
    setShowSuccessAnimation(true);

    // Clear draft from localStorage
    localStorage.removeItem(DRAFT_KEY);

    setTimeout(() => {
      setFormData({
        name: "",
        email: "",
        subject: "",
        contactMethod: "email",
        message: "",
        scheduledDate: undefined,
        scheduledTime: "",
        scheduleCall: false,
      });
      setShowSuccessAnimation(false);
      setIsSuccess(false);
    }, 4000);
  };

  const handleChange = (field: keyof FormData, value: string | Date | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Real-time validation on change if field was touched
    if (touched[field] && typeof value === "string") {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const value = formData[field];
    if (typeof value === "string") {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const clearForm = () => {
    setFormData({
      name: "",
      email: "",
      subject: "",
      contactMethod: "email",
      message: "",
      scheduledDate: undefined,
      scheduledTime: "",
      scheduleCall: false,
    });
    setErrors({});
    setTouched({});
    localStorage.removeItem(DRAFT_KEY);
    setShowClearDialog(false);
  };

  const recentDraft = drafts[0];

  const messageLength = formData.message.length;
  const messageMaxLength = 1000;

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4">
        {/* Success Animation Overlay */}
        <AnimatePresence>
          {showSuccessAnimation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", damping: 15 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", damping: 10 }}
                  className="w-24 h-24 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center"
                >
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </motion.div>
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl font-serif mb-2"
                >
                  Message Sent!
                </motion.h2>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-muted-foreground"
                >
                  Thank you for reaching out. I&apos;ll get back to you soon!
                </motion.p>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4"
                >
                  <Sparkles className="w-6 h-6 mx-auto text-amber-500 animate-pulse" />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clear Confirmation Dialog */}
        <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clear Form?</DialogTitle>
              <DialogDescription>
                This will remove all entered information. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowClearDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={clearForm}>
                Clear Form
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section - Takes 2 columns */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="glass-card p-5 md:p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Row: Name and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                      Name <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        onBlur={() => handleBlur("name")}
                        className={cn(
                          "form-input py-2.5 pr-10",
                          errors.name && touched.name && "border-destructive",
                          !errors.name && touched.name && formData.name && "border-green-500"
                        )}
                        placeholder="Your name"
                      />
                      {touched.name && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
                          {errors.name ? (
                            <AlertCircle className="w-4 h-4 text-destructive" />
                          ) : formData.name ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : null}
                        </span>
                      )}
                    </div>
                    {errors.name && touched.name && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-destructive text-xs mt-1"
                      >
                        {errors.name}
                      </motion.p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                      Email <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        onBlur={() => handleBlur("email")}
                        className={cn(
                          "form-input py-2.5 pr-10",
                          errors.email && touched.email && "border-destructive",
                          !errors.email && touched.email && formData.email && "border-green-500"
                        )}
                        placeholder="your@email.com"
                      />
                      {touched.email && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2">
                          {errors.email ? (
                            <AlertCircle className="w-4 h-4 text-destructive" />
                          ) : formData.email ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : null}
                        </span>
                      )}
                    </div>
                    {errors.email && touched.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-destructive text-xs mt-1"
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* Row: Subject and Contact Method */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Subject Dropdown */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-1.5">
                      Subject <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleChange("subject", e.target.value)}
                        onBlur={() => handleBlur("subject")}
                        className={cn(
                          "form-input py-2.5 appearance-none cursor-pointer",
                          errors.subject && touched.subject && "border-destructive",
                          !errors.subject && touched.subject && formData.subject && "border-green-500"
                        )}
                      >
                        <option value="" disabled>
                          Select a subject
                        </option>
                        {subjectOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                    {errors.subject && touched.subject && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-destructive text-xs mt-1"
                      >
                        {errors.subject}
                      </motion.p>
                    )}
                  </div>

                  {/* Preferred Contact Method */}
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Preferred Contact Method
                    </label>
                    <div className="flex gap-2">
                      {contactMethods.map((method) => {
                        const Icon = method.icon;
                        return (
                          <button
                            key={method.value}
                            type="button"
                            onClick={() => handleChange("contactMethod", method.value)}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all",
                              formData.contactMethod === method.value
                                ? "bg-primary text-primary-foreground"
                                : "bg-accent hover:bg-accent/80"
                            )}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{method.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Schedule a Call Toggle */}
                <div className="glass-card-sm p-4 bg-accent/30">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.scheduleCall}
                      onChange={(e) => handleChange("scheduleCall", e.target.checked)}
                      className="w-4 h-4 rounded accent-primary"
                    />
                    <div>
                      <span className="text-sm font-medium">Schedule a Call</span>
                      <p className="text-xs text-muted-foreground">
                        Pick a date and time for a call
                      </p>
                    </div>
                    <Phone className="w-4 h-4 ml-auto text-muted-foreground" />
                  </label>

                  <AnimatePresence>
                    {formData.scheduleCall && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {/* Calendar Picker */}
                          <div>
                            <label className="block text-sm font-medium mb-1.5">
                              Select Date
                            </label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !formData.scheduledDate && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {formData.scheduledDate
                                    ? formData.scheduledDate.toLocaleDateString()
                                    : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={formData.scheduledDate}
                                  onSelect={(date) => handleChange("scheduledDate", date as Date)}
                                  disabled={(date) =>
                                    date < new Date() || date.getDay() === 0 || date.getDay() === 6
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>

                          {/* Time Slots */}
                          <div>
                            <label className="block text-sm font-medium mb-1.5">
                              Select Time
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {timeSlots.map((slot) => (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() => handleChange("scheduledTime", slot)}
                                  className={cn(
                                    "px-3 py-2 rounded-lg text-sm transition-all",
                                    formData.scheduledTime === slot
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-accent hover:bg-accent/80"
                                  )}
                                >
                                  {slot}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1.5">
                    Message <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    onBlur={() => handleBlur("message")}
                    rows={5}
                    className={cn(
                      "form-input resize-none",
                      errors.message && touched.message && "border-destructive",
                      !errors.message && touched.message && formData.message && "border-green-500"
                    )}
                    placeholder="Tell me about your project..."
                    maxLength={messageMaxLength}
                  />
                  <div className="flex justify-between items-center mt-1.5">
                    <div>
                      {errors.message && touched.message && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-destructive text-xs"
                        >
                          {errors.message}
                        </motion.p>
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-mono",
                        messageLength > messageMaxLength * 0.9
                          ? "text-amber-500"
                          : "text-muted-foreground"
                      )}
                    >
                      {messageLength}/{messageMaxLength}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button
                    type="submit"
                    disabled={isSubmitting || isSuccess}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={cn(
                      "btn-premium flex-1 flex items-center justify-center gap-2 text-sm py-2.5",
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
                        Send Message
                      </>
                    )}
                  </motion.button>

                  <button
                    type="button"
                    onClick={saveDraft}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent/80 text-sm transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save Draft
                    {draftSaved && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-green-500"
                      >
                        <CheckCircle className="w-3 h-3" />
                      </motion.span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowClearDialog(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-destructive/10 hover:text-destructive text-sm transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </button>
                </div>
              </form>

              {/* Recent Draft */}
              <AnimatePresence>
                {recentDraft && !isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-5 p-4 rounded-xl bg-accent/50 border border-border"
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">Recent Submission</span>
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
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-4"
          >
            {/* Social Media Links */}
            <div className="glass-card p-5">
              <h3 className="font-serif text-lg mb-3">Quick Links</h3>
              <div className="space-y-2">
                {socialMediaLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group",
                        "hover:scale-[1.02]",
                        link.color
                      )}
                    >
                      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{link.name}</p>
                        <p className="text-xs text-muted-foreground">{link.username}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Location / Map */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-serif text-lg">Location</h3>
              </div>
              <div className="relative rounded-xl overflow-hidden bg-accent/50 h-40">
                {/* Stylized Map Placeholder */}
                <div className="absolute inset-0 opacity-20">
                  <svg className="w-full h-full" viewBox="0 0 400 200">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    <path
                      d="M 0 100 Q 100 50 200 100 T 400 100"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      opacity="0.3"
                    />
                    <path
                      d="M 0 120 Q 150 80 300 120 T 400 100"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      opacity="0.2"
                    />
                  </svg>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground mb-2"
                    >
                      <MapPin className="w-5 h-5" />
                    </motion.div>
                    <p className="text-sm font-medium">Tokyo, Japan</p>
                    <p className="text-xs text-muted-foreground">Available worldwide</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-serif text-lg">Availability</h3>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm">Currently accepting projects</span>
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <p>Monday - Friday</p>
                <p className="font-mono text-xs">9:00 AM - 5:00 PM (JST)</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-8 mb-8"
        >
          <div className="glass-card p-5 md:p-6">
            <h2 className="font-serif text-xl md:text-2xl mb-4">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-sm md:text-base">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
