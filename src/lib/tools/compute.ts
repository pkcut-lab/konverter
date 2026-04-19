import type { ConverterFormula } from './schemas';

export type Direction = 'forward' | 'inverse';

export function computeConversion(
  formula: ConverterFormula,
  value: number,
  direction: Direction,
): number {
  switch (formula.type) {
    case 'linear':
      return direction === 'forward' ? value * formula.factor : value / formula.factor;
    case 'affine':
      return direction === 'forward'
        ? value * formula.factor + formula.offset
        : (value - formula.offset) / formula.factor;
  }
}
