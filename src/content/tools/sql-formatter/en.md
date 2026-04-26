---
toolId: sql-formatter
language: en
title: "SQL Formatter & Beautifier — Free Online"
headingHtml: "Format <em>SQL Queries</em> Instantly"
metaDescription: "Paste messy or minified SQL and get cleanly indented, readable output. Supports MySQL, PostgreSQL, SQL Server, and SQLite dialects. Free, no login."
tagline: "Paste any SQL query — minified, messy, or single-line — and get properly indented, keyword-capitalized output with consistent clause alignment in seconds."
intro: "Unformatted SQL is a common frustration: code dumped from an ORM, a minified query from a log file, or a co-worker's 800-character single-line SELECT. This formatter parses your SQL and outputs it with proper indentation, capitalized keywords, and aligned clauses — making it readable in seconds without any manual cleanup."
howToUse:
  - "Paste your SQL query into the input field — any dialect, any length."
  - "Select your target SQL dialect: MySQL, PostgreSQL, SQL Server, or SQLite."
  - "Click Format (or let it format automatically as you type)."
  - "Copy the formatted output or download it as a .sql file."
  - "To minify instead, use the Minify toggle to produce a single-line version for production use."
faq:
  - q: "Which SQL dialects are supported?"
    a: "MySQL, PostgreSQL, SQL Server (T-SQL), and SQLite. The formatter respects dialect-specific keywords and quoting conventions: backticks for MySQL, double quotes for PostgreSQL identifiers, square brackets for SQL Server."
  - q: "Does formatting change the behavior of my SQL query?"
    a: "No. The formatter only adds whitespace, newlines, and capitalizes reserved keywords — it does not alter query logic. The formatted SQL executes identically to the original."
  - q: "Can the formatter handle stored procedures and multi-statement SQL?"
    a: "Yes. The formatter handles BEGIN/END blocks, stored procedures, CTEs (WITH clauses), subqueries, and multi-statement scripts separated by semicolons."
  - q: "What is the difference between SQL beautification and SQL formatting?"
    a: "They are the same thing — both refer to adding whitespace, indentation, and keyword capitalization to make SQL human-readable. 'Minification' is the reverse: removing all unnecessary whitespace to reduce character count."
  - q: "Why is my formatted SQL different from what my IDE produces?"
    a: "Different formatters make different style decisions about indentation depth, comma placement (trailing vs. leading), and JOIN alignment. This tool uses a consistent, widely-accepted style. You can adjust settings to match your team's convention."
relatedTools:
  - json-formatter
  - xml-formatter
  - css-formatter
category: dev
contentVersion: 1
---

## What This Tool Does

The SQL Formatter takes raw, unformatted, or minified SQL queries and outputs clean, consistently styled code. It handles all common SQL constructs — SELECT with multiple JOINs, CTEs, subqueries, INSERT/UPDATE/DELETE, DDL statements, and stored procedures — and respects dialect differences between MySQL, PostgreSQL, SQL Server, and SQLite.

## How It Works

The formatter tokenizes your SQL input into a stream of keywords, identifiers, operators, and literals, then applies indentation and capitalization rules based on the selected dialect. No query is executed — the tool only parses and reformats the text structure.

**Default formatting style:**

| Rule | Behavior |
|---|---|
| Keywords | Uppercase (SELECT, FROM, WHERE, JOIN) |
| Identifiers | Preserved as-is |
| Indentation | 2 spaces per level |
| Clause alignment | Each major clause on its own line |
| Commas | Trailing (end of line) |
| Subqueries | Indented one additional level |

**Before:**
```sql
select u.id,u.name,o.total from users u left join orders o on u.id=o.user_id where o.total>100 order by o.total desc
```

**After (PostgreSQL):**
```sql
SELECT
  u.id,
  u.name,
  o.total
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.total > 100
ORDER BY o.total DESC
```

## Common Use Cases (US-Centric)

**Reading ORM-generated queries** — ORMs like Django ORM, SQLAlchemy, ActiveRecord, and Hibernate generate SQL that is functional but unreadable. Enable SQL logging, paste the output into the formatter, and understand exactly what query your application is running — useful for performance debugging and N+1 query detection.

**Database log analysis** — Slow query logs from MySQL, PostgreSQL, and AWS RDS contain minified queries. Format them to identify missing indexes, full table scans, or cartesian joins before presenting findings to a team.

**Code review of database migrations** — Rails migrations, Flyway scripts, and Liquibase changesets often include hand-written DDL. Format before review to catch structural issues (missing indexes, wrong column types) that are hard to spot in compressed form.

**Interview preparation and SQL exercises** — Developers practicing on LeetCode, HackerRank, or StrataScratch often write queries in a hurry. Format before submission to present clean, professional code.

**Documentation and runbooks** — Operational runbooks and internal wikis include SQL snippets for maintenance tasks. Formatted SQL is easier to copy, modify, and execute safely during an incident.

**Sharing queries in Slack or GitHub** — Formatted SQL in a code block is immediately readable without asking colleagues to mentally parse a compressed string. Paste formatted output directly into PR comments or Slack messages.

## FAQ Expansion

**Should I use leading or trailing commas in SQL?**
Both are valid. Trailing commas (`col1,\n col2,`) are the SQL standard default and what most teams use. Leading commas (`,col1\n,col2`) make it easier to comment out individual columns without touching the previous line. This tool defaults to trailing commas but supports both styles in settings.

**Can the formatter detect and report SQL syntax errors?**
Basic syntax errors (unmatched parentheses, unclosed strings) are flagged during tokenization. The formatter does not execute queries, so semantic errors (referencing columns that don't exist) are not caught. For full query validation, run against a live database or use a linter like sqlfluff.

**How do I format SQL in VS Code without a plugin?**
VS Code has no built-in SQL formatter, but extensions like "SQL Formatter" (based on the same sql-formatter npm library) provide integrated formatting. For one-off formatting without installing extensions, this browser tool is the fastest path.
