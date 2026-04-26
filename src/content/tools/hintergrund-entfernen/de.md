---
toolId: remove-background
language: de
title: "Hintergrund entfernen — direkt im Browser"
headingHtml: "<em>Hintergrund</em> entfernen"
metaDescription: "Hintergrund aus Fotos entfernen — komplett im Browser, ohne Upload, ohne Anmeldung, ohne Tracking. KI-basiert und WebGPU-beschleunigt für Sekunden-Resultate."
tagline: "Freisteller in Sekunden — das Bild bleibt auf deinem Gerät."
intro: "Das Tool trennt ein Motiv vom Hintergrund und speichert das Ergebnis als transparente PNG-Datei. Die Analyse läuft vollständig auf deinem Gerät über ein KI-Modell, das einmalig ins Browser-Cache geladen wird. Danach funktioniert alles offline — kein Server, keine Anmeldung, kein Tracking. Ideal für Produktfotos, Porträts, Tiere und alles, was einen sauberen Freisteller braucht."
howToUse:
  - "Datei wählen (PNG, JPG, WebP, AVIF oder HEIC, bis 15&nbsp;MB)"
  - "Einmalig wartet das Tool auf den Modell-Download (ca. 110&nbsp;MB, danach gecacht)"
  - "Freigestelltes Bild als PNG, WebP oder JPG herunterladen"
faq:
  - q: "Muss ich meine Datei hochladen?"
    a: "Nein. Die Bildanalyse läuft vollständig in deinem Browser über WebGPU oder WebAssembly. Das Bild verlässt dein Gerät zu keinem Zeitpunkt. Lediglich das KI-Modell wird einmalig von einem CDN geladen — dabei werden keine Bilddaten übertragen."
  - q: "Wie lange dauert die Verarbeitung?"
    a: "Nach dem einmaligen Modell-Download dauert die eigentliche Freistellung pro Bild typischerweise 100 bis 500 Millisekunden auf Geräten mit WebGPU-Unterstützung. Ohne WebGPU fällt das Tool auf WebAssembly zurück, was etwa zwei- bis viermal langsamer ist, aber immer noch flüssig nutzbar bleibt."
  - q: "Welche Bilder eignen sich am besten?"
    a: "Gute Ergebnisse gibt es bei Motiven mit klarer Trennung vom Hintergrund: Produktfotos, Porträts, Tiere, Alltagsgegenstände. Schwieriger wird es bei transparenten Objekten wie Glas oder bei sehr feinen Strukturen wie einzelnen Haaren vor unruhigem Hintergrund."
  - q: "Wie funktioniert die Erkennung technisch?"
    a: "Ein spezialisiertes neuronales Netz für Vordergrund-Hintergrund-Segmentierung läuft direkt in deinem Browser. Es erzeugt für jedes Bild eine sogenannte Alpha-Maske, die für jeden Pixel angibt, wie stark er zum Motiv gehört. Die Modell-Datei ist rund 110&nbsp;MB groß und wird nach dem ersten Laden vom Browser gecacht."
  - q: "Kann ich das Ergebnis als JPG speichern?"
    a: "Ja, aber JPG unterstützt keine Transparenz. Wenn du JPG wählst, wird der Hintergrund weiß gefüllt. Für Transparenz nimm PNG (verlustfrei) oder WebP (kleinere Dateigröße bei vergleichbarer Qualität)."
relatedTools:
  - bild-komprimieren
  - bild-groesse-aendern
  - webp-konverter
category: image
aside:
  steps:
    - title: "Bild auswählen"
      description: "Ziehe eine Datei per Drag & Drop in den Bereich oder wähle sie aus deinem Gerät aus. PNG, JPG, WebP, AVIF oder HEIC bis 15&nbsp;MB."
    - title: "KI-Verarbeitung"
      description: "Ein lokales KI-Modell trennt Motiv und Hintergrund direkt im Browser — ohne Upload, ohne Serverkontakt."
    - title: "Ergebnis speichern"
      description: "Lade den Freisteller als PNG mit Transparenz herunter oder kopiere ihn direkt in die Zwischenablage."
  privacy: "Die Verarbeitung läuft ausschließlich auf deinem Gerät. Deine Bilder verlassen den Browser nicht, werden nicht auf unsere Server übertragen und nach dem Schließen des Tabs gelöscht. Damit ist das Tool DSGVO-konform nutzbar."
kbdHints:
  - key: "⌘V"
    label: "Einfügen"
  - key: "Drag & Drop"
    label: "Ziehen"
  - key: "⌘C"
    label: "Kopieren"
contentVersion: 1
datePublished: '2026-04-19'
dateModified: '2026-04-24'

---

