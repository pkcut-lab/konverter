---
toolId: "speech-enhancer"
language: "de"
title: "Sprache verbessern: KI-Tool ohne Upload"
metaDescription: "Entferne lästiges Audio-Rauschen und verbessere deine Sprachaufnahmen sofort. Das Tool läuft zu 100&nbsp;% lokal in deinem Browser — ohne Dateiupload."
tagline: "Saubere Stimme in Sekunden — dein Audio verlässt den Browser nicht"
intro: "KI-Rauschunterdrückung direkt im Browser — kein Upload. DeepFilterNet3 bereinigt WAV, MP3, OGG, M4A, FLAC lokal."
headingHtml: "<em>Sprache</em> verbessern — KI-Rauschunterdrückung"
category: "audio"
contentVersion: 1
howToUse:
  - "Audiodatei per Drag-and-Drop ablegen oder über die Auswahl öffnen (WAV, MP3, OGG, M4A, FLAC — bis 500&nbsp;MB)."
  - "Stärke wählen: Dezent (empfohlen, 20&nbsp;dB) verhindert Roboter-Artefakte; Maximal (100&nbsp;dB) für stark verrauchte Aufnahmen."
  - "Nach der KI-Verarbeitung erscheint der Download-Button — enhanced WAV-Datei herunterladen."
faq:
  - q: "Wie funktioniert die Rauschunterdrückung ohne Server?"
    a: "Das KI-Modell DeepFilterNet3 läuft als ONNX-Datei direkt im Browser — deinem eigenen Rechner. Deine Audiodatei wird ausschließlich lokal verarbeitet und verlässt deinen Browser zu keinem Zeitpunkt. Beim ersten Aufruf lädt das Tool das Modell (~10&nbsp;MB) einmalig herunter und speichert es im Browser-Cache. Danach funktioniert es auch offline."
  - q: "Klingt das Ergebnis roboterhaft?"
    a: "Nur wenn du die Stärke auf Maximal (100&nbsp;dB) setzt. Der Default Dezent (20&nbsp;dB) dämpft Rauschen hörbar, ohne die natürliche Klangfarbe der Stimme zu verändern. Dieser Wert wurde basierend auf dem verbreiteten Nutzer-Feedback zu Adobe Podcast V2 gewählt: maximale Stärke erzeugt Artefakte, 30&nbsp;% ist die natürliche Position."
  - q: "Welche Dateiformate werden unterstützt?"
    a: "Als Eingabe akzeptiert das Tool WAV, MP3 (audio/mpeg), M4A und AAC (audio/mp4), OGG Vorbis sowie FLAC und WebM Opus. Die Ausgabe ist immer eine WAV-Datei mit 48&nbsp;kHz, 16&nbsp;Bit, Mono — das verlustfreie Standardformat für Sprachverarbeitung."
  - q: "Warum ist die Ausgabe Mono statt Stereo?"
    a: "DeepFilterNet3 ist für Sprache optimiert und verarbeitet Mono-Audio. Stereo-Quellen werden vor der KI-Verarbeitung auf Mono gemischt. Für Musik oder Stereo-Produktionen empfehlen sich spezialisierte Tools. Für Podcasts, Interviews und Voice-Over ist Mono das übliche Zielformat."
  - q: "Wie lange dauert die Verarbeitung?"
    a: "Das hängt von der Länge der Aufnahme und deiner Hardware ab. Als Richtwert: 10&nbsp;Minuten Audio dauern in WASM-Modus (kein GPU) etwa 20–30&nbsp;Minuten. Auf Geräten mit WebGPU-Unterstützung (Chrome/Edge) ist die Verarbeitung deutlich schneller. Das Tool zeigt den Fortschritt in Echtzeit an."
  - q: "Ist das Tool DSGVO-konform für Stimm-Aufnahmen?"
    a: "Ja. Stimm-Aufnahmen können als biometrische Daten im Sinne von DSGVO Art. 9 eingestuft werden. Weil die Verarbeitung vollständig lokal stattfindet und keinerlei Daten an einen Server übertragen werden, entsteht kein Datenschutz-Risiko. Die Ausgabedatei enthält einen Metadaten-Tag (Software: kittokit.de AI-processed) gemäß EU-KI-Verordnung Art. 50."
relatedTools:
  - hevc-zu-h264
  - hintergrund-entfernen
datePublished: '2026-04-24'
dateModified: '2026-04-25'

---

## Was macht dieser Sprachverbesserer?

