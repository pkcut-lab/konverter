---
source_file: "docs/superpowers/plans/2026-04-20-hevc-zu-h264-implementation.md"
type: "tool_spec"
community: "Cluster 44 (5 nodes)"
location: "FileToolConfig section"
tags:
  - graphify/tool_spec
  - graphify/high
  - community/Cluster_44_(5_nodes)
---

# Tool: hevc-to-h264 / hevc-zu-h264 (categoryId: video, maxSizeMb: 500, Mediabunny)

## Connections
- [[4K passthrough default; 1080p downscale as opt-in toggle only if source 1920×1080]] - `rationale_for` [high]
- [[HEVC→H264 quality presets Original-Qualität  Balanced (0.6× bitrate)  Klein (0.35× bitrate)]] - `rationale_for` [high]
- [[Mediabunny (MPL-2.0) chosen over ffmpeg.wasm for video encoding due to AdSense COOPCOEP incompatibility]] - `rationale_for` [high]

#graphify/tool_spec #graphify/high #community/Cluster_44_(5_nodes)