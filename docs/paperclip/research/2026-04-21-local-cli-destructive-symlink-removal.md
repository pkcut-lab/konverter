---
title: "paperclipai agent local-cli — Destructive Symlink Removal"
date: 2026-04-21
status: research-note
package: paperclipai@2026.416.0
severity: medium
audience: konverter-webseite-team
related:
  - docs/paperclip/research/2026-04-20-multi-agent-role-matrix.md
  - ~/.paperclip-local-env/ceo-exports.sh
---

# paperclipai agent local-cli — Destructive Symlink Removal

## TL;DR

`paperclipai agent local-cli <agentRef>` löscht beim Skill-Install-Pass **stillschweigend** alle Symlinks unter `~/.claude/skills/*` und `~/.codex/skills/*`, deren Symlink-Ziel den Pfadteil `/.agents/skills/` enthält. Bei Superpowers-Setups (die exakt diesen Symlink-Pfad nutzen) verschwindet damit das halbe lokale Skill-Inventar — ohne Confirmation-Prompt, ohne Backup, ohne erkennbaren Hinweis im CLI-Output (Removal-Liste taucht nur in `--json`-Mode auf).

Setup-Schaden: Wenn das `linked`-Array gleichzeitig leer ist (z.B. weil EPERM-Symlink-Errors auf Windows ohne Admin-Mode), bleibt unter `~/.claude/skills/` nur das Rumpf-Inventar, das schon vorher real (nicht-symlink) existiert hat. Skill-Auflösung in laufenden Claude-Code-Sessions kann dadurch degradieren — abhängig davon, ob der Plugin-Cache (`~/.claude/plugins/cache/superpowers-marketplace/.../skills/`) als Fallback greift.

## Beobachteter Vorfall (2026-04-20)

Kontext: Konverter-Webseite-Workspace, Phase B Bootstrap. Nach erfolgreichem `paperclipai company import` wurde `paperclipai agent local-cli ceo` ausgeführt, um den CEO-Agent-API-Key + Skill-Setup für die `claude_local`-Adapter-Pipeline zu erzeugen.

Pre-State `~/.claude/skills/` (32 Einträge): 5 echte Verzeichnisse + 27 Symlinks → `~/.agents/skills/<name>`.

Post-State `~/.claude/skills/` (5 Einträge): nur die echten Verzeichnisse blieben — alle 27 Superpowers-Symlinks waren weg.

Removed (alle aus dem `agent local-cli`-JSON-Output unter `skills[].removed`):

```
astro, bmad-review-adversarial-general, brainstorming, company-creator,
design-guide, dispatching-parallel-agents, engineering-skills, executing-plans,
find-skills, finishing-a-development-branch, frontend-design, marketing-skills,
minimalist-ui, obsidian-second-brain, receiving-code-review,
requesting-code-review, schema-markup, subagent-driven-development,
svelte-core-bestpractices, systematic-debugging, test-driven-development,
using-git-worktrees, using-superpowers, verification-before-completion,
web-design-guidelines, writing-plans, writing-skills
```

Linked: 0 (Windows ohne Developer-/Admin-Mode → EPERM bei jedem `fs.symlink`-Call).

Skipped: 3 (`paperclip`, `paperclip-create-agent`, `para-memory-files` — bereits als reale Dirs vorhanden).

## Evidence (paperclipai-Quellcode)

`paperclipai@2026.416.0` (npx-cache-Pfad: `C:\Users\carin\AppData\Local\npm-cache\_npx\00aa4a3c58fe44c7\node_modules\paperclipai\dist\index.js`).

### Heuristik: was als "maintainer-only" gilt

`index.js:14521-14523`:

```js
function isMaintainerOnlySkillTarget(candidate) {
  return normalizePathSlashes(candidate).includes("/.agents/skills/");
}
```

Jedes Symlink-Ziel, das `/.agents/skills/` enthält, ist „maintainer-only".

### Removal-Loop

`index.js:14538-14561` (`removeMaintainerOnlySkillSymlinks`):

```js
for (const entry of entries) {
  if (allowed.has(entry.name)) continue;       // im Source-Bundle enthalten → behalten
  const target = path18.join(skillsHome, entry.name);
  const existing = await fs13.lstat(target).catch(() => null);
  if (!existing?.isSymbolicLink()) continue;   // reale Dirs/Files überleben
  const linkedPath = await fs13.readlink(target).catch(() => null);
  if (!linkedPath) continue;
  const resolvedLinkedPath = path18.isAbsolute(linkedPath)
    ? linkedPath
    : path18.resolve(path18.dirname(target), linkedPath);
  if (!isMaintainerOnlySkillTarget(linkedPath) &&
      !isMaintainerOnlySkillTarget(resolvedLinkedPath)) {
    continue;
  }
  await fs13.unlink(target);                   // ← unconditional unlink
  removed.push(entry.name);
}
```

Trigger: jeder `agent local-cli`-Call bei `--no-install-skills` ≠ true.

### Aufruf im Pfad

`index.js:14728-14729` (innerhalb der `agent local-cli`-Action):

```js
installSummaries.push(
  await installSkillsForTarget(skillsDir, codexSkillsHome(), "codex"),
  await installSkillsForTarget(skillsDir, claudeSkillsHome(), "claude")
);
```

