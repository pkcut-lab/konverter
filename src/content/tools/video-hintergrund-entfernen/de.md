---
toolId: "video-bg-remove"
language: "de"
title: "Video Hintergrund entfernen — KI, kein Upload"
headingHtml: "Video-<em>Hintergrund</em> entfernen"
metaDescription: "Hintergrund aus Videos entfernen — KI-basiert, direkt im Browser, ohne Upload, ohne Anmeldung. Unscreen-Alternative kostenlos und DSGVO-konform."
tagline: "Dein Video verlässt nie deinen Browser — kein Upload, kein Login."
intro: "Alle bekannten Alternativen — Kapwing, VEED, Runway, CapCut — laden dein Video auf einen fremden Server. Hier passiert alles im Browser: der Hintergrund wird frame für frame lokal entfernt, ohne dass eine Sekunde dein Gerät verlässt. Basis ist BiRefNet_lite (MIT, ACCV 2024 Best-in-Class für feine Haar- und Fellkanten — Unscreen-Alternative ohne Login)."
howToUse:
  - "Video per Drag-and-Drop ablegen oder über den Datei-Dialog öffnen (MP4, MOV, WebM, bis FullHD 1920×1080, bis 500&nbsp;MB)"
  - "Modell wählen: Qualität (BiRefNet_lite — SOTA Haar) oder Schnell (MODNet — für lange Videos)"
  - "Hintergrund-Modus auswählen: Transparent, Einfarbig, Bild oder Video"
  - "Modell-Download abwarten (ca. 4 s bei 100&nbsp;Mbit — danach gecacht, kein zweiter Download)"
  - "Fertiges Video herunterladen oder zusätzlich als PNG-Sequenz für Post-Production exportieren"
faq:
  - q: "Wie entferne ich den Hintergrund aus einem Video ohne Upload?"
    a: "Du ziehst das Video in die Drop-Zone auf dieser Seite. Das KI-Modell läuft direkt in deinem Browser über WebGPU — kein Server erhält deine Datei. Das Ergebnis lädst du anschließend als WebM oder MP4 herunter."
  - q: "Was ist eine kostenlose Alternative zu Unscreen?"
    a: "Dieses Tool ersetzt Unscreen für den häufigsten Anwendungsfall: Hintergrund aus einem Personenvideo entfernen, ohne Upload, ohne Login, ohne Wasserzeichen. Unscreen wurde am 01.12.2025 abgeschaltet."
  - q: "Welche Browser werden unterstützt?"
    a: "Chrome 113+, Edge 113+ und Safari 17.4+ unterstützen WebGPU vollständig. Firefox hat WebGPU seit Version 141 als Standard aktiviert. iOS Safari 17.4–18.x benötigt eine manuelle Flag-Aktivierung — dort läuft das Modell automatisch im langsameren CPU-Modus (ca. 3–5× langsamer). iOS Safari 26+ unterstützt WebGPU nativ."
  - q: "Welche Ausgabe-Formate gibt es?"
    a: "Transparent: WebM mit VP9+Alpha (Chrome, Firefox, Edge) oder MP4 mit Greenscreen #00FF00 für Safari, da Safari VP9-Alpha nicht unterstützt. Einfarbig und Bild-Hintergrund: MP4 mit H.264. Als Zweit-Export steht eine PNG-Sequenz als ZIP zur Verfügung — für DaVinci Resolve, Premiere Pro und After Effects."
  - q: "Was bedeutet Flimmern an Haarkanten?"
    a: "BiRefNet_lite ist ein Bild-Modell, kein Video-Modell. Es verarbeitet jeden Frame unabhängig und hat kein Gedächtnis für vorherige Frames. An feinen Haarkanten kann die Alpha-Maske von Frame zu Frame um 1–2 Pixel schwanken, was als Flimmern sichtbar wird. Der Modus Qualität minimiert das — für maximale Stabilität empfiehlt sich nachträgliches Edge-Smoothing in der Schnitt-Software."
  - q: "Welche Auflösungen werden unterstützt?"
    a: "Das Tool verarbeitet Videos bis FullHD (1920×1080). Dateien mit höherer Auflösung werden abgewiesen — Browser-ML-Modelle arbeiten intern mit maximal 1024×1024 Pixel; 4K würde unkontrolliertes Resampling erzeugen und die Kantenschärfe verschlechtern. Für Dateien über 500&nbsp;MB zeigt das Tool eine Warnung mit geschätzter Verarbeitungszeit."
relatedTools:
  - hevc-zu-h264
  - hintergrund-entfernen
  - webcam-hintergrund-unschaerfe
category: video
contentVersion: 1
datePublished: '2026-04-24'
dateModified: '2026-04-25'

---

## Warum alle anderen dein Video hochladen müssen

