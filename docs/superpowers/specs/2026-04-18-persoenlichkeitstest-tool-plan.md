# Persönlichkeitstest-Tool — Konzept & Implementierungsplan

**Datum:** 2026-04-18
**Kontext:** Integration in die Konverter-Webseite (Spec v1.1)
**Referenz:** Inspiriert von 16personalities.com, basierend auf dem öffentlich zugänglichen IPIP Big Five Framework
**Tool-Typ:** Typ 9 — Interactive (kontinuierliche State-Manipulation → exportierbarer State)

---

## 1. Executive Summary

Ein kostenloser, 100% client-seitiger Persönlichkeitstest auf der Konverter-Webseite, der auf dem **IPIP Big Five / OCEAN-Modell** (öffentlicher Domain, wissenschaftlich validiert) basiert. Der Nutzer beantwortet 60 Fragen, bekommt ein visuelles Ergebnis-Dashboard mit 5 Hauptdimensionen und kann sein Ergebnis als Bild/PDF teilen. Kein Server, kein Account, keine Datenspeicherung — komplett im Browser.

**Warum das perfekt zum Konverter-Projekt passt:**
- Extrem hohes SEO-Potenzial (Suchvolumen "Persönlichkeitstest kostenlos" liegt bei 100k+/Monat DE)
- Virales Sharing-Potenzial (Nutzer teilen ihr Ergebnis → organischer Traffic)
- Tool-Typ 9 (Interactive) — erweitert die Tool-Palette
- 100% client-side — konform mit Non-Negotiable #7
- Kein urheberrechtliches Risiko — IPIP ist Public Domain

---

## 2. Psychologischer Hintergrund

### 2.1 Warum NICHT MBTI (Myers-Briggs)

16personalities.com nutzt ein **hybrides Modell**: Sie zeigen MBTI-artige 4-Buchstaben-Codes (INTJ, ENFP etc.), rechnen aber intern mit einem Big-Five-ähnlichen 5-Dimensionen-Spektrum. Das MBTI-System selbst ist **urheberrechtlich geschützt** (The Myers-Briggs Company) und wissenschaftlich umstritten (niedrige Test-Retest-Reliabilität, forcierte Dichotomien).

### 2.2 Warum Big Five / OCEAN (unser Ansatz)

Das **Big Five / Five-Factor Model** (auch: OCEAN) ist:
- Der **wissenschaftliche Goldstandard** in der Persönlichkeitspsychologie
- **Public Domain** — keine Lizenzprobleme
- **Spektrum-basiert** statt Kategorien → ehrlichere, nuanciertere Ergebnisse
- Über den **IPIP (International Personality Item Pool)** frei verfügbar mit validierten Fragen

### 2.3 Die 5 Dimensionen (OCEAN)

| Dimension | Deutsch | Hoher Wert | Niedriger Wert |
|-----------|---------|------------|----------------|
| **O** — Openness | Offenheit für Erfahrungen | Kreativ, neugierig, intellektuell, experimentierfreudig | Praktisch, konventionell, routineorientiert |
| **C** — Conscientiousness | Gewissenhaftigkeit | Organisiert, diszipliniert, zuverlässig, zielstrebig | Spontan, flexibel, sorglos |
| **E** — Extraversion | Extraversion | Gesellig, energiegeladen, gesprächig, durchsetzungsstark | Ruhig, zurückhaltend, reflektierend, eigenständig |
| **A** — Agreeableness | Verträglichkeit | Kooperativ, einfühlsam, hilfsbereit, vertrauend | Wettbewerbsorientiert, skeptisch, direkt |
| **N** — Neuroticism | Neurotizismus (emotionale Labilität) | Sensibel, ängstlich, stressanfällig, emotional reaktiv | Emotional stabil, gelassen, belastbar |

### 2.4 Die 30 Facetten (je 6 pro Dimension)

Jede der 5 Hauptdimensionen unterteilt sich in 6 Facetten für granulare Ergebnisse:

**Offenheit (O):**
1. Vorstellungskraft (Fantasy/Imagination)
2. Ästhetik (Artistic Interests)
3. Gefühle / Emotionale Offenheit (Emotionality)
4. Abenteuerlust (Adventurousness)
5. Intellekt (Intellect)
6. Liberalismus / Offenheit für Werte (Liberalism)

