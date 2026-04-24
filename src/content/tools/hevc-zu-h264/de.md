---
toolId: hevc-to-h264
language: de
title: "iPhone-Video in MP4 umwandeln — HEVC zu H.264 Konverter"
headingHtml: "iPhone-Video in <em>MP4</em> umwandeln"
metaDescription: "Wandle iPhone-HEVC-Videos in H.264-MP4 um — direkt im Browser, ohne Upload, ohne Anmeldung, kostenlos. Dein Video verlässt deinen Rechner nicht."
tagline: "Direkt im Browser — ohne Upload, ohne Wasserzeichen."
intro: "iPhones nehmen Videos seit iOS 11 standardmäßig als HEVC (H.265) im MOV-Container auf. Das spart Speicherplatz, sorgt aber bei älteren Windows-Rechnern, Samsung-Fernsehern, Photoshop-Versionen vor 2023 oder WhatsApp-Web für schwarze Bildschirme und Fehlermeldungen. Dieser Konverter wandelt HEVC-MOV-Dateien in ein universell abspielbares H.264-MP4 um — vollständig in deinem Browser, ohne Server-Upload, ohne Anmeldung und ohne Wasserzeichen. Die eigentliche Konvertierung läuft über die native WebCodecs-API deines Browsers und nutzt die Hardware-Beschleunigung deiner GPU. Das macht die Umwandlung schnell genug, dass ein 1080p-Video in etwa Echtzeit-Geschwindigkeit durchläuft."
howToUse:
  - "HEVC- oder MOV-Datei per Drag-and-Drop ablegen oder über die Auswahl öffnen (bis 500&nbsp;MB)"
  - "Qualitäts-Preset wählen: Original-Qualität · Balanced · Klein"
  - "Bei 4K-Quellen optional auf 1080p verkleinern aktivieren"
  - "Konvertiertes H.264-MP4 herunterladen, sobald der Fortschritt 100&nbsp;% erreicht"
faq:
  - q: "Wie wandle ich ein iPhone-Video in MP4 um ohne es hochzuladen?"
    a: "Du öffnest diese Seite, ziehst die HEVC- oder MOV-Datei in die Drop-Zone und lädst die fertige MP4-Datei herunter. Die Konvertierung läuft vollständig in deinem Browser über die WebCodecs-API. Das Video verlässt dein Gerät zu keinem Zeitpunkt."
  - q: "Was passiert mit HDR- oder Dolby-Vision-Videos?"
    a: "HDR-Metadaten (Dolby Vision, HDR10) gehen bei der Konvertierung zu H.264 verloren, weil das H.264-Format kein HDR unterstützt. Auf normalen SDR-Bildschirmen sieht dein Video danach unverändert aus. Auf HDR-Bildschirmen wirken Farben und Kontraste etwas flacher als im Original. Betroffen sind nur iPhones mit aktiver HDR-Video-Einstellung — die meisten Aufnahmen sind normales SDR und verlieren nichts."
  - q: "Bleibt die Original-Auflösung erhalten?"
    a: "Ja. 4K-Quellen werden standardmäßig als 4K-MP4 ausgegeben, 1080p bleibt 1080p, 720p bleibt 720p. Nur wenn du das Opt-in-Häkchen „Auf 1080p verkleinern\" setzt, reduzieren wir 4K auf Full-HD. Andere Konverter skalieren still auf 1080p herunter — wir behalten die Quell-Auflösung bewusst bei."
  - q: "Welche maximale Dateigröße wird unterstützt?"
    a: "500&nbsp;MB. Darüber steigt das Risiko, dass der Browser den verfügbaren Arbeitsspeicher überschreitet und abstürzt — besonders auf iPhones. Für Safari auf iOS empfehlen wir Dateien bis 250&nbsp;MB. Auf einem Desktop-Browser gehen die vollen 500&nbsp;MB meist problemlos."
  - q: "Welche Browser werden unterstützt?"
    a: "Chrome 99+, Edge 99+, Safari 16.4+ und Firefox 130+ auf dem Desktop. Firefox für Android unterstützt WebCodecs noch nicht vollständig — dort erscheint ein klarer Hinweis. iPhone-Safari ab iOS 16.4 funktioniert."
  - q: "Bleiben Aufnahmedatum und Ortsdaten erhalten?"
    a: "Ja. Der Konverter übernimmt das Erstellungsdatum und — falls im Original vorhanden — die GPS-Koordinaten in die fertige MP4-Datei. Viele Konkurrenzdienste entfernen diese Metadaten stillschweigend, was Foto-Chronologien durcheinanderbringt."
