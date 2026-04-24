---
source_file: "docs/superpowers/plans/2026-04-19-bg-remover-implementation.md"
type: "decision"
community: "Cluster 105 (2 nodes)"
location: "Architecture section"
tags:
  - graphify/decision
  - graphify/high
  - community/Cluster_105_(2_nodes)
---

# FileTool.svelte State Machine: idle → preparing → converting → done | error

## Connections
- [[tool-runtime-registry.ts single registry for {process, prepare, reencode, isPrepared, clearLastResult}]] - `rationale_for` [high]

#graphify/decision #graphify/high #community/Cluster_105_(2_nodes)