**Gewissenhaftigkeit (C):**
1. Selbstwirksamkeit (Self-Efficacy)
2. Ordnungsliebe (Orderliness)
3. Pflichtbewusstsein (Dutifulness)
4. Leistungsstreben (Achievement-Striving)
5. Selbstdisziplin (Self-Discipline)
6. Besonnenheit (Cautiousness)

**Extraversion (E):**
1. Freundlichkeit (Friendliness)
2. Geselligkeit (Gregariousness)
3. Durchsetzungsvermögen (Assertiveness)
4. Aktivitätsniveau (Activity Level)
5. Erlebnishunger (Excitement-Seeking)
6. Heiterkeit / Positive Emotionen (Cheerfulness)

**Verträglichkeit (A):**
1. Vertrauen (Trust)
2. Moral (Morality)
3. Altruismus (Altruism)
4. Kooperationsbereitschaft (Cooperation)
5. Bescheidenheit (Modesty)
6. Mitgefühl (Sympathy)

**Neurotizismus (N):**
1. Ängstlichkeit (Anxiety)
2. Reizbarkeit (Anger/Hostility)
3. Depression (Depression)
4. Befangenheit (Self-Consciousness)
5. Maßlosigkeit (Immoderation)
6. Verletzlichkeit (Vulnerability)

---

## 3. Test-Design

### 3.1 Fragenformat

**60 Fragen** (IPIP-basiert, 12 pro Dimension, 2 pro Facette):
- Jede Frage ist eine Selbstbeschreibung in Ich-Form
- Antwort auf einer **7-Punkt-Likert-Skala** (Slider oder Button-Reihe)
- Ca. 50% der Fragen sind "reverse-keyed" (invertiert codiert)

**Antwort-Optionen:**
| Wert | Label |
|------|-------|
| 1 | Stimme überhaupt nicht zu |
| 2 | Stimme nicht zu |
| 3 | Stimme eher nicht zu |
| 4 | Neutral |
| 5 | Stimme eher zu |
| 6 | Stimme zu |
| 7 | Stimme voll und ganz zu |

### 3.2 Beispiel-Fragen (Original-Formulierungen für unsere Plattform)

> **Wichtig:** Alle Fragen müssen **eigene Original-Formulierungen** sein, die auf den IPIP-Item-Konstrukten basieren, aber nicht 1:1 von 16personalities oder anderen kommerziellen Tests übernommen werden.

**Extraversion:**
- "Ich fühle mich in großen Gruppen wohl und genieße es, im Mittelpunkt zu stehen." (+E)
- "Auf Partys halte ich mich lieber im Hintergrund." (-E, reversed)
- "Ich bin meistens diejenige Person, die in einer Gruppe das Gespräch beginnt." (+E)
- "Nach einem langen Tag unter Menschen brauche ich dringend Zeit allein, um meine Energie wieder aufzuladen." (-E, reversed)
- "Ich bin begeistert von neuen sozialen Situationen und lerne gern neue Menschen kennen." (+E)
- "Ich bevorzuge tiefe Einzelgespräche gegenüber Small Talk in Gruppen." (-E, reversed)
- "Mein Energielevel steigt, wenn ich unter Menschen bin." (+E)
- "Ich bin eher still und beobachtend in Meetings oder Diskussionen." (-E, reversed)
- "Ich mache gerne Pläne für Aktivitäten mit Freunden." (+E)
- "Ich verbringe meine freie Zeit am liebsten allein mit einem Buch oder Hobby." (-E, reversed)
- "Mir fällt es leicht, Fremde in ein Gespräch zu verwickeln." (+E)
- "Ich fühle mich nach langen Networking-Events erschöpft." (-E, reversed)

