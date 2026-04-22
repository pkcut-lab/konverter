import type { FormatterConfig } from './schemas';

/**
 * SQL Formatter — beautifies raw SQL with keyword uppercasing,
 * clause-level newlines and indentation.
 * Pure client-side, no server contact. No external dependencies.
 */

/** SQL keywords that trigger a new line (major clauses). */
const NEWLINE_KEYWORDS = [
  'SELECT',
  'FROM',
  'WHERE',
  'INNER JOIN',
  'LEFT JOIN',
  'RIGHT JOIN',
  'FULL JOIN',
  'CROSS JOIN',
  'JOIN',
  'ON',
  'ORDER BY',
  'GROUP BY',
  'HAVING',
  'LIMIT',
  'OFFSET',
  'UNION ALL',
  'UNION',
  'INTERSECT',
  'EXCEPT',
  'INSERT INTO',
  'VALUES',
  'UPDATE',
  'SET',
  'DELETE FROM',
  'CREATE TABLE',
  'ALTER TABLE',
  'DROP TABLE',
  'AND',
  'OR',
];

/** All SQL keywords to uppercase (superset of NEWLINE_KEYWORDS). */
const ALL_KEYWORDS = [
  ...NEWLINE_KEYWORDS,
  'SELECT',
  'DISTINCT',
  'AS',
  'IN',
  'NOT',
  'NULL',
  'IS',
  'LIKE',
  'BETWEEN',
  'EXISTS',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END',
  'ASC',
  'DESC',
  'INTO',
  'CREATE',
  'ALTER',
  'DROP',
  'TABLE',
  'INDEX',
  'VIEW',
  'DATABASE',
  'INSERT',
  'DELETE',
  'UPDATE',
  'SET',
  'VALUES',
  'PRIMARY',
  'KEY',
  'FOREIGN',
  'REFERENCES',
  'DEFAULT',
  'CHECK',
  'UNIQUE',
  'CONSTRAINT',
  'CASCADE',
  'IF',
  'BEGIN',
  'COMMIT',
  'ROLLBACK',
  'TRANSACTION',
  'GRANT',
  'REVOKE',
  'COUNT',
  'SUM',
  'AVG',
  'MIN',
  'MAX',
  'GROUP',
  'ORDER',
  'BY',
  'HAVING',
  'LIMIT',
  'OFFSET',
  'ALL',
  'ANY',
  'SOME',
  'TRUE',
  'FALSE',
  'WITH',
];

/**
 * Tokenise SQL input preserving string literals, identifiers, whitespace,
 * parentheses and other symbols.
 */
function tokenize(sql: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < sql.length) {
    const c = sql[i] as string;

    if (c === "'") {
      let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === "'" && sql[j + 1] === "'") {
          j += 2;
        } else if (sql[j] === "'") {
          j++;
          break;
        } else {
          j++;
        }
      }
      tokens.push(sql.slice(i, j));
      i = j;
      continue;
    }

    if (c === '"') {
      let j = i + 1;
      while (j < sql.length && sql[j] !== '"') j++;
      tokens.push(sql.slice(i, j + 1));
      i = j + 1;
      continue;
    }

    if (/\s/.test(c)) {
      let j = i + 1;
      while (j < sql.length && /\s/.test(sql[j] as string)) j++;
      tokens.push(' ');
      i = j;
      continue;
    }

    if (c === '(' || c === ')' || c === ';') {
      tokens.push(c);
      i++;
      continue;
    }

    if (c === ',') {
      tokens.push(',');
      i++;
      continue;
    }

    if (/[a-zA-Z_]/.test(c)) {
      let j = i + 1;
      while (j < sql.length && /[a-zA-Z0-9_.]/.test(sql[j] as string)) j++;
      tokens.push(sql.slice(i, j));
      i = j;
      continue;
    }

    if (/[0-9]/.test(c)) {
      let j = i + 1;
      while (j < sql.length && /[0-9.]/.test(sql[j] as string)) j++;
      tokens.push(sql.slice(i, j));
      i = j;
      continue;
    }

    tokens.push(c);
    i++;
  }
  return tokens;
}

/**
 * Build a set of unique keywords sorted by length descending so that
 * multi-word keywords are matched first.
 */
