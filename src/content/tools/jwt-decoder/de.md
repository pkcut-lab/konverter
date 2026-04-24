---
toolId: "jwt-decoder"
language: "de"
title: "JWT Decoder — Token online auslesen"
headingHtml: "<em>JWT</em> Decoder"
metaDescription: "JWT-Token dekodieren — Header, Payload und Zeitstempel im Browser auslesen. Ablaufstatus prüfen, keine Signaturverifizierung, 100&nbsp;% client-side."
tagline: "JWT-Token dekodieren — Header und Payload direkt im Browser auslesen, ohne Server-Kontakt."
intro: "Der JWT Decoder zerlegt ein JSON Web Token in seine drei Segmente und zeigt Header und Payload als formatiertes JSON an. Zeitstempel-Claims wie iat, exp und nbf werden automatisch in lesbare Datumsangaben umgewandelt. Die gesamte Dekodierung läuft im Browser — kein Server sieht deinen Token."
category: "dev"
contentVersion: 1
howToUse:
  - "Füge deinen JWT-Token in das Eingabefeld ein — per Paste oder Drag & Drop."
  - "Header und Payload erscheinen sofort als formatiertes JSON."
  - "Zeitstempel werden automatisch in lesbare UTC-Datumsangaben umgerechnet."
  - "Der Ablaufstatus zeigt dir, ob der Token noch gültig, abgelaufen oder noch nicht aktiv ist."
faq:
  - q: "Was ist ein JWT?"
    a: "Ein JSON Web Token (JWT, ausgesprochen wie jot) besteht aus drei Base64url-kodierten Segmenten: Header, Payload und Signatur. Der Standard ist in RFC 7519 definiert und wird vor allem für Authentifizierung und Autorisierung in Web-APIs eingesetzt."
  - q: "Wird die Signatur verifiziert?"
    a: "Nein. Der Decoder liest nur Header und Payload aus. Signaturverifizierung erfordert den geheimen Schlüssel oder den öffentlichen Key — das ist ein serverseitiger Vorgang und kein Dekodier-Schritt."
  - q: "Was bedeuten iat, exp und nbf?"
    a: "iat (issued at) ist der Zeitpunkt der Token-Erstellung, exp (expiration) das Ablaufdatum und nbf (not before) der früheste Gültigkeitszeitpunkt. Alle drei sind Unix-Zeitstempel in Sekunden seit dem 1.&nbsp;Januar 1970."
  - q: "Werden meine Daten an einen Server geschickt?"
    a: "Nein. Die Dekodierung läuft vollständig im Browser über atob() und TextDecoder. Kein Byte verlässt dein Gerät, kein Logging, kein Tracking."
  - q: "Kann ich auch abgelaufene Token dekodieren?"
    a: "Ja. Der Decoder zeigt den Inhalt unabhängig vom Ablaufstatus an. Ein abgelaufener Token enthält weiterhin lesbare Claims — nur die Signaturprüfung auf dem Server schlägt fehl."
relatedTools:
  - base64-encoder
  - json-formatter
  - hash-generator
---

## Was macht der Decoder?

Der JWT Decoder nimmt einen vollständigen JWT-String und zerlegt ihn in seine drei Bestandteile: Header, Payload und Signatur. Die ersten beiden Segmente werden per Base64url dekodiert und als eingerücktes JSON dargestellt. Das dritte Segment (die Signatur) wird bewusst nicht verifiziert — dafür wäre der geheime Schlüssel nötig, der auf dem Server liegt.

Zusätzlich erkennt der Decoder Zeitstempel-Claims (iat, exp, nbf) und rechnet die Unix-Timestamps in lesbare UTC-Datumsangaben um. Ein Statusfeld zeigt auf einen Blick, ob der Token gültig, abgelaufen oder noch nicht aktiv ist.

## Umrechnungsformel

JWT-Dekodierung arbeitet auf String-Ebene, nicht auf kryptografischer Ebene. Der Algorithmus:

1. Der JWT-String wird am Punkt (`.`) in drei Segmente aufgeteilt.
2. URL-sichere Zeichen werden zurückgewandelt: `-` wird zu `+`, `_` wird zu `/`.
3. Fehlende Base64-Padding-Zeichen (`=`) werden ergänzt.
4. Das Ergebnis wird per `atob()` in einen Binärstring dekodiert und als UTF-8-JSON geparst.

Beispiel: Das Segment `eyJhbGciOiJIUzI1NiJ9` dekodiert zu `{"alg":"HS256"}`. Die Formel `ceil(n / 3) * 4` beschreibt die Base64-Länge — beim Dekodieren läuft sie rückwärts.

## Anwendungsbeispiele

| Szenario | Was der Decoder zeigt |
|----------|----------------------|
| API-Debugging | Header-Algorithmus (HS256, RS256) und Payload-Claims im Klartext |
| Token-Ablauf prüfen | exp-Claim als Datum plus Gültigkeitsstatus |
| OAuth-Fehlersuche | Scopes, Issuer und Audience aus dem Payload extrahieren |
| Entwickler-Onboarding | Aufbau eines JWT verstehen, ohne Code schreiben zu müssen |
| CI/CD-Pipeline-Logs | Token-Inhalte schnell prüfen, ohne jq oder Kommandozeilen-Tools |

JWTs sind Base64url-kodiert, nicht verschlüsselt. Jeder kann den Inhalt lesen — sensible Daten gehören nie unverschlüsselt in den Payload.

## Häufige Einsatzgebiete

**API-Authentifizierung und OAuth 2.0** — Die meisten REST-APIs nutzen JWTs als Bearer-Token im Authorization-Header. Entwickler dekodieren sie, um Claims wie sub (Subject), iss (Issuer) und aud (Audience) zu prüfen, bevor sie Fehlersuche am Server starten.

**Single-Sign-On (SSO)** — Identity-Provider wie Auth0, Keycloak oder Azure AD liefern JWTs nach erfolgreicher Anmeldung. Der Decoder hilft, die enthaltenen Rollen und Berechtigungen zu inspizieren, ohne den gesamten SSO-Flow erneut durchlaufen zu müssen.

**Microservice-Kommunikation** — In Service-Mesh-Architekturen tragen JWTs Claims zwischen Diensten. Wenn ein Service einen 401 oder 403 zurückgibt, zeigt der dekodierte Token oft sofort, welcher Claim fehlt oder abgelaufen ist.

## Häufige Fragen

Die Antworten auf die wichtigsten Fragen findest du oben im FAQ-Block — sie werden als strukturiertes JSON-LD (FAQPage) für Suchmaschinen ausgegeben.

## Verwandte Entwickler-Tools

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[Base64 Encoder](/de/base64-encoder)** — Text in Base64 kodieren, das Basisformat hinter JWT-Segmenten.
- **[JSON Formatter](/de/json-formatter)** — Rohen JSON-Code mit Einrückung lesbar formatieren und validieren.
- **[Hash-Generator](/de/hash-generator)** — SHA-256- und andere Hashes erzeugen, wie sie in JWT-Signaturen zum Einsatz kommen.
