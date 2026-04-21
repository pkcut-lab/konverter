import { describe, it, expect } from 'vitest';
import { jsonFormatter } from '../../../src/lib/tools/json-formatter';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('jsonFormatter config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(jsonFormatter);
    expect(r.ok).toBe(true);
  });

  it('has the expected identity fields', () => {
    expect(jsonFormatter.id).toBe('json-formatter');
    expect(jsonFormatter.type).toBe('formatter');
    expect(jsonFormatter.categoryId).toBe('dev');
    expect(jsonFormatter.mode).toBe('pretty');
  });

  it('rejects invalid modification', () => {
    const broken = { ...jsonFormatter, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });
});

describe('jsonFormatter format', () => {
  it('beautifies a compact JSON object', () => {
    const input = '{"name":"Alice","age":30}';
    const result = jsonFormatter.format(input);
    expect(result).toBe('{\n  "name": "Alice",\n  "age": 30\n}');
  });

  it('beautifies a JSON array', () => {
    const input = '[1,2,3]';
    const result = jsonFormatter.format(input);
    expect(result).toBe('[\n  1,\n  2,\n  3\n]');
  });

  it('handles nested objects', () => {
    const input = '{"a":{"b":{"c":1}}}';
    const result = jsonFormatter.format(input);
    expect(result).toContain('"a": {');
    expect(result).toContain('"b": {');
    expect(result).toContain('"c": 1');
  });

  it('handles primitive root values', () => {
    expect(jsonFormatter.format('null')).toBe('null');
    expect(jsonFormatter.format('true')).toBe('true');
    expect(jsonFormatter.format('42')).toBe('42');
    expect(jsonFormatter.format('"hello"')).toBe('"hello"');
  });

  it('handles empty object and array', () => {
    expect(jsonFormatter.format('{}')).toBe('{}');
    expect(jsonFormatter.format('[]')).toBe('[]');
  });

  it('trims surrounding whitespace before parsing', () => {
    const input = '  \n  {"a": 1}  \n  ';
    const result = jsonFormatter.format(input);
    expect(result).toBe('{\n  "a": 1\n}');
  });

  it('throws on empty input', () => {
    expect(() => jsonFormatter.format('')).toThrow('Bitte JSON eingeben');
    expect(() => jsonFormatter.format('   ')).toThrow('Bitte JSON eingeben');
  });

  it('throws on invalid JSON with syntax error message', () => {
    expect(() => jsonFormatter.format('{invalid}')).toThrow('Syntaxfehler');
  });

  it('throws on trailing comma (standard JSON)', () => {
    expect(() => jsonFormatter.format('{"a": 1,}')).toThrow('Syntaxfehler');
  });

  it('throws on comments (standard JSON)', () => {
    expect(() => jsonFormatter.format('// comment\n{"a": 1}')).toThrow('Syntaxfehler');
  });

  it('preserves unicode strings', () => {
    const input = '{"emoji":"😀","deutsch":"Ü"}';
    const result = jsonFormatter.format(input);
    expect(result).toContain('"emoji": "😀"');
    expect(result).toContain('"deutsch": "Ü"');
  });

  it('idempotent on already-formatted input', () => {
    const formatted = '{\n  "a": 1,\n  "b": 2\n}';
    expect(jsonFormatter.format(formatted)).toBe(formatted);
  });
});
