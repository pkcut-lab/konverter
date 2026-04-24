#!/usr/bin/env bash
# Pre-Commit-Gate fuer Tool-Builder (AGENTS.md §0.3).
#
# Prueft, dass ein Tool-Build vollstaendig ist — inkl. Svelte-UI-Component und
# Route-Integration in [slug].astro, wenn das Dossier eine Custom-Component
# erfordert. Verhindert den Logic-only-Commit-Bug (KON-86 u.a., 2026-04-24).
#
# Usage: scripts/paperclip/verify-tool-build.sh <tool-id> <slug>
#
# Exit-Codes:
#   0 — alles da, Commit zulaessig
#   1 — fehlende Basis-5-Files (Logic / Content / Test / slug-map / tool-registry)
#   2 — fehlende Custom-Component ODER fehlender [slug].astro-Route-Eintrag
#   3 — fehlender tool-runtime-registry-Entry bei file-tool
#   4 — Usage-Fehler / Tool nicht in tool-registry.ts gefunden

set -u

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <tool-id> <slug>" >&2
  echo "Beispiel: $0 brutto-netto-rechner brutto-netto-rechner" >&2
  exit 4
fi

TOOL_ID="$1"
SLUG="$2"
ERR=0

red()   { printf '\033[31m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }
yellow(){ printf '\033[33m%s\033[0m\n' "$*"; }
check() {
  local label="$1"; local path="$2"
  if [[ -f "$path" ]]; then
    green "  OK  $label -> $path"
  else
    red   "  MISS $label -> $path"
    return 1
  fi
}

echo "== Tool-Build-Verify: $TOOL_ID ($SLUG) =="

# --- Basis-Files (existenzbasiert) ------------------------------------------
echo
echo "[1/3] Basis-Files:"
check "Logic-Config"       "src/lib/tools/${TOOL_ID}.ts"                       || ERR=1
check "Content-Markdown"   "src/content/tools/${SLUG}/de.md"                   || ERR=1
check "Test-File"          "tests/lib/tools/${TOOL_ID}.test.ts"                || ERR=1
[[ -f "src/lib/slug-map.ts" ]]      || { red "  MISS slug-map.ts fehlt";      ERR=1; }
[[ -f "src/lib/tool-registry.ts" ]] || { red "  MISS tool-registry.ts fehlt"; ERR=1; }

# Wenn Logic-Config fehlt, kann config.id nicht extrahiert werden — Abbruch.
if [[ ! -f "src/lib/tools/${TOOL_ID}.ts" ]]; then
  echo
  red "FAIL — Logic-Config fehlt, weitere Checks nicht moeglich."
  exit 1
fi

# --- Tool-Typ + config.id ableiten ------------------------------------------
TYPE=$(grep -oE "type:\\s*['\"][a-z-]+['\"]" "src/lib/tools/${TOOL_ID}.ts" 2>/dev/null \
       | head -1 | sed -E "s/.*type:\\s*['\"]([a-z-]+)['\"].*/\\1/")
ID_IN_CONFIG=$(grep -oE "id:\\s*['\"][a-z0-9-]+['\"]" "src/lib/tools/${TOOL_ID}.ts" 2>/dev/null \
       | head -1 | sed -E "s/.*id:\\s*['\"]([a-z0-9-]+)['\"].*/\\1/")

if [[ -z "$ID_IN_CONFIG" ]]; then
  red "  MISS konnte config.id nicht aus src/lib/tools/${TOOL_ID}.ts extrahieren"
  ERR=1
else
  green "  OK  Logic-Config config.id='$ID_IN_CONFIG' type='${TYPE:-?}'"
fi

# --- Registry-Eintraege (keyed on config.id, nicht auf filename) ------------
# slug-map Pattern:   '<config.id>': { de: '<slug>' }
# tool-registry:      '<config.id>': () => import('./tools/<tool-id>')...
if [[ -n "$ID_IN_CONFIG" ]]; then
  if grep -qE "['\"]${ID_IN_CONFIG}['\"]\\s*:\\s*\\{[^}]*de:\\s*['\"]${SLUG}['\"]" src/lib/slug-map.ts 2>/dev/null; then
    green "  OK  slug-map.ts: '$ID_IN_CONFIG' -> { de: '$SLUG' }"
  elif grep -qE "['\"]${ID_IN_CONFIG}['\"]" src/lib/slug-map.ts 2>/dev/null; then
    yellow "  WARN slug-map.ts enthaelt '$ID_IN_CONFIG', aber de-Slug matcht nicht '$SLUG' — pruefen."
    ERR=1
  else
    red "  MISS slug-map.ts hat keinen Eintrag fuer config.id='$ID_IN_CONFIG'"
    ERR=1
  fi

  # Pattern matcht einzeilig UND zweizeilig, z.B.
  #   'xxx': () => import('./tools/yyy')...
  #   'xxx': () =>
  #     import('./tools/yyy')...
  if awk -v id="$ID_IN_CONFIG" -v tid="$TOOL_ID" '
    BEGIN { found=0; want_import=0 }
    {
      if (match($0, "['\''\"]"id"['\''\"]\\s*:\\s*\\(\\)\\s*=>")) {
        if ($0 ~ /import\s*\(/) { found=1; exit }
        want_import=1; next
      }
      if (want_import && $0 ~ /import\s*\(/) { found=1; exit }
    }
    END { exit (found ? 0 : 1) }
  ' src/lib/tool-registry.ts 2>/dev/null; then
    green "  OK  tool-registry.ts: '$ID_IN_CONFIG' Lazy-Import-Pattern"
  elif grep -qE "['\"]${ID_IN_CONFIG}['\"]" src/lib/tool-registry.ts 2>/dev/null; then
    yellow "  WARN tool-registry.ts enthaelt '$ID_IN_CONFIG', aber kein () => import() — §9.1 verlangt Lazy."
    ERR=1
  else
    red "  MISS tool-registry.ts hat keinen Eintrag fuer config.id='$ID_IN_CONFIG'"
    ERR=1
  fi
fi

if [[ $ERR -ne 0 ]]; then
  echo
  red "FAIL — Basis-Files / Registry unvollstaendig. Kein Commit."
  exit 1
fi

echo
echo "[2/3] Tool-Typ-Check:"
echo "  type=${TYPE:-?}  config.id=${ID_IN_CONFIG:-?}"

if [[ -z "$TYPE" ]]; then
  red "  MISS konnte type nicht aus src/lib/tools/${TOOL_ID}.ts extrahieren"
  exit 4
fi

# ERR zuruecksetzen — Basis-Check ist durch, ab hier zaehlen Route/Component-Checks
ERR=0

ROUTE_FILE="src/pages/[lang]/[slug].astro"
if [[ ! -f "$ROUTE_FILE" ]]; then
  red "  MISS route file fehlt: $ROUTE_FILE"
  exit 2
fi

# Routable-Type-Check: Der config.type muss in [slug].astro als routable-Type
# registriert sein, sonst wird keine Seite unter /<lang>/<slug> generiert.
# Aktuelle routable-Types: converter, file-tool, formatter, comparer, analyzer,
# generator, validator, interactive. 'calculator' ist NICHT routable (bekannter
# Bug in KON-87/KON-88: zinsrechner + zinseszins-rechner haben type:'calculator'
# und werden von getStaticPaths gefiltert — ihre Seiten werden nicht gebaut).
case "$TYPE" in
  converter|file-tool|formatter|comparer|analyzer|generator|validator|interactive)
    : ;;
  *)
    red "  MISS type='${TYPE}' ist in $ROUTE_FILE NICHT als routableType registriert."
    red "       Seite unter /<lang>/$SLUG wird NICHT gebaut. Aktuelle routable-Types:"
    red "       converter, file-tool, formatter, comparer, analyzer, generator, validator, interactive."
    red "       Fix: (a) type auf passenden routableType aendern + Custom-Component bauen, ODER"
    red "            (b) routableType + componentByType in $ROUTE_FILE erweitern (CTO-Scope)."
    ERR=2
    ;;
esac

# Custom-Component noetig?
# - FileTool: nein (generisch) — runtime-entry wird separat geprueft
# - Interactive: ja
# - Sonst: nur wenn config.id in [slug].astro als String auftaucht
#   (entweder direkt in CUSTOM_FORMATTER_IDS-Set oder als const TOOL_ID = '...';)
needs_custom=false
if [[ "$TYPE" == "interactive" ]]; then
  needs_custom=true
elif [[ "$TYPE" != "file-tool" ]]; then
  if grep -qE "['\"]${ID_IN_CONFIG}['\"]" "$ROUTE_FILE" 2>/dev/null; then
    needs_custom=true
  fi
fi

echo
echo "[3/3] Route + Component:"

if [[ "$needs_custom" == "true" ]]; then
  # Route-Mapping existiert bereits (haben wir oben detektiert).
  green "  OK  Route-Mapping fuer config.id='$ID_IN_CONFIG' in $ROUTE_FILE vorhanden"

  # PascalCase-Name aus tool-id ableiten (my-tool -> MyToolTool)
  PASCAL=$(echo "$TOOL_ID" | awk -F- '{for(i=1;i<=NF;i++) printf toupper(substr($i,1,1)) substr($i,2); print ""}')
  EXPECTED_COMP="src/components/tools/${PASCAL}Tool.svelte"

  if [[ -f "$EXPECTED_COMP" ]]; then
    # Component existiert, aber ist sie auch im Route-File importiert?
    if grep -qE "import\\s+${PASCAL}Tool\\s+from" "$ROUTE_FILE" 2>/dev/null; then
      green "  OK  Component existiert + Import im Route-File: ${PASCAL}Tool"
    else
      red "  MISS ${PASCAL}Tool existiert, aber kein \"import ${PASCAL}Tool from ...\" in $ROUTE_FILE"
      red "       Import + Render-Block im config.id='$ID_IN_CONFIG'-Zweig hinzufuegen."
      ERR=2
    fi
  else
    # Evtl. anderer Component-Name; prueft ob irgendeine Component den config.id rendert
    ALT=$(grep -lE "toolId:\\s*['\"]${TOOL_ID}['\"]" src/components/tools/*.svelte 2>/dev/null | head -1)
    if [[ -n "$ALT" ]]; then
      yellow "  WARN erwartet $EXPECTED_COMP, gefunden: $ALT — nur Namenswarnung."
    else
      red "  MISS Custom-Component fehlt: $EXPECTED_COMP"
      red "       Route-File referenziert '$ID_IN_CONFIG' -> Component muss existieren + importiert sein."
      ERR=2
    fi
  fi
elif [[ "$TYPE" == "file-tool" ]]; then
  green "  OK  FileTool-Typ (generische FileTool.svelte rendert) — runtime-entry wird im naechsten Schritt geprueft"
else
  # Hinweis: Wenn der Tool-Typ 'calculator' ist oder ein 'formatter' Multi-Field-UX
  # braucht (Dossier §9), MUSS der Builder in [slug].astro registrieren + Custom-
  # Component bauen. Das erkennt das Script nicht automatisch — Rulebook §0.2 ist
  # die Pflicht-Reflexion vor dem Code-Schreiben. Engineer-Output dokumentiert
  # ui_component_decision: custom|generic.
  if [[ "$TYPE" == "calculator" ]]; then
    red "  MISS Tool-Typ 'calculator' aber config.id nicht in $ROUTE_FILE registriert."
    red "       Calculator-Typ BRAUCHT immer eine Custom-Component (Multi-Field-Form,"
    red "       Ergebnis-Karten, Tabellen). Eine generische Component existiert nicht."
    red "       Fix: Component bauen (Pattern: TilgungsplanRechnerTool) + Import +"
    red "            config.id-Block in $ROUTE_FILE. Siehe Rulebook §0.1 + §0.2."
    ERR=2
  else
    green "  OK  generische Component (kein Custom-*Tool.svelte noetig, config.id nicht im Route-File)"
    yellow "  HINT Wenn das Dossier §9 Multi-Field-UX/Tabellen/Listen fordert, ist dieser"
    yellow "       'generisch'-Zustand FALSCH. Rulebook §0.2 vor Commit pruefen."
  fi
fi

# FileTool: Runtime-Registry-Entry Pflicht
if [[ "$TYPE" == "file-tool" ]]; then
  RR="src/lib/tools/tool-runtime-registry.ts"
  if [[ ! -f "$RR" ]]; then
    red "  MISS tool-runtime-registry.ts fehlt"
    ERR=3
  elif grep -qE "['\"]${ID_IN_CONFIG}['\"]\\s*:" "$RR" 2>/dev/null; then
    green "  OK  tool-runtime-registry.ts Entry fuer '$ID_IN_CONFIG'"
  else
    red "  MISS tool-runtime-registry.ts hat keinen Entry fuer '$ID_IN_CONFIG'"
    red "       FileTool braucht process + (opt) prepare — siehe §0.1 + §9.2."
    ERR=3
  fi
fi

echo
if [[ $ERR -eq 0 ]]; then
  green "PASS — Tool-Build vollstaendig, Commit zulaessig."
  exit 0
else
  red "FAIL — Fehlende Files (Exit-Code $ERR). Nachbauen + Test-Gate erneut."
  exit $ERR
fi
