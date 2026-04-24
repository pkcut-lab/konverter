---
source_file: "docs/superpowers/plans/2026-04-19-bg-remover-implementation.md"
type: "decision"
community: "Cluster 105 (2 nodes)"
location: "Locked design decisions §1"
tags:
  - graphify/decision
  - graphify/high
  - community/Cluster_105_(2_nodes)
---

# tool-runtime-registry.ts: single registry for {process, prepare?, reencode?, isPrepared?, clearLastResult?}

## Connections
- [[FileTool.svelte State Machine idle → preparing → converting → done  error]] - `rationale_for` [high]

#graphify/decision #graphify/high #community/Cluster_105_(2_nodes)