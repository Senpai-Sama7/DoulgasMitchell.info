import { existsSync } from 'fs';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { extname, join } from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { env } from '@/lib/env';
import {
  type UploadResult,
  getFileCategory,
  validateFileSize,
  validateFileType,
} from '@/lib/upload';

const UPLOAD_DIR = env.UPLOAD_DIR;

export function generateUniqueFilename(originalName: string): string {
  const ext = extname(originalName);
  const uniqueId = uuidv4();
  return `${uniqueId}${ext}`;
}

export async function getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number } | null> {
  try {
    const metadata = await sharp(buffer).metadata();
    if (metadata.width && metadata.height) {
      return { width: metadata.width, height: metadata.height };
    }
    return null;
  } catch {
    return null;
  }
}

export async function createThumbnail(
  buffer: Buffer,
  filename: string,
  width: number = 300
): Promise<string | null> {
  try {
    const thumbnailDir = join(UPLOAD_DIR, 'thumbnails');
    if (!existsSync(thumbnailDir)) {
      await mkdir(thumbnailDir, { recursive: true });
    }

    const thumbnailFilename = `thumb-${width}-${filename}`;
    const thumbnailPath = join(thumbnailDir, thumbnailFilename);

    await sharp(buffer)
      .resize(width, null, { withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    return `/uploads/thumbnails/${thumbnailFilename}`;
  } catch (error) {
    console.error('Thumbnail creation failed:', error);
    return null;
  }
}

export async function optimizeImage(buffer: Buffer, mimeType: string): Promise<Buffer> {
  try {
    if (mimeType === 'image/svg+xml') {
      return buffer;
    }

    const sharpInstance = sharp(buffer);
    const metadata = await sharpInstance.metadata();
    if (metadata.width && metadata.width > 2048) {
      sharpInstance.resize(2048, null, { withoutEnlargement: true });
    }

    if (mimeType !== 'image/webp' && mimeType !== 'image/avif') {
      return await sharpInstance.webp({ quality: 85 }).toBuffer();
    }

    return await sharpInstance.toBuffer();
  } catch {
    return buffer;
  }
}

function replaceExtension(filename: string, extension: string) {
  return filename.replace(/\.[^.]+$/, extension);
}

export async function saveFile(buffer: Buffer, filename: string, category: string): Promise<string> {
  const categoryDir = join(UPLOAD_DIR, category);

  if (!existsSync(categoryDir)) {
    await mkdir(categoryDir, { recursive: true });
  }

  const filePath = join(categoryDir, filename);
  await writeFile(filePath, buffer);

  return `/uploads/${category}/${filename}`;
}

export async function extractColorPalette(buffer: Buffer): Promise<string[]> {
  try {
    const { data, info } = await sharp(buffer)
      .resize(100, 100, { fit: 'cover' })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const pixelCount = info.width * info.height;
    const colors: Record<string, number> = {};

    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Quantize to reduce noise
      const qr = Math.round(r / 16) * 16;
      const qg = Math.round(g / 16) * 16;
      const qb = Math.round(b / 16) * 16;
      
      const key = `${qr},${qg},${qb}`;
      colors[key] = (colors[key] || 0) + 1;
    }

    // Sort by frequency and convert to HEX/OKLCH
    const sorted = Object.entries(colors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key]) => {
        const [r, g, b] = key.split(',').map(Number);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      });

    return sorted;
  } catch (error) {
    console.error('Color extraction failed:', error);
    return [];
  }
}

export async function processFileUpload(
  file: File,
  options: {
    createThumbnail?: boolean;
    optimizeImages?: boolean;
  } = {}
): Promise<UploadResult> {
  const { createThumbnail: shouldCreateThumbnail = true, optimizeImages = true } = options;

  try {
    const typeValidation = validateFileType(file.type);
    if (!typeValidation.valid) {
      return { success: false, error: typeValidation.error, originalName: file.name, mimeType: file.type, size: file.size };
    }

    const sizeValidation = validateFileSize(file.size);
    if (!sizeValidation.valid) {
      return { success: false, error: sizeValidation.error, originalName: file.name, mimeType: file.type, size: file.size };
    }

    const category = getFileCategory(file.type);
    let outputMimeType = file.type;
    const uniqueFilename = generateUniqueFilename(file.name);
    let outputFilename = uniqueFilename;

    const bytes = await file.arrayBuffer();
    let buffer: Buffer = Buffer.from(bytes) as Buffer;

    let width: number | undefined;
    let height: number | undefined;
    let duration: number | undefined;
    let thumbnailUrl: string | undefined;
    let colorPalette: string[] = [];

    if (category === 'image') {
      const dimensions = await getImageDimensions(buffer);
      if (dimensions) {
        width = dimensions.width;
        height = dimensions.height;
      }

      colorPalette = await extractColorPalette(buffer);

      if (optimizeImages) {
        buffer = await optimizeImage(buffer, file.type);
        if (file.type !== 'image/svg+xml' && file.type !== 'image/webp' && file.type !== 'image/avif') {
          outputFilename = replaceExtension(uniqueFilename, '.webp');
          outputMimeType = 'image/webp';
        }
      }

      if (shouldCreateThumbnail && dimensions) {
        thumbnailUrl = (await createThumbnail(buffer, outputFilename)) ?? undefined;
      }
    }

    const url = await saveFile(buffer, outputFilename, category);

    return {
      success: true,
      id: uuidv4(),
      filename: outputFilename,
      originalName: file.name,
      mimeType: outputMimeType,
      size: file.size,
      width,
      height,
      duration,
      url,
      thumbnailUrl,
      colorPalette,
    };
  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      error: 'Failed to process file upload',
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
    };
  }
}

function resolveStoragePath(url: string) {
  if (!url || typeof url !== 'string' || !url.startsWith('/uploads/')) {
    return null;
  }

  // Sanitize path by removing leading slashes and any traversal segments
  const relativePart = url.replace('/uploads/', '').replace(/\.\.\//g, '');
  const resolved = join(UPLOAD_DIR, relativePart);

  // Ultimate safety: ensure the resolved path still starts with UPLOAD_DIR
  if (!resolved.startsWith(UPLOAD_DIR)) {
    return null;
  }

  return resolved;
}

export async function deleteStoredAsset(url?: string | null) {
  if (!url) return;

  const filePath = resolveStoragePath(url);
  if (!filePath || !existsSync(filePath)) return;

  await unlink(filePath).catch(() => undefined);
}
