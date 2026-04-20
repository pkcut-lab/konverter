import { StitchToolClient, stitch, StitchError } from '@google/stitch-sdk';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const PROJECT_ID = process.env.STITCH_PROJECT_ID ?? '17885144393549343699';
const OUT_ROOT = 'stitch-output';

if (!process.env.STITCH_API_KEY || process.env.STITCH_API_KEY.startsWith('PASTE_')) {
  console.error('✗ STITCH_API_KEY nicht gesetzt.');
  process.exit(1);
}

const PROMPT = `Desktop-Homepage einer deutschen Konverter-/Werkzeug-Webseite.
Auto-Index: Diese Seite listet alle aktuell ausgelieferten Tools in einem Bento-Grid.
Der Screen zeigt den Default-State der Homepage /de/ — keine Suchergebnisse,
kein Filter aktiv, kein Sortier-Dropdown. Einzelner Viewport, linksbündiger
redaktioneller Flow, keine Hero-Backgrounds, keine Illustrationen, keine Hero-Images.
Die gesamte Seite ist auf Deutsch — Header-Nav, Kartentitel, Footer, alles.

Seitenstruktur (von oben nach unten):

1. Schmale Header-Leiste, 64px hoch, volle Breite, Background #FFFFFF:
   - Innerer Container max-width 72rem, horizontal padding 1.5rem, Flex vertikal zentriert.
   - LINKS: Wortmarke "Konverter" in Inter 600, 18px, Farbe #1A1917.
   - MITTE: zwei Text-Links in Inter 500, 14px, Farbe #5C5A55, gap 24px:
     "Werkzeuge" · "Über"
   - SEARCH: Pagefind-Eingabe-Feld, flex-grow, min-width 0, 1px Border #E8E6E1,
     border-radius 8px, Platzhalter "Werkzeuge durchsuchen…" in Inter 400 14px
     Farbe #9C9A94. Icon-Präfix (Lupe, 14px stroke) am linken Innenrand.
   - GANZ RECHTS: 3-Slot-Segmented-Control Theme-Toggle.
     Container: inline-flex, gap 4px, padding 4px, 1px Border #E8E6E1,
     border-radius 8px, Background #FAFAF9.
     Drei Slots nebeneinander: "Auto" (inaktiv), "Hell" (aktiv — Background #FFFFFF,
     Text #1A1917, shadow-sm), "Dunkel" (inaktiv).
     Slot-Padding 4px × 12px, Radius 4px, Inter 14px. Inaktive Slots color #5C5A55.
   - Unter dem Header eine dünne 1px Trennlinie #E8E6E1 über volle Breite.
   VERBOTEN im Header: "Sign In", "Log In", "Login", "Account", "Register",
   User-Avatar, Benachrichtigungs-Glocke, "Journal", "Archive", "API", "Blog", "Pricing",
   Sonne-/Mond-Icon-Swap-Toggle (wir haben 3 Slots, nicht 2 Icons), "Sprache ▾"-Dropdown.
   Englische Nav-Labels sind auf dieser DE-Route verboten.

2. Hero-Block, max-width 44rem, horizontal zentriert, padding-top 48px, Flex column, gap 12px:
   - Eyebrow "KONVERTER" in JetBrains Mono 14px uppercase, letter-spacing 0.08em,
     Farbe #9C9A94.
   - H1 "Werkzeuge, die im Browser bleiben." in Inter 600, 36px, line-height 1.2,
     letter-spacing -0.015em, text-wrap balance, Farbe #1A1917.
   - Lede-Absatz, max-width 36rem, Inter 400, 17px, line-height 1.55,
     Farbe #5C5A55, text-wrap balance, margin-top 8px:
     "Freisteller, Format-Umwandlung, Umrechnungen. Alles läuft auf deinem Gerät
     — keine Uploads, keine Anmeldung, kein Tracking."

3. Section-Head, max-width 60rem, zentriert, margin-top 64px:
   - Flex row, align-items baseline, justify-content space-between,
     border-bottom 1px solid #E8E6E1, padding-bottom 16px, margin-bottom 32px.
   - LINKS: H2 "Alle Werkzeuge" in Inter 600, 28px, letter-spacing -0.01em, Farbe #1A1917.
   - RECHTS: Count-Badge "06" in JetBrains Mono 14px tabular-nums, letter-spacing 0.04em,
     Farbe #9C9A94. Kein Border, kein Background — nur Text.

4. Tool-Grid, Bento-Layout, max-width 60rem:
   - CSS Grid: drei Spalten auf ≥1024px (3×2), zwei Spalten auf 768–1023px (2×3),
     eine Spalte unter 768px (1×6). gap 16px.
   - Alle Karten GLEICH GROSS, uniform. Kein asymmetrisches Bento mit variablen
     Tile-Größen. Das Bento ist die Anordnung (3/2/1 responsive), nicht die Variabilität.
   - Sechs Karten sichtbar, alphabetisch sortiert (deutsche Collation):
     Jede Karte:
     · Container: 1px Border #E8E6E1, border-radius 8px, padding 24px,
       Background #FAFAF9. Min-height 8rem.
     · Vertikales Flex column, gap 8px (nicht 16px — zwei Text-Items
       bilden ein redaktionelles Paar, dichter ist besser):
       Oben: H3 Tool-Titel in Inter 600, 16px, line-height 1.35, letter-spacing -0.005em,
       Farbe #1A1917. Darf über zwei Zeilen brechen.
       Darunter: zwei-zeilige Tagline in Inter 400, 14px, line-height 1.5, Farbe #5C5A55.
     · Hover-State: border-color kippt auf #9C9A94, Background auf #FFFFFF,
       shadow lift auf 0 4px 8px rgba(26,25,23,0.08).
   - Karten-Inhalte (exakt diese sechs Live-Tools in dieser Reihenfolge):
     1. "Celsius in Fahrenheit umrechnen – Formel & Tabelle"
        — "Schnelle °C-zu-°F-Umrechnung mit affiner Formel — client-seitig, ohne Tracking."
     2. "Kilogramm in Pfund umrechnen – Formel & Tabelle"
        — "Präzise kg-zu-Pfund-Umrechnung in Sekunden — client-seitig, ohne Tracking."
     3. "Kilometer in Meilen umrechnen – Formel & Tabelle"
        — "Schnelle km-zu-Meilen-Umrechnung — client-seitig, ohne Tracking, ohne Upload."
     4. "Meter in Fuß umrechnen – Formel & Tabelle"
        — "Präzise Längen-Umrechnung in Sekunden — klient-seitig, ohne Tracking."
     5. "Quadratmeter in Quadratfuß umrechnen – Formel & Tabelle"
        — "Präzise m²-zu-ft²-Umrechnung mit vorquadriertem Faktor — client-seitig, ohne Tracking."
     6. "Zentimeter in Zoll umrechnen – Formel & Tabelle"
        — "Präzise cm-zu-Zoll-Umrechnung in Sekunden — client-seitig, ohne Tracking."

5. Footer, border-top 1px #E8E6E1, max-width 72rem, padding 32px 24px:
   - Grid drei Spalten auf ≥640px, eine Spalte unter 640px, gap 32px.
     Spalte 1 Heading "Werkzeuge" in Inter 600, 14px, Farbe #1A1917, darunter Liste:
       dieselben sechs Tool-Titel wie im Grid als Links (Inter 400, 14px, Farbe #5C5A55).
     Spalte 2 Heading "Rechtliches", darunter Liste (Farbe #9C9A94, disabled-Style,
       pointer-events none): "Datenschutz" · "Impressum".
     Spalte 3 Heading "Meta", darunter Liste (Farbe #5C5A55):
       "Sprache: DE" · "© 2026 Konverter".
   - Kein Copyright-Row unter den Spalten, kein Social-Icon-Row, keine Newsletter-Anmeldung.

Farb-Palette (strikt — hex-exakt aus tokens.css, NICHT approximieren):
- Background: #FFFFFF
- Surface: #FAFAF9
- Border: #E8E6E1
- Text primary: #1A1917
- Text muted: #5C5A55
- Text subtle: #9C9A94
- Accent graphite: #3A3733
Keine anderen Farben. Keine Pastelle, keine Blautöne, keine Gradients.

Typografie-Regeln:
- Display + Body: Inter (weights 400/500/600), self-hosted (keine Google-Fonts-CDN).
- Monospace: JetBrains Mono (Eyebrow, Count-Badge, kein Body, keine Navigation).
- Nie System-Fonts, nie Roboto, nie Arial, nie Serif, nie Lyon/Newsreader/Playfair.

Verbotene Elemente:
- Keine großen Drop-Shadows (max shadow-sm, opacity unter 0.06).
- Keine rounded-full Karten oder Buttons.
- Keine chromatischen Akzente auf Karten (kein farbiges Tag, kein "NEU"-Badge,
  kein Status-Dot, kein Pastell-Hintergrund).
- Kein Purple, kein Cyan, keine Gradients, kein Glassmorphism.
- Keine Per-Tool-Identity-Icons auf Karten (kein 48×48-Icon-Slot, kein
  Pencil-Sketch, kein Symbol, kein Monogramm). Tools werden ausschließlich
  durch Titel + Tagline identifiziert — der Name IST das Label. Gilt seit
  Runde 3 Session "No Tool Icons" (2026-04-20): Produktions-Aufwand bei
  1000+ Tools zu hoch, redaktionelle Ruhe wird durch Icon-Wiederholung
  gestört. Ausnahme: der 160×160-Hero-Icon auf Tool-Detail-Pages
  (`/de/<slug>/`), NICHT auf dieser Homepage.
- Keine Emojis, keine Stock-Fotos, keine Hero-Images, keine Illustrationen.
- Kein "Elevate", "Seamless", "Unleash", "Next-Gen" im Text.
- Keine asymmetrischen Bento-Tiles. Karten sind uniform.
- Kein Filter-Chip-Row oberhalb des Grids, kein Sortier-Dropdown, keine
  Ergebnis-Anzahl "Zeige 1-6 von 200", kein "Popular"-Hero-Block,
  kein "Beliebtestes Tool", kein Newsletter-CTA.

Gesamtwirkung: redaktionelle Ruhe, Graphit-Monochrom, Notion-artige Präzision,
dichte aber luftige Information, AAA-Kontrast. Die sechs Karten sind das einzige
aktive Element — keine Competing-CTAs, keine Dringlichkeit, keine Dekoration.`;

