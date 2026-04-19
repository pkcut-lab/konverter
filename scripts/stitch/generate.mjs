import { StitchToolClient, stitch, StitchError } from '@google/stitch-sdk';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const PROJECT_ID = process.env.STITCH_PROJECT_ID ?? '17885144393549343699';
const OUT_ROOT = 'stitch-output';

if (!process.env.STITCH_API_KEY || process.env.STITCH_API_KEY.startsWith('PASTE_')) {
  console.error('✗ STITCH_API_KEY nicht gesetzt.');
  process.exit(1);
}

const PROMPT = `Desktop-Detail-Page für ein Web-Tool namens "Hintergrund entfernen".
Das Tool lädt clientseitig ein Bild, rechnet im Browser (keine Uploads zum Server)
und zeigt das Ergebnis als freigestelltes PNG. Dieser Screen zeigt den RESULT-STATE:
Datei bereits verarbeitet, Vorher/Nachher-Vorschau und Download verfügbar.

Einzelner Viewport, linksbündiger redaktioneller Flow, keine Hero-Backgrounds.
Die gesamte Seite ist auf Deutsch — Header-Nav, Button-Text, Footer, alles.

Seitenstruktur (von oben nach unten):
1. Schmale Header-Leiste, 64px hoch, volle Breite, Background #FFFFFF:
   - Innerer Container max-width 72rem, horizontal padding 1.5rem, Flex vertikal zentriert.
   - LINKS: Wortmarke "Konverter" in Inter 600, 18px, Farbe #1F1D1B.
   - RECHTS innen: drei Text-Links in Inter 500, 14px, Farbe #6D6A66, gap 24px:
     "Werkzeuge" · "Über" · "Sprache ▾"
   - GANZ RECHTS: Theme-Toggle-Button, 32×32px quadratisch, 1px Border #E7E5E2,
     border-radius 6px, darin ein 16px Sonne-Icon (Stroke-Icon, kein Filled).
   - Unter dem Header eine dünne 1px Trennlinie #E7E5E2 über volle Breite.
   VERBOTEN im Header: "Sign In", "Log In", "Login", "Account", "Register",
   User-Avatar, Benachrichtigungs-Glocke, "Journal", "Archive", "API".
   Der Header hat genau VIER Elemente: Brand + 3 Links + Theme-Toggle.

2. H1 "Hintergrund entfernen" in Inter, 48px, weight 600, letter-spacing -0.02em, Farbe #1F1D1B.

3. Dezile-Zeile (14px, Farbe #6D6A66):
   "Browser-lokal. Kein Upload zum Server. DSGVO-ready."

4. Haupt-Card, border 1px solid #E7E5E2, border-radius 8px, padding 32px, background #FFFFFF:
   - Status-Badge oben rechts: Kbd-Chip "FERTIG" in JetBrains Mono 11px uppercase,
     tracking 0.05em, 1px Border, Background #F4F2EF, Farbe #3A3733.
   - Zwei-Spalten-Vorschau-Grid (gap 16px):
     Links (Label "Original" in JetBrains Mono 11px uppercase):
       Platzhalter-Bild 240×240px, graue Box, zeigt ein Portrait einer Person
       vor einem beliebigen Hintergrund. 1px Border, Radius 6px.
     Rechts (Label "Ergebnis" in JetBrains Mono 11px uppercase):
       Platzhalter-Bild 240×240px mit Schachbrett-Muster (Transparenz-Signal),
       darauf die freigestellte Person. 1px Border, Radius 6px.
   - Meta-Zeile unter Grid: "1240×1760px · PNG · 340 KB" in JetBrains Mono 12px, Farbe #6D6A66.
   - Action-Reihe am Card-Fuß, flex gap 12px:
     Primärer Button "Herunterladen" — solid Background #3A3733, Text weiß,
     padding 12px 20px, Radius 8px, Inter 500.
     Ghost-Button "Neues Bild" — transparent, 1px Border #E7E5E2, Farbe #1F1D1B.
     Ghost-Button "In Zwischenablage" — wie oben.

5. Sekundäre Meta-Zeile unter Card:
   Drei Kbd-Chips mit kleinen Pfeil-Icons: "↓ Download", "↺ Neu starten", "⎙ Kopieren".
   Jedes 1px Border, Radius 4px, padding 2px 8px, JetBrains Mono 12px.

6. Erklär-Abschnitt unterhalb, 40rem max-width:
   - H2 "So funktioniert es" in Inter 24px weight 500.
   - Drei nummerierte Punkte mit monospace Präfix "01", "02", "03":
     01  Bild per Drag & Drop oder Klick einfügen
     02  KI-Modell läuft lokal im Browser (ca. 2 Sekunden)
     03  PNG mit transparentem Hintergrund herunterladen
   - Kurzer Absatz zu Datenschutz: "Dein Bild verlässt den Browser nie."

7. Footer, 64px hoch, border-top 1px #E7E5E2:
   Links "Konverter" Wortmarke. Mitte "Datenschutz · Impressum · Kontakt".
   Rechts "© 2026 Konverter".

Farb-Palette (strikt):
- Background: #FFFFFF
- Surface: #F9F8F6
- Border: #E7E5E2
- Text primary: #1F1D1B
- Text secondary: #6D6A66
- Accent graphite: #3A3733
Keine anderen Farben. Keine Pastelle, keine Blautöne, keine Gradients.

Typografie-Regeln:
- Display + Body: Inter (weights 400/500/600).
- Monospace: JetBrains Mono (nur für Zahlen, Labels, Kbd).
- Nie System-Fonts, nie Roboto, nie Serif.

Verbotene Elemente:
- Keine großen Drop-Shadows (max shadow-sm, opacity unter 0.06).
- Keine rounded-full Cards oder Buttons.
- Kein Purple, kein Cyan, keine Gradients, kein Glassmorphism.
- Keine Emojis, keine Illustrationen, keine Hero-Images.
- Kein "Elevate", "Seamless", "Unleash", "Next-Gen" im Text.

Gesamtwirkung: redaktionelle Ruhe, Graphit-Monochrom, Notion-artige Präzision,
dichte aber luftige Information, AAA-Kontrast.`;

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
