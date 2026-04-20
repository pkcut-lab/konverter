import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import matter from 'gray-matter';
import { toolContentFrontmatterSchema } from '../../src/content/tools.schema';

describe('kilogramm-zu-pfund/de.md frontmatter', () => {
  const filePath = resolve(__dirname, '../../src/content/tools/kilogramm-zu-pfund/de.md');
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
    expect(parsed.data.toolId).toBe('kg-to-lb');
    expect(parsed.data.language).toBe('de');
  });

  it('body begins with the first H2 (no H1 in body — H1 comes from layout)', () => {
    const body = parsed.content.trim();
    expect(body.startsWith('## ')).toBe(true);
  });

  it('body includes the 5 locked H2 headings in order', () => {
    const h2s = parsed.content.match(/^## .+$/gm) ?? [];
    expect(h2s).toEqual([
      '## Was macht der Konverter?',
      '## Umrechnungsformel',
      '## Anwendungsbeispiele',
      '## Häufige Einsatzgebiete',
      '## Häufige Fragen',
      '## Verwandte Gewichts-Tools',
    ]);
  });
});
