import type { Lang } from '../tools/types';

export interface AsideStep {
  title: string;
  description: string;
}

export interface AsideData {
  steps: AsideStep[];
  privacy: string;
}

const asideDefaultsByLang: Partial<Record<string, Partial<Record<Lang, AsideData>>>> = {
  converter: {
    de: {
      steps: [
        { title: 'Wert eingeben',       description: 'Gib den Ausgangswert in das Eingabefeld ein.' },
        { title: 'Sofortige Umrechnung',description: 'Das Ergebnis erscheint automatisch – kein Button nötig.' },
        { title: 'Kopieren',            description: 'Klick auf den Ergebniswert um ihn in die Zwischenablage zu kopieren.' },
      ],
      privacy: 'Alle Berechnungen laufen direkt in deinem Browser. Keine Daten werden auf Server übertragen.',
    },
    en: {
      steps: [
        { title: 'Enter a value',    description: 'Type the value you want to convert into the input field.' },
        { title: 'Instant result',   description: 'The result appears automatically — no button needed.' },
        { title: 'Copy',             description: 'Click the result value to copy it to your clipboard.' },
      ],
      privacy: 'All calculations run directly in your browser. No data is sent to any server.',
    },
  },

  'file-tool': {
    de: {
      steps: [
        { title: 'Datei auswählen',     description: 'Ziehe deine Datei in das Upload-Feld oder klick darauf um sie auszuwählen.' },
        { title: 'Lokale Verarbeitung', description: 'Das Tool verarbeitet die Datei vollständig auf deinem Gerät.' },
        { title: 'Ergebnis herunterladen', description: 'Lade das fertige Ergebnis mit einem Klick herunter.' },
      ],
      privacy: 'Deine Dateien verlassen dein Gerät zu keinem Zeitpunkt. Die gesamte Verarbeitung läuft lokal.',
    },
    en: {
      steps: [
        { title: 'Select a file',       description: 'Drag your file into the drop zone or click to browse.' },
        { title: 'Local processing',    description: 'The tool processes your file entirely on your device.' },
        { title: 'Download result',     description: 'Download the finished result with a single click.' },
      ],
      privacy: 'Your files never leave your device. All processing happens locally in your browser.',
    },
  },

  formatter: {
    de: {
      steps: [
        { title: 'Text oder Code einfügen', description: 'Füge deinen Inhalt in das Eingabefeld ein oder tippe direkt.' },
        { title: 'Automatische Verarbeitung', description: 'Das Tool verarbeitet den Inhalt sofort und zeigt das Ergebnis.' },
        { title: 'Ergebnis kopieren',   description: 'Kopiere das Ergebnis mit einem Klick in die Zwischenablage.' },
      ],
      privacy: 'Alle Berechnungen laufen direkt in deinem Browser. Keine Daten werden auf Server übertragen.',
    },
    en: {
      steps: [
        { title: 'Paste text or code',  description: 'Paste your content into the input field or type directly.' },
        { title: 'Instant processing',  description: 'The tool processes your content immediately and shows the result.' },
        { title: 'Copy result',         description: 'Copy the result to your clipboard with one click.' },
      ],
      privacy: 'All calculations run directly in your browser. No data is sent to any server.',
    },
  },

  generator: {
    de: {
      steps: [
        { title: 'Parameter einstellen', description: 'Passe die Einstellungen nach deinen Wünschen an.' },
        { title: 'Generieren',           description: 'Klick auf den Button um einen neuen Wert zu generieren.' },
        { title: 'Kopieren',             description: 'Kopiere das Ergebnis direkt in die Zwischenablage.' },
      ],
      privacy: 'Alle Werte werden lokal in deinem Browser generiert. Keine Daten werden übertragen.',
    },
    en: {
      steps: [
        { title: 'Adjust settings',     description: 'Configure the options to match your requirements.' },
        { title: 'Generate',            description: 'Click the button to generate a new value.' },
        { title: 'Copy',                description: 'Copy the result directly to your clipboard.' },
      ],
      privacy: 'All values are generated locally in your browser. Nothing is transmitted.',
    },
  },

  validator: {
    de: {
      steps: [
        { title: 'Eingabe einfügen',    description: 'Füge den zu prüfenden Inhalt in das Eingabefeld ein.' },
        { title: 'Sofortige Validierung', description: 'Das Tool prüft direkt ob die Eingabe gültig ist und zeigt Details.' },
        { title: 'Ergebnis ablesen',    description: 'Gültige Eingaben werden grün, Fehler rot hervorgehoben.' },
      ],
      privacy: 'Alle Berechnungen laufen direkt in deinem Browser. Keine Daten werden auf Server übertragen.',
    },
    en: {
      steps: [
        { title: 'Paste input',         description: 'Paste the content you want to validate into the input field.' },
        { title: 'Instant validation',  description: 'The tool immediately checks whether the input is valid and shows details.' },
        { title: 'Read result',         description: 'Valid input is highlighted in green; errors are shown in red.' },
      ],
      privacy: 'All calculations run directly in your browser. No data is sent to any server.',
    },
  },

  analyzer: {
    de: {
      steps: [
        { title: 'Text eingeben',       description: 'Füge den zu analysierenden Text in das Eingabefeld ein.' },
        { title: 'Analyse',             description: 'Das Tool analysiert den Inhalt sofort und zeigt detaillierte Statistiken.' },
        { title: 'Ergebnisse verwenden', description: 'Nutze die Analyse-Daten direkt oder kopiere sie weiter.' },
      ],
      privacy: 'Alle Analysen laufen lokal in deinem Browser. Dein Text wird nicht übertragen.',
    },
    en: {
      steps: [
        { title: 'Enter text',          description: 'Paste the text you want to analyze into the input field.' },
        { title: 'Analysis',            description: 'The tool instantly analyzes the content and shows detailed statistics.' },
        { title: 'Use results',         description: 'Use the analysis data directly or copy it for use elsewhere.' },
      ],
      privacy: 'All analysis runs locally in your browser. Your text is never sent anywhere.',
    },
  },

  comparer: {
    de: {
      steps: [
        { title: 'Inhalte einfügen',    description: 'Füge den ersten Inhalt links und den zweiten Inhalt rechts ein.' },
        { title: 'Unterschiede anzeigen', description: 'Das Tool hebt alle Unterschiede zwischen den zwei Versionen hervor.' },
        { title: 'Ergebnis exportieren', description: 'Kopiere oder lade das Vergleichs-Ergebnis herunter.' },
      ],
      privacy: 'Alle Berechnungen laufen direkt in deinem Browser. Keine Daten werden auf Server übertragen.',
    },
    en: {
      steps: [
        { title: 'Paste both sides',    description: 'Paste the first content on the left and the second on the right.' },
        { title: 'View differences',    description: 'The tool highlights all differences between the two versions.' },
        { title: 'Export result',       description: 'Copy or download the comparison result.' },
      ],
      privacy: 'All calculations run directly in your browser. No data is sent to any server.',
    },
  },

  interactive: {
    de: {
      steps: [
        { title: 'Gerät verbinden',     description: 'Erlaube den Zugriff auf dein Gerät wenn der Browser fragt.' },
        { title: 'Einstellungen anpassen', description: 'Passe die Parameter nach deinen Wünschen an.' },
        { title: 'Ergebnis nutzen',     description: 'Das Ergebnis wird direkt in deinem Browser angezeigt und verarbeitet.' },
      ],
      privacy: 'Alle Verarbeitungsschritte laufen lokal. Keine Daten verlassen deinen Browser.',
    },
    en: {
      steps: [
        { title: 'Grant device access', description: 'Allow access to your device when the browser prompts you.' },
        { title: 'Adjust settings',     description: 'Configure the parameters to suit your needs.' },
        { title: 'Use the result',      description: 'The result is displayed and processed directly in your browser.' },
      ],
      privacy: 'All processing steps run locally. No data leaves your browser.',
    },
  },
};

export function getAsideDefault(type: string, lang: Lang): AsideData | null {
  return asideDefaultsByLang[type]?.[lang] ?? asideDefaultsByLang[type]?.['de'] ?? null;
}

// Legacy export kept for any external test imports that reference `asideDefaults` directly.
// New code should use `getAsideDefault(type, lang)`.
export const asideDefaults = asideDefaultsByLang;
