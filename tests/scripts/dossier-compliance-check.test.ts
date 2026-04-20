import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, rmSync, mkdirSync, existsSync } from 'node:fs';
// @ts-expect-error — .mjs import without types is fine here
import { checkCompliance } from '../../scripts/dossier-compliance-check.mjs';

const TMP_DIR = 'tests/.tmp-compliance';
const DOSSIER = `${TMP_DIR}/dossier.md`;
const OUTPUT = `${TMP_DIR}/output.md`;

const DOSSIER_GOOD = `---
tool: webp-konverter
---

# Dossier

## §4 User-Pain-Points

- "Ich kann meine HEIC-Fotos vom iPhone nirgends kostenlos konvertieren ohne Upload"
- Batch-Konvertierung fehlt bei vielen Gratis-Konvertern
- Privacy-Bedenken bei Server-Upload sind groß

## §9 Differenzierungs-Hypothese

Unser White-Space: Reine Client-Side-Konvertierung mit Drag-and-Drop-Batch
ohne Server-Upload. Keiner der Top-5-Konkurrenten kombiniert Batch-Support
mit voller Privacy.
`;

function writeOutput(applied: Record<string, unknown>) {
  const frontmatter = [
    '---',
    'ticket: T-1',
    'dossier_applied:',
    `  white_space_feature: "${applied.white_space_feature ?? ''}"`,
    `  user_pain_addressed: "${applied.user_pain_addressed ?? ''}"`,
    '  baseline_features:',
    ...(Array.isArray(applied.baseline_features)
      ? (applied.baseline_features as string[]).map((f) => `    - ${f}`)
      : []),
    '---',
    '',
    '# Tool Output',
    '',
  ].join('\n');
  writeFileSync(OUTPUT, frontmatter);
}

describe('dossier-compliance-check', () => {
  beforeEach(() => {
    mkdirSync(TMP_DIR, { recursive: true });
    writeFileSync(DOSSIER, DOSSIER_GOOD);
  });
  afterEach(() => {
    if (existsSync(TMP_DIR)) rmSync(TMP_DIR, { recursive: true, force: true });
  });

  it('passes when all three dossier-applied fields are present and overlap', () => {
    writeOutput({
      white_space_feature: 'Reine Client-Side-Konvertierung mit Batch-Support',
      user_pain_addressed: 'HEIC-Fotos kostenlos konvertieren ohne Upload',
      baseline_features: ['Drag-and-Drop', 'Format-Auswahl', 'Download-Button'],
    });
    const res = checkCompliance({ outputPath: OUTPUT, dossierPath: DOSSIER });
    expect(res.ok).toBe(true);
    expect(res.failures).toEqual([]);
  });

  it('fails when white_space_feature is empty', () => {
    writeOutput({
      white_space_feature: '',
      user_pain_addressed: 'HEIC-Fotos kostenlos konvertieren ohne Upload',
      baseline_features: ['Drag-and-Drop', 'Format-Auswahl', 'Download-Button'],
    });
    const res = checkCompliance({ outputPath: OUTPUT, dossierPath: DOSSIER });
    expect(res.ok).toBe(false);
    expect(res.failures.some((f: string) => f.includes('white_space_feature is empty'))).toBe(true);
  });

  it('fails when white_space_feature has no token overlap with §9', () => {
    writeOutput({
      white_space_feature: 'Foobar wombat lorem ipsum nonsense gibberish',
      user_pain_addressed: 'HEIC-Fotos kostenlos konvertieren ohne Upload',
      baseline_features: ['a1', 'a2', 'a3'],
    });
    const res = checkCompliance({ outputPath: OUTPUT, dossierPath: DOSSIER });
    expect(res.ok).toBe(false);
    expect(res.failures.some((f: string) => f.includes('token overlap with dossier §9'))).toBe(true);
  });

  it('fails when baseline_features array has <3 items', () => {
    writeOutput({
      white_space_feature: 'Reine Client-Side-Konvertierung mit Batch-Support',
      user_pain_addressed: 'HEIC-Fotos kostenlos konvertieren ohne Upload',
      baseline_features: ['nur-eins'],
    });
    const res = checkCompliance({ outputPath: OUTPUT, dossierPath: DOSSIER });
    expect(res.ok).toBe(false);
    expect(res.failures.some((f: string) => f.includes('baseline_features'))).toBe(true);
  });

  it('fails when baseline_features is missing entirely', () => {
    writeFileSync(
      OUTPUT,
      '---\nticket: T-1\ndossier_applied:\n  white_space_feature: "Reine Client-Side-Konvertierung"\n  user_pain_addressed: "HEIC-Fotos kostenlos konvertieren"\n---\n\n# Out\n',
    );
    const res = checkCompliance({ outputPath: OUTPUT, dossierPath: DOSSIER });
    expect(res.ok).toBe(false);
    expect(res.failures.some((f: string) => f.includes('baseline_features'))).toBe(true);
  });

  it('fails when output file does not exist', () => {
    const res = checkCompliance({
      outputPath: `${TMP_DIR}/missing.md`,
      dossierPath: DOSSIER,
    });
    expect(res.ok).toBe(false);
    expect(res.failures[0]).toMatch(/output file not found/);
  });

  it('fails when dossier file does not exist', () => {
    writeOutput({
      white_space_feature: 'x',
      user_pain_addressed: 'y',
      baseline_features: ['a', 'b', 'c'],
    });
    const res = checkCompliance({
      outputPath: OUTPUT,
      dossierPath: `${TMP_DIR}/missing.md`,
    });
    expect(res.ok).toBe(false);
    expect(res.failures[0]).toMatch(/dossier file not found/);
  });

  it('flags malformed dossier (missing §9 heading)', () => {
    writeFileSync(
      DOSSIER,
      '---\ntool: x\n---\n\n## §4 User-Pain-Points\n\n- "etwas kostenlos konvertieren"\n',
    );
    writeOutput({
      white_space_feature: 'Reine Client-Side-Konvertierung mit Batch-Support',
      user_pain_addressed: 'etwas kostenlos konvertieren',
      baseline_features: ['a', 'b', 'c'],
    });
    const res = checkCompliance({ outputPath: OUTPUT, dossierPath: DOSSIER });
    expect(res.ok).toBe(false);
    expect(res.failures.some((f: string) => f.includes('§9') && f.includes('malformed'))).toBe(true);
  });
});