Im jeweiligen `installSkillsForTarget` ruft Paperclip vor dem Symlink-Anlegen `removeMaintainerOnlySkillSymlinks(skillsHome, allowedSkillNames)` auf. „allowedSkillNames" = nur die 4 Skills aus dem Adapter-Bundle (`paperclip`, `paperclip-create-agent`, `paperclip-create-plugin`, `para-memory-files`). Alles andere mit `/.agents/skills/`-Ziel wird gelöscht.

## Impact-Analyse

| Dimension | Bewertung |
|---|---|
| Datenverlust | **Keiner.** Es werden ausschließlich Symlinks entfernt — die tatsächlichen Skill-Quellen unter `~/.agents/skills/` bleiben unangetastet. |
| Skill-Verfügbarkeit (Claude Code) | **Eventuell degradiert.** Wenn Claude Code für Skill-Resolution primär `~/.claude/skills/`-Symlinks nutzt, fehlen die Skills bis zum Restore. Beobachtung im konkreten Vorfall: Skill `using-superpowers` blieb invokebar via Plugin-Cache (`~/.claude/plugins/cache/superpowers-marketplace/superpowers/5.0.5/skills/using-superpowers`) — der greift offenbar als Fallback. |
| Sichtbarkeit für User | **Niedrig.** Standard-CLI-Output zeigt nur grünen Erfolgs-Status; die `removed`-Liste taucht nur bei `--json` auf. Ohne `--json` würde der User nichts merken. |
| Reversibilität | **Hoch.** Junctions (`mklink /J`) auf Windows ohne Admin-Mode möglich, Symlinks (`ln -s`) auf Linux/macOS trivial. Inhalt aus `~/.agents/skills/` bleibt Source-of-Truth. |
| Wiederholbarkeit | **Bei jedem `agent local-cli`-Call.** Bei jeder Aktivierung eines weiteren Worker-Agents (`merged-critic`, `tool-builder`, `tool-dossier-researcher`) würde der Vorfall sich wiederholen, falls die Junctions zwischendurch nicht restauriert sind. |

## Workaround (Konverter-Webseite-Setup)

Nach jedem `agent local-cli`-Call mit fehlenden Skills:

```bash
SKILLS="astro bmad-review-adversarial-general brainstorming company-creator \
design-guide dispatching-parallel-agents engineering-skills executing-plans \
find-skills finishing-a-development-branch frontend-design marketing-skills \
minimalist-ui obsidian-second-brain receiving-code-review \
requesting-code-review schema-markup subagent-driven-development \
svelte-core-bestpractices systematic-debugging test-driven-development \
using-git-worktrees using-superpowers verification-before-completion \
web-design-guidelines writing-plans writing-skills"

for name in $SKILLS; do
  src='C:\Users\carin\.agents\skills\'"$name"
  dst='C:\Users\carin\.claude\skills\'"$name"
  [ -e "C:/Users/carin/.claude/skills/$name" ] && continue
  cmd //c mklink //J "$dst" "$src" >/dev/null
done
```

Junctions sind unter Windows funktional äquivalent zu Symlinks für Skill-Resolution (Claude Code folgt sowohl Symlinks als auch Junctions), brauchen aber kein Admin/Developer-Mode.

## Mitigations für künftige `agent local-cli`-Calls

1. **`--no-install-skills`-Flag setzen**, wenn der lokale Skill-Setup nicht von Paperclip verwaltet werden soll. Verzicht: die 4 Adapter-Skills (`paperclip`, `paperclip-create-agent`, `paperclip-create-plugin`, `para-memory-files`) müssen dann manuell installiert werden, falls der Adapter sie braucht.
2. **Pre-Backup** der Symlink-Liste vor jedem Call:
   ```bash
   ls -la ~/.claude/skills/ > /tmp/skills-pre-$(date +%s).txt
   ```
3. **Junctions persistent halten** via Restore-Script (s.o.) als Post-Hook nach jedem `agent local-cli`-Call.

## Upstream-Issue-Material (falls Meldung gewünscht)

Repository: https://github.com/paperclipai/paperclip
Affected version: `paperclipai@2026.416.0`
Title-Vorschlag: „`agent local-cli` silently removes user-installed skill symlinks pointing into `~/.agents/skills/`"

Reproducer:
1. Install Superpowers locally (creates `~/.claude/skills/<name>` → `~/.agents/skills/<name>` symlinks).
2. Run `paperclipai agent local-cli <any-agent>`.
3. Observe: 27 user symlinks gone from `~/.claude/skills/`, only Paperclip's own 4 skills remain.

Vorschlag: maintainer-only-Heuristik nicht auf Pfad-Substring `/.agents/skills/` einschränken — die Heuristik trifft jeden User, der Skill-Dev-Workflows mit `~/.agents/`-Layout fährt (was Superpowers' offizielles Pattern ist). Alternative: explizite `--prune-skills` Opt-in-Flag, statt implizites Cleanup als Side-Effect des `--install-skills`-Defaults.

## Status & Next Steps

- **Konverter-Setup**: Junctions am 2026-04-21 restauriert (32/32 Skills wieder vorhanden). `using-superpowers` via Skill-Tool grün → Setup intakt.
- **Future Worker-Agent-Aktivierung** (`merged-critic`, `tool-builder`, `tool-dossier-researcher`): Bei `agent local-cli` für jeden dieser Agents zuerst `--no-install-skills` testen; falls die Adapter-Skills doch benötigt werden, danach Restore-Script laufen lassen.
- **Upstream-Issue**: Diese Notiz ist Issue-ready, aber nicht eingereicht. User entscheidet, ob bei Paperclip gemeldet wird.