**Offenheit für Erfahrungen:**
- "Ich habe eine lebhafte Vorstellungskraft und tagträume häufig." (+O)
- "Ich bevorzuge klare, bewährte Routinen gegenüber improvisierten Experimenten." (-O, reversed)
- "Abstrakte philosophische Fragen faszinieren mich mehr als konkrete, alltagspraktische." (+O)
- "Ich halte mich lieber an bewährte Methoden, statt ständig Neues auszuprobieren." (-O, reversed)
- "Kunst und Musik können mich tief emotional berühren." (+O)
- "Wenn etwas funktioniert, sehe ich keinen Grund, es zu ändern." (-O, reversed)
- "Ich lese gerne über Kulturen und Ideen, die komplett anders sind als meine eigenen." (+O)
- "Ich bin eher praktisch veranlagt und halte wenig von theoretischem Grübeln." (-O, reversed)
- "Ich probiere gern exotisches Essen aus, auch wenn ich nicht weiß, was mich erwartet." (+O)
- "Ich fühle mich am wohlsten in vertrauten Umgebungen und Situationen." (-O, reversed)
- "Ich beschäftige mich gern mit Fragen, auf die es keine eindeutige Antwort gibt." (+O)
- "Poesie und symbolische Sprache langweilen mich eher." (-O, reversed)

**Gewissenhaftigkeit:**
- "Ich führe To-Do-Listen und arbeite sie systematisch ab." (+C)
- "Ich neige dazu, Aufgaben bis zur letzten Minute aufzuschieben." (-C, reversed)
- "Ordnung und Sauberkeit in meinem Umfeld sind mir wichtig." (+C)
- "Mein Schreibtisch sieht meistens eher chaotisch aus." (-C, reversed)
- "Wenn ich ein Versprechen gebe, halte ich es auch ein — egal was." (+C)
- "Es fällt mir schwer, mich an feste Zeitpläne zu halten." (-C, reversed)
- "Ich setze mir klare Ziele und verfolge sie konsequent." (+C)
- "Ich handle bei Entscheidungen oft spontan aus dem Bauch heraus." (-C, reversed)
- "Ich überprüfe meine Arbeit gründlich, bevor ich sie abgebe." (+C)
- "Details interessieren mich weniger — mir geht es ums große Ganze." (-C, reversed)
- "Ich plane meinen Tag gern im Voraus." (+C)
- "Regeln empfinde ich oft mehr als lästig denn als hilfreich." (-C, reversed)

**Verträglichkeit:**
- "Ich glaube, dass die meisten Menschen im Grunde gute Absichten haben." (+A)
- "In Diskussionen setze ich meinen Standpunkt auch dann durch, wenn andere sich unwohl fühlen." (-A, reversed)
- "Ich helfe anderen gern, auch wenn ich selbst dadurch Nachteile habe." (+A)
- "Wenn jemand meine Hilfe nicht verdient hat, biete ich sie auch nicht an." (-A, reversed)
- "Ich versuche, Konflikte zu vermeiden und diplomatische Lösungen zu finden." (+A)
- "Ich sage direkt und unverblümt, was ich denke — auch wenn es wehtut." (-A, reversed)
- "Das Wohlbefinden anderer ist mir genauso wichtig wie mein eigenes." (+A)
- "Im Wettbewerb geht es mir darum zu gewinnen, nicht darum, nett zu sein." (-A, reversed)
- "Ich verzeihe Menschen, die mich verletzt haben, relativ schnell." (+A)
- "Ich bin grundsätzlich skeptisch, wenn jemand mir etwas Nettes anbietet ohne offensichtlichen Grund." (-A, reversed)
- "Ich fühle mit Menschen, die ungerecht behandelt werden, und möchte ihnen helfen." (+A)
- "Bescheidenheit wird in unserer Gesellschaft überbewertet." (-A, reversed)

**Neurotizismus / Emotionale Stabilität:**
- "Ich mache mir häufig Sorgen über Dinge, die noch nicht passiert sind." (+N)
- "Auch in stressigen Situationen bleibe ich innerlich ruhig und gefasst." (-N, reversed)
- "Kleinigkeiten können mich manchmal unverhältnismäßig stark aufregen." (+N)
- "Rückschläge stecke ich schnell weg und mache weiter." (-N, reversed)
- "Ich habe Phasen, in denen ich mich ohne konkreten Anlass traurig oder niedergeschlagen fühle." (+N)
- "Ich würde mich als emotional sehr stabil und ausgeglichen beschreiben." (-N, reversed)
- "In sozialen Situationen frage ich mich oft, ob andere mich negativ bewerten." (+N)
- "Kritik an meiner Arbeit nehme ich sachlich auf, ohne sie persönlich zu nehmen." (-N, reversed)
- "Wenn ich gestresst bin, fällt es mir schwer, nicht zu essen / einzukaufen / andere Impulse zu kontrollieren." (+N)
- "Ich fühle mich selten von meinen Emotionen überwältigt." (-N, reversed)
- "Ich neige dazu, mir über Fehler aus der Vergangenheit lange den Kopf zu zerbrechen." (+N)
- "Unter Druck liefere ich oft meine besten Ergebnisse." (-N, reversed)

