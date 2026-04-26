import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const path = join(process.cwd(), 'src/content/tools/hintergrund-entfernen/de.md');
const raw = readFileSync(path, 'utf-8');

const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
if (!fmMatch) throw new Error('Content MD missing frontmatter');
const yaml = fmMatch[1];
const body = fmMatch[2];

function parseYaml(s: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const line of s.split('\n')) {
    const m = line.match(/^(\w+):\s*"?([^"]*)"?$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

describe('hintergrund-entfernen content (DE)', () => {
  const fm = parseYaml(yaml);

  it('toolId is remove-background', () => {
    expect(fm.toolId).toBe('remove-background');
  });

  it('language is de', () => {
    expect(fm.language).toBe('de');
  });

  it('body starts with H2 heading', () => {
    expect(body.trim().startsWith('## ')).toBe(true);
  });

  it('contains the locked H2 in order', () => {
    const expected = [
      '## Wie funktioniert das Tool?',
      '## Datenschutz — 100\u00A0% im Browser',
      '## Wann liefert das Tool gute Ergebnisse?',
    ];
    let pos = 0;
    for (const h of expected) {
      const found = body.indexOf(h, pos);
      expect(found, `expected "${h}" after position ${pos}`).toBeGreaterThanOrEqual(0);
      pos = found + h.length;
    }
  });

  it('body word count is ≥ 800', () => {
    const words = body.replace(/[#*_`]/g, ' ').split(/\s+/).filter(Boolean);
    expect(words.length).toBeGreaterThanOrEqual(800);
  });

  it('headline mentions privacy / browser', () => {
    expect(String(fm.title).toLowerCase()).toMatch(/browser|hochladen|gerät/);
  });

  it('datenschutz section discloses model CDN + asserts no image upload', () => {
    const section = body.slice(
      body.indexOf('## Datenschutz'),
      body.indexOf('## Wann liefert das Tool gute Ergebnisse?'),
    );
    // Privacy disclosure must mention the one-time model download is the only outbound network event.
    // Wording is intentionally generic (no vendor names) — see CONVENTIONS for the no-vendor-disclosure rule.
    expect(section).toMatch(/cdn|modell-download|modell-datei/i);
    expect(section).toMatch(/kein.*upload|nicht.*hochgeladen|100.*%.*im\s*browser/i);
    expect(section).toMatch(/\/de\/datenschutz/);
  });
});
