import { describe, it, expect } from 'vitest';
import {
  converterSchema,
  calculatorSchema,
  generatorSchema,
  formatterSchema,
  validatorSchema,
  analyzerSchema,
  comparerSchema,
  fileToolSchema,
  interactiveSchema,
  toolSchema,
  parseToolConfig,
} from '../../../src/lib/tools/schemas';

const baseValid = {
  id: 'meter-to-feet',
  categoryId: 'laengen',
};

describe('converterSchema', () => {
  it('accepts a minimal valid converter with linear formula', () => {
    const parsed = converterSchema.safeParse({
      ...baseValid,
      type: 'converter',
      units: { from: { id: 'm', label: 'Meter' }, to: { id: 'ft', label: 'Fuß' } },
      formula: { type: 'linear', factor: 3.28084 },
      decimals: 4,
      examples: [1, 10, 100],
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts an affine formula for temperature-style conversions', () => {
    const parsed = converterSchema.safeParse({
      ...baseValid,
      id: 'celsius-to-fahrenheit',
      type: 'converter',
      units: { from: { id: 'c', label: 'Celsius' }, to: { id: 'f', label: 'Fahrenheit' } },
      formula: { type: 'affine', factor: 1.8, offset: 32 },
      decimals: 2,
      examples: [0, 100],
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects a converter with wrong type tag', () => {
    const parsed = converterSchema.safeParse({ ...baseValid, type: 'calculator' });
    expect(parsed.success).toBe(false);
  });

  it('rejects a converter missing units', () => {
    const parsed = converterSchema.safeParse({
      ...baseValid,
      type: 'converter',
      formula: { type: 'linear', factor: 2 },
      decimals: 2,
      examples: [],
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects a converter with unknown formula type', () => {
    const parsed = converterSchema.safeParse({
      ...baseValid,
      type: 'converter',
      units: { from: { id: 'a', label: 'A' }, to: { id: 'b', label: 'B' } },
      formula: { type: 'polynomial', factor: 2 },
      decimals: 2,
      examples: [],
    });
    expect(parsed.success).toBe(false);
  });
});

describe('calculatorSchema', () => {
  it('accepts a minimal valid calculator', () => {
    const parsed = calculatorSchema.safeParse({
      ...baseValid,
      id: 'bmi',
      type: 'calculator',
      inputs: [{ id: 'weight', label: 'Gewicht' }, { id: 'height', label: 'Größe' }],
      compute: () => ({}),
      outputs: [{ id: 'bmi', label: 'BMI' }],
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects calculator with empty inputs', () => {
    const parsed = calculatorSchema.safeParse({
      ...baseValid,
      id: 'bmi',
      type: 'calculator',
      inputs: [],
      compute: () => ({}),
      outputs: [{ id: 'x', label: 'X' }],
    });
    expect(parsed.success).toBe(false);
  });
});

describe('generatorSchema', () => {
  it('accepts a minimal valid generator', () => {
    const parsed = generatorSchema.safeParse({
      ...baseValid,
      id: 'password',
      type: 'generator',
      generate: () => '',
    });
    expect(parsed.success).toBe(true);
  });
});

describe('formatterSchema', () => {
  it('accepts a minimal valid formatter', () => {
    const parsed = formatterSchema.safeParse({
      ...baseValid,
      id: 'json-pretty',
      type: 'formatter',
      mode: 'pretty',
      format: () => '',
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects formatter with invalid mode', () => {
    const parsed = formatterSchema.safeParse({
      ...baseValid,
      id: 'json-pretty',
      type: 'formatter',
      mode: 'banana',
      format: () => '',
    });
    expect(parsed.success).toBe(false);
  });
});

describe('validatorSchema', () => {
  it('accepts a minimal valid validator', () => {
    const parsed = validatorSchema.safeParse({
      ...baseValid,
      id: 'email',
      type: 'validator',
      rule: 'email',
      validate: () => true,
    });
    expect(parsed.success).toBe(true);
  });
});

describe('analyzerSchema', () => {
  it('accepts a minimal valid analyzer', () => {
    const parsed = analyzerSchema.safeParse({
      ...baseValid,
      id: 'word-count',
      type: 'analyzer',
      metrics: [{ id: 'words', label: 'Wörter' }],
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects analyzer with empty metrics', () => {
    const parsed = analyzerSchema.safeParse({
      ...baseValid,
      id: 'word-count',
      type: 'analyzer',
      metrics: [],
    });
    expect(parsed.success).toBe(false);
  });
});

describe('comparerSchema', () => {
  it('accepts a minimal valid comparer', () => {
    const parsed = comparerSchema.safeParse({
      ...baseValid,
      id: 'text-diff',
      type: 'comparer',
      diffMode: 'text',
      diff: () => '',
    });
    expect(parsed.success).toBe(true);
  });
});

describe('fileToolSchema', () => {
  it('accepts a minimal valid file-tool', () => {
    const parsed = fileToolSchema.safeParse({
      ...baseValid,
      id: 'webp-konverter',
      type: 'file-tool',
      accept: ['image/png', 'image/jpeg'],
      maxSizeMb: 10,
      process: () => new Uint8Array(),
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects file-tool with non-positive maxSizeMb', () => {
    const parsed = fileToolSchema.safeParse({
      ...baseValid,
      id: 'webp-konverter',
      type: 'file-tool',
      accept: ['image/png'],
      maxSizeMb: 0,
      process: () => new Uint8Array(),
    });
    expect(parsed.success).toBe(false);
  });
});

describe('interactiveSchema', () => {
  it('accepts a minimal valid interactive', () => {
    const parsed = interactiveSchema.safeParse({
      ...baseValid,
      id: 'svg-path-editor',
      type: 'interactive',
      canvasKind: 'svg',
      exportFormats: ['svg'],
    });
    expect(parsed.success).toBe(true);
  });
});

describe('toolSchema (discriminated union)', () => {
  it('picks the correct branch by type tag', () => {
    const r = toolSchema.safeParse({
      ...baseValid,
      type: 'converter',
      units: { from: { id: 'm', label: 'Meter' }, to: { id: 'ft', label: 'Fuß' } },
      formula: { type: 'linear', factor: 3.28084 },
      decimals: 4,
      examples: [1],
    });
    expect(r.success).toBe(true);
  });

  it('rejects an unknown type tag', () => {
    const r = toolSchema.safeParse({ ...baseValid, type: 'banana' });
    expect(r.success).toBe(false);
  });
});

describe('parseToolConfig', () => {
  it('returns ok for valid config', () => {
    const r = parseToolConfig({
      ...baseValid,
      type: 'converter',
      units: { from: { id: 'm', label: 'Meter' }, to: { id: 'ft', label: 'Fuß' } },
      formula: { type: 'linear', factor: 3.28084 },
      decimals: 4,
      examples: [1],
    });
    expect(r.ok).toBe(true);
  });

  it('returns err with readable message for invalid config', () => {
    const r = parseToolConfig({ id: 'x', type: 'banana' });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error).toContain('received type: "banana"');
    }
  });
});
