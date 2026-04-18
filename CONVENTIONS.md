# Code-Konventionen

> **Status:** Stub — wird in Session 4 (Tool-Config-Foundation) und Session 6 (nach Prototype-Review) konkret befüllt.

## Verbindlich ab Session 1

- **Commit-Format:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`)
- **Commit-Trailer (PFLICHT):** `Rulebooks-Read: <Liste>` (Enforced via Pre-Commit-Hook ab Session 10)
- **Verboten:** `any`, `@ts-ignore`, Default-Exports für Tool-Configs
- **Paths:** `~/*` = `src/*` (tsconfig-Alias)

## Wird in Session 4 konkretisiert

- Zod-Schemas für 9 Tool-Typen
- File-Layout pro Tool
- Error-Handling `{ ok, value, error }` Result-Type
- Naming: Slugs kebab-case, Tool-IDs camelCase
- Test-Struktur pro Tool-Typ

## Wird in Session 6 konkretisiert (nach Prototype-Review)

- Svelte-Komponenten-Patterns (Runes-only, Stores verboten)
- CSS-Strategie: Tailwind Utility-First, Custom-CSS nur in `tokens.css`
- Astro-Content-Collection-Pattern
