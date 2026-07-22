'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Grid3X3,
  List,
  Trash2,
  Copy,
  Check,
  Image as ImageIcon,
  Video,
  FileAudio,
  FileText,
  Upload,
  X,
  MoreHorizontal,
  FolderOpen,
  RefreshCw,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MediaUploader } from '@/components/admin/media-uploader';
import { useToast } from '@/hooks/use-toast';
import { adminFetch, adminJson } from '@/lib/admin-api-client';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/upload';
import { logger } from '@/lib/logger';

interface Media {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  category: string;
  size: number;
  width?: number;
  height?: number;
  url: string;
  thumbnailUrl?: string;
  colorPalette?: string | null;
  folder?: string | null;
  createdAt: string;
  _count?: {
    articleUsages: number;
    projectUsages: number;
  };
}

interface MediaListResponse {
  media: Media[];
  featureAvailable?: boolean;
}

interface FolderListResponse {
  folders: string[];
}

const SEARCH_DEBOUNCE_MS = 300;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const motionItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

/** Palette values come from the DB as JSON strings — never trust them blindly. */
function parseColorPalette(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === 'string').slice(0, 8)
      : [];
  } catch {
    return [];
  }
}

function ColorPaletteDots({ palette, size = 'md' }: { palette: string[]; size?: 'sm' | 'md' }) {
  if (palette.length === 0) return null;
  return (
    <div className="flex gap-1">
      {palette.map((color, i) => (
        <div
          key={`${color}-${i}`}
          className={cn(
            'rounded-full border border-black/5',
            size === 'md' ? 'w-3 h-3' : 'w-2.5 h-2.5'
          )}
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
    </div>
  );
}

export default function MediaLibraryPage() {
  const { toast } = useToast();
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [featureAvailable, setFeatureAvailable] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [folders, setFolders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [deleteTargets, setDeleteTargets] = useState<string[] | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchQuery), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (selectedFolder) {
        params.append('folder', selectedFolder);
      }
      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }

      const data = await adminFetch<MediaListResponse>(`/api/upload?${params.toString()}`);
      setMedia(data.media ?? []);
      setFeatureAvailable(data.featureAvailable !== false);
    } catch (error) {
      logger.error('Failed to fetch media:', error);
      setLoadError(
        error instanceof Error ? error.message : 'Failed to load the media library.'
      );
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedFolder, debouncedSearch]);

  const fetchFolders = useCallback(async () => {
    try {
      const data = await adminFetch<FolderListResponse>('/api/upload?folders=true');
      setFolders(data.folders ?? []);
    } catch (error) {
      // Folder chips are a convenience — a failure here should not block the page.
      logger.error('Failed to fetch folders:', error);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const toggleSelection = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  const requestDelete = (ids: string[]) => {
    if (ids.length === 0) return;
    setDeleteTargets(ids);
  };

  const confirmDelete = async () => {
    if (!deleteTargets || deleteTargets.length === 0) return;

    setIsDeleting(true);
    try {
      await adminJson('/api/upload', 'DELETE', { ids: deleteTargets, action: 'delete' });

      const deletedIds = new Set(deleteTargets);
      setMedia((prev) => prev.filter((m) => !deletedIds.has(m.id)));
      setSelectedItems((prev) => {
        const next = new Set(prev);
        deletedIds.forEach((id) => next.delete(id));
        return next;
      });
      toast({
        title: 'Media deleted',
        description: `${deleteTargets.length} file${deleteTargets.length === 1 ? '' : 's'} removed.`,
      });
      setDeleteTargets(null);
      fetchFolders();
    } catch (error) {
      logger.error('Delete failed:', error);
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Could not delete the selected files.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const moveSelected = async (folder: string | null) => {
    if (selectedItems.size === 0) return;

    try {
      await adminJson('/api/upload', 'DELETE', {
        ids: Array.from(selectedItems),
        action: 'move',
        folder,
      });

      fetchMedia();
      fetchFolders();
      setSelectedItems(new Set());
      toast({
        title: 'Media moved',
        description: `Moved to ${folder || 'the root folder'}.`,
      });
    } catch (error) {
      logger.error('Move failed:', error);
      toast({
        title: 'Move failed',
        description: error instanceof Error ? error.message : 'Could not move the selected files.',
        variant: 'destructive',
      });
    }
  };

  const copyUrl = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Clipboard access was blocked by the browser.',
        variant: 'destructive',
      });
    }
  };

  const getFileIcon = (category: string) => {
    switch (category) {
      case 'image':
        return <ImageIcon className="h-8 w-8" />;
      case 'video':
        return <Video className="h-8 w-8" />;
      case 'audio':
        return <FileAudio className="h-8 w-8" />;
      default:
        return <FileText className="h-8 w-8" />;
    }
  };

  const categories = [
    { value: 'all', label: 'All Files', icon: FolderOpen },
    { value: 'image', label: 'Images', icon: ImageIcon },
    { value: 'video', label: 'Videos', icon: Video },
    { value: 'audio', label: 'Audio', icon: FileAudio },
    { value: 'document', label: 'Documents', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-muted-foreground">
            Manage your images, videos, and documents
          </p>
        </div>
        <Dialog open={uploaderOpen} onOpenChange={setUploaderOpen}>
          <DialogTrigger asChild>
            <Button disabled={!featureAvailable}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Media</DialogTitle>
            </DialogHeader>
            {featureAvailable ? (
              <MediaUploader
                onUploadComplete={() => {
                  fetchMedia();
                  fetchFolders();
                  setUploaderOpen(false);
                }}
                defaultFolder={selectedFolder}
                availableFolders={folders}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
                The media library is disabled until the `Media` table is provisioned for this environment.
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {!featureAvailable && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-4 text-sm text-amber-700 dark:text-amber-200">
            Media storage is not provisioned in the current database, so uploads and asset management are unavailable in this environment.
          </CardContent>
        </Card>
      )}

      {loadError && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {loadError}
            </div>
            <Button variant="outline" size="sm" onClick={() => fetchMedia()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedFolder === null ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedFolder(null)}
            >
              All Folders
            </Button>
            {folders.map((folder) => (
              <Button
                key={folder}
                variant={selectedFolder === folder ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedFolder(folder)}
              >
                {folder}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const name = prompt('New folder name:');
                if (name) setFolders(prev => Array.from(new Set([...prev, name])));
              }}
            >
              + New Folder
            </Button>
          </div>
        </div>

        <div className="flex gap-2 self-start">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList>
              {categories.map((cat) => (
                <TabsTrigger key={cat.value} value={cat.value}>
                  <cat.icon className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">{cat.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20"
        >
          <span className="text-sm font-medium">
            {selectedItems.size} selected
          </span>
          <div className="h-4 w-px bg-border hidden sm:block" />

          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Move to
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => moveSelected(null)}>
                  Root Folder
                </DropdownMenuItem>
                {folders.map(f => (
                  <DropdownMenuItem key={f} onClick={() => moveSelected(f)}>
                    {f}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => requestDelete(Array.from(selectedItems))}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </motion.div>
      )}

      {/* View Toggle */}
      <div className="flex justify-end gap-2">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="icon"
          onClick={() => setViewMode('grid')}
          aria-label="Grid view"
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="icon"
          onClick={() => setViewMode('list')}
          aria-label="List view"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      {/* Media Grid/List */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            {loadError
              ? 'Media could not be loaded'
              : featureAvailable
                ? 'No media files found'
                : 'Media results are unavailable in this environment'}
          </p>
          {featureAvailable && !loadError && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setUploaderOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload your first file
            </Button>
          )}
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'
              : 'space-y-2'
          )}
        >
          {media.map((item) => {
            const palette = parseColorPalette(item.colorPalette);
            return (
              <motion.div key={item.id} variants={motionItem}>
                {viewMode === 'grid' ? (
                  <Card
                    className={cn(
                      'group cursor-pointer transition-all',
                      selectedItems.has(item.id) && 'ring-2 ring-primary'
                    )}
                    onClick={() => toggleSelection(item.id)}
                  >
                    <CardContent className="p-0">
                      <div className="aspect-square relative overflow-hidden rounded-t-lg bg-muted">
                        {item.category === 'image' ? (
                          <Image
                            src={item.thumbnailUrl || item.url}
                            alt={item.originalName}
                            className="w-full h-full object-cover"
                            width={400}
                            height={400}
                            loading="lazy"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {getFileIcon(item.category)}
                          </div>
                        )}
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-2">
                            <Button
                              size="icon"
                              variant="secondary"
                              aria-label={`Copy URL for ${item.originalName}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                copyUrl(item.url, item.id);
                              }}
                            >
                              {copiedId === item.id ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              aria-label={`Delete ${item.originalName}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                requestDelete([item.id]);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="font-medium truncate text-sm">
                          {item.originalName}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            {formatFileSize(item.size)}
                          </p>
                          {item.width && item.height && (
                            <span className="text-[10px] text-muted-foreground/60">• {item.width}×{item.height}</span>
                          )}
                        </div>

                        {palette.length > 0 && (
                          <div className="mt-2">
                            <ColorPaletteDots palette={palette} />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div
                    className={cn(
                      'flex items-center gap-4 p-3 rounded-lg border transition-all',
                      selectedItems.has(item.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    )}
                    onClick={() => toggleSelection(item.id)}
                  >
                    <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      {item.category === 'image' ? (
                        <Image
                          src={item.thumbnailUrl || item.url}
                          alt={item.originalName}
                          className="w-full h-full object-cover rounded"
                          width={48}
                          height={48}
                          unoptimized
                        />
                      ) : (
                        getFileIcon(item.category)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.originalName}</p>
                      <div className="flex items-center gap-3">
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(item.size)}
                          {' • '}
                          {new Date(item.createdAt).toLocaleDateString()}
                          {(item._count?.articleUsages ?? 0) > 0 && (
                            <span className="ml-2 text-blue-500">
                              Used in {item._count?.articleUsages} article
                              {(item._count?.articleUsages ?? 0) > 1 ? 's' : ''}
                            </span>
                          )}
                        </p>
                        <ColorPaletteDots palette={palette} size="sm" />
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Open actions for ${item.originalName}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => copyUrl(item.url, item.id)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy URL
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => requestDelete([item.id])}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <AlertDialog
        open={Boolean(deleteTargets)}
        onOpenChange={(open) => !open && !isDeleting && setDeleteTargets(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {deleteTargets?.length === 1 ? 'this file' : `${deleteTargets?.length ?? 0} files`}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The stored asset{deleteTargets && deleteTargets.length > 1 ? 's' : ''} and thumbnail
              {deleteTargets && deleteTargets.length > 1 ? 's' : ''} will be permanently removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void confirmDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
