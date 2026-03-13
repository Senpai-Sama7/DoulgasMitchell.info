// File type configurations
export const ALLOWED_MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'], // Removed svg due to XSS risk
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/x-m4a', 'audio/aac'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'text/plain',
    'text/markdown',
    'text/html',
    'text/javascript',
    'text/typescript',
    'application/json',
    'application/x-typescript',
    'text/x-typescript',
    'text/jsx',
    'text/tsx',
  ],
};

const MAX_FILE_SIZE = 100 * 1024 * 1024; // Increased to 100MB

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface UploadResult {
  success: boolean;
  id?: string;
  filename?: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  url?: string;
  thumbnailUrl?: string;
  colorPalette?: string[];
  error?: string;
}

// Validate file type
export function validateFileType(mimeType: string): FileValidationResult {
  const allAllowed = Object.values(ALLOWED_MIME_TYPES).flat();

  // Strict check: if it's not in ALLOWED_MIME_TYPES, reject it.
  // We removed the permissive `mimeType.startsWith('text/')` check.
  if (allAllowed.includes(mimeType)) {
    return { valid: true };
  }

  return {
    valid: false,
    error: `File type ${mimeType} is not allowed. Supported types: images, videos, audio, and documents (PDF, Office, Markdown, etc.).`,
  };
}

// Validate file size
export function validateFileSize(size: number): FileValidationResult {
  if (size <= MAX_FILE_SIZE) {
    return { valid: true };
  }
  
  return {
    valid: false,
    error: `File size ${formatFileSize(size)} exceeds maximum of ${formatFileSize(MAX_FILE_SIZE)}`,
  };
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get file category
export function getFileCategory(mimeType: string): 'image' | 'video' | 'audio' | 'document' | 'code' | 'unknown' {
  if (ALLOWED_MIME_TYPES.image.includes(mimeType)) return 'image';
  if (ALLOWED_MIME_TYPES.video.includes(mimeType)) return 'video';
  if (ALLOWED_MIME_TYPES.audio.includes(mimeType)) return 'audio';
  if (mimeType.includes('json') || mimeType.includes('javascript') || mimeType.includes('typescript') || mimeType.includes('html') || mimeType.includes('markdown')) return 'code';
  if (ALLOWED_MIME_TYPES.document.includes(mimeType)) return 'document';
  if (mimeType.startsWith('text/')) return 'document';
  return 'unknown';
}

// Get file icon based on type
export function getFileIcon(mimeType: string): string {
  const category = getFileCategory(mimeType);
  
  const icons = {
    image: '🖼️',
    video: '🎬',
    audio: '🎵',
    document: '📄',
    code: '💻',
    unknown: '📎',
  };
  
  return icons[category];
}

// Check if file is previewable
export function isPreviewable(mimeType: string): boolean {
  return getFileCategory(mimeType) !== 'unknown';
}
