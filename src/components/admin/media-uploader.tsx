'use client';

import Image from 'next/image';
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
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  extractApiErrorMessage,
  triggerSessionExpiredRedirect,
} from '@/lib/admin-api-client';
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

interface UploadResultMedia {
  id: string;
  url: string;
  thumbnailUrl?: string;
  originalName?: string;
}

interface UploadResult {
  success: boolean;
  originalName?: string;
  error?: string;
  media?: UploadResultMedia;
}

interface MediaUploaderProps {
  onUploadComplete?: (files: UploadFile[]) => void;
  maxFiles?: number;
  className?: string;
  defaultFolder?: string | null;
  availableFolders?: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Upload via XMLHttpRequest so we get real upload progress events —
 * `fetch` has no standardized upload progress API.
 */
function uploadWithProgress(
  url: string,
  formData: FormData,
  onProgress: (percent: number) => void
): Promise<{ status: number; payload: unknown }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        onProgress(Math.min(Math.round((event.loaded / event.total) * 100), 99));
      }
    };
    xhr.onload = () => {
      let payload: unknown = null;
      try {
        payload = JSON.parse(xhr.responseText) as unknown;
      } catch {
        payload = null;
      }
      resolve({ status: xhr.status, payload });
    };
    xhr.onerror = () => reject(new Error('Network error during upload. Check your connection and retry.'));
    xhr.onabort = () => reject(new Error('Upload was cancelled.'));
    xhr.send(formData);
  });
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

  const performUpload = async (batch: UploadFile[]) => {
    if (batch.length === 0) return;

    setIsUploading(true);

    const batchIds = new Set(batch.map((f) => f.id));
    setFiles((prev) =>
      prev.map((file) =>
        batchIds.has(file.id)
          ? { ...file, status: 'uploading' as const, progress: 0, error: undefined }
          : file
      )
    );

    const formData = new FormData();
    batch.forEach((file) => {
      formData.append('files', file.file);
    });
    if (targetFolder) {
      formData.append('folder', targetFolder);
    }

    const markBatchFailed = (message: string) => {
      setFiles((prev) =>
        prev.map((file) =>
          batchIds.has(file.id)
            ? { ...file, status: 'error' as const, error: message }
            : file
        )
      );
    };

    try {
      const { status, payload } = await uploadWithProgress('/api/upload', formData, (percent) => {
        setFiles((prev) =>
          prev.map((file) =>
            batchIds.has(file.id) && file.status === 'uploading'
              ? { ...file, progress: percent }
              : file
          )
        );
      });

      if (status === 401) {
        markBatchFailed('Your session expired. Sign in again to continue.');
        triggerSessionExpiredRedirect();
        return;
      }

      if (status < 200 || status >= 300 || !isRecord(payload) || payload.success !== true) {
        markBatchFailed(extractApiErrorMessage(payload, `Upload failed with status ${status}.`));
        return;
      }

      const results: UploadResult[] = Array.isArray(payload.results)
        ? (payload.results as UploadResult[])
        : [];

      let updatedFiles: UploadFile[] = [];
      let successCount = 0;

      setFiles((prev) => {
        updatedFiles = prev.map((file) => {
          if (!batchIds.has(file.id)) {
            return file;
          }

          const success = results.find(
            (r) => r.success && r.media?.originalName === file.file.name
          );
          if (success?.media) {
            successCount += 1;
            return {
              ...file,
              status: 'success' as const,
              progress: 100,
              result: {
                id: success.media.id,
                url: success.media.url,
                thumbnailUrl: success.media.thumbnailUrl,
              },
            };
          }

          const failed = results.find(
            (r) => !r.success && r.originalName === file.file.name
          );
          return {
            ...file,
            status: 'error' as const,
            error: failed?.error || 'The server did not return a result for this file.',
          };
        });
        return updatedFiles;
      });

      if (successCount > 0) {
        onUploadComplete?.(updatedFiles);
      }
    } catch (error) {
      logger.error('Upload error:', error);
      markBatchFailed(error instanceof Error ? error.message : 'Upload failed. Please retry.');
    } finally {
      setIsUploading(false);
    }
  };

  const uploadFiles = () => performUpload(files.filter((f) => f.status === 'pending'));

  const retryFailed = () => {
    const failed = files.filter((f) => f.status === 'error');
    if (failed.length === 0) return;
    void performUpload(failed);
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

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const failedCount = files.filter((f) => f.status === 'error').length;

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
                  file.status === 'uploading' && 'border-primary/30 bg-primary/5',
                  file.status === 'pending' && 'border-border bg-muted/50'
                )}
              >
                {/* Preview / Icon */}
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {file.preview ? (
                    <Image
                      src={file.preview}
                      alt={file.file.name}
                      className="w-full h-full object-cover"
                      width={64}
                      height={64}
                      unoptimized
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
                    <div className="mt-2 flex items-center gap-2">
                      <Progress value={file.progress} className="h-1 flex-1" />
                      <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">
                        {file.progress}%
                      </span>
                    </div>
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
                  aria-label={`Remove ${file.file.name} from the upload list`}
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
        <div className="flex flex-wrap justify-between gap-2">
          <Button
            variant="outline"
            onClick={clearAll}
            disabled={isUploading}
          >
            Clear All
          </Button>
          <div className="flex gap-2">
            {failedCount > 0 && !isUploading && (
              <Button variant="outline" onClick={retryFailed}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Retry {failedCount} failed
              </Button>
            )}
            <Button
              onClick={uploadFiles}
              disabled={isUploading || pendingCount === 0}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {pendingCount} file{pendingCount === 1 ? '' : 's'}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