Jeder cloud-basierte Dienst für Video-Hintergrundentfernung — Kapwing, VEED,
Runway, CapCut, removebgvideo.com — muss dein Video zuerst auf seinen Server
übertragen, dort verarbeiten und dir dann eine Download-URL zurückgeben. Das
ist kein Designfehler, sondern architektonisch unvermeidlich: ML-Inferenz auf
einem GPU-Cluster kostet Geld, das über Abonnements, Wasserzeichen, Credits
oder Werbeeinnahmen refinanziert wird.

Das Problem für private Aufnahmen: du hast keine Kontrolle darüber, was mit
dem Video auf dem Server passiert, wie lange es gespeichert bleibt oder ob es
in Trainingsdaten eingeflossen ist. Unscreens abrupte Abschaltung im Dezember
2025 hat demonstriert, was Cloud-Abhängigkeit bedeutet — alle hochgeladenen
Videos wurden mit dem Dienst gelöscht, ohne Vorwarnung.

WebGPU ändert diese Gleichung. Moderne Browser können das KI-Modell lokal
ausführen, indem sie direkt auf die Grafikkarte deines Geräts zugreifen.
Das Modell lädt einmalig (ca. 50&nbsp;MB für BiRefNet_lite), wird im Browser-Cache
gespeichert und steht danach sofort zur Verfügung — auch offline.

## Wie die Hintergrundentfernung funktioniert

Das Tool kombiniert drei Browser-APIs, die seit 2024 in allen modernen
Desktops verfügbar sind:

**WebCodecs** dekodiert dein Video frame für frame, ohne dass du einen
Codec-Wrapper oder eine externe Bibliothek installieren musst. Der Browser
nutzt dabei den eingebauten Hardware-Decoder deiner GPU — denselben, der auch
beim Streaming eingesetzt wird.

**WebGPU** führt das ONNX-Modell (BiRefNet_lite oder MODNet) direkt auf der
GPU aus. Für jeden Frame erzeugt das Modell eine Alpha-Maske: ein
Graustufen-Bild, das für jeden Pixel angibt, wie stark er zum Vordergrund
gehört. BiRefNet_lite verarbeitet dabei Eingaben in 512 × 512 Pixel und
restituiert das Ergebnis auf die Originalauflösung.

