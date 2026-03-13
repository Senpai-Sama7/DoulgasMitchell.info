import { describe, it, expect } from 'vitest';
import {
  validateFileType,
  validateFileSize,
  formatFileSize,
  getFileCategory,
  getFileIcon,
  isPreviewable,
  ALLOWED_MIME_TYPES,
} from '@/lib/upload';

describe('File Upload', () => {
  describe('File type validation', () => {
    it('should accept valid image types', () => {
      const result = validateFileType('image/jpeg');
      expect(result.valid).toBe(true);
    });

    it('should accept valid video types', () => {
      const result = validateFileType('video/mp4');
      expect(result.valid).toBe(true);
    });

    it('should reject invalid types', () => {
      const result = validateFileType('application/exe');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    it('should reject svg uploads', () => {
      const result = validateFileType('image/svg+xml');
      expect(result.valid).toBe(false);
    });
  });

  describe('File size validation', () => {
    it('should accept files under limit', () => {
      const result = validateFileSize(1024 * 1024); // 1MB
      expect(result.valid).toBe(true);
    });

    it('should reject files over limit', () => {
      const result = validateFileSize(100 * 1024 * 1024 + 1); // Over 100MB
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum');
    });
  });

  describe('File size formatting', () => {
    it('should format bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('should handle decimal places', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });
  });

  describe('File category detection', () => {
    it('should detect images', () => {
      expect(getFileCategory('image/jpeg')).toBe('image');
      expect(getFileCategory('image/png')).toBe('image');
    });

    it('should detect videos', () => {
      expect(getFileCategory('video/mp4')).toBe('video');
    });

    it('should detect audio', () => {
      expect(getFileCategory('audio/mpeg')).toBe('audio');
    });

    it('should detect documents', () => {
      expect(getFileCategory('application/pdf')).toBe('document');
    });

    it('should return unknown for other types', () => {
      expect(getFileCategory('application/exe')).toBe('unknown');
    });
  });

  describe('Preview detection', () => {
    it('should allow preview for images', () => {
      expect(isPreviewable('image/jpeg')).toBe(true);
    });

    it('should allow preview for videos', () => {
      expect(isPreviewable('video/mp4')).toBe(true);
    });

    it('should deny preview for unknown types', () => {
      expect(isPreviewable('application/exe')).toBe(false);
    });
  });

  describe('File icons', () => {
    it('should return emoji icons', () => {
      expect(getFileIcon('image/jpeg')).toBe('🖼️');
      expect(getFileIcon('video/mp4')).toBe('🎬');
      expect(getFileIcon('audio/mp3')).toBe('🎵');
      expect(getFileIcon('application/pdf')).toBe('📄');
      expect(getFileIcon('unknown/type')).toBe('📎');
    });
  });
});

describe('Allowed MIME types', () => {
  it('should have image types', () => {
    expect(ALLOWED_MIME_TYPES.image).toContain('image/jpeg');
    expect(ALLOWED_MIME_TYPES.image).toContain('image/png');
    expect(ALLOWED_MIME_TYPES.image).toContain('image/webp');
  });

  it('should have video types', () => {
    expect(ALLOWED_MIME_TYPES.video).toContain('video/mp4');
    expect(ALLOWED_MIME_TYPES.video).toContain('video/webm');
  });

  it('should have audio types', () => {
    expect(ALLOWED_MIME_TYPES.audio).toContain('audio/mpeg');
    expect(ALLOWED_MIME_TYPES.audio).toContain('audio/wav');
  });
});
