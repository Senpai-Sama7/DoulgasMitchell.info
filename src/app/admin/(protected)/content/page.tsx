'use client';

import Link from 'next/link';
import { startTransition, useEffect, useMemo, useState, lazy, Suspense } from 'react';
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
  onDelete: (type: ContentType, id: string) => void;
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
                      onClick={() => onDelete(type, contentItem.id)}
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

  if (!editor) {
    return null;
  }

  const fields = editor.fields;
  const isNew = !editor.id;

  const handleGenerateCaseStudy = async () => {
    if (!fields.title || !fields.description) {
      alert('Title and description are required for AI generation.');
      return;
    }

    setGenerating(true);
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
      } else {
        alert('Generation failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to connect to AI service.');
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
                <div className="mb-2">
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
  const [activeTab, setActiveTab] = useState<ContentType>('article');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingEditor, setLoadingEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
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

  const handleDelete = async (type: ContentType, id: string) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/content?type=${type}&id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast({ title: 'Success', description: 'Item deleted successfully.' });
        void loadContent();
      } else {
        throw new Error('Failed to delete item.');
      }
    } catch (err) {
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
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Management</h1>
          <p className="text-muted-foreground">
            Review the editorial inventory, open previews, and update live metadata.
          </p>
        </div>
        <Button onClick={openCreateEditor} disabled={!content.editable}>
          <Plus className="mr-2 h-4 w-4" />
          {content.editable ? 'Use row editor' : 'Editing unavailable'}
        </Button>
      </motion.div>

      {content.warning || banner ? (
        <motion.div variants={item} className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100">
          {banner || content.warning}
        </motion.div>
      ) : null}

      <motion.div variants={item} className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Search ${activeTab}s...`}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" onClick={() => setSearchQuery('')}>
          <Filter className="mr-2 h-4 w-4" />
          Clear Filter
        </Button>
      </motion.div>

      <motion.div variants={item}>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ContentType)}>
          <TabsList>
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
                  <ContentTable type="article" items={filteredContent.article} editable={content.editable} onEdit={openEditor} onDelete={handleDelete} />
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
                  <ContentTable type="project" items={filteredContent.project} editable={content.editable} onEdit={openEditor} onDelete={handleDelete} />
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
                  <ContentTable type="certification" items={filteredContent.certification} editable={content.editable} onEdit={openEditor} onDelete={handleDelete} />
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
                  <ContentTable type="book" items={filteredContent.book} editable={content.editable} onEdit={openEditor} onDelete={handleDelete} />
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
