import { describe, it, expect } from 'vitest';
import { passwortGenerator } from '../../../src/lib/tools/passwort-generator';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('passwortGenerator config', () => {
  it('parses as valid GeneratorConfig', () => {
    const r = parseToolConfig(passwortGenerator);
    expect(r.ok).toBe(true);
  });

  it('has the expected identity fields', () => {
    expect(passwortGenerator.id).toBe('password-generator');
    expect(passwortGenerator.type).toBe('generator');
    expect(passwortGenerator.categoryId).toBe('dev');
    expect(passwortGenerator.defaultCount).toBe(1);
  });

  it('rejects invalid modification', () => {
    const broken = { ...passwortGenerator, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });

  it('generates a password of default length 16', () => {
    const pw = passwortGenerator.generate();
    expect(pw.length).toBe(16);
  });

  it('generates a password of custom length', () => {
    const pw = passwortGenerator.generate({ length: 32 });
    expect(pw.length).toBe(32);
  });

  it('generates only lowercase when other sets disabled', () => {
    const pw = passwortGenerator.generate({
      length: 100,
      upper: false,
      digits: false,
      special: false,
    });
    expect(pw).toMatch(/^[a-z]+$/);
  });

  it('generates only digits when other sets disabled', () => {
    const pw = passwortGenerator.generate({
      length: 100,
      lower: false,
      upper: false,
      special: false,
    });
    expect(pw).toMatch(/^[0-9]+$/);
  });

  it('falls back to alphanumeric when all sets disabled', () => {
    const pw = passwortGenerator.generate({
      length: 50,
      lower: false,
      upper: false,
      digits: false,
      special: false,
    });
    expect(pw.length).toBe(50);
    expect(pw).toMatch(/^[a-zA-Z0-9]+$/);
  });

  it('generates unique passwords on consecutive calls', () => {
    const pw1 = passwortGenerator.generate();
    const pw2 = passwortGenerator.generate();
    expect(pw1).not.toBe(pw2);
  });
});
