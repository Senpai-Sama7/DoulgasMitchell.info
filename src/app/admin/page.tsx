"use client";

import { useState, useEffect, useCallback, useRef, useMemo, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  startAuthentication,
  startRegistration,
  type AuthenticationResponseJSON,
  type RegistrationResponseJSON,
} from "@simplewebauthn/browser";
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
  Fingerprint,
  LayoutGrid,
} from "lucide-react";
import { CSS } from "@dnd-kit/utilities";
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { MainLayout } from "@/components/main-layout";
import { journalEntries as fallbackJournalEntries } from "@/lib/data";
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

type Tab = "gallery" | "journal" | "layout" | "settings" | "activity" | "analytics" | "export";

interface LayoutBlock {
  id: string;
  key: string;
  label: string;
  type: "hero" | "gallery" | "journal" | "custom";
  gridX: number;
  gridY: number;
  width: number;
  height: number;
  metadata?: Record<string, unknown>;
}

function normalizeApiItems<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "items" in data &&
    Array.isArray((data as { items?: unknown }).items)
  ) {
    return (data as { items: T[] }).items;
  }

  return [];
}

function extractApiErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload !== "object" || payload === null) {
    return fallback;
  }

  const response = payload as {
    error?: unknown;
    details?: unknown;
  };

  if (typeof response.error === "string" && response.error.trim().length > 0) {
    if (response.error !== "Validation failed" && response.error !== "Internal server error") {
      return response.error;
    }
  }

  if (
    typeof response.details === "object" &&
    response.details !== null &&
    "errors" in response.details
  ) {
    const errors = (response.details as { errors?: unknown }).errors;
    if (Array.isArray(errors)) {
      const firstError = errors.find(
        (item): item is { message: string } =>
          typeof item === "object" &&
          item !== null &&
          "message" in item &&
          typeof (item as { message?: unknown }).message === "string"
      );

      if (firstError?.message) {
        return firstError.message;
      }
    }
  }

  if (typeof response.error === "string" && response.error.trim().length > 0) {
    return response.error;
  }

  return fallback;
}

function extractImportPayload(input: unknown): Record<string, unknown> {
  if (typeof input !== "object" || input === null) {
    return {};
  }

  const hasImportKeys = (value: unknown): value is Record<string, unknown> => {
    if (typeof value !== "object" || value === null) {
      return false;
    }

    const candidate = value as Record<string, unknown>;
    return (
      "gallery" in candidate ||
      "galleryImages" in candidate ||
      "journal" in candidate ||
      "journalEntries" in candidate ||
      "settings" in candidate
    );
  };

  const root = input as Record<string, unknown>;
  const firstData = root.data;
  const secondData =
    typeof firstData === "object" && firstData !== null
      ? (firstData as Record<string, unknown>).data
      : undefined;

  const candidates: unknown[] = [root, firstData, secondData];
  const payload = candidates.find(hasImportKeys);
  return payload ?? {};
}

const fallbackJournalLookup = new Map(
  fallbackJournalEntries.map((entry) => [entry.id, entry])
);

function containsCjkText(value: string): boolean {
  return /[\u3400-\u9fff]/.test(value);
}

// Series options
const seriesOptions = [
  { value: "recent-post", label: "Recent Post" },
  { value: "tech-deck", label: "Tech Deck" },
  { value: "project", label: "Project" },
] as const;

