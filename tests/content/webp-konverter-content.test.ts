import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import matter from 'gray-matter';
import { toolContentFrontmatterSchema } from '../../src/content/tools.schema';

describe('webp-konverter/de.md frontmatter', () => {
  const filePath = resolve(__dirname, '../../src/content/tools/webp-konverter/de.md');
  const raw = readFileSync(filePath, 'utf-8');
  const parsed = matter(raw);

  it('frontmatter passes the Session-4 Zod schema', () => {
    const r = toolContentFrontmatterSchema.safeParse(parsed.data);
    if (!r.success) {
      throw new Error('schema failed: ' + JSON.stringify(r.error.issues, null, 2));
    }
    expect(r.success).toBe(true);
  });

  it('toolId matches slug-map entry', () => {
    expect(parsed.data.toolId).toBe('png-jpg-to-webp');
    expect(parsed.data.language).toBe('de');
  });

  it('body begins with the first H2 (no H1 in body — H1 comes from layout)', () => {
    const body = parsed.content.trim();
    expect(body.startsWith('## ')).toBe(true);
  });

  it('body includes the 5 locked H2 headings in order', () => {
    const h2s = parsed.content.match(/^## .+$/gm) ?? [];
    expect(h2s).toEqual([
      '## Was ist WebP?',
      '## Warum PNG/JPG in WebP umwandeln?',
      '## Welche Anwendungsbeispiele gibt es?',
      '## Datenschutz — 100% im Browser',
      '## Häufige Fragen',
      '## Welche Bild-Tools sind verwandt?',
    ]);
  });
});
