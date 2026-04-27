#!/usr/bin/env node
/**
 * scripts/i18n/lint-no-de-in-ui.mjs
 *
 * Hard-fails the build when shared UI components contain hardcoded German
 * strings, raw locale codes, or anti-pattern ternaries that bypass the
 * central i18n machinery in `src/lib/i18n/`.
 *
 * Why: kittokit ships in multiple languages. Every user-visible string
 * MUST come from `t(lang).<key>` (see `src/lib/i18n/strings.ts`) so that
 * adding a new language is a one-file change. Hardcoded `'Werkzeuge'` /
 * `'Speichern'` / `lang === 'de' ? … : …` ternaries silently break EN
 * and any future PT-BR / ES / FR build with NO compile error — the bug
 * only surfaces when a user opens the localised page.
 *
 * Anti-patterns caught:
 *   1. `lang === 'de'` / `lang === 'en'` ternary or comparison in any
 *      component file — replace with `t(lang).<key>` lookup.
 *   2. Hardcoded `'de_DE'` / `'en_US'` / `'de-DE'` / `'en-US'` outside
 *      `src/lib/i18n/locale-maps.ts` — use the central maps instead.
 *   3. Hardcoded `/de/` or `/en/` path literals in components — build
 *      paths via `/${lang}/...` or `getStaticPagePath(slug, lang)`.
 *   4. DE-stopwords (visible labels like "Werkzeuge", "Speichern") in
 *      Astro / Svelte template regions — must come from `t(lang)`.
 *
 * Scopes:
 *   - src/layouts/**\/*.astro       (full file)
 *   - src/components/**\/*.astro    (full file; brand-name allowlist applies)
 *   - src/components/**\/*.svelte   (template body only — `<script>` is
 *                                   stripped because runtime strings come
 *                                   through `t()` already)
 *
 * Allowed locations (NEVER flagged):
 *   - src/lib/i18n/**             (the localisation source itself)
 *   - src/lib/hreflang.ts         (defines ACTIVE_LANGUAGES = ['de','en'])
 *   - src/lib/static-page-slugs.ts (legitimate per-language slug data)
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

// ── Forbidden patterns ───────────────────────────────────────────────────────
const FORBIDDEN = [
  // 1. Ternary / comparison anti-pattern. Bypasses t() entirely.
  {
    name: "lang ternary (use t(lang).<key> instead)",
    re: /\blang\s*===\s*['"](?:de|en)['"]/,
  },

  // 2. Raw locale codes. Source of truth is src/lib/i18n/locale-maps.ts.
  {
    name: "hardcoded 'de_DE' / 'en_US' (use OG_LOCALE_MAP)",
    re: /['"`](?:de_DE|en_US|pt_BR|es_ES|fr_FR)['"`]/,
  },
  {
    name: "hardcoded 'de-DE' / 'en-US' (use INTL_LOCALE_MAP)",
    re: /['"`](?:de-DE|en-US|pt-BR|es-ES|fr-FR)['"`]/,
  },

  // 3. Hardcoded language path literals — these break when the user is
  //    on a different language. Build with `/${lang}/...` or
  //    `getStaticPagePath(slug, lang)` instead.
  {
    name: "hardcoded '/de/...' path (use /${lang}/... or staticPagePath)",
    re: /["'`]\/de\/[a-zA-Z0-9_/-]+/,
  },
  {
    name: "hardcoded '/en/...' path (use /${lang}/... or staticPagePath)",
    re: /["'`]\/en\/[a-zA-Z0-9_/-]+/,
  },

  // 4. DE stopwords visible in template regions. List is intentionally
  //    short and high-signal — adjectives like "schnell" or articles
  //    like "der/die/das" produce too many false positives. These
  //    tokens are user-visible labels that MUST be t()-routed.
  { name: "DE label 'Werkzeuge'",          re: /\bWerkzeuge\b/ },
  { name: "DE label 'Werkzeug'",           re: /\bWerkzeug\b/ },
  { name: "DE label 'Speichern'",          re: /\bSpeichern\b/ },
  { name: "DE label 'Auswählen'",          re: /\bAuswählen\b/ },
  { name: "DE label 'Auswahl'",            re: /\bAuswahl\b/ },
  { name: "DE label 'Tauschen'",           re: /\bTauschen\b/ },
  { name: "DE label 'Kopieren'",           re: /\bKopieren\b/ },
  { name: "DE label 'Kopiert'",            re: /\bKopiert\b/ },
  { name: "DE label 'Häufige Werte'",      re: /Häufige Werte/ },
  { name: "DE label 'Schritt'",            re: /\bSchritt\b/ },
  { name: "DE label 'Datenschutz'",        re: /\bDatenschutz\b/ },
  { name: "DE label 'Impressum'",          re: /\bImpressum\b/ },
  { name: "DE label 'Notwendig'",          re: /\bNotwendig\b/ },
  { name: "DE label 'Hauptnavigation'",    re: /\bHauptnavigation\b/ },
  { name: "DE label 'Farbschema'",         re: /\bFarbschema\b/ },
  { name: "DE label 'Hell' / 'Dunkel'",    re: /\b(?:Hell|Dunkel)\b/ },
  { name: "DE label 'Beliebt'",            re: /\bBeliebt\b/ },
  { name: "DE label 'Startseite'",         re: /\bStartseite\b/ },
  { name: "DE label 'Rechtliches'",        re: /\bRechtliches\b/ },
  { name: "DE label 'Nach oben'",          re: /Nach oben/ },
  { name: "DE label 'Zurücksetzen'",       re: /\bZurücksetzen\b/ },
  { name: "DE label 'Zum Inhalt springen'", re: /Zum Inhalt springen/ },
  { name: "DE label 'Cookie-Einstellungen'", re: /Cookie-Einstellungen/ },
  { name: "DE label 'Alle akzeptieren'",   re: /Alle akzeptieren/ },
  { name: "DE label 'Nur notwendige'",     re: /Nur notwendige/ },
  { name: "DE label 'Ergebnis kopieren'",  re: /Ergebnis kopieren/ },
  { name: "DE label 'Richtung tauschen'",  re: /Richtung tauschen/ },
  { name: "DE label 'Tools durchsuchen'",  re: /Tools durchsuchen/ },
  { name: "DE label 'Tool-Suche'",         re: /Tool-Suche/ },
];

// ── Per-line allowlist patterns ──────────────────────────────────────────────
// If a line matches any of these, every forbidden hit on that line is
// suppressed. Use sparingly for legitimate cases (brand names, comments
// describing forbidden patterns themselves, allowlist tables).
const ALLOWED_LINE_PATTERNS = [
  // The brand wordmark splits "kittokit" with <em>to</em> for typography.
  /kit<em>to<\/em>kit/,
  // Lines that explicitly DOCUMENT the forbidden pattern — comments, etc.
  /\b(?:TODO|FIXME|NOTE|allowlist|forbidden|allowed)\b/i,
];

// ── File scopes ──────────────────────────────────────────────────────────────
const SCOPES = [
  { dir: 'src/layouts',     ext: ['.astro'],  mode: 'astro' },
  { dir: 'src/components',  ext: ['.astro'],  mode: 'astro' },
  { dir: 'src/components',  ext: ['.svelte'], mode: 'svelte' },
];

// Files allow-listed wholesale (i18n source itself, language registry).
// Path comparison uses forward slashes.
const ALLOWED_FILES = new Set([
  'src/lib/i18n/strings.ts',
  'src/lib/i18n/units.ts',
  'src/lib/i18n/locale-maps.ts',
  'src/lib/i18n/lang.ts',
  'src/lib/i18n/types.ts',
  'src/lib/hreflang.ts',
  'src/lib/static-page-slugs.ts',
]);

function walk(dir, ext) {
  const out = [];
  let entries;
  try { entries = readdirSync(dir); } catch { return out; }
  for (const name of entries) {
    const full = join(dir, name);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) {
      out.push(...walk(full, ext));
    } else if (ext.includes(extname(name))) {
      out.push(full);
    }
  }
  return out;
}

/**
 * For Svelte files: strip everything inside `<script>` and `<style>` so
 * the linter only sees template markup. The runtime strings used by
 * `<script>` already flow through t(lang) when the component is wired
 * up correctly; the lint job is to make sure the TEMPLATE text is too.
 */
