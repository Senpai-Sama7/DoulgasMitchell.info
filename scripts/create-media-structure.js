import fs from 'fs';
import path from 'path';

// Create media directories
const dirs = [
  'public/media',
  'public/icons'
];

dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`[v0] Created directory: ${dir}`);
  }
});

// Create minimal valid WebP files (smallest possible valid WebP image - 1x1 transparent)
const webpMinimal = Buffer.from([
  0x52, 0x49, 0x46, 0x46, 0x1a, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
  0x56, 0x50, 0x38, 0x20, 0x0e, 0x00, 0x00, 0x00, 0x30, 0x01, 0x00, 0x9d,
  0x01, 0x2a, 0x01, 0x00, 0x01, 0x00, 0x02, 0x00, 0x34, 0x25, 0xa4, 0x00,
  0x03, 0x70, 0x00, 0xfe, 0xfb, 0x94, 0x00, 0x00
]);

// Create minimal valid MP4 file (ftyp box only - just enough to be recognized as MP4)
const mp4Minimal = Buffer.from([
  0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70,
  0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00, 0x02, 0x00,
  0x69, 0x73, 0x6f, 0x6d, 0x69, 0x73, 0x6f, 0x32,
  0x6d, 0x70, 0x34, 0x31, 0x6d, 0x70, 0x34, 0x32
]);

const mediaFiles = [
  { path: 'public/media/dougie-frame-loop.mp4', buffer: mp4Minimal, type: 'MP4' },
  { path: 'public/media/breathing-dm-loop.mp4', buffer: mp4Minimal, type: 'MP4' },
  { path: 'public/media/dougie-frame-poster.webp', buffer: webpMinimal, type: 'WebP' },
  { path: 'public/media/breathing-dm-poster.webp', buffer: webpMinimal, type: 'WebP' }
];

mediaFiles.forEach(({ path: filePath, buffer, type }) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, buffer);
    console.log(`[v0] Created ${type} file: ${filePath}`);
  } else {
    console.log(`[v0] File already exists: ${filePath}`);
  }
});

console.log('[v0] Media structure setup complete');
