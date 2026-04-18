# CONTENT — SEO-Schreibstil Rulebook (Deutsche Master)

**Status:** v1 — Session-4-Prep-Version, gültig für Phase 0 Prototypen.
**Finalisierung:** nach Session-6-Review.
**Scope:** Bindend für alle deutschsprachigen Tool-Seiten (Phase 0–2). EN/ES/FR/PT-BR
folgen in Phase 3 per `TRANSLATION.md` (Pivot DE → EN → Rest).
**Zielgruppe:** Claude-Sessions UND Human-Writer. Wer dieses Rulebook befolgt,
produziert in einem Pass Content, der die Build-Quality-Gates (Spec Section 8.5)
passiert.

Grundlage: Spec Section 10.5 + Section 8.1 + Section 12. Bei Konflikt gewinnt die
Spec — dieses Dokument präzisiert, es überschreibt nicht.

---

## 1. Heading-Struktur pro Tool-Seite

Jede Tool-Seite folgt dieser H1/H2-Kaskade. Die Reihenfolge ist in Phase 0 gelockt.

- **H1** — Tool-Name als deutsche Such-Intent-Phrase
  Beispiel: `Meter in Fuß umrechnen` (nicht `Meter-zu-Fuß-Konverter`).
  H1 erscheint genau einmal. Wird von der Astro-Layout-Komponente aus dem
  `title`-Frontmatter gesetzt (30–60 Zeichen).
- **H2: Was macht der Konverter?** — 2–3 Sätze, Answer-First. Nennt Ausgangs- und
  Zieleinheit und das primäre Ergebnis.
- **H2: Umrechnungsformel** — Formel als Inline-Text oder Code-Zeile, KEIN LaTeX.
  Rechen-Beispiel und offizielle Definition (`1 Fuß = 0,3048 m exakt seit 1959`).
- **H2: Anwendungsbeispiele** — Tabelle mit 6–8 gängigen Werten, beide Richtungen.
  1–2 erklärende Sätze davor.
- **H2: Häufige Einsatzgebiete** — 2–4 reale Kontexte (Bauwesen, Luftfahrt,
  US-Immobilien etc.). Je 2–4 Sätze.
- **H2: Häufige Fragen** — 3–5 FAQ-Einträge (siehe §7). Strukturiertes
  `schema.org/FAQPage` JSON-LD wird automatisch aus dem Frontmatter-`faq`-Block
  generiert.
- **H2: Verwandte Konverter** — 2–4 Links zu thematisch benachbarten Tools
  (siehe §8).

H3 nur verwenden, wenn eine H2-Sektion faktisch in Untersektionen zerfällt
(z. B. `### Internationaler Fuß` vs. `### US-Survey-Foot`). Kein H3 ohne H2 davor —
der Build-Lint warnt (Spec Section 8.5).

**Warum gelockt:** SEO-Muster-Analyse zeigt diese Sequenz als Answer-First-Struktur,
die Google für Konverter-Queries priorisiert. Abweichungen kosten Position ohne
UX-Gewinn. Für Nicht-Konverter-Typen (Generator, Validator, Analyzer …) darf die
H2-Liste inhaltlich abweichen, behält aber das Muster „Was/Wie/Beispiele/FAQ/
Verwandte“.

---

## 2. Wortzahl

