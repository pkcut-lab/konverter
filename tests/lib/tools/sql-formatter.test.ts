import { describe, it, expect } from 'vitest';
import { sqlFormatter } from '../../../src/lib/tools/sql-formatter';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('sqlFormatter config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(sqlFormatter);
    expect(r.ok).toBe(true);
  });

  it('has the expected identity fields', () => {
    expect(sqlFormatter.id).toBe('sql-formatter');
    expect(sqlFormatter.type).toBe('formatter');
    expect(sqlFormatter.categoryId).toBe('dev');
    expect(sqlFormatter.mode).toBe('pretty');
  });

  it('rejects invalid modification', () => {
    const broken = { ...sqlFormatter, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });
});

describe('sqlFormatter format', () => {
  it('formats a simple SELECT', () => {
    const result = sqlFormatter.format('select * from users');
    expect(result).toContain('SELECT');
    expect(result).toContain('FROM');
    expect(result).toContain('users');
  });

  it('puts major clauses on new lines', () => {
    const input = 'select id, name from users where active = 1 order by name';
    const result = sqlFormatter.format(input);
    const lines = result.split('\n').map((l) => l.trim());
    // SELECT, FROM, WHERE, ORDER BY should each start a line
    expect(lines.some((l) => l.startsWith('SELECT'))).toBe(true);
    expect(lines.some((l) => l.startsWith('FROM'))).toBe(true);
    expect(lines.some((l) => l.startsWith('WHERE'))).toBe(true);
    expect(lines.some((l) => l.startsWith('ORDER BY'))).toBe(true);
  });

  it('formats JOIN clauses on separate lines', () => {
    const input =
      'select u.name from users u inner join orders o on u.id = o.user_id';
    const result = sqlFormatter.format(input);
    expect(result).toContain('INNER JOIN');
    expect(result).toContain('ON');
    const lines = result.split('\n').map((l) => l.trim());
    expect(lines.some((l) => l.startsWith('INNER JOIN'))).toBe(true);
    expect(lines.some((l) => l.startsWith('ON'))).toBe(true);
  });

  it('uppercases SQL keywords', () => {
    const input = 'select distinct name from users where id in (1, 2, 3)';
    const result = sqlFormatter.format(input);
    expect(result).toContain('SELECT');
    expect(result).toContain('DISTINCT');
    expect(result).toContain('FROM');
    expect(result).toContain('WHERE');
    expect(result).toContain('IN');
  });

  it('preserves string literals unchanged', () => {
    const input = "select * from users where name = 'hello world'";
    const result = sqlFormatter.format(input);
    expect(result).toContain("'hello world'");
  });

  it('preserves string literals with escaped quotes', () => {
    const input = "select * from users where name = 'it''s fine'";
    const result = sqlFormatter.format(input);
    expect(result).toContain("'it''s fine'");
  });

  it('normalizes whitespace', () => {
    const input = 'select   *    from    users    where   id = 1';
    const result = sqlFormatter.format(input);
    // No double spaces in output
    expect(result).not.toMatch(/  {2,}[a-zA-Z]/);
    expect(result).toContain('SELECT *');
  });

  it('throws on empty input', () => {
    expect(() => sqlFormatter.format('')).toThrow('Bitte SQL eingeben');
    expect(() => sqlFormatter.format('   ')).toThrow('Bitte SQL eingeben');
  });

  it('handles GROUP BY and HAVING', () => {
    const input =
      'select department, count(*) from employees group by department having count(*) > 5';
    const result = sqlFormatter.format(input);
    const lines = result.split('\n').map((l) => l.trim());
    expect(lines.some((l) => l.startsWith('GROUP BY'))).toBe(true);
    expect(lines.some((l) => l.startsWith('HAVING'))).toBe(true);
  });

  it('handles UNION', () => {
    const input = 'select id from a union select id from b';
    const result = sqlFormatter.format(input);
    const lines = result.split('\n').map((l) => l.trim());
    expect(lines.some((l) => l.startsWith('UNION'))).toBe(true);
  });

  it('handles INSERT INTO with VALUES', () => {
    const input = "insert into users (name, email) values ('Max', 'max@test.de')";
    const result = sqlFormatter.format(input);
    expect(result).toContain('INSERT INTO');
    expect(result).toContain('VALUES');
  });

  it('handles UPDATE SET WHERE', () => {
    const input = "update users set active = 0 where last_login < '2025-01-01'";
    const result = sqlFormatter.format(input);
    expect(result).toContain('UPDATE');
    expect(result).toContain('SET');
    expect(result).toContain('WHERE');
  });

  it('indents parenthesized sub-expressions', () => {
    const input = 'select * from users where id in (1, 2, 3)';
    const result = sqlFormatter.format(input);
    // Content inside parentheses should be indented
    const lines = result.split('\n');
    const parenContentLines = lines.filter(
      (l) => l.startsWith('  ') && !l.trim().startsWith('SELECT') && !l.trim().startsWith('FROM') && !l.trim().startsWith('WHERE'),
    );
    expect(parenContentLines.length).toBeGreaterThan(0);
  });

  it('preserves non-keyword identifiers in original case', () => {
    const input = 'select userName, emailAddress from UserAccounts';
    const result = sqlFormatter.format(input);
    expect(result).toContain('userName');
    expect(result).toContain('emailAddress');
    expect(result).toContain('UserAccounts');
  });
});