relatedTools:
  - webp-konverter
  - hintergrund-entfernen
  - meter-zu-fuss
category: video
contentVersion: 1
---

## Warum spielt mein iPhone-Video nicht überall?

Seit iOS 11 nehmen iPhones Videos standardmäßig im HEVC-Codec auf
(auch bekannt als H.265). HEVC speichert dieselbe Bildqualität in etwa der
halben Dateigröße von H.264 — das spart iPhone-Speicher und iCloud-Plätze.
Der Preis: HEVC ist nicht überall abspielbar. Windows-Rechner ohne
installierten HEVC-Codec zeigen einen schwarzen Bildschirm. Photoshop-Versionen
vor 2023 importieren die MOV-Datei nicht. Samsung-Fernseher älterer Generationen
springen beim Abspielen auf ein rotes Fehler-Icon. WhatsApp-Web verweigert
den Upload. Selbst manche Cloud-Dienste rechnen HEVC-Videos beim Upload
stumm in eine grobe H.264-Version um und liefern Oma ein verpixeltes Ergebnis.

Das H.264-Format (auch AVC genannt) ist seit 2004 der Universal-Baseline-Codec.
Jeder Browser, jeder Fernseher der letzten 15&nbsp;Jahre, jedes
Video-Schnitt-Programm versteht es. Wer ein iPhone-Video zuverlässig mit
fremder Hardware teilen will, muss es umcodieren. Genau das macht dieses Tool —
ohne dass du die Datei auf einen fremden Server laden musst und ohne dass du
dafür eine Desktop-Software installierst.

## HEVC vs. H.264 — was ist der Unterschied?

HEVC und H.264 sind beides verlustbehaftete Video-Kompressions-Standards. Sie
zerlegen ein Video in Schlüsselbilder (Keyframes) und Differenzbilder, die nur
die Veränderung zum Vorgänger speichern. HEVC nutzt feinere Analyse-Blöcke
(bis 64×64 Pixel statt 16×16), intelligentere Bewegungs-Vorhersage und bessere
Entropie-Kodierung. Ergebnis: bei gleicher Qualität ist ein HEVC-Video rund
40 bis 50 Prozent kleiner als ein H.264-Video.

Der Haken liegt in der Lizenz-Landschaft. HEVC-Patente werden von drei
verschiedenen Patentpools verwaltet (MPEG LA, HEVC Advance, Velos Media),
plus einer Gruppe von Rechte-Inhabern, die keinem Pool angehören. Für
Geräte-Hersteller sind die Lizenzkosten so hoch und unübersichtlich, dass
viele Browser-Hersteller HEVC erst nach Jahren oder gar nicht eingebaut haben.
Chrome hat HEVC erst 2023 nativ freigeschaltet, und nur dann, wenn die
Hardware einen passenden Decoder mitbringt. Firefox-Android fehlt bis heute.

H.264 dagegen ist seit 2013 effektiv patentfrei zugänglich — das
grundlegende Patent-Portfolio der MPEG-LA lief schrittweise aus. H.264 wird
von praktisch allen Betriebssystemen, Browsern und Playern der letzten
Dekade hardware-beschleunigt dekodiert. Es ist damit das sichere
Ziel-Format, wenn „muss überall laufen" wichtiger ist als „minimale
Dateigröße".

<div class="compare">
  <div class="plus">
    <h3>H.264 — pro universelle Wiedergabe</h3>
    <ul>
      <li>Läuft auf jedem Gerät der letzten 15&nbsp;Jahre nativ</li>
      <li>Hardware-Dekodierung in jedem modernen Browser</li>
      <li>Patentfrei zugänglich seit 2013 — keine Lizenz-Hürden</li>
      <li>Universell akzeptiert von WhatsApp, Video-Schnitt, Smart-TVs</li>
    </ul>
  </div>
  <div class="minus">
    <h3>HEVC — contra Kompatibilität</h3>
    <ul>
      <li>Schwarzer Bildschirm auf vielen Windows-Rechnern</li>
      <li>Blockiert WhatsApp-Web und ältere Social-Media-Uploads</li>
      <li>Photoshop vor 2023 importiert MOV-HEVC nicht</li>
      <li>Samsung-Fernseher älterer Generationen verweigern Abspielen</li>
    </ul>
  </div>
