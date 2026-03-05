"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Lock,
  LogOut,
  Plus,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  Edit3,
  X,
  Upload,
  Check,
  AlertCircle,
  Layers,
  Settings,
  FileText,
  Activity,
  BarChart3,
  Download,
  Upload as UploadIcon,
  Search,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Clock,
  FolderOpen,
  Calendar,
  Tag,
  Link,
  ChevronDown,
  Copy,
  ExternalLink,
  RefreshCw,
  CheckSquare,
  Square,
  Move,
  FileJson,
  Loader2,
  Save,
  Globe,
  Github,
  Linkedin,
  MessageCircle,
  ZoomIn,
  RotateCcw,
  Crop,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  EyeOff,
} from "lucide-react";
import { MainLayout } from "@/components/main-layout";
import { cn } from "@/lib/utils";

// Types
interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  caption: string;
  series: "recent-post" | "tech-deck" | "project";
  width: number;
  height: number;
  date: string;
  blurDataUrl?: string;
  order: number;
}

interface JournalEntry {
  id: string;
  title: string;
  date: string;
  tags: string[];
  content: string;
  quote?: string;
  image: string;
  imageAlt: string;
  order: number;
}

interface Settings {
  id?: string;
  siteTitle: string;
  siteDescription: string;
  linkedin?: string;
  github?: string;
  telegram?: string;
  whatsapp?: string;
}

interface ActivityLog {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  createdAt: string;
}

type Tab = "gallery" | "journal" | "settings" | "activity" | "analytics" | "export";

// Series options
const seriesOptions = [
  { value: "recent-post", label: "Recent Post" },
  { value: "tech-deck", label: "Tech Deck" },
  { value: "project", label: "Project" },
] as const;

// Action icons
const actionIcons: Record<string, React.ElementType> = {
  create: Plus,
  update: Edit3,
  delete: Trash2,
  upload: Upload,
  export: Download,
  import: UploadIcon,
};

// Login Component
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        onLogin();
      } else {
        setError("Invalid password");
      }
    } catch {
      setError("Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 w-full max-w-md"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
        </div>

        <h1 className="font-serif text-2xl text-center mb-2">Admin Portal</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Enter your password to access the admin area
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="form-input w-full"
              autoFocus
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-destructive text-sm flex items-center gap-1"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-premium w-full flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                />
                Authenticating...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Enter Admin
              </>
            )}
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Default password: senpai2024
        </p>
      </motion.div>
    </div>
  );
}

