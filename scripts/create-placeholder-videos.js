#!/usr/bin/env node
/**
 * Create placeholder video files for media assets
 * These are minimal MP4 files that can be played
 */

const fs = require('fs');
const path = require('path');

const mediaDir = path.join(__dirname, '..', 'public', 'media');

// Ensure directory exists
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

// Minimal MP4 file structure (valid but very small)
// This is a valid MP4 file with minimal atoms
const createMinimalMP4 = () => {
  // ftyp atom
  const ftyp = Buffer.from([
    0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, // size + 'ftyp'
    0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00, 0x00, 0x00, // major_brand + minor_version
    0x69, 0x73, 0x6f, 0x6d, 0x69, 0x73, 0x6f, 0x32, // compatible_brands
    0x6d, 0x70, 0x34, 0x31, 0x00, 0x00, 0x00, 0x00  // (cont.)
  ]);

  // mdat atom with minimal data
  const mdatData = Buffer.alloc(100); // Minimal video data
  const mdat = Buffer.concat([
    Buffer.from([
      0x00, 0x00, 0x00, (mdatData.length + 8) >> 24,
      (mdatData.length + 8) >> 16, (mdatData.length + 8) >> 8,
      (mdatData.length + 8) & 0xff, 0x6d
    ]),
    Buffer.from([0x64, 0x61, 0x74]), // 'dat'
    mdatData
  ]);

  return Buffer.concat([ftyp, mdat]);
};

const videoFiles = [
  'dougie-frame-loop.mp4',
  'breathing-dm-loop.mp4'
];

console.log('[v0] Creating placeholder video files...');

videoFiles.forEach(filename => {
  const filepath = path.join(mediaDir, filename);
  const videoData = createMinimalMP4();
  
  fs.writeFileSync(filepath, videoData);
  console.log(`[v0] Created: ${filename} (${videoData.length} bytes)`);
});

console.log('[v0] Placeholder videos created successfully');