**Mediabunny** kombiniert den maskierten Frame mit dem gewählten Hintergrund
(transparent, Farbe, Bild oder Video) und kodiert das Ergebnis zurück. Bei
transparenter Ausgabe auf Chrome, Firefox und Edge entsteht ein WebM-Container
mit VP9+Alpha-Kanal — das Format, das DaVinci Resolve und Premiere Pro
einlesen können. Safari beherrscht VP9-Alpha nicht (WebCodecs-Spezifikation,
Issue #377, Stand April 2026); dort wird automatisch ein MP4 mit
Greenscreen-Farbe `#00FF00` ausgegeben, das du in deiner Schnitt-Software
als Chroma-Key entfernen kannst.

## Wie wähle ich das richtige Modell?

Der Modus **Qualität** verwendet BiRefNet_lite (MIT-Lizenz, ca. 50&nbsp;MB).
BiRefNet wurde auf dem ACCV 2024 als bestes Verfahren für dichotomische
Bildsegmentierung ausgezeichnet und zeigt besondere Stärke bei feinen
Haarkanten, Fell und Glasobjekten. Trainiert auf öffentlichen Datensätzen
(DIS5K, DUTS, HRSOD) ohne kommerzielle Einschränkungen.

Der Modus **Schnell** verwendet MODNet (Apache-2.0, ca. 25&nbsp;MB). MODNet ist
für Portrait-Aufnahmen optimiert und liefert auf modernen Laptops mit WebGPU
nahe Echtzeit-Performance. Die Haarkanten-Qualität liegt unter BiRefNet,
dafür ist es für lange Videos auf schwächeren Geräten die bessere Wahl.

Beide Modelle laufen vollständig im Browser. Eine Internetverbindung wird nur
für den initialen Modell-Download benötigt.

## Datenschutz und EU-KI-Gesetz

Das Video verlässt deinen Browser zu keinem Zeitpunkt. Es wird kein Cookie
gesetzt, das den Dateinamen oder die Auflösung deiner Datei erfasst. Keine
Anmeldung, keine E-Mail-Adresse, kein Konto.

Das Ergebnis-Video enthält im `done`-Zustand den Hinweis: *„Dieses Video
wurde mit KI bearbeitet (Hintergrund entfernt/ersetzt)."* Das entspricht der
Kennzeichnungspflicht des EU-KI-Gesetzes (Artikel 50), die ab dem
02.08.2026 für KI-manipulierte Medien gilt. Der Hinweis ist informativ und
nicht verbindlich für dich — die Verantwortung für eine sichtbare
Kennzeichnung beim Weiterveröffentlichen liegt bei dir.

Technisch-Details stehen in der <a href="/de/datenschutz">Datenschutzerklärung</a>.

## Welche Grenzen hat das Tool?

Ehrliche Erwartungsführung statt Marketingversprechen:

**Temporal-Konsistenz:** BiRefNet_lite ist ein Bild-Modell. Es kennt den
vorherigen Frame nicht. An Haarkanten in Bewegung kann das als Flimmern
sichtbar werden. Ein dediziertes Video-Matting-Modell (z. B. MatAnyone) wäre
robuster, ist aber zum Stand April 2026 nicht mit einer kommerziell
kompatiblen Lizenz verfügbar.

**Safari:** Transparenter WebM-Output ist nicht möglich. Safari erhält
automatisch MP4 mit Greenscreen-Farbe `#00FF00` als Fallback.

**WebGPU-Unterstützung:** iOS Safari 17.4–18.x schaltet WebGPU erst nach
manueller Flag-Aktivierung frei. Dort läuft das Modell im CPU-Modus —
die Verarbeitung dauert 3–5× länger.

**Auflösung:** Maximale Eingabe FullHD (1920×1080). Höhere Auflösungen werden
abgewiesen (D3 — Browser-ML-Modelle samplen 4K intern auf 1024px, was sichtbare
Weichzeichner-Artefakte auf Haarkanten erzeugt). **Dateigröße:** Soft-Limit 500&nbsp;MB.

## Häufige Fragen

### Wie entferne ich den Hintergrund aus einem Video ohne Upload?

Du ziehst das Video (bis FullHD 1920×1080, bis 500&nbsp;MB) in die Drop-Zone auf
dieser Seite. Das KI-Modell läuft direkt in deinem Browser — kein Server erhält
deine Datei. Das fertige Video lädst du als WebM (transparent) oder MP4 herunter.

### Was ist eine Alternative zu Unscreen?

Unscreen wurde am 01.12.2025 abgeschaltet. Dieses Tool deckt denselben
Anwendungsfall ab: Hintergrund aus Personenvideos entfernen, ohne Upload,
ohne Login, ohne Wasserzeichen. Der Output ist kompatibel mit den gängigen
Schnitt-Programmen (DaVinci Resolve, Premiere Pro, Final Cut Pro via
Greenscreen).

### Warum flimmert der Hintergrund an Haarkanten?

BiRefNet_lite berechnet für jeden Frame eine neue Alpha-Maske, ohne den
vorherigen Frame zu kennen. An Subpixel-Grenzen kann die Maske um 1–2 Pixel
schwanken, was als Flimmern sichtbar wird. Für maximale Stabilität empfiehlt
sich nachträgliches Edge-Smoothing in der Schnitt-Software oder ein
Weichzeichner auf der Maske.

### Bleiben Audio-Spuren erhalten?

In V1 nicht — das Ausgabe-Video enthält ausschließlich die Bild-Spur.
Hintergrund: WebM mit VP9+Alpha braucht Opus als Audio-Codec, MP4-Quellen
liefern aber meist AAC; ein verlustfreier Codec-Transcode überschreitet
den V1-Scope. Workflow-Empfehlung: Original-Video parallel offen lassen,
Audio in der Schnitt-Software (DaVinci Resolve, Premiere Pro, Final Cut)
auf das BG-entfernte Video legen — ohne Lippensync-Verschiebung, da
Frame-Rate und Frame-Anzahl beider Spuren identisch bleiben. Audio-
Passthrough ist auf der Phase-2-Roadmap.

### Was ist eine PNG-Sequenz und wofür brauche ich sie?

Eine PNG-Sequenz ist ein ZIP-Archiv mit jedem Frame deines Videos als
einzelner PNG-Datei mit Alpha-Kanal (`frame_0001.png`, `frame_0002.png`, …).
Post-Production-Software wie After Effects, DaVinci Resolve und Cinema 4D
kann PNG-Sequenzen direkt importieren — oft mit besserer Alpha-Qualität als
komprimierte Video-Codec-Alphas.

### Welche Modelle werden verwendet?

**BiRefNet_lite** (Modus Qualität): MIT-Lizenz, ZhengPeng 2024,
ACCV 2024 Best-in-Class Dichotomous Segmentation —
[GitHub](https://github.com/ZhengPeng7/BiRefNet).
**MODNet** (Modus Schnell): Apache-2.0, ZHKKKe 2020 —
[GitHub](https://github.com/ZHKKKe/MODNet).
**onnxruntime-web**: MIT, Microsoft. **Mediabunny**: MPL-2.0, Vanilagy.

## Welche Video-Tools sind verwandt?

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[HEVC zu H.264](/de/hevc-zu-h264)** — iPhone-Videos (HEVC/MOV) in universell abspielbares H.264-MP4 umwandeln, ebenfalls ohne Upload.
- **[Hintergrund entfernen](/de/hintergrund-entfernen)** — Hintergrund aus Einzelbildern (JPG, PNG, HEIC) freistellen, KI-basiert und ohne Upload.
- **[Webcam-Hintergrund unscharf](/de/webcam-hintergrund-unschaerfe)** — Hintergrund im Live-Kamerabild in Echtzeit weichzeichnen, für Video-Calls ohne virtuelle Räume.
