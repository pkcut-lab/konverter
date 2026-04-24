---
source_file: "docs/superpowers/plans/2026-04-19-tool-cross-links-implementation.md"
type: "decision"
community: "Cluster 61 (4 nodes)"
location: "Architecture section"
tags:
  - graphify/decision
  - graphify/high
  - community/Cluster_61_(4_nodes)
---

# list.ts helper: listToolsForLang + resolveRelatedTools as single-source-of-truth

## Connections
- [[resolveRelatedTools takes LOCALIZED SLUGS (not toolIds), preserves input order, silently ignores forward-refs]] - `rationale_for` [high]
- [[resolveRelatedToolsWithFallback(lang, ownSlug, explicitSlugs, minCount) category fallback]] - `rationale_for` [high]

#graphify/decision #graphify/high #community/Cluster_61_(4_nodes)