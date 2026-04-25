/**
 * Kategorie-Defaults für den "So funktioniert es"-Accordion.
 *
 * Jedes Tool rendert den Accordion automatisch aus diesen Defaults, SOFERN
 * das Content-File kein eigenes `aside:`-Feld enthält. Individuelle Overrides
 * in der Content-Datei überschreiben den gesamten Default-Block.
 *
 * Änderungen hier propagieren sofort auf alle Tools des jeweiligen Typs —
 * keine 1000+ Content-Dateien editieren nötig.
 *
 * Neuen Tool-Typ hinzufügen → einfach neuen Eintrag hier anlegen.
 */

export interface AsideStep {
  title: string;
  description: string;
}

export interface AsideData {
  steps: AsideStep[];
  privacy: string;
}

const PRIVACY_DEFAULT_DE =
  'Alle Berechnungen laufen direkt in deinem Browser. Keine Daten werden auf Server übertragen.';

const PRIVACY_FILE_DE =
  'Deine Dateien verlassen dein Gerät zu keinem Zeitpunkt. Die gesamte Verarbeitung läuft lokal.';

export const asideDefaults: Partial<Record<string, AsideData>> = {
  converter: {
    steps: [
      {
        title: 'Wert eingeben',
        description: 'Gib den Ausgangswert in das Eingabefeld ein.',
      },
      {
        title: 'Sofortige Umrechnung',
        description: 'Das Ergebnis erscheint automatisch – kein Button nötig.',
      },
      {
        title: 'Kopieren',
        description: 'Klick auf den Ergebniswert um ihn in die Zwischenablage zu kopieren.',
      },
    ],
    privacy: PRIVACY_DEFAULT_DE,
  },

  'file-tool': {
    steps: [
      {
        title: 'Datei auswählen',
        description: 'Ziehe deine Datei in das Upload-Feld oder klick darauf um sie auszuwählen.',
      },
      {
        title: 'Lokale Verarbeitung',
        description: 'Das Tool verarbeitet die Datei vollständig auf deinem Gerät.',
      },
      {
        title: 'Ergebnis herunterladen',
        description: 'Lade das fertige Ergebnis mit einem Klick herunter.',
      },
    ],
    privacy: PRIVACY_FILE_DE,
  },

  formatter: {
    steps: [
      {
        title: 'Text oder Code einfügen',
        description: 'Füge deinen Inhalt in das Eingabefeld ein oder tippe direkt.',
      },
      {
        title: 'Automatische Verarbeitung',
        description: 'Das Tool verarbeitet den Inhalt sofort und zeigt das Ergebnis.',
      },
      {
        title: 'Ergebnis kopieren',
        description: 'Kopiere das Ergebnis mit einem Klick in die Zwischenablage.',
      },
    ],
    privacy: PRIVACY_DEFAULT_DE,
  },

  generator: {
    steps: [
      {
        title: 'Parameter einstellen',
        description: 'Passe die Einstellungen nach deinen Wünschen an.',
      },
      {
        title: 'Generieren',
        description: 'Klick auf den Button um einen neuen Wert zu generieren.',
      },
      {
        title: 'Kopieren',
        description: 'Kopiere das Ergebnis direkt in die Zwischenablage.',
      },
    ],
    privacy: 'Alle Werte werden lokal in deinem Browser generiert. Keine Daten werden übertragen.',
  },

  validator: {
    steps: [
      {
        title: 'Eingabe einfügen',
        description: 'Füge den zu prüfenden Inhalt in das Eingabefeld ein.',
      },
      {
        title: 'Sofortige Validierung',
        description: 'Das Tool prüft direkt ob die Eingabe gültig ist und zeigt Details.',
      },
      {
        title: 'Ergebnis ablesen',
        description: 'Gültige Eingaben werden grün, Fehler rot hervorgehoben.',
      },
    ],
    privacy: PRIVACY_DEFAULT_DE,
  },

  analyzer: {
    steps: [
      {
        title: 'Text eingeben',
        description: 'Füge den zu analysierenden Text in das Eingabefeld ein.',
      },
      {
        title: 'Analyse',
        description: 'Das Tool analysiert den Inhalt sofort und zeigt detaillierte Statistiken.',
      },
      {
        title: 'Ergebnisse verwenden',
        description: 'Nutze die Analyse-Daten direkt oder kopiere sie weiter.',
      },
    ],
    privacy: 'Alle Analysen laufen lokal in deinem Browser. Dein Text wird nicht übertragen.',
  },

  comparer: {
    steps: [
      {
        title: 'Inhalte einfügen',
        description: 'Füge den ersten Inhalt links und den zweiten Inhalt rechts ein.',
      },
      {
        title: 'Unterschiede anzeigen',
        description: 'Das Tool hebt alle Unterschiede zwischen den zwei Versionen hervor.',
      },
      {
        title: 'Ergebnis exportieren',
        description: 'Kopiere oder lade das Vergleichs-Ergebnis herunter.',
      },
    ],
    privacy: PRIVACY_DEFAULT_DE,
  },

  interactive: {
    steps: [
      {
        title: 'Gerät verbinden',
        description: 'Erlaube den Zugriff auf dein Gerät wenn der Browser fragt.',
      },
      {
        title: 'Einstellungen anpassen',
        description: 'Passe die Parameter nach deinen Wünschen an.',
      },
      {
        title: 'Ergebnis nutzen',
        description: 'Das Ergebnis wird direkt in deinem Browser angezeigt und verarbeitet.',
      },
    ],
    privacy: 'Alle Verarbeitungsschritte laufen lokal. Keine Daten verlassen deinen Browser.',
  },
};
