import { describe, it, expect } from 'vitest';
import { cssFormatter } from '../../../src/lib/tools/css-formatter';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('cssFormatter config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(cssFormatter);
    expect(r.ok).toBe(true);
  });

  it('has the expected identity fields', () => {
    expect(cssFormatter.id).toBe('css-formatter');
    expect(cssFormatter.type).toBe('formatter');
    expect(cssFormatter.categoryId).toBe('dev');
    expect(cssFormatter.mode).toBe('pretty');
  });

  it('rejects invalid modification', () => {
    const broken = { ...cssFormatter, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });
});

describe('cssFormatter format', () => {
  it('formats a simple rule', () => {
    const result = cssFormatter.format('body{margin:0;padding:0}');
    expect(result).toContain('body {');
    expect(result).toContain('  margin:');
    expect(result).toContain('  padding:');
    expect(result).toContain('}');
  });

  it('handles nested rules (native CSS nesting)', () => {
    const result = cssFormatter.format('.card{color:red;&:hover{color:blue}}');
    const lines = result.split('\n');
    // Should have two levels of indentation
    expect(lines.some((l) => l.startsWith('  ') && l.includes('color:'))).toBe(true);
    expect(lines.some((l) => l.startsWith('  ') && l.includes('&:hover'))).toBe(true);
    expect(lines.some((l) => l.startsWith('    ') && l.includes('color:'))).toBe(true);
  });

  it('handles @media queries', () => {
    const input = '@media(min-width:768px){.nav{display:flex}}';
    const result = cssFormatter.format(input);
    expect(result).toContain('@media');
    expect(result).toContain('.nav');
    const lines = result.split('\n');
    // @media at top level
    expect(lines[0]).toMatch(/^@media/);
    // .nav indented inside @media
    expect(lines.some((l) => l.startsWith('  ') && l.includes('.nav'))).toBe(true);
    // display:flex indented inside .nav
    expect(lines.some((l) => l.startsWith('    ') && l.includes('display:'))).toBe(true);
  });

  it('handles @keyframes', () => {
    const input = '@keyframes fade{from{opacity:0}to{opacity:1}}';
    const result = cssFormatter.format(input);
    expect(result).toContain('@keyframes fade');
    const lines = result.split('\n');
    expect(lines.some((l) => l.trim().startsWith('from'))).toBe(true);
    expect(lines.some((l) => l.trim().startsWith('to'))).toBe(true);
  });

  it('preserves comments', () => {
    const input = '/* Main styles */ body { margin: 0; }';
    const result = cssFormatter.format(input);
    expect(result).toContain('/* Main styles */');
  });

  it('normalizes whitespace', () => {
    const input = 'body  {   margin:   0;    padding:   0;  }';
    const result = cssFormatter.format(input);
    // No double spaces within declarations
    const lines = result.split('\n');
    for (const line of lines) {
      const content = line.replace(/^ +/, ''); // strip leading indent
      expect(content).not.toMatch(/ {3,}/); // no triple+ spaces
    }
  });

  it('throws on empty input', () => {
    expect(() => cssFormatter.format('')).toThrow('Bitte CSS eingeben');
    expect(() => cssFormatter.format('   ')).toThrow('Bitte CSS eingeben');
  });

  it('preserves string literals unchanged', () => {
    const input = '.icon::before { content: "hello world"; }';
    const result = cssFormatter.format(input);
    expect(result).toContain('"hello world"');
  });

  it('handles @layer', () => {
    const input = '@layer base{body{margin:0}}';
    const result = cssFormatter.format(input);
    expect(result).toContain('@layer base');
    expect(result).toContain('body');
  });

  it('handles @container', () => {
    const input = '@container(min-width:400px){.card{font-size:1.2rem}}';
    const result = cssFormatter.format(input);
    expect(result).toContain('@container');
    expect(result).toContain('.card');
  });

  it('handles multiple rules', () => {
    const input = 'h1{font-size:2rem}h2{font-size:1.5rem}';
    const result = cssFormatter.format(input);
    expect(result).toContain('h1 {');
    expect(result).toContain('h2 {');
    const lines = result.split('\n');
    expect(lines.length).toBeGreaterThanOrEqual(6);
  });
});
