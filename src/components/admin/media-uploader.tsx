'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  X,
  FileImage,
  FileVideo,
  FileAudio,
  FileText,
  CheckCircle,
  Loader2,
  FolderOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatFileSize, getFileCategory, isPreviewable } from '@/lib/upload';
import { logger } from '@/lib/logger';

interface UploadFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  result?: {
    id: string;
    url: string;
    thumbnailUrl?: string;
  };
}

interface MediaUploaderProps {
  onUploadComplete?: (files: UploadFile[]) => void;
  maxFiles?: number;
  className?: string;
  defaultFolder?: string | null;
  availableFolders?: string[];
}

export function MediaUploader({
  onUploadComplete,
  maxFiles = 10,
  className,
  defaultFolder = null,
  availableFolders = [],
}: MediaUploaderProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [targetFolder, setTargetFolder] = useState<string | null>(defaultFolder);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: isPreviewable(file.type) && file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : undefined,
      progress: 0,
      status: 'pending',
    }));

    setFiles((prev) => [...prev, ...newFiles].slice(0, maxFiles));
  }, [maxFiles]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    maxFiles: maxFiles - files.length,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg'],
      'video/*': ['.mp4', '.webm', '.ogg'],
      'audio/*': ['.mp3', '.wav', '.ogg', '.webm'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
  });

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    const formData = new FormData();
    const pendingFiles = files.filter((f) => f.status === 'pending');
    
    pendingFiles.forEach((file) => {
      formData.append('files', file.file);
    });

    if (targetFolder) {
      formData.append('folder', targetFolder);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // Update file statuses
        setFiles((prev) =>
          prev.map((file) => {
            const result = data.results.find(
              (r: any) => r.success && r.media.originalName === file.file.name
            );
            if (result) {
              return {
                ...file,
                status: 'success',
                progress: 100,
                result: result.media,
              };
            }
            const failed = data.results.find(
              (r: any) => !r.success && r.originalName === file.file.name
            );
            if (failed) {
              return {
                ...file,
                status: 'error',
                error: failed.error,
              };
            }
            return file;
          })
        );

        onUploadComplete?.(files);
      }
    } catch (error) {
      logger.error('Upload error:', error);
      setFiles((prev) =>
        prev.map((file) =>
          file.status === 'pending'
            ? { ...file, status: 'error', error: 'Upload failed' }
            : file
        )
      );
    } finally {
      setIsUploading(false);
    }
  };

  const clearAll = () => {
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
  };

  const getFileIcon = (type: string) => {
    const category = getFileCategory(type);
    switch (category) {
      case 'image':
        return <FileImage className="h-8 w-8 text-blue-500" />;
      case 'video':
        return <FileVideo className="h-8 w-8 text-purple-500" />;
      case 'audio':
        return <FileAudio className="h-8 w-8 text-orange-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Folder Selection */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Target Folder:</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <FolderOpen className="h-3.5 w-3.5 mr-2" />
              {targetFolder || 'Root'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setTargetFolder(null)}>
              Root
            </DropdownMenuItem>
            {availableFolders.map(f => (
              <DropdownMenuItem key={f} onClick={() => setTargetFolder(f)}>
                {f}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem onClick={() => {
              const name = prompt('New folder name:');
              if (name) setTargetFolder(name);
            }}>
              + New Folder
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
          isDragActive && !isDragReject && 'border-primary bg-primary/5',
          isDragReject && 'border-destructive bg-destructive/5',
          !isDragActive && 'border-muted-foreground/25 hover:border-muted-foreground/50'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-lg font-medium mb-2">
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </p>
        <p className="text-sm text-muted-foreground">
          or click to select files
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Images, videos, audio, and documents up to 50MB
        </p>
      </div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border',
                  file.status === 'success' && 'border-green-500/30 bg-green-500/5',
                  file.status === 'error' && 'border-red-500/30 bg-red-500/5',
                  file.status === 'pending' && 'border-border bg-muted/50'
                )}
              >
                {/* Preview / Icon */}
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getFileIcon(file.file.type)}
                    </div>
                  )}
                  {file.status === 'success' && (
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(file.file.size)}
                  </p>
                  {file.status === 'uploading' && (
                    <Progress value={file.progress} className="h-1 mt-2" />
                  )}
                  {file.error && (
                    <p className="text-xs text-red-500 mt-1">{file.error}</p>
                  )}
                </div>

                {/* Actions */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0"
                  onClick={() => removeFile(file.id)}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      {files.length > 0 && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={clearAll}
            disabled={isUploading}
          >
            Clear All
          </Button>
          <Button
            onClick={uploadFiles}
            disabled={
              isUploading ||
              files.every((f) => f.status !== 'pending')
            }
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {files.filter((f) => f.status === 'pending').length} files
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
