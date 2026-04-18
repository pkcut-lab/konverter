# pending-icons — Recraft-Drop-Zone

Staging-Verzeichnis für frisch generierte Pencil-Sketch-Icons, bevor sie in die
gebaute WebP-Pipeline übergehen.

## Workflow

1. **Prompt öffnen:** `docs/drafts/{tool-id}-icon-prompt.md` (Master-Template in
   Spec Section 5.6, pro Tool konkretisiert).
2. **Generieren:** Recraft.ai mit dem Primary-Prompt + Style-Anchors +
   Negative-Prompt laufen lassen. Free-Tier reicht für ~50 Icons/Tag.
3. **Drop:** PNG hier ablegen als `{tool-id}.png` — siehe Naming unten.
4. **Konvertieren (ab Session 9):** `npm run icons:build` → `sharp` erzeugt die
   WebP-Varianten (siehe „Build-Output") und räumt die PNG weg.
5. **Committen:** WebP-Dateien in `public/icons/tools/` werden ge-committed. Das
   PNG hier bleibt nicht im Repo, sobald der Build gelaufen ist.

## File-Naming

- **Schema:** `{tool-id}.png` — Tool-IDs sind sprach-neutral (camelCase oder
  kebab-case, siehe Tool-Config). Beispiele: `meter-to-feet.png`,
  `webp-konverter.png`.
- **Nicht `{slug}.png`** — Slugs sind sprachspezifisch (`meter-zu-fuss` DE vs
  `meter-to-feet` EN) und würden pro Sprache duplizieren. Ein Icon, viele
  Slugs.

## Maße & Build-Output

- **Source (hier im Ordner):** 512×512 PNG, transparent, Graustufen.
- **Build-Output** (ab Session 9, siehe Spec Section 9.5):
  - `public/icons/tools/{tool-id}.webp` — 160×160, Quality 85
  - CSS-Display-Size: 80×80 (160×160 Source liefert 2× Retina-Schärfe).

## Status-Kennzeichnung (Tool-Config)

Im JSDoc-Kopf der zugehörigen Tool-Config (`src/lib/tools/{slug}.ts`, Spec
Section 4.2) muss der Icon-Status sichtbar sein:

```
/**
 * @icon-status [ ] Pending  [ ] Generated  [ ] Delivered
 */
```

- **Pending:** kein PNG hier, kein WebP in public.
- **Generated:** PNG liegt hier, WebP noch nicht gebaut.
- **Delivered:** WebP in `public/icons/tools/`, PNG entfernt.

## QA-Checkliste vor Drop

- Transparenter Hintergrund — kein weißes Rechteck, kein beigefärbter Fond.
- Monochrome Graphit-Töne (`#6B7280` ± 10 %). Keine Farbpixel.
- Centered mit ca. 8 % Padding. Kein Rand-Clipping.
- Pencil-Stroke-Charakter erkennbar — leichte Linien-Unregelmäßigkeit, keine
  Vektor-Cleanliness.
- Export ≤ 30 KB PNG (Source vor sharp). Wenn größer → Recraft-Regenerate.

## Hinweis zum Stand

Das Build-Script (`scripts/build-icons.ts`) landet erst in **Session 9 —
Icon-Pipeline**. Bis dahin bleiben PNGs hier liegen; Tool-Pages zeigen
Platzhalter-Text statt Icon (Spec Section 5.6, Fallback: nichts rendern).