### 3.3 Scoring-Algorithmus (100% Client-Side)

```typescript
// Scoring-Logik (in Svelte-Component)

interface Question {
  id: number;
  text: string;
  dimension: 'O' | 'C' | 'E' | 'A' | 'N';
  facet: number;        // 1-6 innerhalb der Dimension
  reversed: boolean;    // true = negativ formuliert → Score wird invertiert
}

interface Answer {
  questionId: number;
  value: number;        // 1-7 (Likert-Skala)
}

function scoreAnswer(answer: Answer, question: Question): number {
  if (question.reversed) {
    return 8 - answer.value;  // 1→7, 2→6, 3→5, 4→4, 5→3, 6→2, 7→1
  }
  return answer.value;
}

function calculateDimensionScore(
  answers: Answer[],
  questions: Question[],
  dimension: 'O' | 'C' | 'E' | 'A' | 'N'
): { raw: number; percentage: number; facets: FacetScore[] } {
  const dimQuestions = questions.filter(q => q.dimension === dimension);
  const dimAnswers = answers.filter(a =>
    dimQuestions.some(q => q.id === a.questionId)
  );

  let totalScore = 0;
  const facetScores: Map<number, number[]> = new Map();

  for (const answer of dimAnswers) {
    const question = dimQuestions.find(q => q.id === answer.questionId)!;
    const score = scoreAnswer(answer, question);
    totalScore += score;

    if (!facetScores.has(question.facet)) {
      facetScores.set(question.facet, []);
    }
    facetScores.get(question.facet)!.push(score);
  }

  // 12 Fragen × max 7 Punkte = 84 max, 12 min
  const percentage = Math.round(((totalScore - 12) / (84 - 12)) * 100);

  const facets = Array.from(facetScores.entries()).map(([facetId, scores]) => ({
    facetId,
    raw: scores.reduce((a, b) => a + b, 0),
    percentage: Math.round(
      ((scores.reduce((a, b) => a + b, 0) - 2) / (14 - 2)) * 100
    ),
  }));

  return { raw: totalScore, percentage, facets };
}
```

### 3.4 Ergebnis-Interpretation (Prozentuale Stufen)

| Bereich | Prozent | Label |
|---------|---------|-------|
| Sehr niedrig | 0-15% | "Sehr niedrig" |
| Niedrig | 16-35% | "Niedrig" |
| Durchschnittlich | 36-65% | "Durchschnittlich" |
| Hoch | 66-85% | "Hoch" |
| Sehr hoch | 86-100% | "Sehr hoch" |

Jede Stufe bekommt einen **spezifischen Beschreibungstext pro Dimension**, der dem Nutzer erklärt, was sein Score in der Praxis bedeutet.

---

## 4. UI/UX-Design

### 4.1 Seitenstruktur

Der Test besteht aus **3 Views** innerhalb einer einzigen URL (`/de/persoenlichkeitstest`):

**View 1 — Intro + Start:**
```
┌──────────────────────────────────────────┐
│  [Icon 80×80 — Pencil-Sketch: Spiegel]  │
│  # Persönlichkeitstest                   │
│  Entdecke deine Big-Five-Persönlichkeit  │
│  — wissenschaftlich fundiert, kostenlos,  │
│  100% privat.                            │
│                                          │
│  ⏱ ~8-10 Minuten  📊 60 Fragen          │
│  🔒 Keine Daten werden gespeichert       │
│                                          │
│  [ Test starten → ]                      │
│                                          │
│  ## Wie funktioniert der Test?           │
│  1. Beantworte 60 Aussagen ehrlich       │
│  2. Erhalte dein Big-Five-Profil         │
│  3. Teile dein Ergebnis (optional)       │
│                                          │
│  ## Was ist das Big-Five-Modell?         │
│  (400 W SEO-Text)                        │
└──────────────────────────────────────────┘
```

