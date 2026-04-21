import { describe, it, expect } from 'vitest';
import { xmlFormatter } from '../../../src/lib/tools/xml-formatter';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('xmlFormatter config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(xmlFormatter);
    expect(r.ok).toBe(true);
  });

  it('has the expected identity fields', () => {
    expect(xmlFormatter.id).toBe('xml-formatter');
    expect(xmlFormatter.type).toBe('formatter');
    expect(xmlFormatter.categoryId).toBe('dev');
    expect(xmlFormatter.mode).toBe('pretty');
  });

  it('rejects invalid modification', () => {
    const broken = { ...xmlFormatter, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });
});

describe('xmlFormatter format', () => {
  it('formats a simple element', () => {
    const result = xmlFormatter.format('<root><item>Hello</item></root>');
    const lines = result.split('\n');
    expect(lines[0]).toBe('<root>');
    expect(lines[1]).toBe('  <item>');
    expect(lines[2]).toBe('    Hello');
    expect(lines[3]).toBe('  </item>');
    expect(lines[4]).toBe('</root>');
  });

  it('formats nested elements with correct indentation', () => {
    const result = xmlFormatter.format('<a><b><c>text</c></b></a>');
    const lines = result.split('\n');
    expect(lines[0]).toBe('<a>');
    expect(lines[1]).toBe('  <b>');
    expect(lines[2]).toBe('    <c>');
    expect(lines[3]).toBe('      text');
    expect(lines[4]).toBe('    </c>');
    expect(lines[5]).toBe('  </b>');
    expect(lines[6]).toBe('</a>');
  });

  it('handles self-closing tags', () => {
    const result = xmlFormatter.format('<root><item /><br/></root>');
    const lines = result.split('\n');
    expect(lines[0]).toBe('<root>');
    expect(lines[1]).toBe('  <item />');
    expect(lines[2]).toBe('  <br />');
    expect(lines[3]).toBe('</root>');
  });

  it('preserves attributes', () => {
    const result = xmlFormatter.format('<item id="1" class="active">text</item>');
    expect(result).toContain('<item id="1" class="active">');
  });

  it('preserves CDATA content', () => {
    const result = xmlFormatter.format('<root><![CDATA[x < 5 && y > 3]]></root>');
    expect(result).toContain('<![CDATA[x < 5 && y > 3]]>');
    const lines = result.split('\n');
    expect(lines[1]).toBe('  <![CDATA[x < 5 && y > 3]]>');
  });

  it('preserves comments', () => {
    const result = xmlFormatter.format('<root><!-- a comment --><item/></root>');
    expect(result).toContain('<!-- a comment -->');
    const lines = result.split('\n');
    expect(lines[1]).toBe('  <!-- a comment -->');
  });

  it('handles processing instructions', () => {
    const result = xmlFormatter.format('<?xml version="1.0"?><root/>');
    const lines = result.split('\n');
    expect(lines[0]).toBe('<?xml version="1.0"?>');
    expect(lines[1]).toBe('<root />');
  });

  it('normalizes whitespace between tags', () => {
    const input = '<root>   <item>   text   </item>   </root>';
    const result = xmlFormatter.format(input);
    const lines = result.split('\n');
    expect(lines[0]).toBe('<root>');
    expect(lines[1]).toBe('  <item>');
    // Text content is trimmed
    expect(lines[2]).toBe('    text');
    expect(lines[3]).toBe('  </item>');
    expect(lines[4]).toBe('</root>');
  });

  it('throws on empty input', () => {
    expect(() => xmlFormatter.format('')).toThrow('Bitte XML eingeben');
    expect(() => xmlFormatter.format('   ')).toThrow('Bitte XML eingeben');
  });

  it('handles multiple sibling elements', () => {
    const result = xmlFormatter.format('<list><a/><b/><c/></list>');
    const lines = result.split('\n');
    expect(lines.length).toBe(5); // list open + 3 items + list close
    expect(lines[1]).toBe('  <a />');
    expect(lines[2]).toBe('  <b />');
    expect(lines[3]).toBe('  <c />');
  });

  it('handles deeply nested structure', () => {
    const result = xmlFormatter.format('<a><b><c><d/></c></b></a>');
    const lines = result.split('\n');
    expect(lines[0]).toBe('<a>');
    expect(lines[1]).toBe('  <b>');
    expect(lines[2]).toBe('    <c>');
    expect(lines[3]).toBe('      <d />');
    expect(lines[4]).toBe('    </c>');
    expect(lines[5]).toBe('  </b>');
    expect(lines[6]).toBe('</a>');
  });
});