const uniqueKeywords = [...new Set(ALL_KEYWORDS)];

/**
 * Check if a sequence of tokens starting at `idx` matches a multi-word
 * keyword. Returns the keyword and how many tokens it consumed, or null.
 */
function matchMultiWordKeyword(
  tokens: string[],
  idx: number,
): { keyword: string; consumed: number } | null {
  // Try multi-word newline keywords (sorted longest first)
  const multiWord = NEWLINE_KEYWORDS.filter((k) => k.includes(' ')).sort(
    (a, b) => b.split(' ').length - a.split(' ').length,
  );

  for (const kw of multiWord) {
    const parts = kw.split(' ');
    let ti = idx;
    let matched = true;
    let consumed = 0;
    for (const part of parts) {
      // Skip whitespace tokens
      while (ti < tokens.length && tokens[ti] === ' ') {
        ti++;
        consumed++;
      }
      if (ti >= tokens.length || (tokens[ti] as string).toUpperCase() !== part) {
        matched = false;
        break;
      }
      ti++;
      consumed++;
    }
    if (matched) {
      return { keyword: kw, consumed };
    }
  }
  return null;
}

function formatSql(input: string): string {
  const trimmed = input.trim();
  if (trimmed === '') {
    throw new Error('Bitte SQL eingeben oder eine Datei laden.');
  }

  const tokens = tokenize(trimmed);

  const lines: string[] = [];
  let currentLine = '';
  let indentLevel = 0;
  const indent = () => '  '.repeat(indentLevel);

  function pushLine() {
    if (currentLine.trim() !== '') {
      lines.push(currentLine.replace(/\s+$/, ''));
    }
    currentLine = '';
  }

  /** Set of single-word newline keywords for quick lookup. */
  const singleNewlineKeywords = new Set(
    NEWLINE_KEYWORDS.filter((k) => !k.includes(' ')).map((k) => k.toUpperCase()),
  );

  /** Set of all single keywords for uppercasing. */
  const singleKeywordSet = new Set(uniqueKeywords.map((k) => k.toUpperCase()));

  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i] as string;

    if (token === ' ') {
      i++;
      continue;
    }

    // String literals — pass through unchanged
    if (token.startsWith("'") || token.startsWith('"')) {
      if (currentLine.trim() !== '' && !currentLine.endsWith('(')) {
        currentLine += ' ';
      }
      currentLine += token;
      i++;
      continue;
    }

    // Opening parenthesis
    if (token === '(') {
      currentLine += ' (';
      indentLevel++;
      pushLine();
      currentLine = indent();
      i++;
      continue;
    }

    // Closing parenthesis
    if (token === ')') {
      pushLine();
      indentLevel = Math.max(0, indentLevel - 1);
      currentLine = indent() + ')';
      i++;
      continue;
    }

    // Semicolon
    if (token === ';') {
      currentLine += ';';
      pushLine();
      i++;
      continue;
    }

    // Comma — keep on same line, then newline for next item
    if (token === ',') {
      currentLine += ',';
      pushLine();
      currentLine = indent();
      i++;
      continue;
    }

    // Try multi-word keyword match
    const multiMatch = matchMultiWordKeyword(tokens, i);
    if (multiMatch) {
      pushLine();
      currentLine = indent() + multiMatch.keyword;
      i += multiMatch.consumed;
      continue;
    }

    // Single-word check
    const upper = token.toUpperCase();

    if (singleNewlineKeywords.has(upper)) {
      pushLine();
      currentLine = indent() + upper;
      i++;
      continue;
    }

    // Uppercase known keywords, otherwise keep original case
    const word = singleKeywordSet.has(upper) ? upper : token;

    if (currentLine.trim() === '') {
      currentLine = indent() + word;
    } else {
      currentLine += ' ' + word;
    }
    i++;
  }

  pushLine();

  return lines.join('\n');
}

export const sqlFormatter: FormatterConfig = {
  id: 'sql-formatter',
  type: 'formatter',
  categoryId: 'dev',
  mode: 'pretty',
  format: formatSql,
  placeholder: 'select u.id, u.email, count(o.id) from users u left join orders o on o.user_id=u.id where u.active=1 group by u.id order by 3 desc limit 10;',
};