// Drop Zone Component
function DropZone({
  onFileSelect,
  accept = "image/*",
  label = "Drop image here or click to upload",
}: {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-accent/50"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
      />
      <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

// Image Cropper/Preview Component
function ImagePreview({
  src,
  onRemove,
  onCrop,
}: {
  src: string;
  onRemove: () => void;
  onCrop?: () => void;
}) {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);

  return (
    <div className="relative group">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-accent/20">
        <img
          src={src}
          alt="Preview"
          className="w-full h-full object-cover transition-transform duration-300"
          style={{
            transform: `rotate(${rotation}deg) scale(${zoom})`,
          }}
        />

        {/* Controls overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={() => setRotation((r) => r - 90)}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.1, 2))}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ZoomIn className="w-4 h-4 text-white" />
          </button>
          {onCrop && (
            <button
              onClick={onCrop}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <Crop className="w-4 h-4 text-white" />
            </button>
          )}
          <button
            onClick={onRemove}
            className="p-2 rounded-lg bg-destructive/80 hover:bg-destructive transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Markdown Editor Component
function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your content in markdown...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = useCallback((before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);

    onChange(newText);

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  }, [value, onChange]);

  const tools = useMemo(() => [
    { icon: Bold, before: "**", after: "**", title: "Bold" },
    { icon: Italic, before: "*", after: "*", title: "Italic" },
    { icon: Heading1, before: "# ", after: "", title: "Heading 1" },
    { icon: Heading2, before: "## ", after: "", title: "Heading 2" },
    { icon: List, before: "- ", after: "", title: "Bullet List" },
    { icon: ListOrdered, before: "1. ", after: "", title: "Numbered List" },
    { icon: Quote, before: "> ", after: "", title: "Quote" },
    { icon: Code, before: "`", after: "`", title: "Code" },
    { icon: Link, before: "[", after: "](url)", title: "Link" },
  ], []);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-border bg-accent/30">
        {tools.map((tool, i) => (
          <button
            key={i}
            onClick={() => insertText(tool.before, tool.after)}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            title={tool.title}
          >
            <tool.icon className="w-4 h-4" />
          </button>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-48 p-4 bg-transparent resize-none focus:outline-none font-mono text-sm"
      />
    </div>
  );
}

// Markdown Preview Component
function MarkdownPreview({ content }: { content: string }) {
  // Simple markdown to HTML conversion
  const html = useMemo(() => {
    let result = content
      // Escape HTML
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-serif font-semibold mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-serif font-bold mt-4 mb-3">$1</h1>')
      // Bold and italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code
      .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-accent rounded text-sm font-mono">$1</code>')
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank">$1</a>')
      // Blockquotes
      .replace(/^&gt; (.*$)/gm, '<blockquote class="border-l-4 border-primary pl-4 my-2 text-muted-foreground">$1</blockquote>')
      // Lists
      .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
      // Paragraphs
      .replace(/\n\n/g, '</p><p class="my-2">')
      // Line breaks
      .replace(/\n/g, "<br>");

    return `<div class="prose prose-sm max-w-none"><p class="my-2">${result}</p></div>`;
  }, [content]);

  return (
    <div
      className="prose prose-sm max-w-none p-4 border border-border rounded-xl min-h-[192px]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// Main Admin Component
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("gallery");
  const [isUploading, setIsUploading] = useState(false);

  // Data states
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [settings, setSettings] = useState<Settings>({
    siteTitle: "Senpai's Isekai",
    siteDescription: "A personal blog exploring architecture, technology, and creative expression",
  });
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);

  // Selection and filter states
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [galleryFilter, setGalleryFilter] = useState<string>("all");
  const [gallerySearch, setGallerySearch] = useState("");
  const [journalSearch, setJournalSearch] = useState("");

  // Modal states
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [journalPreview, setJournalPreview] = useState(false);

  // Form states
  const [imageForm, setImageForm] = useState({
    src: "",
    alt: "",
    caption: "",
    series: "recent-post" as const,
    width: 1344,
    height: 768,
    date: new Date().toISOString().split("T")[0],
  });

  const [journalForm, setJournalForm] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    content: "",
    quote: "",
    image: "",
    imageAlt: "",
    tags: [] as string[],
  });

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/auth");
        const data = await res.json();
        setIsAuthenticated(data.authenticated);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchGalleryImages();
      fetchJournalEntries();
      fetchSettings();
      fetchActivityLog();
    }
  }, [isAuthenticated]);

  // Fetch functions
  const fetchGalleryImages = async () => {
    try {
      const res = await fetch("/api/gallery");
      const data = await res.json();
      if (data.success) {
        setGalleryImages(data.data);
      }
    } catch (error) {
      console.error("Error fetching gallery images:", error);
    }
  };

  const fetchJournalEntries = async () => {
    try {
      const res = await fetch("/api/journal");
      const data = await res.json();
      if (data.success) {
        setJournalEntries(data.data);
      }
    } catch (error) {
      console.error("Error fetching journal entries:", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const fetchActivityLog = async () => {
    try {
      const res = await fetch("/api/activity?limit=100");
      const data = await res.json();
      if (data.success) {
        setActivityLog(data.data);
      }
    } catch (error) {
      console.error("Error fetching activity log:", error);
    }
  };

  // Logout
  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setIsAuthenticated(false);
  };

  // File upload
  const handleFileUpload = useCallback(async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "images");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        return data.url;
      }
      throw new Error("Upload failed");
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Gallery CRUD
  const handleImageUpload = async (file: File) => {
    try {
      const url = await handleFileUpload(file);
      setImageForm((p) => ({ ...p, src: url, alt: p.alt || file.name }));
    } catch (error) {
      console.error("Image upload failed:", error);
    }
  };

  const saveGalleryImage = async () => {
    try {
      const method = editingImage ? "PUT" : "POST";
      const body = editingImage
        ? { id: editingImage.id, ...imageForm }
        : imageForm;

      const res = await fetch("/api/gallery", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        fetchGalleryImages();
        fetchActivityLog();
        closeGalleryModal();
      }
    } catch (error) {
      console.error("Error saving image:", error);
    }
  };

  const deleteGalleryImage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const res = await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchGalleryImages();
        fetchActivityLog();
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const batchDeleteImages = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedImages.length} images?`)) return;

    try {
      const res = await fetch(`/api/gallery?ids=${selectedImages.join(",")}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setSelectedImages([]);
        fetchGalleryImages();
        fetchActivityLog();
      }
    } catch (error) {
      console.error("Error deleting images:", error);
    }
  };

  const moveImagesToSeries = async (series: string) => {
    try {
      const res = await fetch("/api/gallery/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "moveToSeries",
          ids: selectedImages,
          data: { series },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedImages([]);
        fetchGalleryImages();
        fetchActivityLog();
      }
    } catch (error) {
      console.error("Error moving images:", error);
    }
  };

  const closeGalleryModal = () => {
    setShowGalleryModal(false);
    setEditingImage(null);
    setImageForm({
      src: "",
      alt: "",
      caption: "",
      series: "recent-post",
      width: 1344,
      height: 768,
      date: new Date().toISOString().split("T")[0],
    });
  };

  // Journal CRUD
  const handleJournalImageUpload = async (file: File) => {
    try {
      const url = await handleFileUpload(file);
      setJournalForm((p) => ({ ...p, image: url, imageAlt: p.imageAlt || file.name }));
    } catch (error) {
      console.error("Image upload failed:", error);
    }
  };

  const saveJournalEntry = async () => {
    try {
      const method = editingEntry ? "PUT" : "POST";
      const body = editingEntry ? { id: editingEntry.id, ...journalForm } : journalForm;

      const res = await fetch("/api/journal", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        fetchJournalEntries();
        fetchActivityLog();
        closeJournalModal();
      }
    } catch (error) {
      console.error("Error saving entry:", error);
    }
  };

  const deleteJournalEntry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const res = await fetch(`/api/journal?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchJournalEntries();
        fetchActivityLog();
      }
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  const closeJournalModal = () => {
    setShowJournalModal(false);
    setEditingEntry(null);
    setJournalPreview(false);
    setJournalForm({
      title: "",
      date: new Date().toISOString().split("T")[0],
      content: "",
      quote: "",
      image: "",
      imageAlt: "",
      tags: [],
    });
  };

  // Settings save
  const saveSettings = async () => {
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (data.success) {
        fetchActivityLog();
        alert("Settings saved!");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  // Export data
  const exportData = async () => {
    try {
      const res = await fetch("/api/data");
      const data = await res.json();

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `senpai-isekai-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      fetchActivityLog();
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  // Import data
  const importData = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: data.data, mode: "merge" }),
      });

      const result = await res.json();
      if (result.success) {
        fetchGalleryImages();
        fetchJournalEntries();
        fetchSettings();
        fetchActivityLog();
        alert(`Import successful! Gallery: ${result.results.gallery.created} created, ${result.results.gallery.updated} updated. Journal: ${result.results.journal.created} created, ${result.results.journal.updated} updated.`);
      }
    } catch (error) {
      console.error("Error importing data:", error);
      alert("Import failed. Please check the file format.");
    }
  };

  // Clear activity log
  const clearActivityLog = async () => {
    if (!confirm("Are you sure you want to clear all activity logs?")) return;

    try {
      await fetch("/api/activity", { method: "DELETE" });
      fetchActivityLog();
    } catch (error) {
      console.error("Error clearing activity log:", error);
    }
  };

  // Filtered data
  const filteredGalleryImages = useMemo(() => {
    let result = [...galleryImages];

    if (galleryFilter !== "all") {
      result = result.filter((img) => img.series === galleryFilter);
    }

    if (gallerySearch.trim()) {
      const query = gallerySearch.toLowerCase();
      result = result.filter(
        (img) =>
          img.alt.toLowerCase().includes(query) ||
          img.caption.toLowerCase().includes(query)
      );
    }

    return result;
  }, [galleryImages, galleryFilter, gallerySearch]);

  const filteredJournalEntries = useMemo(() => {
    if (!journalSearch.trim()) return journalEntries;

    const query = journalSearch.toLowerCase();
    return journalEntries.filter(
      (entry) =>
        entry.title.toLowerCase().includes(query) ||
        entry.content.toLowerCase().includes(query) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [journalEntries, journalSearch]);

  // Loading state
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="font-serif text-3xl md:text-4xl">Admin Portal</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your blog content and settings
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl glass-card hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </motion.header>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 p-1 rounded-xl bg-accent/30">
          {[
            { key: "gallery", label: "Gallery", icon: ImageIcon },
            { key: "journal", label: "Journal", icon: FileText },
            { key: "settings", label: "Settings", icon: Settings },
            { key: "activity", label: "Activity", icon: Activity },
            { key: "analytics", label: "Analytics", icon: BarChart3 },
            { key: "export", label: "Export/Import", icon: Download },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as Tab)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* Gallery Tab */}
          {activeTab === "gallery" && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Gallery Header */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setGalleryFilter("all")}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                      galleryFilter === "all"
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent hover:bg-accent/80"
                    )}
                  >
                    All ({galleryImages.length})
                  </button>
                  {seriesOptions.map((series) => (
                    <button
                      key={series.value}
                      onClick={() => setGalleryFilter(series.value)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                        galleryFilter === series.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent hover:bg-accent/80"
                      )}
                    >
                      {series.label} ({galleryImages.filter((i) => i.series === series.value).length})
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search images..."
                      value={gallerySearch}
                      onChange={(e) => setGallerySearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-background border border-border text-sm"
                    />
                  </div>
                  <button
                    onClick={() => setShowGalleryModal(true)}
                    className="btn-premium flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>

              {/* Batch Actions */}
              {selectedImages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20"
                >
                  <span className="text-sm font-medium">
                    {selectedImages.length} selected
                  </span>
                  <div className="flex gap-2 ml-auto">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          moveImagesToSeries(e.target.value);
                          e.target.value = "";
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-background border border-border text-sm"
                    >
                      <option value="">Move to...</option>
                      {seriesOptions.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={batchDeleteImages}
                      className="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-sm hover:bg-destructive/90 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedImages([])}
                      className="px-3 py-1.5 rounded-lg bg-accent text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Gallery Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredGalleryImages.map((image) => (
                  <motion.div
                    key={image.id}
                    layout
                    className="group relative aspect-square rounded-xl overflow-hidden bg-accent/20 border border-border"
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />

                    {/* Selection checkbox */}
                    <button
                      onClick={() => {
                        setSelectedImages((prev) =>
                          prev.includes(image.id)
                            ? prev.filter((id) => id !== image.id)
                            : [...prev, image.id]
                        );
                      }}
                      className={cn(
                        "absolute top-2 left-2 p-1.5 rounded-lg transition-all",
                        selectedImages.includes(image.id)
                          ? "bg-primary text-primary-foreground"
                          : "bg-black/50 text-white opacity-0 group-hover:opacity-100"
                      )}
                    >
                      {selectedImages.includes(image.id) ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setEditingImage(image);
                          setImageForm({
                            src: image.src,
                            alt: image.alt,
                            caption: image.caption,
                            series: image.series,
                            width: image.width,
                            height: image.height,
                            date: image.date,
                          });
                          setShowGalleryModal(true);
                        }}
                        className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => deleteGalleryImage(image.id)}
                        className="p-2 rounded-lg bg-destructive/80 hover:bg-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-white text-xs font-medium truncate">
                        {image.alt}
                      </p>
                      <p className="text-white/70 text-xs">
                        {seriesOptions.find((s) => s.value === image.series)?.label}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredGalleryImages.length === 0 && (
                <div className="text-center py-12">
                  <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No images found</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Journal Tab */}
          {activeTab === "journal" && (
            <motion.div
              key="journal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Journal Header */}
              <div className="flex gap-3 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search entries..."
                    value={journalSearch}
                    onChange={(e) => setJournalSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-background border border-border text-sm"
                  />
                </div>
                <button
                  onClick={() => setShowJournalModal(true)}
                  className="btn-premium flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Entry
                </button>
              </div>

              {/* Journal List */}
              <div className="space-y-3">
                {filteredJournalEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="glass-card p-4 flex gap-4"
                  >
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-accent/20 flex-shrink-0">
                      <img
                        src={entry.image}
                        alt={entry.imageAlt}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-serif text-lg">{entry.title}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {new Date(entry.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingEntry(entry);
                              setJournalForm({
                                title: entry.title,
                                date: entry.date,
                                content: entry.content,
                                quote: entry.quote || "",
                                image: entry.image,
                                imageAlt: entry.imageAlt,
                                tags: entry.tags,
                              });
                              setShowJournalModal(true);
                            }}
                            className="p-2 hover:bg-accent rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteJournalEntry(entry.id)}
                            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                        {entry.content}
                      </p>

                      <div className="flex gap-1 mt-2 flex-wrap">
                        {entry.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full bg-accent text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredJournalEntries.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No journal entries found</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="glass-card p-6 space-y-6">
                <h2 className="font-serif text-xl flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Site Settings
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Site Title</label>
                    <input
                      type="text"
                      value={settings.siteTitle}
                      onChange={(e) =>
                        setSettings((p) => ({ ...p, siteTitle: e.target.value }))
                      }
                      className="form-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Site Description
                    </label>
                    <textarea
                      value={settings.siteDescription}
                      onChange={(e) =>
                        setSettings((p) => ({ ...p, siteDescription: e.target.value }))
                      }
                      className="form-input w-full h-24 resize-none"
                    />
                  </div>

                  <h3 className="font-serif text-lg flex items-center gap-2 pt-4 border-t border-border">
                    <Globe className="w-4 h-4" />
                    Social Links
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Linkedin className="w-5 h-5 text-muted-foreground" />
                      <input
                        type="url"
                        placeholder="LinkedIn URL"
                        value={settings.linkedin || ""}
                        onChange={(e) =>
                          setSettings((p) => ({ ...p, linkedin: e.target.value }))
                        }
                        className="form-input flex-1"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <Github className="w-5 h-5 text-muted-foreground" />
                      <input
                        type="url"
                        placeholder="GitHub URL"
                        value={settings.github || ""}
                        onChange={(e) =>
                          setSettings((p) => ({ ...p, github: e.target.value }))
                        }
                        className="form-input flex-1"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-muted-foreground" />
                      <input
                        type="url"
                        placeholder="Telegram URL"
                        value={settings.telegram || ""}
                        onChange={(e) =>
                          setSettings((p) => ({ ...p, telegram: e.target.value }))
                        }
                        className="form-input flex-1"
                      />
                    </div>
                  </div>

                  <button onClick={saveSettings} className="btn-premium w-full">
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="font-serif text-xl flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Activity Log
                </h2>
                <button
                  onClick={clearActivityLog}
                  className="px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-sm hover:bg-destructive/20 transition-colors"
                >
                  Clear Log
                </button>
              </div>

              <div className="glass-card overflow-hidden">
                <div className="max-h-[600px] overflow-y-auto">
                  {activityLog.length > 0 ? (
                    <div className="divide-y divide-border">
                      {activityLog.map((log) => {
                        const Icon = actionIcons[log.action] || Activity;
                        return (
                          <div
                            key={log.id}
                            className="p-4 flex items-center gap-4 hover:bg-accent/30 transition-colors"
                          >
                            <div
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center",
                                log.action === "create"
                                  ? "bg-green-500/10 text-green-500"
                                  : log.action === "delete"
                                  ? "bg-red-500/10 text-red-500"
                                  : log.action === "update"
                                  ? "bg-blue-500/10 text-blue-500"
                                  : "bg-accent"
                              )}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm">
                                <span className="font-medium capitalize">{log.action}</span>{" "}
                                <span className="text-muted-foreground">{log.resource}</span>
                              </p>
                              {log.details && (
                                <p className="text-xs text-muted-foreground">
                                  {log.details}
                                </p>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.createdAt).toLocaleString()}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Activity className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">No activity yet</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <h2 className="font-serif text-xl flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Analytics Dashboard
              </h2>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card p-4 text-center">
                  <p className="text-3xl font-serif font-bold text-primary">
                    {galleryImages.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Gallery Images</p>
                </div>
                <div className="glass-card p-4 text-center">
                  <p className="text-3xl font-serif font-bold text-primary">
                    {journalEntries.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Journal Entries</p>
                </div>
                <div className="glass-card p-4 text-center">
                  <p className="text-3xl font-serif font-bold text-primary">
                    {new Set(journalEntries.flatMap((e) => e.tags)).size}
                  </p>
                  <p className="text-sm text-muted-foreground">Tags Used</p>
                </div>
                <div className="glass-card p-4 text-center">
                  <p className="text-3xl font-serif font-bold text-primary">3</p>
                  <p className="text-sm text-muted-foreground">Series</p>
                </div>
              </div>

              {/* Placeholder Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h3 className="font-serif text-lg mb-4">Content by Series</h3>
                  <div className="space-y-3">
                    {seriesOptions.map((series) => {
                      const count = galleryImages.filter(
                        (img) => img.series === series.value
                      ).length;
                      const percentage = galleryImages.length > 0 
                        ? (count / galleryImages.length) * 100 
                        : 0;
                      return (
                        <div key={series.value}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{series.label}</span>
                            <span>{count}</span>
                          </div>
                          <div className="h-2 bg-accent rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h3 className="font-serif text-lg mb-4">Recent Activity</h3>
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">
                      Analytics integration coming soon
                    </p>
                    <p className="text-xs mt-1">
                      Connect Google Analytics or Plausible
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Export/Import Tab */}
          {activeTab === "export" && (
            <motion.div
              key="export"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto space-y-6"
            >
              <div className="glass-card p-6">
                <h2 className="font-serif text-xl flex items-center gap-2 mb-4">
                  <Download className="w-5 h-5" />
                  Export Data
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Download all your blog data as a JSON file. This includes gallery images,
                  journal entries, and settings.
                </p>
                <button onClick={exportData} className="btn-premium w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export All Data
                </button>
              </div>

              <div className="glass-card p-6">
                <h2 className="font-serif text-xl flex items-center gap-2 mb-4">
                  <UploadIcon className="w-5 h-5" />
                  Import Data
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Import data from a previously exported JSON file. Existing content will
                  be merged with the imported data.
                </p>
                <DropZone
                  onFileSelect={importData}
                  accept=".json"
                  label="Drop JSON file here or click to select"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Gallery Modal */}
        <AnimatePresence>
          {showGalleryModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
              onClick={() => closeGalleryModal()}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-xl">
                    {editingImage ? "Edit Image" : "Add New Image"}
                  </h3>
                  <button
                    onClick={closeGalleryModal}
                    className="p-2 hover:bg-accent rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Image Upload */}
                  {imageForm.src ? (
                    <ImagePreview
                      src={imageForm.src}
                      onRemove={() => setImageForm((p) => ({ ...p, src: "" }))}
                    />
                  ) : (
                    <DropZone
                      onFileSelect={handleImageUpload}
                      accept="image/*"
                    />
                  )}

                  {isUploading && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </div>
                  )}

                  {/* Form Fields */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Alt Text
                    </label>
                    <input
                      type="text"
                      value={imageForm.alt}
                      onChange={(e) =>
                        setImageForm((p) => ({ ...p, alt: e.target.value }))
                      }
                      className="form-input w-full"
                      placeholder="Image description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Caption
                    </label>
                    <textarea
                      value={imageForm.caption}
                      onChange={(e) =>
                        setImageForm((p) => ({ ...p, caption: e.target.value }))
                      }
                      className="form-input w-full h-20 resize-none"
                      placeholder="Image caption"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Series
                      </label>
                      <select
                        value={imageForm.series}
                        onChange={(e) =>
                          setImageForm((p) => ({
                            ...p,
                            series: e.target.value as typeof imageForm.series,
                          }))
                        }
                        className="form-input w-full"
                      >
                        {seriesOptions.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        value={imageForm.date}
                        onChange={(e) =>
                          setImageForm((p) => ({ ...p, date: e.target.value }))
                        }
                        className="form-input w-full"
                      />
                    </div>
                  </div>

                  <button
                    onClick={saveGalleryImage}
                    disabled={!imageForm.src || !imageForm.alt}
                    className="btn-premium w-full disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingImage ? "Update" : "Save"} Image
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Journal Modal */}
        <AnimatePresence>
          {showJournalModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
              onClick={() => closeJournalModal()}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="glass-card p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-xl">
                    {editingEntry ? "Edit Entry" : "New Journal Entry"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setJournalPreview(!journalPreview)}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        journalPreview ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                      )}
                    >
                      {journalPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={closeJournalModal}
                      className="p-2 hover:bg-accent rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Image Upload */}
                  {journalForm.image ? (
                    <ImagePreview
                      src={journalForm.image}
                      onRemove={() => setJournalForm((p) => ({ ...p, image: "" }))}
                    />
                  ) : (
                    <DropZone
                      onFileSelect={handleJournalImageUpload}
                      accept="image/*"
                      label="Drop cover image here"
                    />
                  )}

                  {isUploading && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </div>
                  )}

                  {/* Form Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={journalForm.title}
                        onChange={(e) =>
                          setJournalForm((p) => ({ ...p, title: e.target.value }))
                        }
                        className="form-input w-full"
                        placeholder="Entry title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        value={journalForm.date}
                        onChange={(e) =>
                          setJournalForm((p) => ({ ...p, date: e.target.value }))
                        }
                        className="form-input w-full"
                      />
                    </div>
                  </div>

                  {/* Content Editor / Preview */}
                  {journalPreview ? (
                    <MarkdownPreview content={journalForm.content} />
                  ) : (
                    <MarkdownEditor
                      value={journalForm.content}
                      onChange={(content) =>
                        setJournalForm((p) => ({ ...p, content }))
                      }
                      placeholder="Write your journal entry in markdown..."
                    />
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Quote (optional)
                    </label>
                    <input
                      type="text"
                      value={journalForm.quote}
                      onChange={(e) =>
                        setJournalForm((p) => ({ ...p, quote: e.target.value }))
                      }
                      className="form-input w-full"
                      placeholder="An optional quote for this entry"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      value={journalForm.tags.join(", ")}
                      onChange={(e) =>
                        setJournalForm((p) => ({
                          ...p,
                          tags: e.target.value
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean),
                        }))
                      }
                      className="form-input w-full"
                      placeholder="life, coffee, morning"
                    />
                  </div>

                  <button
                    onClick={saveJournalEntry}
                    disabled={!journalForm.title || !journalForm.content || !journalForm.image}
                    className="btn-premium w-full disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingEntry ? "Update" : "Publish"} Entry
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