const layoutTypeOptions = [
  { value: "hero", label: "Hero/Intro" },
  { value: "gallery", label: "Gallery" },
  { value: "journal", label: "Journal" },
  { value: "custom", label: "Custom Widget" },
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
  const [isPasskeyLoading, setIsPasskeyLoading] = useState(false);
  const [isPasskeySupported, setIsPasskeySupported] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkSupport = async () => {
      if (
        typeof window === "undefined" ||
        typeof window.PublicKeyCredential === "undefined"
      ) {
        return;
      }

      if (
        typeof window.PublicKeyCredential
          .isUserVerifyingPlatformAuthenticatorAvailable !== "function"
      ) {
        if (!cancelled) {
          setIsPasskeySupported(true);
        }
        return;
      }

      try {
        const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (!cancelled) {
          setIsPasskeySupported(available);
        }
      } catch {
        if (!cancelled) {
          setIsPasskeySupported(false);
        }
      }
    };

    checkSupport();

    return () => {
      cancelled = true;
    };
  }, []);

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

      const data: unknown = await res.json().catch(() => null);
      const isSuccessResponse =
        typeof data === "object" &&
        data !== null &&
        "success" in data &&
        (data as { success?: unknown }).success === true;

      if (res.ok && isSuccessResponse) {
        onLogin();
        return;
      }

      const apiError =
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof (data as { error?: unknown }).error === "string"
          ? (data as { error: string }).error
          : "";

      if (res.status === 429) {
        setError(apiError || "Too many login attempts. Please wait and try again.");
        return;
      }

      if (res.status >= 500 || apiError === "Internal server error") {
        setError("Authentication service is currently unavailable. Please try again.");
        return;
      }

      setError(apiError || "Invalid password");
    } catch {
      setError("Authentication service is currently unavailable. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    setIsPasskeyLoading(true);
    setError("");

    try {
      const optionsRes = await fetch("/api/admin/passkey/auth/options", {
        method: "POST",
      });
      const optionsData = await optionsRes.json();

      if (!optionsRes.ok || !optionsData.success || !optionsData.data?.options) {
        setError(
          extractApiErrorMessage(
            optionsData,
            "Passkey login is currently unavailable. Use your password."
          )
        );
        return;
      }

      const response: AuthenticationResponseJSON = await startAuthentication({
        optionsJSON: optionsData.data.options,
      });

      const verifyRes = await fetch("/api/admin/passkey/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response }),
      });
      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.success) {
        onLogin();
        return;
      }

      setError(extractApiErrorMessage(verifyData, "Passkey authentication failed."));
    } catch (error) {
      if (error instanceof Error && error.name === "NotAllowedError") {
        setError("Passkey request was cancelled");
        return;
      }

      setError("Passkey authentication failed");
    } finally {
      setIsPasskeyLoading(false);
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
          Sign in with password or passkey biometrics
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
              aria-label="Admin password"
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
            disabled={isLoading || isPasskeyLoading}
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

        {isPasskeySupported && (
          <>
            <button
              type="button"
              onClick={handlePasskeyLogin}
              disabled={isLoading || isPasskeyLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-accent transition-colors disabled:opacity-60"
              aria-label="Sign in with Face ID or passkey"
            >
              {isPasskeyLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying Passkey...
                </>
              ) : (
                <>
                  <Fingerprint className="w-4 h-4" />
                  Sign in with Face ID / Passkey
                </>
              )}
            </button>
            <p className="text-xs text-muted-foreground mt-2">
              Passkeys work best inside Safari (iOS/macOS) or compatible browsers with WebAuthn. Use the same domain when registering and logging in: douglasmitchell.info or www.douglasmitchell.info.
            </p>
          </>
        )}
        </form>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Password is configured by server-side <code>ADMIN_PASSWORD</code>
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
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={label}
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
            type="button"
            aria-label="Rotate preview image"
          >
            <RotateCcw className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.1, 2))}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            type="button"
            aria-label="Zoom preview image"
          >
            <ZoomIn className="w-4 h-4 text-white" />
          </button>
          {onCrop && (
            <button
              onClick={onCrop}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              type="button"
              aria-label="Crop preview image"
            >
              <Crop className="w-4 h-4 text-white" />
            </button>
          )}
          <button
            onClick={onRemove}
            className="p-2 rounded-lg bg-destructive/80 hover:bg-destructive transition-colors"
            type="button"
            aria-label="Remove preview image"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface SortableLayoutBlockProps {
  block: LayoutBlock;
  onUpdate: (updates: Partial<LayoutBlock>) => void;
  onRemove: () => void;
}

