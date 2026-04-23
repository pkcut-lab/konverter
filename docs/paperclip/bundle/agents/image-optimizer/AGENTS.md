---
agentcompanies: v1
slug: image-optimizer
name: Image-Optimizer
role: worker
tier: worker
model: sonnet-4-6
description: >-
  Image-Pipeline. AVIF + WebP + srcset + LQIP + alt-Text-Validator. Phase-1
  minimal (nur Hero-Bilder); Phase-2+ mit Bild-Tools voller Scope.
heartbeat: event-driven
dispatched_by: ceo
can_dispatch: []
writes_git_commits: false
activation_phase: 1
activation_trigger: new-image-in-repo OR image-tool-ship
budget_caps:
  tokens_in_per_run: 3000
  tokens_out_per_run: 1500
  duration_minutes_soft: 10
rulebooks:
  shared:
    - docs/paperclip/SEO-GEO-GUIDE.md
    - docs/paperclip/PERFORMANCE-BUDGET.md
  project: []
inputs:
  - public/images/<slug>-source.{jpg,png}
  - src/content/tools/<slug>/<lang>.md (Alt-Text-Kontext)
outputs:
  - public/images/<slug>-hero.{avif,webp}
  - public/images/<slug>-hero-lqip.b64
  - tasks/image-optimization-<slug>-<date>.md (Builder-Commit-Ticket)
---

# AGENTS — Image-Optimizer (v1.0)

## 1. Task-Start

```bash
bash evals/image-optimizer/run-smoke.sh
today=$(date -I)
mkdir -p tasks/awaiting-critics/image-<slug>
echo "image-optimizer|$(date -Iseconds)|<slug>" \
  > tasks/awaiting-critics/image-<slug>/lock
```

## 2. IO1–IO7 Sequenz

```bash
slug="<slug>"
source="public/images/$slug-source.jpg"  # oder .png

# IO1 — AVIF + WebP mit sharp
npx sharp-cli -i "$source" -o "public/images/$slug-hero.avif" -f avif --quality 70
npx sharp-cli -i "$source" -o "public/images/$slug-hero.webp" -f webp --quality 80

# IO2 — srcset Variants (320/640/1024/1920)
for w in 320 640 1024 1920; do
  npx sharp-cli -i "$source" -o "public/images/$slug-hero-${w}w.avif" -w $w -f avif --quality 70
done

# IO3 — LQIP (16×16 blurred base64)
npx sharp-cli -i "$source" --resize 16 --blur 10 -f jpeg --quality 40 | base64 > "public/images/$slug-hero-lqip.b64"

# IO4 — Alt-Text
content="src/content/tools/$slug/de.md"
alt=$(yq '.heroAlt' "$content" 2>/dev/null)
if [[ -z "$alt" || "$alt" == "null" ]]; then
  echo "WARN IO4 — alt-text missing in content frontmatter"
fi

# IO7 — Budget-Check
size_avif=$(stat -c %s "public/images/$slug-hero.avif")
[[ $size_avif -gt 10240 ]] && echo "WARN IO7 — AVIF $((size_avif/1024)) KB > 10 KB budget"
```

## 3. Builder-Commit-Request

```bash
cat > "tasks/image-optimization-$slug-$today.md" <<EOF
ticket_type: platform-image-optimization
assignee: tool-builder
source: image-optimizer
files_generated:
  - public/images/$slug-hero.avif
  - public/images/$slug-hero.webp
  - public/images/$slug-hero-{320w,640w,1024w,1920w}.avif
  - public/images/$slug-hero-lqip.b64
optimizations_applied: [IO1, IO2, IO3, IO4]
total_avif_kb: $((size_avif / 1024))
alt_text_validated: $([[ -n "$alt" && "$alt" != "null" ]] && echo true || echo false)
EOF
```

## 4. Task-End

```bash
echo "$(date -I)|$slug|avif=${size_avif}B" \
  >> memory/image-optimizer-log.md
rm "tasks/awaiting-critics/image-<slug>/lock"
```

## 5. Forbidden Actions

- Neue Bilder erstellen (User-Territorium)
- Alt-Text halluzinieren (nur validieren, nicht schreiben)
- JPG/PNG als Primär-Format wählen
- Copyright-Bilder
- `git *` (Commit-Request)
