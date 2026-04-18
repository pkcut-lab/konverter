import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

describe('Phase 0 Bootstrap — Smoke', () => {
  it('dist/ exists after build', () => {
    expect(existsSync(join(process.cwd(), 'dist'))).toBe(true);
  });

  it('dist/de/index.html was generated', () => {
    expect(existsSync(join(process.cwd(), 'dist', 'de', 'index.html'))).toBe(true);
  });

  it('all 6 rulebook files exist at workspace root', () => {
    const rulebooks = ['PROJECT.md', 'CONVENTIONS.md', 'STYLE.md', 'CONTENT.md', 'TRANSLATION.md', 'PROGRESS.md'];
    for (const rb of rulebooks) {
      expect(existsSync(join(process.cwd(), rb))).toBe(true);
    }
  });

  it('CLAUDE.md exists at workspace root', () => {
    expect(existsSync(join(process.cwd(), 'CLAUDE.md'))).toBe(true);
  });
});
