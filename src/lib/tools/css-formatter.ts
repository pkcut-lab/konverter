import type { FormatterConfig } from './schemas';

/**
 * CSS Formatter — beautifies raw/minified CSS with proper indentation.
 * Handles nested CSS (native nesting), @media, @keyframes, @layer, @container.
 * Preserves comments and string literals.
 * Pure client-side, no server contact. No external dependencies.
 */

/**
 * Tokenise CSS input into structural tokens.
 * Preserves string literals, comments, and structural characters.
 */
type CssToken =
  | { kind: 'string'; text: string }
  | { kind: 'comment'; text: string }
  | { kind: 'open'; text: '{' }
  | { kind: 'close'; text: '}' }
  | { kind: 'semicolon'; text: ';' }
  | { kind: 'text'; text: string };

function tokenize(css: string): CssToken[] {
  const tokens: CssToken[] = [];
  let i = 0;

  while (i < css.length) {
    // Block comment /* ... */
    if (css[i] === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2);
      const j = end === -1 ? css.length : end + 2;
      tokens.push({ kind: 'comment', text: css.slice(i, j) });
      i = j;
      continue;
    }

    // Single-line comment // ... (some CSS preprocessors use this)
    if (css[i] === '/' && css[i + 1] === '/') {
      let j = i + 2;
      while (j < css.length && css[j] !== '\n') j++;
      tokens.push({ kind: 'comment', text: css.slice(i, j) });
      i = j;
      continue;
    }

    // String literal (single or double quote)
    if (css[i] === '"' || css[i] === "'") {
      const quote = css[i];
      let j = i + 1;
      while (j < css.length) {
        if (css[j] === '\\') {
          j += 2; // skip escaped char
        } else if (css[j] === quote) {
          j++;
          break;
        } else {
          j++;
        }
      }
      tokens.push({ kind: 'string', text: css.slice(i, j) });
      i = j;
      continue;
    }

    // Structural characters
    if (css[i] === '{') {
      tokens.push({ kind: 'open', text: '{' });
      i++;
      continue;
    }

    if (css[i] === '}') {
      tokens.push({ kind: 'close', text: '}' });
      i++;
      continue;
    }

    if (css[i] === ';') {
      tokens.push({ kind: 'semicolon', text: ';' });
      i++;
      continue;
    }

    // Whitespace — collapse to single space
    if (/\s/.test(css[i])) {
      let j = i + 1;
      while (j < css.length && /\s/.test(css[j])) j++;
      tokens.push({ kind: 'text', text: ' ' });
      i = j;
      continue;
    }

    // Everything else — accumulate text
    let j = i + 1;
    while (
      j < css.length &&
      !/[\s{};"'/]/.test(css[j])
    ) {
      j++;
    }
    // Handle single quote separately to not break the while check
    if (j === i + 1 && css[i] === "'") {
      // Should not reach here (caught above), safety fallback
      tokens.push({ kind: 'text', text: css[i] });
      i++;
      continue;
    }
    tokens.push({ kind: 'text', text: css.slice(i, j) });
    i = j;
  }

  return tokens;
}

function formatCss(input: string): string {
  const trimmed = input.trim();
  if (trimmed === '') {
    throw new Error('Bitte CSS eingeben oder eine Datei laden.');
  }

  const tokens = tokenize(trimmed);

  const lines: string[] = [];
  let currentLine = '';
  let indentLevel = 0;
  const indent = () => '  '.repeat(indentLevel);

  function pushLine() {
    const trimmedLine = currentLine.replace(/\s+$/, '');
    if (trimmedLine !== '') {
      lines.push(trimmedLine);
    }
    currentLine = '';
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    switch (token.kind) {
      case 'comment': {
        // If current line has content, push it first
        if (currentLine.trim() !== '') {
          // Add comment on same line if it follows a property
          currentLine += ' ' + token.text;
        } else {
          currentLine = indent() + token.text;
        }
        // Check if next non-whitespace token is not a semicolon or brace
        // In that case, push the comment line
        const next = tokens[i + 1];
        if (!next || next.kind !== 'text' || next.text.trim() !== '') {
          pushLine();
        }
        break;
      }

      case 'string': {
        if (currentLine.trim() === '') {
          currentLine = indent() + token.text;
        } else {
          currentLine += token.text;
        }
        break;
      }

      case 'open': {
        // Trim trailing whitespace from current line, add space + {
        currentLine = currentLine.replace(/\s+$/, '');
        if (currentLine.trim() === '') {
          currentLine = indent() + '{';
        } else {
          currentLine += ' {';
        }
        pushLine();
        indentLevel++;
        break;
      }

      case 'close': {
        pushLine();
        indentLevel = Math.max(0, indentLevel - 1);
        currentLine = indent() + '}';
        pushLine();
        break;
      }

      case 'semicolon': {
        currentLine += ';';
        pushLine();
        break;
      }

      case 'text': {
        const txt = token.text;
        // Skip pure whitespace tokens between structural elements
        if (txt.trim() === '') {
          // Add space only if current line has content and doesn't end with space
          if (currentLine.trim() !== '' && !currentLine.endsWith(' ') && !currentLine.endsWith('(')) {
            currentLine += ' ';
          }
          break;
        }

        if (currentLine.trim() === '') {
          currentLine = indent() + txt;
        } else {
          currentLine += txt;
        }
        break;
      }
    }
  }

  // Flush remaining content
  pushLine();

  return lines.join('\n');
}

export const cssFormatter: FormatterConfig = {
  id: 'css-formatter',
  type: 'formatter',
  categoryId: 'dev',
  mode: 'pretty',
  format: formatCss,
  placeholder: '.card{display:flex;gap:1rem;padding:24px 16px;border:1px solid #e5e5e5;}',
};