**View 2 — Fragebogen (interaktiv, Svelte Island):**
```
┌──────────────────────────────────────────┐
│  Frage 12 von 60                         │
│  ████████████░░░░░░░░░ 20%              │
│                                          │
│  "Ich fühle mich in großen Gruppen       │
│   wohl und genieße es, im Mittelpunkt    │
│   zu stehen."                            │
│                                          │
│  ← Stimme überhaupt     Stimme voll →   │
│     nicht zu             und ganz zu     │
│                                          │
│  [1]  [2]  [3]  [4]  [5]  [6]  [7]     │
│              ▲ ausgewählt                │
│                                          │
│  [ ← Zurück ]           [ Weiter → ]    │
│                                          │
│  ── oder ──                              │
│                                          │
│  Slider-Variante (Touch-freundlich):     │
│  [●═══════════════════════○] 3/7         │
└──────────────────────────────────────────┘
```

**View 3 — Ergebnis-Dashboard:**
```
┌──────────────────────────────────────────┐
│  # Dein Persönlichkeitsprofil            │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │  Radar-Chart (Pentagon)            │  │
│  │  mit 5 Achsen: O, C, E, A, N      │  │
│  │  Farbig gefüllt (Graphite-Palette) │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Offenheit          ████████████░░ 78%   │
│  Gewissenhaftigkeit █████████░░░░░ 62%   │
│  Extraversion       ████░░░░░░░░░ 31%   │
│  Verträglichkeit    ██████████░░░ 72%   │
│  Emotionale Stab.   ███████░░░░░░ 55%   │
│                                          │
│  ── Detail-Aufklappbereiche ──           │
│                                          │
│  ▼ Offenheit (78% — Hoch)               │
│    Du bist überdurchschnittlich offen     │
│    für neue Erfahrungen, Ideen und       │
│    kreative Ansätze. Du schätzt...       │
│                                          │
│    Facetten:                             │
│    · Vorstellungskraft    ████████ 85%   │
│    · Ästhetik             ███████░ 72%   │
│    · Abenteuerlust        █████░░░ 58%   │
│    · ...                                 │
│                                          │
│  ▶ Gewissenhaftigkeit (62%)              │
│  ▶ Extraversion (31%)                    │
│  ▶ Verträglichkeit (72%)                │
│  ▶ Emotionale Stabilität (55%)           │
│                                          │
│  ── Aktionen ──                          │
│                                          │
│  [📋 Ergebnis kopieren]                  │
│  [📱 Als Bild teilen]                    │
│  [🔄 Test wiederholen]                   │
│                                          │
│  ## Was bedeuten die Dimensionen?        │
│  (SEO-Content: 400 W)                    │
│                                          │
│  ## Häufige Fragen zum Persönlichkeits-  │
│     test (FAQ + JSON-LD)                 │
└──────────────────────────────────────────┘
```

### 4.2 Interaktions-Details

**Fragebogen UX:**
- **Eine Frage pro Screen** (nicht alle auf einmal — wie 16personalities)
- **Fortschrittsbalken** oben (Graphite-Accent)
- **Keyboard-Navigation:** 1-7 Tasten für Antwort, Enter/→ für Weiter, ←/Backspace für Zurück
- **Swipe-Support** auf Mobile (links/rechts für Zurück/Weiter)
- **Auto-Advance:** Nach Antwortauswahl kurze Pause (300ms), dann automatisch nächste Frage
- **Fragen werden gespeichert in `sessionStorage`** → Browser-Reload verliert den Fortschritt nicht
- **Randomisierung:** Fragenreihenfolge wird pro Session einmalig zufällig gemischt (verhindert Reihenfolge-Bias)

**Ergebnis-Dashboard UX:**
- **Radar-Chart** mit Canvas/SVG (keine externe Library — Svelte zeichnet das selbst)
- **Animierte Balken** die beim Laden hochzählen (300ms pro Balken, gestaffelt)
- **Aufklappbare Detail-Sektionen** (Accordion-Pattern) für jede Dimension
- **"Als Bild teilen":** Generiert ein Canvas-Screenshot des Radar-Charts + Scores als PNG → Share-API oder Download
- **Kein Server-Call** — Ergebnis wird nirgends hochgeladen

### 4.3 Sharing-Feature (Viralitäts-Mechanismus)

Das Sharing-Feature ist der **Growth-Engine** dieses Tools:

1. **Canvas-to-Image:** Das Ergebnis-Dashboard wird als stylisches PNG gerendert (800×600, Graphite-Design, Radar-Chart prominent)
2. **Web Share API:** Auf unterstützten Geräten (Mobile Chrome/Safari) → nativer Share-Dialog
3. **Fallback:** Download-Button für das PNG + Clipboard-Copy eines Text-Summaries
4. **Text-Summary Format:**
```
🧠 Mein Big-Five Persönlichkeitsprofil:
Offenheit: 78% (Hoch)
Gewissenhaftigkeit: 62% (Durchschnittlich)
Extraversion: 31% (Niedrig)
Verträglichkeit: 72% (Hoch)
Emotionale Stabilität: 55% (Durchschnittlich)

Mach den Test selbst: konverter.app/de/persoenlichkeitstest
```

---

## 5. Technische Architektur

### 5.1 Einordnung in bestehende Tool-Architektur

| Eigenschaft | Wert |
|-------------|------|
| **Tool-Typ** | Typ 9 — Interactive |
| **Slug (DE)** | `persoenlichkeitstest` |
| **Slug (EN)** | `personality-test` |
| **Kategorie** | `psychologie` (neue Kategorie) |
| **Svelte-Komponente** | `PersonalityTest.svelte` (Spezialfall unter Interactive) |
| **Client-Side Only** | ✅ Ja, 0 Serveraufrufe |
| **Externe Dependencies** | Keine (pure Svelte + Canvas API) |
| **Geschätzte Bundle-Size** | ~15-25 KB gzipped (Fragen-JSON + Scoring + Chart) |

### 5.2 Dateistruktur

```
src/
├── lib/tools/
│   └── persoenlichkeitstest.ts          # Tool-Config
├── lib/personality-test/
│   ├── questions-de.ts                  # 60 Fragen (DE)
│   ├── questions-en.ts                  # 60 Fragen (EN)
│   ├── scoring.ts                       # Scoring-Algorithmus
│   ├── descriptions-de.ts              # Ergebnis-Texte (DE)
│   ├── descriptions-en.ts              # Ergebnis-Texte (EN)
│   └── types.ts                         # TypeScript Interfaces
├── components/tools/
│   └── PersonalityTest.svelte           # Hauptkomponente
│       ├── TestIntro.svelte             # View 1: Start-Screen
│       ├── TestQuestion.svelte          # View 2: Einzelfrage
│       ├── TestProgress.svelte          # Fortschrittsbalken
│       ├── TestResult.svelte            # View 3: Ergebnis
│       ├── RadarChart.svelte            # SVG Radar-/Spinnennetz-Chart
│       ├── DimensionBar.svelte          # Animierter Prozentbalken
│       └── ShareCard.svelte             # Canvas-Ergebnis-Bild
├── content/tools/
│   └── persoenlichkeitstest/
│       ├── de.md                        # SEO-Content DE
│       └── en.md                        # SEO-Content EN
```

### 5.3 Performance-Budget

| Metrik | Ziel |
|--------|------|
| Initial Page Load (LCP) | < 1.5s |
| Time to Interactive | < 2s |
| Bundle Size (JS) | < 30 KB gzipped |
| Fragen-Datenbank | ~8 KB (60 Fragen als JSON) |
| Scoring-Logik | < 2 KB |
| Radar-Chart (SVG) | < 5 KB Komponente |
| Total Additional JS | < 45 KB |

---

## 6. SEO-Strategie

### 6.1 Ziel-Keywords

| Keyword (DE) | Suchvolumen/Monat (geschätzt) | Schwierigkeit |
|--------------|-------------------------------|---------------|
| persönlichkeitstest kostenlos | 100.000+ | Mittel-Hoch |
| persönlichkeitstest | 200.000+ | Hoch |
| big five test | 15.000+ | Mittel |
| ocean persönlichkeitstest | 5.000+ | Niedrig |
| persönlichkeitstyp bestimmen | 20.000+ | Mittel |
| big five persönlichkeit | 10.000+ | Niedrig-Mittel |

### 6.2 SEO-Content-Blöcke

Der gleiche 8-Block-Ansatz wie bei allen anderen Tools:

1. **Title:** "Kostenloser Persönlichkeitstest (Big Five) — Wissenschaftlich fundiert"
2. **Meta-Description:** "Entdecke dein Big-Five-Profil in 60 Fragen. Komplett kostenlos, wissenschaftlich basiert, 100% privat. Kein Account nötig."
3. **Tagline:** "Dein Persönlichkeitsprofil in 10 Minuten — basierend auf dem Big-Five-Modell der Psychologie."
4. **Intro:** ~80 Wörter über den Test
5. **How-to-Use:** 3 Steps (Test starten, 60 Fragen beantworten, Ergebnis analysieren & teilen)
6. **SEO-Artikel:** ~400 Wörter über Big Five, OCEAN, Unterschied zu MBTI, Wissenschaftlichkeit
7. **FAQ:** 6 Q&A (Was ist Big Five? Wie genau ist der Test? Werden Daten gespeichert? etc.)
8. **Related Tools:** Noch zu definierende verwandte Tools aus der Psychologie-Kategorie

### 6.3 Strukturierte Daten (JSON-LD)

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Big Five Persönlichkeitstest",
  "applicationCategory": "HealthApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR"
  },
  "description": "Kostenloser wissenschaftlicher Persönlichkeitstest..."
}
```

Plus `FAQPage` JSON-LD für die FAQ-Sektion.

---

## 7. Rechtliche Aspekte

### 7.1 IPIP-Lizenz

Der **International Personality Item Pool (IPIP)** ist **explizit Public Domain**. Die Original-Items von ipip.ori.org dürfen frei verwendet, modifiziert und in kommerzielle Produkte integriert werden. Es gibt keine Lizenzgebühren und keine Nutzungsbeschränkungen.

**Wir verwenden:** Eigene Original-Formulierungen, die auf den IPIP-Konstrukten basieren, aber no original IPIP-Wortlaute kopieren. Das ist die sicherste Variante.

### 7.2 Disclaimer (Pflicht auf der Ergebnisseite)

```
Hinweis: Dieser Test ist ein Selbsteinschätzungsinstrument basierend auf dem
Big-Five-Modell der Persönlichkeitspsychologie. Er ersetzt keine professionelle
psychologische Diagnostik. Das Ergebnis ist eine Momentaufnahme deiner
Selbsteinschätzung — Persönlichkeitsmerkmale können sich über die Zeit verändern.
```

### 7.3 Datenschutz

- **Keine Daten werden gesendet** — alles läuft im Browser
- **sessionStorage** für Fragenfortschritt (wird beim Tab-Schließen gelöscht)
- **Kein Tracking** des Testergebnisses
- **Sharing ist opt-in** — nur wenn der Nutzer aktiv auf "Teilen" klickt

---

## 8. Abgrenzung zu 16personalities.com

| Aspekt | 16personalities | Unser Ansatz |
|--------|-----------------|--------------|
| **Modell** | Hybrides MBTI/Big-Five, proprietär | Reines Big Five (OCEAN), Open Source |
| **Ergebnis** | 4-Buchstaben-Typ (INTJ, ENFP etc.) | 5 Prozent-Balken + 30 Facetten-Scores |
| **Wissenschaftlichkeit** | Umstritten (MBTI-Basis) | Wissenschaftlicher Goldstandard |
| **Monetarisierung** | Premium-Berichte ($49+) | AdSense (kein Paywall) |
| **Account** | Optional (für Premium) | Keiner |
| **Datenspeicherung** | Server-seitig | Keine (Client-only) |
| **Fragen** | 60 (proprietär) | 60 (eigene Formulierungen, IPIP-basiert) |
| **Avatare/Illustrationen** | Custom Cartoon-Avatare | Pencil-Sketch-Icon (Konverter-Stil) |
| **Sharing** | Social-Media-Karten mit Typ | Canvas-PNG mit Radar-Chart |

### 8.1 Was wir bewusst NICHT übernehmen

- ❌ **Keine MBTI-Buchstaben-Codes** (INTJ, ENFP etc.) — das ist ein proprietäres System
- ❌ **Keine "Persönlichkeitstyp-Namen"** (Architekt, Mediator etc.) — das sind 16personalities-eigene Marken
- ❌ **Keine Cartoon-Avatare** — wir nutzen unseren Pencil-Sketch-Stil
- ❌ **Keine Premium-Paywall-Berichte** — alles kostenlos

### 8.2 Was wir BESSER machen können

- ✅ **Transparentere Wissenschaft:** Big Five ist der anerkannte Standard
- ✅ **Facetten-Granularität:** 30 Sub-Facetten statt nur 4-5 Dimensionen
- ✅ **Null Datenspeicherung:** Totale Privatsphäre
- ✅ **Radar-Chart statt Buchstaben:** Visuell intuitiver und ehrlicher (Spektrum statt Schublade)
- ✅ **Multilingual von Anfang an:** In alle Konverter-Sprachen übersetzbar

---

## 9. Implementierungsaufwand & Timeline

### 9.1 Einordnung in die Konverter-Roadmap

Dieses Tool ist ein **Phase-2-Tool**, weil es...
- ...eine neue Kategorie erfordert (`psychologie`)
- ...den Typ 9 (Interactive) stresst und diesen Template-Typ in Phase 0/1 erst validated werden muss
- ...relativ umfangreiche Content-Produktion braucht (Ergebnis-Texte für 5×5 Stufen + 30 Facetten)

### 9.2 Geschätzter Aufwand

| Komponente | Sessions | Dauer |
|------------|----------|-------|
| Fragen-Datenbank (60 DE + Review) | 1 | ~3-4h |
| Scoring-Logik + Unit-Tests | 0.5 | ~2h |
| UI: Fragebogen + Progress + Navigation | 1.5 | ~5-6h |
| UI: Ergebnis-Dashboard + Radar-Chart | 1.5 | ~5-6h |
| UI: Share-Feature (Canvas → PNG) | 0.5 | ~2h |
| Ergebnis-Beschreibungstexte (5 Dim × 5 Stufen + 30 Facetten) | 1.5 | ~5-6h |
| SEO-Content (DE) | 0.5 | ~2h |
| **Total** | **~7 Sessions** | **~25-30h** |

### 9.3 Risiken

| Risiko | Wahrscheinlichkeit | Mitigation |
|--------|---------------------|------------|
| Fragen sind zu ähnlich zu 16personalities | Niedrig | Alle Fragen sind eigene Formulierungen basierend auf IPIP-Konstrukten |
| Radar-Chart funktioniert nicht auf allen Browsern | Niedrig | SVG-Fallback + Canvas nur für Export |
| Test wird als "dünn" wahrgenommen (nur 60 Fragen) | Mittel | 60 Fragen = Standard-Länge für IPIP-NEO-60, wissenschaftlich validiert |
| AdSense lehnt Psychologie-Content ab | Niedrig | Big Five ist kein medizinischer Test, Disclaimer eingebaut |

---

## 10. Erweiterungsmöglichkeiten (Future)

| Feature | Phase | Aufwand |
|---------|-------|---------|
| **Ergebnis-Vergleich:** "Lade einen Freund ein und vergleicht eure Profile" | Phase 3+ | Mittel (URL-encoded Scores) |
| **PDF-Report:** Ausführlicher 5-Seiten-Report als PDF-Download | Phase 3+ | Mittel (jspdf) |
| **120-Fragen-Version:** Doppelt so viele Fragen für höhere Genauigkeit | Phase 3+ | Niedrig (nur Daten) |
| **Karriere-Empfehlungen:** "Passende Berufsfelder basierend auf deinem Profil" | Phase 4+ | Hoch (Content-Aufwand) |
| **Beziehungs-Kompatibilität:** Zwei Profile vergleichen | Phase 4+ | Hoch |

---

## 11. Zusammenfassung

Dieses Tool ist ein **Traffic-Magnet mit viralem Potenzial**, der perfekt in die bestehende Konverter-Architektur passt:

- **Wissenschaftlich fundiert** (Big Five, nicht MBTI)
- **100% Client-Side** (passt zu Non-Negotiable #7)
- **Kein urheberrechtliches Risiko** (IPIP Public Domain, eigene Formulierungen)
- **Hohes SEO-Potenzial** (100k+ Suchvolumen/Monat)
- **Viraler Growth-Loop** (Sharing-Feature)
- **Keine externe Abhängigkeit** (reines Svelte, kein externes Chart-Framework)
- **~7 Sessions Aufwand** — gut planbar als Phase-2-Projekt

---

**Status:** Draft — bereit für Review.