Dieses Tool entfernt Hintergrundgeräusche aus Sprachaufnahmen vollständig im Browser — kein Upload, DeepFilterNet3-KI lokal.

Lüfterrauschen, Straßenlärm, Tastaturrauschen und Raumhall lassen Stimmen unprofessionell wirken — selbst wenn der Inhalt gut ist. Betroffen sind vor allem Podcasts, Video-Tutorials, Interviews und Videokonferenz-Mitschnitte.

Dieses Tool nutzt das KI-Modell **DeepFilterNet3** (MIT- und Apache-2.0-Lizenz), das am
Fraunhofer-Institut entwickelt wurde und auf dem [ICASSP 2023 als State-of-the-Art-Modell](https://github.com/Rikorose/DeepFilterNet)
für 48&nbsp;kHz Full-Band-Sprachverbesserung vorgestellt wurde. Im Gegensatz zu cloudbasierten
Diensten wie Adobe Podcast Enhance, Cleanvoice oder Auphonic läuft die gesamte Verarbeitung
in deinem Browser — deine Audiodatei verlässt deinen Rechner zu keinem Zeitpunkt.

Der Stärke-Slider gibt dir direkte Kontrolle über den `atten_lim_db`-Parameter des Modells:
Wie stark Rauschen maximal gedämpft werden darf. Niedrigere Werte klingen natürlicher,
höhere Werte entfernen mehr Rauschen, riskieren aber Artefakte.

## Wie funktioniert die KI-Rauschunterdrückung?

DeepFilterNet3 ist ein sogenannter Time-Frequency-Domain-Filter mit zwei Verarbeitungsstufen.
Die erste Stufe nutzt eine ERB-Filterbank (Equivalent Rectangular Bandwidth) zusammen mit
einem rekurrenten GRU-Netz, um grobe Rauschanteile zu identifizieren. Die zweite Stufe
verfeinert das Ergebnis durch lokale komplexe Faltungen im Spektrogramm.

Das Modell operiert auf dem **komplexen Spektrogramm** des Audiosignals: Die Eingabe wird
in Frames von 20&nbsp;ms (960 Samples bei 48&nbsp;kHz) aufgeteilt, per STFT in den
Frequenzbereich transformiert und frame-weise durch das ONNX-Modell geschickt. Die
gefilterten Frames werden anschließend über Overlap-Add mit Hann-Fenster zum fertigen
Signal rekonstruiert.

Ein entscheidender Unterschied zu cloudbasierten Diensten: DeepFilterNet3 enthält **keine
ASR-Komponente** (Automatic Speech Recognition) und ist damit sprach-agnostisch. Es
arbeitet rein auf spektraler Ebene und behandelt Deutsch, Englisch, Türkisch und alle
anderen Sprachen gleich. Adobe Podcast V2 wurde dokumentiert als stärker auf amerikanisches
Englisch optimiert.

## Welche Stärke-Einstellungen gibt es?

Das Tool bietet vier Preset-Stufen, die unterschiedliche Anwendungsfälle abdecken:

| Stufe | atten\_lim\_dB | Klangeindruck | Einsatz |
|---|---|---|---|
| **Bypass** | 0&nbsp;dB | Original | Vergleich, kein Filter |
| **Dezent** (Standard) | 20&nbsp;dB | Natürlich | Podcast, Interview — empfohlen |
| **Mittel** | 40&nbsp;dB | Klarer, leicht bearbeitet | Lautes Lüfterrauschen |
| **Maximal** | 100&nbsp;dB | Sehr sauber, Artefakt-Risiko | Stark verrauchte Aufnahmen |

Der Standard-Wert **Dezent (20&nbsp;dB)** wurde so gewählt, dass er dem [Feedback-Muster
zu Adobe Podcast V2](https://thepodcastconsultant.com/blog/adobe-podcast-enhance) entspricht: Nutzer berichten, dass der Maximal-Wert Stimmen
roboterhaft klingen lässt, während 30&nbsp;% der maximalen Stärke eine natürliche Position ist.
Das Tool implementiert diesen Wert als sinnvollen Default, statt wie Mitbewerber
automatisch auf maximale Unterdrückung zu setzen.

## Welche Anwendungsbeispiele gibt es?

Sprach-Nachbearbeitung ist in vielen Kontexten nötig — das Tool deckt die häufigsten ab:

**Podcast-Produktion.** Aufnahmen im Homeoffice leiden oft unter Lüfterrauschen von
PC oder Klimaanlage. Dezente Rauschunterdrückung macht den Unterschied zwischen
„klingt nach Keller" und „klingt professionell", ohne die Stimme synthetisch zu machen.

**Interview-Mitschnitte.** Videocall-Aufnahmen aus Zoom, Teams oder Meet haben oft
Hintergrundgeräusche vom Gesprächspartner. Eine Stärke von 20–40&nbsp;dB räumt den
Großteil davon auf, ohne die Sprach-Qualität zu beeinträchtigen.

**E-Learning und Voice-Over.** Tutorial-Videos profitieren von sauberer Stimme. Da
hier oft Single-Mic-Aufnahmen mit wenig akustischer Optimierung entstehen, ist die
Rauschunterdrückung besonders wirksam.

**Transkriptions-Vorbereitung.** Viele KI-Transkriptions-Dienste liefern bessere
Ergebnisse auf bereinigtem Audio, weil ihr Whisper-Modell ohne Hintergrundgeräusche
präziser transkribiert.

## Datenschutz und EU-KI-Verordnung

Stimm-Aufnahmen können nach DSGVO Art. 9 als biometrische Daten eingestuft werden, weil
aus Sprachmustern Rückschlüsse auf Identität und Gesundheitszustand möglich sind. Bei
cloudbasierten Diensten bedeutet das ein strukturelles Datenschutz-Risiko: Die Datei
wird auf fremde Server hochgeladen, verarbeitet und unter fremder Datenschutzerklärung
gespeichert.

Dieses Tool **eliminiert dieses Risiko strukturell**, nicht durch Versprechen in einer
Datenschutzerklärung: Da die KI-Verarbeitung im Browser stattfindet, gibt es schlicht
keine Serverübertragung. Die einzige Netzwerkverbindung beim ersten Aufruf ist der
einmalige Modell-Download (~10&nbsp;MB). Danach funktioniert das Tool auch offline.

Die Ausgabedatei trägt gemäß **EU-KI-Verordnung Art. 50** einen Metadaten-Tag im WAV
INFO-Chunk: `Software: kittokit.de AI-processed (model=DeepFilterNet3)`. Dieser Tag
ist maschinenlesbar, aber unsichtbar — kein sichtbares Wasserzeichen, das professionelle
Nutzung einschränkt.

## Häufige Fragen

Die häufigsten Fragen zur Nutzung und zum Datenschutz:

### Wie funktioniert die Rauschunterdrückung ohne Server?

Das KI-Modell DeepFilterNet3 läuft als ONNX-Datei direkt im Browser. Deine Audiodatei
wird ausschließlich lokal verarbeitet. Beim ersten Aufruf lädt das Tool das Modell
einmalig (~10&nbsp;MB) und speichert es im Browser-Cache. Danach funktioniert es auch offline.

### Klingt das Ergebnis roboterhaft?

Nur bei maximaler Stärke (100&nbsp;dB). Der Standard Dezent (20&nbsp;dB) dämpft Rauschen
hörbar, ohne Artefakte zu erzeugen. Dieser Wert entspricht der natürlichen Position laut
Nutzerfeedback zu ähnlichen Diensten.

### Welche Dateiformate werden unterstützt?

WAV, MP3, M4A/AAC, OGG, FLAC und WebM Opus als Eingabe. Die Ausgabe ist immer WAV
48&nbsp;kHz mono — das verlustfreie Standardformat für Sprachverarbeitung.

### Wie lange dauert die Verarbeitung?

Als Richtwert: 10&nbsp;Minuten Audio dauern im WASM-Modus ca. 20–30&nbsp;Minuten. Mit WebGPU
(Chrome/Edge auf Desktop) deutlich schneller. Das Tool zeigt den Fortschritt in Echtzeit.

### Ist das Tool DSGVO-konform für vertrauliche Aufnahmen?

Ja. Da keinerlei Daten übertragen werden, entsteht kein Datenschutz-Risiko. Die Verarbeitung
ist strukturell lokal.

## Welche Audio-Tools sind verwandt?

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[iPhone-Video in MP4 umwandeln](/de/hevc-zu-h264)** — HEVC/MOV-Videos aus dem iPhone in universelles H.264-MP4 konvertieren, ebenfalls vollständig im Browser ohne Upload.
- **[Hintergrund entfernen](/de/hintergrund-entfernen)** — KI-basiertes Freistellen von Motiven aus Fotos, lokal verarbeitet mit BEN2-Modell.
- **[WebP-Konverter](/de/webp-konverter)** — Bilder in das moderne WebP-Format umwandeln und Dateigröße deutlich reduzieren.
