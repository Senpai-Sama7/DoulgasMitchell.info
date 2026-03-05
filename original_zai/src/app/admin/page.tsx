"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Lock,
  LogOut,
  Plus,
  Trash2,
  GripVertical,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  File,
  Code,
  FileCode,
  Save,
  Eye,
  Edit3,
  X,
  Upload,
  Link as LinkIcon,
  Check,
  AlertCircle,
  Layers,
  Layout,
  Settings,
  FolderOpen,
} from "lucide-react";
import { MainLayout } from "@/components/main-layout";
import { cn } from "@/lib/utils";

// Types
type ContentType = "text" | "image" | "video" | "audio" | "file" | "pdf" | "zip" | "code";

interface ContentBlock {
  id: string;
  type: ContentType;
  title: string;
  content: string;
  description?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  file?: {
    name: string;
    size: number;
    url: string;
  };
}

interface PageSection {
  id: string;
  title: string;
  blocks: ContentBlock[];
  order: number;
  layout: "full" | "half" | "third";
}

// Content type configurations
const contentTypeConfig: Record<
  ContentType,
  { label: string; icon: React.ElementType; color: string; accept: string }
> = {
  text: { label: "Text", icon: FileText, color: "text-blue-500", accept: "" },
  image: { label: "Image", icon: ImageIcon, color: "text-green-500", accept: "image/*" },
  video: { label: "Video", icon: Video, color: "text-purple-500", accept: "video/*" },
  audio: { label: "Audio", icon: Music, color: "text-pink-500", accept: "audio/*" },
  file: { label: "File", icon: File, color: "text-orange-500", accept: "*" },
  pdf: { label: "PDF", icon: File, color: "text-red-500", accept: ".pdf" },
  zip: { label: "ZIP", icon: File, color: "text-yellow-500", accept: ".zip,.rar" },
  code: { label: "Code", icon: Code, color: "text-cyan-500", accept: ".tsx,.ts,.jsx,.js,.html,.css,.md" },
};

