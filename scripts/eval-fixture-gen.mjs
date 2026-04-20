#!/usr/bin/env node
// eval-fixture-gen.mjs — Batch 4: 20 pass + 20 fail Fixtures + annotations.yaml
//
// Deterministischer Generator. Re-Run erzeugt bit-identische Dateien,
// solange die Quellen-Arrays unten nicht editiert werden. Idempotent.
//
// Jede Fail-Fixture verletzt GENAU einen Check, damit der Runner-F1
// per-Check-Sensitivität messbar bleibt. Annotations listen den
// erwarteten Check explizit auf.

import { writeFileSync, readFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'evals/merged-critic/fixtures';
const REAL_HISTORY_ROOT = 'evals/merged-critic/real-history';
const ANNOT = 'evals/merged-critic/annotations.yaml';

// Real-History-Fail-Fixtures: verbatim pre-fix Blobs aus der Git-Historie.
// Provenance: git_sha = Fix-Commit, source_path = getroffene Datei.
// Expected-Checks wurden per manueller Inspektion des Blob-Inhalts gegen die
// 6-Check-Rubrik abgeleitet, NICHT vom Runner ausgelesen — so fällt F1 <1.0,
// falls der Runner etwas nicht detektiert, was laut Rubrik kaputt ist.
const REAL_HISTORY_FIXTURES = [
  {
    id: 'fail-real-01-session5-prototype',
    git_sha: 'a1b8f9b',
    source_path: 'src/content/tools/meter-zu-fuss/de.md',
    failing_checks: ['c-meta', 'c7-related', 'c11-nbsp'],
  },
  {
    id: 'fail-real-02-pre-migration-kilogramm-zu-pfund',
    git_sha: 'ab168ff',
    source_path: 'src/content/tools/kilogramm-zu-pfund/de.md',
    failing_checks: ['c-meta', 'c7-related', 'c11-nbsp'],
  },
  {
    id: 'fail-real-03-pre-migration-zentimeter-zu-zoll',
    git_sha: 'ab168ff',
    source_path: 'src/content/tools/zentimeter-zu-zoll/de.md',
    failing_checks: ['c-meta', 'c7-related', 'c11-nbsp'],
  },
  {
    id: 'fail-real-04-pre-category-hintergrund-entfernen',
    git_sha: '5fcbbf0',
    source_path: 'src/content/tools/hintergrund-entfernen/de.md',
    failing_checks: ['c-meta'],
  },
  {
    id: 'fail-real-05-pre-category-webp-konverter',
    git_sha: '5fcbbf0',
    source_path: 'src/content/tools/webp-konverter/de.md',
    failing_checks: ['c-meta'],
  },
];

const SLUGS_PASS = [
  { slug: 'meter-zu-fuss', title: 'Meter in Fuß umrechnen', unit_from: 'Meter', unit_to: 'Fuß', cat: 'length', cat_de: 'Längen' },
  { slug: 'zentimeter-zu-zoll', title: 'Zentimeter in Zoll umrechnen', unit_from: 'Zentimeter', unit_to: 'Zoll', cat: 'length', cat_de: 'Längen' },
  { slug: 'kilometer-zu-meilen', title: 'Kilometer in Meilen umrechnen', unit_from: 'Kilometer', unit_to: 'Meilen', cat: 'length', cat_de: 'Längen' },
  { slug: 'kilogramm-zu-pfund', title: 'Kilogramm in Pfund umrechnen', unit_from: 'Kilogramm', unit_to: 'Pfund', cat: 'weight', cat_de: 'Gewichts' },
  { slug: 'gramm-zu-unzen', title: 'Gramm in Unzen umrechnen', unit_from: 'Gramm', unit_to: 'Unzen', cat: 'weight', cat_de: 'Gewichts' },
  { slug: 'liter-zu-gallonen', title: 'Liter in Gallonen umrechnen', unit_from: 'Liter', unit_to: 'Gallonen', cat: 'volume', cat_de: 'Volumen' },
  { slug: 'milliliter-zu-unzen', title: 'Milliliter in Flüssig-Unzen umrechnen', unit_from: 'Milliliter', unit_to: 'Unzen', cat: 'volume', cat_de: 'Volumen' },
  { slug: 'celsius-zu-fahrenheit', title: 'Celsius in Fahrenheit umrechnen', unit_from: 'Celsius', unit_to: 'Fahrenheit', cat: 'temperature', cat_de: 'Temperatur' },
  { slug: 'quadratmeter-zu-quadratfuss', title: 'Quadratmeter in Quadratfuß umrechnen', unit_from: 'Quadratmeter', unit_to: 'Quadratfuß', cat: 'area', cat_de: 'Flächen' },
  { slug: 'hektar-zu-acres', title: 'Hektar in Acres umrechnen', unit_from: 'Hektar', unit_to: 'Acres', cat: 'area', cat_de: 'Flächen' },
  { slug: 'kubikmeter-zu-kubikfuss', title: 'Kubikmeter in Kubikfuß umrechnen', unit_from: 'Kubikmeter', unit_to: 'Kubikfuß', cat: 'volume', cat_de: 'Volumen' },
  { slug: 'megabyte-zu-gigabyte', title: 'Megabyte in Gigabyte umrechnen', unit_from: 'Megabyte', unit_to: 'Gigabyte', cat: 'data', cat_de: 'Daten' },
  { slug: 'kilojoule-zu-kilokalorien', title: 'Kilojoule in Kilokalorien umrechnen', unit_from: 'Kilojoule', unit_to: 'Kilokalorien', cat: 'energy', cat_de: 'Energie' },
  { slug: 'stunden-zu-minuten', title: 'Stunden in Minuten umrechnen', unit_from: 'Stunden', unit_to: 'Minuten', cat: 'time', cat_de: 'Zeit' },
  { slug: 'tage-zu-wochen', title: 'Tage in Wochen umrechnen', unit_from: 'Tage', unit_to: 'Wochen', cat: 'time', cat_de: 'Zeit' },
  { slug: 'kmh-zu-mph', title: 'Kilometer pro Stunde in Meilen pro Stunde umrechnen', unit_from: 'Kilometer pro Stunde', unit_to: 'Meilen pro Stunde', cat: 'speed', cat_de: 'Geschwindigkeits' },
  { slug: 'knots-zu-kmh', title: 'Knoten in Kilometer pro Stunde umrechnen', unit_from: 'Knoten', unit_to: 'Kilometer pro Stunde', cat: 'speed', cat_de: 'Geschwindigkeits' },
  { slug: 'bar-zu-psi', title: 'Bar in PSI umrechnen', unit_from: 'Bar', unit_to: 'PSI', cat: 'pressure', cat_de: 'Druck' },
  { slug: 'newton-zu-pfundkraft', title: 'Newton in Pfundkraft umrechnen', unit_from: 'Newton', unit_to: 'Pfundkraft', cat: 'force', cat_de: 'Kraft' },
  { slug: 'watt-zu-pferdestaerken', title: 'Watt in Pferdestärken umrechnen', unit_from: 'Watt', unit_to: 'Pferdestärken', cat: 'power', cat_de: 'Leistungs' },
];

// Lorem-ipsum-artiger Fülltext, ≥300 Wörter. NBSP als \u00A0.
function makeBody({ slug, unit_from, unit_to, cat_de }) {
  const nbsp = '\u00A0';
  return `## Was macht der Konverter?

Der Konverter wandelt einen Wert in ${unit_from} in die entsprechende Angabe in
${unit_to} um und zeigt gleichzeitig den Rückweg. Er eignet sich für jede
Rechnung, die zwischen den beiden Einheiten pendelt — vom Alltag bis zur
Planung. ${unit_from} in ${unit_to} umrechnen ist dank exakter Definition
seit Jahrzehnten eindeutig; der Rechner liefert präzise Ergebnisse ohne
Anmeldung, ohne Tracking und ohne Server-Upload.

## Umrechnungsformel

Ein ${unit_from} entspricht einem festgelegten Faktor in ${unit_to}. Die
Gegenrichtung ist seit internationaler Normung gelockt und gilt weltweit in
Wissenschaft, Technik und allgemeinem Sprachgebrauch. Vor der Normung
existierten leicht abweichende nationale Maße; seit dem Abkommen gilt ein
gemeinsamer Wert in allen Ländern, die sich dem Standard angeschlossen haben.

Rechen-Beispiel: 2${nbsp}${unit_from} werden mit dem Faktor multipliziert und
ergeben das Ergebnis in ${unit_to}. Auf zwei Nachkommastellen gerundet ist
das präzise genug für Alltag und Handwerk, zu grob für Präzisions-Anwendungen
wie Luftfahrt oder Vermessung. Wer exakt rechnet, behält alle Stellen und
rundet erst am Ende der Rechenkette, damit sich Rundungsfehler nicht summieren.

## Anwendungsbeispiele

Die folgende Tabelle zeigt gängige Werte in beiden Richtungen. Ein Wert von
5${nbsp}${unit_from} ergibt in ${unit_to} einen entsprechend skalierten
Wert; 10${nbsp}${unit_from} das Doppelte; 100${nbsp}${unit_from} das
Zwanzigfache. Die Umrechnung ist streng linear, daher kann jede Zeile durch
Skalierung aus jeder anderen abgeleitet werden.

## Häufige Fragen

Häufig gestellte Fragen zu diesem Konverter: Warum gibt es überhaupt zwei
verschiedene Einheiten? Historisch gewachsen, oft aus lokalen Maßsystemen, die
erst im 19. und 20. Jahrhundert international standardisiert wurden. Warum
verwenden manche Länder noch nicht-metrische Einheiten? Tradition, Industrie-
Interoperabilität und schiere Umstellungs-Kosten verhindern den vollständigen
Wechsel. Wie präzise ist dieser Rechner? Intern rechnet er mit
doppeltgenauen Gleitkommazahlen; die Anzeige rundet auf sinnvolle Stellen. Läuft
alles im Browser? Ja, jede Rechnung passiert lokal auf deinem Gerät; kein
Server sieht deine Eingaben. Kann ich Ergebnisse teilen? Per Link mit Parameter
lässt sich der aktuelle Wert direkt weitergeben, ohne Kopieren und Einfügen.

## Verwandte ${cat_de}-Tools

Weitere ${cat_de.toLowerCase()}-Konverter aus unserer Sammlung:

- [Zweites ${cat_de}-Tool](/de/example-two)
- [Drittes ${cat_de}-Tool](/de/example-three)
- [Viertes ${cat_de}-Tool](/de/example-four)
`;
}

function makeFrontmatter({ slug, title, unit_from, unit_to, cat }, overrides = {}) {
  const fm = {
    toolId: slug.replace(/-/g, '_'),
    language: 'de',
    title: `${title} – Formel & Tabelle`,
    headingHtml: `${title.replace(unit_to, `<em>${unit_to}</em>`)}`,
    metaDescription: `${title}: exakte Formel, Tabelle gängiger Werte und FAQ. Ohne Anmeldung, ohne Ads.`,
    tagline: `Präzise ${unit_from}-zu-${unit_to}-Umrechnung in Sekunden — klient-seitig, ohne Tracking.`,
    intro: `Der Konverter wandelt einen Wert in ${unit_from} in die entsprechende Angabe in ${unit_to} um und zeigt gleichzeitig den Rückweg.`,
    category: cat,
    contentVersion: 1,
    ...overrides,
  };
  const lines = ['---'];
  for (const [k, v] of Object.entries(fm)) {
    if (v === null || v === undefined) continue;
    if (typeof v === 'number') {
      lines.push(`${k}: ${v}`);
    } else {
      const escaped = String(v).replace(/"/g, '\\"');
      lines.push(`${k}: "${escaped}"`);
    }
  }
  lines.push('---', '');
  return lines.join('\n');
}

function buildPassFixture(slug_info) {
  return makeFrontmatter(slug_info) + makeBody(slug_info);
}

// Fail-Mutators — jeder injiziert GENAU einen Check-Fail.
const FAIL_MUTATORS = [
  // c-meta (5): je ein fehlendes Pflichtfeld
  { id: 'meta-missing-toolid', check: 'c-meta',
    mutate: (s) => ({ fm: makeFrontmatter(s, { toolId: null }), body: makeBody(s) }) },
  { id: 'meta-missing-language', check: 'c-meta',
    mutate: (s) => ({ fm: makeFrontmatter(s, { language: null }), body: makeBody(s) }) },
  { id: 'meta-missing-metadesc', check: 'c-meta',
    mutate: (s) => ({ fm: makeFrontmatter(s, { metaDescription: null }), body: makeBody(s) }) },
  { id: 'meta-missing-tagline', check: 'c-meta',
    mutate: (s) => ({ fm: makeFrontmatter(s, { tagline: null }), body: makeBody(s) }) },
  { id: 'meta-missing-category', check: 'c-meta',
    mutate: (s) => ({ fm: makeFrontmatter(s, { category: null }), body: makeBody(s) }) },

  // c3-hex (5): verschiedene Hex-Codes im Body
  { id: 'hex-inline-3chars', check: 'c3-hex',
    mutate: (s) => ({ fm: makeFrontmatter(s),
      body: makeBody(s).replace('## Was macht der Konverter?',
        '## Was macht der Konverter?\n\nFarbe im Body: #fa7 als Accent-Ton.\n') }) },
  { id: 'hex-inline-6chars', check: 'c3-hex',
    mutate: (s) => ({ fm: makeFrontmatter(s),
      body: makeBody(s).replace('## Umrechnungsformel',
        'Hintergrund #F5F5F5 wäre falsch.\n\n## Umrechnungsformel') }) },
  { id: 'hex-uppercase', check: 'c3-hex',
    mutate: (s) => ({ fm: makeFrontmatter(s),
      body: makeBody(s).replace('## Anwendungsbeispiele',
        'Farbton: #1A1A1A — direkt statt Token.\n\n## Anwendungsbeispiele') }) },
  { id: 'hex-8chars-alpha', check: 'c3-hex',
    mutate: (s) => ({ fm: makeFrontmatter(s),
      body: makeBody(s).replace('## Häufige Fragen',
        'Overlay: #00000080 halbtransparent.\n\n## Häufige Fragen') }) },
  { id: 'hex-mixed-case', check: 'c3-hex',
    mutate: (s) => ({ fm: makeFrontmatter(s),
      body: makeBody(s).replace('Die folgende Tabelle',
        'Rahmen-Farbe #Ab12Cd direkt gehardcoded.\n\nDie folgende Tabelle') }) },

  // c4-arb-px (3)
  { id: 'arbpx-padding', check: 'c4-arb-px',
    mutate: (s) => ({ fm: makeFrontmatter(s),
      body: makeBody(s).replace('## Umrechnungsformel',
        'Wir setzen Padding auf `p-[24px]` direkt.\n\n## Umrechnungsformel') }) },
  { id: 'arbpx-width', check: 'c4-arb-px',
    mutate: (s) => ({ fm: makeFrontmatter(s),
      body: makeBody(s).replace('## Anwendungsbeispiele',
        'Komponenten-Breite: [375px] hardcoded.\n\n## Anwendungsbeispiele') }) },
  { id: 'arbpx-decimal', check: 'c4-arb-px',
    mutate: (s) => ({ fm: makeFrontmatter(s),
      body: makeBody(s).replace('## Häufige Fragen',
        'Rahmen [0.5px] hauchdünn.\n\n## Häufige Fragen') }) },

  // c8-words (4): Body gekürzt
  { id: 'words-150', check: 'c8-words',
    mutate: (s) => ({ fm: makeFrontmatter(s),
      body: `## Was macht der Konverter?\n\nKurzer Absatz mit rund fünfzig Wörtern als Platzhalter, der absichtlich zu wenig Inhalt enthält und damit die Mindest-Schwelle von dreihundert Wörtern deutlich unterschreitet, damit der Word-Count-Check ihn ablehnt.\n\n## Verwandte ${s.cat_de}-Tools\n\n- [a](/de/a)\n- [b](/de/b)\n- [c](/de/c)\n` }) },
  { id: 'words-250', check: 'c8-words',
    mutate: (s) => ({ fm: makeFrontmatter(s),
      body: `## Was macht der Konverter?\n\n${'Kurzer Satz. '.repeat(40)}\n\n## Verwandte ${s.cat_de}-Tools\n\n- [a](/de/a)\n- [b](/de/b)\n- [c](/de/c)\n` }) },
  { id: 'words-100', check: 'c8-words',
    mutate: (s) => ({ fm: makeFrontmatter(s),
      body: `## Was macht der Konverter?\n\n${'Ein Wort. '.repeat(20)}\n\n## Verwandte ${s.cat_de}-Tools\n\n- [a](/de/a)\n- [b](/de/b)\n- [c](/de/c)\n` }) },
  { id: 'words-299', check: 'c8-words',
    mutate: (s) => ({ fm: makeFrontmatter(s),
      body: `## Was macht der Konverter?\n\n${'knapp daneben '.repeat(48)}\n\n## Verwandte ${s.cat_de}-Tools\n\n- [a](/de/a)\n- [b](/de/b)\n- [c](/de/c)\n` }) },

  // c11-nbsp (3): Einheiten mit regulärem Space (harte Injection, slug-unabhängig)
  { id: 'nbsp-meter', check: 'c11-nbsp',
    mutate: (s) => ({ fm: makeFrontmatter(s),
      body: makeBody(s).replace('## Anwendungsbeispiele',
        'Vergleichswert: 12 m ohne NBSP zeigt den Fehler.\n\n## Anwendungsbeispiele') }) },
  { id: 'nbsp-kg', check: 'c11-nbsp',
    mutate: (s) => ({ fm: makeFrontmatter(s),
      body: makeBody(s).replace('Die folgende Tabelle',
        'Zusatz: 5 kg sind ein Wert ohne NBSP.\n\nDie folgende Tabelle') }) },
  { id: 'nbsp-ft', check: 'c11-nbsp',
    mutate: (s) => ({ fm: makeFrontmatter(s),
      body: makeBody(s).replace('## Häufige Fragen',
        'Referenz: 100 ft in imperialer Notation ohne NBSP.\n\n## Häufige Fragen') }) },
];

function buildFailFixture(mutator, slug_info) {
  const { fm, body } = mutator.mutate(slug_info);
  return fm + body;
}

function writeAnnotations(rows) {
  const lines = [
    '# evals/merged-critic/annotations.yaml',
    '# Auto-generiert von scripts/eval-fixture-gen.mjs — nicht manuell editieren.',
    '# fixture-id → { verdict: pass|fail, failing_checks: [ids], source?, git_sha? }',
    '',
  ];
  for (const r of rows) {
    lines.push(`${r.id}:`);
    lines.push(`  verdict: ${r.verdict}`);
    if (r.failing_checks?.length) {
      lines.push('  failing_checks:');
      for (const c of r.failing_checks) lines.push(`    - ${c}`);
    } else {
      lines.push('  failing_checks: []');
    }
    if (r.source) lines.push(`  source: ${r.source}`);
    if (r.git_sha) lines.push(`  git_sha: ${r.git_sha}`);
    if (r.source_path) lines.push(`  source_path: ${r.source_path}`);
  }
  return lines.join('\n') + '\n';
}

function main() {
  const passDir = join(ROOT, 'pass');
  const failDir = join(ROOT, 'fail');

  // Clean regenerate
  if (existsSync(passDir)) rmSync(passDir, { recursive: true, force: true });
  if (existsSync(failDir)) rmSync(failDir, { recursive: true, force: true });
  mkdirSync(passDir, { recursive: true });
  mkdirSync(failDir, { recursive: true });

  const annotations = [];

  // 20 pass fixtures
  for (let i = 0; i < 20; i += 1) {
    const info = SLUGS_PASS[i];
    const id = `pass-${String(i + 1).padStart(2, '0')}-${info.slug}`;
    writeFileSync(join(passDir, `${id}.md`), buildPassFixture(info));
    annotations.push({ id, verdict: 'pass', failing_checks: [] });
  }

  // 20 fail fixtures (FAIL_MUTATORS ist genau 20 lang)
  for (let i = 0; i < FAIL_MUTATORS.length; i += 1) {
    const mutator = FAIL_MUTATORS[i];
    const slug_info = SLUGS_PASS[i % SLUGS_PASS.length];
    const id = `fail-${String(i + 1).padStart(2, '0')}-${mutator.id}`;
    writeFileSync(join(failDir, `${id}.md`), buildFailFixture(mutator, slug_info));
    annotations.push({ id, verdict: 'fail', failing_checks: [mutator.check], source: 'synthetic' });
  }

  // Real-History-Fail-Fixtures: Blobs aus REAL_HISTORY_ROOT nach fail/ spiegeln.
  for (const rh of REAL_HISTORY_FIXTURES) {
    const src = join(REAL_HISTORY_ROOT, `${rh.id}.md`);
    if (!existsSync(src)) {
      throw new Error(`Real-history fixture missing: ${src}`);
    }
    writeFileSync(join(failDir, `${rh.id}.md`), readFileSync(src, 'utf8'));
    annotations.push({
      id: rh.id,
      verdict: 'fail',
      failing_checks: rh.failing_checks,
      source: 'real-history',
      git_sha: rh.git_sha,
      source_path: rh.source_path,
    });
  }

  writeFileSync(ANNOT, writeAnnotations(annotations));
  const nPass = annotations.filter((a) => a.verdict === 'pass').length;
  const nFail = annotations.filter((a) => a.verdict === 'fail').length;
  const nReal = annotations.filter((a) => a.source === 'real-history').length;
  console.log(`Generated ${nPass} pass + ${nFail} fail (${nReal} real-history) → ${ROOT}`);
  console.log(`Annotations → ${ANNOT}`);
}

if (process.argv[1]?.endsWith('eval-fixture-gen.mjs')) {
  main();
}
