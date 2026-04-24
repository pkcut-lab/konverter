ticket_id: KON-88
tool_slug: zinseszins-rechner
language: de
status: done
dossier_ref: tasks/dossiers/_cache/finance/zinseszins-rechner.dossier.md
dossier_applied:
  baseline_features: [input-field, copy-button, 3-scenario-output, detail-strip]
  white_space_feature: "Drei-Szenarien-Output (nominal/netto/real) mit jährlicher Steuerberechnung (Abgeltungssteuer + Sparerpauschbetrag)"
  user_pain_addressed: "Nutzer wollen netto-Rendite nach Steuer ohne Login sehen"
files_changed:
  - path: src/lib/tools/zinseszins-rechner.ts
    action: modified
    lines: +40 -5
  - path: src/content/tools/zinseszins-rechner/de.md
    action: modified
    lines: +320 -0
  - path: src/components/tools/ZinseszinsRechnerTool.svelte
    action: created
    lines: +380 -0
  - path: src/pages/[lang]/[slug].astro
    action: modified
    lines: +5 -0
  - path: tests/lib/tools/zinseszins-rechner.test.ts
    action: modified
    lines: +10 -0
tests:
  ran: npm test -- zinseszins-rechner
  result: pass
  output: |
    Test Files  1 passed (1)
    Tests  34 passed (34)
astro_check:
  ran: npm run astro -- check
  result: pass
word_count:
  file: src/content/tools/zinseszins-rechner/de.md
  value: 1057
notes: |
  Rework: type calculator → formatter, ZinseszinsRechnerTool.svelte erstellt,
  COMPOUND_INTEREST_TOOL_ID in CUSTOM_FORMATTER_IDS + Render-Block in [slug].astro.
  verify-tool-build PASS. Commit: 790b918.