// Code syntax highlighting (simple version)
const highlightCode = (code: string, filename: string): string => {
  const ext = filename.split(".").pop()?.toLowerCase() || "txt";
  const keywords: Record<string, RegExp> = {
    ts: /\b(import|export|const|let|var|function|return|if|else|for|while|class|interface|type|async|await|from|default)\b/g,
    tsx: /\b(import|export|const|let|var|function|return|if|else|for|while|class|interface|type|async|await|from|default|React|useState|useEffect)\b/g,
    js: /\b(import|export|const|let|var|function|return|if|else|for|while|class|async|await|from|default)\b/g,
    html: /(&lt;\/?[a-z]+|&gt;)/gi,
    css: /([.#]?[a-z_-]+)(?=\s*\{)/gi,
  };

  let highlighted = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  if (keywords[ext]) {
    highlighted = highlighted.replace(keywords[ext], '<span class="text-purple-400">$1</span>');
  }

  // Highlight strings
  highlighted = highlighted.replace(/(["'`])(.*?)\1/g, '<span class="text-green-400">$1$2$1</span>');

  // Highlight comments
  highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="text-gray-500">$1</span>');
  highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-gray-500">$1</span>');

  return highlighted;
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

// Main Admin Component
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [sections, setSections] = useState<PageSection[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<{
    type: ContentType;
    title: string;
    content: string;
    description: string;
  }>({
    type: "text",
    title: "",
    content: "",
    description: "",
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

  // Load saved content
  useEffect(() => {
    const saved = localStorage.getItem("admin-sections");
    if (saved) {
      setSections(JSON.parse(saved));
    } else {
      // Create default section
      setSections([
        {
          id: "section-1",
          title: "Main Content",
          blocks: [],
          order: 0,
          layout: "full",
        },
      ]);
    }
  }, []);

  // Save content
  const saveSections = useCallback((newSections: PageSection[]) => {
    setSections(newSections);
    localStorage.setItem("admin-sections", JSON.stringify(newSections));
  }, []);

  // Logout
  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setIsAuthenticated(false);
  };

  // Add section
  const addSection = () => {
    const newSection: PageSection = {
      id: `section-${Date.now()}`,
      title: `Section ${sections.length + 1}`,
      blocks: [],
      order: sections.length,
      layout: "full",
    };
    saveSections([...sections, newSection]);
  };

  // Delete section
  const deleteSection = (id: string) => {
    saveSections(sections.filter((s) => s.id !== id));
  };

  // Add block
  const addBlock = () => {
    if (!activeSection) return;

    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type: formData.type,
      title: formData.title,
      content: formData.content,
      description: formData.description,
      order: sections.find((s) => s.id === activeSection)?.blocks.length || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveSections(
      sections.map((s) =>
        s.id === activeSection
          ? { ...s, blocks: [...s.blocks, newBlock] }
          : s
      )
    );

    resetForm();
  };

  // Update block
  const updateBlock = () => {
    if (!editingBlock || !activeSection) return;

    saveSections(
      sections.map((s) =>
        s.id === activeSection
          ? {
              ...s,
              blocks: s.blocks.map((b) =>
                b.id === editingBlock.id
                  ? {
                      ...b,
                      type: formData.type,
                      title: formData.title,
                      content: formData.content,
                      description: formData.description,
                      updatedAt: new Date().toISOString(),
                    }
                  : b
              ),
            }
          : s
      )
    );

    resetForm();
  };

  // Delete block
  const deleteBlock = (sectionId: string, blockId: string) => {
    saveSections(
      sections.map((s) =>
        s.id === sectionId
          ? { ...s, blocks: s.blocks.filter((b) => b.id !== blockId) }
          : s
      )
    );
  };

  // Reorder blocks
  const reorderBlocks = (sectionId: string, blocks: ContentBlock[]) => {
    saveSections(
      sections.map((s) =>
        s.id === sectionId
          ? { ...s, blocks: blocks.map((b, i) => ({ ...b, order: i })) }
          : s
      )
    );
  };

  // File upload
  const handleFileUpload = async (file: File, type: ContentType) => {
    setIsUploading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append("file", file);
      formDataObj.append("type", type === "image" ? "images" : type === "video" ? "videos" : type === "audio" ? "audio" : "documents");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataObj,
      });

      const data = await res.json();

      if (data.success) {
        setFormData((p) => ({
          ...p,
          content: data.url,
          title: p.title || file.name,
        }));
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({ type: "text", title: "", content: "", description: "" });
    setIsAddingBlock(false);
    setEditingBlock(null);
  };

  // Render content based on type
  const renderBlockContent = (block: ContentBlock) => {
    switch (block.type) {
      case "image":
        return (
          <div className="relative aspect-video rounded-lg overflow-hidden bg-accent/20">
            {block.content && (
              
              <img
                src={block.content}
                alt={block.title || "Image"}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        );
      case "video":
        return (
          <div className="relative aspect-video rounded-lg overflow-hidden bg-accent/20">
            {block.content.includes("youtube.com") || block.content.includes("vimeo.com") ? (
              <iframe
                src={block.content.replace("watch?v=", "embed/")}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
              />
            ) : (
              <video
                src={block.content}
                controls
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
          </div>
        );
      case "audio":
        return (
          <div className="p-4 rounded-lg bg-accent/20">
            <audio src={block.content} controls className="w-full" />
          </div>
        );
      case "pdf":
        return (
          <div className="p-4 rounded-lg bg-accent/20 flex items-center gap-3">
            <File className="w-8 h-8 text-red-500" />
            <div>
              <p className="font-medium">{block.title || "PDF Document"}</p>
              <a
                href={block.content}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                View PDF
              </a>
            </div>
          </div>
        );
      case "zip":
        return (
          <div className="p-4 rounded-lg bg-accent/20 flex items-center gap-3">
            <FolderOpen className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="font-medium">{block.title || "Archive"}</p>
              <a
                href={block.content}
                download
                className="text-sm text-primary hover:underline"
              >
                Download
              </a>
            </div>
          </div>
        );
      case "code":
        return (
          <div className="rounded-lg overflow-hidden bg-zinc-900">
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border-b border-zinc-700">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-zinc-400 font-mono">
                {block.title || "code.tsx"}
              </span>
            </div>
            <pre className="p-4 text-sm text-zinc-300 overflow-x-auto max-h-64">
              <code dangerouslySetInnerHTML={{ __html: highlightCode(block.content, block.title || "") }} />
            </pre>
          </div>
        );
      case "text":
      default:
        return (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap">{block.content}</p>
          </div>
        );
    }
  };

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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="font-serif text-3xl md:text-4xl">Admin Portal</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Drag-and-drop content builder
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={cn(
                "p-2 rounded-xl transition-colors duration-300",
                previewMode ? "bg-primary text-primary-foreground" : "glass-card"
              )}
            >
              {previewMode ? <Edit3 className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl glass-card hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </motion.header>

        {!previewMode ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Section List */}
            <div className="lg:col-span-1 space-y-4">
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-lg flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Sections
                  </h3>
                  <button
                    onClick={addSection}
                    className="p-1.5 rounded-lg hover:bg-accent transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "w-full p-3 rounded-xl text-left transition-all duration-300",
                        activeSection === section.id
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{section.title}</span>
                        <span className="text-xs opacity-70">
                          {section.blocks.length} blocks
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="glass-card p-4">
                <h4 className="text-sm font-medium mb-3">Statistics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Sections</span>
                    <span className="font-mono">{sections.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Blocks</span>
                    <span className="font-mono">
                      {sections.reduce((acc, s) => acc + s.blocks.length, 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              {activeSection ? (
                <>
                  {/* Section Header */}
                  <div className="flex items-center justify-between mb-4">
                    <input
                      type="text"
                      value={sections.find((s) => s.id === activeSection)?.title || ""}
                      onChange={(e) =>
                        saveSections(
                          sections.map((s) =>
                            s.id === activeSection ? { ...s, title: e.target.value } : s
                          )
                        )
                      }
                      className="font-serif text-xl bg-transparent border-b border-transparent hover:border-border focus:border-primary outline-none transition-colors"
                    />
                    <div className="flex gap-2">
                      <select
                        value={sections.find((s) => s.id === activeSection)?.layout || "full"}
                        onChange={(e) =>
                          saveSections(
                            sections.map((s) =>
                              s.id === activeSection
                                ? { ...s, layout: e.target.value as "full" | "half" | "third" }
                                : s
                            )
                          )
                        }
                        className="p-2 rounded-lg bg-accent text-sm"
                      >
                        <option value="full">Full Width</option>
                        <option value="half">Half Width</option>
                        <option value="third">Third Width</option>
                      </select>
                      <button
                        onClick={() => setIsAddingBlock(true)}
                        className="btn-premium flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Block
                      </button>
                    </div>
                  </div>

                  {/* Add/Edit Block Form */}
                  <AnimatePresence>
                    {isAddingBlock && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="glass-card p-6 mb-6 overflow-hidden"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-serif text-xl">
                            {editingBlock ? "Edit Block" : "Add New Block"}
                          </h3>
                          <button onClick={resetForm} className="p-2 hover:bg-accent rounded-lg">
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Content Type Selector */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-2">Content Type</label>
                          <div className="flex flex-wrap gap-2">
                            {(Object.keys(contentTypeConfig) as ContentType[]).map((type) => {
                              const config = contentTypeConfig[type];
                              return (
                                <button
                                  key={type}
                                  onClick={() => setFormData((p) => ({ ...p, type }))}
                                  className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors duration-300",
                                    formData.type === type
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-accent hover:bg-accent/80"
                                  )}
                                >
                                  <config.icon className={cn("w-4 h-4", config.color)} />
                                  {config.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Title */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-2">Title</label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                            className="form-input"
                            placeholder="Enter title..."
                          />
                        </div>

                        {/* Description */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-2">Description</label>
                          <input
                            type="text"
                            value={formData.description}
                            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                            className="form-input"
                            placeholder="Enter description..."
                          />
                        </div>

                        {/* Content / File Upload */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-2">Content</label>
                          {formData.type !== "text" && formData.type !== "code" ? (
                            <div className="space-y-3">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={formData.content}
                                  onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
                                  className="form-input flex-1"
                                  placeholder="Enter URL..."
                                />
                                <label className="p-3 rounded-xl bg-accent hover:bg-accent/80 transition-colors cursor-pointer">
                                  <input
                                    type="file"
                                    accept={contentTypeConfig[formData.type].accept}
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleFileUpload(file, formData.type);
                                    }}
                                  />
                                  {isUploading ? (
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                      className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full"
                                    />
                                  ) : (
                                    <Upload className="w-5 h-5" />
                                  )}
                                </label>
                              </div>
                              {formData.content && formData.type === "image" && (
                                <div className="relative h-40 rounded-lg overflow-hidden">
                                  
                                  <img
                                    src={formData.content}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          ) : (
                            <textarea
                              value={formData.content}
                              onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
                              className={cn(
                                "form-input h-48 resize-none",
                                formData.type === "code" && "font-mono text-sm"
                              )}
                              placeholder={formData.type === "code" ? "Paste your code here..." : "Enter content..."}
                            />
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={editingBlock ? updateBlock : addBlock}
                            className="btn-premium flex items-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            {editingBlock ? "Update" : "Save"}
                          </button>
                          <button
                            onClick={resetForm}
                            className="px-4 py-2 rounded-xl border border-border hover:bg-accent transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Blocks List with Drag & Drop */}
                  <Reorder.Group
                    axis="y"
                    values={sections.find((s) => s.id === activeSection)?.blocks || []}
                    onReorder={(blocks) => reorderBlocks(activeSection, blocks)}
                    className="space-y-4"
                  >
                    <AnimatePresence>
                      {(sections.find((s) => s.id === activeSection)?.blocks || []).map((block) => {
                        const config = contentTypeConfig[block.type];
                        return (
                          <Reorder.Item
                            key={block.id}
                            value={block}
                            className="glass-card p-4 cursor-grab active:cursor-grabbing"
                          >
                            <div className="flex items-start gap-4">
                              <div className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                                <GripVertical className="w-5 h-5" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <config.icon className={cn("w-4 h-4", config.color)} />
                                  <span className="text-sm font-medium">{block.title || config.label}</span>
                                  <span className="text-xs text-muted-foreground font-mono">
                                    {new Date(block.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="text-sm text-muted-foreground line-clamp-2">
                                  {block.description || block.content.substring(0, 100)}
                                </div>
                              </div>

                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    setFormData({
                                      type: block.type,
                                      title: block.title,
                                      content: block.content,
                                      description: block.description || "",
                                    });
                                    setEditingBlock(block);
                                    setIsAddingBlock(true);
                                  }}
                                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteBlock(activeSection, block.id)}
                                  className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </Reorder.Item>
                        );
                      })}
                    </AnimatePresence>
                  </Reorder.Group>

                  {/* Empty State */}
                  {(sections.find((s) => s.id === activeSection)?.blocks || []).length === 0 &&
                    !isAddingBlock && (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                          <Layout className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground">
                          No blocks yet. Click &quot;Add Block&quot; to start building.
                        </p>
                      </div>
                    )}
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                    <Layers className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-serif text-xl mb-2">Select a Section</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Choose a section from the sidebar or create a new one to start building your page.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Preview Mode */
          <div className="space-y-12">
            {sections.map((section) => (
              <motion.section
                key={section.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 md:p-8"
              >
                <h2 className="font-serif text-2xl mb-6">{section.title}</h2>
                <div
                  className={cn(
                    "grid gap-6",
                    section.layout === "half" && "md:grid-cols-2",
                    section.layout === "third" && "md:grid-cols-3"
                  )}
                >
                  {section.blocks.map((block) => (
                    <div key={block.id} className="space-y-2">
                      {block.title && <h3 className="font-serif text-lg">{block.title}</h3>}
                      {block.description && (
                        <p className="text-sm text-muted-foreground">{block.description}</p>
                      )}
                      {renderBlockContent(block)}
                    </div>
                  ))}
                </div>
              </motion.section>
            ))}

            {sections.every((s) => s.blocks.length === 0) && (
              <div className="text-center py-20">
                <p className="text-muted-foreground">No content to preview. Add some blocks first!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
