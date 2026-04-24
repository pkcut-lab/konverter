---
source_file: "docs/superpowers/plans/2026-04-19-bg-remover-implementation.md"
type: "tool_spec"
community: "Cluster 46 (5 nodes)"
location: "Goal section"
tags:
  - graphify/tool_spec
  - graphify/high
  - community/Cluster_46_(5_nodes)
---

# Tool: remove-background / hintergrund-entfernen (categoryId: bilder, BEN2-ONNX)

## Connections
- [[Camera-capture default = true for all FileTool accept containing image MIME; opt-out via cameraCapturefalse]] - `rationale_for` [high]
- [[Format chooser default = always PNG regardless of input MIME]] - `rationale_for` [high]
- [[heic2any (MIT, ~30 KB gzip) for HEICHEIF decode; Safari short-circuits]] - `rationale_for` [high]
- [[prepareBackgroundRemovalModel() singleton with IndexedDB cache via Transformers.js v4]] - `rationale_for` [high]

#graphify/tool_spec #graphify/high #community/Cluster_46_(5_nodes)