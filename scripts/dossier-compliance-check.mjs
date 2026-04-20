#!/usr/bin/env node
// dossier-compliance-check.mjs — Merged-Critic Check #13
//
// Prüft, ob der Builder-Output (engineer_output_<ticket-id>.md) das Dossier
// tatsächlich angewandt hat:
//   1. dossier_applied.white_space_feature ist non-empty AND
//      in Dossier §9 Differenzierungs-Hypothese als Bullet/Zeile zitierbar.
//   2. dossier_applied.user_pain_addressed ist non-empty AND
//      bezieht sich auf ≥1 Zitat aus Dossier §4 User-Pain-Points (Token-Match).
//   3. dossier_applied.baseline_features ist ein Array mit ≥3 Einträgen
//      (kein Tool hat 0 Baseline-Features).
//
// Matching ist bewusst permissiv (Bag-of-Tokens ≥2 überlappende non-stopword
// Tokens), damit Builder nicht jedes Komma paraphrase-matchen müssen. Strenger
// wäre fragil und führt zu False-Positives.
//
// Exit-Codes:
//   0 = compliant
//   1 = non-compliant (mit Begründung auf stderr)
//   2 = invalid input (Files fehlen, Parse-Error)

import { readFileSync, existsSync } from 'node:fs';
import matter from 'gray-matter';

const STOPWORDS_DE = new Set([
  'der', 'die', 'das', 'den', 'dem', 'ein', 'eine', 'einen', 'einer', 'eines',
  'und', 'oder', 'aber', 'nicht', 'kein', 'keine', 'ist', 'sind', 'war', 'waren',
  'bei', 'mit', 'von', 'zu', 'zum', 'zur', 'aus', 'auf', 'über', 'unter',
  'für', 'gegen', 'ohne', 'durch', 'als', 'wie', 'wenn', 'dass', 'weil',
  'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'sie',
  'this', 'that', 'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was',
  'were', 'with', 'for', 'of', 'to', 'in', 'on', 'at', 'by',
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 3 && !STOPWORDS_DE.has(t));
}

function bagOverlap(a, b, minOverlap = 2) {
  const setA = new Set(a);
  let hits = 0;
  for (const t of b) if (setA.has(t)) hits += 1;
  return { hits, enough: hits >= minOverlap };
}

function extractSection(markdown, headingRegex) {
  const lines = markdown.split(/\r?\n/);
  let inSection = false;
  const collected = [];
  for (const line of lines) {
    if (/^#{1,6}\s+/.test(line)) {
      if (inSection) break;
      if (headingRegex.test(line)) {
        inSection = true;
        continue;
      }
    }
    if (inSection) collected.push(line);
  }
  return collected.join('\n').trim();
}

/**
 * @param {{ outputPath: string, dossierPath: string }} params
 * @returns {{ ok: boolean, failures: string[] }}
 */
export function checkCompliance({ outputPath, dossierPath }) {
  const failures = [];
  if (!existsSync(outputPath)) {
    return { ok: false, failures: [`output file not found: ${outputPath}`] };
  }
  if (!existsSync(dossierPath)) {
    return { ok: false, failures: [`dossier file not found: ${dossierPath}`] };
  }
  const output = matter(readFileSync(outputPath, 'utf8'));
  const dossier = matter(readFileSync(dossierPath, 'utf8'));
  const applied = output.data.dossier_applied ?? {};

  // 1. white_space_feature non-empty + in §9
  const ws = String(applied.white_space_feature ?? '').trim();
  if (!ws) {
    failures.push('dossier_applied.white_space_feature is empty');
  } else {
    const s9 = extractSection(
      dossier.content,
      /^#{1,3}\s*§?\s*9|^#{1,3}\s*Differenzierungs-Hypothese/i,
    );
    if (!s9) {
      failures.push('dossier §9 (Differenzierungs-Hypothese) not found — dossier malformed');
    } else {
      const overlap = bagOverlap(tokenize(s9), tokenize(ws), 2);
      if (!overlap.enough) {
        failures.push(
          `white_space_feature "${ws.slice(0, 60)}…" has ${overlap.hits} token overlap with dossier §9 (need ≥2)`,
        );
      }
    }
  }

  // 2. user_pain_addressed non-empty + in §4
  const up = String(applied.user_pain_addressed ?? '').trim();
  if (!up) {
    failures.push('dossier_applied.user_pain_addressed is empty');
  } else {
    const s4 = extractSection(
      dossier.content,
      /^#{1,3}\s*§?\s*4|^#{1,3}\s*User[-\s]?Pain/i,
    );
    if (!s4) {
      failures.push('dossier §4 (User-Pain-Points) not found — dossier malformed');
    } else {
      const overlap = bagOverlap(tokenize(s4), tokenize(up), 2);
      if (!overlap.enough) {
        failures.push(
          `user_pain_addressed "${up.slice(0, 60)}…" has ${overlap.hits} token overlap with dossier §4 (need ≥2)`,
        );
      }
    }
  }

  // 3. baseline_features array ≥3
  const baseline = applied.baseline_features;
  if (!Array.isArray(baseline) || baseline.length < 3) {
    failures.push(
      `baseline_features must be an array of ≥3 items, got ${JSON.stringify(baseline)}`,
    );
  }

  return { ok: failures.length === 0, failures };
}

// CLI
if (process.argv[1]?.endsWith('dossier-compliance-check.mjs')) {
  const [, , outputPath, dossierPath] = process.argv;
  if (!outputPath || !dossierPath) {
    console.error('Usage: node scripts/dossier-compliance-check.mjs <engineer_output> <dossier>');
    process.exit(2);
  }
  const res = checkCompliance({ outputPath, dossierPath });
  if (res.ok) {
    console.log('PASS dossier-compliance');
    process.exit(0);
  }
  console.error('FAIL dossier-compliance');
  for (const f of res.failures) console.error(`  - ${f}`);
  process.exit(1);
}
