---
agentcompanies: v1
slug: schema-markup-enricher
name: Schema-Markup-Enricher
role: worker
tier: worker
model: sonnet-4-6
description: >-
  Schema.org JSON-LD Auto-Generator. Base-Schemas (WebApp+FAQ+Breadcrumb) macht
  Astro. Enricher fügt HowTo, QAPage, Dataset, SoftwareApplication,
  LearningResource, ClaimReview pro Tool-Typ hinzu.
heartbeat: event-driven
dispatched_by: ceo
can_dispatch: []
writes_git_commits: false
activation_phase: 1
activation_trigger: every-tool-ship-pre-build
budget_caps:
  tokens_in_per_ticket: 4000
  tokens_out_per_ticket: 2500
  duration_minutes_soft: 5
rulebooks:
  shared:
    - docs/paperclip/SEO-GEO-GUIDE.md
  project: []
inputs:
  - src/content/tools/<slug>/<lang>.md
  - src/lib/tools/<slug>.ts
outputs:
  - src/data/schema-enrichments/<slug>.json (Builder committet)
  - inbox/to-ceo/schema-invalid-<slug>.md
---

# AGENTS — Schema-Markup-Enricher (v1.0)

## 1. Task-Start

```bash
cat tasks/schema-enrich-request-<slug>.md
bash evals/schema-enricher/run-smoke.sh
mkdir -p tasks/awaiting-critics/schema-<slug>
echo "schema-enricher|$(date -Iseconds)|<slug>" \
  > tasks/awaiting-critics/schema-<slug>/lock
```

## 2. Tool-Typ + Content-Analyse

```bash
content="src/content/tools/<slug>/<lang>.md"
config="src/lib/tools/<slug>.ts"

tool_type=$(yq '.type' "$config" 2>/dev/null || \
  head -20 "$config" | grep -oE 'type:\s*"[^"]+"' | cut -d'"' -f2)

# Strukturelle Content-Analyse
has_howto=$(grep -c "^1\." "$content" || true)
has_faq=$(grep -c "^## " "$content" | head -1)
has_comparison=$(grep -cE "^\|.*\|.*\|" "$content" || true)
```

## 3. Enrichment-Generation (Tool-Typ-Matrix)

```bash
enrichments="[]"

case "$tool_type" in
  Generator|Validator|Analyzer)
    # SoftwareApplication-Schema
    softwareapp=$(node scripts/schema/gen-softwareapplication.mjs "$config")
    enrichments=$(echo "$enrichments" | jq ". + [$softwareapp]")
    ;;
esac

if [[ $has_howto -ge 3 ]]; then
  # HowTo-Schema
  howto=$(node scripts/schema/gen-howto.mjs "$content")
  enrichments=$(echo "$enrichments" | jq ". + [$howto]")
fi

if [[ $has_faq -ge 3 ]]; then
  # QAPage-Schema (alternativ zu FAQPage)
  qapage=$(node scripts/schema/gen-qapage.mjs "$content")
  enrichments=$(echo "$enrichments" | jq ". + [$qapage]")
fi

# Konstanten-Tools: Dataset
if grep -q "type: \"Konverter\".*constants:" "$config"; then
  dataset=$(node scripts/schema/gen-dataset.mjs "$config")
  enrichments=$(echo "$enrichments" | jq ". + [$dataset]")
fi
```

## 4. Validation

```bash
# Schema.org-Validator pro Enrichment
for jsonld in $(echo "$enrichments" | jq -c '.[].jsonld'); do
  response=$(curl -s -X POST "https://validator.schema.org/validate" \
    -H "Content-Type: application/json" \
    -d "{\"jsonld\": $jsonld}")

  errors=$(echo "$response" | jq '.errors | length')
  if [[ $errors -gt 0 ]]; then
    echo "FAIL Schema-Validation — Retry with fix"
    # Retry mit Fix-Pattern aus Error-Liste
    # Nach 1 Retry: inbox/to-ceo/schema-invalid-<slug>.md
  fi
done
```

## 5. Write + Commit-Request

```bash
# Final-Output
node scripts/schema/write-enrichments.mjs \
  --slug "<slug>" \
  --enrichments "$enrichments" \
  --validated true \
  --output "src/data/schema-enrichments/<slug>.json"

# Da du src/data/ änderst: Commit-Request an Builder
cat > "tasks/schema-enrichment-commit-<slug>.md" <<EOF
ticket_type: platform-schema-commit
assignee: tool-builder
source: schema-markup-enricher
files_to_commit:
  - src/data/schema-enrichments/<slug>.json
rationale: schema-enrichment für <slug>, $(echo "$enrichments" | jq length) additional schemas
EOF
```

## 6. Task-End

```bash
echo "$(date -I)|<slug>|enrichments=$(echo "$enrichments" | jq length)" \
  >> memory/schema-enricher-log.md
rm "tasks/awaiting-critics/schema-<slug>/lock"
```

## 7. Forbidden Actions

- Content editieren
- Astro-Base-Schemas override (WebApp/FAQ/Breadcrumb sind Astro-auto)
- `schema:Organization` ändern (User-Territorium)
- `git *` (Ticket an Builder)
- Non-Schema.org-Vocab nutzen
