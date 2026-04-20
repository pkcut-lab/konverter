import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const path = join(process.cwd(), 'src/content/tools/hevc-zu-h264/de.md');
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

describe('hevc-zu-h264 content (DE)', () => {
  const fm = parseYaml(yaml);

  it('toolId is hevc-to-h264', () => {
    expect(fm.toolId).toBe('hevc-to-h264');
  });

  it('language is de', () => {
    expect(fm.language).toBe('de');
  });

  it('title length in 30–60 range', () => {
    const len = String(fm.title).length;
    expect(len).toBeGreaterThanOrEqual(30);
    expect(len).toBeLessThanOrEqual(60);
  });

  it('metaDescription length in 140–160 range', () => {
    const len = String(fm.metaDescription).length;
    expect(len).toBeGreaterThanOrEqual(140);
    expect(len).toBeLessThanOrEqual(160);
  });

  it('body starts with H2 heading', () => {
    expect(body.trim().startsWith('## ')).toBe(true);
  });

  it('contains the 7 locked H2 in order (spec §3.6)', () => {
    const expected = [
      '## Warum spielt mein iPhone-Video nicht überall?',
      '## HEVC vs. H.264 — was ist der Unterschied?',
      '## Anwendungsbeispiele',
      '## Datenschutz — dein Video verlässt nie deinen Browser',
      '## Grenzen dieses Tools',
      '## Häufige Fragen',
      '## Verwandte Video-Tools',
    ];
    let pos = 0;
    for (const h of expected) {
      const found = body.indexOf(h, pos);
      expect(found, `expected "${h}" after position ${pos}`).toBeGreaterThanOrEqual(0);
      pos = found + h.length;
    }
  });

  it('body word count is ≥ 300 (Spec §3.6 minimum)', () => {
    const words = body.replace(/[#*_`]/g, ' ').split(/\s+/).filter(Boolean);
    expect(words.length).toBeGreaterThanOrEqual(300);
  });

  it('datenschutz section mentions browser-only + datenschutz link', () => {
    const section = body.slice(
      body.indexOf('## Datenschutz'),
      body.indexOf('## Grenzen dieses Tools'),
    );
    expect(section).toMatch(/browser/i);
    expect(section).toMatch(/kein.*upload|nicht.*hochgeladen|verlässt/i);
    expect(section).toMatch(/\/de\/datenschutz/);
  });

  it('FAQ includes HDR/Dolby-Vision entry (spec §4.7)', () => {
    expect(raw).toMatch(/HDR.*Dolby.?Vision|Dolby.?Vision.*HDR/i);
    expect(raw).toMatch(/H\.264 unterstützt kein HDR|H\.264-Format kein HDR/i);
  });

  it('FAQ includes the AEO-hook question verbatim (spec §6)', () => {
    expect(raw).toMatch(/Wie wandle ich ein iPhone-Video in MP4 um ohne es hochzuladen\?/);
  });
});
