#!/usr/bin/env node
/**
 * Post-build: copy onnxruntime-web's runtime files to dist/ort/ so the
 * Transformers.js loader can fetch them from our origin instead of from
 * `cdn.jsdelivr.net`.
 *
 * Why we self-host:
 *   Transformers.js v4 dynamic-imports `ort-wasm-*.{mjs,wasm}` from
 *   `cdn.jsdelivr.net/npm/onnxruntime-web@<version>/dist/...` the first
 *   time any pipeline initialises. That meant our strict-CSP site had to
 *   allow `https://cdn.jsdelivr.net` in BOTH `script-src` (for the .mjs
 *   module-script load) and `connect-src` (for the .wasm streaming-
 *   instantiation fetch). With this copy step + `env.backends.onnx.wasm.
 *   wasmPaths = '/ort/'` set in our ML modules, the runtime stays on our
 *   origin and `cdn.jsdelivr.net` can be dropped from the allow-list.
 *
 *   Trade-off: we re-ship ~20 MB of ORT files per deploy (cached at the
 *   edge after first request). On Cloudflare Pages this is free.
 *
 * What we copy:
 *   Only `ort-wasm-simd-threaded.*.{mjs,wasm}` — the four backend variants
 *   the runtime can switch between (plain WASM, asyncify, jsep WebGPU,
 *   jspi). NOT the TS bindings, NOT the bundled IIFE — those are baked
 *   into Transformers.js itself.
 *
 * Failure mode:
 *   Fail loudly if `node_modules/onnxruntime-web/dist/` is missing —
 *   that means the version transitive-dep changed and our copy list is
 *   stale. Better a build break than a silent prod-CDN-fallback.
 */
import { mkdirSync, copyFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'node_modules', 'onnxruntime-web', 'dist');
const DEST = join(ROOT, 'dist', 'ort');

if (!existsSync(SRC)) {
  console.error(`[copy-ort] FATAL: ${SRC} does not exist.`);
  console.error('[copy-ort] onnxruntime-web is a transitive dep of @huggingface/transformers — run `npm install` first.');
  process.exit(1);
}

mkdirSync(DEST, { recursive: true });

// Match every ort-wasm-simd-threaded.{*.}{mjs,wasm} — the four runtime
// variants Transformers.js can pick (plain, asyncify, jsep, jspi). Anything
// else from the dist (TypeScript bindings, IIFE bundles, source maps) is
// not fetched by Transformers.js v4 at runtime.
const PATTERN = /^ort-wasm-simd-threaded(?:\.[a-z]+)?\.(mjs|wasm)$/;

const files = readdirSync(SRC).filter((f) => PATTERN.test(f));
if (files.length === 0) {
  console.error(`[copy-ort] FATAL: no ort-wasm-simd-threaded.* files in ${SRC}.`);
  console.error('[copy-ort] onnxruntime-web upstream changed its dist layout — adjust PATTERN in this script.');
  process.exit(1);
}

let totalBytes = 0;
for (const f of files) {
  const from = join(SRC, f);
  const to = join(DEST, f);
  copyFileSync(from, to);
  totalBytes += statSync(from).size;
}

const mb = (totalBytes / 1024 / 1024).toFixed(1);
console.log(`[copy-ort] Copied ${files.length} ORT-Web runtime file${files.length === 1 ? '' : 's'} (${mb} MB) to dist/ort/.`);
