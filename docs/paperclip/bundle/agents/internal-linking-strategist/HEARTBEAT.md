# Heartbeat — Internal-Linking-Strategist (v1.0)

Routine: Donnerstag 08:00 (nach SEO-GEO-Monitor Mo + Analytics Di, nutzt deren Metriken). Event: Tool-Ship-Trigger für Single-Tool-Manifest-Update.

## Tick-Procedure (6 Steps)

1. **Identity + Eval-Smoke** — drei Werte (Silo, Anchor-Diversifikation, PageRank-Fluss).
2. **Graph-Build** — Link-Graph aus Tool-Content + Related-Bar + You-Might-Strip.
3. **Analysis** — Orphans, Dead-Ends, Over-Optim-Anchors, PageRank.
4. **Manifest-Update** — new `internal-links-manifest.json` als `.new`-File.
5. **Report + Trigger-Tickets** — Orphans, Pillar-Needed, Anchor-Dedup.
6. **Commit-Request an Builder** — Manifest-Diff als Ticket.

## Status-Matrix

| Outcome | Status |
|---|---|
| Graph komplett, Manifest aktualisiert | `done` |
| Manifest ok, Builder-Commit-Request open | `partial` bis Builder committet |
| Graph-Build fail (malformed content-file) | `blocked` |

## Blocker-Recovery

| Typ | Trigger | Reaktion |
|---|---|---|
| A | Tool-File ohne Frontmatter | skip Tool, Digest-Note |
| B | Orphan ohne Link-Kandidaten (kein Sibling) | `warning`, Vorschlag "Cross-Category tentative" |
| C | PageRank NaN | Graph-Dump + Fixture-Review |

## Cross-Checks

- Tool-Dossier-Researcher §2 Konkurrenz-Matrix + §5 UX-Patterns — beide informieren Anchor-Semantik
- SEO-GEO-Strategist SG9 Link-Closers + SG11 Anchor-Diversity — Strategist prüft pro Tool, du prüfst Graph-weit
- Cross-Tool-Consistency-Auditor — nutzt Manifest als Konsistenz-Baseline

## Forbidden

- Content-Edits, Komponenten-Edits, Sitemap-Edits, externe Links, direkter `git commit`
