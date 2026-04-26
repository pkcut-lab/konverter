import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
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

function extractFrontmatterDate(content: string, key: string): string | null {
  const m = content.match(new RegExp(`^${key}:\\s*'?(\\S+?)'?\\s*$`, 'm'));
  return m ? m[1]! : null;
}

describe('SEO — dateModified frontmatter', () => {
  const allFiles = getAllMdFiles(CONTENT_ROOT);

  it('all tool content files have dateModified in valid ISO format', () => {
    const issues: string[] = [];
    for (const f of allFiles) {
      const content = readFileSync(f, 'utf-8');
      const val = extractFrontmatterDate(content, 'dateModified');
      if (!val) issues.push(`${f}: missing`);
      else if (!ISO_DATE_RE.test(val)) issues.push(`${f}: invalid format "${val}"`);
    }
    expect(issues, `dateModified issues: ${issues.join('; ')}`).toHaveLength(0);
  });

  it('all tool content files have datePublished in valid ISO format', () => {
    const issues: string[] = [];
    for (const f of allFiles) {
      const content = readFileSync(f, 'utf-8');
      const val = extractFrontmatterDate(content, 'datePublished');
      if (!val) issues.push(`${f}: missing`);
      else if (!ISO_DATE_RE.test(val)) issues.push(`${f}: invalid format "${val}"`);
    }
    expect(issues, `datePublished issues: ${issues.join('; ')}`).toHaveLength(0);
  });
});
