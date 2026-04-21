import type { FormatterConfig } from './schemas';

/**
 * XML Formatter — prettifies raw/minified XML with proper indentation.
 * Pure string manipulation, no DOMParser dependency.
 * Pure client-side, no server contact. No external dependencies.
 */

/** Token types produced by the XML tokeniser. */
type XmlToken =
  | { kind: 'open'; tag: string; attrs: string; selfClosing: boolean }
  | { kind: 'close'; tag: string }
  | { kind: 'comment'; text: string }
  | { kind: 'cdata'; text: string }
  | { kind: 'pi'; text: string }
  | { kind: 'text'; text: string };

/**
 * Tokenise an XML string into structural tokens.
 * Handles: comments, CDATA, processing instructions, open/close/self-closing
 * tags, and text content.
 */
function tokenize(xml: string): XmlToken[] {
  const tokens: XmlToken[] = [];
  let i = 0;

  while (i < xml.length) {
    if (xml[i] === '<') {
      // Comment: <!-- ... -->
      if (xml.startsWith('<!--', i)) {
        const end = xml.indexOf('-->', i + 4);
        if (end === -1) {
          tokens.push({ kind: 'comment', text: xml.slice(i) });
          break;
        }
        tokens.push({ kind: 'comment', text: xml.slice(i, end + 3) });
        i = end + 3;
        continue;
      }

      // CDATA: <![CDATA[ ... ]]>
      if (xml.startsWith('<![CDATA[', i)) {
        const end = xml.indexOf(']]>', i + 9);
        if (end === -1) {
          tokens.push({ kind: 'cdata', text: xml.slice(i) });
          break;
        }
        tokens.push({ kind: 'cdata', text: xml.slice(i, end + 3) });
        i = end + 3;
        continue;
      }

      // Processing instruction: <?...?>
      if (xml.startsWith('<?', i)) {
        const end = xml.indexOf('?>', i + 2);
        if (end === -1) {
          tokens.push({ kind: 'pi', text: xml.slice(i) });
          break;
        }
        tokens.push({ kind: 'pi', text: xml.slice(i, end + 2) });
        i = end + 2;
        continue;
      }

      // Closing tag: </tag>
      if (xml[i + 1] === '/') {
        const end = xml.indexOf('>', i + 2);
        if (end === -1) {
          tokens.push({ kind: 'text', text: xml.slice(i) });
          break;
        }
        const tag = xml.slice(i + 2, end).trim();
        tokens.push({ kind: 'close', tag });
        i = end + 1;
        continue;
      }

      // Open or self-closing tag: <tag ...> or <tag .../>
      const end = xml.indexOf('>', i + 1);
      if (end === -1) {
        tokens.push({ kind: 'text', text: xml.slice(i) });
        break;
      }
      const raw = xml.slice(i + 1, end);
      const selfClosing = raw.endsWith('/');
      const content = selfClosing ? raw.slice(0, -1) : raw;
      const spaceIdx = content.search(/[\s]/);
      const tag = spaceIdx === -1 ? content.trim() : content.slice(0, spaceIdx).trim();
      const attrs = spaceIdx === -1 ? '' : content.slice(spaceIdx).trim();
      tokens.push({ kind: 'open', tag, attrs, selfClosing });
      i = end + 1;
      continue;
    }

    // Text content between tags
    const nextTag = xml.indexOf('<', i);
    if (nextTag === -1) {
      const text = xml.slice(i);
      if (text.trim() !== '') {
        tokens.push({ kind: 'text', text: text.trim() });
      }
      break;
    }
    const text = xml.slice(i, nextTag);
    if (text.trim() !== '') {
      tokens.push({ kind: 'text', text: text.trim() });
    }
    i = nextTag;
  }

  return tokens;
}

function formatXml(input: string): string {
  const trimmed = input.trim();
  if (trimmed === '') {
    throw new Error('Bitte XML eingeben oder eine Datei laden.');
  }

  const tokens = tokenize(trimmed);
  const lines: string[] = [];
  let indentLevel = 0;
  const indent = () => '  '.repeat(indentLevel);

  for (const token of tokens) {
    switch (token.kind) {
      case 'pi':
        lines.push(indent() + token.text);
        break;

      case 'comment':
        lines.push(indent() + token.text);
        break;

      case 'cdata':
        lines.push(indent() + token.text);
        break;

      case 'open':
        if (token.selfClosing) {
          const attrPart = token.attrs ? ' ' + token.attrs : '';
          lines.push(indent() + '<' + token.tag + attrPart + ' />');
        } else {
          const attrPart = token.attrs ? ' ' + token.attrs : '';
          lines.push(indent() + '<' + token.tag + attrPart + '>');
          indentLevel++;
        }
        break;

      case 'close':
        indentLevel = Math.max(0, indentLevel - 1);
        lines.push(indent() + '</' + token.tag + '>');
        break;

      case 'text':
        lines.push(indent() + token.text);
        break;
    }
  }

  return lines.join('\n');
}

export const xmlFormatter: FormatterConfig = {
  id: 'xml-formatter',
  type: 'formatter',
  categoryId: 'dev',
  mode: 'pretty',
  format: formatXml,
};