## Wie funktioniert das Tool?

Das Tool nutzt ein vortrainiertes neuronales Netz, das speziell für die
Trennung von Vordergrund und Hintergrund auf Fotografien entwickelt wurde.
Das Modell läuft direkt in deinem Browser und nutzt dabei WebGPU oder
WebAssembly — moderne Browser-Schnittstellen, die KI-Berechnungen lokal auf
deiner Grafikkarte oder CPU ausführen.

Beim ersten Aufruf lädt der Browser die Modell-Datei (rund 110&nbsp;MB)
einmalig herunter und legt sie im internen Cache ab. Alle weiteren
Freistellungen laufen vollständig offline. Unterstützt dein Gerät WebGPU —
das gilt für die meisten aktuellen Chrome-, Edge- und Safari-Versionen —,
läuft die Berechnung auf der Grafikkarte und dauert typischerweise 100 bis
500 Millisekunden pro Bild. Ohne WebGPU springt automatisch ein
WebAssembly-Fallback ein, der etwa zwei- bis viermal länger braucht, aber
auf allen modernen Browsern funktioniert.

Im Hintergrund erzeugt das Modell eine sogenannte Alpha-Maske: eine Graustufen-Matrix, in der
jeder Pixel beschreibt, wie stark er zum Vordergrund gehört. Diese Maske wird
dann auf das Originalbild angewendet — Pixel außerhalb des Motivs werden
transparent, Pixel innerhalb bleiben unverändert. Bei weichen Kanten wie
Haaren oder Fell sorgt die Graustufen-Maske für einen fließenden Übergang
statt harter Pixelkanten.

## Wie entfernst du einen Hintergrund?

Lade eine Datei über die Auswahl, per Drag-and-Drop oder mit Strg&nbsp;+&nbsp;V
aus der Zwischenablage. Auf dem Smartphone steht zusätzlich eine
Kamera-Aufnahme zur Verfügung. Unterstützte Formate sind PNG, JPG, WebP, AVIF
sowie HEIC und HEIF — also auch iPhone-Fotos. Nach der einmaligen
Modell-Ladephase erscheint das freigestellte Bild direkt im Browser, mit
Karo-Hintergrund als Transparenz-Indikator. Über den Format-Wechsler kannst du
zwischen PNG, WebP und JPG umschalten, ohne das Modell erneut auszuführen.

## Datenschutz — 100 % im Browser

Die Bildanalyse passiert ausschließlich lokal auf deinem Gerät. Weder das
Original noch das Ergebnis werden an einen Server gesendet, gespeichert oder
analysiert. Es gibt kein Cookie-Banner für Drittanbieter, keine Anmeldung und
kein Tracking — auch keine anonymen Nutzungsstatistiken.

Eine Ausnahme ist der einmalige Modell-Download beim ersten Aufruf: Die
Modell-Datei (rund 110&nbsp;MB) wird einmalig von einem öffentlichen
Modell-CDN geladen. Dieser Request enthält ausschließlich die URL der
Modell-Datei. Es werden keine Bilddaten, keine Nutzer-IDs und keine
personenbezogenen Informationen übertragen. Technisch bedingt sieht der
Modell-Anbieter die IP-Adresse und den User-Agent des Browsers, aus dem der
Download stammt — dieselben Daten also, die auch dein Internetanbieter beim
Aufruf jeder beliebigen Webseite sieht. Nach dem ersten Laden liegt das
Modell im Browser-Cache und wird für alle weiteren Aufrufe dort abgerufen;
das CDN wird dann nicht mehr kontaktiert.

Wer diese CDN-Verbindung vermeiden möchte, kann den Seitenaufruf abbrechen,
sobald der Modell-Download startet — das Tool ist dann nicht nutzbar, aber es
wurden auch keine Daten übertragen. Für sensible Bilder wie Ausweis-Scans,
medizinische Aufnahmen oder vertrauliche Firmenunterlagen ist genau das der
entscheidende Vorteil gegenüber den meisten webbasierten Freisteller-Diensten,
die das Bild zwingend hochladen müssen. Weitere Details stehen in der
<a href="/de/datenschutz">Datenschutzerklärung</a>.

## Wann liefert das Tool gute Ergebnisse?

Das Modell ist auf natürliche Fotografien trainiert und liefert in vielen
typischen Situationen sehr saubere Freisteller. Die folgenden Kategorien
decken den Alltag gut ab:

**Produktfotos** mit einfarbigem oder unscharfem Hintergrund sind der
klassische Anwendungsfall. Ob Schuhe auf Holztisch, Schmuck auf Stoff oder
Flaschen vor einer Wand — das Modell erkennt das Motiv fast immer korrekt.
Leichte Reflexionen und Schatten werden meist sauber entfernt, solange der
Motivkörper selbst keine spiegelnden Flächen hat.