- **Minimum:** 300 Wörter im Body (H2-Sektionen zusammen, exklusive H1).
  `<300` wird abgelehnt (Non-Negotiable #8, Spec Section 12.5).
- **Ziel Phase-0-Prototypen:** 500–700 Wörter. Gibt Spielraum für vollständige
  Formel-Herleitung und 3–5 FAQ-Einträge.
- **Ziel Phase-2-Skalierung:** 400 Wörter (Sweetspot aus Spec Section 8.1).
- **Weiche Obergrenze:** ~800 Wörter. Mehr Text = User scrollt nicht. Ausnahme:
  Unique-Tools (Regex-Visualizer, Impressum-Generator) dürfen über 800, wenn
  Komplexität es rechtfertigt.

Der Build prüft `seoArticle` gegen 350–450 Wörter als Warnung, kein Abbruch
(Spec Section 8.5). Für Prototypen-Phase ist ein Drift auf 500–700 erwartbar.

---

## 3. Keyword-Strategie

- **Primary-Keyword** = H1-Phrase (`Meter in Fuß umrechnen`). Erscheint in H1, im
  ersten Satz nach H1, in der Meta-Description und in der Überschrift der
  Anwendungsbeispiele-Sektion, wenn natürlich passend.
- **Secondary-Keywords** = Varianten, die echte User tippen — ableitbar aus Google
  Autosuggest und „People also ask“. Beispiele für Meter-zu-Fuß:
  `meter fuß`, `wieviel fuß ist ein meter`, `ft in m`. Mindestens zwei davon
  einmal im Body.
- **Density-Korridor:** 0,8 – 1,5 % für das Primary-Keyword im Body
  (enforced via Build-Lint, Spec Section 8.5). Darunter = zu versteckt, darüber =
  Stuffing.
- **Such-Intent ist deutsch**, nicht englisch. User sucht `meter in fuß`, nicht
  `meters to feet`. Schreibe für die deutsche Phrase.
- **Varianz statt Wiederholung.** Nutze Synonyme (`umrechnen`, `konvertieren`,
  `wandeln`, `umwandeln`) rhythmisch, damit keine einzelne Phrase auffällig oft
  erscheint.

---

## 4. Verbotene Phrasen

LLM-Floskeln, Marketing-Staub und englische Begeisterungs-Wörter werden beim
optionalen Audit-Pass gegen Tone gecheckt (Spec Section 8.4).

**Blacklist:**

- `in der heutigen digitalen Welt`, `in unserer modernen Zeit`
- `es ist wichtig zu beachten`, `es ist erwähnenswert`, `nicht zu vergessen`
- `willkommen bei …`, `in diesem Artikel …`, `dieser Guide zeigt dir …`
- `mit unserem praktischen Tool`, `unser benutzerfreundlicher Konverter`
- `jetzt noch nie war es so einfach`, `die ultimative Lösung`
- Superlativ-Spam: `der beste`, `einzigartig`, `revolutionär`, `bahnbrechend`
- Englische Begeisterungs-Wörter: `awesome`, `amazing`, `powerful`, `seamless`
- `wir` / `unser Tool` — die Seite spricht nicht als Kollektiv
- Rhetorische Eröffnungsfragen: `Hast du dich schon mal gefragt …`

**Statt dessen:** Direkt zur Sache. `Ein Meter entspricht 3,28084 Fuß.`

---

## 5. Tonalität

- **Präzise, faktisch, deutsch-nüchtern.** Kurze Hauptsätze.
- **Aktiv statt passiv.** `Der Konverter rechnet …` statt `Es wird umgerechnet …`.
- **Anrede: Du** (informell, konsistent mit Spec Section 10.5). Groß oder klein
  `Du/du` — egal, aber konsistent innerhalb einer Seite.
- **Keine Emojis.** Keine Ausrufezeichen außer in direkten Zitaten.
- **Keine Superlative ohne Beleg.** Statt `am genauesten` → `exakt seit 1959
  definiert`.
- **Kein Meta-Talk.** Keine Selbstreferenz auf den Text (`wie oben beschrieben`,
  `im folgenden Abschnitt`). Absätze müssen eigenständig lesbar sein, User
  springt.

---

## 6. Einheiten, Zahlen, Notation

- **SI-Einheiten ausschreiben bei Erstnennung**, danach Kürzel:
  `Meter (m)`, danach `m`. `Fuß (ft)`, danach `ft`.
- **Dezimalkomma** deutsch: `3,28084`. Niemals `3.28084` im deutschen Text.
- **Tausender-Punkt**: `10.000 Meter`. Keine US-Kommas.
- **Einheit mit Leerzeichen**: `3,28 m` (Spec Section 10.5 — normales Space, kein
  `&nbsp;` im Markdown nötig).
- **Formeln als Inline-Text oder Code-Zeile**, nicht LaTeX:
  `1 Meter = 3,28084 Fuß` oder ``` `1 m = 3,28084 ft` ```.
- **Rundung:** in Beispieltabellen 2–4 Nachkommastellen, je nach Größenordnung.
  Nicht mehr Präzision vortäuschen, als der Input hergibt.
- **Bindestriche:** typographische Halbgeviertstriche (`–`) für Zahlenbereiche
  (`6–8 Werte`), Viertelgeviertstriche (`-`) für Wort-Bindung (`Answer-First`).

---

## 7. FAQ-Sektion

- **3–5 Fragen.** Weniger wirkt dünn, mehr lenkt ab. Der Build-Lint warnt
  außerhalb von 4–6 (Spec Section 8.5) — Phase 0 darf am unteren Rand liegen.
- **Jede Antwort:** erster Satz = direkte Zahl oder direkte Antwort; dann 1–2
  Sätze Kontext. Kein Smalltalk-Vorspann.
- **Fragen sind echte Such-Queries**, keine rhetorischen Konstrukte. Ableitbar
  aus `People also ask` und AnswerThePublic.
- **Frage-Format:** direkte Frage mit Fragezeichen. Kein `Q:`-Prefix.
- **Pro Tool mindestens eine Frage**, die die Primary-Umrechnung direkt
  beantwortet (`Wie viele Fuß sind ein Meter?`).

Strukturierte Daten (JSON-LD `FAQPage`) werden automatisch aus dem `faq`-Block
der Frontmatter generiert (Spec Section 12.1).

---

## 8. Internal-Link-Policy

- **2–4 Links pro Seite** zu verwandten Tools. (Spec Section 12.4 nennt 3–5;
  Phase-0-Korridor ist 2–4, weil Prototypen wenige Nachbarn haben.)
- **Beschreibende Anchor-Texte.** Gut: `Zentimeter in Zoll`. Schlecht: `hier
  klicken`, `mehr erfahren`, `dieses Tool`.
- **Verwandtschaft ist semantisch.** Meter-zu-Fuß ist verwandt mit Zentimeter-zu-
  Zoll (beides Länge, metrisch ↔ imperial), nicht mit Meter-zu-Liter.
- **Kein Gegen-Link-Zwang.** Relationen sind asymmetrisch; A → B bedingt nicht
  B → A.
- **Format im Content-Draft:** Markdown-Links mit vollständiger Route:
  `[Zentimeter in Zoll](/de/zentimeter-zu-zoll)`. Slug-Konsistenz prüft der Build.
- **Nicht-existierende Slugs** im Draft sind Platzhalter. Der Build fängt sie via
  `relatedTools`-Slug-Check ab (Spec Section 8.5). In Prototypen-Phase dürfen bis
  zu 3 Platzhalter stehen, solange die Route der späteren Konvention
  (`/de/<slug>`) entspricht.

---

## 9. Meta-Description

- **Länge:** 140–160 Zeichen inklusive Leerzeichen. Darunter = verschenktes
  Snippet, darüber = Google kürzt (Spec Section 8.1).
- **Struktur:** Wertversprechen zuerst, Primary-Keyword früh, kein Call-to-Action
  à la `Jetzt konvertieren!`.
- **Beispiel (149 Zeichen):**
  `Meter in Fuß umrechnen: exakte Formel, Tabelle gängiger Werte und FAQ zu
  internationalem vs. US-Survey-Fuß. Ohne Anmeldung, ohne Ads.`
- **Keine Dopplung** zu H1 oder Intro — die Meta ist das Schaufenster in der SERP.

---

## 10. Alt-Texte für Icons

Pencil-Sketch-Icons haben pro Tool ein Alt-Attribut nach diesem Schema:

`Pencil-Sketch-Icon von {Motiv}`

- **Motiv ist tool-spezifisch.** Meter-zu-Fuß → `Pencil-Sketch-Icon von Maßband
  neben Fußabdruck`. WebP-Konverter → `Pencil-Sketch-Icon von gestapelten
  Bild-Dateien`.
- **Sprach-Varianten folgen der Seitensprache** — deutsch auf DE-Seiten, englisch
  auf EN-Seiten — gleiches Schema.
- **Kein `Bild von …`, kein `Icon:`-Präfix.** Das `Pencil-Sketch-Icon`-Wording
  ist bewusst, weil es Google Images mit dem visuellen Stil matcht.
- **Alt ist nicht Title.** Title-Attribute bleiben leer (kein Tooltip-Noise).

---

## 11. Was NICHT in den Content gehört

- **Keine Frontmatter im Draft in Phase 0.** Das Zod-Schema für Frontmatter
  entsteht in Session 4. Content-Drafts bis dahin sind reine Markdown-Abschnitte.
- **Keine Code-Blöcke mit Implementierung.** Der Konverter ist die Komponente —
  der Text erklärt Einheit und Formel, nicht JavaScript.
- **Keine externen Links** außer zu offiziellen Normungs-Quellen (BIPM, NIST).
  Keine Wikipedia-Sprays.
- **Keine Bilder außer Tool-Icon.** Spart LCP-Budget (Core Web Vitals Target
  LCP < 1,5 s).
- **Keine Affiliate-Erwähnungen, keine Produktvergleiche.** Konverter sind
  neutral.

---

## 12. Single-Pass-Checkliste

Wer diesen Pass befolgt, passiert die Build-Gates:

1. H1 = deutsche Such-Intent-Phrase, genau einmal.
2. H2-Sequenz exakt wie §1.
3. Body 300–800 Wörter (Ziel 500–700 für Prototypen).
4. Primary-Keyword-Density 0,8 – 1,5 %.
5. Keine Blacklist-Phrase aus §4.
6. Dezimalkomma, SI-Einheit ausgeschrieben bei Erstnennung.
7. 3–5 FAQ, jede Antwort beginnt mit Fakt.
8. 2–4 Internal-Links mit beschreibendem Anchor.
9. Meta-Description 140–160 Zeichen (kommt aus Frontmatter ab S4; im Phase-0-
   Draft optional als Kommentar am Dateiende).
10. Alt-Text-Schema `Pencil-Sketch-Icon von {Motiv}` pro Tool dokumentiert.