const client = new StitchToolClient({ apiKey: process.env.STITCH_API_KEY });

try {
  console.log(`→ Projekt ${PROJECT_ID} öffnen…`);
  const project = stitch.project(PROJECT_ID);

  console.log('→ Screen generieren (GEMINI_3_PRO, DESKTOP)… dies dauert 20–60 Sekunden.');
  const screen = await project.generate(PROMPT, 'DESKTOP', 'GEMINI_3_PRO');

  console.log(`✓ Screen generiert: ${screen.id}`);

  const [htmlUrl, imageUrl] = await Promise.all([
    screen.getHtml(),
    screen.getImage(),
  ]);

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outDir = join(OUT_ROOT, `${stamp}-${screen.id}`);
  await mkdir(outDir, { recursive: true });

  console.log('→ HTML + Screenshot herunterladen…');
  const [htmlRes, imgRes] = await Promise.all([
    fetch(htmlUrl),
    fetch(imageUrl),
  ]);
  if (!htmlRes.ok) throw new Error(`HTML download ${htmlRes.status}`);
  if (!imgRes.ok) throw new Error(`Image download ${imgRes.status}`);

  const html = await htmlRes.text();
  const imgBuf = Buffer.from(await imgRes.arrayBuffer());

  await writeFile(join(outDir, 'screen.html'), html, 'utf8');
  await writeFile(join(outDir, 'screen.png'), imgBuf);
  await writeFile(
    join(outDir, 'meta.json'),
    JSON.stringify(
      { projectId: PROJECT_ID, screenId: screen.id, createdAt: stamp, promptChars: PROMPT.length },
      null,
      2,
    ),
  );

  console.log(`\n✓ Gespeichert in ${outDir}/`);
  console.log(`  · screen.html  (${html.length} Bytes)`);
  console.log(`  · screen.png   (${imgBuf.length} Bytes)`);
  console.log(`\nStitch-Editor: https://stitch.withgoogle.com/project/${PROJECT_ID}`);
} catch (err) {
  if (err instanceof StitchError) {
    console.error(`✗ StitchError [${err.code}]: ${err.message}`);
    if (err.recoverable) console.error('  (recoverable)');
  } else {
    console.error('✗ Unerwarteter Fehler:', err?.message ?? err);
  }
  process.exit(1);
} finally {
  await client.close();
}
