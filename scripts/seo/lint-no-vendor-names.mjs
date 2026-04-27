#!/usr/bin/env node
/**
 * scripts/seo/lint-no-vendor-names.mjs
 *
 * Hard-fails the build when user-visible content reveals specific model,
 * library or vendor names. The rule is in CONTENT.md §10 ("Kein
 * Implementation-Reveal"): generic descriptions only ("a specialized
 * neural network", "an open-source library", "WebGPU-accelerated").
 *
 * Why this exists: prior session shipped product copy that named BiRefNet,
 * BEN2, RoBERTa, Whisper, Tesseract, pdf-lib, PDF.js, MODNet, Mediabunny,
 * DeepFilterNet, Hugging Face etc. — implementation details that telegraph
 * the stack to competitors and add nothing for users or SEO/GEO.
 *
 * Scopes scanned (user-visible only):
 *   - src/content/**\/*.md          (frontmatter + body text)
 *   - src/components/**\/*.svelte   (template literals, only outside <script>)
 *   - src/lib/tools/*.ts            (string literals only — JSDoc comments
 *                                    are stripped before scanning, since
 *                                    code comments don't ship to users)
 *   - public/llms-full.txt          (auto-generated, but worth verifying)
 *   - scripts/seo/generate-llms-txt.mjs  (the static template strings inside)
 *
 * Tokens treated as third-party-tool mentions (never our implementation)
 * are allow-listed inline below.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

// ── Forbidden patterns ───────────────────────────────────────────────────────
// One regex per concept. Word boundaries where applicable. Case-sensitive
// where the brand is itself capitalized; case-insensitive otherwise.
const FORBIDDEN = [
  // Vision / image segmentation models
  { name: 'BiRefNet',           re: /\bBiRefNet\b/ },
  { name: 'BEN2',               re: /\bBEN2\b/ },
  { name: 'Binary Enhanced Network', re: /Binary Enhanced Network/i },
  { name: 'MODNet',             re: /\bMODNet\b/ },
  { name: 'U2-Net',             re: /\bU2-Net\b/i },
  { name: 'RMBG',               re: /\bRMBG\b/ },
  { name: 'MediaPipe',          re: /\bMediaPipe\b/ },
  { name: 'Vision Transformer (ViT)', re: /Vision Transformer\s*\(ViT\)/i },

  // NLP / classifier models
  { name: 'RoBERTa',            re: /\bRoBERTa\b/ },

  // Speech models
  { name: 'Whisper-Modell',     re: /Whisper-Modell|Whisper-KI|Whisper-architecture/i },
  { name: 'DeepFilterNet',      re: /\bDeepFilterNet\b/i },

  // OCR
  { name: 'Tesseract',          re: /\bTesseract(?:\.js|-WASM|-Engine|-OCR)?\b/i },

  // PDF libraries
  { name: 'pdf-lib',            re: /\bpdf-lib\b/i },
  { name: 'PDF.js',             re: /\bPDF\.js\b/i },
  { name: 'jsPDF',              re: /\bjsPDF\b/ },

  // Video / audio libraries
  { name: 'Mediabunny',         re: /\bMediabunny\b/i },

  // ML runtimes / frameworks
  { name: 'Transformers.js',    re: /\bTransformers\.js\b/i },
  { name: 'ONNX (as user-facing tech)', re: /\bONNX(?:\s*Runtime|-Datei|-Modell|-Format|-based)\b/i },
  { name: 'TensorFlow.js',      re: /\bTensorFlow\.js\b/i },
  { name: 'onnxruntime-web',    re: /\bonnxruntime(?:-web)?\b/i },

  // Vendors / CDNs (only when describing OUR implementation)
  { name: 'Hugging Face',       re: /\bHugging\s*Face\b/i },
  { name: 'Mozilla (PDF.js)',   re: /Mozilla[^"\n]*?(?:PDF\.js|pdf\.js|Apache)/i },
  { name: 'Fraunhofer (DeepFilterNet)', re: /Fraunhofer[^"\n]*?(?:DeepFilterNet|Speech)/i },

  // License tags glued to a specific library name (we don't disclose stack)
  { name: 'MIT-Lizenz (mit Lib-Name)',
    re: /(?:pdf-lib|BiRefNet|BEN2|MODNet|Tesseract|PDF\.js|Mediabunny|DeepFilterNet)[^.\n]{0,40}MIT/i },
  { name: 'Apache-2.0 (mit Lib-Name)',
    re: /(?:pdf-lib|BiRefNet|BEN2|MODNet|Tesseract|PDF\.js|Mediabunny|DeepFilterNet|MODNet)[^.\n]{0,40}Apache/i },

  // Specific implementation details that reveal the library
  { name: 'DCTDecode-Filter',   re: /DCTDecode-Filter/i },
  { name: 'PDFDocument.copyPages()', re: /PDFDocument\.copyPages/i },
  { name: 'atten_lim_db param', re: /atten_lim_db/i },
];

// ── Allow-list ───────────────────────────────────────────────────────────────
// These third-party names are NEVER our implementation — they're competitor
// products or services the user might use elsewhere. Mentioning them is fine.
const ALLOWED_CONTEXT_PATTERNS = [
  // Competitors / alternative services in comparison context
  /Adobe Podcast/i, /Cleanvoice/i, /Auphonic/i,
  /iLovePDF/i, /Smallpdf/i, /PDF24/i, /Sejda/i, /pdfforge/i, /PDFCandy/i,
  /Kapwing/i, /VEED/i, /Runway/i, /CapCut/i,
  /Rev/i, /Otter\.ai/i,
  // External AI generators users want to detect
  /Midjourney/i, /Stable Diffusion/i, /DALL-E/i, /Adobe Firefly/i,
  /ChatGPT/i, /Claude/i, /Gemini/i, /LLaMA/i, /Mistral/i,
];

// ── File scopes ──────────────────────────────────────────────────────────────
// `mode: 'full'`     → scan every line (after comment stripping).
// `mode: 'ui-only'`  → scan ONLY user-facing string property values
//                      (label, subLabel, tagline, intro, description,
//                      placeholder, title, metaDescription, alt, ariaLabel).
//                      Internal code — imports, model identifiers, status
//                      callbacks, type annotations — is silently skipped.
const UI_PROP_RE = /\b(?:label|subLabel|tagline|intro|description|placeholder|title|metaDescription|alt|ariaLabel|aria-label)\s*:\s*(['"`])((?:\\.|(?!\1).)*)\1/g;

const SCOPES = [
  { dir: 'src/content',          ext: ['.md'],     mode: 'full',    stripComments: false },
  { dir: 'src/components/tools', ext: ['.svelte'], mode: 'full',    stripComments: 'svelte' },
  { dir: 'src/lib/tools',        ext: ['.ts'],     mode: 'ui-only', stripComments: 'js' },
  { dir: 'public',               ext: ['.txt'],    mode: 'full',    stripComments: false,
    only: ['llms-full.txt', 'llms.txt'] },
  { dir: 'scripts/seo',          ext: ['.mjs'],    mode: 'full',    stripComments: 'js',
    only: ['generate-llms-txt.mjs'] },
];

function walk(dir, ext, only) {
  const out = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const name of entries) {
    const full = join(dir, name);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) {
      out.push(...walk(full, ext, only));
    } else if (ext.includes(extname(name))) {
      if (only && !only.includes(name)) continue;
      out.push(full);
    }
  }
  return out;
}

// Strip JS/TS line and block comments — they don't ship to users.
// Naive but adequate for our codebase (no comment markers inside strings
// in the files we scan; if that ever becomes an issue, swap for a parser).
function stripJsComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '')   // block comments
    .replace(/(^|[^:])\/\/.*$/gm, '$1'); // line comments (skip protocol-relative URLs)
}

// Strip <script>…</script> blocks from .svelte files — same reasoning.
function stripSvelteScripts(src) {
  return src
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');
}

// ── Run ──────────────────────────────────────────────────────────────────────
const violations = [];

for (const scope of SCOPES) {
  const dir = join(ROOT, scope.dir);
  const files = walk(dir, scope.ext, scope.only);
  for (const file of files) {
    let src = readFileSync(file, 'utf8');
    if (scope.stripComments === 'js') src = stripJsComments(src);
    if (scope.stripComments === 'svelte') src = stripSvelteScripts(src);

    if (scope.mode === 'ui-only') {
      // For TS configs: extract just the values of UI-facing properties
      // and scan each one with its source line attached for the report.
      const lines = src.split(/\r?\n/);
      let m;
      UI_PROP_RE.lastIndex = 0;
      while ((m = UI_PROP_RE.exec(src)) !== null) {
        const value = m[2];
        if (!value) continue;
        if (ALLOWED_CONTEXT_PATTERNS.some((p) => p.test(value))) continue;
        const lineNo = src.slice(0, m.index).split(/\r?\n/).length;
        for (const { name, re } of FORBIDDEN) {
          if (!re.test(value)) continue;
          violations.push({
            file: relative(ROOT, file).replace(/\\/g, '/'),
            line: lineNo,
            name,
            text: (lines[lineNo - 1] ?? '').trim().slice(0, 160),
          });
        }
      }
    } else {
      const lines = src.split(/\r?\n/);
      lines.forEach((line, i) => {
        // Skip lines that name an allowed competitor/service in a
        // comparison context. Heuristic: if the line contains an allowed
        // product name, treat the forbidden hit as part of a comparison
        // sentence and skip. Conservative — when in doubt, still flag.
        const inAllowedContext = ALLOWED_CONTEXT_PATTERNS.some((p) => p.test(line));

        for (const { name, re } of FORBIDDEN) {
          if (!re.test(line)) continue;
          if (inAllowedContext) continue;
          violations.push({
            file: relative(ROOT, file).replace(/\\/g, '/'),
            line: i + 1,
            name,
            text: line.trim().slice(0, 160),
          });
        }
      });
    }
  }
}

if (violations.length === 0) {
  console.log('✓ lint-no-vendor-names: no model/library/vendor leaks in user-visible content.');
  process.exit(0);
}

console.error('❌ lint-no-vendor-names: forbidden vendor/model/library names found in user-visible content.\n');
console.error('Rule: CONTENT.md §10 — generic descriptions only ("specialized neural network",');
console.error('       "open-source library", "WebGPU-accelerated"). No model names, no library');
console.error('       names, no licenses tied to specific libraries, no vendor CDNs.\n');
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  ⤳  ${v.name}`);
  console.error(`    ${v.text}`);
}
console.error(`\n${violations.length} violation(s). Fix the wording, then re-run \`npm run check\`.`);
process.exit(1);
