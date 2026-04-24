---
type: community
cohesion: 0.50
members: 4
---

# Cluster 61 (4 nodes)

**Cohesion:** 0.50 - moderately connected
**Members:** 4 nodes

## Members
- [[Category taxonomy 14-value flat enum in categories.ts]] - decision - docs/superpowers/plans/2026-04-20-category-fallback.md
- [[list.ts helper listToolsForLang + resolveRelatedTools as single-source-of-truth]] - decision - docs/superpowers/plans/2026-04-19-tool-cross-links-implementation.md
- [[resolveRelatedTools takes LOCALIZED SLUGS (not toolIds), preserves input order, silently ignores forward-refs]] - decision - docs/superpowers/specs/2026-04-19-tool-cross-links-design.md
- [[resolveRelatedToolsWithFallback(lang, ownSlug, explicitSlugs, minCount) category fallback]] - decision - docs/superpowers/plans/2026-04-20-category-fallback.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Cluster_61_(4_nodes)
SORT file.name ASC
```