**Porträts** funktionieren ausgezeichnet, wenn das Gesicht gut ausgeleuchtet
und der Hintergrund nicht zu bunt ist. Einzelne Haarsträhnen vor einfarbigem
Hintergrund werden mit weichem Übergang freigestellt. Schwierig wird es bei
sehr feinen Einzelhaaren vor unruhigen Hintergründen — hier entstehen
gelegentlich kleine Artefakte. Ein zweiter Durchlauf nach manueller Nachbearbeitung
hilft in solchen Fällen.

**Tiere** — Hunde, Katzen, Pferde, Vögel — werden zuverlässig erkannt. Bei
langhaarigen Tieren gilt dasselbe wie bei Porträts: je einfarbiger der
Hintergrund, desto sauberer der Freisteller.

**Alltagsgegenstände** wie Möbelstücke, Werkzeuge, Bücher oder Lebensmittel
sind meistens unproblematisch. Bei stark spiegelnden Oberflächen (Chrom,
poliertes Metall) kann es vorkommen, dass Teile der Reflexion als
Hintergrund interpretiert und entfernt werden.

**Schwieriger** wird es bei stark transparenten oder halbtransparenten
Objekten: Glas, Wassergläser, Plastikverpackungen. Hier verliert das Modell
häufig die feinen Konturen, weil der Hintergrund durch das Objekt durchscheint.
Auch bei sehr hohen Auflösungen über 4096 × 4096 Pixel wird das Bild vor der
Analyse intern herunterskaliert, was bei feinsten Details zu leichter
Unschärfe an den Kanten führen kann.

Ein praktischer Tipp: Bei unbefriedigendem Ergebnis einmal das Format wechseln
— beim erneuten Durchlauf werden leicht andere Pixel markiert, und manchmal
reicht das, um eine problematische Kante zu retten. Alternativ das Motiv vor
dem Upload manuell zuschneiden, sodass der Hintergrund bereits stark reduziert
ist.

## Häufige Fragen

Die häufigsten Rückfragen zur Nutzung und zum Datenschutz des Tools:

### Muss ich meine Datei hochladen?

Nein. Die Bildanalyse läuft vollständig in deinem Browser über WebGPU oder
WebAssembly. Das Bild verlässt dein Gerät zu keinem Zeitpunkt. Lediglich das
KI-Modell wird einmalig von einem CDN geladen — dabei werden keine Bilddaten
übertragen.

### Wie lange dauert die Verarbeitung?

Nach dem einmaligen Modell-Download dauert die eigentliche Freistellung pro
Bild typischerweise 100 bis 500 Millisekunden auf Geräten mit
WebGPU-Unterstützung. Ohne WebGPU fällt das Tool auf WebAssembly zurück, was
etwa zwei- bis viermal langsamer ist, aber immer noch flüssig nutzbar bleibt.

### Welche Bilder eignen sich am besten?

Gute Ergebnisse gibt es bei Motiven mit klarer Trennung vom Hintergrund:
Produktfotos, Porträts, Tiere, Alltagsgegenstände. Schwieriger wird es bei
transparenten Objekten wie Glas oder bei sehr feinen Strukturen wie einzelnen
Haaren vor unruhigem Hintergrund.

### Wie funktioniert die Erkennung technisch?

Ein spezialisiertes neuronales Netz für Vordergrund-Hintergrund-Segmentierung
läuft direkt in deinem Browser. Es erzeugt für jedes Bild eine sogenannte
Alpha-Maske, die für jeden Pixel angibt, wie stark er zum Motiv gehört. Die
Modell-Datei ist rund 110&nbsp;MB groß und wird nach dem ersten Laden vom
Browser gecacht.

### Kann ich das Ergebnis als JPG speichern?

Ja, aber JPG unterstützt keine Transparenz. Wenn du JPG wählst, wird der
Hintergrund weiß gefüllt. Für Transparenz nimm PNG (verlustfrei) oder WebP
(kleinere Dateigröße bei vergleichbarer Qualität).

## Welche Bild-Tools sind verwandt?

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[WebP-Konverter](/de/webp-konverter)** — PNG und JPG in WebP umwandeln, rund 30&nbsp;% kleinere Dateien, vollständig im Browser.
- **[HEVC zu H.264](/de/hevc-zu-h264)** — iPhone-Videos in universell abspielbares MP4 umwandeln, direkt im Browser.
- **[Meter zu Fuß](/de/meter-zu-fuss)** — schnelle Längen-Umrechnung mit Schritt-für-Schritt-Rechenweg.
