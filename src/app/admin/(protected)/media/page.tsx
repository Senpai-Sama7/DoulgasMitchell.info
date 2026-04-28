'use client';

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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
  _count: {
    articleUsages: number;
    projectUsages: number;
  };
}

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

export default function MediaLibraryPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [featureAvailable, setFeatureAvailable] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [folders, setFolders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploaderOpen, setUploaderOpen] = useState(false);

  const fetchMedia = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (selectedFolder) {
        params.append('folder', selectedFolder);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/upload?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setMedia(data.media);
        setFeatureAvailable(data.featureAvailable !== false);
      }
    } catch (error) {
      logger.error('Failed to fetch media:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedFolder, searchQuery]);

  const fetchFolders = useCallback(async () => {
    try {
      const response = await fetch('/api/upload?folders=true');
      const data = await response.json();
      if (data.success) {
        setFolders(data.folders);
      }
    } catch (error) {
      logger.error('Failed to fetch folders:', error);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
    fetchFolders();
  }, [fetchMedia, fetchFolders]);

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

  const deleteSelected = async () => {
    if (selectedItems.size === 0) return;

    if (!confirm(`Delete ${selectedItems.size} items?`)) return;

    try {
      const response = await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedItems), action: 'delete' }),
      });

      const data = await response.json();

      if (data.success) {
        setMedia((prev) => prev.filter((m) => !selectedItems.has(m.id)));
        setSelectedItems(new Set());
        fetchFolders();
      }
    } catch (error) {
      logger.error('Delete failed:', error);
    }
  };

  const moveSelected = async (folder: string | null) => {
    if (selectedItems.size === 0) return;

    try {
      const response = await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ids: Array.from(selectedItems), 
          action: 'move',
          folder: folder
        }),
      });

      const data = await response.json();

      if (data.success) {
        fetchMedia();
        fetchFolders();
        setSelectedItems(new Set());
      }
    } catch (error) {
      logger.error('Move failed:', error);
    }
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
              onClick={deleteSelected}
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
        >
          <Grid3X3 className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'outline'}
          size="icon"
          onClick={() => setViewMode('list')}
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
            {featureAvailable ? 'No media files found' : 'Media results are unavailable in this environment'}
          </p>
          {featureAvailable && (
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
          {media.map((item) => (
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
                        <img
                          src={item.thumbnailUrl || item.url}
                          alt={item.originalName}
                          className="w-full h-full object-cover"
                          loading="lazy"
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
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItems(new Set([item.id]));
                              deleteSelected();
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
                      
                      {item.colorPalette && (
                        <div className="flex gap-1 mt-2">
                          {JSON.parse(item.colorPalette).map((color: string, i: number) => (
                            <div 
                              key={i} 
                              className="w-3 h-3 rounded-full border border-black/5" 
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
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
                      <img
                        src={item.thumbnailUrl || item.url}
                        alt={item.originalName}
                        className="w-full h-full object-cover rounded"
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
                        {item._count.articleUsages > 0 && (
                          <span className="ml-2 text-blue-500">
                            Used in {item._count.articleUsages} article
                            {item._count.articleUsages > 1 ? 's' : ''}
                          </span>
                        )}
                      </p>
                      {item.colorPalette && (
                        <div className="flex gap-1">
                          {JSON.parse(item.colorPalette).map((color: string, i: number) => (
                            <div 
                              key={i} 
                              className="w-2.5 h-2.5 rounded-full border border-black/5" 
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
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
                        onClick={() => {
                          setSelectedItems(new Set([item.id]));
                          deleteSelected();
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