</div>

## Anwendungsbeispiele

Drei typische Situationen, in denen eine Umwandlung nötig wird:

<ol class="usecases">
  <li>
    <h3>Familien-Videos teilen</h3>
    <p>Opa bekommt per WhatsApp ein MOV-Video vom Enkelkind und sieht einen schwarzen Bildschirm. Die Konvertierung in MP4 macht das Video auf jedem Smartphone, jedem Windows-Rechner und jedem Smart-TV abspielbar.</p>
  </li>
  <li>
    <h3>Video-Schnitt vorbereiten</h3>
    <p>Wer mit DaVinci Resolve, Adobe Premiere vor 2024 oder iMovie auf älteren Macs arbeitet, importiert HEVC-MOV-Dateien manchmal nur mit Proxy-Zwischenschritten. Ein H.264-MP4 erspart den Umweg.</p>
  </li>
  <li>
    <h3>Social-Media-Uploads</h3>
    <p>YouTube, Twitter/X und LinkedIn akzeptieren HEVC inzwischen, aber die Transcoding-Qualität schwankt. Wer die Kontrolle behalten will, liefert direkt ein H.264-MP4.</p>
  </li>
</ol>

## Datenschutz — dein Video verlässt nie deinen Browser

Die Konvertierung läuft ausschließlich in deinem Browser. Das Video wird nicht
auf einen Server hochgeladen, nicht an einen externen Dienst weitergereicht
und nach dem Schließen des Tabs aus dem Arbeitsspeicher gelöscht. Wir
verwenden dafür die WebCodecs-API — eine native Browser-Schnittstelle, die
deinen eingebauten Hardware-Video-Encoder direkt ansteuert. Derselbe Chip,
der auch beim Videotelefonat die Bildkompression erledigt.

Es gibt kein Cookie-Banner für externe Video-CDNs, keine Anmeldung und keine
anonymen Nutzungsstatistiken, die Dateinamen oder Auflösungen mittracken. Die
einzige Netzwerkverbindung, die der Browser beim Laden dieser Seite herstellt,
ist der initiale Seitenaufruf selbst — die Encoder-Bibliothek (Mediabunny,
etwa 70&nbsp;KB) wird als Teil der Seite ausgeliefert, nicht von einem fremden
CDN nachgezogen.

Für vertrauliche Aufnahmen — Hochzeitsvideos, medizinische Aufnahmen,
Firmen-interne Dokumentationen — ist das der entscheidende Unterschied zu
cloud-basierten Konvertern. Weitere Details stehen in der
<a href="/de/datenschutz">Datenschutzerklärung</a>.

## Grenzen dieses Tools

Ehrliche Erwartungsführung ist uns wichtiger als Marketing-Versprechen:

<dl class="limits">
  <div class="limits__row">
    <span class="limits__num">01</span>
    <dt>Max. Dateigröße</dt>
    <dd class="mono">500&nbsp;MB (Desktop) · 250&nbsp;MB (iOS)</dd>
  </div>
  <div class="limits__row">
    <span class="limits__num">02</span>
    <dt>Auflösungs-Skalierung</dt>
    <dd>Nur auf Opt-in — sonst bleibt 4K auch 4K</dd>
  </div>
  <div class="limits__row">
    <span class="limits__num">03</span>
    <dt>HDR / Dolby Vision</dt>
    <dd>Metadaten gehen verloren (H.264 ist SDR)</dd>
  </div>
  <div class="limits__row">
    <span class="limits__num">04</span>
    <dt>Browser-Voraussetzung</dt>
    <dd class="mono">WebCodecs · Chrome 99+ / Safari 16.4+</dd>
  </div>
</dl>

**Dateigrößen-Obergrenze 500&nbsp;MB.** Darüber steigt das Risiko, dass der
Browser-Speicher überläuft. Auf iPhones empfehlen wir sogar schon ab 250&nbsp;MB
Vorsicht — iOS-Safari räumt Tabs bei Speicher-Knappheit aggressiv ab, was
mitten im Encode zu einem Absturz führen kann. Desktop-Browser mit 16&nbsp;GB RAM
kommen mit den vollen 500&nbsp;MB in der Regel problemlos klar.

