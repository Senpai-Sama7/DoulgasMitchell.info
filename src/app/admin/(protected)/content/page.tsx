'use client';

import Link from 'next/link';
import { startTransition, useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  BookOpen,
  Check,
  Edit,
  Eye,
  FileText,
  Filter,
  FolderOpen,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const MarkdownEditor = lazy(() => import('@/components/admin/markdown-editor'));

type ContentType = 'article' | 'project' | 'certification' | 'book';

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  status: string;
  featured: boolean;
  updatedAt: string;
  href: string;
}

interface ContentApiResponse {
  success: boolean;
  editable: boolean;
  source: 'database' | 'fallback';
  warning: string | null;
  articles: ContentItem[];
  projects: ContentItem[];
  certifications: ContentItem[];
  books: ContentItem[];
}

type EditorFields = Record<string, string | boolean>;

interface EditorPayload {
  id?: string;
  type: ContentType;
  fields: EditorFields;
  updatedAt?: string;
}

interface EditorApiResponse {
  success: boolean;
  item?: EditorPayload;
  error?: string;
  details?: unknown;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function getStatusBadge(status: string) {
  const normalized = (status || '').toLowerCase();
  const variants: Record<string, { color: string; icon: typeof Check }> = {
    published: { color: 'bg-green-500/10 text-green-500', icon: Check },
    completed: { color: 'bg-green-500/10 text-green-500', icon: Check },
    draft: { color: 'bg-yellow-500/10 text-yellow-500', icon: Eye },
    archived: { color: 'bg-gray-500/10 text-gray-500', icon: X },
    'in-progress': { color: 'bg-blue-500/10 text-blue-500', icon: Eye },
  };

  const { color, icon: Icon } = variants[normalized] || variants.draft;

  return (
    <Badge variant="secondary" className={cn(color, 'flex w-fit items-center gap-1')}>
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function ContentTable({
  type,
  items,
  editable,
  onEdit,
  onDelete,
}: {
  type: ContentType;
  items: ContentItem[];
  editable: boolean;
  onEdit: (type: ContentType, item: ContentItem) => void;
  onDelete: (type: ContentType, item: ContentItem) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Featured</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
              No {type}s found.
            </TableCell>
          </TableRow>
        ) : (
          items.map((contentItem) => (
            <TableRow key={contentItem.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{contentItem.title}</p>
                  <p className="text-sm text-muted-foreground">/{contentItem.slug}</p>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(contentItem.status)}</TableCell>
              <TableCell>
                {contentItem.featured ? (
                  <Badge variant="default" className="bg-primary/10 text-primary">
                    Featured
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>{new Date(contentItem.updatedAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={`Open actions for ${contentItem.title}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link
                        href={contentItem.href}
                        target={contentItem.href.startsWith('http') ? '_blank' : undefined}
                        rel={contentItem.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={!editable} onClick={() => onEdit(type, contentItem)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit metadata
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      disabled={!editable} 
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(type, contentItem)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

function ContentCardList({
  type,
  items,
  editable,
  onEdit,
  onDelete,
}: {
  type: ContentType;
  items: ContentItem[];
  editable: boolean;
  onEdit: (type: ContentType, item: ContentItem) => void;
  onDelete: (type: ContentType, item: ContentItem) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        No {type}s found.
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:hidden">
      {items.map((contentItem) => (
        <article key={contentItem.id} className="rounded-2xl border border-border/70 bg-background/70 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold">{contentItem.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">/{contentItem.slug}</p>
            </div>
            {contentItem.featured ? (
              <Badge variant="default" className="bg-primary/10 text-primary">
                Featured
              </Badge>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {getStatusBadge(contentItem.status)}
            <span className="rounded-full border border-border/70 px-2.5 py-1 text-[11px] text-muted-foreground">
              Updated {new Date(contentItem.updatedAt).toLocaleDateString()}
            </span>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <Button variant="outline" size="sm" asChild>
              <Link
                href={contentItem.href}
                target={contentItem.href.startsWith('http') ? '_blank' : undefined}
                rel={contentItem.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!editable}
              onClick={() => onEdit(type, contentItem)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!editable}
              className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDelete(type, contentItem)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}

function EditorDialog({
  editor,
  open,
  saving,
  error,
  onOpenChange,
  onFieldChange,
  onSave,
}: {
  editor: EditorPayload | null;
  open: boolean;
  saving: boolean;
  error: string | null;
  onOpenChange: (open: boolean) => void;
  onFieldChange: (key: string, value: string | boolean) => void;
  onSave: () => void;
}) {
  const [generating, setGenerating] = useState(false);
  const [generationMessage, setGenerationMessage] = useState<string | null>(null);
  const { toast } = useToast();

  if (!editor) {
    return null;
  }

  const fields = editor.fields;
  const isNew = !editor.id;

  const handleGenerateCaseStudy = async () => {
    if (!fields.title || !fields.description) {
      const message = 'Title and description are required before generating a draft.';
      setGenerationMessage(message);
      toast({
        title: 'Draft needs more context',
        description: message,
        variant: 'destructive',
      });
      return;
    }

    setGenerating(true);
    setGenerationMessage('Generating a project narrative draft...');
    try {
      const response = await fetch('/api/admin/content/case-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: fields.title,
          description: fields.description,
          role: fields.role,
          context: fields.context,
          technologies: fields.technologies ? String(fields.technologies).split(',') : [],
          metrics: [] // Could be parsed from fields if needed
        }),
      });

      const data = await response.json();
      if (data.success && data.draft) {
        onFieldChange('longDescription', data.draft);
        setGenerationMessage('Draft generated. Review tone and specifics before publishing.');
        toast({
          title: 'Draft generated',
          description: 'The long description has been populated with a first-pass case study.',
        });
      } else {
        const message = data.error || 'Unknown error';
        setGenerationMessage(`Generation failed: ${message}`);
        toast({
          title: 'Draft generation failed',
          description: message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Generation error:', error);
      setGenerationMessage('Failed to connect to the AI drafting service.');
      toast({
        title: 'Draft generation failed',
        description: 'Failed to connect to the AI drafting service.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Create' : 'Edit'} {editor.type}</DialogTitle>
          <DialogDescription>
            {isNew ? 'Fill in the details to create a new content item.' : 'Update the live metadata for this content item.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {'title' in fields ? (
            <FieldRow label="Title">
              <Input value={String(fields.title)} onChange={(event) => onFieldChange('title', event.target.value)} />
            </FieldRow>
          ) : null}

          {'slug' in fields ? (
            <FieldRow label="Slug">
              <Input value={String(fields.slug)} onChange={(event) => onFieldChange('slug', event.target.value)} />
            </FieldRow>
          ) : null}

          {'excerpt' in fields ? (
            <FieldRow label="Excerpt">
              <Textarea value={String(fields.excerpt)} onChange={(event) => onFieldChange('excerpt', event.target.value)} />
            </FieldRow>
          ) : null}

          {'description' in fields ? (
            <FieldRow label="Description">
              <Textarea value={String(fields.description)} onChange={(event) => onFieldChange('description', event.target.value)} />
            </FieldRow>
          ) : null}

          {'longDescription' in fields ? (
            <FieldRow label="Long Description">
              {editor.type.toString() === 'Project' && (
                <div className="mb-2 space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-[10px] gap-1.5"
                    onClick={handleGenerateCaseStudy}
                    disabled={generating}
                  >
                    {generating ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3" />
                    )}
                    Magic Draft (AI)
                  </Button>
                  {generationMessage ? (
                    <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
                      {generationMessage}
                    </p>
                  ) : null}
                </div>
              )}
              <Textarea 
                value={String(fields.longDescription)} 
                onChange={(event) => onFieldChange('longDescription', event.target.value)} 
                className="min-h-[200px]"
              />
            </FieldRow>
          ) : null}

          {'content' in fields ? (
            <FieldRow label="Content">
              <Suspense fallback={<div className="h-64 flex items-center justify-center border rounded animate-pulse"><Loader2 className="animate-spin" /></div>}>
                <MarkdownEditor value={String(fields.content)} onChange={(value) => onFieldChange('content', value)} />
              </Suspense>
            </FieldRow>
          ) : null}

          {'category' in fields ? (
            <FieldRow label="Category">
              <Input value={String(fields.category)} onChange={(event) => onFieldChange('category', event.target.value)} />
            </FieldRow>
          ) : null}

          {'issuer' in fields ? (
            <FieldRow label="Issuer">
              <Input value={String(fields.issuer)} onChange={(event) => onFieldChange('issuer', event.target.value)} />
            </FieldRow>
          ) : null}

          {'credentialUrl' in fields ? (
            <FieldRow label="Credential URL">
              <Input value={String(fields.credentialUrl)} onChange={(event) => onFieldChange('credentialUrl', event.target.value)} />
            </FieldRow>
          ) : null}

          {'subtitle' in fields ? (
            <FieldRow label="Subtitle">
              <Input value={String(fields.subtitle)} onChange={(event) => onFieldChange('subtitle', event.target.value)} />
            </FieldRow>
          ) : null}

          {'amazonUrl' in fields ? (
            <FieldRow label="Amazon URL">
              <Input value={String(fields.amazonUrl)} onChange={(event) => onFieldChange('amazonUrl', event.target.value)} />
            </FieldRow>
          ) : null}

          {'publisher' in fields ? (
            <FieldRow label="Publisher">
              <Input value={String(fields.publisher)} onChange={(event) => onFieldChange('publisher', event.target.value)} />
            </FieldRow>
          ) : null}

          {'techStackText' in fields ? (
            <FieldRow label="Tech Stack">
              <Textarea
                value={String(fields.techStackText)}
                onChange={(event) => onFieldChange('techStackText', event.target.value)}
              />
            </FieldRow>
          ) : null}

          {'skillsText' in fields ? (
            <FieldRow label="Skills">
              <Textarea value={String(fields.skillsText)} onChange={(event) => onFieldChange('skillsText', event.target.value)} />
            </FieldRow>
          ) : null}

          {'status' in fields ? (
            <FieldRow label="Status">
              <Select value={String(fields.status)} onValueChange={(value) => onFieldChange('status', value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {editor.type === 'article' ? (
                    <>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </FieldRow>
          ) : null}

          {'featured' in fields ? (
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div>
                <div className="font-medium">Featured</div>
                <div className="text-sm text-muted-foreground">Highlight this item in the public presentation.</div>
              </div>
              <Switch checked={Boolean(fields.featured)} onCheckedChange={(checked) => onFieldChange('featured', checked)} />
            </div>
          ) : null}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            {isNew ? 'Create Item' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const DEFAULT_FIELDS: Record<ContentType, EditorFields> = {
  article: { title: '', slug: '', excerpt: '', category: 'Research', featured: false, status: 'draft', content: '' },
  project: { title: '', slug: '', description: '', longDescription: '', category: 'Work', featured: false, status: 'in-progress', techStackText: '' },
  certification: { title: '', issuer: '', description: '', credentialUrl: '', featured: false, skillsText: '' },
  book: { title: '', subtitle: '', description: '', amazonUrl: '', publisher: '', featured: true },
};

export default function ContentManagementPage() {
  const { toast } = useToast();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<ContentType>('article');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingEditor, setLoadingEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<{ type: ContentType; item: ContentItem } | null>(null);
  const [content, setContent] = useState<ContentApiResponse>({
    success: true,
    editable: false,
    source: 'fallback',
    warning: null,
    articles: [],
    projects: [],
    certifications: [],
    books: [],
  });
  const [editor, setEditor] = useState<EditorPayload | null>(null);

  const loadContent = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/content', { cache: 'no-store' });
      const data = (await response.json()) as ContentApiResponse;
      if (response.ok) {
        setContent(data);
      } else {
        setBanner('Failed to load content inventory.');
      }
    } catch {
      setBanner('Failed to load content inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadContent();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if (event.key === '/' && !isTypingTarget) {
        event.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'n' && content.editable && !isTypingTarget) {
        event.preventDefault();
        openCreateEditor();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content.editable, activeTab]);

  const filteredContent = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase();
    const matcher = (contentItem: ContentItem) =>
      contentItem.title.toLowerCase().includes(normalizedQuery) ||
      contentItem.slug.toLowerCase().includes(normalizedQuery);

    return {
      article: content.articles.filter(matcher),
      project: content.projects.filter(matcher),
      certification: content.certifications.filter(matcher),
      book: content.books.filter(matcher),
    };
  }, [content, searchQuery]);

  const inventoryCards = [
    {
      label: 'Items in view',
      value: filteredContent[activeTab].length,
      helper: searchQuery ? 'Filtered by current search' : 'Available in the active collection',
    },
    {
      label: 'Editing mode',
      value: content.editable ? 'Live' : 'Read only',
      helper: content.editable ? 'Writes go through the admin API.' : 'Fallback content is visible but not editable.',
    },
    {
      label: 'Content source',
      value: content.source === 'database' ? 'Database' : 'Fallback',
      helper: content.source === 'database' ? 'Primary content store is active.' : 'Static fallback content is serving this workspace.',
    },
  ] as const;

  const openEditor = async (type: ContentType, contentItem: ContentItem) => {
    setLoadingEditor(true);
    setEditorError(null);
    setBanner(null);
    setEditorOpen(true);

    try {
      const response = await fetch(`/api/admin/content?type=${type}&id=${contentItem.id}`);
      const data = (await response.json()) as EditorApiResponse;

      if (!response.ok || !data.item) {
        throw new Error(data.error || 'Failed to load editor');
      }

      setEditor(data.item);
    } catch (error) {
      setEditor(null);
      setEditorError(error instanceof Error ? error.message : 'Failed to load editor.');
    } finally {
      setLoadingEditor(false);
    }
  };

  const openCreateEditor = () => {
    setEditor({
      type: activeTab,
      fields: { ...DEFAULT_FIELDS[activeTab] }
    });
    setEditorOpen(true);
  };

  const handleFieldChange = (key: string, value: string | boolean) => {
    setEditor((current) => {
      if (!current) return current;
      return {
        ...current,
        fields: {
          ...current.fields,
          [key]: value,
        },
      };
    });
  };

  const handleDelete = (type: ContentType, item: ContentItem) => {
    setDeleteCandidate({ type, item });
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/content?type=${deleteCandidate.type}&id=${deleteCandidate.item.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete item.');
      }

      toast({ title: 'Success', description: `${deleteCandidate.item.title} was deleted.` });
      setDeleteCandidate(null);
      void loadContent();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete item.', variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    if (!editor) return;

    setSaving(true);
    setEditorError(null);

    const isNew = !editor.id;
    const method = isNew ? 'POST' : 'PATCH';

    try {
      const response = await fetch('/api/admin/content', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: editor.type,
          id: editor.id,
          fields: editor.fields,
        }),
      });
      const data = (await response.json()) as EditorApiResponse;

      if (!response.ok || !data.item) {
        throw new Error(data.error || 'Failed to save content item.');
      }

      toast({ title: 'Success', description: isNew ? 'Content created.' : 'Content updated.' });
      void loadContent();
      setEditorOpen(false);
    } catch (error) {
      setEditorError(error instanceof Error ? error.message : 'Failed to save content item.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Content Management</h1>
          <p className="text-muted-foreground">
            Review the editorial inventory, open previews, and update live metadata.
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="rounded-full border border-border/70 px-3 py-1">Source: {content.source}</span>
            <span className="rounded-full border border-border/70 px-3 py-1">Editing: {content.editable ? 'live' : 'disabled'}</span>
            <span className="rounded-full border border-border/70 px-3 py-1">Shortcut: / search</span>
            <span className="rounded-full border border-border/70 px-3 py-1">Shortcut: ⌘/Ctrl + N create</span>
          </div>
        </div>
        <Button onClick={openCreateEditor} disabled={!content.editable}>
          <Plus className="mr-2 h-4 w-4" />
          {content.editable ? `Create ${activeTab}` : 'Editing unavailable'}
        </Button>
      </motion.div>

      <motion.div variants={item} className="grid gap-3 md:grid-cols-3">
        {inventoryCards.map((card) => (
          <Card key={card.label} className="border-border/70 bg-card/70">
            <CardContent className="space-y-2 p-5">
              <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                {card.label}
              </div>
              <div className="text-2xl font-semibold tracking-tight">{card.value}</div>
              <p className="text-sm text-muted-foreground">{card.helper}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {content.warning || banner ? (
        <motion.div variants={item} className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
          {banner || content.warning}
        </motion.div>
      ) : null}

      <motion.div variants={item} className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder={`Search ${activeTab}s...`}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-9"
          />
        </div>
        {searchQuery ? (
          <Button variant="outline" onClick={() => setSearchQuery('')}>
            <Filter className="mr-2 h-4 w-4" />
            Clear Filter
          </Button>
        ) : (
          <div className="text-xs text-muted-foreground">Type / to focus search instantly.</div>
        )}
      </motion.div>

      <motion.div variants={item}>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ContentType)}>
          <TabsList className="grid h-auto grid-cols-2 gap-2 md:inline-flex">
            <TabsTrigger value="article">
              <FileText className="mr-2 h-4 w-4" />
              Articles
            </TabsTrigger>
            <TabsTrigger value="project">
              <FolderOpen className="mr-2 h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="certification">
              <Award className="mr-2 h-4 w-4" />
              Certifications
            </TabsTrigger>
            <TabsTrigger value="book">
              <BookOpen className="mr-2 h-4 w-4" />
              Books
            </TabsTrigger>
          </TabsList>

          <TabsContent value="article" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Articles ({filteredContent.article.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Syncing database...
                  </div>
                ) : (
                  <>
                    <ContentCardList type="article" items={filteredContent.article} editable={content.editable} onEdit={openEditor} onDelete={handleDelete} />
                    <div className="hidden md:block">
                      <ContentTable type="article" items={filteredContent.article} editable={content.editable} onEdit={openEditor} onDelete={handleDelete} />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="project" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Projects ({filteredContent.project.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Syncing database...
                  </div>
                ) : (
                  <>
                    <ContentCardList type="project" items={filteredContent.project} editable={content.editable} onEdit={openEditor} onDelete={handleDelete} />
                    <div className="hidden md:block">
                      <ContentTable type="project" items={filteredContent.project} editable={content.editable} onEdit={openEditor} onDelete={handleDelete} />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certification" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Certifications ({filteredContent.certification.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Syncing database...
                  </div>
                ) : (
                  <>
                    <ContentCardList type="certification" items={filteredContent.certification} editable={content.editable} onEdit={openEditor} onDelete={handleDelete} />
                    <div className="hidden md:block">
                      <ContentTable type="certification" items={filteredContent.certification} editable={content.editable} onEdit={openEditor} onDelete={handleDelete} />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="book" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Books ({filteredContent.book.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Syncing database...
                  </div>
                ) : (
                  <>
                    <ContentCardList type="book" items={filteredContent.book} editable={content.editable} onEdit={openEditor} onDelete={handleDelete} />
                    <div className="hidden md:block">
                      <ContentTable type="book" items={filteredContent.book} editable={content.editable} onEdit={openEditor} onDelete={handleDelete} />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      <EditorDialog
        editor={editor}
        open={editorOpen}
        saving={saving}
        error={editorError}
        onOpenChange={(open) => {
          setEditorOpen(open);
          if (!open) {
            setEditorError(null);
          }
        }}
        onFieldChange={handleFieldChange}
        onSave={handleSave}
      />

      <AlertDialog open={Boolean(deleteCandidate)} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete content item?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteCandidate
                ? `This will permanently remove ${deleteCandidate.item.title}. This action cannot be undone.`
                : 'This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmDelete()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={loadingEditor} onOpenChange={() => undefined}>
        <DialogContent className="max-w-sm" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Loading editor</DialogTitle>
            <DialogDescription>Preparing the content form.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Fetching the latest content fields.
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