function SortableLayoutBlock({ block, onUpdate, onRemove }: SortableLayoutBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.key,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.95 : 1,
    zIndex: isDragging ? 20 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "glass-card space-y-3 p-4 border border-border transition-all",
        isDragging
          ? "ring-2 ring-primary/60 shadow-2xl bg-background"
          : "shadow-lg bg-card"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="p-2 rounded-lg border border-border bg-accent/40 hover:bg-accent/60 transition-colors"
            aria-label={`Drag layout block ${block.label}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={block.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="form-input text-sm"
            placeholder="Block label"
            aria-label="Layout block label"
          />
        </div>
        <button
          onClick={onRemove}
          className="text-xs uppercase tracking-widest text-destructive"
          type="button"
        >
          Remove
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground uppercase tracking-wide">Type</label>
        <select
          value={block.type}
          onChange={(e) =>
            onUpdate({ type: e.target.value as LayoutBlock["type"] })
          }
          className="form-input"
        >
          {layoutTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Width</label>
          <input
            type="number"
            min={1}
            max={12}
            value={block.width}
            onChange={(e) => onUpdate({ width: Number(e.target.value) || 1 })}
            className="form-input"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Height</label>
          <input
            type="number"
            min={1}
            max={6}
            value={block.height}
            onChange={(e) => onUpdate({ height: Number(e.target.value) || 1 })}
            className="form-input"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Grid X</label>
          <input
            type="number"
            min={0}
            value={block.gridX}
            onChange={(e) => onUpdate({ gridX: Number(e.target.value) || 0 })}
            className="form-input"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wide">Grid Y</label>
          <input
            type="number"
            min={0}
            value={block.gridY}
            onChange={(e) => onUpdate({ gridY: Number(e.target.value) || 0 })}
            className="form-input"
          />
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Blocks with `gridY` will stack vertically; width/height determine proportion.
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
            type="button"
            aria-label={tool.title}
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
      .replace(/^### (.*$)/gm, '<h4 class="text-lg font-semibold mt-4 mb-2">$1</h4>')
      .replace(/^## (.*$)/gm, '<h3 class="text-xl font-serif font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^# (.*$)/gm, '<h2 class="text-2xl font-serif font-bold mt-4 mb-3">$1</h2>')
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
  const [uploadError, setUploadError] = useState<string>("");
  const [, startTabTransition] = useTransition();

  // Data states
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [settings, setSettings] = useState<Settings>({
    siteTitle: "Douglas Mitchell",
    siteDescription: "A personal portfolio exploring architecture, technology, and creative expression",
  });
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [layoutBlocks, setLayoutBlocks] = useState<LayoutBlock[]>([]);
  const [layoutMessage, setLayoutMessage] = useState("");
  const [layoutSaving, setLayoutSaving] = useState(false);
  const layoutSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const handleLayoutDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLayoutBlocks((prev) => {
      const oldIndex = prev.findIndex((block) => block.key === active.id);
      const newIndex = prev.findIndex((block) => block.key === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  }, []);

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
  const [isPasskeyRegistering, setIsPasskeyRegistering] = useState(false);
  const [passkeyStatus, setPasskeyStatus] = useState({
    hasPasskey: false,
    passkeyCount: 0,
  });
  const [passkeyMessage, setPasskeyMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAllPosts, setIsDeletingAllPosts] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Form states
  const [imageForm, setImageForm] = useState({
    src: "",
    alt: "",
    caption: "",
    series: "recent-post" as GalleryImage["series"],
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

  // Handle session expiry during active session
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleApiError = async (response: Response) => {
      if (response.status === 401) {
        // Session expired or invalid
        setIsAuthenticated(false);
      }
    };

    // Intercept fetch calls to detect 401s
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (args[0] && typeof args[0] === "string" && args[0].startsWith("/api/")) {
        await handleApiError(response.clone());
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [isAuthenticated]);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchGalleryImages();
      fetchJournalEntries();
      fetchSettings();
      fetchActivityLog();
      fetchPasskeyStatus();
      fetchLayoutBlocks();
    }
  }, [isAuthenticated]);

  // Fetch functions
  const fetchGalleryImages = async () => {
    try {
      const res = await fetch("/api/gallery");
      const data = await res.json();
      if (data.success) {
        const items = normalizeApiItems<GalleryImage>(data.data).flatMap((item) => {
          if (typeof item !== "object" || item === null) {
            return [];
          }

          const series = item.series;
          if (series !== "recent-post" && series !== "tech-deck" && series !== "project") {
            return [];
          }

          return [{
            ...item,
            src: typeof item.src === "string" ? item.src : "",
            alt: typeof item.alt === "string" ? item.alt : "Untitled image",
            caption: typeof item.caption === "string" ? item.caption : "",
            width: typeof item.width === "number" ? item.width : 1,
            height: typeof item.height === "number" ? item.height : 1,
            date:
              typeof item.date === "string" && item.date.length > 0
                ? item.date
                : new Date().toISOString().split("T")[0],
            order: typeof item.order === "number" ? item.order : 0,
            series,
          }];
        });
        setGalleryImages(items);
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
        const items = normalizeApiItems<JournalEntry>(data.data).map((entry) => {
          const safeTags = Array.isArray(entry.tags)
            ? entry.tags.filter((tag): tag is string => typeof tag === "string")
            : [];

          const safeTitle = typeof entry.title === "string" ? entry.title : "Untitled entry";
          const safeContent = typeof entry.content === "string" ? entry.content : "";
          const safeDate =
            typeof entry.date === "string" && entry.date.length > 0
              ? entry.date
              : new Date().toISOString().split("T")[0];
          const safeImage =
            typeof entry.image === "string" && entry.image.length > 0
              ? entry.image
              : "/images/journal/jr-1.png";
          const safeImageAlt =
            typeof entry.imageAlt === "string" && entry.imageAlt.length > 0
              ? entry.imageAlt
              : "Journal image";

          const fallback =
            typeof entry.id === "string" ? fallbackJournalLookup.get(entry.id) : undefined;

          const shouldApplyFallback =
            Boolean(fallback) &&
            (containsCjkText(safeTitle) ||
              containsCjkText(safeContent) ||
              safeTags.some((tag) => containsCjkText(tag)));

          return {
            ...entry,
            title: shouldApplyFallback ? fallback!.title : safeTitle,
            content: shouldApplyFallback ? fallback!.content : safeContent,
            date: shouldApplyFallback ? fallback!.date : safeDate,
            image: shouldApplyFallback ? fallback!.image : safeImage,
            imageAlt: shouldApplyFallback ? fallback!.imageAlt : safeImageAlt,
            quote:
              shouldApplyFallback
                ? fallback!.quote
                : typeof entry.quote === "string"
                  ? entry.quote
                  : undefined,
            tags: shouldApplyFallback ? fallback!.tags : safeTags,
          };
        });
        setJournalEntries(items);
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
        if (
          typeof data.data === "object" &&
          data.data !== null &&
          typeof data.data.siteTitle === "string" &&
          typeof data.data.siteDescription === "string"
        ) {
          setSettings(data.data as Settings);
        }
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
        const items = normalizeApiItems<ActivityLog>(data.data);
        setActivityLog(items);
      }
    } catch (error) {
      console.error("Error fetching activity log:", error);
    }
  };

  const fetchPasskeyStatus = async () => {
    try {
      const res = await fetch("/api/admin/passkey/status");
      const data = await res.json();

      if (res.ok && data.success && data.data) {
        setPasskeyStatus({
          hasPasskey: Boolean(data.data.hasPasskey),
          passkeyCount:
            typeof data.data.passkeyCount === "number" ? data.data.passkeyCount : 0,
        });
        setPasskeyMessage("");
        return;
      }

      setPasskeyStatus({ hasPasskey: false, passkeyCount: 0 });
      setPasskeyMessage(extractApiErrorMessage(data, "Passkey status is currently unavailable."));
    } catch (error) {
      console.error("Error fetching passkey status:", error);
      setPasskeyStatus({ hasPasskey: false, passkeyCount: 0 });
    }
  };

  const registerPasskey = async () => {
    setIsPasskeyRegistering(true);
    setPasskeyMessage("");

    try {
      const optionsRes = await fetch("/api/admin/passkey/register/options", {
        method: "POST",
      });
      const optionsData = await optionsRes.json();

      if (!optionsRes.ok || !optionsData.success || !optionsData.data?.options) {
        setPasskeyMessage(
          extractApiErrorMessage(optionsData, "Unable to start passkey registration")
        );
        return;
      }

      const response: RegistrationResponseJSON = await startRegistration({
        optionsJSON: optionsData.data.options,
      });

      const verifyRes = await fetch("/api/admin/passkey/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.success) {
        setPasskeyMessage(extractApiErrorMessage(verifyData, "Passkey registration failed"));
        return;
      }

      setPasskeyMessage("Passkey registered successfully.");
      await fetchPasskeyStatus();
      await fetchActivityLog();
    } catch (error) {
      if (error instanceof Error && error.name === "NotAllowedError") {
        setPasskeyMessage("Passkey registration was cancelled.");
      } else {
        setPasskeyMessage("Passkey registration failed.");
      }
    } finally {
      setIsPasskeyRegistering(false);
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
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "images");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.data?.url) {
        return data.data.url;
      }
      const errorMsg = data.error || "Upload failed";
      setUploadError(errorMsg);
      throw new Error(errorMsg);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      setUploadError(message);
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

  const deleteAllJournalEntries = async () => {
    if (journalEntries.length === 0) {
      alert("No journal entries to delete.");
      return;
    }

    const confirmation = prompt(
      `Type DELETE ALL POSTS to permanently delete ${journalEntries.length} journal entries.`
    );

    if (confirmation !== "DELETE ALL POSTS") {
      return;
    }

    try {
      setIsDeletingAllPosts(true);
      const res = await fetch("/api/journal?all=true", { method: "DELETE" });
      const data = await res.json();

      if (!data.success) {
        alert(
          typeof data.error === "string"
            ? data.error
            : "Failed to delete all journal entries."
        );
        return;
      }

      fetchJournalEntries();
      fetchActivityLog();
      alert(
        typeof data.message === "string"
          ? data.message
          : "All journal entries deleted."
      );
    } catch (error) {
      console.error("Error deleting all entries:", error);
      alert("Failed to delete all journal entries.");
    } finally {
      setIsDeletingAllPosts(false);
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

  const replayEntranceOverlay = () => {
    if (typeof window === "undefined") {
      return;
    }
    window.open("/?intro=reset", "_blank", "noopener,noreferrer");
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

  const changePassword = async () => {
    if (isChangingPassword) return;
    setPasswordMessage("");

    try {
      setIsChangingPassword(true);
      const res = await fetch("/api/admin/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setPasswordMessage("Password updated. Use it on your next login.");
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        return;
      }

      setPasswordMessage(extractApiErrorMessage(data, "Unable to update password"));
    } catch (error) {
      console.error("Password change failed:", error);
      setPasswordMessage("Unable to update password right now.");
    } finally {
      setIsChangingPassword(false);
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
      a.download = `douglas-mitchell-export-${new Date().toISOString().split("T")[0]}.json`;
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
      const parsedFile = JSON.parse(text);
      const payload = extractImportPayload(parsedFile);

      if (Object.keys(payload).length === 0) {
        alert("Import failed. File does not contain supported gallery, journal, or settings data.");
        return;
      }

      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: payload, mode: "merge" }),
      });

      const result = await res.json();
      if (result.success) {
        fetchGalleryImages();
        fetchJournalEntries();
        fetchSettings();
        fetchActivityLog();
        const importResults =
          typeof result.data === "object" &&
          result.data !== null &&
          "results" in result.data &&
          typeof (result.data as { results?: unknown }).results === "object" &&
          (result.data as { results?: unknown }).results !== null
            ? ((result.data as { results: Record<string, Record<string, number>> }).results)
            : null;

        if (importResults) {
          alert(
            `Import successful! Gallery: ${importResults.gallery?.created ?? 0} created, ${importResults.gallery?.updated ?? 0} updated. Journal: ${importResults.journal?.created ?? 0} created, ${importResults.journal?.updated ?? 0} updated.`
          );
        } else {
          alert("Import successful.");
        }
        return;
      }

      alert(typeof result.error === "string" ? result.error : "Import failed. Please check the file format.");
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

  const fetchLayoutBlocks = useCallback(async () => {
    try {
      const res = await fetch("/api/layout");
      const data = await res.json();
      if (res.ok && Array.isArray(data.data)) {
        setLayoutBlocks(data.data);
      } else {
        console.error("Failed to load layout blocks", data);
      }
    } catch (error) {
      console.error("Error fetching layout", error);
    }
  }, []);

  const saveLayoutBlocks = async () => {
    try {
      setLayoutSaving(true);
      const res = await fetch("/api/layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks: layoutBlocks }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLayoutMessage("Layout saved.");
        setLayoutBlocks(data.data);
        return;
      }
      setLayoutMessage(typeof data.error === "string" ? data.error : "Failed to save layout");
    } catch (error) {
      console.error("Error saving layout", error);
      setLayoutMessage("Unable to save layout right now.");
    } finally {
      setLayoutSaving(false);
    }
  };

  const updateLayoutBlock = (key: string, updates: Partial<LayoutBlock>) => {
    setLayoutBlocks((prev) =>
      prev.map((block) => (block.key === key ? { ...block, ...updates } : block))
    );
  };

  const addLayoutBlock = () => {
    const newBlock: LayoutBlock = {
      id: `temp-${Date.now()}`,
      key: `block-${Date.now()}`,
      label: "New block",
      type: "custom",
      gridX: 0,
      gridY: layoutBlocks.length,
      width: 4,
      height: 2,
    };
    setLayoutBlocks((prev) => [...prev, newBlock]);
  };

  const removeLayoutBlock = (key: string) => {
    setLayoutBlocks((prev) => prev.filter((block) => block.key !== key));
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
        (typeof entry.title === "string" ? entry.title : "").toLowerCase().includes(query) ||
        (typeof entry.content === "string" ? entry.content : "")
          .toLowerCase()
          .includes(query) ||
        (Array.isArray(entry.tags) ? entry.tags : []).some((tag) =>
          (typeof tag === "string" ? tag : "").toLowerCase().includes(query)
        )
    );
  }, [journalEntries, journalSearch]);

  const gallerySeriesCounts = useMemo(() => {
    const counts: Record<GalleryImage["series"], number> = {
      "recent-post": 0,
      "tech-deck": 0,
      project: 0,
    };

    for (const image of galleryImages) {
      counts[image.series] += 1;
    }

    return counts;
  }, [galleryImages]);

  const journalTagCount = useMemo(() => {
    return new Set(
      journalEntries.flatMap((entry) => (Array.isArray(entry.tags) ? entry.tags : []))
    ).size;
  }, [journalEntries]);

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
            type="button"
            aria-label="Log out from admin portal"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </motion.header>

        {/* Tabs */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 mb-6 p-1 rounded-xl bg-accent/30">
        {[
          { key: "gallery", label: "Gallery", icon: ImageIcon },
          { key: "layout", label: "Custom Layout", icon: LayoutGrid },
          { key: "journal", label: "Library", icon: FileText },
          { key: "settings", label: "Settings", icon: Settings },
          { key: "activity", label: "Activity", icon: Activity },
          { key: "analytics", label: "Analytics", icon: BarChart3 },
          { key: "export", label: "Export/Import", icon: Download },
        ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                startTabTransition(() => setActiveTab(tab.key as Tab));
              }}
              className={cn(
                "flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-150 min-h-10",
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
              type="button"
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
              <h2 className="font-serif text-xl">Gallery Library</h2>

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
                    type="button"
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
                      type="button"
                    >
                      {series.label} ({gallerySeriesCounts[series.value]})
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
                      aria-label="Search gallery images"
                    />
                  </div>
                  <button
                    onClick={() => setShowGalleryModal(true)}
                    className="btn-premium flex items-center gap-2"
                    type="button"
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
                      type="button"
                      aria-label="Delete selected images"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedImages([])}
                      className="px-3 py-1.5 rounded-lg bg-accent text-sm"
                      type="button"
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
                      type="button"
                      aria-label={
                        selectedImages.includes(image.id)
                          ? `Unselect image ${image.alt}`
                          : `Select image ${image.alt}`
                      }
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
                        type="button"
                        aria-label={`Edit image ${image.alt}`}
                      >
                        <Edit3 className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={() => deleteGalleryImage(image.id)}
                        className="p-2 rounded-lg bg-destructive/80 hover:bg-destructive transition-colors"
                        type="button"
                        aria-label={`Delete image ${image.alt}`}
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

          {/* Layout Tab */}
          {activeTab === "layout" && (
            <motion.div
              key="layout"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h2 className="font-serif text-xl">Layout Builder</h2>
                <div className="flex gap-2">
                  <button
                    onClick={addLayoutBlock}
                    className="btn-premium border border-border bg-background text-foreground"
                    type="button"
                  >
                    <Plus className="w-4 h-4" />
                    Add Block
                  </button>
                  <button
                    onClick={saveLayoutBlocks}
                    className="btn-premium"
                    type="button"
                    disabled={layoutSaving}
                  >
                    {layoutSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Save Layout"
                    )}
                  </button>
                </div>
              </div>

              {layoutMessage && (
                <div className="text-sm text-muted-foreground">{layoutMessage}</div>
              )}

              <DndContext
                sensors={layoutSensors}
                collisionDetection={closestCenter}
                onDragEnd={handleLayoutDragEnd}
              >
                <SortableContext
                  items={layoutBlocks.map((block) => block.key)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {layoutBlocks.map((block) => (
                      <SortableLayoutBlock
                        key={block.key}
                        block={block}
                        onUpdate={(updates) => updateLayoutBlock(block.key, updates)}
                        onRemove={() => removeLayoutBlock(block.key)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {layoutBlocks.length === 0 && (
                <div className="text-center text-sm text-muted-foreground">
                  No layout blocks defined yet. Add new ones above.
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
              <h2 className="font-serif text-xl">Journal Library</h2>

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
                    aria-label="Search journal entries"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={deleteAllJournalEntries}
                    className="px-3 py-2 rounded-xl border border-destructive/40 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    type="button"
                    disabled={isDeletingAllPosts || journalEntries.length === 0}
                    aria-label="Delete all journal entries"
                  >
                    {isDeletingAllPosts ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    {isDeletingAllPosts ? "Deleting..." : "Delete All Posts"}
                  </button>
                  <button
                    onClick={() => setShowJournalModal(true)}
                    className="btn-premium flex items-center gap-2"
                    type="button"
                  >
                    <Plus className="w-4 h-4" />
                    New Entry
                  </button>
                </div>
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
                                tags: Array.isArray(entry.tags) ? entry.tags : [],
                              });
                              setShowJournalModal(true);
                            }}
                            className="p-2 hover:bg-accent rounded-lg transition-colors"
                            type="button"
                            aria-label={`Edit journal entry ${entry.title}`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteJournalEntry(entry.id)}
                            className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                            type="button"
                            aria-label={`Delete journal entry ${entry.title}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                        {entry.content}
                      </p>

                      <div className="flex gap-1 mt-2 flex-wrap">
                        {(Array.isArray(entry.tags) ? entry.tags : []).map((tag) => (
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
                    <label htmlFor="site-title" className="block text-sm font-medium mb-2">Site Title</label>
                    <input
                      id="site-title"
                      type="text"
                      value={settings.siteTitle}
                      onChange={(e) =>
                        setSettings((p) => ({ ...p, siteTitle: e.target.value }))
                      }
                      className="form-input w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="site-description" className="block text-sm font-medium mb-2">
                      Site Description
                    </label>
                    <textarea
                      id="site-description"
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
                        id="social-linkedin"
                        type="url"
                        placeholder="LinkedIn URL"
                        value={settings.linkedin || ""}
                        onChange={(e) =>
                          setSettings((p) => ({ ...p, linkedin: e.target.value }))
                        }
                        className="form-input flex-1"
                        aria-label="LinkedIn URL"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <Github className="w-5 h-5 text-muted-foreground" />
                      <input
                        id="social-github"
                        type="url"
                        placeholder="GitHub URL"
                        value={settings.github || ""}
                        onChange={(e) =>
                          setSettings((p) => ({ ...p, github: e.target.value }))
                        }
                        className="form-input flex-1"
                        aria-label="GitHub URL"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-muted-foreground" />
                      <input
                        id="social-telegram"
                        type="url"
                        placeholder="Telegram URL"
                        value={settings.telegram || ""}
                        onChange={(e) =>
                          setSettings((p) => ({ ...p, telegram: e.target.value }))
                        }
                        className="form-input flex-1"
                        aria-label="Telegram URL"
                      />
                    </div>
                  </div>

                  <h3 className="font-serif text-lg flex items-center gap-2 pt-4 border-t border-border">
                    <Fingerprint className="w-4 h-4" />
                    Biometric Login
                  </h3>

                  <div className="rounded-xl border border-border bg-background/60 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">
                          Passkeys registered: {passkeyStatus.passkeyCount}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Use Face ID / Touch ID / Windows Hello to sign in faster.
                        </p>
                      </div>
                      <span
                        className={cn(
                          "text-xs px-2.5 py-1 rounded-full border",
                          passkeyStatus.hasPasskey
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/30"
                        )}
                      >
                        {passkeyStatus.hasPasskey ? "Configured" : "Not configured"}
                      </span>
                    </div>

                    <button
                      onClick={registerPasskey}
                      className="w-full rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-60"
                      type="button"
                      disabled={isPasskeyRegistering}
                    >
                      {isPasskeyRegistering ? "Registering passkey..." : "Register new passkey"}
                    </button>

                    {passkeyMessage && (
                      <p className="text-xs text-muted-foreground">{passkeyMessage}</p>
                    )}
                  </div>

                  <div className="rounded-xl border border-border bg-background/70 p-4 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Update the admin password. Provide the current password to confirm.
                    </p>
                    <div className="grid gap-2">
                      <input
                        type="password"
                        placeholder="Current password"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))
                        }
                        className="form-input"
                      />
                      <input
                        type="password"
                        placeholder="New password"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
                        }
                        className="form-input"
                      />
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))
                        }
                        className="form-input"
                      />
                    </div>
                    <button
                      onClick={changePassword}
                      className="w-full rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                      type="button"
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Change password"
                      )}
                    </button>
                    {passwordMessage && (
                      <p className="text-xs text-muted-foreground">{passwordMessage}</p>
                    )}
                  </div>

                  <h3 className="font-serif text-lg flex items-center gap-2 pt-4 border-t border-border">
                    <RotateCcw className="w-4 h-4" />
                    Experience
                  </h3>

                  <div className="rounded-xl border border-border bg-background/60 p-4 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Replay the home entrance overlay instantly on the main site.
                    </p>
                    <button
                      onClick={replayEntranceOverlay}
                      className="w-full rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
                      type="button"
                    >
                      Replay Entrance Overlay
                    </button>
                  </div>

                  <button onClick={saveSettings} className="btn-premium w-full" type="button">
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
                  type="button"
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
                    {journalTagCount}
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
                      const count = gallerySeriesCounts[series.value];
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
                  <h3 className="font-serif text-lg mb-4">Analytics</h3>
                  <div className="space-y-4">
                    <div className="text-center py-4 text-muted-foreground">
                      <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Use an external analytics dashboard</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <a
                        href="https://analytics.google.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 text-sm font-medium text-center flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Connect Google Analytics
                      </a>
                      <a
                        href="https://plausible.io/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 text-sm font-medium text-center flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Connect Plausible
                      </a>
                    </div>
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
                <button onClick={exportData} className="btn-premium w-full" type="button">
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
                    type="button"
                    aria-label="Close image editor"
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

                  {uploadError && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      {uploadError}
                    </div>
                  )}

                  {/* Form Fields */}
                  <div>
                    <label htmlFor="gallery-alt" className="block text-sm font-medium mb-2">
                      Alt Text
                    </label>
                    <input
                      id="gallery-alt"
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
                    <label htmlFor="gallery-caption" className="block text-sm font-medium mb-2">
                      Caption
                    </label>
                    <textarea
                      id="gallery-caption"
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
                      <label htmlFor="gallery-series" className="block text-sm font-medium mb-2">
                        Series
                      </label>
                      <select
                        id="gallery-series"
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
                      <label htmlFor="gallery-date" className="block text-sm font-medium mb-2">
                        Date
                      </label>
                      <input
                        id="gallery-date"
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
                    type="button"
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
                      type="button"
                      aria-label={journalPreview ? "Hide markdown preview" : "Show markdown preview"}
                    >
                      {journalPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={closeJournalModal}
                      className="p-2 hover:bg-accent rounded-lg"
                      type="button"
                      aria-label="Close journal editor"
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

                  {uploadError && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      {uploadError}
                    </div>
                  )}

                  {/* Form Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="journal-title" className="block text-sm font-medium mb-2">
                        Title
                      </label>
                      <input
                        id="journal-title"
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
                      <label htmlFor="journal-date" className="block text-sm font-medium mb-2">
                        Date
                      </label>
                      <input
                        id="journal-date"
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
                    <label htmlFor="journal-quote" className="block text-sm font-medium mb-2">
                      Quote (optional)
                    </label>
                    <input
                      id="journal-quote"
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
                    <label htmlFor="journal-tags" className="block text-sm font-medium mb-2">
                      Tags (comma separated)
                    </label>
                    <input
                      id="journal-tags"
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
                    type="button"
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