**4K bleibt 4K, 1080p bleibt 1080p.** Wir rechnen die Auflösung nicht
stillschweigend herunter — das ist ein bewusster Unterschied zu vielen
Online-Konvertern. Wer ein kleineres Zieldatei-Volumen möchte, wählt das
Preset „Klein" (reduziert die Bitrate) oder aktiviert für 4K-Quellen
zusätzlich das Opt-in-Häkchen „Auf 1080p verkleinern".

**HDR- und Dolby-Vision-Metadaten gehen verloren.** H.264 ist ein 8-Bit-
SDR-Format (Rec. 709). Die erweiterten Farbräume und Tonkurven von HDR10 und
Dolby Vision haben in H.264 keinen Platz. Auf normalen Bildschirmen wirkt
das Ergebnis identisch zum Original. Auf HDR-Displays werden Farben und
Kontraste etwas flacher. Die technischen Details stehen in der FAQ unten.

## Häufige Fragen

Die häufigsten Rückfragen zur Nutzung und zum Datenschutz des Tools:

### Wie wandle ich ein iPhone-Video in MP4 um ohne es hochzuladen?

Du öffnest diese Seite, ziehst die HEVC- oder MOV-Datei in die Drop-Zone und
lädst die fertige MP4-Datei herunter. Die Konvertierung läuft vollständig
in deinem Browser über die WebCodecs-API. Das Video verlässt dein Gerät zu
keinem Zeitpunkt.

### Was passiert mit HDR- oder Dolby-Vision-Videos?

HDR-Metadaten (Dolby Vision, HDR10) gehen bei der Konvertierung zu H.264
verloren, weil das H.264-Format kein HDR unterstützt. Auf normalen
SDR-Bildschirmen sieht dein Video danach unverändert aus. Auf HDR-Bildschirmen
wirken Farben und Kontraste etwas flacher als im Original. Betroffen sind
nur iPhones mit aktiver HDR-Video-Einstellung — die meisten Aufnahmen sind
normales SDR und verlieren nichts.

### Bleibt die Original-Auflösung erhalten?

Ja. 4K-Quellen werden standardmäßig als 4K-MP4 ausgegeben, 1080p bleibt
1080p, 720p bleibt 720p. Nur wenn du das Opt-in-Häkchen „Auf 1080p
verkleinern" setzt, reduzieren wir 4K auf Full-HD. Andere Konverter skalieren
still auf 1080p herunter — wir behalten die Quell-Auflösung bewusst bei.

### Welche maximale Dateigröße wird unterstützt?

500&nbsp;MB. Darüber steigt das Risiko, dass der Browser den verfügbaren
Arbeitsspeicher überschreitet und abstürzt — besonders auf iPhones. Für
Safari auf iOS empfehlen wir Dateien bis 250&nbsp;MB. Auf einem Desktop-Browser
gehen die vollen 500&nbsp;MB meist problemlos.

### Welche Browser werden unterstützt?

Chrome 99+, Edge 99+, Safari 16.4+ und Firefox 130+ auf dem Desktop.
Firefox für Android unterstützt WebCodecs noch nicht vollständig — dort
erscheint ein klarer Hinweis. iPhone-Safari ab iOS 16.4 funktioniert.

### Bleiben Aufnahmedatum und Ortsdaten erhalten?

Ja. Der Konverter übernimmt das Erstellungsdatum und — falls im Original
vorhanden — die GPS-Koordinaten in die fertige MP4-Datei. Viele
Konkurrenzdienste entfernen diese Metadaten stillschweigend, was
Foto-Chronologien durcheinanderbringt.

## Verwandte Video-Tools

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[WebP-Konverter](/de/webp-konverter)** — Bilder in das moderne WebP-Format umwandeln, ebenfalls
  vollständig im Browser.
- **[Hintergrund entfernen](/de/hintergrund-entfernen)** — Motive aus Fotos freistellen, KI-basiert und
  ohne Upload.
- **[Meter zu Fuß](/de/meter-zu-fuss)** — schnelle Längen-Umrechnung mit Schritt-für-Schritt-Rechenweg.
