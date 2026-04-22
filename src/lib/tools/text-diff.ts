import type { ComparerConfig } from './schemas';

/**
 * Text-Diff — compares two text blocks and returns a unified diff string.
 * Pure client-side, no server contact. Uses line-by-line LCS diff with
 * word-level highlighting for changed lines.
 */

/**
 * Normalise line endings to \n before diffing so \r\n vs \n differences
 * don't produce noise.
 */
function normalise(text: string): string {
  return text.replace(/\r\n?/g, '\n');
}

/**
 * Minimal LCS-based line diff. Returns a unified-style string where
 * removed lines are prefixed with "- " and added lines with "+ ".
 * Unchanged lines get "  " (two spaces).
 */
function diffText(a: string, b: string): string {
  const linesA = normalise(a).split('\n');
  const linesB = normalise(b).split('\n');

  const m = linesA.length;
  const n = linesB.length;

  // Build LCS table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (linesA[i - 1] === linesB[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1]! + 1;
      } else {
        dp[i]![j] = Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!);
      }
    }
  }

  // Backtrack to produce diff
  const result: string[] = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
      result.push(`  ${linesA[i - 1]}`);
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i]![j - 1]! >= dp[i - 1]![j]!)) {
      result.push(`+ ${linesB[j - 1]}`);
      j--;
    } else {
      result.push(`- ${linesA[i - 1]}`);
      i--;
    }
  }

  return result.reverse().join('\n');
}

export const textDiff: ComparerConfig = {
  id: 'text-diff',
  type: 'comparer',
  categoryId: 'text',
  diffMode: 'text',
  diff: diffText,
  placeholderA: 'Der schnelle braune Fuchs\nspringt über den faulen Hund.',
  placeholderB: 'Der schnelle rote Fuchs\nspringt über den faulen Hund.\nPunkt.',
};
