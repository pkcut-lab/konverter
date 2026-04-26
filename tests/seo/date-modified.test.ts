import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const CONTENT_ROOT = join(process.cwd(), 'src/content/tools');
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function getAllMdFiles(dir: string): string[] {
  const files: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) files.push(...getAllMdFiles(p));
    else if (e.name.endsWith('.md')) files.push(p);
  }
  return files;
}

describe('SEO — dateModified frontmatter', () => {
  const allFiles = getAllMdFiles(CONTENT_ROOT);

  it('all tool content files have dateModified in frontmatter', () => {
    const missing: string[] = [];
    for (const f of allFiles) {
      const content = readFileSync(f, 'utf-8');
      if (!content.includes('dateModified:')) missing.push(f);
    }
    expect(missing, `Files missing dateModified: ${missing.join(', ')}`).toHaveLength(0);
  });

  it('all tool content files have datePublished in frontmatter', () => {
    const missing: string[] = [];
    for (const f of allFiles) {
      const content = readFileSync(f, 'utf-8');
      if (!content.includes('datePublished:')) missing.push(f);
    }
    expect(missing, `Files missing datePublished: ${missing.join(', ')}`).toHaveLength(0);
  });
});