function stripSvelteNonTemplate(src) {
  return src
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');
}

/**
 * For Astro files: strip the `<style>` block. The `---` frontmatter is
 * still TS code where DE stopwords MIGHT legitimately appear (e.g. a
 * variable name) — but the patterns we ban (`Werkzeuge`, `Speichern`,
 * etc.) are user-facing labels that should never live in a frontmatter
 * variable. So we scan everything except `<style>`.
 */
function stripAstroStyle(src) {
  return src.replace(/<style[\s\S]*?<\/style>/gi, '');
}

const violations = [];

for (const scope of SCOPES) {
  const dir = join(ROOT, scope.dir);
  const files = walk(dir, scope.ext);
  for (const file of files) {
    const relPath = relative(ROOT, file).replace(/\\/g, '/');
    if (ALLOWED_FILES.has(relPath)) continue;

    let src = readFileSync(file, 'utf8');
    if (scope.mode === 'svelte') src = stripSvelteNonTemplate(src);
    if (scope.mode === 'astro')  src = stripAstroStyle(src);

    const lines = src.split(/\r?\n/);
    lines.forEach((line, i) => {
      if (ALLOWED_LINE_PATTERNS.some((p) => p.test(line))) return;
      for (const { name, re } of FORBIDDEN) {
        if (!re.test(line)) continue;
        violations.push({
          file: relPath,
          line: i + 1,
          name,
          text: line.trim().slice(0, 160),
        });
      }
    });
  }
}

if (violations.length === 0) {
  console.log('✓ lint-no-de-in-ui: no hardcoded DE strings or locale ternaries in shared UI.');
  process.exit(0);
}

console.error('❌ lint-no-de-in-ui: hardcoded DE strings / locale-anti-patterns found in shared UI.\n');
console.error('Rule: every user-visible string MUST come from t(lang) — see src/lib/i18n/strings.ts.');
console.error('      Locale codes use OG_LOCALE_MAP / INTL_LOCALE_MAP from locale-maps.ts.');
console.error('      Per-language paths use `/${lang}/...` or `getStaticPagePath(slug, lang)`.\n');

for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  ⤳  ${v.name}`);
  console.error(`    ${v.text}`);
}

console.error(`\n${violations.length} violation(s). Fix and re-run \`npm run lint:i18n\`.`);
process.exit(1);
