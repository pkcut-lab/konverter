#!/usr/bin/env node
/**
 * Raster PWA icon variants from the SVG sources under `public/`.
 * Run manually after editing `icon.svg` / `icon-maskable.svg`:
 *
 *   node scripts/generate-pwa-icons.mjs
 *
 * Output PNGs are committed — the build pipeline does NOT re-run this.
 * Keeps the build graph free of a native sharp dep on CI.
 */
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '..');

async function rasterize(srcSvgRel, outPngRel, size) {
  const src = await readFile(resolve(root, srcSvgRel));
  // Higher density gives crisper edges on the stroke paths.
  const density = size * 2;
  await sharp(src, { density }).resize(size, size).png({ compressionLevel: 9 }).toFile(resolve(root, outPngRel));
  console.log(`${outPngRel} (${size}x${size})`);
}

await rasterize('public/icon.svg', 'public/icon-192.png', 192);
await rasterize('public/icon.svg', 'public/icon-512.png', 512);
await rasterize('public/icon-maskable.svg', 'public/icon-maskable-512.png', 512);
await rasterize('public/icon.svg', 'public/favicon-32.png', 32);

console.log('PWA icons regenerated.');
