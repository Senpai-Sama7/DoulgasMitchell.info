/**
 * Regenerate every raster icon from public/favicon.svg.
 *
 * Run with: bun scripts/generate-favicons.mjs
 *
 * Tab favicons keep the rounded-corner alpha. Launcher icons (apple-touch +
 * manifest icons, including the maskable ones) are flattened onto a solid ink
 * square with the mark scaled into the maskable safe zone, so circular and
 * squircle platform masks never clip the letterform.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const svgPath = path.join(root, 'public', 'favicon.svg');
const outDir = path.join(root, 'public', 'icons');

/** Must match the ink ground inside favicon.svg. */
const INK = '#0e141b';

const ROUNDED = [
  ['favicon-32x32.png', 32],
  ['favicon-192x192.png', 192],
  ['favicon-dm.png', 512],
];

const FLAT = [
  ['apple-touch-icon.png', 180],
  ['badge-72x72.png', 72],
  ['icon-72x72.png', 72],
  ['icon-96x96.png', 96],
  ['icon-128x128.png', 128],
  ['icon-144x144.png', 144],
  ['icon-152x152.png', 152],
  ['icon-192x192.png', 192],
  ['icon-384x384.png', 384],
  ['icon-512x512.png', 512],
];

const svg = await readFile(svgPath);

/** 2x oversample so the 64-unit viewBox rasterizes crisply before resize. */
const density = (size) => Math.ceil((72 * size * 2) / 64);

for (const [name, size] of ROUNDED) {
  await sharp(svg, { density: density(size) })
    .resize(size, size)
    .png()
    .toFile(path.join(outDir, name));
  console.log(`ok ${name}`);
}

for (const [name, size] of FLAT) {
  const inner = Math.round(size * 0.8);
  const mark = await sharp(svg, { density: density(inner) })
    .resize(inner, inner)
    .png()
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: INK },
  })
    .composite([{ input: mark, gravity: 'centre' }])
    .flatten({ background: INK })
    .png()
    .toFile(path.join(outDir, name));
  console.log(`ok ${name}`);
}

console.log('All icons regenerated from favicon.svg');
