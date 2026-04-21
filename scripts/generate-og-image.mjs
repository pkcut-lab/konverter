#!/usr/bin/env node
/**
 * Raster the global OG-fallback image from its SVG source.
 * Run manually after editing `public/og-image.svg`:
 *
 *   node scripts/generate-og-image.mjs
 *
 * Output PNG is committed — the build pipeline does NOT re-run this
 * (same policy as scripts/generate-pwa-icons.mjs — keeps CI free of
 * the native sharp dep).
 *
 * Phase-2-TODO: Satori-based per-tool OG rendering as per open-questions
 * Q1, Option 3. This fallback stays as the default for tools without a
 * rendered per-tool card.
 */
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '..');

const src = await readFile(resolve(root, 'public/og-image.svg'));
// Raster at native 1200×630 — OG spec size for Facebook/Twitter Cards.
// `density: 144` gives crisp text without bloat (~40–60 KB output).
await sharp(src, { density: 144 })
  .resize(1200, 630)
  .png({ compressionLevel: 9 })
  .toFile(resolve(root, 'public/og-image.png'));

console.log('public/og-image.png (1200x630) regenerated.');
