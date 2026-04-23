#!/usr/bin/env node
/**
 * validate-agent-activation.mjs — Activation-Gate (STUB v0.1, 2026-04-23)
 *
 * Pre-Hire-Gate aus .paperclip.yaml activation_gate. Paperclip ruft dieses
 * Script vor `hire <agent>` auf. Exit 0 = erlaubt hiring, Exit 1 = blockt.
 *
 * STATUS: Stub-Implementierung. Gibt IMMER exit 1 zurück — blockt damit jeden
 * Agent-Hire, bis Tranche-B diesen Stub mit echter Logik ersetzt (Scripts-
 * Existenz-Check, Eval-Smoke, Rulebook-Validation).
 *
 * Siehe docs/paperclip/SCRIPT-INVENTORY.md §4 und
 *       docs/paperclip/GAPS-AND-NEXT-STEPS.md §2.B4 für Tranche-B-Spec.
 */

const agentSlug = process.argv[2];

if (!agentSlug) {
  console.error('[activation-gate] FAIL — kein Agent-Slug übergeben. Usage: validate-agent-activation.mjs <slug>');
  process.exit(1);
}

console.error(`[activation-gate] FAIL — Stub v0.1 blockt Hiring von "${agentSlug}".`);
console.error(`[activation-gate] Echte Validation (Scripts-Exist + Eval-Smoke + Rulebook-OK) kommt in Tranche B.`);
console.error(`[activation-gate] Zur temporären Überbrückung: setze .paperclip.yaml activation_gate.require_* = false (nicht empfohlen).`);
process.exit(1);
